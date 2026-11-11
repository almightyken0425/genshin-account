import {ArrowLeft} from 'lucide-react';
export default function CenteredHeader({title,onBack,backLabel}:{title:string,onBack:()=>void,backLabel:string}){
 return <header className="detail-header centered-page-header"><div className="character-heading"><button className="icon-button detail-back" onClick={onBack} aria-label={backLabel}><ArrowLeft size={20}/></button><h2>{title}</h2></div></header>
}
