'use client';

import {TeamMemberImage,type TeamMember} from './team_members';
import '@/components/pages/shared_pages.css';

export type {TeamMember} from './team_members';
export default function TeamCard({members,label,onClick,focusKey}:{members:TeamMember[],label:string,onClick:()=>void,focusKey?:string}){
 return <button type="button" className="team-card team-image-card" aria-label={label} data-focus-key={focusKey} onClick={onClick}>
  <div className="team-members shared-team-slots">{members.map(member=><TeamMemberImage key={member.id} member={member}/>)}</div>
 </button>;
}
