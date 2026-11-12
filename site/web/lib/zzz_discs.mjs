/** ZZZ observed rolls only. No Genshin value tiers or inferred enhancement counts. */
export function discSlots(discs){return Array.from({length:6},(_,index)=>({slot:index+1,disc:Array.isArray(discs)?discs.find(d=>d.slot===index+1)??null:null}))}
export function effectiveDiscCount(disc){
 if(!disc||!Array.isArray(disc.substats)||disc.substatsComplete!==true)return null;
 let count=0;
 for(const stat of disc.substats){
  if(typeof stat.isEffective!=='boolean')return null;
  if(stat.isEffective){if(!Number.isInteger(stat.enhancementCount)||stat.enhancementCount<0)return null;count+=1+stat.enhancementCount}
 }
 return count;
}
export function effectiveDiscLoadout(discs){
 const slots=discSlots(discs);const values=slots.map(({disc})=>effectiveDiscCount(disc));
 return values.some(x=>x===null)?null:values.reduce((a,b)=>a+b,0);
}
