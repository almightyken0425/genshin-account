"""Loopback-only user-operated sync UI. No credentials in files, URLs, or logs."""
import asyncio
import contextlib
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import secrets
import sys
import uuid
import webbrowser

import truststore
truststore.inject_into_ssl()
import genshin
from aiohttp import web
from .engine import prepare, SyncError
from .publisher import Repository, PublishError, digest
from .runtime import read_games
from . import cache

logging.disable(logging.CRITICAL)
ORIGIN='http://127.0.0.1:59672'
KEY_SERVICE='HOYO HoYoLAB local sync'
KEY_ACCOUNT='hoyolab-overseas'
COOKIE_KEYS={'ltuid_v2','ltoken_v2','ltmid_v2','ltuid','ltoken'}


def stored_login(action, value=None):
    import keyring
    if sys.platform=='darwin':
        from keyring.backends.macOS import Keyring
        backend=Keyring()
    elif sys.platform=='win32':
        from keyring.backends.Windows import WinVaultKeyring
        backend=WinVaultKeyring()
    else:
        raise RuntimeError('System secure storage is unavailable')
    if action=='read':
        text=backend.get_password(KEY_SERVICE,KEY_ACCOUNT)
        return json.loads(text) if text else None
    if action=='save':
        backend.set_password(KEY_SERVICE,KEY_ACCOUNT,json.dumps(value))
    if action=='delete':
        with contextlib.suppress(keyring.errors.PasswordDeleteError):
            backend.delete_password(KEY_SERVICE,KEY_ACCOUNT)


