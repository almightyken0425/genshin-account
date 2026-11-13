'use client';
import MetricLabel from '@/components/metrics/metric_label';
import {formatEffectiveRolls,EFFECTIVE_ROLL_DESCRIPTION} from '@/components/metrics/effective_roll_metric';

export function EffectiveBadge({count,maximum=null,mode='current'}:{count:number|null,maximum?:number|null,mode?:'current'|'maximum'|'both'}){
 const currentText='目前有效次數 '+(count??'未知');
 const maximumText='理論上限 '+(maximum??'未知');
 const text='有效副詞條，'+(mode==='both'?currentText+'，'+maximumText:mode==='maximum'?maximumText:currentText)+(mode==='current'?'，包含初始詞條':'。'+EFFECTIVE_ROLL_DESCRIPTION);
 const value=mode==='both'?formatEffectiveRolls(count,maximum):mode==='maximum'?maximum??'—':count??'—';
 return <span className="effective-badge" title={text} aria-label={text}>{value}</span>;
}
export default function ArtifactSubstat({stat,label,roll}:{stat:{key:string,value:number|null,unit:'flat'|'percent'|null},label:string,roll:{key:string,enhancements:number|null,effective:boolean|null}}){
 const effective=roll.effective===true;
 return <div className={'field substat-field'+(effective?' is-effective':'')}>
  <div className="substat-heading"><MetricLabel label={label}/><span className="roll-count" title="強化次數，不含初始詞條" aria-label={label+'強化次數 '+(roll.enhancements??'未知')}>{roll.enhancements??'—'}</span></div>
  <strong>{stat.value===null?'未知':stat.value.toLocaleString('zh-TW',{maximumFractionDigits:2})}{stat.value!==null&&stat.unit==='percent'?'%':stat.unit===null?' 單位待核':''}</strong>
 </div>;
}
