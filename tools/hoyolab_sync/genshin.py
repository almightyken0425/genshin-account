"""Genshin HoYoLAB allow-list normalization and explicit, identity-safe merge."""
from __future__ import annotations

import copy
import hashlib
import json
import math
import re
from functools import lru_cache
from pathlib import Path
from scripts.account_model import build_fingerprint

SLOTS = {1: 'flower', 2: 'plume', 3: 'sands', 4: 'goblet', 5: 'circlet'}
ELEMENTS = {'fire': 'pyro', 'pyro': 'pyro', 'water': 'hydro', 'hydro': 'hydro', 'wind': 'anemo', 'anemo': 'anemo', 'electric': 'electro', 'electro': 'electro', 'grass': 'dendro', 'dendro': 'dendro', 'ice': 'cryo', 'cryo': 'cryo', 'rock': 'geo', 'geo': 'geo'}
WEAPONS = {1: 'sword', 10: 'catalyst', 11: 'claymore', 12: 'bow', 13: 'polearm'}
PROPS = {1: 'hp', 2: 'hp', 3: 'hp_pct', 4: 'atk', 5: 'atk', 6: 'atk_pct', 7: 'def', 8: 'def', 9: 'def_pct', 10: 'stamina', 11: 'stamina', 20: 'crit_rate', 22: 'crit_dmg', 23: 'energy_recharge', 26: 'healing_bonus', 27: 'incoming_healing_bonus', 28: 'em', 30: 'physical_dmg_bonus', 40: 'pyro_dmg_bonus', 41: 'electro_dmg_bonus', 42: 'hydro_dmg_bonus', 43: 'dendro_dmg_bonus', 44: 'anemo_dmg_bonus', 45: 'geo_dmg_bonus', 46: 'cryo_dmg_bonus', 80: 'cooldown_reduction', 81: 'shield_strength', 2000: 'hp', 2001: 'atk', 2002: 'def'}
FLAT = {'hp', 'atk', 'def', 'em', 'stamina'}
SUBSTATS = {'hp', 'hp_pct', 'atk', 'atk_pct', 'def', 'def_pct', 'em', 'crit_rate', 'crit_dmg', 'energy_recharge'}
SLOT_LABELS = {'weapon': '武器', 'flower': '生之花', 'plume': '死之羽', 'sands': '時之沙', 'goblet': '空之杯', 'circlet': '理之冠'}
STAT_LABELS = {'hp': '生命值', 'hp_pct': '生命值', 'atk': '攻擊力', 'atk_pct': '攻擊力', 'def': '防禦力', 'def_pct': '防禦力', 'em': '元素精通', 'crit_rate': '暴擊率', 'crit_dmg': '暴擊傷害', 'energy_recharge': '元素充能效率', 'healing_bonus': '治療加成', 'physical_dmg_bonus': '物理傷害加成', **{element+'_dmg_bonus': label+'元素傷害加成' for element, label in [('pyro', '火'), ('hydro', '水'), ('anemo', '風'), ('electro', '雷'), ('dendro', '草'), ('cryo', '冰'), ('geo', '岩')]}}


class MergeAmbiguityError(ValueError):
    def __init__(self, choices):
        super().__init__('Equipment identity requires explicit resolution')
        self.choices = choices


def _int(value, minimum=0, maximum=None):
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum or (maximum is not None and value > maximum):
        return None
    return value


def _label(value):
    if not isinstance(value, str) or not value.strip() or re.search(r'https?://|[\r\n]|(?:cookie|token|ltuid)\s*[=:]', value, re.I):
        raise ValueError('Invalid public label')
    return value.strip()


def _number(value):
    if value is None:
        return None
    if isinstance(value, bool):
        raise ValueError('Invalid numeric observation')
    if isinstance(value, str):
        if not re.fullmatch(r'\s*\+?\d[\d,]*(?:\.\d+)?%?\s*', value):
            raise ValueError('Invalid numeric observation')
        value = float(value.strip().replace(',', '').removesuffix('%'))
    if not isinstance(value, (int, float)) or not math.isfinite(value) or value < 0:
        raise ValueError('Invalid numeric observation')
    return int(value) if float(value).is_integer() else value


