"""Refresh a draft's public skill-ID mapping without another authenticated read."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path

METADATA=Path(__file__).parent/'data/genshin_metadata.json'


def refresh_skills(snapshot,metadata=None):
    if metadata is None:
        raw=METADATA.read_bytes();metadata=json.loads(raw)
    else:
        raw=json.dumps(metadata,sort_keys=True,ensure_ascii=False).encode()
    result=deepcopy(snapshot);updated=[]
    orders=metadata.get('skill_order',{})
    for character in result.get('genshin',{}).get('characters',[]):
        api_id=character['api_id'];element=character.get('element')
        order=orders.get(f'{api_id}:{element}')
        if order is None and api_id not in (10000005,10000007):order=orders.get(str(api_id))
        if not isinstance(order,list) or len(order)!=3 or len(set(order))!=3:continue
        skills={row['id']:row for row in character.get('skills',[])}
        if any(sid not in skills for sid in order):continue
        displayed={}
        for key,sid in zip(('normal','skill','burst'),order):
            row=skills[sid];level=row.get('level')
            displayed[key]=level if isinstance(level,int) and not isinstance(level,bool) and level>=0 and row.get('unlocked') is not False else None
        talents=character.get('talents')
        if not isinstance(talents,dict):continue
        if displayed!=talents.get('displayed'):
            talents['displayed']=displayed
            if not talents.get('bonus_context'):talents['bonus_context']='HoYoLAB 顯示等級依已核對的公開技能 ID 對應；基礎等級與未確認加成不反推。'
            updated.append(character['name'])
        prefix=character['name']+'：公開技能ID對照尚未確認，三項天賦保持未知。'
        warnings=result.get('genshin',{}).get('warnings',[])
        if prefix in warnings:warnings.remove(prefix)
    result.setdefault('normalization',{})['genshin_skill_metadata_sha256']=hashlib.sha256(raw).hexdigest()
    source=metadata.get('source',{})
    if source.get('commit'):result['normalization']['genshin_skill_metadata_commit']=source['commit']
    return result,updated


def refresh_snapshot(snapshot):
    """Reapply verified local rules without changing the original game read time."""
    from .talents import apply_genshin_talent_bases
    from .zzz import apply_zzz_skill_bases
    result, remapped = refresh_skills(snapshot)
    result['genshin'], talent_report = apply_genshin_talent_bases(result['genshin'])
    result['zzz'] = apply_zzz_skill_bases(result['zzz'])
    normalization = result.setdefault('normalization', {})
    for filename in ('genshin_talent_rules.json', 'zzz_talent_rules.json', 'effective_rules.json', 'genshin_effective_sources.json'):
        raw = (METADATA.parent / filename).read_bytes()
        normalization[filename.removesuffix('.json') + '_sha256'] = hashlib.sha256(raw).hexdigest()
    return result, {'remapped': remapped, 'genshin_talents': talent_report}
