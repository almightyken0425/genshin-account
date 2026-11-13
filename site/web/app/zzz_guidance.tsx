'use client';

import {useState} from 'react';
import {ArrowRight,ArrowUpRight,BookOpen,Check,ChevronDown,ClipboardCheck,ExternalLink,Sparkles} from 'lucide-react';
import CenteredHeader from '@/components/navigation/centered_header';
import MediaImage from '@/components/media/media_image';
import TeamCard from '@/components/teams/team_card';
import TeamMembers from '@/components/teams/team_members';
import {zzzRosterImage} from '@/lib/zzz_assets';
import {growthAdvice,type GrowthAction,type GrowthAdvice,type TrainingPlan,type ZzzTeamGuide} from '@/lib/zzz_recommendations.mjs';
import trainingPlans from '@/lib/zzz_training_plans.json';
import type {ZzzAgent} from '@/lib/zzz_types';
import './zzz_guidance.css';

type AccountAssessment=NonNullable<ZzzTeamGuide['accountAssessment']>;
type TeamGuide=ZzzTeamGuide;
type TeamCharacters={characters:ZzzAgent[],teams:TeamGuide[]};
type OpenCharacter=(id:string)=>void;
const plans=trainingPlans.characters as Readonly<Record<string,TrainingPlan>>;
const skillNames=['普通攻擊','閃避','支援技','特殊技','連攜技','核心技'] as const;
const observedValue=(value:string|number|null|undefined)=>value===null||value===undefined||value===''?'—':String(value);
const findCharacter=(characters:readonly ZzzAgent[],id:string)=>characters.find(character=>character.id===id);
const characterName=(characters:readonly ZzzAgent[],id:string)=>findCharacter(characters,id)?.name||'角色待確認';
function teamMembers(characters:readonly ZzzAgent[],team:ZzzTeamGuide){
 return team.members.map(member=>{
  const character=findCharacter(characters,member.id);
  return {id:member.id,name:character?.name||'角色待確認',src:character?zzzRosterImage(member.id)?.src:undefined};
 });
}
function EmptyGuidance({title,detail}:{title:string,detail:string}){
 return <div className="zzz-guidance__empty"><BookOpen size={28} aria-hidden="true"/><h2>{title}</h2><p>{detail}</p></div>;
}
function SkillSummary({character}:{character:ZzzAgent|undefined}){
 return <div className="zzz-guidance__skill-summary"><p>目前顯示技能</p><dl aria-label={(character?.name||'角色')+'的技能顯示等級'}>{skillNames.map(skill=><div key={skill}><dt>{skill}</dt><dd>{observedValue(character?.skills?.[skill])}</dd></div>)}</dl></div>;
}
function AccountAssessmentPanel({assessment,headingLevel=3}:{assessment:AccountAssessment|undefined,headingLevel?:2|3}){
 if(!assessment)return null;
 const Heading=headingLevel===2?'h2':'h3';
 return <section className="zzz-guidance__panel zzz-guidance__assessment" aria-label="依帳號現況的建議">
  <Heading>依帳號現況的建議</Heading><p className="zzz-guidance__assessment-verdict">{assessment.verdict}</p><p>{assessment.reason}</p>
  {!!assessment.alternatives?.length&&<div className="zzz-guidance__alternatives"><p>可替換搭配</p><ul>{assessment.alternatives.map((alternative,index)=><li key={index}>{alternative}</li>)}</ul></div>}
 </section>;
}
function MemberFocus({characters,team,onOpenCharacter,title,headingLevel=3}:{characters:ZzzAgent[],team:ZzzTeamGuide,onOpenCharacter:OpenCharacter,title:string,headingLevel?:2|3}){
 const Heading=headingLevel===2?'h2':'h3';
 const MemberHeading=headingLevel===2?'h3':'h4';
 return <section className="zzz-guidance__panel" aria-label={title}>
  <Heading>{title}</Heading>
  <div className="zzz-guidance__roles">{team.members.map(member=>{
   const character=findCharacter(characters,member.id),plan=plans[member.id];
   return <article className="zzz-guidance__role" key={member.id}>
    <MemberHeading>{character?<button type="button" onClick={()=>onOpenCharacter(member.id)} aria-label={'查看'+character.name+'角色詳情'}>{character.name}<ArrowUpRight size={15} aria-hidden="true"/></button>:<span>角色待確認</span>}</MemberHeading>
    <p className="zzz-guidance__role-label">{member.role||'職責尚待核對'}</p>
    <SkillSummary character={character}/>
    {member.focus.length>0&&<ul>{member.focus.map((focus,index)=><li key={index}>{focus}</li>)}</ul>}
    {!!plan?.maintain.length&&<div className="zzz-guidance__maintain"><p>維持與後續檢視</p><ul>{plan.maintain.map((item,index)=><li key={index}>{item}</li>)}</ul></div>}
   </article>;
  })}</div>
 </section>;
}

