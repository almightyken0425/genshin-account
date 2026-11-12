'use client';

import ImageSurface from './image_surface';
import CharacterMetrics from './character_metrics';
import type {CharacterImage,CharacterMetrics3} from './types';

export default function PortraitSummary({image,metrics}:{image:CharacterImage,metrics:CharacterMetrics3}){
 return <ImageSurface image={image} variant="portrait" overlay={<CharacterMetrics metrics={metrics} variant="portrait"/>}/>;
}
