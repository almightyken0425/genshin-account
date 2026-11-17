import copy
import json
import unittest
from pathlib import Path
from tools.hoyolab_sync.genshin import normalize, merge, MergeAmbiguityError, _same, _template, _matching_view

META = {'skill_order': {'10000032:pyro': [101, 102, 103], '10000106:pyro': [101, 102, 103]},
        'character_aliases': {'10000032': 'bennett', '10000106': 'mavuika'}}
SOURCE = {'id': 'hoyolab_test_a', 'retrieved_at': '2026-11-16T08:00:00+00:00',
          'path': 'imports/hoyolab_test_a/normalized.json', 'sha256': '0'*64}


def prop(key, value, times=None):
    result = {'property_type': key, 'value': value}
    if times is not None:
        result['times'] = times
    return result


def raw(api_id=10000032, name='班尼特'):
    return {'base': {'id': api_id, 'name': name, 'element': 'Fire', 'weapon_type': 1,
                     'level': 95, 'actived_constellation_num': 6, 'fetter': 10, 'uid': 'PRIVATE_UID'},
            'skills': [{'skill_id': 103, 'skill_type': 1, 'name': '元素爆發', 'level': 13, 'is_unlock': True},
                       {'skill_id': 999, 'skill_type': 2, 'name': '被動天賦', 'level': 1},
                       {'skill_id': 101, 'skill_type': 1, 'name': '普通攻擊', 'level': 1},
                       {'skill_id': 102, 'skill_type': 1, 'name': '元素戰技', 'level': 9}],
            'constellations': [{'is_actived': True, 'effect': '元素爆發的技能等級提高3級。'},
                               {'is_actived': True, 'effect': '元素戰技的技能等級提高3級。'}],
            'weapon': {'id': 11513, 'name': '測試劍', 'rarity': 5, 'level': 90, 'affix_level': 1,
                       'main_property': prop(4, '500'), 'sub_property': prop(20, '20%'), 'icon': 'https://private.invalid/token'},
            'relics': [{'id': 14001, 'name': '測試花', 'set': {'name': '測試套裝'}, 'pos': 1, 'rarity': 5, 'level': 20,
                        'main_property': prop(2, '4780'), 'sub_property_list': [prop(5, '39', 1), prop(22, '19.4%', 2), prop(20, '6.2%', 1), prop(3, '5.8%', 0)]}],
            'base_properties': [prop(2000, '16,621'), prop(2001, '2437')],
            'extra_properties': [prop(20, '61.1%')], 'element_properties': [],
            'selected_properties': [], 'cookie_token': 'PRIVATE_TOKEN', 'uid': 'PRIVATE_UID'}


def empty():
    return {'schema_version': 3, 'updated_at': '2026-11-01T00:00:00+00:00', 'source_ids': [],
            'coverage': {'roster': 'partial', 'inventory': 'partial', 'notes': []},
            'characters': [], 'weapons': [], 'artifacts': [], 'equipment': {}, 'panel_snapshots': [], 'teams': []}


def first():
    normalized = normalize([raw()], META)
    account, _ = merge(empty(), normalized, SOURCE)
    return account, normalized


