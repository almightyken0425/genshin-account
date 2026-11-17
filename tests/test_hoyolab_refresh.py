from copy import deepcopy
import json
from pathlib import Path
import unittest
from tools.hoyolab_sync.refresh import refresh_skills, refresh_snapshot
from tools.hoyolab_sync.engine import assert_sanitized


class RefreshTests(unittest.TestCase):
 def sample(self):
  return {'genshin':{'complete':True,'characters':[{'api_id':10000007,'element':'cryo','name':'旅行者','skills':[{'id':7,'level':0,'unlocked':True},{'id':8,'level':4,'unlocked':True},{'id':9,'level':7,'unlocked':True}], 'talents':{'base':{'normal':None,'skill':None,'burst':None},'displayed':{'normal':None,'skill':None,'burst':None},'bonus_context':None}}],'warnings':['旅行者：公開技能ID對照尚未確認，三項天賦保持未知。']},'zzz':{'complete':True,'characters':[]}}
 def test_verified_ids_fill_displayed_levels_without_login_or_base_inference(self):
  snapshot=self.sample();original=deepcopy(snapshot)
  meta={'skill_order':{'10000007:cryo':[7,8,9]},'source':{'commit':'a'*40}}
  refreshed,names=refresh_skills(snapshot,meta)
  talents=refreshed['genshin']['characters'][0]['talents']
  self.assertEqual(talents['displayed'],{'normal':0,'skill':4,'burst':7})
  self.assertEqual(talents['base'],{'normal':None,'skill':None,'burst':None})
  self.assertEqual(names,['旅行者']);self.assertEqual(refreshed['genshin']['warnings'],[])
  self.assertEqual(snapshot,original)
  repeated,again=refresh_skills(refreshed,meta);self.assertEqual(repeated,refreshed);self.assertEqual(again,[])
 def test_unknown_or_wrong_traveler_element_does_not_guess(self):
  for meta in [{'skill_order':{'10000007':[7,8,9]}},{'skill_order':{'10000007:pyro':[7,8,9]}},{'skill_order':{'10000007:cryo':[7,8,10]}}]:
   refreshed,names=refresh_skills(self.sample(),meta)
   self.assertEqual(set(refreshed['genshin']['characters'][0]['talents']['displayed'].values()),{None});self.assertEqual(names,[])

 def test_draft_refresh_derives_bases_without_changing_observations_or_reading_again(self):
  folder=Path(__file__).resolve().parents[1]/'tools/hoyolab_sync/data'
  rule=json.loads((folder/'genshin_talent_rules.json').read_text())['characters']['10000032:pyro']
  levels={'normal':2,'skill':13,'burst':13}
  skills=[{'id':rule['skill_order'][slot],'name':rule['skill_names'][slot],'level':level,'unlocked':True} for slot,level in levels.items()]
  snapshot={'provider':'hoyolab','genshin':{'complete':True,'characters':[{'api_id':10000032,'name':'班尼特','element':'pyro','constellation':5,
            'skills':skills,'talents':{'displayed':levels,'base':dict.fromkeys(levels),'bonus_context':None},'artifacts':[]}]},
            'zzz':{'complete':True,'characters':[{'api_id':1011,'name':'安比','mindscape':5,
            'skills':{'普通攻擊':12,'閃避':12,'支援技':12,'特殊技':12,'連攜技':12,'核心技':'F'},
            'skillContext':{'provider':'hoyolab','levelSemantics':'provider_displayed','coreRawLevel':7},'driveDiscs':[]}]}}
  original=deepcopy(snapshot)
  refreshed,report=refresh_snapshot(snapshot)
  assert_sanitized(refreshed)
  self.assertEqual(snapshot,original)
  self.assertEqual(refreshed['genshin']['characters'][0]['talents']['base'],{'normal':2,'skill':10,'burst':10})
  self.assertEqual(refreshed['genshin']['characters'][0]['talents']['displayed'],levels)
  self.assertEqual(refreshed['zzz']['characters'][0]['skillsBase'],dict.fromkeys(('普通攻擊','閃避','支援技','特殊技','連攜技'),8))
  self.assertEqual(refreshed['zzz']['characters'][0]['skills'],original['zzz']['characters'][0]['skills'])
  self.assertEqual(report['genshin_talents']['unknown_slots'],0)
  for key in ('genshin_talent_rules_sha256','zzz_talent_rules_sha256','effective_rules_sha256','genshin_effective_sources_sha256'):
   self.assertRegex(refreshed['normalization'][key],r'^[a-f0-9]{64}$')
  repeated,_=refresh_snapshot(refreshed)
  self.assertEqual(repeated,refreshed)
