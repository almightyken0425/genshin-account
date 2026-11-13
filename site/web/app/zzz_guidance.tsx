'use client';

import {useState} from 'react';
import {BookOpen,ExternalLink} from 'lucide-react';
import TeamOverviewPage from '@/components/pages/team_overview_page';
import TeamDetailPage from '@/components/pages/team_detail_page';
import GrowthPage from '@/components/pages/growth_page';
import type {GrowthTargetViewModel} from '@/components/growth/growth_target_card';
import type {TeamMember} from '@/components/teams/team_members';
import RotationAction from '@/components/teams/rotation_action';
import {zzzRosterImage} from '@/lib/zzz_assets';
import {growthAdvice,type GrowthAction,type TrainingPlan,type ZzzTeamGuide} from '@/lib/zzz_recommendations.mjs';
import trainingPlans from '@/lib/zzz_training_plans.json';
import type {ZzzAgent} from '@/lib/zzz_types';
import './zzz_guidance.css';

type TeamCharacters={characters:ZzzAgent[],teams:ZzzTeamGuide[]};
type OpenCharacter=(id:string)=>void;
const plans=trainingPlans.characters as Readonly<Record<string,TrainingPlan>>;
const skillNames=['普通攻擊','閃避','支援技','特殊技','連攜技','核心技'] as const;
const observedValue=(value:string|number|null|undefined)=>value===null||value===undefined||value===''?'—':String(value);
const findCharacter=(characters:readonly ZzzAgent[],id:string)=>characters.find(character=>character.id===id);
const characterName=(characters:readonly ZzzAgent[],id:string)=>findCharacter(characters,id)?.name||'角色待確認';
function teamMembers(characters:readonly ZzzAgent[],team:ZzzTeamGuide):TeamMember[]{
 const members:TeamMember[]=team.members.map(member=>({kind:'character',id:member.id,name:characterName(characters,member.id),src:findCharacter(characters,member.id)?zzzRosterImage(member.id)?.src:undefined,available:!!findCharacter(characters,member.id)}));
 return [...members,{kind:'companion',id:team.companion?.id||'companion-unconfirmed',name:team.companion?.name||'邦布待確認',src:team.companion?.src,status:team.companion?.status||'unconfirmed'}];
}
function EmptyGuidance({title,detail}:{title:string,detail:string}){
 return <div className="zzz-guidance__empty"><BookOpen size={28} aria-hidden="true"/><h2>{title}</h2><p>{detail}</p></div>;
}
function SkillSummary({character}:{character:ZzzAgent|undefined}){
 return <dl className="zzz-guidance__skills" aria-label={(character?.name||'角色')+'的技能顯示等級'}>{skillNames.map(skill=><div key={skill}><dt>{skill}</dt><dd>{observedValue(character?.skills?.[skill])}</dd></div>)}</dl>;
}
function TeamSupplement({characters,team}:{characters:ZzzAgent[],team:ZzzTeamGuide}){
 return <>
  <section><h3>搭配理由</h3><p>{team.summary}</p><p>{team.reason}</p></section>
  {team.accountAssessment&&<section><h3>{team.accountAssessment.verdict}</h3><p>{team.accountAssessment.reason}</p>{!!team.accountAssessment.alternatives?.length&&<ul>{team.accountAssessment.alternatives.map((item,index)=><li key={index}>{item}</li>)}</ul>}</section>}
  <section><h3>額外能力條件</h3>{team.activation.length?<ul>{team.activation.map((condition,index)=><li key={index}>{condition}</li>)}</ul>:<p>額外能力條件尚待核對。</p>}</section>
  <section><h3>角色職責與培養方向</h3>{team.members.map(member=><div className="zzz-guidance__member-note" key={member.id}><h4>{characterName(characters,member.id)} · {member.role}</h4><SkillSummary character={findCharacter(characters,member.id)}/><ul>{member.focus.map((focus,index)=><li key={index}>{focus}</li>)}</ul>{!!plans[member.id]?.maintain.length&&<><p className="zzz-guidance__note-label">維持與後續檢視</p><ul>{plans[member.id].maintain.map((item,index)=><li key={index}>{item}</li>)}</ul></>}</div>)}</section>
  {team.companion&&<section><h3>推薦邦布</h3><p>{team.companion.name} · {team.companion.status==='recommended'?'持有狀態未確認':'尚待確認'}</p></section>}
  <section><h3>官方來源</h3><ul className="zzz-guidance__sources">{team.sources.map((source,index)=><li key={index}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={13} aria-hidden="true"/></a></li>)}</ul></section>
 </>;
}

