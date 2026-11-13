import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleTeams,growthAdvice} from '../lib/zzz_recommendations.mjs';

const allSkills={普通攻擊:12,閃避:12,支援技:12,特殊技:12,連攜技:12,核心技:'F'};
const disc=(slot,overrides={})=>({slot,rarity:'S',level:15,substatsComplete:true,substats:[{isEffective:true,enhancementCount:0}],...overrides});
const character=(id,overrides={})=>({id,level:60,skills:{...allSkills},wEngine:{name:'已觀測音擎',level:60},driveDiscs:Array.from({length:6},(_,i)=>disc(i+1)),...overrides});
const trainingPlan=(rules,overrides={})=>({observedMindscape:0,displayedCaps:Object.fromEntries(['普通攻擊','閃避','支援技','特殊技','連攜技'].map(skill=>[skill,12])),skills:rules,maintain:[],...overrides});
const guide=(id,ids)=>({id,name:id,summary:'摘要',reason:'原因',members:ids.map(id=>({id,role:'定位',focus:['培養重點']})),activation:['條件'],steps:[{characterId:ids[0],action:'操作'}],sources:[{label:'來源',url:'https://wiki.hoyolab.com/'}]});
const freeze=value=>{
 if(value&&typeof value==='object'){
  for(const child of Object.values(value))freeze(child);
  Object.freeze(value);
 }
 return value;
};

test('eligible teams require exactly three distinct observed members and preserve guide order',()=>{
 const owned=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
 const first=guide('first',['a','b','c']),shared=guide('shared',['a','b','d']);
 const guides=[guide('unobserved',['a','b','missing']),guide('duplicate',['a','a','b']),
  guide('two',['a','b']),first,guide('four',['a','b','c','d']),shared];
 assert.deepEqual(eligibleTeams(owned,guides),[first,shared]);
 assert.deepEqual(eligibleTeams([],guides),[]);
 assert.deepEqual(eligibleTeams([{id:'a'},{id:'a'},{id:'b'}],[first]),[]);
});

test('team and growth calculations leave frozen input data unchanged',()=>{
 const characters=freeze([character('a',{level:31}),character('b'),character('c')]);
 const guides=freeze([guide('team',['a','b','c'])]);
 const priorities=freeze(['c','a']);
 const before=JSON.stringify({characters,guides,priorities});
 assert.equal(eligibleTeams(characters,guides)[0],guides[0]);
 growthAdvice(characters,priorities);
 assert.equal(JSON.stringify({characters,guides,priorities}),before);
});

test('growth advice puts selected IDs first without duplicates and never sorts by effective count',()=>{
 const characters=[character('a',{level:31}),character('b',{level:20}),character('a',{level:1}),
  character('c',{level:1,driveDiscs:Array.from({length:6},(_,i)=>disc(i+1,{substats:[]}))})];
 const rows=growthAdvice(characters,['c','c','unobserved','a']);
 assert.deepEqual(rows.map(row=>row.characterId),['c','a','b']);
 assert.equal(rows[0].effectiveCount,0);
 assert.equal(rows[1].effectiveCount,6);
 assert.match(rows[1].actions.find(action=>action.id==='character-level').detail,/31級/);
});

test('a complete observed configuration needs no invented cultivation action',()=>{
 assert.deepEqual(growthAdvice([character('ready')],['ready']),[]);
});

test('unknown character or engine levels create verification, while recorded zero creates upgrades',()=>{
 const rows=growthAdvice([
  character('unknown',{level:null,wEngine:null}),
  character('zero',{level:0,wEngine:{name:'零級音擎',level:0}}),
  character('unnamed',{wEngine:{name:null,level:10}}),
  character('unknown-engine-level',{wEngine:{name:'已知名稱',level:null}}),
 ],[]);
 const unknown=rows.find(row=>row.characterId==='unknown');
 assert.ok(unknown.actions.every(action=>action.kind==='verify'));
 assert.doesNotMatch(unknown.actions.map(action=>action.detail).join(''),/未裝備|目前0級/);
 const zero=rows.find(row=>row.characterId==='zero');
 assert.equal(zero.actions.filter(action=>action.kind==='upgrade').length,2);
 assert.ok(zero.actions.every(action=>action.detail.includes('0級')));
 for(const id of ['unnamed','unknown-engine-level']){
  const actions=rows.find(row=>row.characterId===id).actions;
  assert.ok(actions.every(action=>action.kind==='verify'));
 }
});

