import {ArrowDown} from 'lucide-react';
import {characterImage} from '@/lib/game_assets';
import GameImage from './game_image';
import {teamFlows} from '@/lib/team_flows';
export default function TeamFlow({id}:{id:string}){return <div className="skirk-minimal-flow" aria-label="隊伍操作流程圖">{teamFlows[id]?.map((step,i)=><div key={i}>
 {i>0&&<div className="minimal-flow-arrow" aria-hidden="true"><ArrowDown size={19}/></div>}
 <div className="minimal-flow-card"><GameImage src={characterImage(step.id,'icon')} alt=""/><div className="minimal-flow-moves"><strong>{step.moves[0]}</strong>{step.moves.length>1&&<div className="minimal-flow-combos">{step.moves.slice(1).map((move,j)=><span key={j}>{move}</span>)}</div>}</div></div>
 </div>)}</div>}