def _metadata(extra):
    path = Path(__file__).with_name('data') / 'genshin_metadata.json'
    result = json.loads(path.read_text()) if path.is_file() else {}
    for key, value in (extra or {}).items():
        if key in ('property_map', 'skill_order', 'character_aliases'):
            result[key] = {**result.get(key, {}), **value}
        else:
            result[key] = value
    return result


def _measurement(prop, metadata):
    if not isinstance(prop, dict):
        raise ValueError('Missing property observation')
    raw_type = prop.get('property_type', prop.get('type'))
    descriptor = metadata.get('property_map', {}).get(str(raw_type), {})
    key = PROPS.get(raw_type, descriptor.get('key'))
    if key not in set(PROPS.values()):
        raise ValueError('Unsupported property type')
    value = next((prop[field] for field in ('value', 'final', 'base') if prop.get(field) is not None), None)
    unit = 'flat' if key in FLAT else 'percent'
    if isinstance(value, str) and '%' in value and unit == 'flat':
        raise ValueError('Property unit mismatch')
    return {'key': key, 'value': _number(value), 'unit': unit}


def _talents(row, api_id, element, metadata, warnings):
    skills = []
    for skill in row.get('skills', []):
        sid = _int(skill.get('skill_id', skill.get('id')), 1)
        if sid is None:
            warnings.append('技能識別不明，未採用陣列位置推測。')
            continue
        skills.append({'id': sid, 'name': _label(skill.get('name')), 'level': _int(skill.get('level')),
                       'unlocked': skill.get('is_unlock') if isinstance(skill.get('is_unlock'), bool) else None})
    skills.sort(key=lambda skill: skill['id'])
    ids = [skill['id'] for skill in skills]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate public skill ID')
    order = metadata.get('skill_order', {}).get(f'{api_id}:{element}')
    if order is None and api_id not in (10000005, 10000007):
        order = metadata.get('skill_order', {}).get(str(api_id))
    displayed = dict.fromkeys(('normal', 'skill', 'burst'))
    base = dict.fromkeys(displayed)
    if not isinstance(order, list) or len(order) != 3 or len(set(order)) != 3:
        warnings.append('公開技能ID對照尚未確認，三項天賦保持未知。')
        return skills, {'base': base, 'displayed': displayed, 'bonus_context': None}
    by_id = {skill['id']: skill for skill in skills}
    for slot, sid in zip(displayed, order):
        skill = by_id.get(sid)
        if skill is not None and skill['unlocked'] is not False:
            displayed[slot] = skill['level']
    # No heuristic subtraction: explicit per-skill base metadata must state its semantics.
    explicit = metadata.get('base_skill_levels', {}).get(str(api_id), {})
    if metadata.get('base_skill_levels_verified') is True:
        for slot, sid in zip(base, order):
            base[slot] = _int(explicit.get(str(sid)))
    proved = []
    for constellation in row.get('constellations', []):
        if constellation.get('is_actived') is not True:
            continue
        effect = re.sub(r'<[^>]*>', '', str(constellation.get('effect', '')))
        matching = []
        for slot, sid in zip(base, order):
            skill = by_id.get(sid)
            if skill is None or displayed[slot] is None:
                continue
            escaped = re.escape(skill['name'])
            chinese = escaped + r'[」』]?的?(?:技能)?等級(?:提高|提升)\s*3\s*級'
            english = r'Increases the Level of\s+' + escaped + r'\s+by\s+3\b'
            if re.search(chinese, effect) or re.search(english, effect, re.I):
                matching.append(slot)
        if len(matching) == 1:
            slot = matching[0]
            invested = displayed[slot] - 3
            if invested >= 1 and base[slot] is None:
                base[slot] = invested
                proved.append(slot+' +3')
    bonus = 'HoYoLAB回傳顯示等級；未確認的基礎等級及額外加成保持未知。'
    if proved:
        bonus += '僅依已啟用命座的明確技能名稱與+3文字扣除：'+', '.join(proved)+'。'
    return skills, {'base': base, 'displayed': displayed, 'bonus_context': bonus}