test('only observed S discs below fifteen are upgraded, with exact slots and current levels',()=>{
 const discs=[disc(1,{level:0}),disc(2,{rarity:'A',level:0}),disc(3,{rarity:null,level:0}),
  disc(4,{level:null}),disc(5,{level:12}),disc(6)];
 const [{actions}]=growthAdvice([character('discs',{driveDiscs:discs})],[]);
 const upgrade=actions.find(action=>action.id==='disc-level');
 assert.equal(upgrade.kind,'upgrade');
 assert.match(upgrade.detail,/1號盤目前0級/);
 assert.match(upgrade.detail,/5號盤目前12級/);
 assert.doesNotMatch(upgrade.detail,/[2346]號盤/);
 const verify=actions.find(action=>action.id==='disc-observation');
 assert.equal(verify.kind,'verify');
 assert.match(verify.detail,/3號盤、4號盤/);
});

test('missing discs and unknown effective observations stay null instead of becoming zero',()=>{
 const characters=[character('missing',{driveDiscs:null}),
  character('partial',{driveDiscs:[disc(1)]}),
  character('unknown-effective',{driveDiscs:Array.from({length:6},(_,i)=>disc(i+1,{substats:[{isEffective:null,enhancementCount:0}]}))})];
 for(const row of growthAdvice(characters,[])){
  assert.equal(row.effectiveCount,null);
  assert.equal(row.actions.find(action=>action.id==='disc-observation').kind,'verify');
 }
 const zero=character('known-zero',{level:31,driveDiscs:Array.from({length:6},(_,i)=>disc(i+1,{substats:[{isEffective:false,enhancementCount:0}]}))});
 assert.equal(growthAdvice([zero],[])[0].effectiveCount,0);
});

test('displayed skills above twelve remain verbatim and an unknown core requires verification',()=>{
 const skills={普通攻擊:13,閃避:5,支援技:16,特殊技:15,連攜技:15};
 const [{actions}]=growthAdvice([character('displayed',{skills})],[]);
 assert.equal(actions.length,1);
 assert.equal(actions[0].kind,'verify');
 assert.match(actions[0].detail,/普通攻擊13/);
 assert.match(actions[0].detail,/支援技16/);
 assert.match(actions[0].detail,/核心技等級尚未核對/);
 assert.doesNotMatch(actions[0].detail,/滿級|升至12|提升至12|基礎等級/);
});

test('recorded core F is preserved and unknown skills still produce verification without upgrades',()=>{
 const [{actions}]=growthAdvice([character('seth',{skills:{核心技:'F'}})],[]);
 assert.ok(actions.every(action=>action.kind==='verify'));
 assert.match(actions[0].detail,/核心技已記錄為F/);
 assert.doesNotMatch(actions[0].detail,/核心技等級尚未核對/);
 const unknown=growthAdvice([character('unknown-skills',{skills:null})],[])[0];
 assert.ok(unknown.actions.some(action=>action.kind==='verify'&&action.detail.includes('核心技等級尚未核對')));
 assert.ok(unknown.actions.every(action=>action.kind!=='upgrade'));
});

test('invalid numeric observations are verified rather than producing upgrade estimates',()=>{
 for(const value of [NaN,Infinity,-1,'0']){
  const [row]=growthAdvice([character('invalid',{level:value,wEngine:{name:'已知名稱',level:value},driveDiscs:Array.from({length:6},(_,i)=>disc(i+1,{level:value}))})],[]);
  assert.ok(row.actions.every(action=>action.kind==='verify'));
 }
});


test('effectiveness review names only level-fifteen discs with confirmed zero effective rolls',()=>{
 const zero={substats:[{isEffective:false,enhancementCount:0}]};
 const discs=[disc(1,zero),disc(2,{substats:[{isEffective:null,enhancementCount:0}]}),
  disc(3,{...zero,level:0}),disc(4,{...zero,level:14}),disc(5),
  disc(6,{substatsComplete:false,substats:[]})];
 const [{actions,effectiveCount}]=growthAdvice([character('review',{driveDiscs:discs})],[]);
 const review=actions.find(action=>action.id==='disc-effectiveness');
 assert.equal(review.kind,'verify');
 assert.equal(review.detail,'1號盤：目前已強化15級，但觀測未記有效副詞條。先核對主詞條、套裝與隊伍用途，再決定是否更換。');
 assert.equal(effectiveCount,null);
 const upgrade=actions.find(action=>action.id==='disc-level');
 assert.match(upgrade.detail,/3號盤目前0級、4號盤目前14級/);
 assert.doesNotMatch(upgrade.detail,/1號盤/);
 assert.doesNotMatch(review.detail,/廢盤|重刷|優先/);
});

