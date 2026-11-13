import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCurrentZzz} from './helpers/current_accounts.mjs';
import {discSlots,effectiveDiscCount,effectiveDiscLoadout,maximumDiscCount,maximumDiscLoadout,discEffectiveKeys} from '../lib/zzz_discs.mjs';
const stat=(isEffective,enhancementCount)=>({name:'攻擊力',value:3,unit:'percent',isEffective,enhancementCount});
const disc={slot:1,substatsComplete:true,substats:[stat(true,2),stat(false,null),stat(true,0)]};
test('six ZZZ slots preserve incomplete equipment as unknown',()=>{assert.equal(discSlots(null).length,6);assert.equal(discSlots([disc])[0].disc,disc);assert.equal(discSlots([disc])[5].disc,null);assert.equal(effectiveDiscLoadout([disc]),null)});
test('observed effective roll counts include initial roll, not stat-value inference',()=>{assert.equal(effectiveDiscCount(disc),4);assert.equal(effectiveDiscCount({...disc,substatsComplete:false}),null);assert.equal(effectiveDiscCount({...disc,substats:[stat(null,3)]}),null);assert.equal(effectiveDiscCount({...disc,substats:[stat(true,null)]}),null);assert.equal(effectiveDiscCount({...disc,substats:[stat(false,null)]}),0)});
test('only six fully known discs produce loadout count',()=>{assert.equal(effectiveDiscLoadout(Array.from({length:6},(_,i)=>({...disc,slot:i+1}))),24)});
const attackKeys=['攻擊力|flat','攻擊力|percent'];
const theoryDisc=(name='生命值',unit='flat',slot=1)=>({slot,rarity:'S',mainStat:{name,unit,value:null},level:null,substatsComplete:false,substats:[]});
const marked=(name,unit,isEffective)=>({name,unit,isEffective,enhancementCount:null,value:null});
const pool=['生命值|flat','生命值|percent','攻擊力|flat','攻擊力|percent','防禦力|flat','防禦力|percent','暴擊率|percent','暴擊傷害|percent','異常精通|flat','穿透值|flat'];
test('disc maximum removes exact main identity while distinguishing flat and percent attack',()=>{
 assert.equal(maximumDiscCount(theoryDisc('攻擊力','flat'),attackKeys),6);
 assert.equal(maximumDiscCount(theoryDisc('攻擊力','percent'),attackKeys),6);
 assert.equal(maximumDiscCount(theoryDisc(),attackKeys),7);
 assert.equal(maximumDiscCount(theoryDisc('能量自動回復','percent'),attackKeys),7);
 assert.equal(maximumDiscCount(theoryDisc('衝擊力','percent'),attackKeys),7);
 assert.equal(maximumDiscCount(theoryDisc(),pool),9);
 assert.equal(maximumDiscCount(theoryDisc(),['攻擊力|flat','攻擊力|flat']),6);
});
test('disc maximum preserves zero and unknown independently of current level and roll observations',()=>{
 const d=theoryDisc('攻擊力','flat');
 assert.equal(maximumDiscCount(d,[]),0);assert.equal(maximumDiscCount(d,['攻擊力|flat']),0);
 assert.equal(maximumDiscCount(d),null);assert.equal(maximumDiscCount(d,null),null);
 for(const level of [0,3,15,null])assert.equal(maximumDiscCount({...d,level},attackKeys),6);
 assert.equal(maximumDiscCount({...d,substatsComplete:false,substats:[marked('攻擊力','percent',null)]},attackKeys),6);
});
test('disc theoretical maximum requires known S rarity and a legal identifiable main stat and effective key',()=>{
 for(const rarity of [null,'A'])assert.equal(maximumDiscCount({...theoryDisc(),rarity},attackKeys),null);
 for(const mainStat of [null,{name:null,unit:'flat'},{name:'攻擊力',unit:null},{name:'不存在屬性',unit:'percent'},{name:'暴擊率',unit:'flat'}])assert.equal(maximumDiscCount({...theoryDisc(),mainStat},attackKeys),null);
 assert.equal(maximumDiscCount(theoryDisc(),['攻擊力|unknown']),null);
});
test('disc observed effective union keeps known positives despite unknown markers or incomplete equipment',()=>{
 const partial=[{substatsComplete:false,substats:[marked('攻擊力','flat',true),marked('攻擊力','percent',true),marked('暴擊率','percent',null)]}];
 assert.deepEqual(discEffectiveKeys(partial),attackKeys);
 assert.equal(discEffectiveKeys([{substats:[marked('攻擊力','flat',false),marked('暴擊率','percent',null)]}]),null);
 assert.equal(discEffectiveKeys(null),null);assert.equal(discEffectiveKeys([]),null);
});
test('disc observed profile returns empty only when every candidate is explicitly false and rejects conflicts',()=>{
 const allFalse=[0,4,8].map(offset=>({substats:pool.slice(offset,offset+4).map(key=>{const [name,unit]=key.split('|');return marked(name,unit,false)})}));
 assert.deepEqual(discEffectiveKeys(allFalse),[]);
 allFalse[0].substats[0].isEffective=null;assert.equal(discEffectiveKeys(allFalse),null);
 assert.equal(discEffectiveKeys([{substats:[marked('攻擊力','flat',true)]},{substats:[marked('攻擊力','flat',false)]}]),null);
 assert.equal(discEffectiveKeys([{substats:[marked('攻擊力',null,true)]}]),null);
 assert.equal(discEffectiveKeys([{substats:[marked('元素精通','flat',true)]}]),null);
});
test('disc loadout maximum requires six distinct slots while profile extraction does not',()=>{
 const discs=Array.from({length:6},(_,i)=>theoryDisc('生命值','flat',i+1));
 assert.equal(maximumDiscLoadout(discs,attackKeys),42);assert.equal(maximumDiscLoadout(discs,[]),0);
 assert.equal(maximumDiscLoadout(discs),null);assert.equal(maximumDiscLoadout(discs.slice(1),attackKeys),null);
 const repeated=[...discs.slice(0,5),discs[0]];assert.equal(maximumDiscLoadout(repeated,attackKeys),null);assert.equal(effectiveDiscLoadout(repeated),null);
 assert.equal(maximumDiscLoadout([...discs,discs[0]],attackKeys),null);assert.equal(effectiveDiscLoadout([...discs,discs[0]]),null);
 assert.equal(maximumDiscLoadout(null,attackKeys),null);
});
test('real Sunna observations retain current seventeen and give slot-two six, loadout thirty-nine',()=>{
 const {account}=loadCurrentZzz();
 const sunna=account.characters.find(character=>character.id==='sunna');assert.ok(sunna);
 const keys=discEffectiveKeys(sunna.driveDiscs);assert.deepEqual(keys,attackKeys);
 const slot2=sunna.driveDiscs.find(d=>d.slot===2);assert.equal(slot2.mainStat.name,'攻擊力');assert.equal(slot2.mainStat.unit,'flat');
 assert.equal(maximumDiscCount(slot2,keys),6);assert.equal(maximumDiscLoadout(sunna.driveDiscs,keys),39);
 assert.equal(effectiveDiscLoadout(sunna.driveDiscs),17);
 const percentMain=sunna.driveDiscs.find(d=>d.slot===4);assert.equal(percentMain.mainStat.unit,'percent');assert.equal(maximumDiscCount(percentMain,keys),6);
});
test('Genshin and ZZZ share actual substat and badge components, not roll tiers',()=>{const ui=readFileSync(new URL('../app/zzz_character_detail.tsx',import.meta.url),'utf8');assert.match(ui,/ArtifactSubstat/);assert.match(ui,/EffectiveBadge/);assert.match(ui,/MetricDisplayContext/);assert.match(ui,/artifact-details-grid/);assert.match(ui,/summary-stats/);assert.ok(!ui.includes('artifact_rolls'));assert.ok(!ui.includes('未裝備'));assert.match(ui,/尚未確認/)});
test('unknown units remain visibly uncertain, not assumed flat',()=>{const ui=readFileSync(new URL('../components/equipment/artifact_substat.tsx',import.meta.url),'utf8');assert.match(ui,/stat.unit===null\?' 單位待核'/);const detail=readFileSync(new URL('../app/zzz_character_detail.tsx',import.meta.url),'utf8');assert.match(detail,/副詞條待核/);assert.match(detail,/disc.mainStat.unit===null\?' 單位待核'/)});
test('panel effectiveness is observation-only and uses shared effective styling',()=>{const ui=readFileSync(new URL('../app/zzz_character_detail.tsx',import.meta.url),'utf8');assert.match(ui,/statsEffective\?\.\[label\]===true/);const css=readFileSync(new URL('../app/detail.css',import.meta.url),'utf8');assert.match(css,/\.substat-field\.is-effective,\.summary-stats>\.is-effective/)});
