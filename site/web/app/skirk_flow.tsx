import {ArrowDown} from 'lucide-react';
import {characterImage} from '@/lib/game_assets';
import GameImage from './game_image';
const steps=[
 {id:'escoffier',name:'愛可菲',keys:'E → A'},
 {id:'furina',name:'芙寧娜',keys:'E → Q'},
 {id:'voyanitsa',name:'沃雅妮莎',keys:'E'},
 {id:'skirk',name:'絲柯克',keys:'短 E → A2 → Q'},
];
export default function SkirkFlow(){return <div className="skirk-minimal-flow" aria-label="絲柯克隊操作流程圖">{steps.map((step,i)=><div key={step.id}>
 {i>0&&<div className="minimal-flow-arrow" aria-hidden="true"><ArrowDown size={19}/></div>}
 <div className="minimal-flow-card"><GameImage src={characterImage(step.id,'icon')} alt={step.name}/><div className="minimal-flow-moves"><strong>{step.keys}</strong>{step.id==='skirk'&&<div className="minimal-flow-combos" aria-label="四段連續普攻"><span>A5 → 衝刺</span><span aria-hidden="true">→</span><span>A5 → 重擊</span><span aria-hidden="true">→</span><span>A5 → 衝刺</span><span aria-hidden="true">→</span><span>A5</span></div>}</div></div>
 </div>)}</div>}
