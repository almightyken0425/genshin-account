"""Pinned per-skill boosts and conservative invested-level interpretation."""
from copy import deepcopy
import json
from pathlib import Path
import unittest

from tools.hoyolab_sync.talents import apply_genshin_talent_bases

ROOT = Path(__file__).resolve().parents[1]
RULES = json.loads((ROOT / 'tools/hoyolab_sync/data/genshin_talent_rules.json').read_text())
COMMIT = '8e5badd60b5d894284ccc927a56c9683529d2592'


def character(api_id, element, constellation, levels=(1, 9, 9)):
    rule = RULES['characters'][f'{api_id}:{element}']
    displayed = dict(zip(('normal', 'skill', 'burst'), levels))
    return {'api_id': api_id, 'element': element, 'name': rule['name'], 'constellation': constellation,
            # Shuffled response order and an unrelated passive cannot change slot identity.
            'skills': [{'id': 9999999, 'name': '被動', 'level': 1, 'unlocked': True}] + [
                {'id': rule['skill_order'][slot], 'name': rule.get('skill_names', {}).get(slot, slot),
                 'level': displayed[slot], 'unlocked': True} for slot in ('burst', 'normal', 'skill')],
            'talents': {'base': dict.fromkeys(displayed), 'displayed': displayed, 'bonus_context': None}}


def apply(*characters, rules=None):
    return apply_genshin_talent_bases({'complete': True, 'characters': list(characters), 'warnings': []}, rules)


