"""Sanitize HoYoLAB ZZZ records and merge source-backed observations.

No authentication, network requests, credential I/O, or logging belongs here.
HoYoLAB's displayed skill levels are retained without adding Mindscape bonuses.
"""

from copy import deepcopy
from decimal import Decimal, InvalidOperation
from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path
import re

from .zzz_talents import apply_zzz_skill_bases


SKILLS = {0: "普通攻擊", 2: "閃避", 6: "支援技", 1: "特殊技", 3: "連攜技", 5: "核心技"}
ELEMENTS = {200: "物理", 201: "火", 202: "冰", 203: "電", 204: "風", 205: "以太"}
SPECIALTIES = {1: "強攻", 2: "擊破", 3: "異常", 4: "支援", 5: "防護", 6: "命破"}
_ELEMENT_PARENTS = {
    "物理": "物理", "物理屬性": "物理", "凜刃": "物理",
    "火": "火", "火屬性": "火",
    "冰": "冰", "冰屬性": "冰", "烈霜": "冰",
    "電": "電", "電屬性": "電",
    "以太": "以太", "以太屬性": "以太", "玄墨": "以太",
    "風": "風", "風屬性": "風",
}
SUBSTAT_PROPERTIES = {
    11103: ("生命值", "flat"), 11102: ("生命值", "percent"),
    12103: ("攻擊力", "flat"), 12102: ("攻擊力", "percent"),
    13103: ("防禦力", "flat"), 13102: ("防禦力", "percent"),
    20103: ("暴擊率", "percent"), 21103: ("暴擊傷害", "percent"),
    31203: ("異常精通", "flat"), 23203: ("穿透值", "flat"),
}
EQUIPMENT_PROPERTIES = {
    **SUBSTAT_PROPERTIES,
    11101: ("基礎生命值", "flat"), 12101: ("基礎攻擊力", "flat"),
    13101: ("基礎防禦力", "flat"), 23101: ("基礎穿透值", "flat"),
    23103: ("穿透率", "percent"), 31402: ("異常掌控", "percent"),
    30502: ("能量自動回復", "percent"), 12202: ("衝擊力", "percent"),
    31503: ("物理傷害加成", "percent"), 31603: ("火屬性傷害加成", "percent"),
    31703: ("冰屬性傷害加成", "percent"), 31803: ("電屬性傷害加成", "percent"),
    31903: ("以太傷害加成", "percent"), 32303: ("風屬性傷害加成", "percent"),
}
AGENT_PROPERTIES = {
    1: ("生命值", "flat"), 2: ("攻擊力", "flat"), 3: ("防禦力", "flat"),
    4: ("衝擊力", "flat"), 5: ("暴擊率", "percent"), 6: ("暴擊傷害", "percent"),
    7: ("異常掌控", "flat"), 8: ("異常精通", "flat"),
    9: ("穿透率", "percent"), 11: ("能量自動回復", "flat"),
    19: ("貫穿力", "flat"), 232: ("穿透值", "flat"),
    315: ("物理傷害加成", "percent"), 316: ("火屬性傷害加成", "percent"),
    317: ("冰屬性傷害加成", "percent"), 318: ("電屬性傷害加成", "percent"),
    319: ("以太傷害加成", "percent"), 323: ("風屬性傷害加成", "percent"),
}
EFFECTIVE_KEYS = {name + "|" + unit for name, unit in SUBSTAT_PROPERTIES.values()}
_SUBSTAT_ORDER = {name + "|" + unit: index for index, (name, unit) in enumerate(SUBSTAT_PROPERTIES.values())}
_NUMBER = re.compile(r"^[+-]?(?:\d+(?:\.\d*)?|\.\d+)%?$")


def _integer(value, minimum, maximum, *, required=False):
    if value is None and not required:
        return None
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise ValueError("Invalid integer in ZZZ record")
    return value


def _text(value, *, required=False):
    if value is None and not required:
        return None
    if not isinstance(value, str) or not value.strip() or len(value) > 160:
        raise ValueError("Invalid public label in ZZZ record")
    if any(ord(char) < 32 for char in value) or re.search(r"https?://|[<>]", value, re.I):
        raise ValueError("Invalid public label in ZZZ record")
    return value.strip()


