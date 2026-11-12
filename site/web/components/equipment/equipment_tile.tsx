'use client';

import {useContext,type ButtonHTMLAttributes,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';
import {MetricDisplayContext} from '@/components/metrics/metric_label';

type EquipmentTileProps=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'>&{
 label:string;
 children:ReactNode;
};

export default function EquipmentTile({label,children,className='',...buttonProps}:EquipmentTileProps){
 const fullLabels=useContext(MetricDisplayContext);
 return <button type="button" {...buttonProps} className={['equipment-tile',className].filter(Boolean).join(' ')} aria-label={buttonProps['aria-label']??label}>
  {fullLabels&&<span className="equipment-tile__label">{label}</span>}
  <span className="equipment-tile__preview">{children}</span>
  <ChevronDown className="expand-chevron" size={16} aria-hidden="true"/>
 </button>;
}
