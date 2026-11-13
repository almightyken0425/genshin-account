'use client';

import type {CSSProperties,ReactNode} from 'react';
import MediaImage from '@/components/media/media_image';

export type TeamMember={id:string,name:string,src?:string};
export default function TeamCard({members,label,onClick,children}:{members:TeamMember[],label:string,onClick:()=>void,children?:ReactNode}){
 return <button type="button" className="team-card team-image-card" aria-label={label} onClick={onClick}>
  <div className="team-members" style={{'--team-count':members.length} as CSSProperties}>{members.map(member=><MediaImage key={member.id} src={member.src} alt=""/>)}</div>
  {children}
 </button>;
}
