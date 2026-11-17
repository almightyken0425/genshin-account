"""Offline integration of both games through the actual preview boundary."""
from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from account_model import resolve_pointer
from validate import validate_account, validate_evidence
from validate_zzz import validate as validate_zzz
from tools.hoyolab_sync import genshin, zzz
from tools.hoyolab_sync.engine import prepare, SyncError, review_summary, verification_summary


def fixture_module(name):
    spec = importlib.util.spec_from_file_location('_engine_fixture_' + name, ROOT / 'tests' / f'test_hoyolab_{name}.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


GI = fixture_module('genshin')
ZZZ = fixture_module('zzz')
STAMP = '2026-11-16T08:00:00+00:00'
LATER = '2026-11-17T08:00:00+00:00'


def inputs():
    account = GI.empty()
    account['schema_version'] = 2
    base = {'revision': 'a' * 40, 'genshin': account, 'zzz': ZZZ.base_account(), 'manifests': []}
    snapshot = {'schema_version': 1, 'provider': 'hoyolab',
                'genshin': genshin.normalize([GI.raw()], GI.META),
                'zzz': zzz.normalize([ZZZ.raw_agent()], ZZZ.META)}
    return base, snapshot


def saved_base(plan, previous):
    files = plan['files']
    manifests = deepcopy(previous['manifests'])
    manifests.extend(json.loads(data) for path, data in files.items() if path.startswith('evidence/'))
    return {'revision': 'b' * 40, 'genshin': json.loads(files['data/account.json']),
            'zzz': json.loads(files['data/zzz/account.json']), 'manifests': manifests}


def protected_hashes():
    paths = [ROOT / 'data/account.json', ROOT / 'data/zzz/account.json']
    for folder in ('imports', 'evidence'):
        paths.extend(path for path in (ROOT / folder).rglob('*') if path.is_file())
    return {path.relative_to(ROOT).as_posix(): hashlib.sha256(path.read_bytes()).hexdigest() for path in paths}


class EngineIntegrationTests(unittest.TestCase):
    def test_normalized_games_prepare_valid_v3_v2_and_true_source_references(self):
        base, snapshot = inputs()
        plan = prepare(base, snapshot, STAMP)
        self.assertTrue(plan['changed'])
        candidate = saved_base(plan, base)
        self.assertEqual(candidate['genshin']['schema_version'], 3)
        self.assertEqual(candidate['zzz']['schemaVersion'], 2)
        self.assertEqual(validate_account(candidate['genshin'])[0], [])
        proof_path = f"imports/hoyolab/{plan['source_id']}.json"
        proof_bytes = plan['files'][proof_path]
        proof = json.loads(proof_bytes)
        digest = hashlib.sha256(proof_bytes).hexdigest()
        self.assertEqual(proof, snapshot)
        self.assertEqual(plan['source_id'], 'hoyolab_' + digest[:16])
        self.assertNotIn('PRIVATE_', proof_bytes.decode())
        manifest = candidate['manifests'][0]
        self.assertEqual(manifest['extraction'], {'path': proof_path, 'sha256': digest})
        self.assertEqual(manifest['screenshots'], [])
        self.assertEqual(len(manifest['observations']), len(snapshot['genshin']['characters']))
        for index, observation in enumerate(manifest['observations']):
            self.assertEqual(resolve_pointer(proof, observation['pointer']), snapshot['genshin']['characters'][index])
            character = next(c for c in candidate['genshin']['characters'] if c['id'] == observation['character_id'])
            self.assertEqual(character['hoyolab_id'], snapshot['genshin']['characters'][index]['api_id'])
        source = candidate['zzz']['syncSources'][0]
        self.assertEqual((source['path'], source['sha256']), (proof_path, digest))
        for character in candidate['zzz']['characters']:
            evidence = next(e for e in character['evidence'] if e.get('sourceId') == source['id'])
            self.assertEqual(resolve_pointer(proof, evidence['record'])['api_id'], character['sync']['apiId'])
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for path, data in plan['files'].items():
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
            self.assertEqual(validate_evidence(candidate['genshin'], root), [])
            self.assertEqual(validate_zzz(candidate['zzz'], root), [])

    def test_identical_payload_later_read_is_noop_without_new_source_or_panel(self):
        base, snapshot = inputs()
        first = prepare(base, snapshot, STAMP)
        saved = saved_base(first, base)
        before = deepcopy(saved)
        second = prepare(saved, deepcopy(snapshot), LATER)
        self.assertFalse(second['changed'])
        self.assertEqual(second['source_id'], first['source_id'])
        self.assertEqual(saved, before)
        self.assertEqual(json.loads(second['files']['data/account.json']), saved['genshin'])
        self.assertEqual(json.loads(second['files']['data/zzz/account.json']), saved['zzz'])
        self.assertFalse(any(path.startswith(('imports/', 'evidence/')) for path in second['files']))
        for game in ('genshin', 'zzz'):
            self.assertEqual(second['summary'][game]['added_characters'], 0)
            self.assertEqual(second['summary'][game]['updated_characters'], 0)
            self.assertEqual(second['summary'][game]['changes'], [])

    def test_zzz_summary_contains_reviewable_counts_and_changed_character_names(self):
        base, snapshot = inputs()
        preview = prepare(base, snapshot, STAMP)
        summary = preview['summary']['zzz']
        self.assertEqual(summary['added_characters'], 1)
        self.assertEqual(summary['updated_characters'], 0)
        self.assertEqual(len(summary['changes']), 1)
        self.assertEqual(summary['changes'][0]['name'], snapshot['zzz']['characters'][0]['name'])
        self.assertTrue(summary['changes'][0]['detail'])

    def test_changed_payload_adds_observation_without_overwriting_old_sources_or_panels(self):
        base, snapshot = inputs()
        first = prepare(base, snapshot, STAMP)
        saved = saved_base(first, base)
        old_panels = deepcopy(saved['genshin']['panel_snapshots'])
        changed = deepcopy(snapshot)
        changed['genshin']['characters'][0]['panel'][0]['value'] += 1
        second = prepare(saved, changed, LATER)
        updated = json.loads(second['files']['data/account.json'])
        self.assertNotEqual(second['source_id'], first['source_id'])
        self.assertEqual(updated['panel_snapshots'][:len(old_panels)], old_panels)
        self.assertEqual(len(updated['panel_snapshots']), len(old_panels) + 1)
        self.assertIn(first['source_id'], updated['source_ids'])
        self.assertIn(second['source_id'], updated['source_ids'])
        self.assertNotIn(f"imports/hoyolab/{first['source_id']}.json", second['files'])
        self.assertNotIn(f"evidence/{first['source_id']}/manifest.json", second['files'])

    def test_preview_preserves_checkout_input_objects_and_existing_video_observations(self):
        base, snapshot = inputs()
        original_character = ZZZ.old_character()
        base['zzz']['characters'] = [original_character]
        before_base, before_snapshot = deepcopy(base), deepcopy(snapshot)
        hashes = protected_hashes()
        plan = prepare(base, snapshot, STAMP)
        self.assertEqual(base, before_base)
        self.assertEqual(snapshot, before_snapshot)
        self.assertEqual(protected_hashes(), hashes)
        current = json.loads(plan['files']['data/zzz/account.json'])
        self.assertEqual(current['source'], base['zzz']['source'])
        self.assertEqual(current['characters'][0]['legacyObservation'], original_character)
        self.assertIn(original_character['evidence'][0], current['characters'][0]['evidence'])

    def test_partial_payload_and_source_identity_mismatch_stop_without_mutating_inputs(self):
        base, snapshot = inputs()
        incomplete = deepcopy(snapshot)
        incomplete['zzz']['complete'] = False
        with self.assertRaises(SyncError):
            prepare(base, incomplete, STAMP)
        first = prepare(base, snapshot, STAMP)
        saved = saved_base(first, base)
        saved['manifests'][0]['extraction']['sha256'] = '0' * 64
        before = deepcopy(saved)
        with self.assertRaises(SyncError):
            prepare(saved, snapshot, LATER)
        self.assertEqual(saved, before)


    def test_metadata_only_changes_link_existing_characters_without_counting_updates(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        for game in ('genshin', 'zzz'):
            before = deepcopy(saved[game])
            after = deepcopy(saved[game])
            if game == 'genshin':
                before['characters'][0].pop('hoyolab_id')
                for kind in ('weapons', 'artifacts'):
                    for record in before[kind]:
                        record.pop('hoyolab_id', None)
                after['characters'][0]['provenance']['notes'].append('新來源註記')
            else:
                before['characters'][0].pop('sync')
                after['characters'][0]['evidence'].append({'sourceId': 'another', 'record': '/zzz/characters/0'})
            summary = review_summary(game, before, after, {'warnings': ['保留既有警告']})
            self.assertEqual(summary['added_characters'], 0)
            self.assertEqual(summary['updated_characters'], 0)
            self.assertEqual(summary['linked_characters'], 1)
            self.assertEqual(summary['unchanged_characters'], 1)
            self.assertEqual(summary['changes'], [])
            self.assertEqual(summary['warnings'], ['保留既有警告'])

    def test_new_observation_metadata_does_not_claim_game_values_changed(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        recorded_again = deepcopy(snapshot)
        recorded_again['genshin']['warnings'].append('本輪額外來源註記')
        preview = prepare(saved, recorded_again, LATER)
        self.assertTrue(preview['changed'])
        for game in ('genshin', 'zzz'):
            self.assertEqual(preview['summary'][game]['updated_characters'], 0)
            self.assertEqual(preview['summary'][game]['linked_characters'], 0)
            self.assertEqual(preview['summary'][game]['changes'], [])

    def test_review_fields_show_real_character_skill_panel_equipment_and_roll_values(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        before_gi, after_gi = deepcopy(saved['genshin']), deepcopy(saved['genshin'])
        before_gi['characters'][0]['constellation'] = None
        after_gi['characters'][0]['constellation'] = 0
        after_gi['characters'][0]['level']['current'] = 96
        after_gi['characters'][0]['talents']['displayed']['skill'] = 10
        after_gi['characters'][0]['talents']['base']['skill'] = 7
        next(stat for stat in after_gi['panel_snapshots'][0]['stats'] if stat['key'] == 'hp')['value'] += 1
        after_gi['weapons'][0]['refinement'] = 2
        before_gi['artifacts'][0]['main_stat']['value'] = None
        after_gi['artifacts'][0]['substats'][0]['value'] = 40
        after_gi['artifacts'][0]['substat_rolls']['values'][0]['enhancements'] = 2
        summary = review_summary('genshin', before_gi, after_gi, {})
        self.assertEqual(summary['updated_characters'], 1)
        fields = {f['key']: f for f in summary['changes'][0]['fields']}
        for key in ('constellation', 'level.current', 'talents.displayed.skill', 'talents.base.skill', 'panel.hp', 'weapon.refinement', 'artifacts.flower.main_stat', 'artifacts.flower.substats.atk.value', 'artifacts.flower.substats.atk.enhancements'):
            self.assertIn(key, fields)
        self.assertIsNone(fields['constellation']['before'])
        self.assertEqual(fields['constellation']['after'], 0)
        self.assertEqual(fields['artifacts.flower.substats.atk.enhancements']['before'], 1)
        self.assertEqual(fields['artifacts.flower.substats.atk.enhancements']['after'], 2)
        before_zzz, after_zzz = deepcopy(saved['zzz']), deepcopy(saved['zzz'])
        before_zzz['characters'][0]['mindscape'] = None
        row = after_zzz['characters'][0]
        row['mindscape'] = 0
        row['skills']['普通攻擊'] = 12
        row['stats']['生命值'] += 1
        row['wEngine']['refinement'] = 3
        before_zzz['characters'][0]['driveDiscs'][0]['mainStat']['value'] = None
        row['driveDiscs'][0]['substats'][0].update(value=6, enhancementCount=1)
        summary = review_summary('zzz', before_zzz, after_zzz, {})
        fields = {f['key']: f for f in summary['changes'][0]['fields']}
        for key in ('mindscape', 'skills.普通攻擊', 'stats.生命值', 'wEngine.refinement', 'driveDiscs.1.mainStat', 'driveDiscs.1.substats.生命值|percent.value', 'driveDiscs.1.substats.生命值|percent.enhancementCount'):
            self.assertIn(key, fields)
        self.assertIsNone(fields['mindscape']['before'])
        self.assertEqual(fields['mindscape']['after'], 0)
        for field in fields.values():
            self.assertIsInstance(field['before'], (str, int, float, bool, type(None)))
            self.assertIsInstance(field['after'], (str, int, float, bool, type(None)))

    def test_actual_prepare_reports_explicit_unloading_and_preserves_inventories(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        unloaded = deepcopy(snapshot)
        unloaded['genshin']['characters'][0]['weapon'] = None
        unloaded['genshin']['characters'][0]['artifacts'] = []
        unloaded['zzz']['characters'][0]['wEngine'] = None
        unloaded['zzz']['characters'][0]['driveDiscs'] = []
        preview = prepare(saved, unloaded, LATER)
        gi_fields = {f['key']: f for f in preview['summary']['genshin']['changes'][0]['fields']}
        self.assertEqual(gi_fields['weapon.equipped']['after'], '未裝備')
        self.assertEqual(gi_fields['artifacts.flower.equipped']['after'], '未裝備')
        zzz_fields = {f['key']: f for f in preview['summary']['zzz']['changes'][0]['fields']}
        self.assertEqual(zzz_fields['driveDiscs.1.equipped']['after'], '未裝備')
        self.assertEqual(zzz_fields['driveDiscs.observation']['after'], '未裝備')
        candidate = json.loads(preview['files']['data/account.json'])
        self.assertEqual(len(candidate['weapons']), len(saved['genshin']['weapons']))
        self.assertEqual(len(candidate['artifacts']), len(saved['genshin']['artifacts']))

    def test_stable_equipment_transfer_and_different_identical_item_are_reviewable(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        before = deepcopy(saved['genshin'])
        first = before['characters'][0]
        other = deepcopy(first)
        other.update(id='other', name='測試隊友', hoyolab_id=99999, panel_snapshot_id=None)
        before['characters'].append(other)
        before['equipment']['other'] = {'weapon_id': None, 'artifacts': dict.fromkeys(before['equipment'][first['id']]['artifacts'])}
        after = deepcopy(before)
        weapon_id = before['equipment'][first['id']]['weapon_id']
        after['equipment'][first['id']]['weapon_id'] = None
        after['equipment']['other']['weapon_id'] = weapon_id
        summary = review_summary('genshin', before, after, {})
        self.assertEqual(summary['updated_characters'], 2)
        changes = {c['id']: c for c in summary['changes']}
        incoming = {f['key']: f for f in changes['other']['fields']}['weapon.equipped.from']
        self.assertEqual((incoming['before'], incoming['after']), (first['name'], '測試隊友'))
        outgoing = {f['key']: f for f in changes[first['id']]['fields']}['weapon.equipped.to']
        self.assertEqual((outgoing['before'], outgoing['after']), (first['name'], '測試隊友'))
        before = deepcopy(saved['genshin'])
        twin = deepcopy(before['weapons'][0]);twin['id'] += '_other'
        before['weapons'].append(twin)
        after = deepcopy(before)
        after['equipment'][after['characters'][0]['id']]['weapon_id'] = twin['id']
        summary = review_summary('genshin', before, after, {})
        field = next(f for f in summary['changes'][0]['fields'] if f['key'] == 'weapon.equipped')
        self.assertIn('另一件同名裝備', field['after'])
        self.assertNotEqual(field['before'], field['after'])

    def test_formatting_order_and_observation_ids_do_not_create_false_changes(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        for game in ('genshin', 'zzz'):
            before, after = deepcopy(saved[game]), deepcopy(saved[game])
            if game == 'genshin':
                after['panel_snapshots'][0]['stats'].reverse()
                after['artifacts'][0]['substats'].reverse()
                after['artifacts'][0]['substat_rolls']['values'].reverse()
            else:
                before['characters'][0]['stats']['暴擊率'] = '24.0%'
                after['characters'][0]['driveDiscs'].reverse()
                for disc in after['characters'][0]['driveDiscs']:
                    disc['id'] += '_new_observation'
                    disc['substats'].reverse()
            summary = review_summary(game, before, after, {})
            self.assertEqual(summary['updated_characters'], 0)
            self.assertEqual(summary['changes'], [])

    def test_zzz_unknown_disc_observation_is_distinct_from_known_empty(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        before, after = deepcopy(saved['zzz']), deepcopy(saved['zzz'])
        before['characters'][0]['driveDiscs'] = None
        after['characters'][0]['driveDiscs'] = []
        summary = review_summary('zzz', before, after, {})
        field = next(f for f in summary['changes'][0]['fields'] if f['key'] == 'driveDiscs.observation')
        self.assertIsNone(field['before'])
        self.assertEqual(field['after'], '未裝備')
        after['characters'][0]['driveDiscs'] = None
        self.assertEqual(review_summary('zzz', before, after, {})['changes'], [])


    def test_mainstat_numeric_formatting_keeps_real_changes_and_unknown_to_zero(self):
        base, snapshot = inputs()
        saved = saved_base(prepare(base, snapshot, STAMP), base)
        before, after = deepcopy(saved['zzz']), deepcopy(saved['zzz'])
        for slot, value in ((2, 316), (3, 184)):
            next(d for d in before['characters'][0]['driveDiscs'] if d['slot'] == slot)['mainStat']['value'] = float(value)
            next(d for d in after['characters'][0]['driveDiscs'] if d['slot'] == slot)['mainStat']['value'] = value
        self.assertEqual(review_summary('zzz', before, after, {})['changes'], [])
        old_disc = next(d for d in before['characters'][0]['driveDiscs'] if d['slot'] == 2)
        new_disc = next(d for d in after['characters'][0]['driveDiscs'] if d['slot'] == 2)
        new_disc['mainStat']['value'] = 317
        fields = review_summary('zzz', before, after, {})['changes'][0]['fields']
        self.assertEqual(len(fields), 1)
        self.assertEqual((fields[0]['before'], fields[0]['after']), ('攻擊力 316', '攻擊力 317'))
        old_disc['mainStat']['value'], new_disc['mainStat']['value'] = None, 0
        fields = review_summary('zzz', before, after, {})['changes'][0]['fields']
        self.assertEqual((fields[0]['before'], fields[0]['after']), ('攻擊力 未知', '攻擊力 0'))
        old_disc['mainStat']['value'], new_disc['mainStat']['value'] = 316.0001, 316.0002
        self.assertEqual(review_summary('zzz', before, after, {})['updated_characters'], 1)
        before, after = deepcopy(saved['genshin']), deepcopy(saved['genshin'])
        before['artifacts'][0]['main_stat']['value'] = 4780.0
        after['artifacts'][0]['main_stat']['value'] = 4780
        self.assertEqual(review_summary('genshin', before, after, {})['changes'], [])

    def test_verification_counts_worn_items_and_keeps_unknown_and_assessed_distinct(self):
        base, snapshot = inputs()
        candidate = saved_base(prepare(base, snapshot, STAMP), base)
        gi = candidate['genshin']
        cid = gi['characters'][0]['id']
        gi['characters'][0]['talents']['base'] = {'normal': 0, 'skill': None, 'burst': 10}
        worn = next(item for item in gi['artifacts'] if item['id'] == gi['equipment'][cid]['artifacts']['flower'])
        observation = worn['substat_rolls']
        observation.update(character_id=cid, rule_id='reviewed_rule', effective_keys=['crit_rate'])
        observation['values'] = [
            {'key': 'crit_rate', 'enhancements': 0, 'effective': False, 'assessed_effective': True},
            {'key': 'atk_pct', 'enhancements': 1, 'effective': None, 'assessed_effective': False},
            {'key': 'hp', 'enhancements': None, 'effective': None, 'assessed_effective': None},
        ]
        gi['equipment'][cid]['artifacts'] = {'flower': worn['id']}
        other = deepcopy(worn); other['id'] = 'not_worn'; gi['artifacts'].append(other)
        report = verification_summary('genshin', gi)
        self.assertEqual(report['base_levels'], {'known': 2, 'total': 3})
        self.assertEqual(report['effective'], {'observed': 1, 'assessed': 1, 'unknown': 1, 'total': 3})
        self.assertEqual(report['enhancements'], {'known': 2, 'derived': 0, 'total': 3})
        observation['character_id'] = 'someone_else'
        self.assertEqual(verification_summary('genshin', gi)['effective']['unknown'], 3)

    def test_zzz_verification_counts_fixed_rolls_as_derived_and_core_separately(self):
        base, snapshot = inputs()
        zzz_account = saved_base(prepare(base, snapshot, STAMP), base)['zzz']
        character = zzz_account['characters'][0]
        character['skillsBase'] = {'普通攻擊': 0, '閃避': 12, '核心技': 'F'}
        character['driveDiscs'] = [{'assessment': {'method': 'role_rule', 'ruleId': 'reviewed_rule'}, 'effectiveKeys': ['攻擊力|percent'],
                                   'substats': [{'isEffective': None, 'assessedEffective': True, 'enhancementCount': 0, 'enhancementSource': 'derived_fixed_roll'},
                                                {'isEffective': False, 'assessedEffective': True, 'enhancementCount': None}]}]
        report = verification_summary('zzz', zzz_account)
        self.assertEqual(report['base_levels'], {'known': 2, 'total': 5})
        self.assertEqual(report['effective'], {'observed': 1, 'assessed': 1, 'unknown': 0, 'total': 2})
        self.assertEqual(report['enhancements'], {'known': 1, 'derived': 1, 'total': 2})

    def test_build_based_rule_survives_substat_changes_and_stops_after_set_change(self):
        original, observation = GI.first()
        cid = original['characters'][0]['id']
        incoming = observation['characters'][0]
        rule = {'rule_id': 'current_build_rule', 'effective_keys': ['crit_rate'], 'known_ineffective_keys': [],
                'artifact_context': sorted([{'slot': item['slot'], 'set_name': item['set_name'],
                                            'main_stat_key': item['main_stat']['key']} for item in incoming['artifacts']], key=lambda item: item['slot'])}
        changed = deepcopy(observation)
        changed['characters'][0]['artifacts'][0]['substats'][0]['value'] += 1
        key = f"genshin:{incoming['api_id']}:flower"
        source = {**GI.SOURCE, 'id': 'hoyolab_test_b', 'resolutions': {key: original['equipment'][cid]['artifacts']['flower']}}
        candidate, _ = genshin.merge(original, changed, source, {cid: rule})
        worn_id = candidate['equipment'][cid]['artifacts']['flower']
        worn = next(item for item in candidate['artifacts'] if item['id'] == worn_id)
        self.assertEqual(worn['substat_rolls']['rule_id'], rule['rule_id'])
        changed['characters'][0]['artifacts'][0]['set_name'] = '另一套裝'
        source['resolutions'][key] = 'new'
        candidate, summary = genshin.merge(original, changed, source, {cid: rule})
        worn_id = candidate['equipment'][cid]['artifacts']['flower']
        worn = next(item for item in candidate['artifacts'] if item['id'] == worn_id)
        self.assertNotIn('rule_id', worn['substat_rolls'])
        self.assertTrue(any('情境已變' in note for note in summary['warnings']))
        self.assertTrue(all(row['assessed_effective'] is None for row in worn['substat_rolls']['values']))


if __name__ == '__main__':
    unittest.main()
