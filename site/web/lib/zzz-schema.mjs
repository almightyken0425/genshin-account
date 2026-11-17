import validate from './zzz-schema-generated.mjs';
import validateV1 from './zzz-schema-v1.mjs';
import {effectiveDiscCount} from './zzz_discs.mjs';
/** ZZZ has independent vocabulary and evidence; never apply Genshin rules. */
export function validateZzz(account){
 const errors=[];
 const schema=account?.schemaVersion===1?validateV1:validate;
 if(!schema(account))return schema.errors.map(e=>'絕區零資料 '+e.instancePath+' '+e.message);
 if(!account||![1,2].includes(account.schemaVersion)||account.game!=='zzz')return ['絕區零資料版本不符'];
 if(!Array.isArray(account.characters))return ['缺少角色列表'];
 const ids=new Set();
 const sources=new Map();
 for(const source of account.syncSources||[]){
  if(sources.has(source.id)||source.path!=='imports/hoyolab/'+source.id+'.json'||!/(?:Z|[+-]\d{2}:\d{2})$/.test(source.retrievedAt)||!Number.isFinite(Date.parse(source.retrievedAt)))errors.push('HoYoLAB 同步來源重複或格式不符');
  sources.set(source.id,source);
 }
 for(const c of account.characters){
  if(!c||typeof c.id!=='string'||!/^[a-z0-9_]+$/.test(c.id)||ids.has(c.id))errors.push('角色識別無效或重複');
  ids.add(c?.id);
  if(typeof c?.name!=='string'||!c.name.trim())errors.push('角色名稱不完整');
  if(c.sync&&!sources.has(c.sync.sourceId))errors.push('角色引用未知 HoYoLAB 來源');
  for(const key of Object.keys(c.statsEffective||{}))if(!Object.hasOwn(c.stats||{},key))errors.push('有效面板標記缺少對應數值');
  const slots=new Set();
  const evidence=[...c.evidence,...(c.legacyObservation?.evidence||[]),...(c.legacyObservation?.driveDiscs||[]).flatMap(d=>d.evidence)];
  if(c.legacyObservation&&c.legacyObservation.id!==c.id)errors.push('歷史觀測角色不符');
  for(const disc of c.driveDiscs||[]){
   if(slots.has(disc.slot))errors.push('驅動盤槽位重複');slots.add(disc.slot);
   if(disc.effectiveRollCount!==effectiveDiscCount(disc))errors.push('驅動盤有效詞條總數與觀測不一致');
   for(const stat of disc.substats)if(typeof stat.assessedEffective==='boolean'&&(disc.assessment?.method!=='role_rule'||!disc.assessment.ruleId||!Array.isArray(disc.effectiveKeys)||stat.assessedEffective!==disc.effectiveKeys.includes(stat.name+'|'+stat.unit)))errors.push('驅動盤判定缺少一致的角色規則');
   evidence.push(...disc.evidence);
  }
  if(!Array.isArray(c?.evidence)||!c.evidence.length)errors.push('角色缺少來源證據');
  for(const record of evidence)if(record.sourceId&&!sources.has(record.sourceId))errors.push('觀測引用未知 HoYoLAB 來源');
 }
 return errors;
}
export function allowedZzzImage(path){return typeof path==='string'&&/^evidence\/zzz\/[a-zA-Z0-9_./-]+\.(png|jpe?g)$/.test(path)&&!path.includes('..')}
