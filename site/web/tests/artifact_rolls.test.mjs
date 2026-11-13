import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {effectiveSubstatCount,effectiveLoadoutCount,maximumArtifactCount,maximumArtifactLoadout,artifactEffectiveKeys,substatRoll,editSubstatRoll} from '../lib/artifact_rolls.mjs';
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
 const a=['flower','plume','sands','goblet','circlet'].map(slot=>({...piece(),slot}));assert.equal(effectiveLoadoutCount(a,'chasca'),25);
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

const theoryPiece=(mainKey='hp',slot='flower')=>({slot,rarity:5,main_stat:{key:mainKey,value:null},level:null});
const observe=(rows,characterId='chasca')=>({substats:rows.map(([key])=>({key,value:null})),substat_rolls:{character_id:characterId,values:rows.map(([key,effective])=>({key,effective,enhancements:null}))}});
const pool=['hp','hp_pct','atk','atk_pct','def','def_pct','em','energy_recharge','crit_rate','crit_dmg'];
test('artifact theoretical maximum excludes only the exact main key and caps initial rows at four',()=>{
 assert.equal(maximumArtifactCount(theoryPiece('atk'),['atk','atk_pct']),6);
 assert.equal(maximumArtifactCount(theoryPiece('atk_pct'),['atk','atk_pct']),6);
 assert.equal(maximumArtifactCount(theoryPiece('hp'),['atk','atk_pct']),7);
 assert.equal(maximumArtifactCount(theoryPiece('hp'),pool),9);
 assert.equal(maximumArtifactCount(theoryPiece('hp'),['atk','atk','atk_pct']),7);
 assert.equal(maximumArtifactCount(theoryPiece('em'),['em','atk_pct']),6);
});
test('artifact maximum distinguishes known zero, unknown profile and unsupported item identity',()=>{
 assert.equal(maximumArtifactCount(theoryPiece(),[]),0);
 assert.equal(maximumArtifactCount(theoryPiece(),['hp']),0);
 assert.equal(maximumArtifactCount(theoryPiece()),null);
 assert.equal(maximumArtifactCount(theoryPiece(),null),null);
 assert.equal(maximumArtifactCount(theoryPiece('elemental_mastery'),['em']),null);
 assert.equal(maximumArtifactCount(theoryPiece('def'),['def']),null);
 assert.equal(maximumArtifactCount({...theoryPiece(),main_stat:null},['atk']),null);
 for(const rarity of [null,4])assert.equal(maximumArtifactCount({...theoryPiece(),rarity},['atk']),null);
 assert.equal(maximumArtifactCount(theoryPiece(),['elemental_mastery']),null);
});
test('artifact maximum does not depend on current level, active rows, values or observed enhancement counts',()=>{
 const a={...theoryPiece(),...piece()};
 for(const level of [0,4,20,null]){
  a.level=level;assert.equal(maximumArtifactCount(a,['crit_rate','crit_dmg']),7);
 }
 a.substats=[];delete a.substat_rolls;assert.equal(maximumArtifactCount(a,['crit_rate','crit_dmg']),7);
});
test('artifact effective set is the positive observed union for the matching character, not unobserved false keys',()=>{
 assert.deepEqual(artifactEffectiveKeys([piece()],'chasca'),['crit_rate','crit_dmg']);
 assert.equal(artifactEffectiveKeys([piece()],'furina'),null);
 assert.deepEqual(artifactEffectiveKeys([observe([['hp',false],['em',null],['crit_rate',true]]),undefined],'chasca'),['crit_rate']);
 assert.equal(artifactEffectiveKeys([observe([['hp',false],['em',null]])],'chasca'),null);
 assert.equal(artifactEffectiveKeys(null,'chasca'),null);assert.equal(artifactEffectiveKeys([],null),null);
});
test('artifact observed profile requires every legal candidate to be false before returning an empty set',()=>{
 const allFalse=[0,4,8].map(offset=>observe(pool.slice(offset,offset+4).map(key=>[key,false])));
 assert.deepEqual(artifactEffectiveKeys(allFalse,'chasca'),[]);
 allFalse[0].substat_rolls.values[0].effective=null;assert.equal(artifactEffectiveKeys(allFalse,'chasca'),null);
});
test('artifact conflicting or invalid effectiveness observations remain unknown and transfers keep current count rules',()=>{
 const yes=observe([['atk',true]]),no=observe([['atk',false]]);
 assert.equal(artifactEffectiveKeys([yes,no],'chasca'),null);
 assert.equal(artifactEffectiveKeys([observe([['elemental_mastery',true]])],'chasca'),null);
 const a={...theoryPiece(),...piece()};assert.equal(effectiveSubstatCount(a,'furina'),null);
 assert.equal(maximumArtifactCount(a,['hp_pct']),6);
 editSubstatRoll(a,'furina','crit_rate',{effective:true});
 assert.deepEqual(artifactEffectiveKeys([a],'furina'),['crit_rate']);assert.equal(effectiveSubstatCount(a,'furina'),null);
});
test('artifact loadout maximum requires all distinct slots but the observed profile can come from a partial loadout',()=>{
 const pieces=['flower','plume','sands','goblet','circlet'].map(slot=>theoryPiece('hp',slot));
 const keys=artifactEffectiveKeys([observe([['atk',true],['atk_pct',true]])],'chasca');
 assert.equal(maximumArtifactLoadout(pieces,keys),35);assert.equal(maximumArtifactLoadout(pieces,[]),0);
 assert.equal(maximumArtifactLoadout(pieces),null);assert.equal(maximumArtifactLoadout(pieces.slice(1),keys),null);
 assert.equal(maximumArtifactLoadout([...pieces.slice(0,4),pieces[0]],keys),null);
 assert.equal(effectiveLoadoutCount([...pieces.slice(0,4),pieces[0]],'chasca'),null);
 assert.equal(maximumArtifactLoadout(null,keys),null);
});
