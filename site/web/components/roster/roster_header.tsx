'use client';

import type {ReactNode,Ref} from 'react';
import {Search,X} from 'lucide-react';
import {useScrollHeader} from '@/components/navigation/use_scroll_header';

export default function RosterHeader({controls,query,onQueryChange,searchRef}:{controls:ReactNode,query:string,onQueryChange:(value:string)=>void,searchRef?:Ref<HTMLInputElement>}){
 const {headerRef,collapsed,onFocusCapture}=useScrollHeader();
 return <header ref={headerRef} className={'roster-toolbar page-header'+(collapsed?' is-collapsed':'')} onFocusCapture={onFocusCapture} aria-label="角色列表工具">
  {controls}
  <div className="roster-search"><label className="search"><Search size={17} aria-hidden="true"/><input ref={searchRef} placeholder="搜尋角色名稱" aria-label="搜尋角色名稱" value={query} onChange={event=>onQueryChange(event.target.value)}/>{query&&<button type="button" aria-label="清除搜尋" onClick={()=>onQueryChange('')}><X size={13} aria-hidden="true"/></button>}</label></div>
 </header>;
}
