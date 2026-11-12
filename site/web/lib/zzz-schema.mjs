import validate from './zzz-schema-generated.mjs';
import {effectiveDiscCount} from './zzz_discs.mjs';
/** ZZZ has independent vocabulary and evidence; never apply Genshin rules. */
export function validateZzz(account){
 const errors=[];
 if(!validate(account))return validate.errors.map(e=>'絕區零資料 '+e.instancePath+' '+e.message);
 if(!account||account.schemaVersion!==1||account.game!=='zzz')return ['絕區零資料版本不符'];
 if(!Array.isArray(account.characters))return ['缺少角色列表'];
 const ids=new Set();
 for(const c of account.characters){
  if(!c||typeof c.id!=='string'||!/^[a-z0-9_]+$/.test(c.id)||ids.has(c.id))errors.push('角色識別無效或重複');
  ids.add(c?.id);
  if(typeof c?.name!=='string'||!c.name.trim())errors.push('角色名稱不完整');
  for(const key of Object.keys(c.statsEffective||{}))if(!Object.hasOwn(c.stats||{},key))errors.push('有效面板標記缺少對應數值');
  const slots=new Set();
  for(const disc of c.driveDiscs||[]){
   if(slots.has(disc.slot))errors.push('驅動盤槽位重複');slots.add(disc.slot);
   if(disc.effectiveRollCount!==effectiveDiscCount(disc))errors.push('驅動盤有效詞條總數與觀測不一致');
  }
  if(!Array.isArray(c?.evidence)||!c.evidence.length)errors.push('角色缺少影片證據');
 }
 return errors;
}
export function allowedZzzImage(path){return typeof path==='string'&&/^evidence\/zzz\/[a-zA-Z0-9_./-]+\.(png|jpe?g)$/.test(path)&&!path.includes('..')}