def _number(value):
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, (int, float, str, Decimal)):
        raise ValueError("Invalid stat value in ZZZ record")
    text = str(value).strip()
    if "," in text and not re.fullmatch(r"[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?%?", text):
        raise ValueError("Invalid grouped stat value in ZZZ record")
    text = text.replace(",", "")
    if not _NUMBER.fullmatch(text):
        raise ValueError("Invalid stat value in ZZZ record")
    try:
        number = Decimal(text.rstrip("%"))
    except InvalidOperation:
        raise ValueError("Invalid stat value in ZZZ record") from None
    if not number.is_finite() or number < 0 or number > 10 ** 12:
        raise ValueError("Invalid stat value in ZZZ record")
    return int(number) if number == number.to_integral_value() else float(number)


def _display(value, unit):
    if value is None:
        return None
    return f"{value:g}%" if unit == "percent" else value


def _mapping(row):
    if not isinstance(row, dict):
        raise ValueError("ZZZ records must be objects")
    return row


def _sequence(value, *, optional=False):
    if value is None and optional:
        return None
    if not isinstance(value, (list, tuple)):
        raise ValueError("ZZZ records must contain complete lists")
    return list(value)


def _property(row, *, substat=False):
    row = _mapping(row)
    prop_id = row.get("property_id", row.get("type"))
    prop_id = _integer(prop_id, 1, 999999, required=True)
    definition = (SUBSTAT_PROPERTIES if substat else EQUIPMENT_PROPERTIES).get(prop_id)
    if definition is None:
        return None
    name, unit = definition
    value = _number(row.get("base", row.get("value")))
    return {"name": name, "value": value, "unit": unit}


def _equipment_stats(rows):
    stats = {}
    for row in _sequence(rows or []):
        prop = _property(row)
        if prop is not None:
            if prop["name"] in stats:
                raise ValueError("Duplicate equipment property in ZZZ record")
            stats[prop["name"]] = _display(prop["value"], prop["unit"])
    return dict(sorted(stats.items())) or None


def _engine(row):
    if row is None:
        return None
    row = _mapping(row)
    rarity = row.get("rarity")
    if rarity not in (None, "B", "A", "S"):
        raise ValueError("Invalid W-engine rarity")
    stats = _equipment_stats(list(row.get("main_properties") or []) + list(row.get("properties") or []))
    return {
        "api_id": _integer(row.get("id"), 1, 9999999999, required=True),
        "name": _text(row.get("name")), "rarity": rarity,
        "level": _integer(row.get("level"), 0, 60),
        "maxLevel": None,
        "refinement": _integer(row.get("star", row.get("refinement")), 1, 5),
        "stats": stats,
    }


def _disc(row, metadata=None):
    row = _mapping(row)
    rarity = row.get("rarity")
    if rarity not in (None, "B", "A", "S"):
        raise ValueError("Invalid drive disc rarity")
    level = _integer(row.get("level"), 0, {"S": 15, "A": 12, "B": 9}.get(rarity, 15))
    main_rows = _sequence(row.get("main_properties") or [])
    if len(main_rows) > 1:
        raise ValueError("Drive disc has multiple main properties")
    main = _property(main_rows[0]) if main_rows else None
    if main and main["name"].startswith("基礎"):
        main["name"] = main["name"][2:]
    sub_rows = _sequence(row.get("properties") or [])
    if len(sub_rows) > 4:
        raise ValueError("Drive disc has too many substats")
    substats, seen = [], set()
    complete = True
    for raw in sub_rows:
        prop = _property(raw, substat=True)
        if prop is None:
            complete = False
            continue
        key = prop["name"] + "|" + prop["unit"]
        if key in seen:
            raise ValueError("Duplicate drive disc substat")
        if main and key == main["name"] + "|" + main["unit"]:
            raise ValueError("Drive disc main and substat overlap")
        seen.add(key)
        substats.append({**prop, "enhancementCount": None, "isEffective": None})
    substats.sort(key=lambda stat: _SUBSTAT_ORDER[stat["name"] + "|" + stat["unit"]])
    suit = _mapping(row.get("equip_suit", row.get("set_effect")) or {})
    return {
        "api_id": _integer(row.get("id"), 1, 9999999999, required=True),
        "set_id": _integer(suit.get("suit_id", suit.get("id")), 1, 9999999999),
        "slot": _integer(row.get("equipment_type", row.get("position")), 1, 6, required=True),
        "setName": _text(suit.get("name") or (metadata or {}).get("disc_sets", {}).get(str(suit.get("suit_id", suit.get("id"))))), "rarity": rarity, "level": level,
        "mainStat": main or {"name": None, "value": None, "unit": None},
        "substats": substats,
        "substatsComplete": complete and bool(substats) and all(s["value"] is not None for s in substats),
    }


