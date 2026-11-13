'use client';

import type {ReactNode} from 'react';
import TeamCard,{type TeamMember} from '@/components/teams/team_card';
import './shared_pages.css';

export type TeamOverview={id:string,name:string,members:TeamMember[]};
export default function TeamOverviewPage({teams,onOpenTeam,empty}:{teams:TeamOverview[],onOpenTeam:(id:string)=>void,empty?:ReactNode}){
 return <section className="teams-page shared-team-overview" aria-label="隊伍">{teams.length?<div className="teams-grid">{teams.map(team=><TeamCard key={team.id} focusKey={'team:'+team.id} members={team.members} label={'查看'+team.name+'操作手法：'+team.members.map(member=>member.name).join('、')} onClick={()=>onOpenTeam(team.id)}/>)}</div>:empty}</section>;
}
