"""Create and validate a reviewable candidate without touching the checkout."""
import hashlib
from decimal import Decimal
import re
import json
from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT/'scripts'))
from validate import validate_account, validate_evidence
from validate_zzz import validate as validate_zzz
from report import render, LABELS, SLOT_LABELS
from account_model import effective_roll
from .publisher import encoded


class SyncError(Exception):
    pass


def _display(value):
    """Only public, short scalar values cross the preview boundary."""
    if value is None or isinstance(value, (bool, int, float)):
        return value
    return ' '.join(str(value).split())[:300]


def _stat_value(stat):
    if not stat or stat.get('value') is None:
        return None
    value = stat['value']
    return f'{value:g}%' if stat.get('unit') == 'percent' else value


def _stat_name(key):
    additional = {'incoming_healing_bonus': '受治療加成', 'cooldown_reduction': '冷卻縮減', 'shield_strength': '護盾強效', 'stamina': '體力'}
    return LABELS.get(key, additional.get(key, '未確認屬性')) + ('%' if key.endswith('_pct') else '')


def _metric_value(value):
    if isinstance(value, str):
        text = value.strip().replace(',', '')
        if re.fullmatch(r'\+?\d+(?:\.\d+)?%?', text):
            number = Decimal(text.removesuffix('%'))
            if text.endswith('%'):
                return f'{number.normalize():f}%'
            return int(number) if number == number.to_integral_value() else float(number)
    return value


def _stat_text(stat, game):
    if not stat:
        return None
    name = _stat_name(stat['key']) if game == 'genshin' else stat.get('name') or '屬性未確認'
    value = _stat_value(stat)
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return name + ' ' + ('未知' if value is None else str(value))


def _field(fields, key, label, before, after, *, force=False):
    before, after = _display(before), _display(after)
    if force or before != after:
        fields.append({'key': key, 'label': label, 'before': before, 'after': after})


def _owners(account):
    result = {}
    names = {c['id']: c['name'] for c in account['characters']}
    for cid, equipment in account['equipment'].items():
        for item_id in [equipment.get('weapon_id'), *equipment.get('artifacts', {}).values()]:
            if item_id:
                result[item_id] = {'id': cid, 'name': names[cid]}
    return result


def _identity(fields, key, label, before, after, old_owner, new_owner, cid, name):
    """Genshin stable IDs identify real moves, even between identical items."""
    left, right = before.get('name') if before else '未記錄', after.get('name') if after else '未裝備'
    changed_id = (before or {}).get('id') != (after or {}).get('id')
    if before and after and changed_id and left == right:
        right += '・改用另一件同名裝備'
    _field(fields, key, label, left, right, force=changed_id)
    origin = old_owner.get((after or {}).get('id'))
    destination = new_owner.get((before or {}).get('id'))
    if changed_id and origin and origin['id'] != cid:
        _field(fields, key + '.from', label + '／移轉來源', origin['name'], name)
    if changed_id and destination and destination['id'] != cid:
        _field(fields, key + '.to', label + '／移轉去向', name, destination['name'])


def _gi_substats(fields, prefix, label, before, after, cid):
    before, after = before or {}, after or {}
    old = {s['key']: s for s in before.get('substats', [])}
    new = {s['key']: s for s in after.get('substats', [])}
    old_rolls, new_rolls = before.get('substat_rolls', {}), after.get('substat_rolls', {})
    old_counts = {r['key']: r for r in old_rolls.get('values', [])}
    new_counts = {r['key']: r for r in new_rolls.get('values', [])}
    for key in sorted(old.keys() | new.keys()):
        path, title = prefix + '.substats.' + key, label + '／副詞條 ' + _stat_name(key)
        _field(fields, path + '.value', title, _stat_value(old.get(key)) if key in old else '無此詞條', _stat_value(new.get(key)) if key in new else '無此詞條')
        for suffix, caption in [('enhancements', '強化次數'), ('effective', '有效判定')]:
            def value(stats, rolls, counts):
                if key not in stats:
                    return '無此詞條'
                row = counts.get(key, {})
                if suffix == 'enhancements':
                    return row.get('enhancements')
                return effective_roll(row, rolls) if rolls.get('character_id') == cid else None
            _field(fields, path + '.' + suffix, title + '／' + caption, value(old, old_rolls, old_counts), value(new, new_rolls, new_counts))