class GenshinSyncTests(unittest.TestCase):
    def test_normalize_allowlist_id_mapping_and_proved_constellation_boost_only(self):
        result = normalize([raw()], META)
        text = json.dumps(result, ensure_ascii=False)
        for forbidden in ('PRIVATE_UID', 'PRIVATE_TOKEN', 'private.invalid', 'icon', 'cookie_token'):
            self.assertNotIn(forbidden, text)
        char = result['characters'][0]
        self.assertEqual(char['api_id'], 10000032)
        self.assertEqual(char['level'], {'current': 95, 'cap': None})
        self.assertEqual(char['talents']['displayed'], {'normal': 1, 'skill': 9, 'burst': 13})
        self.assertEqual(char['talents']['base'], {'normal': None, 'skill': 6, 'burst': 10})
        self.assertEqual([skill['id'] for skill in char['skills']], [101, 102, 103, 999])
        self.assertEqual(char['artifacts'][0]['substats'][0], {'key': 'atk', 'value': 39, 'unit': 'flat'})

    def test_unknown_skill_ids_do_not_fall_back_to_array_position_or_anemo_traveler(self):
        row = raw(99999999, '新角色')
        result = normalize([row], META)['characters'][0]
        self.assertTrue(all(value is None for value in result['talents']['displayed'].values()))
        traveler = raw(10000007, '旅行者');traveler['base']['element'] = 'Ice'
        cryo = normalize([traveler], META)['characters'][0]
        self.assertEqual(cryo['local_id_hint'], 'traveler_cryo')
        self.assertTrue(all(value is None for value in cryo['talents']['displayed'].values()))

    def test_times_is_enhancements_zero_retained_and_missing_not_filled(self):
        row = raw();row['relics'][0]['sub_property_list'][0].pop('times')
        artifact = normalize([row], META)['characters'][0]['artifacts'][0]
        counts = {value['key']: value['enhancements'] for value in artifact['rolls']}
        self.assertIsNone(counts['atk']);self.assertEqual(counts['hp_pct'], 0)
        self.assertEqual(counts['crit_dmg'], 2)
        self.assertTrue(all(value['effective'] is None for value in artifact['rolls']))
        bad = raw();bad['relics'][0]['sub_property_list'][0]['times'] = 5
        with self.assertRaises(ValueError):normalize([bad], META)
        incomplete = raw();incomplete.pop('relics')
        with self.assertRaises(ValueError):normalize([incomplete], META)

    def test_same_payload_is_canonical_when_response_rows_and_substats_reorder(self):
        one = raw();two = copy.deepcopy(one)
        two['skills'].reverse();two['relics'][0]['sub_property_list'].reverse()
        self.assertEqual(normalize([one], META), normalize([two], META))

    def test_publisher_bytes_are_stable_when_skills_and_property_dict_keys_reorder(self):
        from tools.hoyolab_sync.publisher import encoded
        def reverse_keys(value):
            if isinstance(value, dict):
                return {key: reverse_keys(item) for key, item in reversed(list(value.items()))}
            if isinstance(value, list):
                return [reverse_keys(item) for item in value]
            return value
        original = raw()
        reordered = reverse_keys(original)
        reordered['skills'].reverse()
        result = normalize([reordered], META)
        self.assertEqual([skill['id'] for skill in result['characters'][0]['skills']], [101, 102, 103, 999])
        self.assertEqual(encoded(normalize([original], META)), encoded(result))

    def test_stable_ids_old_panels_and_original_effective_observations_are_preserved(self):
        base, normalized = first()
        cid = base['characters'][0]['id']
        base['characters'][0]['id'] = 'bennett';base['equipment']['bennett'] = base['equipment'].pop(cid)
        for panel in base['panel_snapshots']:panel['character_id'] = 'bennett'
        base['artifacts'][0]['substat_rolls']['character_id'] = 'bennett'
        for row in base['artifacts'][0]['substat_rolls']['values']:row['effective'] = row['key'] == 'crit_rate'
        for record in [*base['characters'], *base['weapons'], *base['artifacts']]:record.pop('hoyolab_id', None)
        before = copy.deepcopy(base)
        result, summary = merge(base, normalized, {**SOURCE, 'id': 'hoyolab_test_b'})
        self.assertEqual(base, before)
        self.assertEqual(result['characters'][0]['id'], 'bennett')
        self.assertEqual([record['id'] for record in result['weapons']], [record['id'] for record in base['weapons']])
        self.assertEqual([record['id'] for record in result['artifacts']], [record['id'] for record in base['artifacts']])
        self.assertEqual(result['panel_snapshots'][:len(base['panel_snapshots'])], base['panel_snapshots'])
        values = result['artifacts'][0]['substat_rolls']['values']
        self.assertEqual(next(value for value in values if value['key'] == 'crit_rate')['effective'], True)
        self.assertTrue(summary['changed'])

    def test_rereading_same_payload_does_not_add_sources_panels_or_change_timestamp(self):
        base, normalized = first()
        result, summary = merge(base, normalized, {**SOURCE, 'retrieved_at': '2026-11-17T08:00:00+00:00'})
        self.assertEqual(result, base)
        self.assertFalse(summary['changed'])
        self.assertEqual(summary['changes'], [])

    def test_global_ownership_reservation_prevents_new_character_stealing_existing_item(self):
        base, _ = first()
        other = raw(10000106, '瑪薇卡')
        normalized = normalize([other, raw()], META)
        result, _ = merge(base, normalized, {**SOURCE, 'id': 'hoyolab_two'})
        self.assertEqual(len(result['weapons']), 2);self.assertEqual(len(result['artifacts']), 2)
        equipment = list(result['equipment'].values())
        self.assertNotEqual(equipment[0]['weapon_id'], equipment[1]['weapon_id'])
        with self.assertRaises(ValueError):merge(base, normalized, {**SOURCE, 'resolutions': {'genshin:10000106:weapon': base['weapons'][0]['id']}})

    def test_many_new_characters_with_occupied_templates_need_no_new_only_choices(self):
        base, _ = first()
        normalized = normalize([raw(), *[raw(10000200+index, '新持有角色'+str(index)) for index in range(30)]], META)
        result, summary = merge(base, normalized, {**SOURCE, 'id': 'hoyolab_many'})
        self.assertEqual(len(result['characters']), 31)
        self.assertEqual(len(result['weapons']), 31)
        self.assertEqual(len(result['artifacts']), 31)
        self.assertEqual(summary['ambiguities'], [])
        self.assertEqual(len({equipment['weapon_id'] for equipment in result['equipment'].values()}), 31)

    def test_upgraded_binding_requires_explicit_resolution_and_reuses_selected_stable_id(self):
        base, _ = first();row = raw();row['weapon']['level'] = 80
        normalized = normalize([row], META)
        with self.assertRaises(MergeAmbiguityError) as caught:merge(base, normalized, {**SOURCE, 'id': 'hoyolab_upgrade'})
        self.assertEqual(caught.exception.choices[0]['key'], 'genshin:10000032:weapon')
        self.assertEqual(caught.exception.choices[0]['name'], '班尼特・武器')
        self.assertIn('等級 80', caught.exception.choices[0]['incoming_label'])
        self.assertIn('暴擊率 20%', caught.exception.choices[0]['incoming_label'])
        self.assertIn('等級 90', caught.exception.choices[0]['options'][0]['label'])
        self.assertIn('原持有者 班尼特', caught.exception.choices[0]['options'][0]['label'])
        result, _ = merge(base, normalized, {**SOURCE, 'id': 'hoyolab_upgrade', 'resolutions': {'genshin:10000032:weapon': base['weapons'][0]['id']}})
        self.assertEqual(result['weapons'][0]['id'], base['weapons'][0]['id'])
        self.assertEqual(result['weapons'][0]['level']['current'], 80)
        self.assertEqual(result['panel_snapshots'][:len(base['panel_snapshots'])], base['panel_snapshots'])

    def test_multiple_exact_inventory_matches_are_exposed_as_public_choices(self):
        base, normalized = first();cid = base['characters'][0]['id']
        duplicate = copy.deepcopy(base['weapons'][0]);duplicate['id'] = 'other_weapon'
        base['weapons'].append(duplicate);base['equipment'][cid]['weapon_id'] = None
        with self.assertRaises(MergeAmbiguityError) as caught:merge(base, normalized, SOURCE)
        options = caught.exception.choices[0]['options']
        self.assertEqual({option['id'] for option in options}, {base['weapons'][0]['id'], 'other_weapon', 'new'})
        with self.assertRaises(ValueError):merge(base, normalized, {**SOURCE, 'resolutions': {'genshin:10000032:weapon': base['artifacts'][0]['id']}})

    def test_manual_resolutions_cannot_assign_one_existing_item_twice(self):
        base, _ = first()
        cid = base['characters'][0]['id']
        base['equipment'][cid]['weapon_id'] = None
        normalized = normalize([raw(), raw(10000106, '瑪薇卡')], META)
        original = copy.deepcopy(base)
        weapon_id = base['weapons'][0]['id']
        with self.assertRaisesRegex(ValueError, 'multiply occupied'):
            merge(base, normalized, {**SOURCE, 'resolutions': {'genshin:10000032:weapon': weapon_id, 'genshin:10000106:weapon': weapon_id}})
        self.assertEqual(base, original)

    def test_manual_upgrade_identity_is_reserved_before_new_character_automatic_match(self):
        base, _ = first()
        weapon_id = base['weapons'][0]['id']
        upgraded = raw();upgraded['weapon']['level'] = 80
        new_character = raw(10000001, '先列出的新角色')
        normalized = normalize([new_character, upgraded], META)
        candidate, _ = merge(base, normalized, {**SOURCE, 'id': 'hoyolab_explicit_upgrade', 'resolutions': {'genshin:10000032:weapon': weapon_id}})
        ids = {character['hoyolab_id']: character['id'] for character in candidate['characters']}
        self.assertEqual(candidate['equipment'][ids[10000032]]['weapon_id'], weapon_id)
        self.assertNotEqual(candidate['equipment'][ids[10000001]]['weapon_id'], weapon_id)
        self.assertEqual(len(candidate['weapons']), 2)

    def test_weapon_swap_and_subsequent_reread_keep_both_existing_ids(self):
        one, two = raw(), raw(10000106, '瑪薇卡')
        two['weapon']['affix_level'] = 2
        base, _ = merge(empty(), normalize([one, two], META), SOURCE)
        ids = {char['hoyolab_id']: char['id'] for char in base['characters']}
        original_equipment = copy.deepcopy(base['equipment'])
        one['weapon'], two['weapon'] = two['weapon'], one['weapon']
        normalized = normalize([one, two], META)
        swap_source = {**SOURCE, 'id': 'hoyolab_swap'}
        swapped, _ = merge(base, normalized, swap_source)
        self.assertEqual(swapped['equipment'][ids[10000032]]['weapon_id'], original_equipment[ids[10000106]]['weapon_id'])
        self.assertEqual(swapped['equipment'][ids[10000106]]['weapon_id'], original_equipment[ids[10000032]]['weapon_id'])
        self.assertEqual(len(swapped['weapons']), 2)
        reread, summary = merge(swapped, normalized, swap_source)
        self.assertEqual(reread, swapped)
        self.assertFalse(summary['changed'])

    def test_returning_to_prior_payload_reuses_exact_snapshot_without_rewriting_history(self):
        base, normalized = first()
        weapon_id = base['weapons'][0]['id']
        row = raw();row['weapon']['level'] = 80
        changed, _ = merge(base, normalize([row], META), {**SOURCE, 'id': 'hoyolab_changed', 'resolutions': {'genshin:10000032:weapon': weapon_id}})
        history = copy.deepcopy(changed['panel_snapshots'])
        returned, _ = merge(changed, normalized, {**SOURCE, 'resolutions': {'genshin:10000032:weapon': weapon_id}})
        self.assertEqual(returned['panel_snapshots'], history)
        self.assertEqual(returned['characters'][0]['panel_snapshot_id'], base['characters'][0]['panel_snapshot_id'])
        self.assertEqual(returned['weapons'][0]['id'], weapon_id)
        corrupted = copy.deepcopy(changed)
        corrupted['panel_snapshots'][0]['build_fingerprint'] = '0'*64
        with self.assertRaisesRegex(ValueError, 'identity collision'):
            merge(corrupted, normalized, {**SOURCE, 'resolutions': {'genshin:10000032:weapon': weapon_id}})

    def test_artifact_upgrade_choice_compares_main_and_substats_and_retains_id(self):
        before = raw()
        before['relics'][0]['level'] = 16
        before['relics'][0]['main_property']['value'] = '3967'
        before['relics'][0]['sub_property_list'][1] = prop(22, '13.2%', 1)
        base, _ = merge(empty(), normalize([before], META), SOURCE)
        artifact_id = base['artifacts'][0]['id']
        normalized = normalize([raw()], META)
        upgrade_source = {**SOURCE, 'id': 'hoyolab_artifact_upgrade'}
        with self.assertRaises(MergeAmbiguityError) as caught:
            merge(base, normalized, upgrade_source)
        choice = caught.exception.choices[0]
        self.assertEqual(choice['name'], '班尼特・生之花')
        for detail in ('等級 20', '主詞條 生命值 4780', '暴擊傷害 19.4%'):
            self.assertIn(detail, choice['incoming_label'])
        for detail in ('等級 16', '主詞條 生命值 3967', '暴擊傷害 13.2%', '原持有者 班尼特'):
            self.assertIn(detail, choice['options'][0]['label'])
        upgraded, _ = merge(base, normalized, {**upgrade_source, 'resolutions': {choice['key']: artifact_id}})
        self.assertEqual(upgraded['artifacts'][0]['id'], artifact_id)
        self.assertEqual(upgraded['artifacts'][0]['level'], 20)
        self.assertEqual(upgraded['panel_snapshots'][:len(base['panel_snapshots'])], base['panel_snapshots'])
        reread, summary = merge(upgraded, normalized, upgrade_source)
        self.assertEqual(reread, upgraded)
        self.assertFalse(summary['changed'])

    def test_impossible_same_template_artifacts_are_new_and_cached_old_choice_requires_confirmation(self):
        row = raw();row['relics'][0]['pos'] = 4
        row['relics'][0]['main_property'] = prop(6, '46.6%')
        base, _ = merge(empty(), normalize([row], META), SOURCE)
        artifact_id = base['artifacts'][0]['id']
        variants = []
        main = copy.deepcopy(row);main['relics'][0]['main_property'] = prop(40, '46.6%');variants.append(main)
        keys = copy.deepcopy(row);keys['relics'][0]['sub_property_list'][0] = prop(8, '39', 1);variants.append(keys)
        rarity = copy.deepcopy(row);rarity['relics'][0].update(rarity=4, level=16);variants.append(rarity)
        for index, changed in enumerate(variants):
            with self.subTest(index=index):
                incoming = normalize([changed], META)
                source = {**SOURCE, 'id': 'hoyolab_invariants_'+str(index)}
                candidate, _ = merge(base, incoming, source)
                self.assertEqual(len(candidate['artifacts']), 2)
                self.assertNotEqual(candidate['equipment'][candidate['characters'][0]['id']]['artifacts']['goblet'], artifact_id)
                original = copy.deepcopy(base)
                with self.assertRaises(MergeAmbiguityError) as caught:
                    merge(base, incoming, {**source, 'resolutions': {'genshin:10000032:goblet': artifact_id}})
                choice = caught.exception.choices[0]
                self.assertIs(choice['requires_confirmation'], True)
                self.assertIn('不符', choice['conflict_reason'])
                self.assertEqual(choice['options'], [{'id': 'new', 'label': '這是另一件裝備'}])
                self.assertIn('incoming_label', choice)
                self.assertEqual(base, original)
                confirmed, _ = merge(base, incoming, {**source, 'resolutions': {choice['key']: 'new'}})
                self.assertEqual(confirmed, candidate)

    def test_reshaping_same_four_keys_remains_plausible_and_three_to_four_unlock_is_allowed(self):
        base, normalized = first()
        existing, incoming = base['artifacts'][0], copy.deepcopy(normalized['characters'][0]['artifacts'][0])
        incoming['substats'][1]['value'] += 1
        self.assertFalse(_same(existing, incoming, 'artifact'))
        self.assertTrue(_template(existing, incoming, 'artifact'))
        three = copy.deepcopy(existing);three['substats'] = three['substats'][:3]
        self.assertTrue(_template(three, incoming, 'artifact'))
        incoming['rarity'] = None
        three['main_stat']['key'] = None
        self.assertTrue(_template(three, incoming, 'artifact'))

    def test_reviewed_ocr_matching_override_is_exactly_guarded_and_never_rewrites_base(self):
        correction = json.loads((Path(__file__).parents[1]/'tools/hoyolab_sync/data/genshin_reviewed_corrections.json').read_text())['corrections'][0]
        original = {'id': correction['artifact_id'], **copy.deepcopy(correction['expected_mechanics']),
                    'substat_rolls': copy.deepcopy(correction['expected_substat_rolls']),
                    'provenance': {'source_ids': ['video_5680_20261111'], 'evidence_refs': [correction['evidence_ref']], 'verification': 'agent_reviewed', 'notes': []}}
        corrected, applied = _matching_view(original)
        self.assertEqual(applied['id'], correction['id'])
        self.assertIn('def', {row['key'] for row in original['substats']})
        self.assertIn('atk', {row['key'] for row in corrected['substats']})
        for field in ('id', 'mechanics', 'evidence', 'rolls'):
            wrong = copy.deepcopy(original)
            if field == 'id':wrong['id'] = 'another_artifact'
            elif field == 'mechanics':wrong['main_stat']['value'] = 46.5
            elif field == 'evidence':wrong['provenance']['evidence_refs'] = ['another_shot']
            else:wrong['substat_rolls']['values'][-1]['enhancements'] = 1
            unchanged, guard = _matching_view(wrong)
            self.assertIsNone(guard)
            self.assertEqual(unchanged, wrong)
        base, normalized = first()
        old_cid = base['characters'][0]['id']
        base['characters'][0]['id'] = 'chasca'
        base['equipment']['chasca'] = base['equipment'].pop(old_cid)
        base['equipment']['chasca']['artifacts'] = dict.fromkeys(base['equipment']['chasca']['artifacts'])
        base['equipment']['chasca']['artifacts']['goblet'] = original['id']
        base['artifacts'] = [copy.deepcopy(original)]
        base['source_ids'].append('video_5680_20261111')
        for panel in base['panel_snapshots']:panel['character_id'] = 'chasca'
        incoming = {**copy.deepcopy(corrected), 'api_id': 14001, 'rolls': copy.deepcopy(corrected['substat_rolls']['values'])}
        for field in ('id', 'substat_rolls', 'provenance'):incoming.pop(field)
        normalized['characters'][0]['artifacts'] = [incoming]
        before = copy.deepcopy(base)
        candidate, summary = merge(base, normalized, {**SOURCE, 'id': 'hoyolab_reviewed_correction'})
        self.assertEqual(base, before)
        self.assertEqual(candidate['equipment']['chasca']['artifacts']['goblet'], original['id'])
        self.assertEqual(candidate['panel_snapshots'][:len(base['panel_snapshots'])], base['panel_snapshots'])
        artifact = candidate['artifacts'][0]
        atk = next(row for row in artifact['substat_rolls']['values'] if row['key'] == 'atk')
        self.assertEqual((atk['enhancements'], atk['effective']), (2, False))
        self.assertIn(correction['note'], artifact['provenance']['notes'])
        self.assertIn(correction['note'], summary['warnings'])
        self.assertEqual(summary['review_overrides'][0]['id'], correction['id'])

    def test_assessed_rules_keep_unknown_distinct_from_ineffective_and_context_bound(self):
        normalized = normalize([raw()], META)
        rules = {'hoyolab_character_10000032': {'rule_id': 'test_rule', 'effective_keys': ['crit_rate'], 'known_ineffective_keys': ['hp_pct'], 'complete': False, 'weapon_name': '測試劍', 'constellation': 6, 'element': 'pyro'}}
        result, _ = merge(empty(), normalized, SOURCE, rules)
        values = {value['key']: value for value in result['artifacts'][0]['substat_rolls']['values']}
        self.assertIs(values['crit_rate']['assessed_effective'], True)
        self.assertIs(values['hp_pct']['assessed_effective'], False)
        self.assertIsNone(values['crit_dmg']['assessed_effective'])
        self.assertTrue(all(value['effective'] is None for value in values.values()))
        rules['hoyolab_character_10000032']['weapon_name'] = '其他武器'
        mismatch, summary = merge(empty(), normalized, SOURCE, rules)
        self.assertTrue(all(value['assessed_effective'] is None for value in mismatch['artifacts'][0]['substat_rolls']['values']))
        self.assertTrue(any('待重確認' in warning for warning in summary['warnings']))
        minimal = {'hoyolab_character_10000032': {'rule_id': 'minimal', 'effective_keys': ['crit_rate']}}
        minimal_result, _ = merge(empty(), normalized, SOURCE, minimal)
        self.assertIsNone(next(value for value in minimal_result['artifacts'][0]['substat_rolls']['values'] if value['key'] == 'atk')['assessed_effective'])

    def test_public_skill_metadata_is_pinned_and_every_order_has_three_distinct_ids(self):
        metadata = json.loads((Path(__file__).parents[1]/'tools/hoyolab_sync/data/genshin_metadata.json').read_text())
        self.assertRegex(metadata['source']['commit'], r'^[a-f0-9]{40}$')
        self.assertIn(metadata['source']['commit'], metadata['source']['url'])
        self.assertEqual(metadata['checked_at'], '2026-11-16')
        self.assertTrue(all(len(order) == len(set(order)) == 3 for order in metadata['skill_order'].values()))

    def test_candidate_passes_current_schema_with_and_without_partial_rules(self):
        import sys
        sys.path.insert(0, str(Path(__file__).parents[1]/'scripts'))
        from validate import validate_account
        normalized = normalize([raw()], META)
        for rules in (None, {'hoyolab_character_10000032': {'rule_id': 'partial', 'effective_keys': ['crit_rate'], 'known_ineffective_keys': ['hp_pct']}}):
            candidate, _ = merge(empty(), normalized, SOURCE, rules)
            errors, _ = validate_account(candidate)
            self.assertEqual(errors, [])
        candidate, _ = first()
        rolls = candidate['artifacts'][0]['substat_rolls']
        self.assertNotIn('rule_id', rolls)
        self.assertNotIn('effective_keys', rolls)
        rolls['values'][0]['effective'] = True
        candidate, _ = merge(candidate, normalized, SOURCE)
        self.assertIs(candidate['artifacts'][0]['substat_rolls']['values'][0]['effective'], True)
        self.assertIsNone(candidate['artifacts'][0]['substat_rolls']['values'][0]['assessed_effective'])
        self.assertEqual(validate_account(candidate)[0], [])


if __name__ == '__main__':unittest.main()