test('an unknown level or effectiveness never creates the confirmed-zero review',()=>{
 for(const overrides of [
  {level:null,substats:[]},
  {level:0,substats:[]},
  {level:14,substats:[]},
  {level:15,substatsComplete:false,substats:[]},
  {level:15,substats:[{isEffective:true,enhancementCount:null}]},
 ]){
  const advice=growthAdvice([character('unconfirmed',{level:31,driveDiscs:Array.from({length:6},(_,i)=>disc(i+1,overrides))})],[]);
  assert.ok(advice[0].actions.every(action=>action.id!=='disc-effectiveness'));
 }
});


test('published guides keep unique identities, owned artwork and direct official sources',async()=>{
 const fs=await import('node:fs/promises');
 const data=JSON.parse(await fs.readFile(new URL('../lib/zzz_team_guides.json',import.meta.url)));
 const assets=JSON.parse(await fs.readFile(new URL('../lib/zzz_assets.json',import.meta.url)));
 assert.equal(data.teams.length,8);
 assert.equal(new Set(data.teams.map(team=>team.id)).size,data.teams.length);
 assert.match(data.meta.basedOnCommit,/^[a-f0-9]{40}$/);
 for(const team of data.teams){
  const ids=team.members.map(member=>member.id);assert.equal(ids.length,3);assert.equal(new Set(ids).size,3);
  for(const member of team.members){assert.ok(assets.characters[member.id]);assert.ok(member.focus.length>0)}
  assert.equal(team.activation.length,3);
  for(const step of team.steps){assert.ok(ids.includes(step.characterId));assert.ok(step.action.length>0)}
  for(const source of team.sources){const url=new URL(source.url);assert.equal(url.protocol,'https:');assert.ok(['wiki.hoyolab.com','zenless.hoyoverse.com'].includes(url.hostname))}
 }
});

test('a role plan recommends Zhu Yuan chain 9 to 11 and marks a support target met',()=>{
 const plans={zhu_yuan:trainingPlan([
  {skill:'連攜技',target:11,priority:1,reason:'先補失衡窗口的爆發。'},
  {skill:'支援技',target:11,priority:2,reason:'支援進場先達本隊目標。'},
 ])};
 const source=character('zhu_yuan',{mindscape:0,skills:{...allSkills,連攜技:9,支援技:11}});
 const [{actions}]=growthAdvice([source],['zhu_yuan'],plans);
 const chain=actions.find(action=>action.skill==='連攜技');
 assert.equal(chain.kind,'upgrade');
 assert.equal(chain.current,9);
 assert.equal(chain.target,11);
 assert.equal(chain.priority,1);
 assert.match(chain.title,/9 → 11/);
 const assist=actions.find(action=>action.skill==='支援技');
 assert.equal(assist.kind,'complete');
 assert.match(assist.detail,/本隊目標/);
 assert.doesNotMatch(assist.detail,/滿級/);
 assert.equal(actions.find(action=>action.skill==='核心技').kind,'complete');
 assert.ok(!actions.some(action=>action.kind==='upgrade'&&action.skill==='支援技'));
});

test('low basic and dodge levels are not promoted without a role rule',()=>{
 const source=character('sunna',{mindscape:0,skills:{...allSkills,普通攻擊:1,閃避:1,支援技:11}});
 const plans={sunna:trainingPlan([{skill:'支援技',target:11,priority:2,reason:'本隊支援先維持11級。'}])};
 const [{actions}]=growthAdvice([source],[],plans);
 assert.ok(actions.every(action=>action.kind==='complete'));
 assert.ok(!actions.some(action=>['普通攻擊','閃避'].includes(action.skill)));
});

test('displayed caps preserve M4 fourteen and M6 sixteen without base-level conversion',()=>{
 for(const [mindscape,cap,current] of [[4,14,13],[6,16,15]]){
  const source=character('displayed',{mindscape,skills:{...allSkills,普通攻擊:current}});
  const plans={displayed:trainingPlan([{skill:'普通攻擊',target:cap,priority:1,reason:'補強主輸出技能。'}],{
   observedMindscape:mindscape,displayedCaps:Object.fromEntries(['普通攻擊','閃避','支援技','特殊技','連攜技'].map(skill=>[skill,cap])),
  })};
  const action=growthAdvice([source],[],plans)[0].actions.find(action=>action.skill==='普通攻擊');
  assert.equal(action.kind,'upgrade');
  assert.equal(action.current,current);
  assert.equal(action.target,cap);
  assert.doesNotMatch(action.detail,/基礎等級/);
 }
});

