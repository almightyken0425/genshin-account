'use client';

import {Bot} from 'lucide-react';
import MediaImage from '@/components/media/media_image';
import '@/components/pages/shared_pages.css';

export type TeamMember={id:string,name:string,src?:string,kind?:'character'|'companion',status?:'recommended'|'unconfirmed',available?:boolean};

export function TeamMemberImage({member}:{member:TeamMember}){
 if(member.kind==='companion'&&!member.src)return <span className="team-companion-placeholder" role="img" aria-label={member.name}><Bot size={32} aria-hidden="true"/></span>;
 return <MediaImage src={member.src} alt=""/>;
}

export default function TeamMembers({members,onOpenCharacter}:{members:TeamMember[],onOpenCharacter:(id:string)=>void}){
 return <div className="team-detail-members shared-team-slots">{members.map(member=>member.kind==='companion'||member.available===false?<div className="team-static-slot" key={member.id} role="img" aria-label={member.kind==='companion'?member.name+'，'+(member.status==='recommended'?'推薦邦布，持有狀態未確認':'邦布尚待確認'):member.name+'，角色紀錄尚未讀取'}><TeamMemberImage member={member}/></div>:<button type="button" key={member.id} data-focus-key={'team-member:'+member.id} onClick={()=>onOpenCharacter(member.id)} aria-label={'查看'+member.name+'角色詳情'}><TeamMemberImage member={member}/></button>)}</div>;
}