class GenshinTalentBaseTests(unittest.TestCase):
    def test_jean_c3_boosts_burst_and_kazuha_c3_boosts_skill(self):
        # Public C3 descriptions explicitly target different skills, not a generic C3 slot.
        rows, report = apply(character(10000003, 'anemo', 3, (1, 9, 12)),
                             character(10000047, 'anemo', 3, (1, 12, 9)))
        for row in rows['characters']:
            self.assertEqual(row['talents']['base'], {'normal': 1, 'skill': 9, 'burst': 9})
        self.assertEqual(report['known_slots'], 6)
        self.assertEqual(report['unknown_slots'], 0)

    def test_mavuika_c3_burst_c5_skill_and_inactive_boosts(self):
        for constellation, displayed, expected in [
                (2, (9, 10, 10), (9, 10, 10)),
                (3, (9, 10, 13), (9, 10, 10)),
                (5, (9, 13, 13), (9, 10, 10))]:
            with self.subTest(constellation=constellation):
                result, _ = apply(character(10000106, 'pyro', constellation, displayed))
                self.assertEqual(list(result['characters'][0]['talents']['base'].values()), list(expected))

    def test_normal_attack_constellations_are_character_specific(self):
        result, _ = apply(character(10000097, 'electro', 3, (12, 9, 8)),
                          character(10000137, 'electro', 5, (12, 12, 8)))
        for row in result['characters']:
            self.assertEqual(row['talents']['base'], {'normal': 9, 'skill': 9, 'burst': 8})
        self.assertEqual(RULES['characters']['10000137:electro']['skill_order']['normal'], 30601)

    def test_new_characters_have_exact_evidence_and_do_not_depend_on_suffixes(self):
        case = RULES['characters']['10000148:electro']
        self.assertEqual([(b['constellation'], b['skill_id']) for b in case['boosts']], [(3, 11482), (5, 11485)])
        result, _ = apply(character(10000148, 'electro', 4, (1, 13, 10)))
        self.assertEqual(result['characters'][0]['talents']['base'], {'normal': 1, 'skill': 10, 'burst': 10})

    def test_both_travelers_keep_element_and_gender_specific_skill_ids(self):
        female = character(10000007, 'cryo', 5, (1, 12, 12))
        male = character(10000005, 'cryo', 5, (1, 12, 12))
        result, _ = apply(female, male)
        for row in result['characters']:
            self.assertEqual(row['talents']['base'], {'normal': 1, 'skill': 9, 'burst': 9})
        self.assertNotEqual(RULES['characters']['10000007:cryo']['skill_order']['normal'],
                            RULES['characters']['10000005:cryo']['skill_order']['normal'])
        wrong_element = deepcopy(female)
        wrong_element['element'] = 'anemo'
        result, report = apply(wrong_element)
        self.assertEqual(set(result['characters'][0]['talents']['base'].values()), {None})
        self.assertEqual(report['unknown_reasons'], {'missing_or_duplicate_skill_id': 3})

    def test_manekin_c0_is_known_but_future_unknown_constellations_are_not_assumed(self):
        result, report = apply(character(10000117, 'cryo', 0, (2, 5, 7)),
                               character(10000118, 'cryo', 0, (2, 5, 7)))
        self.assertEqual(report['known_slots'], 6)
        self.assertEqual(result['characters'][0]['talents']['base'], {'normal': 2, 'skill': 5, 'burst': 7})
        changed = deepcopy(result['characters'][0])
        changed['constellation'] = 1
        result, report = apply(changed)
        self.assertEqual(set(result['characters'][0]['talents']['base'].values()), {None})
        self.assertEqual(report['unknown_reasons'], {'incomplete_constellation_evidence': 3})

    def test_manekin_burst_id_does_not_leak_between_elements(self):
        row = character(10000117, 'cryo', 0, (2, 5, 7))
        row['element'] = 'hydro'
        result, report = apply(row)
        # Their shared normal/E IDs remain valid; the element-specific burst does not.
        self.assertEqual(result['characters'][0]['talents']['base'], {'normal': 2, 'skill': 5, 'burst': None})
        self.assertEqual(report['unknown_slots'], 1)

    def test_unknown_constellation_only_blocks_slots_that_can_receive_constellation_levels(self):
        result, report = apply(character(10000003, 'anemo', None))
        self.assertEqual(result['characters'][0]['talents']['base'], {'normal': 1, 'skill': None, 'burst': None})
        self.assertEqual(report['unknown_reasons'], {'unknown_constellation': 2})

    def test_missing_duplicate_locked_and_inconsistent_observations_stay_unknown(self):
        row = character(10000003, 'anemo', 0)
        sid = RULES['characters']['10000003:anemo']['skill_order']['normal']
        row['skills'].append({'id': sid, 'name': '重複', 'level': 1, 'unlocked': True})
        row['skills'][1]['unlocked'] = False  # burst
        row['talents']['displayed']['skill'] = 8  # observed E remains 9
        result, report = apply(row)
        self.assertEqual(set(result['characters'][0]['talents']['base'].values()), {None})
        self.assertEqual(report['unknown_reasons'], {'missing_or_duplicate_skill_id': 1,
                                                    'missing_or_inconsistent_displayed_level': 1,
                                                    'skill_locked': 1})

    def test_unknown_rule_and_unconfirmed_provider_semantics_do_not_fill_values(self):
        rules = deepcopy(RULES)
        rules['provider_semantics']['status'] = 'unknown'
        result, report = apply(character(10000003, 'anemo', 0), rules=rules)
        self.assertEqual(set(result['characters'][0]['talents']['base'].values()), {None})
        self.assertEqual(report['unknown_reasons'], {'unconfirmed_provider_semantics': 3})
        row = character(10000003, 'anemo', 0)
        row['api_id'] = 99999999
        _, report = apply(row)
        self.assertEqual(report['unknown_reasons'], {'unconfirmed_character_element': 3})

    def test_roster_party_passives_are_not_blindly_subtracted(self):
        # These are account API levels. Merely owning a party buffer is not an active bonus.
        result, report = apply(character(10000033, 'hydro', 0, (10, 10, 10)),
                               character(10000114, 'cryo', 2, (1, 10, 9)),
                               character(10000112, 'cryo', 2, (1, 10, 9)))
        self.assertEqual(result['characters'][0]['talents']['base']['normal'], 10)
        self.assertEqual(result['characters'][2]['talents']['base']['skill'], 10)
        self.assertEqual(report['semantics_status'], 'supported_inference')
        self.assertEqual(report['unknown_slots'], 0)
        # An unexplained +1 is not forced into the valid range or guessed away.
        row = character(10000112, 'cryo', 2, (1, 11, 9))
        result, report = apply(row)
        self.assertIsNone(result['characters'][0]['talents']['base']['skill'])
        self.assertEqual(report['unknown_reasons'], {'outside_invested_level_range': 1})

    def test_underflow_and_zero_are_unknown_instead_of_clamped(self):
        result, report = apply(character(10000003, 'anemo', 3, (0, 9, 3)))
        self.assertEqual(result['characters'][0]['talents']['base'], {'normal': None, 'skill': 9, 'burst': None})
        self.assertEqual(report['unknown_slots'], 2)

    def test_minimal_session_records_are_skipped_without_mutation(self):
        game = {'characters': [{'api_id': 1}, {'api_id': 2, 'skills': []}]}
        result, report = apply_genshin_talent_bases(game)
        self.assertEqual(result, game)
        self.assertEqual(report['characters'], 0)
        self.assertEqual(report['skipped_characters'], 2)

    def test_pure_idempotent_transform_and_url_free_game(self):
        game = {'characters': [character(10000106, 'pyro', 5, (9, 13, 13))]}
        original, original_rules = deepcopy(game), deepcopy(RULES)
        result, report = apply_genshin_talent_bases(game)
        again, second_report = apply_genshin_talent_bases(result)
        self.assertEqual(game, original)
        self.assertEqual(RULES, original_rules)
        self.assertEqual(again, result)
        self.assertEqual(second_report['updated_characters'], [])
        self.assertNotIn('https://', json.dumps(result))
        self.assertIn('推論', result['characters'][0]['talents']['bonus_context'])
        self.assertEqual(report['known_slots'], 3)

    def test_public_rule_metadata_has_bounded_evidence_and_explicit_boost_targets(self):
        self.assertEqual(RULES['based_on_commit'], 'c2b910c8d672e6d313ba67821c3af18775831cd9')
        for key, rule in RULES['characters'].items():
            with self.subTest(key=key):
                self.assertEqual(key, f"{rule['avatar_id']}:{rule['element']}")
                self.assertEqual(len(set(rule['skill_order'].values())), 3)
                if rule['complete_constellations']:
                    self.assertEqual(set(rule['constellation_checks']), {f'c{i}' for i in range(1, 7)})
                    source = rule['sources']['constellations']
                    self.assertEqual(source['commit'], COMMIT)
                    self.assertRegex(source['sha256'], r'^[0-9a-f]{64}$')
                    self.assertIn(COMMIT, source['url'])
                for boost in rule['boosts']:
                    self.assertEqual(boost['skill_id'], rule['skill_order'][boost['slot']])
                    self.assertEqual(boost['amount'], 3)
                    self.assertRegex(boost['description_sha256'], r'^[0-9a-f]{64}$')
                    self.assertLessEqual(len(boost['evidence_excerpt']), 15)
        passives = RULES['provider_semantics']['party_passives']
        self.assertEqual({p['avatar_id'] for p in passives}, {10000033, 10000114})
        self.assertTrue(all(p['scope'] == 'own_party' for p in passives))


if __name__ == '__main__':
    unittest.main()