export function ZzzTeamsOverview({characters,teams,onOpenTeam}:TeamCharacters&{onOpenTeam:(id:string)=>void}){
 return <section className="teams-page zzz-guidance" aria-label="絕區零隊伍建議">
  <p className="zzz-guidance__intro">依已記錄角色整理優先搭配，隊友可重複。</p>
  {!characters.length?<EmptyGuidance title="目前沒有角色紀錄" detail="讀取已記錄的角色後，這裡會顯示可用的隊伍建議。"/>:!teams.length?<EmptyGuidance title="目前沒有可用隊伍" detail="完整搭配需要有對應的角色紀錄，確認資料後再整理。"/>:<div className="teams-grid">
   {teams.map(team=><TeamCard key={team.id} members={teamMembers(characters,team)} label={'查看'+team.name+'隊伍建議：'+team.members.map(member=>characterName(characters,member.id)).join('、')} onClick={()=>onOpenTeam(team.id)}>
    <span className="zzz-guidance__card-copy"><strong>{team.name}</strong><span>{team.summary}</span></span>
   </TeamCard>)}
  </div>}
 </section>;
}

export function ZzzTeamDetail({characters,team,onBack,onOpenCharacter}:{characters:ZzzAgent[],team:TeamGuide,onBack:()=>void,onOpenCharacter:OpenCharacter}){
 const members=teamMembers(characters,team),knownMembers=members.filter(member=>!!findCharacter(characters,member.id));
 const missing=members.length-knownMembers.length;
 return <section className="teams-page zzz-guidance zzz-guidance--detail" aria-label={team.name+'隊伍建議'}>
  <CenteredHeader title={team.name} onBack={onBack} backLabel="返回隊伍列表"/>
  <p className="zzz-guidance__lead">{team.summary}</p>
  {knownMembers.length>0&&<TeamMembers members={knownMembers} onOpenCharacter={onOpenCharacter}/>}
  {missing>0&&<p className="zzz-guidance__missing" role="status">有 {missing} 名隊員的角色紀錄尚未讀取，相關數值保持未知。</p>}
  <div className="zzz-guidance__detail-body">
   <section className="zzz-guidance__panel" aria-label="搭配理由"><h3>搭配理由</h3><p>{team.reason||'搭配理由尚待核對。'}</p></section>
   <AccountAssessmentPanel assessment={team.accountAssessment}/>
   <MemberFocus characters={characters} team={team} onOpenCharacter={onOpenCharacter} title="角色職責與培養方向"/>
   <section className="zzz-guidance__panel" aria-label="額外能力條件">
    <h3>額外能力條件</h3>
    {team.activation.length?<ul className="zzz-guidance__conditions">{team.activation.map((condition,index)=><li key={index}>{condition}</li>)}</ul>:<p>這隊的額外能力條件尚待核對。</p>}
   </section>
   <section className="zzz-guidance__panel" aria-label="簡短操作">
    <h3>簡短操作</h3>
    {team.steps.length?<ol className="zzz-guidance__steps">{team.steps.map((step,index)=><li key={index}>
     <div className="zzz-guidance__step-content"><span className="zzz-guidance__step-character">{characterName(characters,step.characterId)}</span><p>{step.action}</p></div>
    </li>)}</ol>:<p>操作順序尚待核對。</p>}
   </section>
   <section className="zzz-guidance__sources" aria-label="官方來源">
    <h3>官方來源</h3>
    {team.sources.length?<ul>{team.sources.map((source,index)=><li key={index}><a href={source.url} target="_blank" rel="noreferrer"><span>{source.label}</span><ExternalLink size={14} aria-hidden="true"/></a></li>)}</ul>:<p>來源尚待補齊。</p>}
    <p>依已記錄角色提供優先搭配，隊友可重複。角色機制依官方來源核對。</p>
   </section>
  </div>
 </section>;
}