class Session:
    def __init__(self,*,publish_enabled=True,cache_path=cache.PATH):
        self.nonce=secrets.token_urlsafe(32)
        self.state={'stage':'ready','message':'準備讀取兩款遊戲。','saved_login':False,'publish_enabled':publish_enabled}
        self.task=None;self.client=None;self.accounts=[];self.snapshot=None;self.base=None;self.plan=None
        self.retrieved_at=None;self.request_id=None;self.repository=Repository()
        self.publish_enabled=publish_enabled;self.cache_path=cache_path;self.resolutions={};self.resolution_revision=None;self.cache_lock=asyncio.Lock();self.choice_history={}

    def clear_auth(self):
        if self.client:
            with contextlib.suppress(Exception):self.client.cookie_manager.cookies.clear()
        self.client=None;self.accounts=[]

    def fail(self,error):
        if isinstance(error,(SyncError,PublishError)):
            message=str(error);code=getattr(error,'code','invalid_data')
        elif getattr(error,'choices',None):
            self.choice_history.update({choice['key']:choice for choice in error.choices})
            self.state.update(stage='resolve',message='有裝備無法唯一辨識，請確認對應後繼續。',choices=error.choices,resolutions=dict(self.resolutions),saved_draft=True)
            return
        else:
            message='預覽處理未完成，可還原本機草稿後重試。' if self.snapshot else '本次讀取未完成，請確認登入仍有效再重新讀取。'
            code=type(error).__name__
        self.state.update(stage='uncertain' if code=='write_uncertain' else 'failed',message=message,error_code=code)

    async def login(self,cookies,remember=False):
        self.state.update(stage='authenticating',message='正在確認 HoYoLAB 登入。')
        self.plan=None;self.snapshot=None;self.base=None;self.request_id=None;self.resolutions={};self.resolution_revision=None;self.choice_history={}
        try:
            self.client=genshin.Client(cookies=cookies,region=genshin.Region.OVERSEAS,lang='zh-tw',debug=False,on_cookie_update=None)
            bound=await asyncio.wait_for(self.client.get_game_accounts(),60)
            self.accounts=[row for row in bound if row.game in (genshin.Game.GENSHIN,genshin.Game.ZZZ)]
            groups={game:[(index,row) for index,row in enumerate(self.accounts) if row.game==enum] for game,enum in [('genshin',genshin.Game.GENSHIN),('zzz',genshin.Game.ZZZ)]}
            if any(not rows for rows in groups.values()):
                raise SyncError('登入帳號沒有同時綁定原神與絕區零。')
            if remember:
                try:
                    await asyncio.to_thread(stored_login,'save',cookies)
                    self.state['saved_login']=True
                except Exception:
                    self.state['login_note']='本機安全儲存未完成，這次仍可讀取。'
            cookies=None
            if any(len(rows)>1 for rows in groups.values()):
                options=[{'index':index,'game':game,'label':('原神' if game=='genshin' else '絕區零')+' · '+row.server_name} for game,rows in groups.items() for index,row in rows]
                self.state.update(stage='selection',message='請選擇這次要同步的伺服器帳號。',options=options)
                return
            await self.read({game:rows[0][1] for game,rows in groups.items()})
        except Exception as error:
            self.clear_auth();self.fail(error)
        finally:
            cookies=None

    async def read(self,selected):
        self.state.update(stage='reading',message='正在讀取兩款遊戲。')
        try:
            self.snapshot=await asyncio.wait_for(read_games(self.client,selected,lambda message:self.state.update(message=message)),300)
            self.retrieved_at=datetime.now(timezone.utc).isoformat()
            await self.save_draft()
        except Exception as error:
            self.fail(error);return
        finally:
            self.clear_auth()
        try:
            self.state.update(stage='reading',message='正在比較 GitHub 正式資料。')
            self.base=await self.repository.read()
            await self.preview()
        except Exception as error:self.fail(error)

    async def restore(self):
        self.state.update(stage='reading',message='正在還原上次已讀取的遊戲資料並比較 GitHub。')
        try:
            saved=await asyncio.to_thread(cache.load,self.cache_path)
            if not saved:raise SyncError('找不到可還原的本機預覽。')
            from .refresh import refresh_snapshot
            self.snapshot,_=refresh_snapshot(saved['snapshot']);self.retrieved_at=saved['retrieved_at']
            self.state['draft_note']='已套用最新核對的技能加成與角色規則，沿用原讀取時間。'
            self.base=await self.repository.read()
            if saved['base_revision']==self.base['revision']:
                self.resolutions=saved['resolutions'];self.resolution_revision=saved['base_revision']
            else:
                self.resolutions={};self.resolution_revision=self.base['revision']
                if saved['resolutions']:self.state['draft_note']='GitHub 已有新版本，先前裝備對應需重新核對。'
            await self.preview()
        except Exception as error:self.fail(error)

    async def save_draft(self):
        async with self.cache_lock:
            await asyncio.to_thread(cache.save,self.snapshot,self.retrieved_at,self.cache_path,resolutions=dict(self.resolutions),base_revision=self.resolution_revision)
        self.state['saved_draft']=True

    async def select_equipment(self,updates):
        cache.valid_selections(updates,self.base['revision'])
        choices={row['key']:{option['id'] for option in row['options']} for row in self.state.get('choices',[])}
        for key,value in updates.items():
            if (key in choices and value not in choices[key]) or (key not in choices and self.resolutions.get(key)!=value):
                raise SyncError('裝備對應不在本次候選中，請重新核對。')
        merged={**self.resolutions,**updates}
        existing_ids=[value for value in merged.values() if value!='new']
        if len(existing_ids)!=len(set(existing_ids)):
            raise SyncError('同一件裝備只能對應一個部位，請調整重複選擇。')
        self.resolutions=merged;self.resolution_revision=self.base['revision']
        await self.save_draft()
        self.state['resolutions']=dict(self.resolutions)

    async def preview(self,resolutions=None):
        if resolutions is not None:await self.select_equipment(resolutions)
        self.resolution_revision=self.base['revision']
        await self.save_draft()
        self.plan=await asyncio.to_thread(prepare,self.base,self.snapshot,self.retrieved_at,self.resolutions)
        self.request_id=str(uuid.uuid4())
        summary=self.plan['summary']
        self.state={'stage':'preview','message':'差異已整理完成，正式網站尚未修改。' if self.plan['changed'] else '資料與正式網站相同，無須更新。',
                    'summary':summary,'warnings':self.plan['warnings'],'changed':self.plan['changed'],
                    'counts':{game:len(self.snapshot[game]['characters']) for game in ('genshin','zzz')},'retrieved_at':self.retrieved_at,
                    'revision':self.plan['revision'],'saved_login':self.state.get('saved_login',False),'saved_draft':True,
                    'publish_enabled':self.publish_enabled,'draft_note':self.state.get('draft_note',''),'has_equipment_choices':bool(self.choice_history or self.resolutions)}

    async def edit_equipment(self):
        self.state.update(stage='reading',message='正在重新顯示可核對的裝備對應。')
        try:
            await asyncio.to_thread(prepare,self.base,self.snapshot,self.retrieved_at,{})
            self.state.update(stage='preview',message='目前裝備均可唯一對應。',has_equipment_choices=False)
        except Exception as error:self.fail(error)

    async def publish(self):
        if not self.publish_enabled:raise SyncError('本輪只核對裝備與差異，尚未開放正式寫入。')
        self.state.update(stage='publishing',message='正在更新 GitHub 主線並讀回確認。請保留此頁。')
        try:
            await self.repository.verify_schema_support(self.plan['revision'])
            saved=await self.repository.publish(self.plan['revision'],self.request_id,self.plan['files'])
            self.state.update(stage='done',message='已更新 GitHub 主線並確認讀回。網站重新整理後會顯示新資料。',saved_revision=saved)
            with contextlib.suppress(OSError):await asyncio.to_thread(cache.clear,self.cache_path)
        except Exception as error:self.fail(error)
        finally:self.repository.close()

    async def check(self):
        self.state.update(stage='publishing',message='正在確認上次更新結果。')
        try:
            saved=await self.repository.receipt(self.request_id,digest(self.plan['files']))
            if not saved:
                self.state.update(stage='preview',message='沒有找到已完成的更新，可再次按更新網站資料。')
            else:
                await self.repository.verify_files(saved,self.plan['files'])
                self.state.update(stage='done',message='已確認上次更新成功，網站可重新整理。',saved_revision=saved)
                with contextlib.suppress(OSError):await asyncio.to_thread(cache.clear,self.cache_path)
        except Exception:self.fail(PublishError('上次更新結果仍未確認，請稍後再按確認更新結果。','write_uncertain'))
        finally:self.repository.close()


