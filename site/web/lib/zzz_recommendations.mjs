import {discSlots,effectiveDiscCount,effectiveDiscLoadout} from './zzz_discs.mjs';

const skillNames=['普通攻擊','閃避','支援技','特殊技','連攜技'];
const knownLevel=value=>Number.isInteger(value)&&value>=0;
const knownSkill=value=>knownLevel(value)||(typeof value==='string'&&/^[A-F]$/.test(value));
const knownName=value=>typeof value==='string'&&value.trim().length>0;

function uniqueCharacters(characters){
 if(!Array.isArray(characters))throw new TypeError('characters must be an array');
 const seen=new Set();
 return characters.filter(character=>{
  if(!character||!knownName(character.id)||seen.has(character.id))return false;
  seen.add(character.id);return true;
 });
}

/** Preserve guide order; ownership is limited to characters actually observed. */
export function eligibleTeams(characters,guides){
 const observed=new Set(uniqueCharacters(characters).map(character=>character.id));
 if(!Array.isArray(guides))throw new TypeError('guides must be an array');
 return guides.filter(guide=>{
  if(!Array.isArray(guide?.members)||guide.members.length!==3)return false;
  const ids=guide.members.map(member=>member?.id);
  return new Set(ids).size===3&&ids.every(id=>observed.has(id));
 });
}

function plannedSkillActions(character,plan){
 const skills=character.skills??{};
 const actions=[];
 const core=skills['核心技'];
 const coreKnown=core===0||(typeof core==='string'&&/^[A-F]$/.test(core));
 if(!coreKnown){
  actions.push({id:'core-training',kind:'verify',skill:'核心技',current:null,priority:0,title:'核對核心技',detail:'核心技階段尚未確認，先補齊觀測再安排培養。'});
 }else if(core==='F'){
  actions.push({id:'core-training',kind:'complete',skill:'核心技',current:core,target:'F',priority:0,title:'核心技已達本隊目標',detail:'已確認核心技F，可把培養資源轉向本隊尚未達標的項目。'});
 }else{
  actions.push({id:'core-training',kind:'upgrade',skill:'核心技',current:core,target:'F',priority:0,title:`核心技 ${core} → F`,detail:`目前核心技為${core}，可優先朝F培養，再補強一般技能倍率。`});
 }

 const validPlan=plan&&typeof plan==='object'&&Array.isArray(plan.skills)&&plan.displayedCaps&&typeof plan.displayedCaps==='object';
 const capsValid=validPlan&&skillNames.every(name=>Number.isInteger(plan.displayedCaps[name])&&plan.displayedCaps[name]>=1&&plan.displayedCaps[name]<=20);
 const mindscapeMatches=validPlan&&Number.isInteger(plan.observedMindscape)&&plan.observedMindscape>=0&&plan.observedMindscape<=6&&character.mindscape===plan.observedMindscape;
 if(!capsValid||!mindscapeMatches){
  actions.push({id:'training-plan-observation',kind:'verify',priority:1,title:'重新核對技能顯示上限',detail:!mindscapeMatches?'目前影畫與本次技能上限觀測不一致或尚未確認，先更新技能頁再使用等級目標。':'技能上限紀錄尚未完整，先核對畫面分母再設定顯示等級目標。'});
  return actions;
 }

 const planned=new Set();
 for(const rule of plan.skills){
  const priority=[1,2,3].includes(rule?.priority)?rule.priority:3;
  const skill=rule?.skill;
  if(!skillNames.includes(skill)||planned.has(skill)){
   actions.push({id:'training-rule-observation-'+actions.length,kind:'verify',priority,title:'核對技能培養計畫',detail:'技能名稱或重複規則需要核對，暫不據此安排升級。'});
   continue;
  }
  planned.add(skill);
  const current=skills[skill],target=rule.target,cap=plan.displayedCaps[skill];
  const knownCurrent=knownLevel(current)&&current<=20;
  if(!Number.isInteger(target)||target<1||target>cap||!knownName(rule.reason)||![1,2,3].includes(rule.priority)){
   actions.push({id:'skill-training-'+skill,kind:'verify',skill,current:knownCurrent?current:null,priority,title:'核對'+skill+'培養目標',detail:'本隊目標尚未通過顯示上限與培養理由核對，暫不據此安排升級。'});
  }else if(!knownCurrent){
   actions.push({id:'skill-training-'+skill,kind:'verify',skill,current:null,target,priority,title:'核對'+skill+'等級',detail:`目前顯示等級尚未確認，先補齊觀測再安排${target}級目標。${rule.reason}`});
  }else if(current>cap){
   actions.push({id:'skill-training-'+skill,kind:'verify',skill,current,priority,title:'重新核對'+skill+'顯示上限',detail:`目前顯示${current}級，超過本次記錄的${cap}級上限，先更新技能頁再安排培養。`});
  }else if(current<target){
   actions.push({id:'skill-training-'+skill,kind:'upgrade',skill,current,target,priority,title:`${skill} ${current} → ${target}`,detail:`目前顯示${current}級，本隊目標為${target}級。${rule.reason}`});
  }else{
   actions.push({id:'skill-training-'+skill,kind:'complete',skill,current,target,priority,title:skill+'已達本隊目標',detail:`目前顯示${current}級，已達${target}級的本隊目標。${rule.reason}`});
  }
 }
 const missing=skillNames.filter(name=>!planned.has(name)&&!knownLevel(skills[name]));
 if(missing.length)actions.push({id:'skill-observation',kind:'verify',priority:3,title:'補齊其他技能觀測',detail:missing.join('、')+'的顯示等級尚未核對，不因缺資料推定尚未培養。'});
 return actions;
}

