'use client';

import type {ReactNode} from 'react';
import CenteredHeader from '@/components/navigation/centered_header';
import TeamMembers,{type TeamMember} from '@/components/teams/team_members';
import './shared_pages.css';

export default function TeamDetailPage({title,members,onBack,onOpenCharacter,children,supplementary}:{title:string,members:TeamMember[],onBack:()=>void,onOpenCharacter:(id:string)=>void,children:ReactNode,supplementary?:ReactNode}){
 return <section className="teams-page shared-team-detail" aria-label={title+'操作手法'}>
  <CenteredHeader title={title} onBack={onBack} backLabel="返回隊伍列表"/>
  <TeamMembers members={members} onOpenCharacter={onOpenCharacter}/>
  <section className="team-guide" aria-label="隊伍循環">{children}</section>
  {supplementary&&<details className="shared-disclosure team-supplementary"><summary>補充資訊</summary><div className="shared-disclosure-body">{supplementary}</div></details>}
 </section>;
}