type GrowthRecord=GrowthAdvice&{character:ZzzAgent,role:string,actions:GrowthAction[]};
const growthGroups={
 upgrade:{title:'可提升項目',description:'依培養優先序排列，同一優先序保留隊伍順序。',Icon:Sparkles},
 verify:{title:'待核對紀錄',description:'先確認缺少的觀測，再決定如何培養。未知紀錄不代表尚未培養。',Icon:ClipboardCheck},
 complete:{title:'已達本次目標',description:'這些項目已達本次隊伍目標，仍可依裝備與操作循環繼續調整。',Icon:Check},
};
const priorityLabels={0:'優先',1:'優先',2:'下一步',3:'資源充裕再補'} as const;
function TrainingAction({action}:{action:GrowthAction}){
 const hasTarget=!!action.skill&&action.target!==undefined;
 return <li>
  <div className="zzz-guidance__action-heading"><h3>{hasTarget?action.skill:action.title}</h3>{action.kind==='upgrade'&&action.priority!==undefined&&<span className={'zzz-guidance__priority zzz-guidance__priority--'+action.priority}>{priorityLabels[action.priority]}</span>}</div>
  {hasTarget&&(action.kind==='upgrade'?<div className="zzz-guidance__skill-progress" aria-label={'目前顯示'+observedValue(action.current)+'，本隊目標'+observedValue(action.target)}><span>{observedValue(action.current)}</span><ArrowRight size={16} aria-hidden="true"/><strong>{observedValue(action.target)}</strong><small>顯示等級</small></div>:<div className="zzz-guidance__skill-comparison"><span>目前 {action.current===null||action.current===undefined?'待核對':observedValue(action.current)}</span><span>目標 {observedValue(action.target)}</span></div>)}
  <p>{action.detail}</p>
 </li>;
}
function GrowthGroup({kind,records,onOpenCharacter,majorTargetsReached=false}:{kind:GrowthAction['kind'],records:GrowthRecord[],onOpenCharacter:OpenCharacter,majorTargetsReached?:boolean}){
 const grouped=records.map(record=>({...record,actions:record.actions.filter(action=>action.kind===kind)})).filter(record=>record.actions.length>0);
 if(kind==='upgrade')grouped.sort((left,right)=>Math.min(...left.actions.map(action=>action.priority??1))-Math.min(...right.actions.map(action=>action.priority??1)));
 const count=grouped.reduce((total,record)=>total+record.actions.length,0),{title,description,Icon}=growthGroups[kind];
 const emptyMessage=kind==='upgrade'?(majorTargetsReached?'本隊主要技能目標已到位，可繼續檢視裝備詞條與操作循環。':'目前沒有可直接確認的提升項目。先核對技能目標與觀測，再安排裝備和操作循環。'):kind==='verify'?'目前這隊沒有新增的待核對項目。':'目前尚無已確認達成本次目標的項目。';
 const content=<><p className="zzz-guidance__group-description">{description}</p>
  {grouped.length?<div className="zzz-guidance__growth-list">{grouped.map(record=><article className="zzz-guidance__growth-card" key={record.characterId}>
   <button type="button" className="zzz-guidance__person" onClick={()=>onOpenCharacter(record.characterId)} aria-label={'查看'+record.character.name+'角色詳情'}>
    <span className="zzz-guidance__person-art"><MediaImage src={zzzRosterImage(record.characterId)?.src} alt=""/></span><span className="zzz-guidance__person-copy"><strong>{record.character.name}</strong><span>{record.role}</span></span><ArrowUpRight size={18} aria-hidden="true"/>
   </button>
   <ul className="zzz-guidance__actions">{record.actions.map(action=><TrainingAction key={action.id} action={action}/>)}</ul>
  </article>)}</div>:<p className="zzz-guidance__group-empty"><Check size={17} aria-hidden="true"/>{emptyMessage}</p>}
 </>;
 if(kind==='complete')return <details className="zzz-guidance__growth-group zzz-guidance__growth-group--complete">
  <summary className="zzz-guidance__complete-summary"><span><Icon size={20} aria-hidden="true"/><span>{title}</span></span><span className="zzz-guidance__complete-count">{count} 項</span><ChevronDown size={18} aria-hidden="true"/></summary><div className="zzz-guidance__complete-body">{content}</div>
 </details>;
 return <section className={'zzz-guidance__growth-group zzz-guidance__growth-group--'+kind} aria-label={title}>
  <header className="zzz-guidance__group-heading"><div><Icon size={20} aria-hidden="true"/><h2>{title}</h2></div><span>{count} 項</span></header>
  {content}
 </section>;
}

