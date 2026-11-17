"""Account talent investment from pinned, per-skill constellation evidence.

HoYoLAB character details are treated as permanent account levels plus unlocked
constellations, following the documented public integrations. That provider
semantic is a supported inference, distinct from the client-extracted boost IDs.
No active-party state, name suffix, response position, or C3/C5 default is used.
"""
from __future__ import annotations

from collections import Counter
from copy import deepcopy
from functools import lru_cache
import json
from pathlib import Path

SLOTS = ('normal', 'skill', 'burst')
RULES_PATH = Path(__file__).with_name('data') / 'genshin_talent_rules.json'


@lru_cache(maxsize=1)
def _rules():
    return json.loads(RULES_PATH.read_text())


def _integer(value, minimum=0, maximum=None):
    return (isinstance(value, int) and not isinstance(value, bool)
            and value >= minimum and (maximum is None or value <= maximum))


def apply_genshin_talent_bases(snapshot_game, rules=None):
    """Return an independent game and a report; input/cached observations stay intact.

    Rules are keyed by both avatar ID and element, including both travelers and
    both Manekin avatars. Missing IDs, constellation evidence, skill observations,
    or inconsistent/out-of-range levels remain null rather than being clamped.
    Minimal non-character test records are skipped without adding game fields.
    """
    result = deepcopy(snapshot_game)
    metadata = _rules() if rules is None else rules
    provider = metadata.get('provider_semantics', {})
    reason_counts = Counter()
    report = {'rule_id': metadata.get('rule_id'), 'semantics_status': provider.get('status'),
              'characters': 0, 'known_slots': 0, 'unknown_slots': 0,
              'known_characters': 0, 'unknown_characters': 0,
              'skipped_characters': 0, 'updated_characters': [],
              'unknown_reasons': {}, 'warnings': []}
    for character in result.get('characters', []):
        if (not isinstance(character, dict) or not isinstance(character.get('name'), str)
                or not character['name'] or not isinstance(character.get('skills'), list)
                or not character['skills'] or not isinstance(character.get('talents'), dict)):
            report['skipped_characters'] += 1
            continue
        report['characters'] += 1
        talents = character['talents']
        before = deepcopy(talents)
        base = dict.fromkeys(SLOTS)
        api_id, element = character.get('api_id'), character.get('element')
        rule = metadata.get('characters', {}).get(f'{api_id}:{element}')
        displayed = talents.get('displayed', {})
        observed = {}
        duplicate_ids = set()
        for skill in character['skills']:
            if not isinstance(skill, dict) or not _integer(skill.get('id'), 1):
                continue
            sid = skill['id']
            if sid in observed:
                duplicate_ids.add(sid)
            observed[sid] = skill
        constellation = character.get('constellation')
        c_known = _integer(constellation, 0, 6)
        for slot in SLOTS:
            reason = None
            if (provider.get('level_semantics') != 'permanent_plus_constellation'
                    or provider.get('status') not in ('supported_inference', 'verified')):
                reason = 'unconfirmed_provider_semantics'
            elif not rule or rule.get('avatar_id') != api_id or rule.get('element') != element:
                reason = 'unconfirmed_character_element'
            else:
                sid = rule.get('skill_order', {}).get(slot)
                skill = observed.get(sid)
                level = displayed.get(slot) if isinstance(displayed, dict) else None
                if not _integer(sid, 1) or sid in duplicate_ids or skill is None:
                    reason = 'missing_or_duplicate_skill_id'
                elif skill.get('unlocked') is False:
                    reason = 'skill_locked'
                elif not _integer(level, 1) or skill.get('level') != level:
                    reason = 'missing_or_inconsistent_displayed_level'
                elif not rule.get('complete_constellations') and not (c_known and constellation == 0):
                    reason = 'incomplete_constellation_evidence'
                else:
                    boosts = [boost for boost in rule.get('boosts', []) if boost.get('slot') == slot]
                    if any(boost.get('skill_id') != sid or not _integer(boost.get('amount'), 1)
                           or not _integer(boost.get('constellation'), 1, 6) for boost in boosts):
                        reason = 'inconsistent_boost_evidence'
                    elif not c_known and boosts:
                        reason = 'unknown_constellation'
                    else:
                        amount = sum(boost['amount'] for boost in boosts
                                     if c_known and constellation >= boost['constellation'])
                        invested = level - amount
                        if not _integer(invested, 1, rule.get('base_level_max', 10)):
                            reason = 'outside_invested_level_range'
                        else:
                            base[slot] = invested
            if reason:
                reason_counts[reason] += 1
                report['unknown_slots'] += 1
                report['warnings'].append({'api_id': api_id, 'element': element,
                                           'name': character['name'], 'slot': slot, 'reason': reason})
            else:
                report['known_slots'] += 1
        talents['base'] = base
        if rule and any(value is not None for value in base.values()):
            talents['bonus_context'] = (
                f"規則 {rule['rule_id']}。技能與命座對照來自公開客戶端資料。"
                'HoYoLAB 等級依帳號永久天賦含命座解讀，僅扣已啟用且技能 ID 相符的加成。'
                '此來源語義為公開讀取工具與帳號觀測支持的推論，不把隊伍臨時被動當成永久投入。')
        elif any(value is not None for value in before.get('base', {}).values()):
            talents['bonus_context'] = '基礎等級尚缺可核對的技能、命座或來源情境，保持未知。'
        if all(value is not None for value in base.values()):
            report['known_characters'] += 1
        else:
            report['unknown_characters'] += 1
        if before != talents:
            report['updated_characters'].append(character['name'])
    report['unknown_reasons'] = dict(sorted(reason_counts.items()))
    return result, report
