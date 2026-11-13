import {groupRotationSteps} from '@/lib/group_rotation_steps.mjs';
import RotationCard from './rotation_card';
import {teamFlows,teamFlowNotes} from '@/lib/team_flows';
export default function TeamFlow({id,showNotes=true}:{id:string,showNotes?:boolean}){return <><div className="skirk-minimal-flow" aria-label="隊伍操作流程圖">{groupRotationSteps(teamFlows[id]).map((step,i)=><div key={i}>
 <RotationCard characterId={step.id} moves={step.moves}/>
 </div>)}</div>{showNotes&&teamFlowNotes[id]&&<aside className="team-flow-notes" aria-label="循環補充">{teamFlowNotes[id].map((note,i)=><p key={i}>{note}</p>)}</aside>}</>}
