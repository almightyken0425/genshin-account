/** Enhancement counts are observed in game, never inferred from stat values. */
export function substatRoll(artifact, key, characterId) {
 const observation=artifact?.substat_rolls;
 const roll=observation?.values.find(row=>row.key===key);
 return {key,enhancements:roll?.enhancements??null,effective:observation?.character_id===characterId?(roll?.effective??null):null};
}
export function effectiveSubstatCount(artifact, characterId) {
 const observation=artifact?.substat_rolls;
 if(!observation||observation.character_id!==characterId)return null;
 if(observation.values.length!==artifact.substats.length||artifact.substats.some(s=>!observation.values.some(r=>r.key===s.key)))return null;
 let total=0;
 for(const roll of observation.values){
  if(roll.effective===null||(roll.effective&&roll.enhancements===null))return null;
  if(roll.effective)total+=roll.enhancements+1;
 }
 return total;
}
export function effectiveLoadoutCount(artifacts, characterId) {
 if(artifacts.length!==5)return null;
 const counts=artifacts.map(x=>effectiveSubstatCount(x,characterId));
 return counts.some(x=>x===null)?null:counts.reduce((sum,x)=>sum+x,0);
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