test('updated observations turn a skill upgrade into completion without changing its plan',()=>{
 const plans=freeze({agent:trainingPlan([{skill:'特殊技',target:11,priority:1,reason:'補強本隊主要輸出技能。'}])});
 const before=character('agent',{mindscape:0,skills:{...allSkills,特殊技:10}});
 const after=character('agent',{mindscape:0,skills:{...allSkills,特殊技:11}});
 assert.equal(growthAdvice([before],[],plans)[0].actions.find(action=>action.skill==='特殊技').kind,'upgrade');
 assert.equal(growthAdvice([after],[],plans)[0].actions.find(action=>action.skill==='特殊技').kind,'complete');
});

test('unknown skills require verification while observed zero remains a known upgrade',()=>{
 const plan=trainingPlan([{skill:'特殊技',target:11,priority:1,reason:'本隊主要技能目標。'}]);
 const sources=[character('unknown',{mindscape:0,skills:{...allSkills,特殊技:null,核心技:null}}),
  character('zero',{mindscape:0,skills:{...allSkills,特殊技:0,核心技:0}})];
 const rows=growthAdvice(sources,[],{unknown:plan,zero:plan});
 const unknown=rows.find(row=>row.characterId==='unknown').actions;
 assert.equal(unknown.find(action=>action.skill==='特殊技').kind,'verify');
 assert.equal(unknown.find(action=>action.skill==='特殊技').current,null);
 assert.equal(unknown.find(action=>action.skill==='核心技').kind,'verify');
 const zero=rows.find(row=>row.characterId==='zero').actions;
 assert.equal(zero.find(action=>action.skill==='特殊技').kind,'upgrade');
 assert.equal(zero.find(action=>action.skill==='特殊技').current,0);
 assert.equal(zero.find(action=>action.skill==='核心技').kind,'upgrade');
 assert.equal(zero.find(action=>action.skill==='核心技').current,0);
});

test('an outdated mindscape or invalid displayed target requires verification instead of an upgrade',()=>{
 const source=character('agent',{mindscape:4,skills:{...allSkills,普通攻擊:13}});
 const rule={skill:'普通攻擊',target:14,priority:1,reason:'本隊主輸出目標。'};
 const outdated=trainingPlan([rule]);
 const actions=growthAdvice([source],[],{agent:outdated})[0].actions;
 assert.equal(actions.find(action=>action.id==='training-plan-observation').kind,'verify');
 assert.ok(!actions.some(action=>action.skill==='普通攻擊'));
 assert.equal(actions.find(action=>action.skill==='核心技').kind,'complete');
 const overCap=trainingPlan([rule],{observedMindscape:4});
 const invalid=growthAdvice([source],[],{agent:overCap})[0].actions;
 assert.equal(invalid.find(action=>action.skill==='普通攻擊').kind,'verify');
 assert.ok(!invalid.some(action=>action.kind==='upgrade'));
 const unknownCap=trainingPlan([rule],{observedMindscape:4,displayedCaps:{普通攻擊:14}});
 assert.equal(growthAdvice([source],[],{agent:unknownCap})[0].actions.find(action=>action.id==='training-plan-observation').kind,'verify');
});

test('planned actions are stably ordered within selected characters and preserve frozen inputs',()=>{
 const rules=[{skill:'特殊技',target:12,priority:3,reason:'最後補強。'},
  {skill:'連攜技',target:11,priority:1,reason:'第一步。'},
  {skill:'支援技',target:11,priority:1,reason:'第二步。'}];
 const sources=freeze([character('a',{mindscape:0,skills:{...allSkills,核心技:'D',特殊技:11,連攜技:9,支援技:10}}),
  character('b',{mindscape:0})]);
 const plans=freeze({a:trainingPlan(rules),b:trainingPlan(rules)});
 const priorities=freeze(['b','a']);
 const before=JSON.stringify({sources,plans,priorities});
 const rows=growthAdvice(sources,priorities,plans);
 assert.deepEqual(rows.map(row=>row.characterId),['b','a']);
 assert.deepEqual(rows[1].actions.map(action=>action.skill),['核心技','連攜技','支援技','特殊技']);
 assert.deepEqual(rows[1].actions.map(action=>action.priority),[0,1,1,3]);
 assert.equal(JSON.stringify({sources,plans,priorities}),before);
});
