'use client';

import type {ReactNode} from 'react';
import GrowthTargetCard,{type GrowthTargetViewModel} from '@/components/growth/growth_target_card';
import TeamScopeControl,{type TeamScopeOption} from './team_scope_control';
import './shared_pages.css';

export default function GrowthPage({teams,teamId='',onSelectTeam,targets,onOpenCharacter,emptyMessage='這個隊伍範圍目前沒有培養目標。',supplementary}:{teams?:readonly TeamScopeOption[],teamId?:string,onSelectTeam?:(id:string)=>void,targets:GrowthTargetViewModel[],onOpenCharacter?:(id:string)=>void,emptyMessage?:string,supplementary?:ReactNode}){
 const upgrades=targets.filter(target=>target.kind==='upgrade');
 return <section className="teams-page shared-growth-page" aria-label="培養重點">
  {teams&&onSelectTeam&&<TeamScopeControl teams={teams} value={teamId} onChange={onSelectTeam}/>}
  <section className="growth-target-list" aria-label="可提升項目">{upgrades.length?upgrades.map(target=><GrowthTargetCard key={target.id} target={target} onOpenCharacter={onOpenCharacter}/>):<p className="shared-page-empty" role="status">{emptyMessage}</p>}</section>
  {(['verify','complete'] as const).map(kind=>{const group=targets.filter(target=>target.kind===kind);return group.length?<details className={'shared-disclosure growth-disclosure growth-disclosure--'+kind} key={kind}><summary>{kind==='verify'?'待核對紀錄':'已達本次目標'}<span>{group.length} 項</span></summary><div className="shared-disclosure-body growth-target-list">{group.map(target=><GrowthTargetCard key={target.id} target={target} onOpenCharacter={onOpenCharacter}/>)}</div></details>:null})}
  {supplementary&&<details className="shared-disclosure growth-supplementary"><summary>補充資訊</summary><div className="shared-disclosure-body">{supplementary}</div></details>}
 </section>;
}