export function ZzzGrowthPage({characters,teams,onOpenCharacter,initialTeamId,onSelectTeam}:TeamCharacters&{onOpenCharacter:OpenCharacter,initialTeamId?:string,onSelectTeam?:(id:string)=>void}){
 const [selectedId,setSelectedId]=useState(()=>initialTeamId??teams[0]?.id??'');
 const activeId=onSelectTeam?initialTeamId:selectedId;
 const team=teams.find(team=>team.id===activeId)??teams[0];
 if(!teams.length)return <section className="teams-page zzz-guidance" aria-label="絕區零培養重點"><EmptyGuidance title="先確認可用隊伍" detail="有對應的隊伍與角色紀錄後，就能整理這隊的培養項目。"/></section>;
 const priorityIds=team.members.map(member=>member.id);
 const selectedCharacters=priorityIds.map(id=>findCharacter(characters,id)).filter((character):character is ZzzAgent=>!!character);
 const records:GrowthRecord[]=growthAdvice(selectedCharacters,priorityIds,plans).map(advice=>({
  ...advice,character:findCharacter(selectedCharacters,advice.characterId)!,role:team.members.find(member=>member.id===advice.characterId)?.role||'隊伍成員',
 }));
 const majorTargetsReached=selectedCharacters.length===team.members.length&&selectedCharacters.every(character=>{
  const plan=plans[character.id],record=records.find(record=>record.characterId===character.id);
  return !!plan&&plan.skills.length>0&&record?.actions.some(action=>action.skill==='核心技'&&action.kind==='complete')&&plan.skills.filter(rule=>rule.priority<=2).every(rule=>record.actions.some(action=>action.skill===rule.skill&&action.kind==='complete'));
 });
 return <section className="teams-page zzz-guidance zzz-guidance--growth" aria-label="絕區零培養重點">
  <div className="zzz-guidance__growth-heading"><div><h1>培養重點</h1><p>依目前技能與隊伍職責安排資源，先補優先項目。</p></div><label className="zzz-guidance__team-select"><span>目前隊伍</span><select value={team.id} onChange={event=>{setSelectedId(event.target.value);onSelectTeam?.(event.target.value)}}>{teams.map(team=><option key={team.id} value={team.id}>{team.name}</option>)}</select></label></div>
  <p className="zzz-guidance__lead">{team.summary}</p>
  {selectedCharacters.length>0&&<TeamMembers members={teamMembers(characters,team).filter(member=>!!findCharacter(selectedCharacters,member.id))} onOpenCharacter={onOpenCharacter}/>}
  {selectedCharacters.length<team.members.length&&<p className="zzz-guidance__missing" role="status">部分隊員的紀錄尚未讀取，目前只整理已知角色。</p>}
  <div className="zzz-guidance__growth-groups">
   <AccountAssessmentPanel assessment={team.accountAssessment} headingLevel={2}/>
   <MemberFocus characters={characters} team={team} onOpenCharacter={onOpenCharacter} title="本隊培養方向" headingLevel={2}/>
   {selectedCharacters.length?<><GrowthGroup kind="upgrade" records={records} onOpenCharacter={onOpenCharacter} majorTargetsReached={majorTargetsReached}/><GrowthGroup kind="verify" records={records} onOpenCharacter={onOpenCharacter}/><GrowthGroup key={team.id} kind="complete" records={records} onOpenCharacter={onOpenCharacter}/><div className="zzz-guidance__context"><p>技能數字是影片中的顯示等級，包含畫面已有的加成。已達本次目標不等同所有技能都已升滿。</p><p>有效詞條數量不作跨角色強度排名，未確認的核心與音擎紀錄不視為未培養。</p></div></>:<EmptyGuidance title="這隊尚無可用的角色紀錄" detail="確認隊員資料後，再整理可提升與待核對項目。"/>}
  </div>
 </section>;
}