def _gi_fields(before_account, after_account, before, after, old_owner, new_owner):
    fields, cid = [], after['id']
    before = before or {}
    _field(fields, 'name', '角色名稱', before.get('name'), after.get('name'))
    for key, label in [('constellation', '命座'), ('friendship', '好感度')]:
        _field(fields, key, label, before.get(key), after.get(key))
    for key, label in [('current', '角色等級'), ('cap', '角色突破上限')]:
        _field(fields, 'level.' + key, label, before.get('level', {}).get(key), after.get('level', {}).get(key))
    for group, caption in [('displayed', '顯示等級'), ('base', '基礎等級')]:
        for key, label in [('normal', '普攻'), ('skill', '元素戰技'), ('burst', '元素爆發')]:
            _field(fields, 'talents.' + group + '.' + key, label + '／' + caption, before.get('talents', {}).get(group, {}).get(key), after.get('talents', {}).get(group, {}).get(key))
    def panel(account, character):
        observed = next((row for row in account['panel_snapshots'] if row['id'] == character.get('panel_snapshot_id')), None)
        return {s['key']: s for s in observed['stats']} if observed else {}
    left, right = panel(before_account, before), panel(after_account, after)
    for key in sorted(left.keys() | right.keys()):
        _field(fields, 'panel.' + key, '面板／' + _stat_name(key), _stat_value(left.get(key)), _stat_value(right.get(key)))
    old_equipment, new_equipment = before_account['equipment'].get(cid, {}), after_account['equipment'][cid]
    old_weapons, new_weapons = {w['id']: w for w in before_account['weapons']}, {w['id']: w for w in after_account['weapons']}
    old_weapon, new_weapon = old_weapons.get(old_equipment.get('weapon_id')), new_weapons.get(new_equipment.get('weapon_id'))
    if old_weapon or new_weapon:
        _identity(fields, 'weapon.equipped', '穿戴武器', old_weapon, new_weapon, old_owner, new_owner, cid, after['name'])
        l, r = old_weapon or {}, new_weapon or {}
        for key, label in [('rarity', '星級'), ('refinement', '精煉'), ('base_atk', '基礎攻擊力')]:
            _field(fields, 'weapon.' + key, '武器／' + label, l.get(key), r.get(key))
        for key, label in [('current', '等級'), ('cap', '突破上限')]:
            _field(fields, 'weapon.level.' + key, '武器／' + label, l.get('level', {}).get(key), r.get('level', {}).get(key))
        _field(fields, 'weapon.secondary_stat', '武器／副屬性', _stat_text(l.get('secondary_stat'), 'genshin'), _stat_text(r.get('secondary_stat'), 'genshin'))
    old_artifacts, new_artifacts = {a['id']: a for a in before_account['artifacts']}, {a['id']: a for a in after_account['artifacts']}
    for slot, label in SLOT_LABELS.items():
        old_artifact = old_artifacts.get(old_equipment.get('artifacts', {}).get(slot))
        new_artifact = new_artifacts.get(new_equipment.get('artifacts', {}).get(slot))
        if not old_artifact and not new_artifact:
            continue
        prefix = 'artifacts.' + slot
        _identity(fields, prefix + '.equipped', label, old_artifact, new_artifact, old_owner, new_owner, cid, after['name'])
        l, r = old_artifact or {}, new_artifact or {}
        for key, caption in [('set_name', '套裝'), ('rarity', '星級'), ('level', '等級')]:
            _field(fields, prefix + '.' + key, label + '／' + caption, l.get(key), r.get(key))
        _field(fields, prefix + '.main_stat', label + '／主詞條', _stat_text(l.get('main_stat'), 'genshin'), _stat_text(r.get('main_stat'), 'genshin'))
        _gi_substats(fields, prefix, label, old_artifact, new_artifact, cid)
    return fields


def _zzz_effective(stat, disc):
    if isinstance(stat.get('isEffective'), bool):
        return stat['isEffective']
    if disc.get('assessment', {}).get('method') == 'role_rule' and disc.get('assessment', {}).get('ruleId') and isinstance(disc.get('effectiveKeys'), list):
        return stat.get('assessedEffective')
    return None


