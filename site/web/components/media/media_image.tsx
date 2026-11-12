'use client';

import {useState,type CSSProperties} from 'react';
import {ImageOff} from 'lucide-react';

export type MediaImageProps={
 src?:string;
 alt:string;
 eager?:boolean;
 style?:CSSProperties;
 className?:string;
};

function ImageRequest({src,alt,eager=false,style,className}:MediaImageProps){
 const [failed,setFailed]=useState(false);
 if(!src||failed){
  const text=src?'圖片無法顯示':'尚無圖片';
  return <span className={['media-image-fallback',className].filter(Boolean).join(' ')} role={alt?'img':undefined} aria-label={alt?alt+'，'+text:undefined} aria-hidden={alt?undefined:true}><ImageOff size={22} aria-hidden="true"/><small>{text}</small></span>;
 }
 return <img src={src} alt={alt} loading={eager?'eager':'lazy'} decoding="async" className={className} style={style} onError={()=>setFailed(true)}/>;
}

export default function MediaImage(props:MediaImageProps){
 return <ImageRequest key={props.src??''} {...props}/>;
}
