import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAccount,validateEvidence,fingerprint} from '../lib/account.mjs';
import {validateZzz} from '../lib/zzz-schema.mjs';
import {effectiveSubstatCount,artifactEffectiveKeys,substatRoll} from '../lib/artifact_rolls.mjs';
import {effectiveDiscCount,discEffectiveKeys,discStatEffective} from '../lib/zzz_discs.mjs';
import {renderSummary} from '../lib/report.mjs';

const source='hoyolab_0123456789abcdef',stamp='2026-11-16T08:00:00+00:00';
const original=()=>JSON.parse(readFileSync(new URL('./fixtures/account.json',import.meta.url),'utf8'));
function gi(){
 const account=original();account.schema_version=3;account.source_ids=[source];
 for(const artifact of account.artifacts){const owner=Object.entries(account.equipment).find(([,equipment])=>Object.values(equipment.artifacts).includes(artifact.id))?.[0]??null;artifact.substat_rolls={character_id:owner,values:artifact.substats.map(stat=>({key:stat.key,enhancements:null,effective:null}))}}
 for(const kind of ['characters','weapons','artifacts','panel_snapshots'])for(const row of account[kind])row.provenance={source_ids:[source],evidence_refs:[source+'_observation'],verification:'api_observed',notes:[]};
 return account;
}
const manifest=account=>({id:source,schema_version:3,imported_at:stamp,media:{type:'hoyolab',recorded_at:null},extraction:{path:'imports/hoyolab/'+source+'.json',sha256:'a'.repeat(64)},screenshots:[],observations:[{id:source+'_observation',character_id:account.characters[0].id,kind:'hoyolab',pointer:'/genshin/characters/0'}]});
function zzz(){return {schemaVersion:2,game:'zzz',source:{filename:'old.MP4',sha256:'a'.repeat(64),durationSeconds:10,capturedAt:null},syncSources:[{id:source,provider:'hoyolab',retrievedAt:stamp,path:'imports/hoyolab/'+source+'.json',sha256:'b'.repeat(64)}],characters:[{id:'test',name:'測試',level:60,mindscape:0,stats:{},skills:null,wEngine:null,driveDiscs:null,evidence:[{sourceId:source,record:'/zzz/characters/0'}],uncertainties:[],sync:{apiId:1001,sourceId:source},skillsBase:{'普通攻擊':null},skillContext:{provider:'hoyolab',levelSemantics:'provider_displayed',coreRawLevel:7}}]}}

test('legacy schema remains accepted and API metadata is excluded from fingerprints',()=>{
 const old=original();assert.deepEqual(validateAccount(old),[]);
 const account=gi(),cid=account.characters[0].id,before=fingerprint(account,cid);
 account.characters[0].hoyolab_id=100001;account.weapons[0].hoyolab_id=100002;account.artifacts[0].hoyolab_id=100003;
 assert.deepEqual(validateAccount(account),[]);assert.equal(fingerprint(account,cid),before);
 account.schema_version=2;assert.ok(validateAccount(account).length);
});

test('GI complete role assessment drives counts while observations take precedence',()=>{
 const account=gi(),artifact=account.artifacts[0],cid=artifact.substat_rolls.character_id,observation=artifact.substat_rolls;
 observation.rule_id='test_v1';observation.effective_keys=[...new Set([observation.values[0].key,'em'])];
 for(const row of observation.values)Object.assign(row,{effective:null,assessed_effective:observation.effective_keys.includes(row.key),enhancements:0});
 assert.deepEqual(validateAccount(account),[]);assert.deepEqual(artifactEffectiveKeys([artifact],cid),[...observation.effective_keys].sort());
 const effective=observation.values.filter(row=>row.assessed_effective).length;
 assert.equal(effectiveSubstatCount(artifact,cid),effective);
 const target=observation.values.find(row=>row.assessed_effective);
 if(target){target.effective=false;assert.equal(effectiveSubstatCount(artifact,cid),effective-1);assert.equal(substatRoll(artifact,target.key,cid).effective,false);target.effective=null;target.enhancements=null;assert.equal(effectiveSubstatCount(artifact,cid),null)}
 observation.values[0].assessed_effective=!observation.effective_keys.includes(observation.values[0].key);assert.ok(validateAccount(account).length);
});

