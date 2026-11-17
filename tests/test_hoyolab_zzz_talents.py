"""Offline checks for per-agent, officially sourced ZZZ skill-base derivation."""
from copy import deepcopy
import json
from pathlib import Path
import unittest

from tools.hoyolab_sync import zzz_talents as talents
from tools.hoyolab_sync.zzz import apply_zzz_skill_bases, normalize

ROOT = Path(__file__).resolve().parents[1]
KEYS = ("普通攻擊", "閃避", "支援技", "特殊技", "連攜技")


def agent(api_id=1011, rank=0, displayed=12):
    return {"api_id": api_id, "mindscape": rank, "skills": {**{key: displayed for key in KEYS}, "核心技": "F"}, "skillContext": {"provider": "hoyolab", "levelSemantics": "provider_displayed", "coreRawLevel": 7}, "skillsBase": {key: None for key in KEYS}, "wEngine": {"name": "留存音擎"}, "driveDiscs": [{"slot": 1}], "aliases": ["公開別名"]}


def game(*characters):
    return {"complete": True, "characters": list(characters)}


class VerifiedTalentRuleMetadataTests(unittest.TestCase):
    def test_38_individual_rules_have_complete_rank_reviews_and_explicit_sources(self):
        data = talents._load_rules()
        self.assertEqual(len(data["characters"]), 38)
        self.assertEqual(data["review_scope"]["official_localizations"], 88)
        self.assertEqual(data["based_on_commit"], "c2b910c8d672e6d313ba67821c3af18775831cd9")
        self.assertEqual(data["provider_level_semantics"]["value"], "provider_displayed")
        self.assertEqual(len(data["provider_level_semantics"]["sdk_commit"]), 40)
        for api_id, rule in data["characters"].items():
            with self.subTest(api_id=api_id):
                self.assertTrue(rule["all_mindscape_level_effects_accounted_for"])
                self.assertEqual(rule["mindscapes_reviewed"], [1, 2, 3, 4, 5, 6])
                self.assertEqual([boost["mindscape"] for boost in rule["boosts"]], [3, 5])
                for boost in rule["boosts"]:
                    self.assertEqual(boost["amount"], 2)
                    self.assertEqual(set(boost["targets"]), set(KEYS))
                    self.assertNotIn("核心技", boost["targets"])
                    source = next(s for s in rule["sources"] if s["language"] == boost["source_language"])
                    self.assertEqual(source["entry_id"], boost["source_entry_id"])
                    self.assertTrue(source["url"].startswith("https://wiki.hoyolab.com/pc/zzz/entry/"))
                    self.assertEqual(len(source["raw_sha256"]), 64)
                self.assertEqual(rule["checked_at"], "2026-11-16")

    def test_ben_assist_uses_explicit_english_source_despite_chinese_omission(self):
        rule = next(r for r in talents._load_rules()["characters"].values() if r["local_id"] == "ben")
        for boost in rule["boosts"]:
            self.assertEqual(boost["source_language"], "en-us")
            self.assertIn("支援技", boost["targets"])
        english = next(s for s in rule["sources"] if s["language"] == "en-us")
        self.assertTrue(all("支援技" in effect["targets"] for effect in english["rank_effects"]))
        self.assertNotIn("mindscape_boost_excerpts", english)
        self.assertTrue(rule["localization_notes"])


