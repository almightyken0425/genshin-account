"""Equipment selection drafts survive reloads and never enable writes in review mode."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import AsyncMock,patch
from aiohttp import web
from aiohttp.test_utils import make_mocked_request
from tools.hoyolab_sync import cache
from tools.hoyolab_sync.engine import SyncError
from tools.hoyolab_sync.server import Session,create_app

REV='a'*40
KEY='genshin:1:flower'
OTHER='genshin:2:flower'
SNAPSHOT={'genshin':{'complete':True,'characters':[{'api_id':1}]},'zzz':{'complete':True,'characters':[{'api_id':2}]}}

def prepared(revision=REV):
 return {'changed':True,'revision':revision,'summary':{'genshin':{},'zzz':{}},'warnings':[],'files':{}}

def choice(key=KEY):
 return {'key':key,'name':'測試角色・生之花','options':[{'id':'artifact_existing','label':'既有物品'},{'id':'new','label':'另一件裝備'}]}


class ReviewSessionTests(unittest.IsolatedAsyncioTestCase):
 async def test_selection_draft_restores_without_login_or_another_data_read(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'preview.json'
   session=Session(publish_enabled=False,cache_path=path)
   session.snapshot=SNAPSHOT;session.retrieved_at='2026-11-16T09:00:00Z';session.base={'revision':REV}
   session.state.update(stage='resolve',choices=[choice()])
   await session.select_equipment({KEY:'artifact_existing'})
   saved=cache.load(path)
   self.assertEqual(saved['resolutions'],{KEY:'artifact_existing'});self.assertEqual(saved['base_revision'],REV)
   restored=Session(publish_enabled=False,cache_path=path)
   restored.repository.read=AsyncMock(return_value={'revision':REV})
   restored.login=AsyncMock()
   with patch('tools.hoyolab_sync.server.prepare',return_value=prepared()) as prepare:
    await restored.restore()
    self.assertEqual(prepare.call_args.args[3],{KEY:'artifact_existing'})
   self.assertEqual(restored.retrieved_at,session.retrieved_at)
   self.assertEqual(restored.state['stage'],'preview');self.assertFalse(restored.state['publish_enabled'])
   restored.login.assert_not_awaited()

 async def test_changed_base_invalidates_selections_and_explains_why(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'preview.json'
   cache.save(SNAPSHOT,'2026-11-16T09:00:00Z',path,resolutions={KEY:'artifact_existing'},base_revision=REV)
   restored=Session(publish_enabled=False,cache_path=path)
   restored.repository.read=AsyncMock(return_value={'revision':'b'*40})
   with patch('tools.hoyolab_sync.server.prepare',return_value=prepared('b'*40)):
    await restored.restore()
   self.assertEqual(restored.resolutions,{})
   self.assertIn('重新核對',restored.state['draft_note'])
   self.assertEqual(cache.load(path)['resolutions'],{})

 async def test_duplicate_existing_id_or_outside_candidate_is_not_saved(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'preview.json';session=Session(cache_path=path)
   session.snapshot=SNAPSHOT;session.retrieved_at='2026-11-16T09:00:00Z';session.base={'revision':REV}
   session.state.update(stage='resolve',choices=[choice(),choice(OTHER)])
   await session.select_equipment({KEY:'artifact_existing'})
   for updates in ({OTHER:'artifact_existing'},{OTHER:'artifact_unknown'}):
    with self.assertRaises(SyncError):await session.select_equipment(updates)
   self.assertEqual(cache.load(path)['resolutions'],{KEY:'artifact_existing'})

 async def test_successive_resolution_rounds_keep_prior_explicit_choices(self):
  with tempfile.TemporaryDirectory() as folder:
   session=Session(cache_path=Path(folder)/'preview.json')
   session.snapshot=SNAPSHOT;session.retrieved_at='2026-11-16T09:00:00Z';session.base={'revision':REV}
   session.state.update(stage='resolve',choices=[choice()])
   await session.select_equipment({KEY:'artifact_existing'})
   session.state['choices']=[choice(OTHER)]
   with patch('tools.hoyolab_sync.server.prepare',return_value=prepared()) as prepare:
    await session.preview({KEY:'artifact_existing',OTHER:'new'})
    self.assertEqual(prepare.call_args.args[3],{KEY:'artifact_existing',OTHER:'new'})

 async def test_return_to_equipment_review_retains_explicit_selections(self):
  from tools.hoyolab_sync.genshin import MergeAmbiguityError
  with tempfile.TemporaryDirectory() as folder:
   session=Session(publish_enabled=False,cache_path=Path(folder)/'preview.json')
   session.snapshot=SNAPSHOT;session.retrieved_at='2026-11-16T09:00:00Z';session.base={'revision':REV}
   session.resolutions={KEY:'artifact_existing'};session.resolution_revision=REV
   session.state['stage']='preview'
   with patch('tools.hoyolab_sync.server.prepare',side_effect=MergeAmbiguityError([choice()])):
    await session.edit_equipment()
   self.assertEqual(session.state['stage'],'resolve')
   self.assertEqual(session.state['resolutions'],{KEY:'artifact_existing'})
   self.assertEqual(session.state['choices'],[choice()])
   self.assertFalse(session.state['publish_enabled'])

 async def test_preview_only_mode_rejects_publish_before_any_repository_call(self):
  session=Session(publish_enabled=False)
  session.state['stage']='preview';session.plan=prepared();session.repository.publish=AsyncMock()
  with self.assertRaises(SyncError):await session.publish()
  app=create_app(session)
  handler=next(route.handler for route in app.router.routes() if route.method=='POST' and route.resource.canonical=='/publish')
  with self.assertRaises(web.HTTPForbidden):await handler(make_mocked_request('POST','/publish'))
  session.repository.publish.assert_not_awaited()


if __name__=='__main__':unittest.main()
