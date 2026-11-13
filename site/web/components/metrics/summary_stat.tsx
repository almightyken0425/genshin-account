import type {ReactNode} from 'react';
import MetricLabel from './metric_label';

export default function SummaryStat({label,value,effective=false,reason,effectiveLabel='已確認有效'}:{label:string,value:ReactNode,effective?:boolean,reason?:string,effectiveLabel?:string}){
 const description=[label,effective?effectiveLabel:undefined,reason].filter(Boolean).join('，');
 return <div className={effective?'is-effective':undefined} aria-label={description} title={reason}><MetricLabel label={label}/><strong>{value}</strong></div>;
}
