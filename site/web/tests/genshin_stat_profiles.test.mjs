import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getGenshinStatProfile,panelStatAssessment} from '../lib/genshin_stat_profiles.mjs';
import {loadCurrentGenshin} from './helpers/current_accounts.mjs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const research=JSON.parse(read('../lib/genshin_stat_profiles.json'));
const {account}=loadCurrentGenshin();
const panelKeys=new Set(['hp','atk','def','em','crit_rate','crit_dmg','energy_recharge','healing_bonus','physical_dmg_bonus','pyro_dmg_bonus','hydro_dmg_bonus','dendro_dmg_bonus','electro_dmg_bonus','anemo_dmg_bonus','cryo_dmg_bonus','geo_dmg_bonus']);

test('public profiles cover the observed Genshin roster with dated source provenance',()=>{
 assert.equal(research.schema_version,1);
 assert.match(research.checked_at,/^\d{4}-\d{2}-\d{2}/);
 assert.match(research.based_on_commit,/^[a-f0-9]{40}$/);
 assert.deepEqual(research.profiles.map(profile=>profile.id).sort(),account.characters.map(character=>character.id).sort());
 for(const profile of research.profiles){
  assert.ok(profile.name&&profile.role&&profile.summary&&profile.confidence,profile.id);
  assert.equal(new Set(profile.effective_panel_keys).size,profile.effective_panel_keys.length,profile.id);
  assert.equal(new Set(profile.conditional.map(condition=>condition.key)).size,profile.conditional.length,profile.id);
  for(const key of profile.effective_panel_keys)assert.ok(panelKeys.has(key),profile.id+': '+key);
  for(const condition of profile.conditional){
   assert.ok(panelKeys.has(condition.key)&&condition.reason,profile.id);
   assert.ok(!profile.effective_panel_keys.includes(condition.key),profile.id+': conditional key must stay conditional');
  }
  if(profile.effective_panel_keys.length||profile.conditional.length)assert.ok(profile.sources.length,profile.id+': source required');
  else assert.ok(profile.unknown_reason,profile.id+': explain unresolved profile');
  for(const source of profile.sources){assert.ok(source.title,profile.id);assert.equal(new URL(source.url).protocol,'https:',profile.id)}
 }
});

test('each profile highlights only its unconditional panel keys',()=>{
 for(const profile of research.profiles){
  assert.equal(getGenshinStatProfile(profile.id)?.name,profile.name);
  for(const key of panelKeys){
   const assessment=panelStatAssessment(profile.id,key);
   assert.equal(assessment.effective,profile.effective_panel_keys.includes(key),profile.id+': '+key);
  }
  for(const condition of profile.conditional)assert.deepEqual(panelStatAssessment(profile.id,condition.key),{effective:false,reason:condition.reason});
 }
});

test('different scaling and resource mechanics do not become generic damage-stat highlights',()=>{
 assert.equal(panelStatAssessment('neuvillette','hp').effective,true);
 assert.equal(panelStatAssessment('neuvillette','atk').effective,false);
 assert.equal(panelStatAssessment('kaedeharakazuha','em').effective,true);
 assert.equal(panelStatAssessment('mavuika','energy_recharge').effective,false);
 assert.equal(panelStatAssessment('skirk','energy_recharge').effective,false);
 assert.equal(panelStatAssessment('bennett','atk').effective,false);
 assert.equal(panelStatAssessment('bennett','crit_rate').effective,true);
 assert.equal(panelStatAssessment('kukishinobu','em').effective,true);
 assert.equal(panelStatAssessment('kukishinobu','crit_dmg').effective,false);
 assert.equal(panelStatAssessment('chasca','anemo_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('zibai','geo_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('nefer','dendro_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('yumemizukimizuki','crit_rate').effective,true);
 assert.equal(panelStatAssessment('xilonen','healing_bonus').effective,true);
 assert.equal(panelStatAssessment('jean','healing_bonus').effective,true);
 assert.equal(panelStatAssessment('noelle','healing_bonus').effective,true);
 assert.equal(panelStatAssessment('neuvillette','hp_pct').effective,false);
});

test('unknown characters and panel keys never receive inferred highlights',()=>{
 assert.equal(getGenshinStatProfile('not-a-recorded-character'),null);
 assert.equal(getGenshinStatProfile(null),null);
 assert.deepEqual(panelStatAssessment('not-a-recorded-character','crit_rate'),{effective:false,reason:'有效屬性尚未確認'});
 assert.equal(panelStatAssessment('neuvillette','unknown_stat').effective,false);
});

test('both details share summary cells while observed and researched effectiveness remain separate',()=>{
 const genshin=read('../app/dashboard.tsx'),zzz=read('../app/zzz_character_detail.tsx'),cell=read('../components/metrics/summary_stat.tsx');
 assert.match(genshin,/<SummaryStat\b/);assert.match(zzz,/<SummaryStat\b/);
 assert.match(genshin,/panelStatAssessment\(c\.id,s\.key\)/);
 assert.match(genshin,/effectiveLabel="培養有效屬性"/);
 assert.match(zzz,/effective=\{character\.statsEffective\?\.\[label\]===true\}/);
 assert.ok(!zzz.includes('genshin_stat_profiles'));
 assert.match(cell,/effectiveLabel='已確認有效'/);
 assert.match(cell,/title=\{reason\}/);
 assert.match(cell,/className=\{effective\?'is-effective':undefined\}/);
 assert.match(genshin,/<details className="talent-extra"><summary><ChevronDown size=\{14\}\/><span>有效屬性依據<\/span>/);
 assert.match(genshin,/statProfile\.sources\.map/);
 assert.ok(!read('../lib/artifact_rolls.mjs').includes('genshin_stat_profiles'));
});
