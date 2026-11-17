import {completeLoadout,maximumEffectiveRollBudget} from './roll_budget.mjs';

const artifactSlots=['flower','plume','sands','goblet','circlet'];
const substatKeys=new Set(['hp','hp_pct','atk','atk_pct','def','def_pct','em','energy_recharge','crit_rate','crit_dmg']);
const mainStatKeys=new Set(['hp','atk','hp_pct','atk_pct','def_pct','em','energy_recharge','crit_rate','crit_dmg','healing_bonus','physical_dmg_bonus','pyro_dmg_bonus','hydro_dmg_bonus','dendro_dmg_bonus','electro_dmg_bonus','anemo_dmg_bonus','cryo_dmg_bonus','geo_dmg_bonus']);

function resolvedEffective(roll,observation){
 if(typeof roll?.effective==='boolean')return roll.effective;
 return observation?.rule_id&&Array.isArray(observation.effective_keys)&&typeof roll?.assessed_effective==='boolean'?roll.assessed_effective:null;
}
/** Game observations take precedence over a named role-rule assessment. */
export function substatRoll(artifact, key, characterId) {
 const observation=artifact?.substat_rolls;
 const roll=observation?.values.find(row=>row.key===key);
 const sameCharacter=observation?.character_id===characterId;
 const effective=sameCharacter?resolvedEffective(roll,observation):null;
 const effectiveSource=typeof effective==='boolean'?(typeof roll?.effective==='boolean'?'game_observed':'role_rule'):null;
 return {key,enhancements:roll?.enhancements??null,effective,effectiveSource};
}
export function effectiveSubstatCount(artifact, characterId) {
 const observation=artifact?.substat_rolls;
 if(!observation||observation.character_id!==characterId)return null;
 if(observation.values.length!==artifact.substats.length||artifact.substats.some(s=>!observation.values.some(r=>r.key===s.key)))return null;
 let total=0;
 for(const roll of observation.values){
  const effective=resolvedEffective(roll,observation);
  if(effective===null||(effective&&roll.enhancements===null))return null;
  if(effective)total+=roll.enhancements+1;
 }
 return total;
}
export function effectiveLoadoutCount(artifacts, characterId) {
 if(!completeLoadout(artifacts,artifactSlots))return null;
 const counts=artifacts.map(x=>effectiveSubstatCount(x,characterId));
 return counts.some(x=>x===null)?null:counts.reduce((sum,x)=>sum+x,0);
}
/** Positive observed union for this character, not a complete character-build guide. */
export function artifactEffectiveKeys(artifacts,characterId) {
 if(!Array.isArray(artifacts)||typeof characterId!=='string'||!characterId)return null;
 const rules=artifacts.map(artifact=>artifact?.substat_rolls).filter(row=>row?.character_id===characterId&&row.rule_id&&Array.isArray(row.effective_keys));
 if(rules.length){
  const normalized=rules.map(rule=>[...new Set(rule.effective_keys)].sort());
  if(normalized.some(keys=>keys.some(key=>!substatKeys.has(key))||JSON.stringify(keys)!==JSON.stringify(normalized[0])))return null;
  return normalized[0];
 }
 const observed=new Map();
 for(const artifact of artifacts){
  const observation=artifact?.substat_rolls;
  if(observation?.character_id!==characterId||!Array.isArray(observation.values))continue;
  for(const roll of observation.values){
   if(typeof roll?.effective!=='boolean')continue;
   if(!substatKeys.has(roll.key)||!Array.isArray(artifact.substats)||!artifact.substats.some(stat=>stat?.key===roll.key))return null;
   if(observed.has(roll.key)&&observed.get(roll.key)!==roll.effective)return null;
   observed.set(roll.key,roll.effective);
  }
 }
 const positive=[...substatKeys].filter(key=>observed.get(key)===true);
 return positive.length?positive:[...substatKeys].every(key=>observed.get(key)===false)?[]:null;
}
/** Ceiling under the supplied effective set, including theoretical initial rows and five upgrades. */
export function maximumArtifactCount(artifact,effectiveKeys=null) {
 const mainKey=artifact?.main_stat?.key;
 if(artifact?.rarity!==5||!mainStatKeys.has(mainKey)||!Array.isArray(effectiveKeys)||Array.from(effectiveKeys).some(key=>!substatKeys.has(key)))return null;
 return maximumEffectiveRollBudget({mainKey,effectiveKeys});
}
export function maximumArtifactLoadout(artifacts,effectiveKeys=null) {
 if(!completeLoadout(artifacts,artifactSlots))return null;
 const counts=artifacts.map(artifact=>maximumArtifactCount(artifact,effectiveKeys));
 return counts.some(count=>count===null)?null:counts.reduce((sum,count)=>sum+count,0);
}
/** A transfer retains physical counts but requires a new effectiveness observation. */
export function editSubstatRoll(artifact, characterId, key, patch) {
 const previous=artifact.substat_rolls;
 artifact.substat_rolls={character_id:characterId,values:artifact.substats.map(s=>{
  const old=previous?.values.find(r=>r.key===s.key);
  const row={key:s.key,enhancements:old?.enhancements??null,effective:previous?.character_id===characterId?(old?.effective??null):null};
  return s.key===key?{...row,...patch}:row;
 })};
}