def normalize(rows, metadata=None):
    """Return only game observations; caller keeps credentials and raw envelopes private."""
    if not isinstance(rows, (list, tuple)):
        raise ValueError('Expected character detail rows')
    meta, characters, warnings, seen = _metadata(metadata), [], [], set()
    for row in rows:
        base = row.get('base', row)
        api_id = _int(base.get('id'), 1)
        if api_id is None:
            raise ValueError('Missing public character ID')
        element = ELEMENTS.get(str(base.get('element', '')).lower())
        weapon_type = WEAPONS.get(base.get('weapon_type', row.get('weapon_type')))
        if element is None or weapon_type is None:
            raise ValueError('Unknown character element or weapon type')
        if (api_id, element) in seen:
            raise ValueError('Duplicate character observation')
        seen.add((api_id, element))
        name = _label(base.get('name'))
        local_warnings = []
        skills, talents = _talents(row, api_id, element, meta, local_warnings)
        if 'weapon' not in row:
            raise ValueError('Weapon observation was not provided')
        weapon = row.get('weapon')
        if weapon is not None:
            main = _measurement(weapon.get('main_property'), meta)
            secondary = _measurement(weapon['sub_property'], meta) if weapon.get('sub_property') else None
            weapon = {'api_id': _int(weapon.get('id'), 1), 'name': _label(weapon.get('name')), 'weapon_type': weapon_type,
                      'rarity': _int(weapon.get('rarity'), 1, 5), 'level': {'current': _int(weapon.get('level'), 1), 'cap': _int(weapon.get('max_level'), 1)},
                      'refinement': _int(weapon.get('affix_level'), 1, 5), 'base_atk': main['value'], 'secondary_stat': secondary}
            if weapon['api_id'] is None or main['key'] != 'atk' or main['unit'] != 'flat':
                raise ValueError('Unknown weapon identity or base attack')
        artifacts, slots = [], set()
        if 'relics' not in row or not isinstance(row['relics'], list):
            raise ValueError('Equipment list was not observed')
        for artifact in row['relics']:
            slot = SLOTS.get(artifact.get('pos'))
            if slot is None or slot in slots:
                raise ValueError('Unknown or duplicate artifact slot')
            slots.add(slot)
            if not isinstance(artifact.get('sub_property_list'), list):
                raise ValueError('Artifact substats were not observed')
            subs = [_measurement(prop, meta) for prop in artifact['sub_property_list']]
            main = _measurement(artifact.get('main_property'), meta)
            keys = [stat['key'] for stat in subs]
            if len(keys) > 4 or len(keys) != len(set(keys)) or main['key'] in keys or any(key not in SUBSTATS for key in keys):
                raise ValueError('Invalid active artifact substats')
            level = _int(artifact.get('level'), 0, 20)
            rolls = [{'key': stat['key'], 'enhancements': _int(prop.get('times'), 0, 5), 'effective': None}
                     for stat, prop in zip(subs, artifact.get('sub_property_list', []))]
            if level is not None and sum(roll['enhancements'] or 0 for roll in rolls) > level // 4:
                raise ValueError('Observed rolls exceed artifact upgrade budget')
            subs.sort(key=lambda stat: stat['key'])
            rolls.sort(key=lambda roll: roll['key'])
            artifacts.append({'api_id': _int(artifact.get('id'), 1), 'name': _label(artifact.get('name')),
                              'set_name': _label(artifact.get('set', {}).get('name')), 'slot': slot,
                              'rarity': _int(artifact.get('rarity'), 1, 5), 'level': level, 'main_stat': main, 'substats': subs,
                              'rolls': rolls})
            if artifacts[-1]['api_id'] is None:
                raise ValueError('Missing artifact template identity')
        panel = {}
        properties = [prop for field in ('base_properties', 'extra_properties', 'element_properties', 'selected_properties') for prop in row.get(field, [])]
        # Total HP/ATK/DEF IDs take precedence over base-property IDs if both exist.
        properties.sort(key=lambda prop: prop.get('property_type', 0) in (2000, 2001, 2002))
        for prop in properties:
            try:
                measurement = _measurement(prop, meta)
            except ValueError:
                local_warnings.append('有未映射或單位不符的面板欄位，未填成0。')
                continue
            panel[measurement['key']] = measurement
        aliases = meta.get('character_aliases', {})
        hint = aliases.get(f'{api_id}:{element}', aliases.get(str(api_id), aliases.get(name)))
        characters.append({'api_id': api_id, 'local_id_hint': hint, 'name': name, 'element': element,
                           'weapon_type': weapon_type, 'level': {'current': _int(base.get('level'), 1), 'cap': _int(base.get('max_level'), 1)},
                           'constellation': _int(base.get('actived_constellation_num'), 0, 6), 'friendship': _int(base.get('fetter'), 0, 10),
                           'skills': skills, 'talents': talents, 'weapon': weapon, 'artifacts': sorted(artifacts, key=lambda artifact: artifact['slot']),
                           'panel': sorted(panel.values(), key=lambda stat: stat['key'])})
        warnings.extend(f'{name}：{warning}' for warning in dict.fromkeys(local_warnings))
    characters.sort(key=lambda character: (character['api_id'], character['element']))
    return {'complete': True, 'characters': characters, 'warnings': sorted(set(warnings))}


