import copy
import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location('validate_zzz', Path(__file__).resolve().parents[1] / 'scripts/validate_zzz.py')
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
BASE = {'schemaVersion':1,'game':'zzz','source':{'filename':'source.MP4','sha256':'a'*64,'durationSeconds':10,'capturedAt':None},'characters':[{'id':'test','name':'測試','level':60,'mindscape':None,'stats':{'暴擊率':'12.2%'},'skills':None,'wEngine':None,'driveDiscs':None,'evidence':[{'timestampSec':2,'framePath':'evidence/zzz/video_001/f002.jpg','sha256':'b'*64}],'uncertainties':[]}]}
class TestZzz(unittest.TestCase):
 def test_null_is_valid(self): self.assertEqual(m.validate(BASE,check_files=False),[])
 def test_duplicates(self):
  a=copy.deepcopy(BASE);a['characters']*=2;self.assertTrue(m.validate(a,check_files=False))
 def test_unsafe_path(self):
  a=copy.deepcopy(BASE);a['characters'][0]['evidence'][0]['framePath']='evidence/zzz/../secret.jpg';self.assertTrue(m.validate(a,check_files=False))
 def test_timestamp_outside_source(self):
  a=copy.deepcopy(BASE);a['characters'][0]['evidence'][0]['timestampSec']=11;self.assertTrue(m.validate(a,check_files=False))
 def test_wrong_game(self):
  a=copy.deepcopy(BASE);a['game']='genshin';self.assertTrue(m.validate(a,check_files=False))
 def test_evidence_required(self):
  a=copy.deepcopy(BASE);a['characters'][0]['evidence']=[];self.assertTrue(m.validate(a,check_files=False))
if __name__=='__main__': unittest.main()
