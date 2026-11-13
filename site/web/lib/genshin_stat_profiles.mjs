import research from './genshin_stat_profiles.json' with {type:'json'};

const profiles=new Map(research.profiles.map(profile=>[profile.id,profile]));

/** Public build guidance is separate from observed artifact effectiveness. */
export function getGenshinStatProfile(id){
 return profiles.get(id)??null;
}

/** Conditional benefits stay explanatory until their build condition is known. */
export function panelStatAssessment(id,key){
 const profile=getGenshinStatProfile(id);
 if(!profile)return {effective:false,reason:'有效屬性尚未確認'};
 const condition=profile.conditional.find(condition=>condition.key===key);
 if(condition)return {effective:false,reason:condition.reason};
 if(profile.effective_panel_keys.includes(key))return {effective:true};
 return profile.unknown_reason?{effective:false,reason:profile.unknown_reason}:{effective:false};
}
