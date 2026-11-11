const definitions=[
 {key:'hp',label:'生命值',unit:'flat'},
 {key:'hp_pct',label:'生命值 (%)',unit:'percent'},
 {key:'atk',label:'攻擊力',unit:'flat'},
 {key:'atk_pct',label:'攻擊力 (%)',unit:'percent'},
 {key:'def',label:'防禦力',unit:'flat'},
 {key:'def_pct',label:'防禦力 (%)',unit:'percent'},
 {key:'em',label:'元素精通',unit:'flat'},
 {key:'energy_recharge',label:'元素充能效率',unit:'percent'},
 {key:'crit_rate',label:'暴擊率',unit:'percent'},
 {key:'crit_dmg',label:'暴擊傷害',unit:'percent'},
];

export function artifactSubstatOptions(artifact,index){
 const used=new Set([artifact.main_stat.key,...artifact.substats.filter((_,i)=>i!==index).map(stat=>stat.key)]);
 return definitions.map(option=>({...option,disabled:used.has(option.key)}));
}

/** A different attribute needs new observed values and roll annotations. */
export function changeArtifactSubstat(artifact,index,key){
 const previous=artifact.substats[index];
 const option=artifactSubstatOptions(artifact,index).find(option=>option.key===key);
 if(!previous||!option||option.disabled||previous.key===key)return false;
 artifact.substats[index]={key,value:null,unit:option.unit};
 if(artifact.substat_rolls){
  const previousRows=artifact.substat_rolls.values;
  artifact.substat_rolls.values=artifact.substats.map(stat=>stat.key===key
   ?{key,enhancements:null,effective:null}
   :previousRows.find(row=>row.key===stat.key)??{key:stat.key,enhancements:null,effective:null});
 }
 return true;
}
