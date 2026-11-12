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

 def disc_account(self):
  a=copy.deepcopy(BASE)
  a['characters'][0]['driveDiscs']=[{'id':'test_slot_1_video001','slot':1,'setName':'測試','rarity':'S','level':15,'mainStat':{'name':'生命值','value':2200,'unit':'flat'},'substats':[{'name':'攻擊力','value':9,'unit':'percent','isEffective':True,'enhancementCount':2},{'name':'防禦力','value':19,'unit':'flat','isEffective':False,'enhancementCount':0}],'substatsComplete':True,'effectiveRollCount':3,'evidence':copy.deepcopy(a['characters'][0]['evidence']),'uncertainties':[]}]
  return a
 def test_effective_rolls_observed(self): self.assertEqual(m.validate(self.disc_account(),check_files=False),[])
 def test_wrong_effective_total(self):
  a=self.disc_account();a['characters'][0]['driveDiscs'][0]['effectiveRollCount']=2;self.assertTrue(m.validate(a,check_files=False))
 def test_unknown_roll_count_must_stay_unknown(self):
  a=self.disc_account();d=a['characters'][0]['driveDiscs'][0];d['substats'][0]['enhancementCount']=None;d['effectiveRollCount']=None;self.assertEqual(m.validate(a,check_files=False),[])
 def test_unknown_effectiveness_must_stay_unknown(self):
  a=self.disc_account();d=a['characters'][0]['driveDiscs'][0];d['substats'][1]['isEffective']=None;self.assertTrue(m.validate(a,check_files=False));d['effectiveRollCount']=None;self.assertEqual(m.validate(a,check_files=False),[])
 def test_incomplete_substats_total_unknown(self):
  a=self.disc_account();d=a['characters'][0]['driveDiscs'][0];d['substatsComplete']=False;d['effectiveRollCount']=None;self.assertEqual(m.validate(a,check_files=False),[])
 def test_duplicate_slot_rejected(self):
  a=self.disc_account();a['characters'][0]['driveDiscs']*=2;self.assertTrue(m.validate(a,check_files=False))

 def test_flat_and_percent_are_distinct(self):
  a=self.disc_account();d=a['characters'][0]['driveDiscs'][0];d['substats'][1]['name']='攻擊力';self.assertEqual(m.validate(a,check_files=False),[])
 def test_stats_effective_must_reference_observed_label(self):
  a=copy.deepcopy(BASE);a['characters'][0]['statsEffective']={'不存在':True};self.assertTrue(m.validate(a,check_files=False))

if __name__=='__main__': unittest.main()