@lru_cache(maxsize=1)
def _reviewed_corrections():
    return json.loads((Path(__file__).with_name('data')/'genshin_reviewed_corrections.json').read_text())['corrections']


def _matching_view(existing):
    """Apply only independently reviewed, exact-guard OCR fixes in memory."""
    for correction in _reviewed_corrections():
        if existing.get('id') != correction['artifact_id'] or correction['evidence_ref'] not in existing.get('provenance', {}).get('evidence_refs', []):
            continue
        expected = correction['expected_mechanics']
        if any(existing.get(field) != value for field, value in expected.items() if field != 'substats'):
            continue
        if sorted(existing.get('substats', []), key=lambda stat: stat['key']) != sorted(expected['substats'], key=lambda stat: stat['key']):
            continue
        old_rolls = existing.get('substat_rolls', {})
        expected_rolls = correction['expected_substat_rolls']
        if old_rolls.get('character_id') != expected_rolls['character_id'] or sorted(old_rolls.get('values', []), key=lambda stat: stat['key']) != sorted(expected_rolls['values'], key=lambda stat: stat['key']):
            continue
        result = copy.deepcopy(existing)
        for row in [*result['substats'], *result['substat_rolls']['values']]:
            if row['key'] == correction['from_key']:
                row['key'] = correction['to_key']
        return result, correction
    return existing, None


def _same(existing, incoming, kind):
    if kind == 'artifact':
        existing, _ = _matching_view(existing)
    fields = ('weapon_type', 'rarity', 'refinement', 'base_atk', 'secondary_stat') if kind == 'weapon' else ('set_name', 'slot', 'rarity', 'level', 'main_stat', 'substats')
    if existing.get('name') != incoming.get('name'):
        return False
    for field in fields:
        left, right = existing.get(field), incoming.get(field)
        if field == 'substats':
            left, right = sorted(left or [], key=lambda stat: stat['key']), sorted(right or [], key=lambda stat: stat['key'])
        if left != right:
            return False
    if kind == 'weapon' and existing.get('level', {}).get('current') != incoming['level']['current']:
        return False
    return existing.get('hoyolab_id') in (None, incoming['api_id'])


def _template(existing, incoming, kind):
    if kind == 'artifact':
        existing, _ = _matching_view(existing)
    if existing.get('hoyolab_id') is not None:
        matches = existing['hoyolab_id'] == incoming['api_id']
    else:
        matches = existing.get('name') == incoming['name']
    if not matches or (existing.get('rarity') is not None and incoming.get('rarity') is not None and existing['rarity'] != incoming['rarity']):
        return False
    if kind == 'weapon':
        return existing.get('weapon_type') == incoming['weapon_type']
    if existing.get('slot') != incoming['slot'] or existing.get('set_name') != incoming['set_name']:
        return False
    old_main, new_main = existing.get('main_stat', {}).get('key'), incoming.get('main_stat', {}).get('key')
    if old_main is not None and new_main is not None and old_main != new_main:
        return False
    old_keys = {row['key'] for row in existing.get('substats', [])}
    new_keys = {row['key'] for row in incoming.get('substats', [])}
    # Upgrades can unlock another affix, but cannot replace an existing one.
    # Official reshaping also preserves all four keys; only enhancements move.
    # HoYoLAB official guide, checked 2026-11-16: https://www.hoyolab.com/article/39387781
    return old_keys <= new_keys or new_keys <= old_keys


