"use client";
import SharedRosterControls,{type FacetGroup,type RosterSortOption} from './roster_controls';
import {zzzFacet,ZZZ_ELEMENT_ORDER,ZZZ_SPECIALTY_ORDER,ZZZ_CULTIVATION_OPTIONS,type ZzzCatalog,type ZzzRosterFilters,type ZzzSortKey,type ZzzSortRule} from '@/lib/zzz_roster_view.mjs';
import type {ZzzAgent} from '@/lib/zzz_types';
const sorts:RosterSortOption<ZzzSortKey>[]=[{key:'level',label:'等級'},{key:'mindscape',label:'影畫'},{key:'effective',label:'有效目前次數'},{key:'maximum',label:'理論有效上限'},{key:'ratio',label:'有效比例'},{key:'name',label:'姓名',defaultDirection:'asc',ascendingLabel:'姓名順序',descendingLabel:'姓名反序'}];
export default function ZzzRosterControls({characters,catalog,filters,onFilters,sorts:rules,onSorts}:{characters:ZzzAgent[],catalog:ZzzCatalog,filters:ZzzRosterFilters,onFilters:(filters:ZzzRosterFilters)=>void,sorts:ZzzSortRule[],onSorts:(sorts:ZzzSortRule[])=>void}){
 const count=(key:string,value:string)=>characters.filter(character=>{const facet=zzzFacet(character,key,catalog);return Array.isArray(facet)?facet.includes(value):facet===value}).length;
 const options=(key:string,values:string[])=>values.map(value=>({value,label:value,count:count(key,value)}));
 const factions=[...new Set(characters.map(character=>zzzFacet(character,'factions',catalog)).filter((value):value is string=>typeof value==='string'&&!!value))].sort((a,b)=>a.localeCompare(b,'zh-Hant'));
 const groups:FacetGroup[]=[
  {key:'rarities',label:'角色級別',options:options('rarities',['S','A'])},
  {key:'elements',label:'屬性',options:options('elements',ZZZ_ELEMENT_ORDER.filter(value=>count('elements',value)>0))},
  {key:'specialties',label:'職業',options:options('specialties',ZZZ_SPECIALTY_ORDER)},
  {key:'factions',label:'陣營',options:options('factions',factions),advanced:true},
  {key:'mindscapes',label:'影畫',options:Array.from({length:7},(_,value)=>({value:String(value),label:String(value),count:count('mindscapes',String(value))})),advanced:true},
  {key:'cultivation',label:'培養狀態',options:ZZZ_CULTIVATION_OPTIONS.map(option=>({...option,count:count('cultivation',option.value)})),advanced:true},
 ];
 return <SharedRosterControls groups={groups} filters={filters} onFilters={next=>onFilters(next as ZzzRosterFilters)} sortOptions={sorts} sorts={rules} onSorts={onSorts} description="同類別可複選，跨類別取交集。培養狀態只看角色、音擎與盤的已知等級。"/>;
}
