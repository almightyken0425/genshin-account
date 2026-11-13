'use client';

import {ArrowRight} from 'lucide-react';
import type {ReactNode} from 'react';
import MediaImage from '@/components/media/media_image';
import '@/components/pages/shared_pages.css';

export type GrowthTargetViewModel={
 id:string;
 character:{id:string,name:string,src?:string};
 title:string;
 kind:'upgrade'|'verify'|'complete';
 current?:string|number|null;
 target?:string|number;
 priority?:string;
 main?:string;
 tags?:readonly string[];
 artifact?:{src?:string,name:string};
 location?:string;
 context?:string;
 detail?:ReactNode;
};
const value=(input:string|number|null|undefined)=>input===null||input===undefined?'待核對':String(input);
export default function GrowthTargetCard({target,onOpenCharacter}:{target:GrowthTargetViewModel,onOpenCharacter?:(id:string)=>void}){
 const image=<MediaImage src={target.character.src} alt={onOpenCharacter?'':target.character.name}/>;
 return <article className={'growth-target growth-target-card growth-target-card--'+target.kind} aria-label={target.character.name+' · '+target.title}>
  <div className="growth-art">{onOpenCharacter?<button type="button" data-focus-key={'growth:'+target.id} onClick={()=>onOpenCharacter(target.character.id)} aria-label={'查看'+target.character.name+'角色詳情'}>{image}</button>:image}{target.artifact&&<span className="growth-artifact"><MediaImage src={target.artifact.src} alt={target.artifact.name}/></span>}</div>
  <div className="growth-content"><div className="growth-target-heading"><h2 className="growth-character-name">{target.character.name}</h2>{target.priority&&<span className="growth-priority">{target.priority}</span>}</div><h3 className="growth-title">{target.title}</h3>
   {target.main&&<div className="growth-main">{target.main}</div>}
   {target.target!==undefined&&<div className="growth-progress" aria-label={'目前顯示'+value(target.current)+'，本隊目標'+value(target.target)}><span>{value(target.current)}</span><ArrowRight size={18} aria-hidden="true"/><strong>{value(target.target)}</strong></div>}
   {!!target.tags?.length&&<div className="growth-substats">{target.tags.map(tag=><span key={tag}>{tag}</span>)}</div>}
   {target.location&&<p className="growth-location">{target.location}</p>}{target.context&&<p className="growth-context">{target.context}</p>}
   {target.detail&&<details className="growth-reason"><summary>培養說明</summary><div>{target.detail}</div></details>}
  </div>
 </article>;
}
