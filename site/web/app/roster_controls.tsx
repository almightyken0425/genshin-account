"use client";
import {Flame,Droplets,Wind,Zap,Leaf,Snowflake,Mountain} from 'lucide-react';
import SharedRosterControls,{type FacetGroup,type RosterSortOption} from '@/components/roster/roster_controls';
import type {Character} from '@/lib/types';
import type {RosterFilters,SortRule,SortKey} from '@/lib/roster_view.mjs';
const elementOptions=[['pyro','火',Flame],['hydro','水',Droplets],['anemo','風',Wind],['electro','雷',Zap],['dendro','草',Leaf],['cryo','冰',Snowflake],['geo','岩',Mountain]] as const;
const weaponOptions=[['sword','單手劍'],['claymore','雙手劍'],['polearm','長柄武器'],['bow','弓'],['catalyst','法器']] as const;
const sortOptions:RosterSortOption<SortKey>[]=[{key:'level',label:'等級'},{key:'constellation',label:'命座數'},{key:'effective',label:'有效目前次數'},{key:'maximum',label:'理論有效上限'},{key:'ratio',label:'有效比例'},{key:'name',label:'姓名',defaultDirection:'asc',ascendingLabel:'姓名順序',descendingLabel:'姓名反序'}];
export default function RosterControls({characters,rarities,filters,onFilters,sorts,onSorts}: {characters:Character[],rarities:Record<string,number|null>,filters:RosterFilters,onFilters:(filters:RosterFilters)=>void,sorts:SortRule[],onSorts:(sorts:SortRule[])=>void,maximumTotals?:Record<string,number|null>}){
 const groups:FacetGroup[]=[
  {key:'rarities',label:'角色星級',options:[5,4].map(value=>({value:String(value),label:value===5?'五星':'四星',count:characters.filter(character=>rarities[character.id]===value).length}))},
  {key:'weapons',label:'武器類型',options:weaponOptions.map(([value,label])=>({value,label,count:characters.filter(character=>character.weapon_type===value).length}))},
  {key:'elements',label:'元素類型',options:elementOptions.map(([value,label,Icon])=>({value,label,Icon,count:characters.filter(character=>character.element===value).length}))},
 ];
 return <SharedRosterControls groups={groups} filters={{rarities:filters.rarities.map(String),weapons:filters.weapons,elements:filters.elements}} onFilters={next=>onFilters({rarities:next.rarities.map(Number),weapons:next.weapons,elements:next.elements})} sortOptions={sortOptions} sorts={sorts} onSorts={onSorts}/>;
}
