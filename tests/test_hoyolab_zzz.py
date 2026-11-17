"""Offline behavior tests for public-data normalization and evidence-aware ZZZ merge."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import unittest

from tools.hoyolab_sync import zzz

ROOT = Path(__file__).resolve().parents[1]
SOURCE = {"id": "sync_test_20261116", "retrieved_at": "2026-11-16T09:00:00+00:00", "path": "imports/hoyolab/sync_test_20261116.json", "sha256": "a" * 64}
META = {"characters": {"1001": {"id": "agent_test", "name": "測試角色"}}}


def prop(pid, value):
    return {"property_id": pid, "property_name": "provider label", "base": str(value)}


def raw_disc(slot=1):
    main = {1: prop(11103, 2200), 2: prop(12103, 316), 3: prop(13103, 184), 4: prop(31203, 92), 5: prop(31503, "30%"), 6: prop(30502, "60%")}[slot]
    return {"id": 330000 + slot, "level": 15, "name": "display disc name", "icon": "https://example.invalid/image.png", "rarity": "S", "equipment_type": slot, "main_properties": [main], "properties": [prop(11102, "3%"), prop(12102, "3%"), prop(20103, "2.4%"), prop(21103, "24%")], "equip_suit": {"suit_id": 330, "name": "測試套裝"}}


def raw_agent():
    return {"id": 1001, "name_mi18n": "測試", "full_name_mi18n": "測試角色·原始", "level": 60, "rank": 5, "rarity": "S", "element_type": 203, "avatar_profession": 1,
            "properties": [{"property_id": 1, "final": "10,000"}, {"property_id": 5, "final": "24%"}, {"property_id": 11, "final": "1.2"}],
            "skills": [{"skill_type": kind, "level": 7 if kind == 5 else 16} for kind in zzz.SKILLS],
            "weapon": {"id": 14001, "name": "測試音擎", "level": 60, "star": 2, "rarity": "S", "main_properties": [prop(12101, 713)], "properties": [prop(20103, "24%")], "talent_content": "do not keep HTML"},
            "equip": [raw_disc(slot) for slot in range(1, 7)], "uid": "PRIVATE-CANARY", "role_id": "PRIVATE-CANARY", "avatar_url": "https://private.invalid/PRIVATE-CANARY", "cookies": "PRIVATE-CANARY"}


def normalized():
    return zzz.normalize([raw_agent()], META)


def base_account():
    return {"schemaVersion": 1, "game": "zzz", "source": {"filename": "video.mp4", "sha256": "b" * 64, "durationSeconds": 1000, "capturedAt": None}, "characters": []}


def role_rule(**changes):
    rule = {"rule_id": "observed_role_v1", "effective_keys": ["攻擊力|percent", "暴擊率|percent", "暴擊傷害|percent"], "known_ineffective_keys": ["生命值|percent"], "complete": False, "weapon_name": "測試音擎", "mindscape": 5, "element": "電"}
    rule.update(changes)
    return {"agent_test": rule}


def old_character():
    row = normalized()["characters"][0]
    discs = []
    for original in row["driveDiscs"]:
        disc = {key: deepcopy(original[key]) for key in ("slot", "setName", "rarity", "level", "mainStat", "substats", "substatsComplete")}
        disc.update(id=f"agent_test_slot_{disc['slot']}_video001", effectiveRollCount=7, evidence=[{"timestampSec": 1, "framePath": "evidence/zzz/test.jpg", "sha256": "c" * 64}], uncertainties=[])
        for index, stat in enumerate(disc["substats"]):
            stat["enhancementCount"] = 4 if index == 3 else 0
            stat["isEffective"] = index > 0
        discs.append(disc)
    engine = deepcopy(row["wEngine"]); engine.pop("api_id"); engine["maxLevel"] = 60
    return {"id": "agent_test", "name": "測試角色", "level": 60, "mindscape": 5, "stats": {"生命值": 9000}, "statsEffective": {"生命值": False}, "skills": row["skills"], "wEngine": engine, "driveDiscs": discs, "element": "電", "specialty": "強攻", "evidence": [{"timestampSec": 1, "framePath": "evidence/zzz/test.jpg", "sha256": "c" * 64}], "uncertainties": []}


class NormalizeZZZTests(unittest.TestCase):
    def test_allowlist_excludes_identity_urls_html_and_extra_raw_fields(self):
        output = normalized()
        text = json.dumps(output, ensure_ascii=False)
        self.assertNotIn("PRIVATE-CANARY", text)
        self.assertNotIn("https://", text)
        self.assertNotIn("talent_content", text)
        self.assertEqual(output["characters"][0]["local_id"], "agent_test")
        self.assertTrue(output["complete"])

    def test_skill_levels_are_provider_displayed_without_double_mindscape_bonus(self):
        row = normalized()["characters"][0]
        self.assertEqual(row["skills"]["普通攻擊"], 16)
        self.assertEqual(row["skills"]["核心技"], "F")
        self.assertEqual(row["skillContext"]["coreRawLevel"], 7)
        self.assertEqual(set(row["skillsBase"].values()), {None})
        self.assertNotIn("核心技", row["skillsBase"])

    def test_core_mapping_all_seven_levels(self):
        for raw_level, expected in enumerate([0, "A", "B", "C", "D", "E", "F"], start=1):
            raw = raw_agent(); raw["skills"] = [{"skill_type": 5, "level": raw_level}]
            self.assertEqual(zzz.normalize([raw])["characters"][0]["skills"]["核心技"], expected)

    def test_stats_keep_percent_and_numeric_scales(self):
        row = normalized()["characters"][0]
        self.assertEqual(row["stats"], {"生命值": 10000, "暴擊率": "24%", "能量自動回復": 1.2})
        self.assertEqual(row["wEngine"]["stats"], {"基礎攻擊力": 713, "暴擊率": "24%"})
        self.assertIsNone(row["wEngine"]["maxLevel"])

    def test_sdk_python_field_aliases_are_supported(self):
        raw = raw_agent()
        raw["full_name"] = raw.pop("full_name_mi18n")
        raw["discs"] = raw.pop("equip")
        raw["w_engine"] = raw.pop("weapon")
        raw["w_engine"]["refinement"] = raw["w_engine"].pop("star")
        raw["skills"] = [{"type": 0, "level": 12}]
        raw["discs"][0]["position"] = raw["discs"][0].pop("equipment_type")
        self.assertEqual(zzz.normalize([raw])["characters"][0]["skills"]["普通攻擊"], 12)

    def test_unknown_ids_stay_unknown_and_disc_incomplete(self):
        raw = raw_agent(); raw["element_type"] = 987; raw["avatar_profession"] = 987
        raw["equip"][0]["properties"][0]["property_id"] = 999999
        row = zzz.normalize([raw])["characters"][0]
        self.assertIsNone(row["element"]); self.assertIsNone(row["specialty"])
        self.assertFalse(row["driveDiscs"][0]["substatsComplete"])

    def test_invalid_or_duplicate_structure_rejected_without_raw_values(self):
        for change in ("duplicate_agent", "duplicate_slot", "duplicate_skill", "bool_level", "bad_grouping", "nan", "bad_disc_level"):
            rows = [raw_agent()]
            if change == "duplicate_agent": rows.append(deepcopy(rows[0]))
            elif change == "duplicate_slot": rows[0]["equip"][1]["equipment_type"] = 1
            elif change == "duplicate_skill": rows[0]["skills"].append(deepcopy(rows[0]["skills"][0]))
            elif change == "bool_level": rows[0]["level"] = True
            elif change == "bad_grouping": rows[0]["properties"][0]["final"] = "1,2"
            elif change == "nan": rows[0]["properties"][0]["final"] = "NaN"
            elif change == "bad_disc_level": rows[0]["equip"][0]["level"] = 16
            with self.subTest(change=change), self.assertRaises(ValueError) as error:
                zzz.normalize(rows)
            self.assertNotIn("PRIVATE-CANARY", str(error.exception))


class RollDerivationTests(unittest.TestCase):
    def test_s_rank_exact_total_budget_3_and_4_initial(self):
        disc = normalized()["characters"][0]["driveDiscs"][0]
        self.assertEqual(zzz._derive_enhancements(disc), [0, 0, 0, 4])
        disc["substats"][-1]["value"] = 28.8
        self.assertEqual(zzz._derive_enhancements(disc), [0, 0, 0, 5])

    def test_zero_level_zero_enhancements_are_known(self):
        disc = normalized()["characters"][0]["driveDiscs"][0]
        disc["level"] = 0
        disc["substats"][-1]["value"] = 4.8
        self.assertEqual(zzz._derive_enhancements(disc), [0, 0, 0, 0])
        disc["substats"].pop()
        self.assertEqual(zzz._derive_enhancements(disc), [0, 0, 0])

    def test_unknown_rarity_and_bad_budgets_do_not_guess_counts(self):
        original = normalized()["characters"][0]["driveDiscs"][0]
        for label in ("A", "B", "unknown", "fraction", "low_total", "high_total", "missing", "incomplete", "illegal_level"):
            disc = deepcopy(original)
            if label in ("A", "B"): disc["rarity"] = label
            elif label == "unknown": disc["rarity"] = None
            elif label == "fraction": disc["substats"][0]["value"] = 4
            elif label == "low_total": disc["substats"][-1]["value"] = 4.8
            elif label == "high_total": disc["substats"][0]["value"] = 18
            elif label == "missing": disc["substats"][0]["value"] = None
            elif label == "incomplete": disc["substatsComplete"] = False
            elif label == "illegal_level": disc["level"] = 16
            with self.subTest(label=label): self.assertIsNone(zzz._derive_enhancements(disc))

    def test_all_228_observed_discs_match_rule_after_explicit_review(self):
        account = json.loads((ROOT / "data/zzz/account.json").read_text())
        tested = 0
        for character in account["characters"]:
            for disc in character.get("driveDiscs") or []:
                counts = zzz._derive_enhancements(disc)
                self.assertIsNotNone(counts, disc["id"])
                for stat, derived in zip(disc["substats"], counts):
                    expected = 1 if disc["id"] == "nekomata_slot_5_video001" and stat["name"] == "穿透值" else stat["enhancementCount"]
                    self.assertEqual(derived, expected, disc["id"])
                tested += 1
        self.assertEqual(tested, 228)


class MergeZZZTests(unittest.TestCase):
    def test_new_character_counts_are_derived_and_rule_is_separate(self):
        base = base_account(); before = deepcopy(base); norm = normalized(); norm_before = deepcopy(norm)
        candidate, summary = zzz.merge(base, norm, SOURCE, role_rule())
        row = candidate["characters"][0]; disc = row["driveDiscs"][0]
        self.assertEqual(base, before); self.assertEqual(norm, norm_before)
        self.assertEqual(candidate["source"], before["source"])
        self.assertEqual(candidate["schemaVersion"], 2)
        self.assertEqual(row["sync"], {"apiId": 1001, "sourceId": SOURCE["id"]})
        self.assertEqual(row["effectiveProfile"]["method"], "role_rule")
        self.assertTrue(all(s["isEffective"] is None for s in disc["substats"]))
        self.assertEqual([s["assessedEffective"] for s in disc["substats"]], [False, True, True, True])
        self.assertEqual(disc["effectiveRollCount"], 7)
        self.assertTrue(all(s["enhancementSource"] == "derived_fixed_roll" for s in disc["substats"]))
        self.assertEqual(summary["derived_substats"], 24)
        self.assertEqual(disc["evidence"], [{"sourceId": SOURCE["id"], "record": "/zzz/characters/0"}])
        self.assertNotIn("legacyObservation", row)

    def test_unchanged_disc_preserves_stable_id_and_observed_flags(self):
        base = base_account(); old = old_character(); base["characters"] = [old]
        candidate, summary = zzz.merge(base, normalized(), SOURCE, role_rule(effective_keys=["生命值|percent"], known_ineffective_keys=[]))
        row = candidate["characters"][0]; disc = row["driveDiscs"][0]
        self.assertEqual(row["id"], old["id"])
        self.assertEqual(row["legacyObservation"], old)
        self.assertEqual(disc["id"], old["driveDiscs"][0]["id"])
        self.assertEqual([s["isEffective"] for s in disc["substats"]], [False, True, True, True])
        self.assertEqual(disc["effectiveRollCount"], 7)
        self.assertEqual(disc["substats"][0]["assessedEffective"], True)
        self.assertEqual(disc["substats"][1]["assessedEffective"], None)
        self.assertEqual(len(disc["evidence"]), 2)
        self.assertEqual(row["wEngine"]["maxLevel"], 60)
        self.assertEqual(set(row["statsEffective"].values()), {None})
        self.assertEqual(summary["derived_substats"], 0)

    def test_changed_disc_does_not_inherit_observed_flags(self):
        base = base_account(); base["characters"] = [old_character()]
        norm = normalized(); norm["characters"][0]["driveDiscs"][0]["substats"][-1]["value"] = 28.8
        candidate, _ = zzz.merge(base, norm, SOURCE, role_rule())
        disc = candidate["characters"][0]["driveDiscs"][0]
        self.assertNotEqual(disc["id"], base["characters"][0]["driveDiscs"][0]["id"])
        self.assertTrue(all(s["isEffective"] is None for s in disc["substats"]))
        self.assertEqual(disc["substats"][-1]["enhancementCount"], 5)

    def test_unknown_rule_and_partially_observed_rule_stay_unknown(self):
        for rule in (None, role_rule(known_ineffective_keys=[])):
            candidate, _ = zzz.merge(base_account(), normalized(), SOURCE, rule)
            disc = candidate["characters"][0]["driveDiscs"][0]
            self.assertIsNone(disc["substats"][0]["assessedEffective"])
            self.assertIsNone(disc["effectiveRollCount"])
        candidate, _ = zzz.merge(base_account(), normalized(), SOURCE, role_rule(effective_keys=[], known_ineffective_keys=[]))
        self.assertNotIn("effectiveProfile", candidate["characters"][0])

    def test_rule_context_changes_and_conflicts_are_not_reused(self):
        for rule in (role_rule(weapon_name="other"), role_rule(mindscape=2), role_rule(element="火"), role_rule(known_ineffective_keys=["暴擊率|percent"])):
            candidate, summary = zzz.merge(base_account(), normalized(), SOURCE, rule)
            row = candidate["characters"][0]
            self.assertNotIn("effectiveProfile", row)
            self.assertNotIn("assessment", row["driveDiscs"][0])
            self.assertIsNone(row["driveDiscs"][0]["effectiveRollCount"])
            self.assertTrue(summary["warnings"])

    def test_known_zero_effective_count_does_not_need_unknown_rolls(self):
        norm = normalized(); norm["characters"][0]["driveDiscs"][0]["rarity"] = "A"
        candidate, _ = zzz.merge(base_account(), norm, SOURCE, role_rule(effective_keys=[], known_ineffective_keys=[], complete=True))
        disc = candidate["characters"][0]["driveDiscs"][0]
        self.assertEqual(disc["effectiveRollCount"], 0)
        self.assertTrue(all(s["enhancementCount"] is None for s in disc["substats"]))

    def test_later_sync_keeps_first_legacy_and_source_and_can_resync_new_character(self):
        for has_old in (False, True):
            base = base_account()
            if has_old: base["characters"] = [old_character()]
            first, _ = zzz.merge(base, normalized(), SOURCE, role_rule())
            source2 = {**SOURCE, "id": "sync_test_later", "path": "imports/hoyolab/sync_test_later.json", "sha256": "d" * 64}
            second, _ = zzz.merge(first, normalized(), source2, role_rule())
            row = second["characters"][0]
            self.assertEqual(len(second["syncSources"]), 2)
            if has_old: self.assertEqual(row["legacyObservation"], base["characters"][0])
            else: self.assertNotIn("legacyObservation", row)
            self.assertEqual(len(row["evidence"]), 1 + (2 if has_old else 1))

    def test_immutable_source_and_incomplete_snapshot_rejected(self):
        first, _ = zzz.merge(base_account(), normalized(), SOURCE)
        with self.assertRaises(ValueError): zzz.merge(first, normalized(), {**SOURCE, "sha256": "e" * 64})
        with self.assertRaises(ValueError): zzz.merge(base_account(), {"complete": False, "characters": []}, SOURCE)
        with self.assertRaises(ValueError): zzz.merge(base_account(), normalized(), {**SOURCE, "path": "../bad.json"})

    def test_pen_review_corrects_candidate_only_and_keeps_original_legacy(self):
        account = json.loads((ROOT / "data/zzz/account.json").read_text())
        current_record = next(c for c in account["characters"] if c["id"] == "nekomata")
        previous = deepcopy(current_record.get("legacyObservation", current_record))
        norm = normalized(); row = norm["characters"][0]
        row.update(local_id="nekomata", name=previous["name"], mindscape=previous["mindscape"], element=previous.get("element"))
        row["driveDiscs"] = [{**deepcopy(d), "api_id": 330000 + d["slot"], "set_id": 330} for d in previous["driveDiscs"]]
        for disc in row["driveDiscs"]:
            for stat in disc["substats"]:
                stat["enhancementCount"] = None; stat["isEffective"] = None
        base = base_account(); base["characters"] = [previous]
        candidate, summary = zzz.merge(base, norm, SOURCE)
        current = candidate["characters"][0]
        target = next(d for d in current["driveDiscs"] if d["slot"] == 5)
        stat = next(s for s in target["substats"] if s["name"] == "穿透值")
        self.assertEqual(stat["enhancementCount"], 1)
        self.assertEqual(stat["enhancementSource"], "game_observed")
        legacy = next(d for d in current["legacyObservation"]["driveDiscs"] if d["slot"] == 5)
        self.assertEqual(next(s for s in legacy["substats"] if s["name"] == "穿透值")["enhancementCount"], 0)
        self.assertIn(target["id"], summary["review_overrides"])

    def test_schema_accepts_the_sanitized_candidate(self):
        import jsonschema
        candidate, _ = zzz.merge(base_account(), normalized(), SOURCE, role_rule())
        schema = json.loads((ROOT / "schemas/zzz.account.schema.json").read_text())
        jsonschema.Draft202012Validator(schema).validate(candidate)


class IdentityAliasTests(unittest.TestCase):
    def test_normalize_keeps_public_short_and_full_aliases(self):
        raw = raw_agent()
        raw["name_mi18n"] = "蕾米埃爾"
        raw["full_name_mi18n"] = "蕾米埃爾・丹"
        row = zzz.normalize([raw])["characters"][0]
        self.assertEqual(row["aliases"], ["蕾米埃爾", "蕾米埃爾・丹"])
        raw["full_name_mi18n"] = raw["name_mi18n"]
        self.assertEqual(zzz.normalize([raw])["characters"][0]["aliases"], ["蕾米埃爾"])

    def test_first_sync_short_or_full_name_reuses_id_and_formal_display_name(self):
        for formal, short, full in [
            ("蕾米埃爾", "蕾米埃爾", "蕾米埃爾・丹"),
            ("簡・杜", "簡", "簡·杜"),
            ("維琳娜・艾嘉德", "維琳娜", "維琳娜·艾嘉德"),
        ]:
            raw = raw_agent(); raw["name_mi18n"] = short; raw["full_name_mi18n"] = full
            norm = zzz.normalize([raw])
            original = old_character(); original["id"] = "existing_agent"; original["name"] = formal
            base = base_account(); base["characters"] = [original]
            candidate, summary = zzz.merge(base, norm, SOURCE)
            with self.subTest(formal=formal):
                self.assertEqual(len(candidate["characters"]), 1)
                self.assertEqual(candidate["characters"][0]["id"], "existing_agent")
                self.assertEqual(candidate["characters"][0]["name"], formal)
                self.assertEqual(summary["added"], 0)
                self.assertEqual(norm["characters"][0]["name"], full)

    def test_aliases_matching_two_existing_characters_abort_without_mutation(self):
        raw = raw_agent(); raw["name_mi18n"] = "蕾米埃爾"; raw["full_name_mi18n"] = "蕾米埃爾・丹"
        first = old_character(); first.update(id="first", name="蕾米埃爾")
        second = old_character(); second.update(id="second", name="蕾米埃爾・丹")
        base = base_account(); base["characters"] = [first, second]; before = deepcopy(base)
        with self.assertRaises(ValueError): zzz.merge(base, zzz.normalize([raw]), SOURCE)
        self.assertEqual(base, before)

    def test_names_are_not_matched_by_prefix(self):
        raw = raw_agent(); raw["name_mi18n"] = "蕾米"; raw["full_name_mi18n"] = "蕾米埃爾・丹Ⅱ"
        old = old_character(); old.update(id="existing_agent", name="蕾米埃爾・丹")
        base = base_account(); base["characters"] = [old]
        candidate, summary = zzz.merge(base, zzz.normalize([raw]), SOURCE)
        self.assertEqual(len(candidate["characters"]), 2)
        self.assertEqual(summary["added"], 1)

    def test_unknown_api_identity_keeps_confirmed_values_and_role_context(self):
        raw = raw_agent(); raw["element_type"] = 9999; raw["avatar_profession"] = 9999
        norm = zzz.normalize([raw], META); before = deepcopy(norm)
        base = base_account(); base["characters"] = [old_character()]
        candidate, summary = zzz.merge(base, norm, SOURCE, role_rule())
        current = candidate["characters"][0]
        self.assertEqual(current["element"], "電")
        self.assertEqual(current["specialty"], "強攻")
        self.assertEqual(current["effectiveProfile"]["ruleId"], "observed_role_v1")
        self.assertIsNone(norm["characters"][0]["element"])
        self.assertIsNone(norm["characters"][0]["specialty"])
        self.assertEqual(norm, before)
        self.assertIn("agent_test: unknown_provider_element_retained_identity", summary["warnings"])
        self.assertIn("agent_test: unknown_provider_specialty_retained_identity", summary["warnings"])

    def test_known_changed_element_still_invalidates_old_role_context(self):
        raw = raw_agent(); raw["element_type"] = 201
        base = base_account(); base["characters"] = [old_character()]
        candidate, summary = zzz.merge(base, zzz.normalize([raw], META), SOURCE, role_rule())
        current = candidate["characters"][0]
        self.assertEqual(current["element"], "電")
        self.assertNotIn("effectiveProfile", current)
        self.assertIn("agent_test: provider_element_parent_mismatch_retained_identity", summary["warnings"])
        self.assertIn("agent_test: effective_rule_context_changed", summary["warnings"])


class CanonicalSnapshotAndTraceTests(unittest.TestCase):
    @staticmethod
    def source_for(snapshot):
        from tools.hoyolab_sync.publisher import encoded
        digest = hashlib.sha256(encoded({"zzz": snapshot})).hexdigest()
        source_id = "hoyolab_" + digest[:16]
        return {"id": source_id, "retrieved_at": SOURCE["retrieved_at"], "path": "imports/hoyolab/" + source_id + ".json", "sha256": digest}

    def test_reordered_rows_properties_discs_skills_and_substats_have_identical_proof(self):
        from tools.hoyolab_sync.publisher import encoded
        first = raw_agent()
        first["weapon"]["properties"].append(prop(12102, "30%"))
        second = deepcopy(first); second.update(id=1002, name_mi18n="另一角色", full_name_mi18n="另一角色全名")
        rows = [first, second]
        reordered = deepcopy(rows)[::-1]
        for row in reordered:
            row["properties"].reverse()
            row["skills"].reverse()
            row["equip"].reverse()
            row["weapon"]["properties"].reverse()
            row["weapon"]["main_properties"].reverse()
            for disc in row["equip"]:
                disc["properties"].reverse()
        normalized_first = zzz.normalize(rows)
        normalized_reordered = zzz.normalize(reordered)
        self.assertEqual(encoded(normalized_first), encoded(normalized_reordered))
        self.assertEqual(self.source_for(normalized_first), self.source_for(normalized_reordered))
        before, _ = zzz.merge(base_account(), normalized_first, self.source_for(normalized_first))
        after, summary = zzz.merge(before, normalized_reordered, self.source_for(normalized_reordered))
        self.assertEqual(after, before)
        self.assertEqual(summary["updated"], 0)
        self.assertEqual(summary["added"], 0)
        self.assertEqual(summary["unchanged"], 2)

    def test_changed_slot_gets_new_observation_id_and_all_old_sources_remain_traceable(self):
        original = old_character()
        base = base_account(); base["characters"] = [original]
        proofs = {}
        first_snapshot = normalized()
        first_source = self.source_for(first_snapshot)
        proofs[first_source["id"]] = {"zzz": deepcopy(first_snapshot)}
        first, _ = zzz.merge(base, first_snapshot, first_source)
        first_id = first["characters"][0]["driveDiscs"][0]["id"]
        self.assertEqual(first_id, original["driveDiscs"][0]["id"])
        changed_snapshot = deepcopy(first_snapshot)
        changed_snapshot["characters"][0]["driveDiscs"][0]["substats"][-1]["value"] = 28.8
        changed_source = self.source_for(changed_snapshot)
        proofs[changed_source["id"]] = {"zzz": deepcopy(changed_snapshot)}
        changed, _ = zzz.merge(first, changed_snapshot, changed_source)
        changed_disc = changed["characters"][0]["driveDiscs"][0]
        self.assertNotEqual(changed_disc["id"], first_id)
        self.assertEqual(changed_disc["evidence"], [{"sourceId": changed_source["id"], "record": "/zzz/characters/0"}])
        self.assertTrue(all(stat["isEffective"] is None for stat in changed_disc["substats"]))
        reverted_snapshot = deepcopy(first_snapshot)
        # Another panel field changed while this slot returned to earlier values.
        # This creates a genuinely different content-addressed source document.
        reverted_snapshot["characters"][0]["stats"]["生命值"] = 10001
        reverted_source = self.source_for(reverted_snapshot)
        proofs[reverted_source["id"]] = {"zzz": deepcopy(reverted_snapshot)}
        reverted, _ = zzz.merge(changed, reverted_snapshot, reverted_source)
        current = reverted["characters"][0]
        self.assertNotIn(current["driveDiscs"][0]["id"], [first_id, changed_disc["id"]])
        self.assertEqual(current["legacyObservation"], original)
        self.assertEqual(current["legacyObservation"]["driveDiscs"][0]["evidence"], original["driveDiscs"][0]["evidence"])
        self.assertEqual([row["id"] for row in reverted["syncSources"]], [first_source["id"], changed_source["id"], reverted_source["id"]])
        for evidence in current["evidence"]:
            if "sourceId" in evidence:
                proof = proofs[evidence["sourceId"]]
                game, characters, index = evidence["record"].strip("/").split("/")
                self.assertEqual(proof[game][characters][int(index)]["api_id"], 1001)
        previous_proof = proofs[changed_source["id"]]["zzz"]["characters"][0]["driveDiscs"][0]
        self.assertEqual(previous_proof["substats"][-1]["value"], 28.8)
        self.assertEqual(first["characters"][0]["driveDiscs"][0]["substats"][-1]["value"], 24)

    def test_two_new_api_ids_with_the_same_exact_identity_cannot_create_duplicates(self):
        first = raw_agent(); second = deepcopy(first); second["id"] = 1002
        base = base_account(); before = deepcopy(base)
        with self.assertRaises(ValueError):
            zzz.merge(base, zzz.normalize([first, second]), SOURCE)
        self.assertEqual(base, before)


class QuotedDisplayNameTests(unittest.TestCase):
    def test_api_1041_paired_wrapper_matches_existing_soldier_11(self):
        for label in ("「11號」", "『11號』"):
            raw = raw_agent(); raw.update(id=1041, name_mi18n=label, full_name_mi18n=label)
            proof = zzz.normalize([raw])
            old = old_character(); old.update(id="soldier_11", name="11號")
            base = base_account(); base["characters"] = [old]
            candidate, summary = zzz.merge(base, proof, SOURCE)
            with self.subTest(label=label):
                self.assertEqual(len(candidate["characters"]), 1)
                self.assertEqual(candidate["characters"][0]["id"], "soldier_11")
                self.assertEqual(candidate["characters"][0]["name"], "11號")
                self.assertEqual(candidate["characters"][0]["sync"]["apiId"], 1041)
                self.assertEqual(proof["characters"][0]["aliases"], [label])
                self.assertEqual(summary["added"], 0)

    def test_unpaired_or_internal_quotes_are_not_removed(self):
        for label in ("「11號", "11號」", "『11號", "11號』", "11「號」", "11『號』"):
            with self.subTest(label=label):
                self.assertNotEqual(zzz._name_key(label), zzz._name_key("11號"))
        self.assertEqual(zzz._name_key("「11「號」」"), "11「號」")

    def test_multiple_existing_names_with_the_same_wrapped_key_abort(self):
        raw = raw_agent(); raw.update(id=1041, name_mi18n="「11號」", full_name_mi18n="「11號」")
        one = old_character(); one.update(id="soldier_11", name="11號")
        two = deepcopy(one); two.update(id="duplicate", name="『11號』")
        base = base_account(); base["characters"] = [one, two]; before = deepcopy(base)
        with self.assertRaises(ValueError): zzz.merge(base, zzz.normalize([raw]), SOURCE)
        self.assertEqual(base, before)


class ElementIdentityCompatibilityTests(unittest.TestCase):
    def test_confirmed_fine_subtypes_survive_generic_api_parent(self):
        for confirmed, api_element, parent in (("烈霜", 202, "冰"), ("玄墨", 205, "以太"), ("凜刃", 200, "物理")):
            raw = raw_agent(); raw["element_type"] = api_element
            proof = zzz.normalize([raw], META)
            base = base_account(); old = old_character(); old["element"] = confirmed; base["characters"] = [old]
            candidate, summary = zzz.merge(base, proof, SOURCE, role_rule(element=parent))
            with self.subTest(confirmed=confirmed):
                current = candidate["characters"][0]
                self.assertEqual(current["element"], confirmed)
                self.assertEqual(current["legacyObservation"]["element"], confirmed)
                self.assertEqual(proof["characters"][0]["element"], parent)
                self.assertIn("effectiveProfile", current)
                self.assertFalse(any("element" in warning or "context_changed" in warning for warning in summary["warnings"]))

    def test_formal_attribute_wording_is_kept_and_rule_uses_canonical_parent(self):
        for confirmed, api_element, parent in (("冰屬性", 202, "冰"), ("電屬性", 203, "電"), ("火屬性", 201, "火"), ("風屬性", 204, "風")):
            raw = raw_agent(); raw["element_type"] = api_element
            base = base_account(); old = old_character(); old["element"] = confirmed; base["characters"] = [old]
            candidate, summary = zzz.merge(base, zzz.normalize([raw], META), SOURCE, role_rule(element=parent))
            with self.subTest(confirmed=confirmed):
                self.assertEqual(candidate["characters"][0]["element"], confirmed)
                self.assertIn("effectiveProfile", candidate["characters"][0])
                self.assertFalse(summary["warnings"])

    def test_new_unmatched_agent_adopts_api_generic_category(self):
        raw = raw_agent(); raw["element_type"] = 202
        candidate, _ = zzz.merge(base_account(), zzz.normalize([raw], META), SOURCE)
        self.assertEqual(candidate["characters"][0]["element"], "冰")

    def test_true_parent_conflict_retains_confirmed_identity_and_invalidates_rule(self):
        raw = raw_agent(); raw["element_type"] = 201
        base = base_account(); old = old_character(); old["element"] = "烈霜"; base["characters"] = [old]
        candidate, summary = zzz.merge(base, zzz.normalize([raw], META), SOURCE, role_rule(element="冰"))
        self.assertEqual(candidate["characters"][0]["element"], "烈霜")
        self.assertNotIn("effectiveProfile", candidate["characters"][0])
        self.assertIn("agent_test: provider_element_parent_mismatch_retained_identity", summary["warnings"])

    def test_unknown_confirmed_parent_is_not_guessed_from_api(self):
        base = base_account(); old = old_character(); old["element"] = "未定細分類"; base["characters"] = [old]
        candidate, summary = zzz.merge(base, normalized(), SOURCE, role_rule(element="未定細分類"))
        self.assertEqual(candidate["characters"][0]["element"], "未定細分類")
        self.assertNotIn("effectiveProfile", candidate["characters"][0])
        self.assertIn("agent_test: unknown_element_parent_retained_identity", summary["warnings"])


class VerifiedWEngineAliasTests(unittest.TestCase):
    @staticmethod
    def paired_observations():
        base = base_account(); old = old_character()
        old["wEngine"]["name"] = "福虎爐爐"
        base["characters"] = [old]
        raw = raw_agent(); raw["weapon"]["id"] = 14139; raw["weapon"]["name"] = "福虓爐爐"
        return base, zzz.normalize([raw], META)

    def test_verified_alias_keeps_cap_and_rule_but_candidate_keeps_api_canonical_name(self):
        base, proof = self.paired_observations()
        candidate, summary = zzz.merge(base, proof, SOURCE, role_rule(weapon_name="福虎爐爐"))
        current = candidate["characters"][0]
        self.assertEqual(current["wEngine"]["name"], "福虓爐爐")
        self.assertEqual(current["wEngine"]["maxLevel"], 60)
        self.assertIn("effectiveProfile", current)
        self.assertFalse(any("context" in warning for warning in summary["warnings"]))
        self.assertEqual(current["legacyObservation"]["wEngine"]["name"], "福虎爐爐")
        self.assertEqual(current["skillsBase"], proof["characters"][0]["skillsBase"])
        entry = next(e for e in zzz._metadata()["weapon_name_aliases"] if e["template_id"] == 14139)
        self.assertEqual(entry["official_entry_id"], 851)
        self.assertTrue(entry["checked_at"])

    def test_any_other_engine_change_prevents_cap_inheritance(self):
        for field, value in (("level", 50), ("rarity", "A"), ("refinement", 1), ("stats", {"基礎攻擊力": 714, "暴擊率": "24%"})):
            base, proof = self.paired_observations()
            proof["characters"][0]["wEngine"][field] = value
            candidate, _ = zzz.merge(base, proof, SOURCE, role_rule(weapon_name="福虎爐爐"))
            with self.subTest(field=field):
                self.assertIsNone(candidate["characters"][0]["wEngine"]["maxLevel"])

    def test_missing_engine_fields_do_not_prove_equivalence(self):
        base, proof = self.paired_observations()
        base["characters"][0]["wEngine"]["stats"] = None
        proof["characters"][0]["wEngine"]["stats"] = None
        candidate, _ = zzz.merge(base, proof, SOURCE)
        self.assertIsNone(candidate["characters"][0]["wEngine"]["maxLevel"])

    def test_alias_does_not_generalize_a_character_replacement(self):
        self.assertEqual(zzz._weapon_name_key("福虎爐爐"), "福虓爐爐")
        self.assertEqual(zzz._weapon_name_key("其他虎爐"), "其他虎爐")
        self.assertNotEqual(zzz._weapon_name_key("福虎爐爐改"), zzz._weapon_name_key("福虓爐爐改"))
        base, proof = self.paired_observations()
        base["characters"][0]["wEngine"]["name"] = "福虎爐爐改"
        proof["characters"][0]["wEngine"]["name"] = "福虓爐爐改"
        candidate, summary = zzz.merge(base, proof, SOURCE, role_rule(weapon_name="福虎爐爐改"))
        self.assertIsNone(candidate["characters"][0]["wEngine"]["maxLevel"])
        self.assertNotIn("effectiveProfile", candidate["characters"][0])
        self.assertIn("agent_test: effective_rule_context_changed", summary["warnings"])

    def test_unknown_previous_weapon_is_new_confirmation_not_a_weapon_change(self):
        candidate, summary = zzz.merge(base_account(), normalized(), SOURCE, role_rule(weapon_name=None))
        self.assertNotIn("effectiveProfile", candidate["characters"][0])
        self.assertIn("agent_test: effective_rule_context_unknown_new_weapon_confirmed", summary["warnings"])
        self.assertNotIn("agent_test: effective_rule_context_changed", summary["warnings"])

    def test_two_unknown_context_values_are_not_confirmed_equal(self):
        proof = normalized(); proof["characters"][0]["wEngine"]["name"] = None
        candidate, summary = zzz.merge(base_account(), proof, SOURCE, role_rule(weapon_name=None))
        self.assertNotIn("effectiveProfile", candidate["characters"][0])
        self.assertIn("agent_test: effective_rule_context_unknown", summary["warnings"])


if __name__ == "__main__":
    unittest.main()
