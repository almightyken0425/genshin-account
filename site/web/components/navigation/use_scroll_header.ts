'use client';

import {useCallback,useEffect,useRef,useState,type FocusEventHandler} from 'react';

type ScrollHeaderOptions={resetKey?:string,threshold?:number,topBoundary?:number};

export function useScrollHeader({resetKey,threshold=16,topBoundary=64}:ScrollHeaderOptions={}){
 const headerRef=useRef<HTMLElement>(null),[collapsed,setCollapsed]=useState(false);
 const reveal=useCallback(()=>setCollapsed(false),[]);
 const onFocusCapture:FocusEventHandler<HTMLElement>=reveal;
 useEffect(()=>{
  let previousY=window.scrollY,travel=0,direction=0;
  const reset=()=>{previousY=window.scrollY;travel=0;direction=0;reveal()};
  const onScroll=()=>{
   const y=Math.max(0,window.scrollY),delta=y-previousY;previousY=y;
   if(y<topBoundary||headerRef.current?.querySelector(':is(button,input,select,textarea,a[href],summary):focus-visible')){travel=0;direction=0;reveal();return}
   if(delta===0)return;
   const nextDirection=Math.sign(delta);
   if(nextDirection!==direction){travel=0;direction=nextDirection}
   travel+=delta;
   if(Math.abs(travel)>=threshold){setCollapsed(travel>0);travel=0}
  };
  const frame=window.requestAnimationFrame(reset);
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>{window.cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll)};
 },[resetKey,threshold,topBoundary,reveal]);
 return {headerRef,collapsed,reveal,onFocusCapture};
}
