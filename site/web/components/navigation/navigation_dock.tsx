'use client';

import {useEffect,useRef,useState,type ReactNode} from 'react';

export default function NavigationDock({children,ariaLabel='主要分頁',className=''}:{children:ReactNode,ariaLabel?:string,className?:string}){
 const [scrolling,setScrolling]=useState(false);
 const dockRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  let idle:ReturnType<typeof setTimeout>|undefined;
  const show=()=>{clearTimeout(idle);setScrolling(false)};
  const onScroll=()=>{
   clearTimeout(idle);
   if(dockRef.current?.contains(document.activeElement)){setScrolling(false);return}
   setScrolling(true);idle=setTimeout(()=>setScrolling(false),180);
  };
  const onVisibility=()=>{if(document.visibilityState!=='visible')show()};
  window.addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{
   clearTimeout(idle);
   window.removeEventListener('scroll',onScroll);
   document.removeEventListener('visibilitychange',onVisibility);
  };
 },[]);
 const classes=['footer-fab','navigation-dock',scrolling?'is-scrolling':'',className].filter(Boolean).join(' ');
 return <nav ref={dockRef} className={classes} onFocusCapture={()=>setScrolling(false)} aria-label={ariaLabel}>{children}</nav>;
}
