import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getGenshinStatProfile,panelStatAssessment} from '../lib/genshin_stat_profiles.mjs';
import {loadCurrentGenshin} from './helpers/current_accounts.mjs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const research=JSON.parse(read('../lib/genshin_stat_profiles.json'));
const {account,metadata}=loadCurrentGenshin();
const panelKeys=new Set(['hp','atk','def','em','crit_rate','crit_dmg','energy_recharge','healing_bonus','physical_dmg_bonus','pyro_dmg_bonus','hydro_dmg_bonus','dendro_dmg_bonus','electro_dmg_bonus','anemo_dmg_bonus','cryo_dmg_bonus','geo_dmg_bonus']);

test('public profiles cover the observed Genshin roster with dated source provenance',()=>{
 assert.equal(research.schema_version,1);
 assert.match(research.checked_at,/^\d{4}-\d{2}-\d{2}/);
 assert.match(research.based_on_commit,/^[a-f0-9]{40}$/);
 assert.equal(research.based_account_sha256,metadata.accountSha256);
 assert.equal(research.profiles.length,83);
 assert.equal(new Set(research.profiles.map(profile=>profile.id)).size,83);
 for(const character of account.characters)assert.ok(getGenshinStatProfile(character.id),character.id);
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
 const expression=zzz.match(/<SummaryStat\b[^\n]*?effective=\{([^}]+)\}/)?.[1];assert.ok(expression);
 const assessZzz=new Function('character','label','return ('+expression+')');
 assert.equal(assessZzz({statsEffective:{'攻擊力':false},effectiveProfile:{keys:['攻擊力|percent']}},'攻擊力'),false);
 assert.equal(assessZzz({statsEffective:{'攻擊力':true},effectiveProfile:{keys:[]}},'攻擊力'),true);
 assert.equal(assessZzz({statsEffective:{'攻擊力':null},effectiveProfile:{keys:['攻擊力|percent']}},'攻擊力'),true);
 assert.equal(assessZzz({},'攻擊力'),false);
 assert.match(zzz,/依角色規則判定，非本次遊戲有效標記/);
 assert.ok(!zzz.includes('genshin_stat_profiles'));
 assert.match(cell,/effectiveLabel='已確認有效'/);
 assert.match(cell,/title=\{reason\}/);
 assert.match(cell,/className=\{effective\?'is-effective':undefined\}/);
 assert.match(genshin,/<details className="talent-extra"><summary><ChevronDown size=\{14\}\/><span>有效屬性依據<\/span>/);
 assert.match(genshin,/statProfile\.sources\.map/);
 assert.ok(!read('../lib/artifact_rolls.mjs').includes('genshin_stat_profiles'));
});

test('new role profiles map scaling percentages to total panel values without adding percentage panel rows',()=>{
 for(const [id,positive,negative] of [
  ['hoyolab_character_10000035','atk','hp'],
  ['hoyolab_character_10000050','hp','atk'],
  ['hoyolab_character_10000055','def','atk'],
  ['hoyolab_character_10000064','def','hp'],
  ['hoyolab_character_10000100','def','atk'],
  ['hoyolab_character_10000124','atk','hp'],
 ]){
  assert.equal(panelStatAssessment(id,positive).effective,true,id);
  assert.equal(panelStatAssessment(id,negative).effective,false,id);
  for(const key of ['hp_pct','atk_pct','def_pct'])assert.equal(panelStatAssessment(id,key).effective,false,id+': '+key);
 }
 assert.match(research.panel_mapping_policy.summary,/最終總面板/);
 assert.match(research.panel_mapping_policy.source_sha256,/^[a-f0-9]{64}$/);
});

