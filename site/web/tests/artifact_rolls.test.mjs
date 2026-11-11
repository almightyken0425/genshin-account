import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {effectiveSubstatCount,effectiveLoadoutCount,substatRoll,editSubstatRoll} from '../lib/artifact_rolls.mjs';
import {validateAccount,fingerprint,applyCandidate} from '../lib/account.mjs';

const piece=()=>({substats:[{key:'crit_dmg'},{key:'crit_rate'},{key:'def'}],substat_rolls:{character_id:'chasca',values:[{key:'crit_dmg',enhancements:2,effective:true},{key:'crit_rate',enhancements:1,effective:true},{key:'def',enhancements:2,effective:false}]}});
test('video flower totals five, not three or six',()=>assert.equal(effectiveSubstatCount(piece(),'chasca'),5));
test('zero enhancements contributes one initial roll when effective',()=>{const a=piece();a.substat_rolls.values[0].enhancements=0;assert.equal(effectiveSubstatCount(a,'chasca'),3)});
test('known ineffective and unknown effective are distinct',()=>{
 const a=piece();a.substat_rolls.values.forEach(r=>r.effective=false);assert.equal(effectiveSubstatCount(a,'chasca'),0);
 a.substat_rolls.values[0].effective=null;assert.equal(effectiveSubstatCount(a,'chasca'),null);
});
test('missing effective enhancement keeps total unknown, irrelevant unknown does not',()=>{
 const a=piece();a.substat_rolls.values[2].enhancements=null;assert.equal(effectiveSubstatCount(a,'chasca'),5);
 a.substat_rolls.values[0].enhancements=null;assert.equal(effectiveSubstatCount(a,'chasca'),null);
});
test('five-piece totals include off-set pieces and reject incomplete information',()=>{
 const a=Array.from({length:5},piece);assert.equal(effectiveLoadoutCount(a,'chasca'),25);
 assert.equal(effectiveLoadoutCount(a.slice(1),'chasca'),null);a[4]=undefined;assert.equal(effectiveLoadoutCount(a,'chasca'),null);
});
test('a transfer retains counts but clears the old character effectiveness',()=>{
 const a=piece();assert.equal(effectiveSubstatCount(a,'furina'),null);assert.deepEqual(substatRoll(a,'crit_dmg','furina'),{key:'crit_dmg',enhancements:2,effective:null});
 editSubstatRoll(a,'furina','crit_rate',{effective:true});assert.equal(a.substat_rolls.character_id,'furina');assert.equal(a.substat_rolls.values[0].effective,null);assert.equal(a.substat_rolls.values[0].enhancements,2);
});
test('v2 schema validates roll context, count budgets and physical keys',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/account.json',import.meta.url),'utf8'));
 const a=structuredClone(old);a.schema_version=2;
 for(const x of a.artifacts)x.substat_rolls={character_id:null,values:x.substats.map(s=>({key:s.key,enhancements:null,effective:null}))};
 assert.deepEqual(validateAccount(a),[]);assert.equal(fingerprint(a,'escoffier'),fingerprint(old,'escoffier'));
 const b=structuredClone(a);b.artifacts[0].substat_rolls.character_id='escoffier';b.artifacts[0].substat_rolls.values[0].enhancements=2;
 assert.equal(applyCandidate(a,b,'補上強化紀錄').panels.escoffier,'current');
 b.artifacts[0].substat_rolls.values[0].enhancements=6;assert.ok(validateAccount(b).length);
 b.artifacts[0].substat_rolls.values[0].enhancements=0;b.artifacts[0].substat_rolls.values[0].key='missing';assert.ok(validateAccount(b).length);
});
