import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {artifactSubstatOptions,changeArtifactSubstat} from '../lib/artifact_substats.mjs';
import {effectiveSubstatCount} from '../lib/artifact_rolls.mjs';
import {validateAccount,applyCandidate} from '../lib/account.mjs';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/account.json',import.meta.url),'utf8'));
const piece=()=>({
 id:'flower',main_stat:{key:'hp',value:4780,unit:'flat'},
 substats:[{key:'def',value:19,unit:'flat'},{key:'crit_rate',value:6.2,unit:'percent'},{key:'atk_pct',value:8.2,unit:'percent'}],
 substat_rolls:{character_id:'escoffier',values:[{key:'def',enhancements:0,effective:false},{key:'crit_rate',enhancements:1,effective:true},{key:'atk_pct',enhancements:1,effective:true}]},
 provenance:{source_ids:['video_001']},
});

test('attribute choices distinguish flat and percent and prevent duplicates',()=>{
 const a=piece(),options=artifactSubstatOptions(a,0),before=structuredClone(a);
 assert.equal(options.length,10);
 for(const key of ['hp','crit_rate','atk_pct']){
  assert.equal(options.find(option=>option.key===key).disabled,true);
  assert.equal(changeArtifactSubstat(a,0,key),false);
 }
 assert.equal(options.find(option=>option.key==='hp_pct').disabled,false);
 assert.equal(options.find(option=>option.key==='def').disabled,false);
 assert.equal(changeArtifactSubstat(a,0,'def'),false);
 assert.equal(changeArtifactSubstat(a,0,'pyro_dmg_bonus'),false);
 assert.deepEqual(a,before);
});

test('changing attribute resets its value and annotations, preserving other observations',()=>{
 const a=piece(),before=structuredClone(a);
 assert.equal(effectiveSubstatCount(a,'escoffier'),4);
 assert.equal(changeArtifactSubstat(a,0,'hp_pct'),true);
 assert.deepEqual(a.substats[0],{key:'hp_pct',value:null,unit:'percent'});
 assert.deepEqual(a.substat_rolls.values[0],{key:'hp_pct',enhancements:null,effective:null});
 assert.equal(effectiveSubstatCount(a,'escoffier'),null);
 assert.deepEqual(a.substats.slice(1),before.substats.slice(1));
 assert.deepEqual(a.substat_rolls.values.slice(1),before.substat_rolls.values.slice(1));
 assert.equal(a.substat_rolls.character_id,before.substat_rolls.character_id);
 assert.deepEqual(a.provenance,before.provenance);
 assert.deepEqual(a.main_stat,before.main_stat);
 assert.equal(a.id,before.id);
});

test('percent to flat uses the new unit and makes the former attribute available',()=>{
 const a=piece();
 assert.equal(changeArtifactSubstat(a,1,'em'),true);
 assert.deepEqual(a.substats[1],{key:'em',value:null,unit:'flat'});
 assert.equal(artifactSubstatOptions(a,0).find(option=>option.key==='crit_rate').disabled,false);
 assert.equal(artifactSubstatOptions(a,0).find(option=>option.key==='em').disabled,true);
});

for(const schemaVersion of [1,2])test(`v${schemaVersion} attribute edits save without rewriting panel observations`,()=>{
 const base=structuredClone(fixture);base.schema_version=schemaVersion;
 if(schemaVersion===2)for(const a of base.artifacts)a.substat_rolls={character_id:null,values:a.substats.map(s=>({key:s.key,enhancements:null,effective:null}))};
 const draft=structuredClone(base),artifact=draft.artifacts.find(a=>a.id===draft.equipment.escoffier.artifacts.flower);
 assert.equal(changeArtifactSubstat(artifact,2,'hp_pct'),true);
 assert.deepEqual(validateAccount(draft),[]);
 if(schemaVersion===1)assert.equal('substat_rolls' in artifact,false);
 const result=applyCandidate(base,draft,'修正副詞條屬性');
 assert.equal(result.panels.escoffier,'stale');
 assert.deepEqual(result.account.panel_snapshots,base.panel_snapshots);
 const saved=result.account.artifacts.find(a=>a.id===artifact.id);
 assert.deepEqual(saved.substats[2],{key:'hp_pct',value:null,unit:'percent'});
 assert.equal(saved.provenance.verification,'user_reported');
});
