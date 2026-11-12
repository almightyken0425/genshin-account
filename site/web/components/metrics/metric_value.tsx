import type {ReactNode} from 'react';
import MetricLabel from './metric_label';

export default function MetricValue({label,value}:{label:string,value:ReactNode}){
 return <div className="field" title={label}><MetricLabel label={label}/><strong>{value}</strong></div>;
}
