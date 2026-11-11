'use client';
import {useEffect,useState} from 'react';
import {ImageOff} from 'lucide-react';
export default function GameImage({src,alt,eager=false}:{src?:string,alt:string,eager?:boolean}){
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[src]);
 if(!src||failed)return <span className="image-fallback" role="img" aria-label={alt+'圖片未收錄'}><ImageOff size={21}/><small>尚無圖片</small></span>;
 return <img src={src} alt={alt} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>;
}
