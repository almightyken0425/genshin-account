"use client";
import type {ComponentType} from 'react';
import {ArrowDownWideNarrow,ArrowUpNarrowWide,ChevronDown,ChevronUp,SlidersHorizontal,X} from 'lucide-react';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';

export type FacetOption={value:string,label:string,count:number,Icon?:ComponentType<{size?:number,'aria-hidden'?:boolean}>};
export type FacetGroup={key:string,label:string,options:FacetOption[],advanced?:boolean};
export type RosterSortOption<K extends string>={key:K,label:string,defaultDirection?:'asc'|'desc',ascendingLabel?:string,descendingLabel?:string};
type Rule<K extends string>={key:K,direction:'asc'|'desc'};
const toggle=(values:string[],value:string)=>values.includes(value)?values.filter(item=>item!==value):[...values,value];

export default function RosterControls<K extends string>({groups,filters,onFilters,sortOptions,sorts,onSorts,description='同類別可複選，跨類別取交集。未選擇代表不限。'}:{groups:FacetGroup[],filters:Record<string,string[]>,onFilters:(filters:Record<string,string[]>)=>void,sortOptions:RosterSortOption<K>[],sorts:Rule<K>[],onSorts:(sorts:Rule<K>[])=>void,description?:string}){
 const filterCount=Object.values(filters).reduce((total,values)=>total+values.length,0);
 const advanced=groups.filter(group=>group.advanced),advancedCount=advanced.reduce((total,group)=>total+(filters[group.key]?.length??0),0);
 function toggleSort(option:RosterSortOption<K>){onSorts(sorts.some(rule=>rule.key===option.key)?sorts.filter(rule=>rule.key!==option.key):[...sorts,{key:option.key,direction:option.defaultDirection??'desc'}])}
 function moveSort(index:number,offset:number){const next=[...sorts],target=index+offset;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];onSorts(next)}
 function groupView(group:FacetGroup){return <fieldset className="filter-group" key={group.key}><legend>{group.label}</legend><div className="filter-options">{group.options.map(({value,label,count,Icon})=><button type="button" key={value} aria-pressed={filters[group.key]?.includes(value)??false} onClick={()=>onFilters({...filters,[group.key]:toggle(filters[group.key]??[],value)})}>{Icon&&<Icon size={16} aria-hidden={true}/>}<span>{label}</span><span className="filter-count">{count}</span></button>)}</div></fieldset>}
 const activeOptions=sorts.flatMap(rule=>{const option=sortOptions.find(option=>option.key===rule.key);return option?[option]:[]});
 return <div className="roster-actions">
  <Sheet><SheetTrigger asChild><button type="button" className={'roster-action'+(filterCount?' is-active':'')}><SlidersHorizontal size={17} aria-hidden="true"/><span>篩選</span>{filterCount>0&&<span className="action-count" aria-label={filterCount+' 個篩選項目'}>{filterCount}</span>}</button></SheetTrigger>
   <SheetContent side="bottom" className="roster-sheet" showCloseButton={false}>
    <div className="roster-sheet-header"><SheetTitle>篩選角色</SheetTitle><SheetClose asChild><button type="button" className="icon-button" aria-label="關閉篩選"><X size={20}/></button></SheetClose></div>
    <SheetDescription className="roster-sheet-description">{description}</SheetDescription>
    <div className="roster-sheet-body">{groups.filter(group=>!group.advanced).map(groupView)}{advanced.length>0&&<details className="roster-advanced"><summary><span>進階篩選{advancedCount>0&&<span className="action-count">{advancedCount}</span>}</span><ChevronDown size={17} aria-hidden="true"/></summary><div>{advanced.map(groupView)}</div></details>}</div>
    <div className="roster-sheet-footer"><button type="button" className="text-button" disabled={!filterCount} onClick={()=>onFilters(Object.fromEntries(groups.map(group=>[group.key,[]])))}>清除篩選</button><SheetClose asChild><button type="button" className="primary">完成</button></SheetClose></div>
   </SheetContent>
  </Sheet>
  <Sheet><SheetTrigger asChild><button type="button" className={'roster-action'+(sorts.length?' is-active':'')}><ArrowDownWideNarrow size={17} aria-hidden="true"/><span>排序</span>{sorts.length>0&&<span className="action-count" aria-label={sorts.length+' 個排序條件'}>{sorts.length}</span>}</button></SheetTrigger>
   <SheetContent side="bottom" className="roster-sheet" showCloseButton={false}>
    <div className="roster-sheet-header"><SheetTitle>排序角色</SheetTitle><SheetClose asChild><button type="button" className="icon-button" aria-label="關閉排序"><X size={20}/></button></SheetClose></div>
    <SheetDescription className="roster-sheet-description">可選多項，先選的優先。可調整順序與升降序，未知值皆放最後。</SheetDescription>
    <div className="roster-sheet-body"><div className="sort-options">{[...activeOptions,...sortOptions.filter(option=>!sorts.some(rule=>rule.key===option.key))].map(option=>{
     const index=sorts.findIndex(rule=>rule.key===option.key),rule=sorts[index],ascending=option.ascendingLabel??'由低到高',descending=option.descendingLabel??'由高到低';
     return <div className={'sort-row'+(rule?' is-active':'')} key={option.key}>
      <button type="button" className="sort-choice" aria-pressed={!!rule} onClick={()=>toggleSort(option)}>{rule&&<span className="sort-priority" aria-label={'優先級 '+(index+1)}>{index+1}</span>}<span>{option.label}</span></button>
      {rule&&<div className="sort-row-actions"><button type="button" className="sort-direction" aria-label={option.label+'目前'+(rule.direction==='desc'?descending:ascending)+'，改成'+(rule.direction==='desc'?ascending:descending)} title={rule.direction==='desc'?descending:ascending} onClick={()=>onSorts(sorts.map(item=>item.key===option.key?{...item,direction:item.direction==='desc'?'asc':'desc'}:item))}>{rule.direction==='desc'?<ArrowDownWideNarrow size={16}/>:<ArrowUpNarrowWide size={16}/>}</button><button type="button" className="icon-button" aria-label={'提高'+option.label+'的排序優先級'} disabled={index===0} onClick={()=>moveSort(index,-1)}><ChevronUp size={17}/></button><button type="button" className="icon-button" aria-label={'降低'+option.label+'的排序優先級'} disabled={index===sorts.length-1} onClick={()=>moveSort(index,1)}><ChevronDown size={17}/></button></div>}
     </div>;
    })}</div></div>
    <div className="roster-sheet-footer"><button type="button" className="text-button" disabled={!sorts.length} onClick={()=>onSorts([])}>重設排序</button><SheetClose asChild><button type="button" className="primary">完成</button></SheetClose></div>
   </SheetContent>
  </Sheet>
 </div>;
}