test('API evidence accepts explicit source records and rejects unsafe paths and references',()=>{
 const account=gi(),m=manifest(account);assert.deepEqual(validateEvidence(account,[m]),[]);
 m.extraction.path='../outside.json';assert.ok(validateEvidence(account,[m]).length);
 m.extraction.path='imports/hoyolab/'+source+'.json';m.observations[0].pointer='/genshin/characters/-1';assert.ok(validateEvidence(account,[m]).length);
 m.observations[0].pointer='/genshin/characters/0';m.observations[0].id='other';assert.ok(validateEvidence(account,[m]).length);
});

test('v3 summary links API observations and names rule-derived effectiveness',()=>{
 const account=gi(),artifact=account.artifacts[0],observation=artifact.substat_rolls;
 observation.rule_id='test_v1';observation.effective_keys=[observation.values[0].key];
 for(const row of observation.values)Object.assign(row,{effective:null,assessed_effective:row.key===observation.values[0].key,enhancements:0});
 const summary=renderSummary(account,JSON.stringify(account,null,2)+'\n',[manifest(account)]);
 assert.match(summary,/\[HoYoLAB\]\(\.\.\/imports\/hoyolab\/hoyolab_0123456789abcdef\.json#\/genshin\/characters\/0\)/);
 assert.match(summary,/角色規則判定/);assert.ok(!summary.includes('NaN'));
});

test('ZZZ API source union and skill context are validated without fake video timestamps',()=>{
 const account=zzz();assert.deepEqual(validateZzz(account),[]);
 account.characters[0].sync.sourceId='missing';assert.ok(validateZzz(account).length);
 account.characters[0].sync.sourceId=source;account.characters[0].evidence[0].record='/genshin/characters/0';assert.ok(validateZzz(account).length);
 account.characters[0].evidence[0].record='/zzz/characters/0';account.characters[0].skillContext.coreRawLevel=8;assert.ok(validateZzz(account).length);
});

test('ZZZ derived counts retain observed flags and use complete rule keys for the maximum',()=>{
 const account=zzz(),disc={id:'test_disc',slot:1,setName:null,rarity:'S',level:15,mainStat:{name:'生命值',value:2200,unit:'flat'},substatsComplete:true,substats:[{name:'攻擊力',value:9,unit:'percent',enhancementCount:2,isEffective:null,assessedEffective:true,enhancementSource:'derived_fixed_roll'}],effectiveRollCount:3,effectiveKeys:['攻擊力|percent','異常精通|flat'],assessment:{ruleId:'test_v1',method:'role_rule'},evidence:account.characters[0].evidence,uncertainties:[]};
 account.characters[0].driveDiscs=[disc];assert.deepEqual(validateZzz(account),[]);
 assert.equal(effectiveDiscCount(disc),3);assert.equal(discStatEffective(disc.substats[0],disc),true);assert.deepEqual(discEffectiveKeys([disc]),['攻擊力|percent','異常精通|flat']);
 disc.substats[0].isEffective=false;disc.effectiveRollCount=0;assert.equal(effectiveDiscCount(disc),0);assert.deepEqual(validateZzz(account),[]);
 disc.substats[0].isEffective=null;disc.substats[0].enhancementCount=null;disc.effectiveRollCount=null;assert.equal(effectiveDiscCount(disc),null);assert.deepEqual(validateZzz(account),[]);
 disc.assessment=undefined;assert.ok(validateZzz(account).length);assert.equal(discStatEffective(disc.substats[0],disc),null);
});
