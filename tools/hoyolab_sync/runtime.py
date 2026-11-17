"""Read both games with bounded concurrency and strict roster coverage."""
import asyncio
import json
from pathlib import Path
from .engine import SyncError, assert_sanitized

DATA=Path(__file__).parent/'data'


def metadata(game):
    path=DATA/(game+'_metadata.json')
    return json.loads(path.read_text()) if path.exists() else {}


async def read_games(client, selected, progress=None):
    from . import genshin, zzz
    envelope={'schema_version':1,'provider':'hoyolab'}
    for game in ('genshin','zzz'):
        if game not in selected:
            raise SyncError('需要先選定原神與絕區零帳號。')
        uid=selected[game].uid
        if progress: progress('正在讀取'+('原神' if game=='genshin' else '絕區零')+'角色與裝備。')
        roster=await asyncio.wait_for(client.get_genshin_characters(uid) if game=='genshin' else client.get_zzz_agents(uid),60)
        ids=[item.id for item in roster]
        if not ids or len(ids)!=len(set(ids)) or len(ids)>200:
            raise SyncError('角色清單未通過完整性檢查。')
        rows=[];properties={}
        if game=='genshin':
            for start in range(0,len(ids),8):
                response=await asyncio.wait_for(client.get_genshin_detailed_characters(uid,characters=ids[start:start+8],return_raw_data=True),60)
                rows.extend(response.get('list') or [])
                properties.update(response.get('property_map') or {})
        else:
            async def one(public_id):
                response=await asyncio.wait_for(client._request_zzz_record('avatar/info',uid,payload={'id_list[]':public_id}),60)
                return response.get('avatar_list') or []
            for start in range(0,len(ids),3):
                for batch in await asyncio.gather(*(one(public_id) for public_id in ids[start:start+3])):
                    rows.extend(batch)
        actual=[row.get('base',row).get('id') for row in rows]
        if len(actual)!=len(set(actual)) or set(actual)!=set(ids):
            raise SyncError('部分角色詳情缺失，這輪不會覆蓋網站資料。')
        meta=metadata(game)
        if game=='genshin':meta['property_map']=properties
        envelope[game]=(genshin if game=='genshin' else zzz).normalize(rows,meta)
        envelope[game]['characters'].sort(key=lambda row:(row['api_id'],row.get('element') or ''))
        rows.clear();properties.clear()
    from .refresh import refresh_snapshot
    envelope,_=refresh_snapshot(envelope)
    assert_sanitized(envelope)
    return envelope