export function ZzzTeamsOverview({characters,teams,onOpenTeam}:TeamCharacters&{onOpenTeam:(id:string)=>void}){
 const empty=!characters.length?<EmptyGuidance title="目前沒有角色紀錄" detail="讀取已記錄的角色後，這裡會顯示可用的隊伍建議。"/>:<EmptyGuidance title="目前沒有可用隊伍" detail="完整搭配需要有對應的角色紀錄，確認資料後再整理。"/>;
 return <TeamOverviewPage teams={characters.length?teams.map(team=>({id:team.id,name:team.name,members:teamMembers(characters,team)})):[]} onOpenTeam={onOpenTeam} empty={empty}/>;
}

export function ZzzTeamDetail({characters,team,onBack,onOpenCharacter}:{characters:ZzzAgent[],team:ZzzTeamGuide,onBack:()=>void,onOpenCharacter:OpenCharacter}){
 return <TeamDetailPage title={team.name} members={teamMembers(characters,team)} onBack={onBack} onOpenCharacter={onOpenCharacter} supplementary={<TeamSupplement characters={characters} team={team}/>}>
  {team.steps.length?<div className="skirk-minimal-flow zzz-rotation-actions" aria-label="隊伍操作流程圖">{team.steps.map((step,index)=><RotationAction key={index} name={characterName(characters,step.characterId)} src={zzzRosterImage(step.characterId)?.src} moves={[step.action]}/>)}</div>:<p>操作順序尚待核對。</p>}
 </TeamDetailPage>;
}

const priorityLabels={0:'優先',1:'優先',2:'下一步',3:'資源充裕再補'} as const;
function actionTarget(character:ZzzAgent,action:GrowthAction):GrowthTargetViewModel{
 return {id:character.id+'/'+action.id,character:{id:character.id,name:character.name,src:zzzRosterImage(character.id)?.src},title:action.skill||action.title,kind:action.kind,current:action.current,target:action.target,priority:action.kind==='upgrade'&&action.priority!==undefined?priorityLabels[action.priority]:undefined,detail:action.detail};
}

export function ZzzGrowthPage({characters,teams,onOpenCharacter,initialTeamId,onSelectTeam}:TeamCharacters&{onOpenCharacter:OpenCharacter,initialTeamId?:string,onSelectTeam?:(id:string)=>void}){
 const [selectedId,setSelectedId]=useState(()=>initialTeamId??'');
 const requestedId=onSelectTeam?initialTeamId??'':selectedId;
 const team=teams.find(team=>team.id===requestedId),activeId=team?.id||'';
 const scopedTeams=team?[team]:teams;
 const priorityIds=[...new Set(scopedTeams.flatMap(team=>team.members.map(member=>member.id)))];
 const selectedCharacters=priorityIds.map(id=>findCharacter(characters,id)).filter((character):character is ZzzAgent=>!!character);
 const records=growthAdvice(selectedCharacters,priorityIds,plans);
 const targets=records.flatMap(record=>{const character=findCharacter(selectedCharacters,record.characterId)!;return record.actions.map(action=>({target:actionTarget(character,action),priority:action.priority??1}))}).sort((left,right)=>left.priority-right.priority).map(({target})=>target);
 const majorTargetsReached=selectedCharacters.length===priorityIds.length&&selectedCharacters.length>0&&selectedCharacters.every(character=>{
  const plan=plans[character.id],record=records.find(record=>record.characterId===character.id);
  return !!plan&&plan.skills.length>0&&record?.actions.some(action=>action.skill==='核心技'&&action.kind==='complete')&&plan.skills.filter(rule=>rule.priority<=2).every(rule=>record.actions.some(action=>action.skill===rule.skill&&action.kind==='complete'));
 });
 const emptyMessage=!priorityIds.length?'這個隊伍範圍目前沒有培養目標。':majorTargetsReached?'目前主要技能目標已到位，可繼續檢視裝備詞條與操作循環。':'目前沒有可直接確認的提升項目。先核對技能目標與觀測，再安排裝備和操作循環。';
 const supplement=selectedCharacters.length?<><p>技能數字保留影片中的顯示等級；已達本次目標不等同所有技能都已升滿。有效詞條數量不作跨角色強度排名。</p>{team?.accountAssessment&&<section><h3>{team.accountAssessment.verdict}</h3><p>{team.accountAssessment.reason}</p>{team.accountAssessment.alternatives?.map((item,index)=><p key={index}>{item}</p>)}</section>}{selectedCharacters.map(character=><section key={character.id}><h3>{character.name}</h3><SkillSummary character={character}/>{!!plans[character.id]?.maintain.length&&<><p className="zzz-guidance__note-label">維持與後續檢視</p><ul>{plans[character.id].maintain.map((item,index)=><li key={index}>{item}</li>)}</ul></>}</section>)}</>:undefined;
 return <GrowthPage teams={teams} teamId={activeId} onSelectTeam={id=>{setSelectedId(id);onSelectTeam?.(id)}} targets={targets} onOpenCharacter={onOpenCharacter} emptyMessage={emptyMessage} supplementary={supplement}/>;
}
