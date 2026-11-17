"""API observations retain provenance while role assessments remain explicit."""
import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from account_model import build_fingerprint, effective_substat_count, file_sha256, read_json, write_json
from validate import validate_account, validate_evidence
from validate_zzz import validate as validate_zzz

SOURCE = 'hoyolab_0123456789abcdef'
STAMP = '2026-11-16T08:00:00+00:00'


def genshin():
    account = read_json(ROOT / 'data/account.json')
    character = account['characters'][0]
    cid = character['id']
    equipment = account['equipment'][cid]
    account['characters'] = [character]
    account['equipment'] = {cid: equipment}
    account['weapons'] = [w for w in account['weapons'] if w['id'] == equipment['weapon_id']]
    account['artifacts'] = [a for a in account['artifacts'] if a['id'] in equipment['artifacts'].values()]
    account['panel_snapshots'] = [s for s in account['panel_snapshots'] if s['character_id'] == cid]
    account['teams'] = []
    account['schema_version'] = 3
    account['source_ids'] = [SOURCE]
    for kind in ['characters', 'weapons', 'artifacts', 'panel_snapshots']:
        for record in account[kind]:
            record['provenance'] = {'source_ids': [SOURCE], 'evidence_refs': [SOURCE + '_observation'], 'verification': 'api_observed', 'notes': []}
    manifest = {'id': SOURCE, 'schema_version': 3, 'imported_at': STAMP,
                'media': {'type': 'hoyolab', 'recorded_at': None},
                'extraction': {'path': f'imports/hoyolab/{SOURCE}.json', 'sha256': 'a' * 64},
                'screenshots': [], 'observations': [{'id': SOURCE + '_observation', 'character_id': cid, 'kind': 'hoyolab', 'pointer': '/genshin/characters/0'}]}
    return account, manifest


def zzz():
    return {'schemaVersion': 2, 'game': 'zzz',
            'source': {'filename': 'old.MP4', 'sha256': 'a' * 64, 'durationSeconds': 10, 'capturedAt': None},
            'syncSources': [{'id': SOURCE, 'provider': 'hoyolab', 'retrievedAt': STAMP, 'path': f'imports/hoyolab/{SOURCE}.json', 'sha256': 'b' * 64}],
            'characters': [{'id': 'test', 'name': '測試', 'level': 60, 'mindscape': 0, 'stats': {}, 'skills': None, 'wEngine': None, 'driveDiscs': None, 'evidence': [{'sourceId': SOURCE, 'record': '/zzz/characters/0'}], 'uncertainties': [], 'sync': {'apiId': 1001, 'sourceId': SOURCE}, 'skillsBase': {'普通攻擊': None}, 'skillContext': {'provider': 'hoyolab', 'levelSemantics': 'provider_displayed', 'coreRawLevel': 7}}]}


