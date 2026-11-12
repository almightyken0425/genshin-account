'use client';
import MetricLabel from '@/components/metrics/metric_label';

export function EffectiveBadge({count}:{count:number|null}){
 const text=count===null?'有效副詞條總數未完整記錄':'有效副詞條總數 '+count;
 return <span className="effective-badge" title={text} aria-label={text}>{count??'—'}</span>;
}
export default function ArtifactSubstat({stat,label,roll}:{stat:{key:string,value:number|null,unit:'flat'|'percent'|null},label:string,roll:{key:string,enhancements:number|null,effective:boolean|null}}){
 const effective=roll.effective===true;
 return <div className={'field substat-field'+(effective?' is-effective':'')}>
  <div className="substat-heading"><MetricLabel label={label}/><span className="roll-count" title="強化次數，不含初始詞條" aria-label={label+'強化次數 '+(roll.enhancements??'未知')}>{roll.enhancements??'—'}</span></div>
  <strong>{stat.value===null?'未知':stat.value.toLocaleString('zh-TW',{maximumFractionDigits:2})}{stat.value!==null&&stat.unit==='percent'?'%':stat.unit===null?' 單位待核':''}</strong>
 </div>;
}
