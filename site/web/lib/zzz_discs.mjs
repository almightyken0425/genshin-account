import {completeLoadout,maximumEffectiveRollBudget} from './roll_budget.mjs';

const slots=[1,2,3,4,5,6];
const substatKeys=new Set(['生命值|flat','生命值|percent','攻擊力|flat','攻擊力|percent','防禦力|flat','防禦力|percent','暴擊率|percent','暴擊傷害|percent','異常精通|flat','穿透值|flat']);
const mainStatKeys=new Set(['生命值|flat','生命值|percent','攻擊力|flat','攻擊力|percent','防禦力|flat','防禦力|percent','暴擊率|percent','暴擊傷害|percent','異常精通|flat','穿透率|percent','衝擊力|percent','能量自動回復|percent','異常掌控|percent','異常掌握|percent','物理傷害加成|percent','火屬性傷害加成|percent','冰屬性傷害加成|percent','電屬性傷害加成|percent','以太傷害加成|percent','風屬性傷害加成|percent']);
function statKey(stat){return typeof stat?.name==='string'&&stat.name&&(stat.unit==='flat'||stat.unit==='percent')?stat.name+'|'+stat.unit:null}
export function discStatEffective(stat,disc){
 if(typeof stat?.isEffective==='boolean')return stat.isEffective;
 return disc?.assessment?.method==='role_rule'&&disc.assessment.ruleId&&Array.isArray(disc.effectiveKeys)&&typeof stat?.assessedEffective==='boolean'?stat.assessedEffective:null;
}
/** ZZZ rules and evidence remain separate from Genshin. */
export function discSlots(discs){return Array.from({length:6},(_,index)=>({slot:index+1,disc:Array.isArray(discs)?discs.find(d=>d.slot===index+1)??null:null}))}
export function effectiveDiscCount(disc){
 if(!disc||!Array.isArray(disc.substats)||disc.substatsComplete!==true)return null;
 let count=0;
 for(const stat of disc.substats){
  const effective=discStatEffective(stat,disc);
  if(typeof effective!=='boolean')return null;
  if(effective){if(!Number.isInteger(stat.enhancementCount)||stat.enhancementCount<0)return null;count+=1+stat.enhancementCount}
 }
 return count;
}
export function effectiveDiscLoadout(discs){
 if(!completeLoadout(discs,slots))return null;
 const values=discs.map(effectiveDiscCount);
 return values.some(x=>x===null)?null:values.reduce((a,b)=>a+b,0);
}
/** Positive observed union, not a complete agent-build guide. Missing markers are not false. */
export function discEffectiveKeys(discs){
 if(!Array.isArray(discs))return null;
 const rules=discs.filter(disc=>disc?.assessment?.method==='role_rule'&&disc.assessment.ruleId&&Array.isArray(disc.effectiveKeys));
 if(rules.length){
  const normalized=rules.map(disc=>[...new Set(disc.effectiveKeys)].sort());
  if(normalized.some(keys=>keys.some(key=>!substatKeys.has(key))||JSON.stringify(keys)!==JSON.stringify(normalized[0])))return null;
  return normalized[0];
 }
 const observed=new Map();
 for(const disc of discs){
  if(!Array.isArray(disc?.substats))continue;
  for(const stat of disc.substats){
   if(typeof stat?.isEffective!=='boolean')continue;
   const key=statKey(stat);
   if(!substatKeys.has(key))return null;
   if(observed.has(key)&&observed.get(key)!==stat.isEffective)return null;
   observed.set(key,stat.isEffective);
  }
 }
 const positive=[...substatKeys].filter(key=>observed.get(key)===true);
 return positive.length?positive:[...substatKeys].every(key=>observed.get(key)===false)?[]:null;
}
/** Ceiling under the supplied effective set, including theoretical initial rows and five upgrades. */
export function maximumDiscCount(disc,effectiveKeys=null){
 const mainKey=statKey(disc?.mainStat);
 if(disc?.rarity!=='S'||!mainStatKeys.has(mainKey)||!Array.isArray(effectiveKeys)||Array.from(effectiveKeys).some(key=>!substatKeys.has(key)))return null;
 return maximumEffectiveRollBudget({mainKey,effectiveKeys});
}
export function maximumDiscLoadout(discs,effectiveKeys=null){
 if(!completeLoadout(discs,slots))return null;
 const values=discs.map(disc=>maximumDiscCount(disc,effectiveKeys));
 return values.some(value=>value===null)?null:values.reduce((sum,value)=>sum+value,0);
}
