'use client';

import type {ReactNode} from 'react';
import MediaImage from '@/components/media/media_image';
import type {CharacterImage} from './types';

export default function ImageSurface({image,variant,overlay}:{image:CharacterImage,variant:'card'|'portrait',overlay:ReactNode}){
 return <div className={'image-surface image-surface--'+variant}>
  <MediaImage src={image.src} alt={image.alt} eager={image.eager} style={{objectFit:image.fit??(variant==='card'?'cover':'contain'),...image.style}}/>
  <span className="image-surface__shade" aria-hidden="true"/>
  <div className="image-surface__overlay">{overlay}</div>
 </div>;
}
