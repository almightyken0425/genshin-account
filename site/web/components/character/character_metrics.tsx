'use client';

import MetricLabel,{MetricDisplayContext} from '@/components/metrics/metric_label';
import type {CharacterMetrics2,CharacterMetrics3} from './types';

type CharacterMetricsProps={metrics:CharacterMetrics2,variant:'card'}|{metrics:CharacterMetrics3,variant:'portrait'};

export default function CharacterMetrics({metrics,variant}:CharacterMetricsProps){
 return <MetricDisplayContext value={false}><div className={'character-metrics character-metrics--'+variant}>
  {metrics.map(metric=><span className="character-metric" key={metric.label} title={metric.description?metric.label+'。'+metric.description:metric.label} aria-label={metric.label+' '+(metric.value===null||metric.value==='—'?'未知':metric.value)+(metric.description?'。'+metric.description:'')}>
   {variant==='portrait'&&<span className="character-metric__icon" aria-hidden="true"><MetricLabel label={metric.label}/></span>}
   <strong>{metric.value===null?'—':typeof metric.value==='number'?metric.value.toLocaleString('zh-TW',{maximumFractionDigits:2}):metric.value}</strong>
  </span>)}
 </div></MetricDisplayContext>;
}
