/** Summarize equipped pieces, not set effects. Singles remain visible when expanded. */
export function artifactSummary(artifacts) {
 const counts=new Map();
 for(const artifact of artifacts){
  if(!artifact)continue;
  const name=artifact.set_name?.trim();
  const key=name||Symbol('unknown-set');
  const group=counts.get(key)||{name:name||'未知套裝',count:0};
  group.count++;counts.set(key,group);
 }
 const groups=[...counts.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 const sets=groups.filter(group=>group.count>=2);
 return {sets,singles:groups.filter(group=>group.count===1).length,total:groups.reduce((sum,group)=>sum+group.count,0),groups};
}