function characterActions(character,plan){
 const actions=[];
 if(knownLevel(character.level)){
  if(character.level<60)actions.push({id:'character-level',kind:'upgrade',current:character.level,target:60,title:'提升角色等級',detail:`目前${character.level}級，若用於這支隊伍，可先以60級為培養目標。`});
 }else actions.push({id:'character-level',kind:'verify',title:'核對角色等級',detail:'角色等級尚未確認，先補齊觀測再安排升級。'});

 const engine=character.wEngine;
 if(knownName(engine?.name)&&knownLevel(engine.level)){
  if(engine.level<60)actions.push({id:'engine-level',kind:'upgrade',current:engine.level,target:60,title:'提升音擎等級',detail:`${engine.name}目前${engine.level}級，可將已確認使用的音擎提升至60級。`});
 }else{
  const detail=!knownName(engine?.name)?'音擎名稱尚未核對，先確認目前使用的音擎。':`${engine.name}的等級尚未核對，先確認等級再安排培養。`;
  actions.push({id:'engine-level',kind:'verify',title:'核對目前音擎',detail});
 }

 const slots=discSlots(character.driveDiscs);
 const upgrades=slots.filter(({disc})=>disc?.rarity==='S'&&knownLevel(disc.level)&&disc.level<15);
 if(upgrades.length)actions.push({id:'disc-level',kind:'upgrade',current:upgrades.map(({slot,disc})=>`${slot}號 ${disc.level}`).join('、'),target:15,title:'提升已確認的S級驅動盤',detail:upgrades.map(({slot,disc})=>`${slot}號盤目前${disc.level}級`).join('、')+'。若繼續使用這些盤，可提升至15級。'});
 const ineffective=slots.filter(({disc})=>disc?.level===15&&effectiveDiscCount(disc)===0);
 if(ineffective.length)actions.push({id:'disc-effectiveness',kind:'verify',title:'檢視已強化盤的副詞條',detail:ineffective.map(({slot})=>slot+'號盤').join('、')+'：目前已強化15級，但觀測未記有效副詞條。先核對主詞條、套裝與隊伍用途，再決定是否更換。'});
 const missing=slots.filter(({disc})=>!disc||!knownName(disc.rarity)||!knownLevel(disc.level)||effectiveDiscCount(disc)===null);
 if(missing.length)actions.push({id:'disc-observation',kind:'verify',title:'補齊驅動盤觀測',detail:`${missing.map(({slot})=>slot+'號盤').join('、')}的盤面、等級或有效副詞條紀錄尚未完整，先核對資料。`});

 if(plan!==undefined)return [...actions,...plannedSkillActions(character,plan)]
  .map(action=>({...action,priority:action.priority??1}))
  .sort((a,b)=>a.priority-b.priority);

 const skills=character.skills??{};
 const observedSkills=skillNames.filter(name=>knownSkill(skills[name]));
 const missingSkills=skillNames.filter(name=>!knownSkill(skills[name]));
 const coreKnown=knownSkill(skills['核心技']);
 if(missingSkills.length||!coreKnown){
  const details=[];
  if(observedSkills.length)details.push('已記錄顯示等級：'+observedSkills.map(name=>name+skills[name]).join('、')+'。');
  if(missingSkills.length)details.push(missingSkills.join('、')+'的顯示等級尚未核對。');
  if(coreKnown)details.push('核心技已記錄為'+skills['核心技']+'。');
  else details.push('核心技等級尚未核對。');
  details.push('已顯示的等級照觀測保留，再依隊伍用途確認培養順序。');
  actions.push({id:'skill-observation',kind:'verify',title:missingSkills.length?'補齊技能觀測':'核對核心技',detail:details.join('')});
 }
 return actions;
}

/** Selected IDs lead; all remaining observed characters retain account order. */
export function growthAdvice(characters,priorityIds=[],plans={}){
 if(!Array.isArray(priorityIds))throw new TypeError('priorityIds must be an array');
 if(!plans||typeof plans!=='object'||Array.isArray(plans))throw new TypeError('plans must be a character ID map');
 const priorities=new Map();
 for(const id of priorityIds)if(!priorities.has(id))priorities.set(id,priorities.size);
 return uniqueCharacters(characters)
  .map((character,index)=>({character,index,priority:priorities.get(character.id)??Infinity}))
  .sort((a,b)=>a.priority-b.priority||a.index-b.index)
  .map(({character})=>({characterId:character.id,actions:characterActions(character,plans[character.id]),effectiveCount:effectiveDiscLoadout(character.driveDiscs)}))
  .filter(advice=>advice.actions.length>0);
}