def _resolution_conflict_reason(existing, incoming, kind):
    existing, _ = _matching_view(existing) if kind == 'artifact' else (existing, None)
    if existing.get('rarity') is not None and incoming.get('rarity') is not None and existing['rarity'] != incoming['rarity']:
        mismatch = '稀有度不符'
    elif kind == 'artifact' and existing.get('main_stat', {}).get('key') != incoming.get('main_stat', {}).get('key'):
        mismatch = '主詞條不符'
    elif kind == 'artifact' and {row['key'] for row in existing.get('substats', [])} != {row['key'] for row in incoming.get('substats', [])}:
        mismatch = '副詞條種類不符，重塑不會更換詞條種類'
    else:
        mismatch = '物品類型、套裝或部位不符'
    return '先前選擇的現有裝備'+mismatch+'，無法視為同一件。請明確重新選擇。'


def _prov(previous, source, api_id):
    previous = previous or {}
    return {'source_ids': list(dict.fromkeys([*previous.get('source_ids', []), source['id']])),
            'evidence_refs': list(dict.fromkeys([*previous.get('evidence_refs', []), source['id']+'_'+str(api_id)])),
            'verification': 'api_observed', 'notes': list(previous.get('notes', []))}


def _retained_level(previous, incoming):
    result = copy.deepcopy(incoming)
    if result['cap'] is None and previous and previous.get('current') == incoming['current']:
        result['cap'] = previous.get('cap')
    return result


def _item_label(item, kind):
    """Describe only public equipment observations for the local resolution UI."""
    def measurement(stat):
        if not stat:
            return '未知'
        value = stat.get('value')
        return STAT_LABELS.get(stat['key'], stat['key'])+' '+('未知' if value is None else str(value)+('%' if stat.get('unit') == 'percent' else ''))
    if kind == 'weapon':
        level = item.get('level', {}).get('current')
        refinement = item.get('refinement')
        attack = item.get('base_atk')
        return item['name']+'・等級 '+('未知' if level is None else str(level))+'・精煉 '+('未知' if refinement is None else str(refinement))+'・基礎攻擊力 '+('未知' if attack is None else str(attack))+'・副屬性 '+measurement(item.get('secondary_stat'))
    level = item.get('level')
    return item['name']+'・等級 '+('未知' if level is None else str(level))+'・主詞條 '+measurement(item.get('main_stat'))+'・副詞條 '+('、'.join(measurement(stat) for stat in item.get('substats', [])) or '無')


