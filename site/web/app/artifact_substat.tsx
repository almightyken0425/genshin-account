'use client';
import type {Stat,SubstatRoll} from '@/lib/types';
import MetricLabel from './metric_label';

export function EffectiveBadge({count}:{count:number|null}){
 const text=count===null?'有效副詞條總數未完整記錄':'有效副詞條總數 '+count;
 return <span className="effective-badge" title={text} aria-label={text}>{count??'—'}</span>;
}
export default function ArtifactSubstat({stat,label,roll,editing,rollEditing,options,onKey,onValue,onRoll}:{stat:Stat,label:string,roll:SubstatRoll,editing:boolean,rollEditing:boolean,options:{key:string,label:string,disabled:boolean}[],onKey:(key:string)=>void,onValue:(value:number|null)=>void,onRoll:(patch:Partial<SubstatRoll>)=>void}){
 const effective=roll.effective===true;
 return <div className={'field substat-field'+(effective?' is-effective':'')}>
  {editing&&<select className="substat-property" aria-label={'副詞條屬性：'+label} title={label} value={stat.key} onChange={event=>onKey(event.target.value)}>{!options.some(option=>option.key===stat.key)&&<option value={stat.key}>{label}</option>}{options.map(option=><option key={option.key} value={option.key} disabled={option.disabled}>{option.label}</option>)}</select>}
  <div className="substat-heading"><MetricLabel label={label}/>{rollEditing?<input className="roll-input" aria-label={label+'強化次數'} title="強化次數，不含初始詞條" type="number" min={0} max={5} step={1} value={roll.enhancements??''} placeholder="—" onChange={event=>onRoll({enhancements:event.target.value===''?null:Number(event.target.value)})}/>:<span className="roll-count" title="強化次數，不含初始詞條" aria-label={label+'強化次數 '+(roll.enhancements??'未知')}>{roll.enhancements??'—'}</span>}</div>
  {editing?<span className="input-value"><input aria-label={label+'數值'} type="number" min={0} step={0.1} value={stat.value??''} placeholder="未知" onChange={event=>onValue(event.target.value===''?null:Number(event.target.value))}/>{stat.unit==='percent'&&<small>%</small>}</span>:<strong>{stat.value===null?'未知':stat.value.toLocaleString('zh-TW',{maximumFractionDigits:2})}{stat.value!==null&&stat.unit==='percent'?'%':''}</strong>}
  {rollEditing&&<select className="effective-select" aria-label={label+'是否為有效副詞條'} value={roll.effective===null?'unknown':String(roll.effective)} onChange={event=>onRoll({effective:event.target.value==='unknown'?null:event.target.value==='true'})}><option value="unknown">未確認</option><option value="true">有效</option><option value="false">非有效</option></select>}
 </div>;
}
