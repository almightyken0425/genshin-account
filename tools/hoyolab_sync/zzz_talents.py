"""Derive ordinary ZZZ skill bases from individually verified Mindscape rules.

Only normalized public data enters this helper. Source URLs and quotations live
in the local metadata file and are never inserted into the account snapshot.
"""
from functools import lru_cache
import json
from pathlib import Path


GENERAL_SKILLS = ("普通攻擊", "閃避", "支援技", "特殊技", "連攜技")


@lru_cache(maxsize=1)
def _load_rules():
    return json.loads((Path(__file__).parent / "data" / "zzz_talent_rules.json").read_text())


def _base_levels(character, rule):
    unknown = {key: None for key in GENERAL_SKILLS}
    context = character.get("skillContext")
    if not isinstance(context, dict) or context.get("provider") != "hoyolab" or context.get("levelSemantics") != "provider_displayed":
        return unknown
    if not isinstance(rule, dict) or rule.get("all_mindscape_level_effects_accounted_for") is not True:
        return unknown
    if rule.get("mindscapes_reviewed") != [1, 2, 3, 4, 5, 6]:
        return unknown
    boosts = rule.get("boosts")
    unboosted = rule.get("unboosted_skill_keys")
    if not isinstance(boosts, list) or not isinstance(unboosted, list) or any(key not in GENERAL_SKILLS for key in unboosted):
        return unknown
    covered, seen_ranks = set(unboosted), set()
    for boost in boosts:
        if not isinstance(boost, dict):
            return unknown
        rank, amount, targets = boost.get("mindscape"), boost.get("amount"), boost.get("targets")
        if (
            isinstance(rank, bool) or not isinstance(rank, int) or rank not in range(1, 7) or rank in seen_ranks
            or isinstance(amount, bool) or not isinstance(amount, int) or not 1 <= amount <= 20
            or not isinstance(targets, list) or not targets or any(key not in GENERAL_SKILLS for key in targets)
            or len(set(targets)) != len(targets)
        ):
            return unknown
        seen_ranks.add(rank)
        covered.update(targets)
    if set(unboosted) & {key for boost in boosts for key in boost["targets"]}:
        return unknown
    skills = character.get("skills")
    if not isinstance(skills, dict):
        return unknown
    mindscape = character.get("mindscape")
    rank_known = not isinstance(mindscape, bool) and isinstance(mindscape, int) and 0 <= mindscape <= 6
    result = dict(unknown)
    for key in GENERAL_SKILLS:
        displayed = skills.get(key)
        if key not in covered or isinstance(displayed, bool) or not isinstance(displayed, int):
            continue
        applicable = [boost for boost in boosts if key in boost["targets"]]
        if applicable and not rank_known:
            continue
        offset = sum(boost["amount"] for boost in applicable if mindscape >= boost["mindscape"])
        base = displayed - offset
        if 1 <= base <= 12:
            result[key] = base
    return result


def apply_zzz_skill_bases(game):
    """Update sanitized game.characters[*].skillsBase in place and return game.

    Each agent requires its own verified API-ID rule. Unknown ranks, unreviewed
    rules, invalid displayed levels, and impossible derived levels stay null.
    Explicitly unboosted fields do not depend on knowing the Mindscape rank.
    Core skill values and the original displayed skills are left untouched.
    """
    if not isinstance(game, dict) or game.get("complete") is not True or not isinstance(game.get("characters"), list):
        raise ValueError("ZZZ skill bases require a complete normalized game")
    rules = _load_rules()["characters"]
    for character in game["characters"]:
        if not isinstance(character, dict):
            raise ValueError("Normalized ZZZ character must be an object")
        api_id = character.get("api_id")
        rule = rules.get(str(api_id)) if isinstance(api_id, int) and not isinstance(api_id, bool) else None
        character["skillsBase"] = _base_levels(character, rule)
    return game
