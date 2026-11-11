import { effectiveSubstatCount } from './artifact_rolls.mjs';
import { hash, panelStates, LABELS, SLOTS } from './account.mjs';
const number=x=>x===null?'未知':String(x);
const cell=x=>String(x).replaceAll('|','\\|').replaceAll('\n',' ');
const stat=s=>(LABELS[s.key]||s.key)+' '+number(s.value)+(s.unit==='percent'&&s.value!==null?'%':'');
export function renderSummary(a,text,manifests) {
 const ws=new Map(a.weapons.map(x=>[x.id,x])), ars=new Map(a.artifacts.map(x=>[x.id,x])), ps=new Map(a.panel_snapshots.map(x=>[x.id,x]));
 const shots=new Map(manifests.flatMap(m=>m.screenshots).map(x=>[x.id,x])), states=panelStates(a);
 const links=r=>r.provenance.evidence_refs.map(id=>{const s=shots.get(id);return '['+(s.time_seconds===null?'補充圖':String(Math.floor(s.time_seconds/60)).padStart(2,'0')+':'+(s.time_seconds%60).toFixed(1).padStart(4,'0'))+'](../'+s.path+')'}).join('、');
 const lines=['# 帳號資料摘要','','此檔由 `scripts/report.py` 產生，修改現況請更新 `data/account.json`。','','資料 SHA-256：`'+hash(text)+'`','','已記錄 '+a.characters.length+' 名角色、'+ws.size+' 件武器、'+ars.size+' 件聖遺物。','','角色庫範圍：'+a.coverage.roster+'。裝備庫範圍：'+a.coverage.inventory+'。面板代表觀測值，非實戰傷害計算。','','天賦依序為普攻／戰技／爆發，表格使用記錄的顯示等級。基礎等級與觀測時間見正式資料，未知值保留為 null。','','| 角色 | 等級 | 命座 | 武器 | 精煉 | 天賦 | 面板與配裝 |','| --- | --- | --- | --- | --- | --- | --- |'];
 if(a.schema_version>=2)lines.splice(12,0,'有效副詞條依遊戲畫面亮起的項目記錄，以粗體標示。有效總數包含每項的初始 1 次，未知時不估算。','');
 const substats=(artifact,cid)=>{
  const observation=artifact.substat_rolls;
  if(!observation)return artifact.substats.map(stat).join('、');
  return artifact.substats.map(s=>{
   const r=observation.values.find(r=>r.key===s.key);
   let text=stat(s)+' · 強化 '+number(r.enhancements);
   if(observation.character_id===cid&&r.effective===true)text='**'+text+'**';
   else if(observation.character_id!==cid||r.effective===null)text+=' · 有效性未知';
   return text;
  }).join('、');
 };
 const row=values=>'| '+values.map(cell).join(' | ')+' |';
 for(const c of a.characters){const w=ws.get(a.equipment[c.id].weapon_id);lines.push(row([c.name,number(c.level.current)+'/'+number(c.level.cap),number(c.constellation),w?.name||'未知',number(w?.refinement??null),['normal','skill','burst'].map(k=>number(c.talents.displayed[k])).join('／'),states[c.id]==='missing'?'尚無面板':states[c.id]==='current'?'符合紀錄時配裝':'配裝已變更，待補面板']))}
 for(const c of a.characters){
  lines.push('','## '+c.name,'','角色證據：'+links(c),'');
  const s=ps.get(c.panel_snapshot_id),e=a.equipment[c.id],w=ws.get(e.weapon_id);
  if(s)lines.push('面板觀測：'+s.stats.map(stat).join('、'),'','面板證據：'+links(s),'');
  if(w)lines.push('武器：'+w.name+'，'+number(w.level.current)+'/'+number(w.level.cap)+' 級，精煉 '+number(w.refinement)+' 階。基礎攻擊力 '+number(w.base_atk)+'。','','武器副屬性：'+(w.secondary_stat?stat(w.secondary_stat):'未知'),'','武器證據：'+links(w),'');
  const v2=a.schema_version>=2;
  lines.push('| 部位 | 名稱與套裝 | 強化 | 主詞條 | 副詞條 | '+(v2?'有效總數 | ':'')+'證據 |','| --- | --- | --- | --- | --- | --- |'+(v2?' --- |':''));
  for(const [slot,id]of Object.entries(e.artifacts)){const x=ars.get(id);lines.push(x?row([SLOTS[slot],x.name+' · '+x.set_name,'+'+number(x.level),stat(x.main_stat),substats(x,c.id),...(v2?[number(effectiveSubstatCount(x,c.id))]:[]),links(x)]):'| '+SLOTS[slot]+' | 未記錄 | — | — | — | — |'+(v2?' — |':''))}
 }
 return lines.join('\n')+'\n';
}
