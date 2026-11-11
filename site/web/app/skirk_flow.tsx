import {ArrowDown,HeartPulse,Repeat2} from 'lucide-react';
import {characterImage} from '@/lib/game_assets';
import GameImage from './game_image';
const steps=[
 {id:'escoffier',name:'愛可菲',keys:'E → A',detail:'戰技 → 普攻 1 次'},
 {id:'furina',name:'芙寧娜',keys:'E → Q',detail:'戰技 → 元素爆發'},
 {id:'voyanitsa',name:'沃雅妮莎',keys:'E',detail:'戰技，討龍準備交棒'},
 {id:'skirk',name:'絲柯克',keys:'短 E → A2 → Q',detail:'短按戰技 → 普攻 2 次 → 爆發'},
];
export default function SkirkFlow(){return <figure className="rotation-flow" aria-label="絲柯克隊操作流程圖">
 <figcaption>起手 → 交棒 → 絲柯克連段</figcaption>
 <p className="flow-legend">E 戰技 · Q 爆發 · A 普攻（數字為次數）</p>
 <div className="flow-track">{steps.map((step,i)=><div className="flow-stage" key={step.id}>
  {i>0&&<div className={'flow-connector '+(i===3?'handoff':'')}><ArrowDown size={22}/>{i===3&&<span>討龍直接交棒，不插入其他角色</span>}</div>}
  <div className={'flow-node '+(i===3?'flow-carry':'')}><GameImage src={characterImage(step.id,'icon')} alt=""/><div><span className="flow-name">{String(i+1).padStart(2,'0')} · {step.name}</span><strong>{step.keys}</strong><small>{step.detail}</small></div></div>
  {i===1&&<aside className="flow-optional"><HeartPulse size={20}/><div><strong>隊伍血低？可插入愛可菲 Q 補血</strong><p>預設不按。需要補血時在沃雅妮莎交棒之前處理，再回到下方主流程。</p></div></aside>}
 </div>)}
 <div className="flow-connector"><ArrowDown size={22}/></div>
 <div className="flow-combo" aria-label="絲柯克四段普攻連段">{['A5 → 衝刺','A5 → 重擊','A5 → 衝刺','A5'].map((combo,i)=><div className="flow-combo-stage" key={i}>{i>0&&<ArrowDown size={18}/>}<div><span>連段 {i+1}</span><strong>{combo}</strong></div></div>)}</div>
 <div className="flow-loop"><Repeat2 size={20}/><span>確認技能與討龍冷卻，再進下一輪</span></div>
 </div>
 <p className="flow-caution">芙寧娜 C2 仍靠隊伍生命值變動疊氣氛值；後排長期低血會影響疊層，不能保證絲柯克第一刀已滿層。</p>
 </figure>}