def merge(base, normalized, source, effective_rules=None):
    """Merge a complete observation in memory. Ambiguous item identity is never guessed."""
    if normalized.get('complete') is not True:
        raise ValueError('Incomplete character observation')
    if not re.fullmatch(r'[a-z][a-z0-9_]*', source.get('id', '')):
        raise ValueError('Invalid observation source identity')
    candidate = copy.deepcopy(base)
    summary = {'changed': False, 'changes': [], 'warnings': list(normalized.get('warnings', [])), 'ambiguities': [], 'review_overrides': [], 'added_characters': 0, 'updated_characters': 0}
    rows = normalized.get('characters', [])
    if not rows:
        return candidate, summary
    chars = {char['id']: char for char in candidate['characters']}
    assignments, old_chars, old_equipment = {}, {}, copy.deepcopy(base['equipment'])
    for incoming in rows:
        api_id, element = incoming['api_id'], incoming['element']
        bound = [char for char in candidate['characters'] if char.get('hoyolab_id') == api_id and char['element'] == element]
        hint = incoming.get('local_id_hint')
        matches = bound or ([chars[hint]] if hint in chars else [char for char in candidate['characters'] if char['name'] == incoming['name'] and char['element'] == element])
        if len(matches) > 1:
            raise ValueError('Ambiguous character identity')
        if matches:
            char = matches[0]
            if char.get('hoyolab_id') not in (None, api_id):
                raise ValueError('Conflicting character identity binding')
            cid = char['id']
            old_chars[cid] = copy.deepcopy(char)
        else:
            cid = f'hoyolab_character_{api_id}'+(f'_{element}' if api_id in (10000005, 10000007) else '')
            if cid in chars:
                raise ValueError('Conflicting stable character identity')
            char = {'id': cid, 'name': incoming['name'], 'panel_snapshot_id': None}
            candidate['characters'].append(char)
            chars[cid] = char
            summary['added_characters'] += 1
        if cid in assignments:
            raise ValueError('Multiple observations resolve to one character')
        assignments[cid] = incoming
        for field in ('element', 'weapon_type', 'constellation', 'friendship', 'talents'):
            char[field] = copy.deepcopy(incoming[field])
        char['level'] = _retained_level(old_chars.get(cid, {}).get('level'), incoming['level'])
        char['hoyolab_id'] = api_id
        char['provenance'] = _prov(char.get('provenance'), source, api_id)
        candidate['equipment'][cid] = {'weapon_id': None, 'artifacts': dict.fromkeys(SLOTS.values())}
    inventories = {'weapon': candidate['weapons'], 'artifact': candidate['artifacts']}
    reserved, used, choices = {}, {}, []
    # Reserve all unchanged current ownerships before matching new characters.
    for cid, incoming in assignments.items():
        equipment = old_equipment.get(cid, {})
        observations = [('weapon', incoming['weapon'], equipment.get('weapon_id'))] + [('artifact', item, equipment.get('artifacts', {}).get(item['slot'])) for item in incoming['artifacts']]
        for kind, item, item_id in observations:
            existing = next((record for record in inventories[kind] if record['id'] == item_id), None)
            if item and existing and _same(existing, item, kind):
                if item_id in reserved and reserved[item_id] != cid:
                    raise ValueError('Conflicting existing equipment ownership')
                reserved[item_id] = cid
    owners = {}
    for owner, equipment in old_equipment.items():
        for item_id in [equipment.get('weapon_id'), *equipment.get('artifacts', {}).values()]:
            if item_id:
                owners[item_id] = owner
    # Explicit identity decisions must be protected before an earlier row can
    # automatically match the same template and old numeric values.
    for cid, incoming in assignments.items():
        observations = [('weapon', incoming['weapon'])] + [('artifact', item) for item in incoming['artifacts']]
        for kind, item in observations:
            if item is None:
                continue
            slot = 'weapon' if kind == 'weapon' else item['slot']
            resolution = source.get('resolutions', {}).get(f"genshin:{incoming['api_id']}:{slot}")
            if resolution is None or resolution == 'new':
                continue
            existing = next((record for record in inventories[kind] if record['id'] == resolution), None)
            if existing is not None and not _template(existing, item, kind):
                choices.append({'key': f"genshin:{incoming['api_id']}:{slot}", 'name': chars[cid]['name']+'・'+SLOT_LABELS[slot],
                                'incoming_label': _item_label(item, kind), 'requires_confirmation': True,
                                'conflict_reason': _resolution_conflict_reason(existing, item, kind),
                                'options': [{'id': 'new', 'label': '這是另一件裝備'}]})
                continue
            if (existing is None or reserved.get(resolution, cid) != cid
                    or (resolution in owners and owners[resolution] not in assignments)):
                raise ValueError('Invalid or multiply occupied equipment resolution')
            reserved[resolution] = cid
    if choices:
        raise MergeAmbiguityError(choices)

    def choose(cid, incoming, kind):
        records = inventories[kind]
        slot = 'weapon' if kind == 'weapon' else incoming['slot']
        key = f"genshin:{assignments[cid]['api_id']}:{slot}"
        allowed = lambda record: record['id'] not in used and reserved.get(record['id'], cid) == cid and (owners.get(record['id']) in assignments or record['id'] not in owners)
        exact = [record for record in records if _same(record, incoming, kind) and allowed(record)]
        current_id = old_equipment.get(cid, {}).get('weapon_id') if kind == 'weapon' else old_equipment.get(cid, {}).get('artifacts', {}).get(slot)
        current = next((record for record in exact if record['id'] == current_id), None)
        plausible = [record for record in records if _template(record, incoming, kind) and allowed(record)]
        resolution = source.get('resolutions', {}).get(key)
        if resolution is not None:
            if resolution == 'new':
                selected = None
            else:
                selected = next((record for record in plausible if record['id'] == resolution), None)
                if selected is None:
                    raise ValueError('Invalid or multiply occupied equipment resolution')
        elif current is not None:
            selected = current
        elif len(exact) == 1:
            selected = exact[0]
        elif exact or plausible:
            options = [{'id': record['id'], 'label': _item_label(record, kind)+'・原持有者 '+(chars[owners[record['id']]]['name'] if record['id'] in owners else '未裝備')} for record in (exact or plausible)]
            choices.append({'key': key, 'name': chars[cid]['name']+'・'+SLOT_LABELS[slot], 'incoming_label': _item_label(incoming, kind), 'options': [*options, {'id': 'new', 'label': '這是另一件裝備'}]})
            return None
        else:
            selected = None
        previous = copy.deepcopy(selected) if selected else None
        if selected is None:
            digest = hashlib.sha256(json.dumps(incoming, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:10]
            item_id = f"hoyolab_{kind}_{incoming['api_id']}_{cid}_{slot}_{digest}"
            if any(record['id'] == item_id for record in records):
                raise ValueError('Conflicting new equipment identity')
            selected = {'id': item_id}
            records.append(selected)
        used[selected['id']] = cid
        for field, value in incoming.items():
            if field not in ('api_id', 'rolls'):
                selected[field] = copy.deepcopy(value)
        if kind == 'weapon':
            selected['level'] = _retained_level(previous.get('level') if previous else None, incoming['level'])
        selected['hoyolab_id'] = incoming['api_id']
        selected['provenance'] = _prov(previous.get('provenance') if previous else None, source, assignments[cid]['api_id'])
        if kind == 'artifact':
            matching_previous, correction = _matching_view(previous) if previous else (None, None)
            if correction:
                selected['provenance']['notes'] = list(dict.fromkeys([*selected['provenance']['notes'], correction['note']]))
                summary['review_overrides'].append({'id': correction['id'], 'artifact_id': selected['id'], 'evidence_ref': correction['evidence_ref'], 'detail': correction['note']})
                summary['warnings'].append(correction['note'])
            unchanged = bool(previous and _same(previous, incoming, kind))
            old_rolls = matching_previous.get('substat_rolls', {}) if matching_previous else {}
            prior = {roll['key']: roll for roll in old_rolls.get('values', [])}
            old_char = old_chars.get(cid, {})
            old_weapon = next((weapon for weapon in base['weapons'] if weapon['id'] == old_equipment.get(cid, {}).get('weapon_id')), {})
            new_weapon = assignments[cid]['weapon'] or {}
            context_same = old_char.get('element') == assignments[cid]['element'] and old_char.get('constellation') == assignments[cid]['constellation'] and old_weapon.get('name') == new_weapon.get('name')
            rule = (effective_rules or {}).get(cid)
            if rule:
                context = {field: rule[field] for field in ('weapon_name', 'constellation', 'element', 'artifact_context') if field in rule}
                artifact_context = sorted(({'slot': artifact['slot'], 'set_name': artifact['set_name'],
                                           'main_stat_key': artifact['main_stat']['key']}
                                          for artifact in assignments[cid]['artifacts']), key=lambda artifact: artifact['slot'])
                actual = {'weapon_name': new_weapon.get('name'), 'constellation': assignments[cid]['constellation'],
                          'element': assignments[cid]['element'], 'artifact_context': artifact_context}
                if any(actual[field] != value for field, value in context.items()):
                    summary['warnings'].append(chars[cid]['name']+'：有效屬性規則情境已變，待重確認。')
                    rule = None
            positive = set(rule.get('effective_keys', [])) if rule else set()
            negative = set(rule.get('known_ineffective_keys', [])) if rule else set()
            if positive & negative or not (positive | negative) <= SUBSTATS:
                summary['warnings'].append(chars[cid]['name']+'：有效屬性規則衝突，未套用。')
                rule, positive, negative = None, set(), set()
            values = []
            for row in incoming['rolls']:
                old = prior.get(row['key'], {})
                observed = old.get('effective') if unchanged and context_same and old_rolls.get('character_id') == cid else None
                enhancements = row['enhancements'] if row['enhancements'] is not None else old.get('enhancements') if unchanged else None
                assessed = True if row['key'] in positive else False if row['key'] in negative or (rule and rule.get('complete') is True) else None
                values.append({'key': row['key'], 'enhancements': enhancements, 'effective': observed, 'assessed_effective': assessed})
            selected['substat_rolls'] = {'character_id': cid, 'values': values}
            if rule:
                selected['substat_rolls'].update({'rule_id': rule['rule_id'], 'effective_keys': sorted(positive)})
        return selected['id']

    for cid, incoming in assignments.items():
        if incoming['weapon']:
            candidate['equipment'][cid]['weapon_id'] = choose(cid, incoming['weapon'], 'weapon')
        for artifact in incoming['artifacts']:
            candidate['equipment'][cid]['artifacts'][artifact['slot']] = choose(cid, artifact, 'artifact')
    if choices:
        raise MergeAmbiguityError(choices)
    candidate['schema_version'] = 3
    for cid, incoming in assignments.items():
        char = chars[cid]
        previous = next((panel for panel in candidate['panel_snapshots'] if panel['id'] == char['panel_snapshot_id']), None)
        fingerprint = build_fingerprint(candidate, cid)
        stats = incoming['panel']
        if stats and (not previous or previous['stats'] != stats or previous['build_fingerprint'] != fingerprint or previous.get('provenance', {}).get('verification') != 'api_observed'):
            sid = 'snapshot_hoyolab_'+cid+'_'+hashlib.sha256(source['id'].encode()).hexdigest()[:12]
            existing = next((panel for panel in candidate['panel_snapshots'] if panel['id'] == sid), None)
            if existing:
                if (existing['character_id'] != cid or existing['stats'] != stats or existing['build_fingerprint'] != fingerprint
                        or existing.get('provenance', {}).get('verification') != 'api_observed'
                        or source['id'] not in existing.get('provenance', {}).get('source_ids', [])):
                    raise ValueError('Observation identity collision')
            else:
                candidate['panel_snapshots'].append({'id': sid, 'character_id': cid, 'stats': copy.deepcopy(stats), 'observed_at': None,
                    'imported_at': source['retrieved_at'], 'build_fingerprint': fingerprint,
                    'context': {'notes': ['HoYoLAB API觀測；伺服器資料時間與隊伍增益情境未知。'], 'buffs': None, 'team_character_ids': None},
                    'provenance': _prov(None, source, incoming['api_id'])})
            char['panel_snapshot_id'] = sid
        if not stats:
            summary['warnings'].append(char['name']+'：未提供可映射的新面板，保留原觀測。')
        if cid not in old_chars:
            summary['changes'].append({'name': char['name'], 'detail': '新增已讀取角色、穿戴裝備與面板觀測。'})
        elif char != old_chars[cid] or candidate['equipment'][cid] != old_equipment.get(cid) or any(
                record != next((old for old in base[kind] if old['id'] == record['id']), None)
                for kind in ('weapons', 'artifacts') for record in candidate[kind] if used.get(record['id']) == cid):
            summary['updated_characters'] += 1
            summary['changes'].append({'name': char['name'], 'detail': '更新HoYoLAB角色及穿戴觀測，保留既有物品ID與歷史面板。'})
    if candidate != base:
        candidate['source_ids'] = list(dict.fromkeys([*candidate['source_ids'], source['id']]))
        candidate['updated_at'] = source['retrieved_at']
        candidate['coverage']['notes'] = list(dict.fromkeys([*candidate['coverage'].get('notes', []), 'HoYoLAB同步僅含已回傳角色與穿戴裝備，不代表完整背包。']))
    summary['changed'] = candidate != base
    summary['warnings'] = list(dict.fromkeys(summary['warnings']))
    return candidate, summary
