import json
from pathlib import Path
import tempfile
import unittest
from tools.hoyolab_sync import cache
from tools.hoyolab_sync.engine import SyncError


class CacheTests(unittest.TestCase):
    def test_only_sanitized_game_draft_is_saved_privately_and_can_be_cleared(self):
        snapshot={'genshin':{'complete':True,'characters':[{'api_id':1}]},'zzz':{'complete':True,'characters':[{'api_id':2}]}}
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'private'/'preview.json'
            cache.save(snapshot,'2026-11-16T09:00:00Z',path)
            self.assertEqual(cache.load(path)['snapshot'],snapshot)
            self.assertEqual(path.stat().st_mode&0o777,0o600)
            self.assertEqual(path.parent.stat().st_mode&0o777,0o700)
            cache.clear(path)
            self.assertIsNone(cache.load(path))

    def test_credentials_and_tampered_drafts_are_rejected(self):
        snapshot={'genshin':{'complete':True,'characters':[{'api_id':1}]},'zzz':{'complete':True,'characters':[{'api_id':2}]}}
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'preview.json'
            with self.assertRaises(SyncError):cache.save({**snapshot,'ltoken_v2':'not-a-real-token'},'2026-11-16T09:00:00Z',path)
            self.assertFalse(path.exists())
            cache.save(snapshot,'2026-11-16T09:00:00Z',path)
            document=json.loads(path.read_text());document['snapshot']['genshin']['characters'][0]['api_id']=3
            path.write_text(json.dumps(document))
            with self.assertRaises(ValueError):cache.load(path)
