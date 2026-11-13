'use client';

import {forwardRef,type ButtonHTMLAttributes} from 'react';
import ImageSurface from './image_surface';
import CharacterMetrics from './character_metrics';
import type {CharacterImage,CharacterMetrics2} from './types';

type CharacterCardProps=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'>&{
 name:string;
 image:CharacterImage;
 metrics:CharacterMetrics2;
};

const CharacterCard=forwardRef<HTMLButtonElement,CharacterCardProps>(function CharacterCard({name,image,metrics,className='',...buttonProps},ref){
 const label='查看'+name+'的角色詳情，'+metrics.map(metric=>metric.label+' '+(metric.value===null||metric.value==='—'?'未知':metric.value)).join('，');
 return <button type="button" name={name} {...buttonProps} ref={ref} className={'character-card '+className} aria-label={buttonProps['aria-label']??label}>
  <ImageSurface image={image} variant="card" overlay={<CharacterMetrics metrics={metrics} variant="card"/>}/>
 </button>;
});

export default CharacterCard;