def normalize(rawrows, metadata=None):
    """Return an explicit public-data allowlist from complete avatar/info rows.

    Unknown property IDs are omitted and make the relevant disc incomplete.
    No caller identity, icon URLs, HTML skill text, or unrecognized raw fields survive.
    """
    rows = _sequence(rawrows)
    characters, seen = [], set()
    for raw in rows:
        raw = _mapping(raw)
        api_id = _integer(raw.get("id"), 1, 9999999999, required=True)
        if api_id in seen:
            raise ValueError("Duplicate ZZZ agent ID")
        seen.add(api_id)
        skills = {name: None for name in SKILLS.values()}
        core_raw, skill_types = None, set()
        for item in _sequence(raw.get("skills") or []):
            item = _mapping(item)
            kind = item.get("skill_type", item.get("type"))
            if isinstance(kind, bool) or kind not in SKILLS:
                continue
            if kind in skill_types:
                raise ValueError("Duplicate ZZZ skill type")
            skill_types.add(kind)
            level = _integer(item.get("level"), 1, 7 if kind == 5 else 20)
            if kind == 5:
                core_raw = level
                skills[SKILLS[kind]] = chr(63 + level) if level and level >= 2 else 0 if level == 1 else None
            else:
                skills[SKILLS[kind]] = level
        stats = {}
        for prop in _sequence(raw.get("properties") or []):
            prop = _mapping(prop)
            prop_id = prop.get("property_id", prop.get("type"))
            if isinstance(prop_id, bool) or prop_id not in AGENT_PROPERTIES:
                continue
            name, unit = AGENT_PROPERTIES[prop_id]
            if name in stats:
                raise ValueError("Duplicate agent stat")
            stats[name] = _display(_number(prop.get("final")), unit)
        discs = _sequence(raw.get("equip", raw.get("discs")), optional=True)
        discs = [_disc(row, metadata) for row in discs] if discs is not None else None
        if discs is not None and len({disc["slot"] for disc in discs}) != len(discs):
            raise ValueError("Duplicate drive disc slot")
        if discs is not None:
            discs.sort(key=lambda disc: disc["slot"])
        rarity = raw.get("rarity")
        if rarity not in (None, "S", "A"):
            raise ValueError("Invalid agent rarity")
        meta = (metadata or {}).get("characters", {}).get(str(api_id), {})
        local_id = meta.get("id")
        if local_id is not None and (not isinstance(local_id, str) or not re.fullmatch(r"[a-z0-9_]+", local_id)):
            raise ValueError("Invalid ZZZ local ID metadata")
        aliases = []
        for value in (raw.get("name_mi18n", raw.get("name")), raw.get("full_name_mi18n", raw.get("full_name"))):
            if value is not None:
                value = _text(value, required=True)
                if value not in aliases:
                    aliases.append(value)
        characters.append({
            "api_id": api_id,
            "local_id": local_id,
            "aliases": aliases,
            "name": _text(meta.get("name") or raw.get("full_name_mi18n", raw.get("full_name")) or raw.get("name_mi18n", raw.get("name")), required=True),
            "level": _integer(raw.get("level"), 1, 60),
            "mindscape": _integer(raw.get("rank"), 0, 6),
            "rarity": rarity,
            "element": ELEMENTS.get(raw.get("element_type", raw.get("element"))),
            "specialty": SPECIALTIES.get(raw.get("avatar_profession", raw.get("specialty"))),
            "stats": dict(sorted(stats.items())) or None,
            "skills": skills,
            "skillsBase": {name: None for kind, name in SKILLS.items() if kind != 5},
            "skillContext": {"provider": "hoyolab", "levelSemantics": "provider_displayed", "coreRawLevel": core_raw},
            "wEngine": _engine(raw.get("weapon", raw.get("w_engine"))),
            "driveDiscs": discs,
        })
    characters.sort(key=lambda character: character["api_id"])
    return apply_zzz_skill_bases({"complete": True, "characters": characters})


@lru_cache(maxsize=1)
def _roll_rules():
    return json.loads((Path(__file__).parent / "data" / "zzz_roll_rules.json").read_text())


@lru_cache(maxsize=1)
def _metadata():
    return json.loads((Path(__file__).parent / "data" / "zzz_metadata.json").read_text())