def create_app(session=None):
    session=session or Session()
    @web.middleware
    async def guard(request,handler):
        if request.host!='127.0.0.1:59672':raise web.HTTPForbidden()
        if request.path!='/' and not secrets.compare_digest(request.headers.get('X-HOYO-Session',''),session.nonce):raise web.HTTPForbidden()
        if request.method=='POST' and (request.headers.get('Origin')!=ORIGIN or not request.content_type=='application/json'):raise web.HTTPForbidden()
        try:return await handler(request)
        except web.HTTPException:raise
        except SyncError as error:return web.json_response({'error':str(error)},status=422)
        except Exception:return web.json_response({'error':'本機請求未完成。'},status=400)
    async def headers(request,response):
        response.headers.update({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','X-Content-Type-Options':'nosniff',
                                 'Content-Security-Policy':"default-src 'none'; script-src 'nonce-"+session.nonce+"'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"})
    def busy():return session.task and not session.task.done()
    async def index(request):
        page=(Path(__file__).parent/'page.html').read_text().replace('__SESSION__',session.nonce)
        return web.Response(text=page,content_type='text/html')
    async def status(request):return web.json_response(session.state)
    async def login(request):
        if busy() or session.state['stage'] not in ('ready','failed'):raise web.HTTPConflict()
        data=await request.json()
        if data.get('saved'):
            try:cookies=await asyncio.to_thread(stored_login,'read')
            except Exception:cookies=None
            if not cookies:return web.json_response({'error':'找不到已儲存的登入，請重新填入。'},status=422)
        else:
            values={k:data.get(k,'').strip() for k in ('uid','token','mid')}
            if not values['uid'].isdigit() or len(values['uid'])>20 or not 8<=len(values['token'])<=8192 or len(values['mid'])>512 or any(x in values['token']+values['mid'] for x in '\r\n\0;'):
                return web.json_response({'error':'請貼入指定 Cookie 的值，不要貼整段標頭。'},status=422)
            cookies={'ltuid_v2':values['uid'],'ltoken_v2':values['token']}
            if values['mid']:cookies['ltmid_v2']=values['mid']
        if not isinstance(cookies,dict) or set(cookies)-COOKIE_KEYS:raise web.HTTPBadRequest()
        session.task=asyncio.create_task(session.login(cookies,data.get('remember') is True))
        return web.json_response({'started':True})
    async def select(request):
        if busy() or session.state['stage']!='selection':raise web.HTTPConflict()
        data=await request.json();selected={}
        for game,enum in [('genshin',genshin.Game.GENSHIN),('zzz',genshin.Game.ZZZ)]:
            index=int(data[game])
            if not 0<=index<len(session.accounts) or session.accounts[index].game!=enum:raise web.HTTPBadRequest()
            selected[game]=session.accounts[index]
        session.task=asyncio.create_task(session.read(selected));return web.json_response({'started':True})
    async def resolve(request):
        if busy() or session.state['stage']!='resolve':raise web.HTTPConflict()
        data=await request.json();resolutions=data.get('resolutions')
        if not isinstance(resolutions,dict) or len(resolutions)>500:raise web.HTTPBadRequest()
        async def run():
            try:await session.preview(resolutions)
            except Exception as error:session.fail(error)
        session.task=asyncio.create_task(run());return web.json_response({'started':True})
    async def edit_equipment(request):
        if busy() or session.state['stage']!='preview':raise web.HTTPConflict()
        session.task=asyncio.create_task(session.edit_equipment());return web.json_response({'started':True})
    async def selections(request):
        if busy() or session.state['stage']!='resolve':raise web.HTTPConflict()
        data=await request.json()
        await session.select_equipment(data.get('resolutions'))
        return web.json_response({'saved':True})
    async def restore(request):
        if busy() or session.state['stage'] not in ('ready','failed'):raise web.HTTPConflict()
        session.task=asyncio.create_task(session.restore());return web.json_response({'started':True})
    async def publish(request):
        if not session.publish_enabled:raise web.HTTPForbidden()
        if busy() or session.state['stage']!='preview' or not session.plan or not session.plan['changed']:raise web.HTTPConflict()
        data=await request.json()
        if data.get('confirm_destination')!='almightyken0425/genshin-account:main':raise web.HTTPBadRequest()
        session.task=asyncio.create_task(session.publish());return web.json_response({'started':True})
    async def check(request):
        if busy() or session.state['stage']!='uncertain' or not session.plan:raise web.HTTPConflict()
        session.task=asyncio.create_task(session.check());return web.json_response({'started':True})
    async def clear(request):
        if busy():raise web.HTTPConflict()
        if session.state['stage']=='uncertain':return web.json_response({'error':'請先確認上次更新結果。'},status=409)
        session.clear_auth();session.snapshot=None;session.base=None;session.plan=None;session.repository.close()
        await asyncio.to_thread(cache.clear,session.cache_path)
        session.resolutions={};session.resolution_revision=None;session.choice_history={}
        session.state={'stage':'ready','message':'本輪資料已清除，可重新讀取。','saved_login':session.state.get('saved_login',False),'publish_enabled':session.publish_enabled}
        return web.json_response({'cleared':True})
    async def forget(request):
        if busy():raise web.HTTPConflict()
        try:await asyncio.to_thread(stored_login,'delete')
        except Exception:return web.json_response({'error':'安全儲存未能移除，請由系統的密碼管理介面處理。'},status=422)
        session.state['saved_login']=False
        return web.json_response({'cleared':True})
    app=web.Application(middlewares=[guard],client_max_size=14000)
    app.on_response_prepare.append(headers)
    app.add_routes([web.get('/',index),web.get('/status',status),web.post('/login',login),web.post('/select',select),web.post('/edit-equipment',edit_equipment),web.post('/selections',selections),web.post('/restore',restore),web.post('/resolve',resolve),web.post('/publish',publish),web.post('/check',check),web.post('/clear',clear),web.post('/forget',forget)])
    return app


async def main(open_browser=True,publish_enabled=True):
    session=Session(publish_enabled=publish_enabled)
    try:session.state['saved_login']=bool(await asyncio.to_thread(stored_login,'read'))
    except Exception:pass
    try:session.state['saved_draft']=bool(await asyncio.to_thread(cache.load,session.cache_path))
    except Exception:session.state['saved_draft']=False
    runner=web.AppRunner(create_app(session),access_log=None)
    await runner.setup()
    try:
        await web.TCPSite(runner,'127.0.0.1',59672).start()
        print('HOYO local sync: '+ORIGIN,flush=True)
        if open_browser:await asyncio.to_thread(webbrowser.open,ORIGIN)
        await asyncio.Event().wait()
    finally:
        if session.task and not session.task.done():
            session.task.cancel()
            with contextlib.suppress(asyncio.CancelledError,Exception):await session.task
        session.clear_auth();session.repository.close();await runner.cleanup()


if __name__=='__main__':
    try:asyncio.run(main('--no-browser' not in sys.argv,'--preview-only' not in sys.argv))
    except KeyboardInterrupt:print('HOYO local sync closed.')
    except OSError:print('HOYO local sync could not start. Check whether the local page is already open.')
