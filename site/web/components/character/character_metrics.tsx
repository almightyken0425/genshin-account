'use client';

import MetricLabel,{MetricDisplayContext} from '@/components/metrics/metric_label';
import type {CharacterMetrics3} from './types';

export default function CharacterMetrics({metrics,variant}:{metrics:CharacterMetrics3,variant:'card'|'portrait'}){
 return <MetricDisplayContext value={false}><div className={'character-metrics character-metrics--'+variant}>
  {metrics.map(metric=><span className="character-metric" key={metric.label} title={metric.label} aria-label={metric.label+' '+(metric.value===null?'未知':metric.value)}>
   {variant==='portrait'&&<span className="character-metric__icon" aria-hidden="true"><MetricLabel label={metric.label}/></span>}
   <strong>{metric.value===null?'—':metric.value.toLocaleString('zh-TW',{maximumFractionDigits:2})}</strong>
  </span>)}
 </div></MetricDisplayContext>;
}