def _weapon_name_key(name):
    """Resolve only whole-name aliases verified against an official entry."""
    for entry in _metadata()["weapon_name_aliases"]:
        if name == entry["canonical_name"] or name in entry["aliases"]:
            return entry["canonical_name"]
    return name


def _same_engine_observation(current, previous):
    if not previous or not isinstance(current.get("name"), str) or not isinstance(previous.get("name"), str):
        return False
    if _weapon_name_key(current["name"]) != _weapon_name_key(previous["name"]):
        return False
    fields = ("level", "rarity", "refinement", "stats")
    return all(current.get(key) is not None and current[key] == previous.get(key) for key in fields)


def _key(stat):
    if stat.get("name") is None or stat.get("unit") not in ("flat", "percent"):
        return None
    return stat["name"] + "|" + stat["unit"]


def _derive_enhancements(disc):
    """Derive S-rank counts only under the audited fixed-roll and total budget.

    The return value is all-or-unknown. It is not a direct HoYoLAB observation.
    """
    rules = _roll_rules()
    level = disc.get("level")
    substats = disc.get("substats")
    if (
        disc.get("rarity") != "S" or isinstance(level, bool)
        or not isinstance(level, int) or not 0 <= level <= rules["max_level"]
        or disc.get("substatsComplete") is not True
        or not isinstance(substats, list) or len(substats) not in (3, 4)
    ):
        return None
    if level >= 3 and len(substats) != 4:
        return None
    counts, keys = [], set()
    for stat in substats:
        key = _key(stat)
        quantum = rules["increments"].get(key)
        if key in keys or quantum is None or stat.get("value") is None:
            return None
        if key == _key(disc.get("mainStat") or {}):
            return None
        keys.add(key)
        try:
            value = Decimal(str(stat["value"]))
            ratio = value / Decimal(quantum["value"])
        except (InvalidOperation, ZeroDivisionError):
            return None
        if not ratio.is_finite() or ratio != ratio.to_integral_value() or not 1 <= ratio <= 6:
            return None
        counts.append(int(ratio) - 1)
    initial = len(substats) + sum(counts) - level // rules["enhancement_step"]
    if initial not in rules["allowed_initial_substats"]:
        return None
    return counts


def _disc_fingerprint(disc):
    if not disc or disc.get("substatsComplete") is not True:
        return None
    main = disc.get("mainStat") or {}
    if not _key(main) or main.get("value") is None:
        return None
    substats = disc.get("substats")
    if not isinstance(substats, list) or not substats:
        return None
    values = []
    for stat in substats:
        if not _key(stat) or stat.get("value") is None:
            return None
        values.append((_key(stat), Decimal(str(stat["value"]))))
    if len({key for key, _ in values}) != len(values):
        return None
    return (
        disc.get("slot"), disc.get("setName"), disc.get("rarity"), disc.get("level"),
        _key(main), Decimal(str(main["value"])), tuple(sorted(values)),
    )


def _name_key(value):
    text = (value or "").strip()
    for opening, closing in (("「", "」"), ("『", "』")):
        if text.startswith(opening) and text.endswith(closing):
            text = text[1:-1]
            break
    return re.sub(r"[\s・·‧]", "", text).casefold()


def _element_parent(value):
    return _ELEMENT_PARENTS.get(value)


def _merge_element(character_id, provider_value, previous, warnings):
    """Keep confirmed identity wording; use the API category as a compatibility check."""
    confirmed = previous.get("element") if previous is not None else None
    if confirmed is None:
        return provider_value, True
    if provider_value is None:
        warnings.append(f"{character_id}: unknown_provider_element_retained_identity")
        return confirmed, True
    if provider_value == confirmed:
        return confirmed, True
    known_parent, provider_parent = _element_parent(confirmed), _element_parent(provider_value)
    if known_parent is None or provider_parent is None:
        warnings.append(f"{character_id}: unknown_element_parent_retained_identity")
        return confirmed, False
    if known_parent != provider_parent:
        warnings.append(f"{character_id}: provider_element_parent_mismatch_retained_identity")
        return confirmed, False
    return confirmed, True


def _same_context_value(key, expected, current):
    if expected == current:
        return True
    if key == "element":
        parent = _element_parent(expected)
        return parent is not None and parent == _element_parent(current)
    if key == "weapon_name":
        return _weapon_name_key(expected) == _weapon_name_key(current)
    return False


