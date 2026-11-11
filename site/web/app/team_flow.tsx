import RotationCard from './rotation_card';
import {teamFlows} from '@/lib/team_flows';
export default function TeamFlow({id}:{id:string}){return <div className="skirk-minimal-flow" aria-label="隊伍操作流程圖">{teamFlows[id]?.map((step,i)=><div key={i}>
 <RotationCard characterId={step.id} moves={step.moves}/>
 </div>)}</div>}
