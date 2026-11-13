'use client';

import type {ReactNode} from 'react';
import {BookOpen,Sprout,UsersRound} from 'lucide-react';
import NavigationDock from './navigation_dock';

export type GameSection='teams'|'roster'|'growth';
export function gameSection(value:string|null):GameSection{return value==='teams'||value==='growth'?value:'roster'}

export default function GameNavigation({section,onSelect,gameControl}:{section:GameSection,onSelect:(section:GameSection)=>void,gameControl?:ReactNode}){
 return <NavigationDock>{gameControl}
  <button type="button" className={section==='teams'?'active':''} aria-current={section==='teams'?'page':undefined} aria-label="隊伍" title="隊伍" onClick={()=>onSelect('teams')}><UsersRound size={21} aria-hidden="true"/></button>
  <button type="button" className={section==='roster'?'active':''} aria-current={section==='roster'?'page':undefined} aria-label="角色列表" title="角色列表" onClick={()=>onSelect('roster')}><BookOpen size={21} aria-hidden="true"/></button>
  <button type="button" className={section==='growth'?'active':''} aria-current={section==='growth'?'page':undefined} aria-label="培養重點" title="培養重點" onClick={()=>onSelect('growth')}><Sprout size={21} aria-hidden="true"/></button>
 </NavigationDock>;
}