def _source_record(source):
    sid = source.get("id")
    if not isinstance(sid, str) or not re.fullmatch(r"[a-z][a-z0-9_]*", sid):
        raise ValueError("Invalid HoYoLAB source ID")
    retrieved = source.get("retrieved_at")
    if not isinstance(retrieved, str) or not retrieved:
        raise ValueError("Missing HoYoLAB retrieval time")
    try:
        if datetime.fromisoformat(retrieved.replace("Z", "+00:00")).tzinfo is None:
            raise ValueError
    except ValueError:
        raise ValueError("Invalid HoYoLAB retrieval time") from None
    path = source.get("path")
    digest = source.get("sha256")
    if path != f"imports/hoyolab/{sid}.json" or not isinstance(digest, str) or not re.fullmatch(r"[a-f0-9]{64}", digest):
        raise ValueError("Invalid immutable HoYoLAB source reference")
    return {"id": sid, "provider": "hoyolab", "retrievedAt": retrieved, "path": path, "sha256": digest}


def _role_rule(character_id, current, rules, warnings):
    rule = (rules or {}).get(character_id)
    if rule is None:
        return None
    if not isinstance(rule, dict) or not isinstance(rule.get("rule_id"), str) or not rule["rule_id"]:
        warnings.append(f"{character_id}: invalid_effective_rule")
        return None
    positive = rule.get("effective_keys")
    negative = rule.get("known_ineffective_keys", [])
    if (
        not isinstance(positive, list) or not isinstance(negative, list)
        or any(not isinstance(key, str) or key not in EFFECTIVE_KEYS for key in positive + negative)
        or len(positive) != len(set(positive)) or len(negative) != len(set(negative))
        or set(positive) & set(negative)
    ):
        warnings.append(f"{character_id}: conflicting_effective_rule")
        return None
    context = rule.get("context", rule)
    if not isinstance(context, dict):
        warnings.append(f"{character_id}: invalid_effective_context")
        return None
    actual = {
        "weapon_name": (current.get("wEngine") or {}).get("name"),
        "mindscape": current.get("mindscape"), "element": current.get("element"),
    }
    unknown = [key for key, value in actual.items() if key in context and (context[key] is None or value is None)]
    if unknown:
        newly_confirmed = "weapon_name" in unknown and context["weapon_name"] is None and actual["weapon_name"] is not None
        reason = "effective_rule_context_unknown_new_weapon_confirmed" if newly_confirmed else "effective_rule_context_unknown"
        warnings.append(f"{character_id}: {reason}")
        return None
    if any(key in context and not _same_context_value(key, context[key], value) for key, value in actual.items()):
        warnings.append(f"{character_id}: effective_rule_context_changed")
        return None
    if not positive and rule.get("complete") is not True and set(negative) != EFFECTIVE_KEYS:
        warnings.append(f"{character_id}: incomplete_empty_effective_rule")
        return None
    return {
        "rule_id": rule["rule_id"], "effective_keys": list(positive),
        "known_ineffective_keys": list(negative), "complete": rule.get("complete") is True,
    }


def _effective_count(disc):
    if disc.get("substatsComplete") is not True:
        return None
    total = 0
    for stat in disc["substats"]:
        flag = stat.get("isEffective")
        if not isinstance(flag, bool):
            flag = stat.get("assessedEffective") if disc.get("assessment") else None
        if not isinstance(flag, bool):
            return None
        if flag:
            count = stat.get("enhancementCount")
            if isinstance(count, bool) or not isinstance(count, int) or count < 0:
                return None
            total += 1 + count
    return total