def verification_summary(game, account):
    """Count only the worn equipment and keep assessments separate from observations."""
    levels, rolls = [], []
    if game == 'genshin':
        artifacts = {item['id']: item for item in account['artifacts']}
        for character in account['characters']:
            levels.extend(character.get('talents', {}).get('base', {}).get(key) for key in ('normal', 'skill', 'burst'))
            for item_id in account['equipment'].get(character['id'], {}).get('artifacts', {}).values():
                item = artifacts.get(item_id)
                if not item:
                    continue
                observation = item.get('substat_rolls', {})
                for row in observation.get('values', []):
                    same_role = observation.get('character_id') == character['id']
                    observed = same_role and isinstance(row.get('effective'), bool)
                    known = same_role and isinstance(effective_roll(row, observation), bool)
                    rolls.append((observed, known, row.get('enhancements'), False))
    else:
        for character in account['characters']:
            levels.extend((character.get('skillsBase') or {}).get(key) for key in ('普通攻擊', '閃避', '支援技', '特殊技', '連攜技'))
            for disc in character.get('driveDiscs') or []:
                for row in disc.get('substats', []):
                    rolls.append((isinstance(row.get('isEffective'), bool), isinstance(_zzz_effective(row, disc), bool),
                                  row.get('enhancementCount'), row.get('enhancementSource') == 'derived_fixed_roll'))
    known_levels = sum(isinstance(value, int) and not isinstance(value, bool) for value in levels)
    observed = sum(row[0] for row in rolls)
    assessed = sum(row[1] and not row[0] for row in rolls)
    known_counts = sum(isinstance(row[2], int) and not isinstance(row[2], bool) for row in rolls)
    return {'base_levels': {'known': known_levels, 'total': len(levels)},
            'effective': {'observed': observed, 'assessed': assessed, 'unknown': len(rolls) - observed - assessed, 'total': len(rolls)},
            'enhancements': {'known': known_counts, 'derived': sum(row[3] for row in rolls), 'total': len(rolls)}}


def _zzz_fields(before, after):
    fields, old = [], before or {}
    for key, label in [('name', '角色名稱'), ('element', '屬性'), ('specialty', '特性')]:
        _field(fields, key, label, old.get(key), after.get(key))
    for key, label in [('level', '角色等級'), ('mindscape', '影畫')]:
        _field(fields, key, label, old.get(key), after.get(key))
    for key, caption in [('skills', '技能顯示等級'), ('skillsBase', '技能基礎等級'), ('stats', '面板')]:
        left, right = old.get(key) or {}, after.get(key) or {}
        for name in sorted(left.keys() | right.keys()):
            _field(fields, key + '.' + name, caption + '／' + name, _metric_value(left.get(name)), _metric_value(right.get(name)))
    left, right = old.get('wEngine'), after.get('wEngine')
    if left or right:
        l, r = left or {}, right or {}
        _field(fields, 'wEngine.equipped', '穿戴音擎', l.get('name', '未記錄'), r.get('name', '未裝備或未回傳'))
        for key, label in [('level', '等級'), ('maxLevel', '突破上限'), ('rarity', '稀有度'), ('refinement', '精煉')]:
            _field(fields, 'wEngine.' + key, '音擎／' + label, l.get(key), r.get(key))
        left_stats, right_stats = l.get('stats') or {}, r.get('stats') or {}
        for name in sorted(left_stats.keys() | right_stats.keys()):
            _field(fields, 'wEngine.stats.' + name, '音擎／' + name, _metric_value(left_stats.get(name)), _metric_value(right_stats.get(name)))
    def disc_state(character):
        discs = character.get('driveDiscs')
        if discs is None:
            return None
        if not discs:
            return '未裝備' if character.get('sync') else '未記錄'
        return '已記錄 ' + str(len(discs)) + ' 個槽位'
    if not old.get('driveDiscs') or not after.get('driveDiscs'):
        _field(fields, 'driveDiscs.observation', '驅動盤／穿戴狀態', disc_state(old), disc_state(after))
    old_discs, new_discs = {d['slot']: d for d in old.get('driveDiscs') or []}, {d['slot']: d for d in after.get('driveDiscs') or []}
    for slot in sorted(old_discs.keys() | new_discs.keys()):
        l, r = old_discs.get(slot) or {}, new_discs.get(slot) or {}
        prefix, title = 'driveDiscs.' + str(slot), str(slot) + '號驅動盤'
        if not l or not r:
            missing = '未裝備' if after.get('driveDiscs') is not None else '未回傳'
            _field(fields, prefix + '.equipped', title, l.get('setName') or '未記錄', r.get('setName') or missing)
        for key, caption in [('setName', '套裝'), ('rarity', '稀有度'), ('level', '等級')]:
            _field(fields, prefix + '.' + key, title + '／' + caption, l.get(key), r.get(key))
        _field(fields, prefix + '.mainStat', title + '／主詞條', _stat_text(l.get('mainStat'), 'zzz'), _stat_text(r.get('mainStat'), 'zzz'))
        old_stats = {(s['name'], s['unit']): s for s in l.get('substats', [])}
        new_stats = {(s['name'], s['unit']): s for s in r.get('substats', [])}
        for key in sorted(old_stats.keys() | new_stats.keys(), key=lambda row: (row[0] or '', row[1] or '')):
            name, unit = key
            path, label = prefix + '.substats.' + str(name) + '|' + str(unit), title + '／副詞條 ' + (name or '未確認') + ('%' if unit == 'percent' else '')
            old_stat, new_stat = old_stats.get(key), new_stats.get(key)
            _field(fields, path + '.value', label, _stat_value(old_stat) if old_stat else '無此詞條', _stat_value(new_stat) if new_stat else '無此詞條')
            _field(fields, path + '.enhancementCount', label + '／強化次數', old_stat.get('enhancementCount') if old_stat else '無此詞條', new_stat.get('enhancementCount') if new_stat else '無此詞條')
            _field(fields, path + '.effective', label + '／有效判定', _zzz_effective(old_stat, l) if old_stat else '無此詞條', _zzz_effective(new_stat, r) if new_stat else '無此詞條')
    return fields


