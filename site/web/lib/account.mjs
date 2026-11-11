import { createHash } from 'node:crypto';
import schemaV2 from './account-schema.mjs';
import schemaV1 from './account-schema-v1.mjs';
export const SLOTS = { flower:'生之花', plume:'死之羽', sands:'時之沙', goblet:'空之杯', circlet:'理之冠' };
export const LABELS = {hp:'生命值',atk:'攻擊力',def:'防禦力',em:'元素精通',stamina:'體力',hp_pct:'生命值',atk_pct:'攻擊力',def_pct:'防禦力',crit_rate:'暴擊率',crit_dmg:'暴擊傷害',energy_recharge:'元素充能效率',cryo_dmg_bonus:'冰傷加成',hydro_dmg_bonus:'水傷加成',pyro_dmg_bonus:'火傷加成',electro_dmg_bonus:'雷傷加成',anemo_dmg_bonus:'風傷加成',geo_dmg_bonus:'岩傷加成',dendro_dmg_bonus:'草傷加成',healing_bonus:'治療加成',physical_dmg_bonus:'物理傷害加成'};
export const canonical = x => Array.isArray(x) ? '['+x.map(canonical).join(',')+']' : x && typeof x === 'object' ? '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}' : JSON.stringify(x);
export const hash = x => createHash('sha256').update(x).digest('hex');
const eq = (a,b) => canonical(a) === canonical(b);
export function fingerprint(a,id) {
 const c=a.characters.find(x=>x.id===id), e=a.equipment[id];
 const mechanics=x=>x?Object.fromEntries(Object.entries(x).filter(([k])=>!['provenance','name','substat_rolls'].includes(k))):null;
 return hash(canonical({character:Object.fromEntries(['id','element','weapon_type','level','constellation','talents'].map(k=>[k,c[k]])),
 weapon:mechanics(a.weapons.find(w=>w.id===e.weapon_id)),
 artifacts:Object.fromEntries(Object.entries(e.artifacts).map(([s,aid])=>[s,mechanics(a.artifacts.find(x=>x.id===aid))]))}));
}
export const panelStates = a => Object.fromEntries(a.characters.map(c=>{ const s=a.panel_snapshots.find(s=>s.id===c.panel_snapshot_id); return [c.id,!s?'missing':s.build_fingerprint===fingerprint(a,c.id)?'current':'stale']; }));
function dated(s){ return s===null || (typeof s==='string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s))); }
export function validateAccount(a) {
 const schemaValidate=a?.schema_version===1?schemaV1:schemaV2;
 if (!schemaValidate(a)) return (schemaValidate.errors||[]).map(x=>(x.instancePath||'/')+' '+x.message);
 const errors=[], fail=s=>errors.push(s), indexes={};
 if(!dated(a.updated_at)) fail('更新時間需包含時區');
 for(const k of ['characters','weapons','artifacts','panel_snapshots','teams']){
  indexes[k]=new Map(a[k].map(x=>[x.id,x]));
  if(indexes[k].size!==a[k].length) fail(k+' 含重複 ID');
 }
 const {characters:cs,weapons:ws,artifacts:ars,panel_snapshots:ps}=indexes;
 if(!eq(Object.keys(a.equipment).sort(),[...cs.keys()].sort())) fail('角色與裝備引用不一致');
 if(new Set(a.source_ids).size!==a.source_ids.length) fail('來源重複');
 const used=new Set();
 const own=id=>{if(used.has(id))fail('同一件裝備不可由兩位角色穿戴');used.add(id)};
 for(const [cid,e] of Object.entries(a.equipment)){
  if(e.weapon_id){const w=ws.get(e.weapon_id); if(!w||w.weapon_type!==cs.get(cid)?.weapon_type)fail('武器不存在或類型不符');own(e.weapon_id)}
  for(const [s,id]of Object.entries(e.artifacts))if(id){if(ars.get(id)?.slot!==s)fail('聖遺物不存在或部位不符');own(id)}
 }
 for(const x of [...a.characters,...a.weapons])if(x.level.current!==null&&x.level.cap!==null&&x.level.current>x.level.cap)fail(x.name+' 等級超過上限');
 for(const x of a.artifacts){
  const keys=x.substats.map(s=>s.key);
  if(new Set(keys).size!==keys.length||keys.includes(x.main_stat.key))fail(x.name+' 詞條重複');
  if(x.substat_rolls){
   const r=x.substat_rolls,rollKeys=r.values.map(s=>s.key);
   if(!eq([...keys].sort(),[...rollKeys].sort()))fail(x.name+' 強化紀錄與副詞條不符');
   if(r.character_id!==null&&!cs.has(r.character_id))fail(x.name+' 有效詞條的觀測角色不存在');
   if(x.level!==null&&r.values.reduce((sum,row)=>sum+(row.enhancements??0),0)>Math.floor(x.level/4))fail(x.name+' 強化次數超過等級允許的次數');
  }
  const fixed={flower:'hp',plume:'atk'}[x.slot];if(fixed&&x.main_stat.key!==fixed)fail(x.name+' 固定主詞條錯誤');
 }
 for(const c of a.characters)if(c.panel_snapshot_id&&ps.get(c.panel_snapshot_id)?.character_id!==c.id)fail('面板引用錯誤');
 for(const s of a.panel_snapshots){
  if(!cs.has(s.character_id)||!dated(s.observed_at)||!dated(s.imported_at))fail('觀測角色或時間錯誤');
  if(new Set(s.stats.map(s=>s.key)).size!==s.stats.length)fail('面板詞條重複');
  if((s.context.team_character_ids||[]).some(id=>!cs.has(id)))fail('觀測隊伍含未知角色');
 }
 for(const t of a.teams)if(t.character_ids.some(id=>!cs.has(id)))fail('隊伍含未知角色');
 for(const k of ['characters','weapons','artifacts','panel_snapshots'])for(const x of a[k])if(x.provenance.source_ids.some(id=>!a.source_ids.includes(id)))fail('未知來源');
 return errors;
}
export function applyCandidate(base,candidate,note,now=new Date().toISOString()){
 const errors=validateAccount(candidate); if(errors.length)throw Object.assign(new Error(errors.join('、')),{status:422});
 if(typeof note!=='string'||!note.trim()||note.length>500)throw Object.assign(new Error('請填寫 1 至 500 字的修改備註'),{status:422});
 for(const k of ['schema_version','source_ids','coverage','panel_snapshots','teams'])if(!eq(base[k],candidate[k]))throw Object.assign(new Error('此編輯器不可改寫觀測、來源或資料範圍'),{status:422});
 const next=structuredClone(candidate);
 for(const kind of ['characters','weapons','artifacts']){
  if(!eq(base[kind].map(x=>x.id),next[kind].map(x=>x.id)))throw Object.assign(new Error('不可新增、移除或更改物品 ID'),{status:422});
  for(let i=0;i<base[kind].length;i++){
   const old=base[kind][i], record=next[kind][i];
   for(const k of ['provenance',...(kind==='characters'?['element','weapon_type','panel_snapshot_id']:kind==='weapons'?['weapon_type']:['slot'])]){
    if(!eq(old[k],record[k]))throw Object.assign(new Error('不可更改來源或固定類型'),{status:422});
   }
   const equipmentChanged=kind==='characters'&&!eq(base.equipment[record.id],next.equipment[record.id]);
   if(!eq(old,record)||equipmentChanged)record.provenance={...old.provenance,verification:'user_reported',notes:[...old.provenance.notes,now+' · Sites 手動更新：'+note.trim()]};
  }
 }
 const changed=!eq({...base,updated_at:null},{...next,updated_at:null});
 next.updated_at=changed?now:base.updated_at;
 return {account:next,changed,panels:panelStates(next)};
}
export function validateEvidence(a,manifests){
 const known=new Map(), errors=[];
 for(const m of manifests){if(!a.source_ids.includes(m.id)||![1,2].includes(m.schema_version))errors.push('來源清單不符');
 for(const s of m.screenshots){if(known.has(s.id))errors.push('截圖 ID 重複');known.set(s.id,m.id)}}
 for(const kind of ['characters','weapons','artifacts','panel_snapshots'])for(const r of a[kind])for(const id of r.provenance.evidence_refs)if(!known.has(id)||!r.provenance.source_ids.includes(known.get(id)))errors.push('截圖來源引用不符');
 return errors;
}