def _merge_disc(character_id, observed, previous, evidence, source_id, rule, summary):
    fields = ("slot", "setName", "rarity", "level", "mainStat", "substats", "substatsComplete")
    disc = {field: deepcopy(observed[field]) for field in fields}
    fingerprint = _disc_fingerprint(observed)
    same = previous is not None and fingerprint is not None and fingerprint == _disc_fingerprint(previous)
    # HoYoLAB exposes a template ID, not proof of physical identity. Reuse only
    # this character's identical slot observation, never a cross-character match.
    disc["id"] = previous["id"] if same else f"{character_id}_slot_{disc['slot']}_{source_id}"
    disc["evidence"] = deepcopy(previous.get("evidence", [])) if same else []
    if evidence not in disc["evidence"]:
        disc["evidence"].append(deepcopy(evidence))
    disc["uncertainties"] = deepcopy(previous.get("uncertainties", [])) if same else []
    old_stats = {_key(stat): stat for stat in previous["substats"]} if same else {}
    derived = _derive_enhancements(disc)
    for index, stat in enumerate(disc["substats"]):
        stat.pop("assessedEffective", None)
        stat.pop("enhancementSource", None)
        old = old_stats.get(_key(stat))
        if old:
            stat["isEffective"] = old.get("isEffective")
            stat["enhancementCount"] = old.get("enhancementCount")
            if stat["enhancementCount"] is not None:
                stat["enhancementSource"] = old.get("enhancementSource", "game_observed")
            for review in _roll_rules()["review_overrides"]:
                if (
                    character_id == review["character_id"] and disc["id"] == review["disc_id"]
                    and _key(stat) == review["stat_key"] and stat["value"] == review["value"]
                    and stat["enhancementCount"] == review["previous_enhancement_count"]
                ):
                    stat["enhancementCount"] = review["enhancement_count"]
                    stat["enhancementSource"] = "game_observed"
                    summary["review_overrides"].append(disc["id"])
        if stat.get("enhancementCount") is None and derived is not None:
            stat["enhancementCount"] = derived[index]
            stat["enhancementSource"] = "derived_fixed_roll"
            summary["derived_substats"] += 1
        if rule:
            key = _key(stat)
            stat["assessedEffective"] = (
                True if key in rule["effective_keys"] else
                False if rule["complete"] or key in rule["known_ineffective_keys"] else None
            )
        else:
            stat["assessedEffective"] = None
    if rule:
        disc["effectiveKeys"] = list(rule["effective_keys"])
        disc["assessment"] = {"ruleId": rule["rule_id"], "method": "role_rule"}
    disc["effectiveRollCount"] = _effective_count(disc)
    if derived is None and not same:
        summary["warnings"].append(f"{character_id}/slot{disc['slot']}: unknown_enhancement_budget")
    return disc


