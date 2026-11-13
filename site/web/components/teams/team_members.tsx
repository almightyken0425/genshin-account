'use client';

import type {CSSProperties} from 'react';
import MediaImage from '@/components/media/media_image';
import type {TeamMember} from './team_card';

export default function TeamMembers({members,onOpenCharacter}:{members:TeamMember[],onOpenCharacter:(id:string)=>void}){
 return <div className="team-detail-members" style={{'--team-count':members.length} as CSSProperties}>{members.map(member=><button type="button" key={member.id} onClick={()=>onOpenCharacter(member.id)} aria-label={'查看'+member.name+'角色詳情'}><MediaImage src={member.src} alt=""/></button>)}</div>;
}