class HoyolabSchemaTests(unittest.TestCase):
    def test_legacy_accounts_keep_their_original_schema(self):
        self.assertEqual(validate_account(read_json(ROOT / 'data/account.json'))[0], [])
        self.assertEqual(validate_zzz(read_json(ROOT / 'data/zzz/account.json'), check_files=False), [])

    def test_api_template_ids_are_metadata_for_fingerprints(self):
        account, _ = genshin()
        cid = account['characters'][0]['id']
        before = build_fingerprint(account, cid)
        account['characters'][0]['hoyolab_id'] = 100001
        account['weapons'][0]['hoyolab_id'] = 100002
        account['artifacts'][0]['hoyolab_id'] = 100003
        self.assertEqual(validate_account(account)[0], [])
        self.assertEqual(build_fingerprint(account, cid), before)

    def test_rule_assessment_is_separate_and_observations_take_precedence(self):
        account, _ = genshin()
        artifact = account['artifacts'][0]
        cid = account['characters'][0]['id']
        rolls = artifact['substat_rolls']
        rolls.update(rule_id='test_v1', effective_keys=[rolls['values'][0]['key']])
        for row in rolls['values']:
            row.update(effective=None, assessed_effective=row['key'] in rolls['effective_keys'], enhancements=0)
        self.assertEqual(validate_account(account)[0], [])
        self.assertEqual(effective_substat_count(artifact, cid), 1)
        rolls['values'][0]['effective'] = False
        self.assertEqual(effective_substat_count(artifact, cid), 0)
        rolls['values'][0]['effective'] = None
        rolls['values'][0]['enhancements'] = None
        self.assertIsNone(effective_substat_count(artifact, cid))
        rolls.pop('rule_id')
        self.assertTrue(validate_account(account)[0])

    def test_api_evidence_checks_hash_pointer_and_path(self):
        account, manifest = genshin()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path = root / manifest['extraction']['path']
            write_json(path, {'genshin': {'characters': [{'id': 100001}]}})
            manifest['extraction']['sha256'] = file_sha256(path)
            manifest_path = root / f'evidence/{SOURCE}/manifest.json'
            write_json(manifest_path, manifest)
            self.assertEqual(validate_evidence(account, root), [])
            path.write_text('{}')
            self.assertTrue(validate_evidence(account, root))
            self.assertEqual(validate_evidence(account, root, check_files=False), [])
            manifest['observations'][0]['pointer'] = '/genshin/characters/-1'
            write_json(manifest_path, manifest)
            self.assertTrue(validate_evidence(account, root, check_files=False))
            manifest['observations'][0]['pointer'] = '/genshin/characters/0'
            manifest['extraction']['path'] = '../outside.json'
            write_json(manifest_path, manifest)
            self.assertTrue(validate_evidence(account, root, check_files=False))

    def test_zzz_api_source_and_record_are_checked_without_fake_screenshots(self):
        account = zzz()
        self.assertEqual(validate_zzz(account, check_files=False), [])
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = account['syncSources'][0]
            path = root / source['path']
            write_json(path, {'zzz': {'characters': [{'apiId': 1001}]}})
            source['sha256'] = file_sha256(path)
            self.assertEqual(validate_zzz(account, root), [])
            account['characters'][0]['evidence'][0]['record'] = '/zzz/characters/1'
            self.assertTrue(validate_zzz(account, root))
            account['characters'][0]['evidence'][0]['record'] = '/zzz/characters/0'
            path.write_text('{}')
            self.assertTrue(validate_zzz(account, root))
        account['characters'][0]['sync']['sourceId'] = 'missing'
        self.assertTrue(validate_zzz(account, check_files=False))

    def test_zzz_rule_count_keeps_observed_flags_and_unknown_counts(self):
        account = zzz()
        disc = {'id': 'disc_1', 'slot': 1, 'setName': None, 'rarity': 'S', 'level': 15,
                'mainStat': {'name': '生命值', 'unit': 'flat', 'value': 2200}, 'substatsComplete': True,
                'substats': [{'name': '攻擊力', 'unit': 'percent', 'value': 9, 'enhancementCount': 2, 'isEffective': None, 'assessedEffective': True, 'enhancementSource': 'derived_fixed_roll'}],
                'effectiveRollCount': 3, 'effectiveKeys': ['攻擊力|percent'], 'assessment': {'ruleId': 'test_v1', 'method': 'role_rule'},
                'evidence': copy.deepcopy(account['characters'][0]['evidence']), 'uncertainties': []}
        account['characters'][0]['driveDiscs'] = [disc]
        self.assertEqual(validate_zzz(account, check_files=False), [])
        disc['substats'][0]['isEffective'] = False
        disc['effectiveRollCount'] = 0
        self.assertEqual(validate_zzz(account, check_files=False), [])
        disc['substats'][0].update(isEffective=None, enhancementCount=None)
        disc['effectiveRollCount'] = None
        self.assertEqual(validate_zzz(account, check_files=False), [])
        disc['substats'][0]['assessedEffective'] = False
        self.assertTrue(validate_zzz(account, check_files=False))


if __name__ == '__main__':
    unittest.main()
