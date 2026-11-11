import copy
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from account_model import read_json, effective_substat_count, build_fingerprint, snapshot_status
from migrate_account import migrate
from validate import validate_account


class ArtifactRollTests(unittest.TestCase):
    def setUp(self):
        self.account = read_json(ROOT / 'data/account.json')

    def flower(self, cid):
        aid = self.account['equipment'][cid]['artifacts']['flower']
        return next(x for x in self.account['artifacts'] if x['id'] == aid)

    def test_video_example_includes_initial_rolls(self):
        flower = self.flower('chasca')
        self.assertEqual(effective_substat_count(flower, 'chasca'), 5)
        effective = {r['key']: r['enhancements'] for r in flower['substat_rolls']['values'] if r['effective']}
        self.assertEqual(effective, {'crit_dmg': 2, 'crit_rate': 1})

    def test_unknown_and_new_owner_do_not_look_like_zero(self):
        flower = self.flower('chasca')
        self.assertIsNone(effective_substat_count(flower, 'furina'))
        flower['substat_rolls']['values'][0]['effective'] = None
        self.assertIsNone(effective_substat_count(flower, 'chasca'))
        for row in flower['substat_rolls']['values']:
            row['effective'] = False
        self.assertEqual(effective_substat_count(flower, 'chasca'), 0)

    def test_chevreuse_update_keeps_old_panel_stale(self):
        flower = self.flower('chevreuse')
        self.assertEqual(flower['level'], 20)
        self.assertEqual(effective_substat_count(flower, 'chevreuse'), 5)
        snap = next(s for s in self.account['panel_snapshots'] if s['character_id'] == 'chevreuse')
        self.assertEqual(snapshot_status(self.account, snap), 'build_changed')
        character = next(c for c in self.account['characters'] if c['id'] == 'chevreuse')
        current = next(s for s in self.account['panel_snapshots'] if s['id'] == character['panel_snapshot_id'])
        self.assertNotEqual(current['id'], snap['id'])
        self.assertEqual(snapshot_status(self.account, current), 'matches_recorded_build')
        self.assertEqual(next(s['value'] for s in current['stats'] if s['key'] == 'hp'), 41794)

    def test_annotations_do_not_change_build_fingerprint(self):
        before = build_fingerprint(self.account, 'chasca')
        self.flower('chasca')['substat_rolls']['values'][0]['effective'] = False
        self.assertEqual(build_fingerprint(self.account, 'chasca'), before)

    def test_migration_preserves_unknowns_and_observations(self):
        old = copy.deepcopy(self.account)
        old['schema_version'] = 1
        for x in old['artifacts']:
            x.pop('substat_rolls')
        migrated = migrate(old)
        self.assertEqual(migrated['panel_snapshots'], old['panel_snapshots'])
        self.assertNotIn('substat_rolls', old['artifacts'][0])
        self.assertIsNone(effective_substat_count(next(x for x in migrated['artifacts'] if x['id'] == self.flower('chasca')['id']), 'chasca'))
        self.assertEqual(build_fingerprint(old, 'chasca'), build_fingerprint(migrated, 'chasca'))
        self.assertEqual(validate_account(migrated)[0], [])

    def test_impossible_counts_and_mismatched_keys_rejected(self):
        flower = self.flower('chasca')
        flower['substat_rolls']['values'][0]['enhancements'] = 5
        self.assertTrue(validate_account(self.account)[0])
        flower['substat_rolls']['values'][0]['enhancements'] = None
        flower['substat_rolls']['values'][0]['key'] = 'unrecorded_stat'
        self.assertTrue(validate_account(self.account)[0])

    def test_locked_barbara_rows_are_not_active_substats(self):
        flower = self.flower('barbara')
        self.assertEqual(flower['level'], 0)
        self.assertEqual(len(flower['substats']), 3)
        self.assertEqual(effective_substat_count(flower, 'barbara'), 1)
        eq = self.account['equipment']['barbara']['artifacts']
        totals = {x['slot']: effective_substat_count(x, 'barbara') for x in self.account['artifacts'] if x['id'] in eq.values()}
        self.assertEqual(totals, {'flower': 1, 'plume': 2, 'sands': 0, 'goblet': 5, 'circlet': 1})
        self.assertEqual(sum(totals.values()), 9)
