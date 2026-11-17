"""Public-mechanics assessments stay separate, sourced, and equipment-bound."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).parents[1]
RULES = json.loads((ROOT/'tools/hoyolab_sync/data/effective_rules.json').read_text())
SOURCES = json.loads((ROOT/'tools/hoyolab_sync/data/genshin_effective_sources.json').read_text())
KEYS = {'hp', 'hp_pct', 'atk', 'atk_pct', 'def', 'def_pct', 'em', 'crit_rate', 'crit_dmg', 'energy_recharge'}
NEW_IDS = {10000006, 10000016, 10000020, 10000021, 10000024, 10000035, 10000036,
           10000044, 10000045, 10000048, 10000050, 10000053, 10000055, 10000056,
           10000059, 10000061, 10000064, 10000068, 10000069, 10000072, 10000077,
           10000079, 10000080, 10000081, 10000083, 10000085, 10000092, 10000097,
           10000100, 10000108, 10000113, 10000115, 10000117, 10000118, 10000124,
           10000137}


def rule(api_id):
    return RULES['genshin']['arosha' if api_id == 10000148 else 'hoyolab_character_'+str(api_id)]


class GenshinEffectiveRulesTests(unittest.TestCase):
    def test_all_new_characters_and_four_constellation_arosha_have_public_source_records(self):
        self.assertEqual({row['api_id'] for row in SOURCES['rules']}, NEW_IDS | {10000148})
        for row in SOURCES['rules']:
            current = rule(row['api_id'])
            self.assertEqual(current['source_record_id'], row['id'])
            self.assertEqual(current['method'], 'public_mechanics_equipment_assessment')
            self.assertNotIn('evidence_refs', current)
            self.assertTrue(current['role_label'])
            self.assertEqual(current['checked_at'], '2026-11-16')
            self.assertTrue(current['applicable_version'])
            self.assertTrue(current['notes'])
            for source in row['sources']:
                self.assertEqual(source['kind'], 'official_hoyowiki')
                self.assertIn('/entry/'+source['entry_id'], source['url'])
                self.assertRegex(source['payload_sha256'], r'^[a-f0-9]{64}$')

    def test_known_and_conditional_keys_are_disjoint_and_complete_means_all_ten_are_classified(self):
        for row in SOURCES['rules']:
            current = rule(row['api_id'])
            positive, negative = set(current['effective_keys']), set(current['known_ineffective_keys'])
            conditional = {value['key'] for value in current.get('conditional', [])}
            self.assertFalse(positive & negative)
            self.assertFalse((positive | negative) & conditional)
            self.assertTrue((positive | negative | conditional) <= KEYS)
            if current['complete']:
                self.assertEqual(positive | negative, KEYS)
            if current['confidence'] != 'unknown':
                self.assertEqual(positive | negative | conditional, KEYS)
            for condition in current.get('conditional', []):
                self.assertIsNone(condition['assessment'])
                self.assertTrue(condition['reason'])

    def test_role_derived_from_gear_is_bound_to_main_stats_and_sets_but_not_upgrade_values(self):
        for row in SOURCES['rules']:
            current = rule(row['api_id'])
            context = current['artifact_context']
            self.assertEqual([piece['slot'] for piece in context], sorted(piece['slot'] for piece in context))
            self.assertEqual(len({piece['slot'] for piece in context}), len(context))
            for piece in context:
                self.assertEqual(set(piece), {'slot', 'set_name', 'main_stat_key'})
            self.assertIn(current['constellation'], range(7))
            self.assertTrue(current['weapon_name'])
            self.assertIn(current['element'], {'pyro', 'hydro', 'anemo', 'electro', 'dendro', 'cryo', 'geo'})
        self.assertIn({'slot': 'sands', 'set_name': '黃金劇團', 'main_stat_key': 'energy_recharge'}, rule(10000148)['artifact_context'])

    def test_four_constellation_arosha_is_attack_healer_and_not_arlecchino_or_hp_healer(self):
        current = rule(10000148)
        self.assertEqual((current['constellation'], current['weapon_name'], current['element']), (4, '寒息', 'electro'))
        self.assertIn('atk_pct', current['effective_keys'])
        self.assertNotIn('hp_pct', current['effective_keys'])
        self.assertIn('em', {condition['key'] for condition in current['conditional']})
        record = next(row for row in SOURCES['rules'] if row['api_id'] == 10000148)
        self.assertEqual(record['sources'][0]['entry_id'], '11163')
        facts = record['structured_facts']
        self.assertEqual(facts['c4_additional_healing_atk_pct'], 60)
        self.assertEqual(facts['a4_damage_bonus_cap_er_pct'], 200)
        self.assertEqual(facts['weapon_type'], 'polearm')

    def test_support_and_damage_roles_do_not_share_an_unconditional_crit_template(self):
        self.assertIn('crit_rate', rule(10000035)['effective_keys'])  # Current Favonius weapon.
        self.assertIn('crit_dmg', rule(10000035)['known_ineffective_keys'])
        self.assertIn('def_pct', rule(10000055)['effective_keys'])
        self.assertIn('atk_pct', rule(10000055)['known_ineffective_keys'])
        self.assertIn('def_pct', rule(10000064)['effective_keys'])
        self.assertIn('hp_pct', rule(10000064)['known_ineffective_keys'])
        self.assertIn('em', rule(10000113)['effective_keys'])  # EM directly scales healing.
        self.assertIn('crit_dmg', rule(10000113)['known_ineffective_keys'])
        sara = next(row for row in SOURCES['rules'] if row['api_id'] == 10000056)
        self.assertEqual(sara['structured_facts']['team_atk_buff_scaling'], 'base_atk')

    def test_current_constellations_do_not_get_borrowed_future_mechanics(self):
        self.assertEqual(rule(10000044)['constellation'], 1)
        self.assertIn('crit_rate', rule(10000044)['effective_keys'])
        self.assertIn('def_pct', rule(10000044)['known_ineffective_keys'])
        self.assertEqual(rule(10000048)['constellation'], 1)
        self.assertIn('hp_pct', rule(10000048)['known_ineffective_keys'])
        self.assertEqual(rule(10000053)['constellation'], 5)
        self.assertEqual(rule(10000068)['constellation'], 3)
        self.assertIn('em', rule(10000068)['known_ineffective_keys'])

    def test_empty_official_manekin_skill_pages_do_not_create_guessed_rules(self):
        for api_id in (10000117, 10000118):
            current = rule(api_id)
            self.assertEqual(current['artifact_context'], [])
            self.assertEqual(current['effective_keys'], [])
            self.assertEqual(current['known_ineffective_keys'], [])
            self.assertFalse(current['complete'])
            self.assertEqual(current['confidence'], 'unknown')
            self.assertTrue(current['unknown_reason'])
        self.assertFalse(rule(10000137)['complete'])
        self.assertEqual(rule(10000137)['artifact_context'], [])
        self.assertIn('crit_rate', rule(10000137)['effective_keys'])

    def test_flat_stat_priority_policy_does_not_claim_zero_mechanical_benefit(self):
        self.assertIn('不等同', RULES['research_policy']['flat_stat_policy'])
        for row in SOURCES['rules']:
            current = rule(row['api_id'])
            if current['confidence'] == 'unknown':continue
            self.assertTrue({'atk', 'hp', 'def'} <= set(current['known_ineffective_keys']))
            self.assertTrue(any('不代表其收益為零' in note for note in current['notes']))


if __name__ == '__main__':
    unittest.main()