test('direct damage, reaction and shield roles have explicit distinct panel bonus handling',()=>{
 assert.equal(panelStatAssessment('hoyolab_character_10000006','electro_dmg_bonus').effective,true);
 assert.equal(panelStatAssessment('hoyolab_character_10000006','em').effective,false);
 assert.ok(panelStatAssessment('hoyolab_character_10000006','em').reason);
 assert.equal(panelStatAssessment('hoyolab_character_10000044','physical_dmg_bonus').effective,true);
 assert.equal(panelStatAssessment('hoyolab_character_10000044','pyro_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('hoyolab_character_10000085','physical_dmg_bonus').effective,true);
 assert.equal(panelStatAssessment('hoyolab_character_10000085','cryo_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('hoyolab_character_10000081','em').effective,true);
 assert.equal(panelStatAssessment('hoyolab_character_10000081','dendro_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('hoyolab_character_10000113','em').effective,true);
 assert.equal(panelStatAssessment('hoyolab_character_10000113','anemo_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('hoyolab_character_10000115','hydro_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('hoyolab_character_10000137','electro_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('nefer','dendro_dmg_bonus').effective,false);
 assert.equal(panelStatAssessment('zibai','geo_dmg_bonus').effective,false);
});

test('healing bonus follows the confirmed healing role rather than shield or self-healing labels',()=>{
 for(const id of [10000035,10000053,10000055,10000068,10000077,10000080,10000113,10000124]){
  assert.equal(panelStatAssessment('hoyolab_character_'+id,'healing_bonus').effective,true,String(id));
 }
 for(const id of [10000050,10000061,10000064,10000072,10000081,10000083,10000108,10000115,10000137]){
  assert.equal(panelStatAssessment('hoyolab_character_'+id,'healing_bonus').effective,false,String(id));
 }
 assert.equal(panelStatAssessment('hoyolab_character_10000035','crit_rate').effective,true);
 assert.equal(panelStatAssessment('hoyolab_character_10000035','crit_dmg').effective,false);
 assert.equal(panelStatAssessment('hoyolab_character_10000080','crit_rate').effective,false);
});

test('both new Manekin profiles retain unknown uses without traveler or elemental damage defaults',()=>{
 for(const id of ['hoyolab_character_10000117','hoyolab_character_10000118']){
  const profile=getGenshinStatProfile(id);
  assert.equal(profile.confidence,'unknown');
  assert.ok(profile.unknown_reason);
  assert.deepEqual(profile.effective_panel_keys,[]);
  for(const key of panelKeys)assert.equal(panelStatAssessment(id,key).effective,false);
 }
});

test('fourth-constellation Alyosha profile uses the current support/damage role and dated official evidence',()=>{
 const profile=getGenshinStatProfile('arosha');
 assert.match(profile.summary,/四命/);
 assert.ok(!/目前 C3|目前C3|隔輪爆發/.test(profile.summary));
 assert.match(profile.summary,/200%/);
 assert.match(profile.summary,/70%/);
 for(const key of ['atk','crit_rate','crit_dmg','energy_recharge','electro_dmg_bonus','healing_bonus'])assert.equal(panelStatAssessment('arosha',key).effective,true,key);
 assert.equal(panelStatAssessment('arosha','em').effective,false);
 assert.ok(profile.sources.every(source=>new URL(source.url).hostname==='wiki.hoyolab.com'));
});

test('new panel guidance retains official source checks and explains its inference separately from observations',()=>{
 const current=research.profiles.filter(profile=>profile.id.startsWith('hoyolab_character_')||profile.id==='arosha');
 assert.equal(current.length,37);
 for(const profile of current){
  assert.match(profile.assessment_note,/推導/);
  assert.match(profile.assessment_note,/並非本次遊戲面板的有效標記/);
  assert.equal(profile.assessment_basis.method,'reviewed_role_to_total_panel');
  assert.ok(profile.assessment_basis.rule_id&&profile.assessment_basis.source_record_id);
  assert.ok(profile.sources.every(source=>source.kind==='official_hoyowiki'));
  for(const source of profile.sources){assert.ok(source.entry_id&&source.revision);assert.match(source.payload_sha256,/^[a-f0-9]{64}$/)}
 }
 const dashboard=read('../app/dashboard.tsx');
 assert.match(dashboard,/聖遺物分別標示遊戲觀測與角色規則/);
 assert.match(dashboard,/statProfile\.assessment_note/);
 for(const [key,label] of [['incoming_healing_bonus','受治療加成'],['cooldown_reduction','冷卻縮減'],['shield_strength','護盾強效']]){
  assert.ok(dashboard.includes(key+":'"+label+"'"));
 }
});
