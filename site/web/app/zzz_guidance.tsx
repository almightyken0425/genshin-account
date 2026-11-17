'use client';

import GrowthPage from '@/components/pages/growth_page';
import type {GrowthTargetViewModel} from '@/components/growth/growth_target_card';
import {zzzRosterImage} from '@/lib/zzz_assets';
import {growthAdvice,type GrowthAction,type TrainingPlan} from '@/lib/zzz_recommendations.mjs';
import {zzzGrowthFocus,type GrowthFocus} from '@/lib/zzz_growth_focus.mjs';
import trainingPlans from '@/lib/zzz_training_plans.json';
import type {ZzzAgent} from '@/lib/zzz_types';
import './zzz_guidance.css';

type OpenCharacter=(id:string)=>void;
const plans=trainingPlans.characters as Readonly<Record<string,TrainingPlan>>;
const skillNames=['普通攻擊','閃避','支援技','特殊技','連攜技','核心技'] as const;
const observedValue=(value:string|number|null|undefined)=>value===null||value===undefined||value===''?'—':String(value);
const trainingCopy=(text:string)=>text.replaceAll('本隊目標','培養目標').replaceAll('本隊尚未達標','尚未達標').replaceAll('若用於這支隊伍，','若繼續培養，');
function SkillSummary({character}:{character:ZzzAgent}){
 return <dl className="zzz-guidance__skills" aria-label={character.name+'的技能顯示等級'}>{skillNames.map(skill=><div key={skill}><dt>{skill}</dt><dd>{observedValue(character.skills?.[skill])}</dd></div>)}</dl>;
}

const priorityLabels={0:'優先',1:'優先',2:'下一步',3:'資源充裕再補'} as const;
function actionTarget(character:ZzzAgent,action:GrowthAction):GrowthTargetViewModel{
 return {id:character.id+'/'+action.id,character:{id:character.id,name:character.name,src:zzzRosterImage(character.id)?.src},title:action.skill||trainingCopy(action.title),kind:action.kind,current:action.current,target:action.target,targetLabel:'培養目標',priority:action.kind==='upgrade'&&action.priority!==undefined?priorityLabels[action.priority]:undefined,detail:trainingCopy(action.detail)};
}
function characterActions(character:ZzzAgent):GrowthAction[]{
 if(!plans[character.id])return [{id:'training-plan-observation',kind:'verify',title:'培養目標待核對',detail:'已保留目前角色與技能觀測；此角色尚未建立技能培養目標。'}];
 return growthAdvice([character],[character.id],plans)[0]?.actions??[];
}
function focusTarget(focus:GrowthFocus,character:ZzzAgent):GrowthTargetViewModel{
 return {...focus,character:{id:character.id,name:character.name,src:zzzRosterImage(character.id)?.src},targetLabel:'培養目標',detail:<>{focus.detail.map((paragraph,index)=><p key={index}>{paragraph}</p>)}<p>查核日期：2026-11-13</p>{focus.sources.map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></p>)}</>};
}

export function ZzzGrowthPage({characters,onOpenCharacter}:{characters:ZzzAgent[],onOpenCharacter:OpenCharacter}){
 const focuses=zzzGrowthFocus(characters),focusIds=new Set(focuses.map(focus=>focus.id));
 const discFocusIds=new Set(focuses.filter(focus=>focus.kind==='upgrade'&&['yanagi','miyabi'].includes(focus.characterId)).map(focus=>focus.characterId));
 const records=characters.map(character=>({character,actions:characterActions(character)}));
 const regularTargets=records.flatMap(record=>record.actions.filter(action=>!focusIds.has(record.character.id+'/'+action.id)&&!(action.id==='disc-effectiveness'&&discFocusIds.has(record.character.id))).map(action=>({target:actionTarget(record.character,action),priority:action.priority??1}))).sort((left,right)=>left.priority-right.priority).map(({target})=>target);
 const targets=[...focuses.map(focus=>focusTarget(focus,characters.find(character=>character.id===focus.characterId)!)),...regularTargets];
 const majorTargetsReached=characters.length>0&&records.every(({character,actions})=>{
  const plan=plans[character.id];
  return !!plan&&plan.skills.length>0&&actions.some(action=>action.skill==='核心技'&&action.kind==='complete')&&plan.skills.filter(rule=>rule.priority<=2).every(rule=>actions.some(action=>action.skill===rule.skill&&action.kind==='complete'));
 });
 const emptyMessage=!characters.length?'目前沒有角色紀錄。':majorTargetsReached?'目前主要技能目標已到位，可繼續檢視裝備詞條與操作循環。':'目前沒有可直接確認的提升項目。先核對技能目標與觀測，再安排裝備和操作循環。';
 const supplement=characters.length?<><p>技能數字保留影片中的顯示等級；已達本次目標不等同所有技能都已升滿。有效詞條數量不作跨角色強度排名。</p>{characters.map(character=><section key={character.id}><h3>{character.name}</h3><SkillSummary character={character}/>{!!plans[character.id]?.maintain.length&&<><p className="zzz-guidance__note-label">維持與後續檢視</p><ul>{plans[character.id].maintain.map((item,index)=><li key={index}>{trainingCopy(item)}</li>)}</ul></>}</section>)}</>:undefined;
 return <GrowthPage targets={targets} onOpenCharacter={onOpenCharacter} emptyMessage={emptyMessage} supplementary={supplement}/>;
}