def review_summary(game, before, after, original):
    """Summarize website-visible values independently from provenance churn."""
    summary = dict(original)
    old_characters = {c['id']: c for c in before['characters']}
    added = updated = linked = unchanged = 0
    changes = []
    old_owner, new_owner = (_owners(before), _owners(after)) if game == 'genshin' else ({}, {})
    for character in after['characters']:
        previous = old_characters.get(character['id'])
        if game == 'genshin':
            fields = _gi_fields(before, after, previous, character, old_owner, new_owner)
            binding_before = previous.get('hoyolab_id') if previous else None
            binding_after = character.get('hoyolab_id')
        else:
            fields = _zzz_fields(previous, character)
            binding_before = (previous.get('sync') or {}).get('apiId') if previous else None
            binding_after = (character.get('sync') or {}).get('apiId')
        if previous and binding_before is None and binding_after is not None:
            linked += 1
        if previous is None:
            added += 1
        elif fields:
            updated += 1
        else:
            unchanged += 1
        if previous is None or fields:
            changes.append({'id': character['id'], 'name': _display(character['name']), 'status': 'added' if previous is None else 'updated',
                            'detail': ('新增角色，' if previous is None else '') + str(len(fields)) + ' 項資料變動', 'fields': fields})
    summary.update(added_characters=added, updated_characters=updated, linked_characters=linked, unchanged_characters=unchanged,
                   changes=changes, changed=bool(changes))
    if game == 'zzz':
        summary.update(added=added, updated=updated, unchanged=unchanged)
    return summary


def assert_sanitized(snapshot):
    forbidden = {'uid','ltuid','ltuid_v2','ltmid','ltmid_v2','ltoken','ltoken_v2','cookie','cookies','token','authorization','nickname','region','server','game_biz','account_id'}
    def visit(value, depth=0):
        if depth > 18:
            raise SyncError('同步資料結構過深。')
        if isinstance(value,dict):
            if forbidden.intersection(key.lower() for key in value):
                raise SyncError('同步資料包含禁止保存的登入或帳號欄位。')
            for item in value.values(): visit(item,depth+1)
        elif isinstance(value,list):
            if len(value)>3000: raise SyncError('同步資料超過支援範圍。')
            for item in value: visit(item,depth+1)
        elif isinstance(value,str) and (len(value)>8000 or value.startswith(('http://','https://'))):
            raise SyncError('同步資料包含非預期文字。')
    visit(snapshot)
    if len(encoded(snapshot))>5000000:
        raise SyncError('同步資料超過支援大小。')
    for game in ('genshin','zzz'):
        data=snapshot.get(game)
        if not isinstance(data,dict) or data.get('complete') is not True or not 1<=len(data.get('characters',[]))<=200:
            raise SyncError('兩款遊戲都需要完整讀取，這輪不會保存部分結果。')


