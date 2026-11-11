import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from account_model import build_fingerprint, file_sha256, read_json, write_json
from import_video import import_bundle
from report import render
from validate import validate_account, validate_evidence, validate_repository

class AccountTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixture_dir = tempfile.TemporaryDirectory(prefix='genshin_fixture_')
        cls.addClassCleanup(cls.fixture_dir.cleanup)
        workspace = Path(cls.fixture_dir.name).resolve()
        source = workspace / 'source'
        source.mkdir()
        shutil.copyfile(ROOT / 'imports/video_001/extracted.json', source / 'character_data.json')
        shutil.copytree(ROOT / 'evidence/video_001/screenshots', source / 'screenshots')
        manifest = read_json(ROOT / 'evidence/video_001/manifest.json')
        cls.baseline = import_bundle(source, workspace / 'candidate', 'video_001', manifest['imported_at'])

    def setUp(self):
        self.account = copy.deepcopy(self.baseline)

    def test_repository_and_all_evidence_validate(self):
        errors, warnings = validate_repository(ROOT)
        self.assertEqual(errors, [])
        # Stale panels are valid after a real update and remain warnings.

    def test_unknown_base_talents_remain_null(self):
        for character in self.account['characters']:
            self.assertEqual(set(character['talents']['base'].values()), {None})
        self.assertTrue(all(s['observed_at'] is None for s in self.account['panel_snapshots']))

    def test_percentage_cannot_be_stored_with_flat_unit(self):
        self.account['artifacts'][0]['substats'][0]['unit'] = 'flat'
        self.assertTrue(validate_account(self.account)[0])

    def test_same_artifact_cannot_be_equipped_twice(self):
        self.account['equipment']['furina']['artifacts']['flower'] = self.account['equipment']['escoffier']['artifacts']['flower']
        self.assertIn('equipped by multiple characters', '\n'.join(validate_account(self.account)[0]))

    def test_artifact_slot_must_match(self):
        self.account['equipment']['escoffier']['artifacts']['flower'] = self.account['equipment']['escoffier']['artifacts']['plume']
        self.assertIn('wrong slot', '\n'.join(validate_account(self.account)[0]))

    def test_unknown_item_is_rejected(self):
        self.account['equipment']['escoffier']['weapon_id'] = 'weapon_missing'
        self.assertIn('unknown weapon', '\n'.join(validate_account(self.account)[0]))

    def test_invalid_refinement_is_rejected(self):
        self.account['weapons'][0]['refinement'] = 6
        self.assertTrue(validate_account(self.account)[0])

    def test_duplicate_identity_is_rejected(self):
        self.account['artifacts'][1]['id'] = self.account['artifacts'][0]['id']
        self.assertIn('duplicate IDs', '\n'.join(validate_account(self.account)[0]))

    def test_wrong_character_snapshot_is_rejected(self):
        self.account['characters'][0]['panel_snapshot_id'] = self.account['characters'][1]['panel_snapshot_id']
        self.assertIn('invalid panel snapshot', '\n'.join(validate_account(self.account)[0]))

    def test_editing_artifact_marks_panel_stale_without_changing_observation(self):
        before = copy.deepcopy(self.account['panel_snapshots'])
        self.account['artifacts'][0]['substats'][0]['value'] = 7.0
        errors, warnings = validate_account(self.account)
        self.assertEqual(errors, [])
        self.assertIn('愛可菲', '\n'.join(warnings))
        self.assertEqual(self.account['panel_snapshots'], before)

    def test_talent_change_marks_panel_stale(self):
        self.account['characters'][0]['talents']['base']['skill'] = 10
        self.assertTrue(validate_account(self.account)[1])

    def test_metadata_change_does_not_invalidate_build(self):
        before = build_fingerprint(self.account, 'escoffier')
        self.account['artifacts'][0]['provenance']['notes'].append('補充文字')
        self.assertEqual(build_fingerprint(self.account, 'escoffier'), before)

    def test_unknown_numeric_value_is_valid(self):
        self.account['characters'][0]['friendship'] = None
        self.assertEqual(validate_account(self.account)[0], [])

    def test_timestamps_require_timezone(self):
        self.account['updated_at'] = '2026-11-11T10:00:00'
        self.assertIn('timezone', '\n'.join(validate_account(self.account)[0]))

    def test_summary_is_current_and_includes_source_links(self):
        summary = render(ROOT)
        self.assertEqual((ROOT / 'docs/account_summary.md').read_text(encoding='utf-8'), summary)
        self.assertIn('黃金樂曲的變奏', summary)
        self.assertIn('../evidence/video_001/screenshots/', summary)

    def test_tampered_evidence_and_path_escape_are_rejected(self):
        with tempfile.TemporaryDirectory(prefix='genshin_evidence_') as temp:
            sandbox = Path(temp).resolve()
            shutil.copytree(ROOT / 'evidence', sandbox / 'evidence')
            shutil.copytree(ROOT / 'imports', sandbox / 'imports')
            self.assertEqual(validate_evidence(self.account, sandbox), [])
            manifest_path = sandbox / 'evidence/video_001/manifest.json'
            manifest = read_json(manifest_path)
            shot = sandbox / manifest['screenshots'][0]['path']
            shot.write_bytes(b'tampered')
            self.assertIn('Evidence hash mismatch', '\n'.join(validate_evidence(self.account, sandbox)))
            manifest['screenshots'][0]['path'] = '../outside.png'
            write_json(manifest_path, manifest)
            self.assertIn('Path escapes root', '\n'.join(validate_evidence(self.account, sandbox)))

    def test_missing_evidence_reference_is_rejected(self):
        self.account['characters'][0]['provenance']['evidence_refs'].append('missing_proof')
        self.assertIn('unknown evidence', '\n'.join(validate_evidence(self.account, ROOT)))

    def test_import_is_faithful_and_refuses_overwrite(self):
        with tempfile.TemporaryDirectory(prefix='genshin_import_') as temp:
            sandbox = Path(temp).resolve()
            source = sandbox / 'source'
            source.mkdir()
            shutil.copyfile(ROOT / 'imports/video_001/extracted.json', source / 'character_data.json')
            shutil.copytree(ROOT / 'evidence/video_001/screenshots', source / 'screenshots')
            output = sandbox / 'candidate'
            timestamp = self.account['updated_at']
            imported = import_bundle(source, output, 'video_001', timestamp)
            self.assertEqual(imported, self.account)
            self.assertEqual((len(imported['characters']), len(imported['weapons']), len(imported['artifacts'])), (4, 4, 20))
            before = file_sha256(output / 'data/account.json')
            with self.assertRaisesRegex(ValueError, 'Refusing to overwrite'):
                import_bundle(source, output, 'video_001', timestamp)
            self.assertEqual(file_sha256(output / 'data/account.json'), before)
            self.assertEqual(file_sha256(output / 'imports/video_001/extracted.json'), file_sha256(source / 'character_data.json'))

if __name__ == '__main__':
    unittest.main()
