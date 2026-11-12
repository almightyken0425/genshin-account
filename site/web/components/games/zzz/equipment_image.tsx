'use client';

import MediaImage from '@/components/media/media_image';
import {zzzEquipmentFrame} from '@/lib/zzz_assets';

export default function ZzzEquipmentImage({src,alt,kind,eager=false}:{src?:string,alt:string,kind:'engine'|'disc',eager?:boolean}){
 const frame=zzzEquipmentFrame(kind,alt);
 return <span className={'zzz-equipment-image zzz-equipment-image--'+kind}>
  <MediaImage src={src} alt={alt} eager={eager} style={frame?{transform:`scale(${frame.scale*.9}) translate(${frame.translateX}%, ${frame.translateY}%)`}:undefined}/>
 </span>;
}
