'use client';

import type {FocusEventHandler,ReactNode,Ref} from 'react';
import {ArrowLeft} from 'lucide-react';
import {useScrollHeader} from './use_scroll_header';

export default function CenteredHeader({title,onBack,backLabel,action,titleRef,className,onFocusCapture}:{title:string,onBack:()=>void,backLabel:string,action?:ReactNode,titleRef?:Ref<HTMLHeadingElement>,className?:string,onFocusCapture?:FocusEventHandler<HTMLElement>}){
 const {headerRef,collapsed,reveal}=useScrollHeader({resetKey:title});
 return <header ref={headerRef} className={['detail-header','centered-page-header',collapsed?'is-collapsed':'',className].filter(Boolean).join(' ')} onFocusCapture={event=>{reveal();onFocusCapture?.(event)}}><div className="character-heading"><button className="icon-button detail-back" onClick={onBack} aria-label={backLabel}><ArrowLeft size={20}/></button><h2 ref={titleRef} tabIndex={titleRef?-1:undefined}>{title}</h2></div>{action&&<div className="detail-navigation">{action}</div>}</header>;
}