def prepare(base, snapshot, retrieved_at, resolutions=None):
    from . import genshin, zzz
    assert_sanitized(snapshot)
    proof = encoded(snapshot)
    sha = hashlib.sha256(proof).hexdigest()
    source_id = 'hoyolab_'+sha[:16]
    existing=next((m for m in base['manifests'] if m['id']==source_id),None)
    source_time=existing['imported_at'] if existing else retrieved_at
    if existing and (existing.get('schema_version')!=3 or existing['extraction']['sha256']!=sha):
        raise SyncError('來源內容與既有紀錄不符。')
    source = {'id':source_id,'retrieved_at':source_time,'path':'imports/hoyolab/'+source_id+'.json','sha256':sha,'resolutions':resolutions or {}}
    rules=json.loads((Path(__file__).parent/'data/effective_rules.json').read_text())
    gi, gi_summary = genshin.merge(base['genshin'], snapshot['genshin'], source, rules['genshin'])
    za, za_summary = zzz.merge(base['zzz'], snapshot['zzz'], source, rules['zzz'])
    gi_summary=review_summary('genshin',base['genshin'],gi,gi_summary)
    za_summary=review_summary('zzz',base['zzz'],za,za_summary)
    for game, account, summary in (('genshin', gi, gi_summary), ('zzz', za, za_summary)):
        summary['verification'] = verification_summary(game, account)
        if game == 'genshin':
            artifacts = {item['id']: item for item in account['artifacts']}
            for change in summary['changes']:
                rule = rules[game].get(change['id'], {})
                role = rule.get('role_label') or rule.get('role')
                applied = any(artifacts.get(item_id, {}).get('substat_rolls', {}).get('rule_id') == rule.get('rule_id')
                              for item_id in account['equipment'].get(change['id'], {}).get('artifacts', {}).values()) if rule.get('rule_id') else False
                if role and applied:
                    change['role_note'] = '有效詞條採用用途：' + role + '。此為角色規則判定。'
                    pending = {}
                    reasons = {row['key']: row['reason'] for row in rule.get('conditional', []) if row.get('key') and row.get('reason')}
                    for slot, item_id in account['equipment'].get(change['id'], {}).get('artifacts', {}).items():
                        observation = artifacts.get(item_id, {}).get('substat_rolls', {})
                        if observation.get('rule_id') != rule['rule_id']:
                            continue
                        for row in observation.get('values', []):
                            if effective_roll(row, observation) is None and row['key'] in reasons:
                                pending.setdefault(row['key'], []).append(SLOT_LABELS[slot])
                    if pending:
                        change['pending_notes'] = [_stat_name(key) + '仍待確認：' + '、'.join(slots) + '。' + reasons[key]
                                                   for key, slots in pending.items()]
                        summary['warnings'].extend(change['name'] + '：' + note for note in change['pending_notes'])
    observations = [{'id':source_id+'_'+str(c['api_id']),'character_id':next(c2['id'] for c2 in gi['characters'] if c2.get('hoyolab_id')==c['api_id']),
                     'kind':'hoyolab','pointer':'/genshin/characters/'+str(index)} for index,c in enumerate(snapshot['genshin']['characters'])]
    manifest = {'schema_version':3,'id':source_id,'imported_at':retrieved_at,'media':{'type':'hoyolab','recorded_at':None},
                'extraction':{'path':source['path'],'sha256':sha},'screenshots':[],'observations':observations}
    manifests = {row['id']:row for row in base['manifests']}
    # Content addressed evidence is immutable, even when read again later.
    if source_id not in manifests:
        manifests[source_id]=manifest
    files = {'data/account.json':encoded(gi),'data/zzz/account.json':encoded(za)}
    if source_id not in {row['id'] for row in base['manifests']}:
        files[source['path']]=proof
        files['evidence/'+source_id+'/manifest.json']=encoded(manifest)
    with tempfile.TemporaryDirectory(prefix='hoyo-sync-review-') as folder:
        folder=Path(folder)
        for path,data in files.items():
            target=folder/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
        for row in manifests.values():
            target=folder/'evidence'/row['id']/'manifest.json'
            target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(encoded(row))
        errors,warnings = validate_account(gi)
        errors += validate_zzz(za,folder,check_files=False)
        errors += validate_evidence(gi,folder,check_files=False)
        if errors:
            # Paths and public field names are safe. Do not include raw exception values.
            raise SyncError('同步候選未通過資料驗證：'+'、'.join(errors[:5]))
        files['docs/account_summary.md']=render(folder).encode()
    changed = (gi != base['genshin'] or za != base['zzz'])
    return {'files':files,'revision':base['revision'],'source_id':source_id,'summary':{'genshin':gi_summary,'zzz':za_summary},
            'changed':changed,'warnings':warnings,'retrieved_at':retrieved_at}
