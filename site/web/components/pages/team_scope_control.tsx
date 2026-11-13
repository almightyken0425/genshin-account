'use client';

export type TeamScopeOption={id:string,name:string};
export default function TeamScopeControl({teams,value,onChange}:{teams:readonly TeamScopeOption[],value:string,onChange:(id:string)=>void}){
 return <label className="team-scope-control"><span>隊伍範圍</span><select value={value} onChange={event=>onChange(event.target.value)}><option value="">全部隊伍</option>{teams.map(team=><option key={team.id} value={team.id}>{team.name}</option>)}</select></label>;
}
