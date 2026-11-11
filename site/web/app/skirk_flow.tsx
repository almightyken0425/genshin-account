import {ArrowDown} from 'lucide-react';
import RotationCard from './rotation_card';
const steps=[
 {id:'escoffier',name:'愛可菲',keys:'E'},
 {id:'furina',name:'芙寧娜',keys:'E → Q'},
 {id:'voyanitsa',name:'沃雅妮莎',keys:'E'},
 {id:'skirk',name:'絲柯克',keys:'短 E → A2 → Q'},
];
export default function SkirkFlow(){return <div className="skirk-minimal-flow skirk-uniform-type" aria-label="絲柯克隊操作流程圖">{steps.map((step,i)=><div key={step.id}>
 {i>0&&<div className="minimal-flow-arrow" aria-hidden="true"><ArrowDown size={19}/></div>}
 <RotationCard characterId={step.id} characterName={step.name} moves={step.id==='skirk'?[step.keys,'A5 → 衝刺','A5 → 重擊','A5']:[step.keys]}/>
 </div>)}</div>}
