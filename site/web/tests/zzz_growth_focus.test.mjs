import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {zzzGrowthFocus,growthFocusObservationToken} from '../lib/zzz_growth_focus.mjs';
const records=JSON.parse(readFileSync(new URL('./fixtures/zzz_growth_focus.json',import.meta.url),'utf8'));
const character=id=>structuredClone(records.find(character=>character.id===id));
const advice=id=>zzzGrowthFocus([character(id)])[0];

test('the four confirmed observations produce four ordered focus cards with sources',()=>{
 const result=zzzGrowthFocus(records);
 assert.deepEqual(result.map(focus=>focus.characterId),['ju_fufu','yanagi','miyabi','pyrois']);
 assert.ok(result.every(focus=>focus.kind==='upgrade'&&focus.sources.length));
 const fufu=result[0];assert.equal(fufu.current,6);assert.equal(fufu.target,11);
 assert.match(fufu.main,/85.3% → 101.3%/);assert.match(fufu.context,/僅該招.*18.8%/);
 assert.ok(!fufu.detail.join('').includes('三支主力隊'));
});
test('Fufu reads current skill values, completes eleven, and keeps unknown distinct from zero',()=>{
 const complete=character('ju_fufu');complete.skills['普通攻擊']=11;
 assert.equal(zzzGrowthFocus([complete])[0].kind,'complete');
 const unknown=character('ju_fufu');unknown.skills['普通攻擊']=null;
 assert.deepEqual([zzzGrowthFocus([unknown])[0].kind,zzzGrowthFocus([unknown])[0].current],['verify',null]);
 const seven=character('ju_fufu');seven.skills['普通攻擊']=7;
 const result=zzzGrowthFocus([seven])[0];assert.equal(result.current,7);assert.equal(result.main,undefined);assert.equal(result.context,undefined);
});
test('Yanagi keeps both observed zero counts and the thirty-percent main stats',()=>{
 const result=advice('yanagi');assert.match(result.context,/5號有效 0、6號有效 0/);
 assert.match(result.detail.join(''),/電屬性傷害加成30%/);assert.match(result.detail.join(''),/異常掌控30%/);
 assert.deepEqual(result.tags,['異常精通','攻擊力 %']);
});
test('Miyabi distinguishes the conditional set bonus from her observed panel',()=>{
 const result=advice('miyabi');assert.match(result.context,/面板暴率 70.6%/);
 assert.match(result.detail.join(''),/12%為82.6%/);assert.match(result.detail.join(''),/不能直接把面板未達80%視為不足/);
 assert.deepEqual(result.tags,['暴擊傷害','攻擊力 %']);
});
test('Pyrois shows the real panel and leaves combat crit assumptions unmeasured',()=>{
 const result=advice('pyrois');assert.match(result.context,/82.6%.*69.2%.*5號有效 1/);
 assert.match(result.detail.join(''),/4號暴傷盤可列候選/);assert.match(result.detail.join(''),/日冕遺蛻被動與影畫/);
 assert.ok(!JSON.stringify(result).includes('110.6'));
});
test('changed equipment, panel, engine or mindscape invalidates the equipment recommendation',()=>{
 for(const id of ['yanagi','miyabi','pyrois'])for(const mutate of [
  character=>{character.driveDiscs[0].substats[0].value+=1},
  character=>{character.wEngine.name='其他音擎'},
  character=>{character.wEngine.refinement=2},
  character=>{character.stats['攻擊力']+=1},
  character=>{character.mindscape+=1},
 ]){
  const input=character(id);mutate(input);const result=zzzGrowthFocus([input])[0];
  assert.equal(result.kind,'verify',id);assert.match(result.title,/需重評估/);
  for(const field of ['current','target','main','tags','context'])assert.equal(result[field],undefined,id+': '+field);
 }
});
test('missing observations never reuse baseline numbers and reorderings do not imply a changed build',()=>{
 for(const id of ['yanagi','miyabi','pyrois']){
  const missing=character(id);missing.stats=null;missing.driveDiscs=null;
  assert.equal(zzzGrowthFocus([missing])[0].kind,'verify');
  const reordered=character(id);reordered.driveDiscs.reverse();reordered.driveDiscs.forEach(disc=>disc.substats.reverse());
  assert.equal(growthFocusObservationToken(reordered),growthFocusObservationToken(character(id)));
  assert.equal(zzzGrowthFocus([reordered])[0].kind,'upgrade');
 }
});
test('focus generation never invents absent characters or modifies the current observations',()=>{
 assert.deepEqual(zzzGrowthFocus([]),[]);
 const input=structuredClone(records),before=JSON.stringify(input);zzzGrowthFocus(input);assert.equal(JSON.stringify(input),before);
 assert.deepEqual(zzzGrowthFocus([{id:'unrecorded'}]),[]);
});
