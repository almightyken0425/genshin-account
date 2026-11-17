"""Narrow GitHub adapter: preview first, optimistic atomic commit, verified receipt."""
import asyncio
import base64
import hashlib
import json
import subprocess
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

REPOSITORY = 'almightyken0425/genshin-account'


class PublishError(Exception):
    def __init__(self, message, code='connection_failed'):
        super().__init__(message)
        self.code = code


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n').encode()


def digest(files):
    return hashlib.sha256(b'\n'.join(path.encode()+b'\0'+data for path, data in sorted(files.items()))).hexdigest()


class Repository:
    """Use the user's existing gh login in memory, never expose its token."""
    def __init__(self, transport=None):
        self.transport = transport
        self._token = None

    def _request(self, method, path, payload=None):
        if self.transport:
            return self.transport(method, path, payload)
        if self._token is None:
            try:
                result = subprocess.run(['gh', 'auth', 'token', '--hostname', 'github.com'], capture_output=True, timeout=15, check=True)
                self._token = result.stdout.decode().strip()
            except (OSError, subprocess.SubprocessError):
                raise PublishError('請先在這台電腦登入 GitHub，再重新讀取。', 'github_login_required') from None
        if not self._token:
            raise PublishError('這台電腦尚未登入 GitHub。', 'github_login_required')
        request = Request('https://api.github.com'+path, method=method,
                          data=json.dumps(payload).encode() if payload is not None else None,
                          headers={'Authorization':'Bearer '+self._token, 'Accept':'application/vnd.github.object+json' if '/contents/' in path else 'application/vnd.github+json',
                                   'User-Agent':'HOYO-local-sync', 'Content-Type':'application/json', 'X-GitHub-Api-Version':'2022-11-28'})
        try:
            with urlopen(request, timeout=40) as response:
                return json.load(response)
        except HTTPError as error:
            code = 'conflict' if error.code in (409, 422) else 'github_permission' if error.code in (401, 403) else 'connection_failed'
            raise PublishError('GitHub 未完成請求。請確認登入、權限或目前版本。', code) from None
        except (URLError, TimeoutError, ValueError):
            raise PublishError('GitHub 暫時無法連線，請稍後確認更新結果。') from None

    async def api(self, method, path, payload=None):
        return await asyncio.to_thread(self._request, method, path, payload)

    async def head(self):
        row = await self.api('GET', '/repos/'+REPOSITORY+'/commits/main')
        revision = row.get('sha', '')
        if len(revision) != 40 or any(c not in '0123456789abcdef' for c in revision):
            raise PublishError('GitHub 回傳的版本無效。')
        return revision, row['commit']['message']

    async def file(self, path, revision):
        if not path.startswith(('data/', 'evidence/', 'imports/hoyolab/', 'docs/', 'schemas/', 'site/')) or '..' in path or '\\' in path:
            raise PublishError('檔案路徑不在同步範圍。', 'invalid_path')
        result = await self.api('GET', '/repos/'+REPOSITORY+'/contents/'+path+'?ref='+revision)
        if result.get('type') != 'file' or result.get('size', 0) > 16000000:
            raise PublishError('GitHub 檔案大小或格式不受支援。')
        if result.get('encoding')=='none':
            blob_sha=result.get('sha','')
            if len(blob_sha)!=40 or any(c not in '0123456789abcdef' for c in blob_sha):
                raise PublishError('GitHub 檔案識別無效。')
            result=await self.api('GET','/repos/'+REPOSITORY+'/git/blobs/'+blob_sha)
        if result.get('encoding')!='base64' or result.get('size',0)>16000000:
            raise PublishError('GitHub 檔案大小或格式不受支援。')
        try:
            return base64.b64decode(result['content'], validate=False)
        except (KeyError, ValueError):
            raise PublishError('GitHub 檔案格式無效。') from None

    async def read(self):
        revision, message = await self.head()
        gi, zzz = await asyncio.gather(self.file('data/account.json', revision), self.file('data/zzz/account.json', revision))
        try:
            gi, zzz = json.loads(gi), json.loads(zzz)
        except ValueError:
            raise PublishError('正式帳號資料格式無效。', 'invalid_data') from None
        semaphore = asyncio.Semaphore(4)
        async def manifest(source_id):
            if not isinstance(source_id,str) or not source_id.replace('_','').isalnum():
                raise PublishError('正式來源識別無效。', 'invalid_data')
            async with semaphore:
                return json.loads(await self.file('evidence/'+source_id+'/manifest.json', revision))
        manifests = await asyncio.gather(*(manifest(source_id) for source_id in gi['source_ids']))
        return {'revision':revision,'commit_message':message,'genshin':gi,'zzz':zzz,'manifests':manifests}

    async def receipt(self, request_id, payload_digest):
        revision, message = await self.head()
        candidates = [{'sha':revision,'commit':{'message':message}}]
        candidates += await self.api('GET', '/repos/'+REPOSITORY+'/commits?sha=main&per_page=30')
        marker = 'HOYO-Sync-ID: '+request_id
        for item in candidates:
            if marker in item['commit']['message']:
                if 'HOYO-Sync-SHA256: '+payload_digest not in item['commit']['message']:
                    raise PublishError('更新編號與內容不符，請重新讀取。', 'request_reused')
                return item['sha']
        return None

    async def verify_files(self, revision, files):
        try:
            for path, expected in files.items():
                if await self.file(path, revision) != expected:
                    raise PublishError('readback mismatch')
        except Exception:
            raise PublishError('更新已送出，讀回內容尚未確認。請使用確認更新結果。', 'write_uncertain') from None

    async def verify_schema_support(self, revision):
        try:
            gi,zzz,site=await asyncio.gather(self.file('schemas/account.schema.json',revision),self.file('schemas/zzz.account.schema.json',revision),self.file('site/source.json',revision))
            gi,zzz,site=json.loads(gi),json.loads(zzz),json.loads(site)
            verify_deployment_record(site)
            ready=(gi['properties']['schema_version'].get('const')==3 and zzz['properties']['schemaVersion'].get('const')==2)
        except Exception:
            ready=False
        if not ready:
            raise PublishError('GitHub 主線尚未包含這次同步程式與資料格式，這輪不會寫入。請先完成主線合併。','repository_not_ready')

    async def publish(self, expected_revision, request_id, files):
        payload_digest = digest(files)
        saved = await self.receipt(request_id, payload_digest)
        if saved:
            await self.verify_files(saved, files)
            return saved
        current, _ = await self.head()
        if current != expected_revision:
            raise PublishError('GitHub 已有其他更新。請重新讀取並比較後再更新。', 'conflict')
        allowed = {'data/account.json', 'data/zzz/account.json', 'docs/account_summary.md'}
        for path in files:
            if path not in allowed and not (path.startswith(('evidence/hoyolab_', 'imports/hoyolab/')) and '..' not in path):
                raise PublishError('更新包含範圍外檔案。', 'invalid_path')
        query = 'mutation($input:CreateCommitOnBranchInput!){createCommitOnBranch(input:$input){commit{oid}}}'
        body = {'query':query,'variables':{'input':{
            'branch':{'repositoryNameWithOwner':REPOSITORY,'branchName':'main'},'expectedHeadOid':expected_revision,
            'message':{'headline':'Sync account records from HoYoLAB','body':'HOYO-Sync-ID: '+request_id+'\nHOYO-Sync-SHA256: '+payload_digest},
            'fileChanges':{'additions':[{'path':path,'contents':base64.b64encode(data).decode()} for path,data in sorted(files.items())]},
            'clientMutationId':request_id}}}
        try:
            response = await self.api('POST', '/graphql', body)
        except PublishError:
            raise PublishError('更新已送出，但結果尚未確認。請按確認更新結果，避免重複更新。', 'write_uncertain') from None
        if response.get('errors'):
            raise PublishError('GitHub 拒絕更新，可能是版本已改變或主線權限不足。請重新讀取。', 'conflict')
        saved = response.get('data',{}).get('createCommitOnBranch',{}).get('commit',{}).get('oid')
        if not saved:
            raise PublishError('更新結果尚未確認。請按確認更新結果。', 'write_uncertain')
        await self.verify_files(saved, files)
        return saved

    def close(self):
        self._token = None


def verify_deployment_record(record):
    support=record.get('hoyolab_sync',{}) if isinstance(record,dict) else {}
    if support.get('site_support')!='deployed' or support.get('schemas')!={'genshin':3,'zzz':2} or record.get('version_number',0)<47:
        raise PublishError('網站的同步支援尚未確認，這輪不會寫入。請先完成網站更新。','site_not_ready')