def merge(base, normalized, source, effective_rules=None):
    """Merge a complete sanitized snapshot without changing input objects.

    Original video source/evidence survive. The first pre-sync v1 character is
    saved once in legacyObservation. Snapshot source references are immutable.
    """
    if not isinstance(base, dict) or base.get("game") != "zzz" or base.get("schemaVersion") not in (1, 2):
        raise ValueError("Unsupported ZZZ base account")
    if not isinstance(normalized, dict) or normalized.get("complete") is not True:
        raise ValueError("Cannot merge an incomplete HoYoLAB snapshot")
    rows = _sequence(normalized.get("characters"))
    source_row = _source_record(_mapping(source))
    sid = source_row["id"]
    candidate = deepcopy(base)
    candidate["schemaVersion"] = 2
    sources = candidate.setdefault("syncSources", [])
    existing_source = next((entry for entry in sources if entry.get("id") == sid), None)
    if existing_source is not None and existing_source != source_row:
        raise ValueError("Cannot overwrite an immutable HoYoLAB source")
    if existing_source is None:
        sources.append(source_row)
    characters = candidate["characters"]
    by_id = {character["id"]: character for character in characters}
    by_api = {}
    by_name = {}
    for character in characters:
        api_id = character.get("sync", {}).get("apiId")
        if api_id is not None:
            if api_id in by_api:
                raise ValueError("Ambiguous existing ZZZ API ID")
            by_api[api_id] = character
        by_name.setdefault(_name_key(character["name"]), []).append(character)
    summary = {"updated": 0, "added": 0, "unchanged": 0, "derived_substats": 0, "review_overrides": [], "warnings": []}
    matched_ids, seen_api = set(), set()
    for index, observed in enumerate(rows):
        observed = _mapping(observed)
        api_id = _integer(observed.get("api_id"), 1, 9999999999, required=True)
        if api_id in seen_api:
            raise ValueError("Duplicate normalized ZZZ API ID")
        seen_api.add(api_id)
        local_id = observed.get("local_id")
        previous = by_api.get(api_id)
        if previous is not None and local_id is not None and previous["id"] != local_id:
            raise ValueError("Conflicting ZZZ character identity")
        if previous is None and local_id in by_id:
            previous = by_id[local_id]
        aliases = _sequence(observed.get("aliases", []))
        name_keys = {_name_key(_text(value, required=True)) for value in [observed["name"], *aliases]}
        matches = {character["id"]: character for key in name_keys for character in by_name.get(key, [])}
        if len(matches) > 1:
            raise ValueError("Ambiguous ZZZ character aliases")
        name_match = next(iter(matches.values()), None)
        if previous is not None and name_match is not None and previous["id"] != name_match["id"]:
            raise ValueError("Conflicting ZZZ character aliases")
        if previous is None and name_match is not None:
            if local_id is not None and local_id != name_match["id"]:
                raise ValueError("Conflicting ZZZ local character metadata")
            previous = name_match
        cid = previous["id"] if previous is not None else local_id or f"zzz_{api_id}"
        if not isinstance(cid, str) or not re.fullmatch(r"[a-z0-9_]+", cid) or cid in matched_ids:
            raise ValueError("Conflicting ZZZ local character ID")
        matched_ids.add(cid)
        if previous is not None and previous.get("sync", {}).get("apiId") not in (None, api_id):
            raise ValueError("Conflicting ZZZ API identity")
        current = deepcopy(previous) if previous is not None else {"id": cid, "evidence": [], "uncertainties": []}
        if previous is not None and "legacyObservation" not in previous and not previous.get("sync"):
            current["legacyObservation"] = deepcopy(previous)
        current["name"] = previous["name"] if previous is not None else observed["name"]
        for field in ("level", "mindscape", "stats", "skills", "skillsBase", "skillContext"):
            current[field] = deepcopy(observed.get(field))
        current["element"], element_compatible = _merge_element(
            cid, observed.get("element"), previous, summary["warnings"]
        )
        if observed.get("specialty") is None and previous is not None and previous.get("specialty") is not None:
            current["specialty"] = deepcopy(previous["specialty"])
            summary["warnings"].append(f"{cid}: unknown_provider_specialty_retained_identity")
        else:
            current["specialty"] = deepcopy(observed.get("specialty"))
        engine = deepcopy(observed.get("wEngine"))
        if engine:
            engine.pop("api_id", None)
            old_engine = previous.get("wEngine") if previous else None
            if _same_engine_observation(engine, old_engine):
                engine["maxLevel"] = old_engine.get("maxLevel")
        current["wEngine"] = engine
        current["statsEffective"] = {key: None for key in current.get("stats") or {}}
        current["sync"] = {"apiId": api_id, "sourceId": sid}
        evidence = {"sourceId": sid, "record": f"/zzz/characters/{index}"}
        if evidence not in current["evidence"]:
            current["evidence"].append(deepcopy(evidence))
        current.pop("effectiveProfile", None)
        rule = _role_rule(cid, current, effective_rules, summary["warnings"]) if element_compatible else None
        if not element_compatible and (effective_rules or {}).get(cid):
            summary["warnings"].append(f"{cid}: effective_rule_context_changed")
        if rule:
            current["effectiveProfile"] = {"keys": list(rule["effective_keys"]), "ruleId": rule["rule_id"], "method": "role_rule"}
        discs = observed.get("driveDiscs")
        if discs is not None:
            _sequence(discs)
            slots = [disc.get("slot") for disc in discs]
            if len(set(slots)) != len(slots) or any(isinstance(slot, bool) or slot not in range(1, 7) for slot in slots):
                raise ValueError("Invalid normalized ZZZ drive disc slots")
            old_discs = {disc["slot"]: disc for disc in (previous.get("driveDiscs") or [])} if previous else {}
            current["driveDiscs"] = [
                _merge_disc(cid, disc, old_discs.get(disc["slot"]), evidence, sid, rule, summary)
                for disc in discs
            ]
            if len(discs) != 6:
                summary["warnings"].append(f"{cid}: partial_equipped_disc_loadout")
        else:
            current["driveDiscs"] = None
            summary["warnings"].append(f"{cid}: unknown_equipped_disc_loadout")
        if previous is None:
            characters.append(current)
            by_id[cid] = current
            summary["added"] += 1
        else:
            target = characters.index(previous)
            characters[target] = current
            by_id[cid] = current
            summary["unchanged" if current == previous else "updated"] += 1
        by_api[api_id] = current
        name_key = _name_key(current["name"])
        bucket = by_name.setdefault(name_key, [])
        bucket[:] = [item for item in bucket if item["id"] != cid]
        bucket.append(current)
    summary["preserved_not_in_snapshot"] = len(set(by_id) - matched_ids)
    return candidate, summary