class SkillBaseDerivationTests(unittest.TestCase):
    def test_all_38_agents_m0_m1_and_m2_equal_displayed(self):
        for api_id in talents._load_rules()["characters"]:
            for rank in (0, 1, 2):
                data = game(agent(int(api_id), rank, 12))
                apply_zzz_skill_bases(data)
                with self.subTest(api_id=api_id, rank=rank):
                    self.assertEqual(data["characters"][0]["skillsBase"], {key: 12 for key in KEYS})

    def test_all_38_agents_verified_m3_m4_and_m5_m6_offsets(self):
        for api_id in talents._load_rules()["characters"]:
            for rank, displayed in ((3, 14), (4, 14), (5, 16), (6, 16)):
                data = game(agent(int(api_id), rank, displayed))
                apply_zzz_skill_bases(data)
                with self.subTest(api_id=api_id, rank=rank):
                    self.assertEqual(data["characters"][0]["skillsBase"], {key: 12 for key in KEYS})

    def test_only_base_fields_change_and_restore_application_is_idempotent(self):
        data = game(agent(1011, 6, 16)); before = deepcopy(data)
        self.assertIs(apply_zzz_skill_bases(data), data)
        current = data["characters"][0]
        self.assertEqual({k: v for k, v in current.items() if k != "skillsBase"}, {k: v for k, v in before["characters"][0].items() if k != "skillsBase"})
        first = deepcopy(data)
        apply_zzz_skill_bases(data)
        self.assertEqual(first, data)
        self.assertNotIn("https://", json.dumps(data))
        self.assertEqual(current["skills"]["核心技"], "F")
        self.assertEqual(current["skillContext"]["coreRawLevel"], 7)
        self.assertNotIn("核心技", current["skillsBase"])

    def test_unknown_agent_or_unknown_applicable_rank_stays_null(self):
        for api_id, rank in ((999999, 0), (1011, None), (1011, True), (1011, -1), (1011, 7)):
            data = game(agent(api_id, rank, 12)); data["characters"][0]["skillsBase"] = {key: 9 for key in KEYS}
            apply_zzz_skill_bases(data)
            with self.subTest(api_id=api_id, rank=rank):
                self.assertEqual(set(data["characters"][0]["skillsBase"].values()), {None})

    def test_unknown_or_impossible_displayed_values_do_not_become_fake_bases(self):
        for invalid in (None, True, "16", 16.0, 0, 3, 20):
            row = agent(1011, 6, 16); row["skills"]["支援技"] = invalid
            data = game(row); apply_zzz_skill_bases(data)
            with self.subTest(value=invalid):
                self.assertIsNone(row["skillsBase"]["支援技"])
                self.assertEqual(row["skillsBase"]["普通攻擊"], 12)

    def test_missing_displayed_semantics_or_incomplete_rule_cannot_infer(self):
        rule = deepcopy(talents._load_rules()["characters"]["1011"])
        for alteration in ("context", "review", "ranks"):
            row = agent(); changed_rule = deepcopy(rule)
            if alteration == "context": row["skillContext"]["levelSemantics"] = "unknown"
            elif alteration == "review": changed_rule["all_mindscape_level_effects_accounted_for"] = False
            else: changed_rule["mindscapes_reviewed"] = [3, 5]
            with self.subTest(alteration=alteration):
                self.assertEqual(set(talents._base_levels(row, changed_rule).values()), {None})

    def test_explicitly_unboosted_field_equals_displayed_with_unknown_rank(self):
        rule = deepcopy(talents._load_rules()["characters"]["1011"])
        for boost in rule["boosts"]: boost["targets"].remove("支援技")
        rule["unboosted_skill_keys"] = ["支援技"]
        result = talents._base_levels(agent(1011, None, 12), rule)
        self.assertEqual(result["支援技"], 12)
        self.assertTrue(all(result[key] is None for key in KEYS if key != "支援技"))

    def test_raw_normalization_calls_the_same_verified_helper(self):
        raw = {"id": 1011, "name_mi18n": "安比", "full_name_mi18n": "安比・德瑪拉", "rank": 6, "level": 60, "skills": [{"skill_type": key, "level": 7 if key == 5 else 16} for key in (0, 2, 6, 1, 3, 5)]}
        result = normalize([raw])
        self.assertEqual(result["characters"][0]["skillsBase"], {key: 12 for key in KEYS})
        self.assertEqual(result["characters"][0]["skills"]["核心技"], "F")

    def test_formal_account_shape_is_not_silently_modified(self):
        formal = {"schemaVersion": 2, "game": "zzz", "characters": [agent()]}; before = deepcopy(formal)
        with self.assertRaises(ValueError): apply_zzz_skill_bases(formal)
        self.assertEqual(formal, before)


if __name__ == "__main__":
    unittest.main()
