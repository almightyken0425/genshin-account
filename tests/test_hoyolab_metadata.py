"""Explicit public SkillOrder records map skills independently of response order."""
import json
from pathlib import Path
import unittest

from tools.hoyolab_sync.genshin import normalize

ROOT = Path(__file__).resolve().parents[1]
METADATA = json.loads((ROOT / 'tools/hoyolab_sync/data/genshin_metadata.json').read_text())
COMMIT = '9780bb7dc728cf1862de8e080e9d56e60a7c496b'
# Direct excerpts of SkillOrder from the pinned Enka store/gi/avatars.json.
CASES = [
    ('10000007:cryo', '10000007-705', '旅行者', 'Ice', [100554, 10127, 10128], ['異邦寒芒', '冰霧劍', '聚冰成鋒']),
    ('10000117:cryo', '10000117-11705', '奇偶·男性', 'Ice', [11171, 11172, 111754], ['外域劍術·安謹守望', '戒懲轟擊', '禁入限區']),
    ('10000118:cryo', '10000118-11805', '奇偶·女性', 'Ice', [11171, 11172, 111754], ['外域劍術·安謹守望', '戒懲轟擊', '禁入限區']),
    ('10000125', '10000125', '哥倫比婭', 'Water', [11251, 11252, 11255], ['月露潑降', '萬古潮汐', '她的鄉愁']),
    ('10000126', '10000126', '茲白', 'Rock', [11261, 11262, 11265], ['金鋏點桂', '天地忽然身', '三垣威儀法']),
    ('10000127', '10000127', '葉洛亞', 'Rock', [11271, 11272, 11275], ['守誓槍術', '銜鶯破曉', '鑑照無影']),
    ('10000130', '10000130', '莉奈婭', 'Rock', [11301, 11302, 11305], ['捕獲方案', '對策·露米呀吼吼！', '備忘·絕境生存指南']),
    ('10000137', '10000137', '瓦列里', 'Electric', [30601, 30602, 30605], ['近衛戰法·盾劍攻斥', '攻勢防禦·堡壘驟進', '火力焦點·雷霰急襲']),
    ('10000140', '10000140', '沃雅妮莎', 'Water', [11401, 11402, 11405], ['水色詠嘆', '宣敘·晨聲紛流', '終奏·伴爾沉淪']),
    ('10000148', '10000148', '阿羅夏', 'Electric', [11481, 11482, 11485], ['角槍馳弋', '伏襲霆擊', '守獵進踞']),
    ('10000150', '10000150', '奧黛塔', 'Ice', [11501, 11502, 11505], ['雪鵠變奏', '柔板·幻靈夜舞', '疾板·蒼羽一夢']),
]


def raw(case):
    key, _, name, element, order, names = case
    skills = [{'skill_id': sid, 'name': skill_name, 'level': level, 'is_unlock': True}
              for sid, skill_name, level in zip(order, names, (2, 5, 7))]
    # Passive IDs and deliberately shuffled response order cannot define normal/E/Q.
    return {'base': {'id': int(key.split(':')[0]), 'name': name, 'element': element,
                     'weapon_type': 1, 'level': 60, 'actived_constellation_num': 0, 'fetter': 0},
            'skills': [{'skill_id': 99999999, 'name': '未分類被動', 'level': 1, 'is_unlock': True}, skills[2], skills[0], skills[1]],
            'constellations': [], 'weapon': None, 'relics': [],
            'base_properties': [], 'extra_properties': [], 'element_properties': []}


class PublicSkillMetadataTests(unittest.TestCase):
    def test_all_eleven_orders_have_explicit_pinned_source_records(self):
        for key, record, _, _, order, _ in CASES:
            with self.subTest(key=key):
                self.assertEqual(METADATA['skill_order'][key], order)
                proof = METADATA['skill_order_sources'][key]
                self.assertEqual(proof['commit'], COMMIT)
                self.assertEqual(proof['record'], record)
                self.assertEqual(proof['field'], 'SkillOrder')
                self.assertEqual(proof['classification'], 'primary_client_metadata')
                self.assertEqual(proof['checked_at'], '2026-11-16')
                self.assertEqual(proof['url'], f'https://github.com/EnkaNetwork/API-docs/blob/{COMMIT}/store/gi/avatars.json')

    def test_shuffled_public_skill_ids_map_all_missing_characters(self):
        for case in CASES:
            with self.subTest(character=case[2]):
                row = normalize([raw(case)])['characters'][0]
                self.assertEqual(row['talents']['displayed'], {'normal': 2, 'skill': 5, 'burst': 7})
                self.assertEqual(set(row['talents']['base'].values()), {None})

    def test_manekin_and_traveler_use_element_specific_keys(self):
        self.assertNotIn('10000117', METADATA['skill_order'])
        self.assertNotIn('10000118', METADATA['skill_order'])
        for case in CASES[1:3]:
            row = raw(case)
            row['base']['element'] = 'Water'
            row['skills'][-3]['skill_id'] = 111752
            result = normalize([row])['characters'][0]
            self.assertEqual(set(result['talents']['displayed'].values()), {None})
        self.assertEqual(METADATA['skill_order']['10000007:anemo'], [100553, 10067, 10068])
        self.assertEqual(METADATA['skill_order']['10000007:cryo'], [100554, 10127, 10128])


if __name__ == '__main__':
    unittest.main()
