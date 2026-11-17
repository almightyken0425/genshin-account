"""Behavior tests for the local synchronization boundary. No live accounts."""
import asyncio
import base64
import json
from types import SimpleNamespace
import unittest
from unittest.mock import AsyncMock, patch

from aiohttp.test_utils import make_mocked_request
from tools.hoyolab_sync.engine import assert_sanitized, SyncError
from tools.hoyolab_sync.publisher import Repository, PublishError, digest, verify_deployment_record
from tools.hoyolab_sync.server import create_app, Session
from tools.hoyolab_sync.runtime import read_games

REV='a'*40
SAVED='b'*40
REQUEST_ID='00000000-0000-4000-8000-000000000001'


class PublisherTests(unittest.IsolatedAsyncioTestCase):
    def fake(self, *, revision=REV, receipt=None, refuse=False):
        files={'data/account.json':b'{"new":true}\n'};calls=[]
        def transport(method,path,payload):
            calls.append((method,path,payload))
            if '/contents/' in path:return {'type':'file','encoding':'base64','size':len(files['data/account.json']),'content':base64.b64encode(files['data/account.json']).decode()}
            if path.endswith('/commits/main'):
                return {'sha':revision,'commit':{'message':receipt or 'previous'}}
            if '/commits?' in path:return []
            if path=='/graphql':
                if refuse:raise PublishError('timeout')
                return {'data':{'createCommitOnBranch':{'commit':{'oid':SAVED}}}}
            raise AssertionError('Unexpected test request')
        return Repository(transport),files,calls

    async def test_publish_is_one_atomic_expected_revision_write_and_readback(self):
        repo,files,calls=self.fake()
        saved=await repo.publish(REV,REQUEST_ID,files)
        self.assertEqual(saved,SAVED)
        writes=[row for row in calls if row[0]=='POST']
        self.assertEqual(len(writes),1)
        self.assertEqual(writes[0][2]['variables']['input']['expectedHeadOid'],REV)
        self.assertEqual(writes[0][2]['variables']['input']['branch']['branchName'],'main')
        self.assertTrue(any('/contents/' in row[1] for row in calls))

    async def test_stale_preview_cannot_write(self):
        repo,files,calls=self.fake(revision=SAVED)
        with self.assertRaises(PublishError) as error:await repo.publish(REV,REQUEST_ID,files)
        self.assertEqual(error.exception.code,'conflict')
        self.assertFalse(any(row[0]=='POST' for row in calls))

    async def test_repeated_request_returns_verified_receipt_without_write(self):
        repo,files,calls=self.fake()
        marker='HOYO-Sync-ID: '+REQUEST_ID+'\nHOYO-Sync-SHA256: '+digest(files)
        repo,files,calls=self.fake(receipt=marker)
        self.assertEqual(await repo.publish(REV,REQUEST_ID,files),REV)
        self.assertFalse(any(row[0]=='POST' for row in calls))

    async def test_write_timeout_is_uncertain_and_never_auto_retried(self):
        repo,files,calls=self.fake(refuse=True)
        with self.assertRaises(PublishError) as error:await repo.publish(REV,REQUEST_ID,files)
        self.assertEqual(error.exception.code,'write_uncertain')
        self.assertEqual(sum(row[0]=='POST' for row in calls),1)

    async def test_post_commit_read_failure_keeps_confirmation_path(self):
        repo,files,calls=self.fake()
        repo.file=AsyncMock(side_effect=PublishError('network failed'))
        with self.assertRaises(PublishError) as error:await repo.publish(REV,REQUEST_ID,files)
        self.assertEqual(error.exception.code,'write_uncertain')
        self.assertEqual(sum(row[0]=='POST' for row in calls),1)

    async def test_large_contents_fall_back_to_verified_blob(self):
        data=b'large-file';calls=[]
        def transport(method,path,payload):
            calls.append(path)
            if '/contents/' in path:return {'type':'file','encoding':'none','size':1200000,'sha':SAVED}
            return {'encoding':'base64','size':len(data),'content':base64.b64encode(data).decode()}
        self.assertEqual(await Repository(transport).file('data/account.json',REV),data)
        self.assertTrue(calls[-1].endswith('/git/blobs/'+SAVED))

    async def test_old_site_blocks_incompatible_data(self):
        with self.assertRaises(PublishError) as error:verify_deployment_record({'version_number':46})
        self.assertEqual(error.exception.code,'site_not_ready')
        verify_deployment_record({'version_number':47,'hoyolab_sync':{'site_support':'deployed','schemas':{'genshin':3,'zzz':2}}})


class GuardTests(unittest.IsolatedAsyncioTestCase):
    async def test_only_exact_local_origin_host_and_session_are_accepted(self):
        session=Session();guard=create_app(session)._middlewares[0]
        handler=AsyncMock(return_value='allowed')
        headers={'Host':'127.0.0.1:59672','Origin':'http://127.0.0.1:59672','Content-Type':'application/json','X-HOYO-Session':session.nonce}
        good=make_mocked_request('POST','/publish',headers=headers)
        self.assertEqual(await guard(good,handler),'allowed')
        for key,value in [('Host','evil.example'),('Origin','https://evil.example'),('X-HOYO-Session','wrong'),('Content-Type','text/plain')]:
            bad=make_mocked_request('POST','/publish',headers={**headers,key:value})
            with self.assertRaises(Exception) as error:await guard(bad,handler)
            self.assertEqual(error.exception.status,403)
        self.assertEqual(handler.await_count,1)

    async def test_exception_messages_never_echo_authentication_data(self):
        session=Session()
        session.fail(ValueError('secret-login-token-value'))
        self.assertNotIn('secret-login',json.dumps(session.state))
        self.assertEqual(session.state['stage'],'failed')

    async def test_normalized_payload_rejects_credentials_and_partial_reads(self):
        valid={'genshin':{'complete':True,'characters':[{'api_id':1}]},'zzz':{'complete':True,'characters':[{'api_id':2}]}}
        assert_sanitized(valid)
        for key in ('uid','token','ltoken_v2','cookies'):
            with self.assertRaises(SyncError):assert_sanitized({**valid,key:'secret'})
        with self.assertRaises(SyncError):assert_sanitized({**valid,'zzz':{'complete':False,'characters':[]}})

    async def test_no_publish_on_login_or_preview_failure(self):
        session=Session();session.repository=SimpleNamespace(publish=AsyncMock())
        with patch('tools.hoyolab_sync.server.genshin.Client',side_effect=RuntimeError('secret')):
            await session.login({'ltoken_v2':'not-real-token'})
        session.repository.publish.assert_not_awaited()
        self.assertEqual(session.state['stage'],'failed')


class RuntimeTests(unittest.IsolatedAsyncioTestCase):
    async def test_missing_role_details_stop_before_normalization_or_write(self):
        client=SimpleNamespace(get_genshin_characters=AsyncMock(return_value=[SimpleNamespace(id=1),SimpleNamespace(id=2)]),
                               get_genshin_detailed_characters=AsyncMock(return_value={'list':[{'base':{'id':1}}]}))
        selected={'genshin':SimpleNamespace(uid=123),'zzz':SimpleNamespace(uid=456)}
        with self.assertRaises(SyncError):await read_games(client,selected)


if __name__=='__main__':unittest.main()
