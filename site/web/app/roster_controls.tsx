'use client';
import {ArrowDownWideNarrow,ArrowUpNarrowWide,ChevronDown,ChevronUp,SlidersHorizontal,X,Flame,Droplets,Wind,Zap,Leaf,Snowflake,Mountain} from 'lucide-react';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';
import type {Character} from '@/lib/types';
import type {RosterFilters,SortRule,SortKey} from '@/lib/roster_view.mjs';

const elementOptions=[['pyro','火',Flame],['hydro','水',Droplets],['anemo','風',Wind],['electro','雷',Zap],['dendro','草',Leaf],['cryo','冰',Snowflake],['geo','岩',Mountain]] as const;
const weaponOptions=[['sword','單手劍'],['claymore','雙手劍'],['polearm','長柄武器'],['bow','弓'],['catalyst','法器']] as const;
const sortOptions:{key:SortKey,label:string}[]=[{key:'constellation',label:'命座數'},{key:'effective',label:'有效詞條總數'},{key:'level',label:'等級'}];
const toggle=<T,>(values:T[],value:T)=>values.includes(value)?values.filter(x=>x!==value):[...values,value];
export default function RosterControls({characters,rarities,filters,onFilters,sorts,onSorts}:{characters:Character[],rarities:Record<string,number|null>,filters:RosterFilters,onFilters:(filters:RosterFilters)=>void,sorts:SortRule[],onSorts:(sorts:SortRule[])=>void}){
 const filterCount=filters.rarities.length+filters.weapons.length+filters.elements.length;
 function toggleSort(key:SortKey){onSorts(sorts.some(rule=>rule.key===key)?sorts.filter(rule=>rule.key!==key):[...sorts,{key,direction:'desc'}])}
 function moveSort(index:number,offset:number){const next=[...sorts],target=index+offset;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];onSorts(next)}
 return <header className="roster-toolbar"><div className="roster-actions">
  <Sheet><SheetTrigger asChild><button className={'roster-action'+(filterCount?' is-active':'')}><SlidersHorizontal size={17}/><span>篩選</span>{filterCount>0&&<span className="action-count" aria-label={filterCount+' 個篩選項目'}>{filterCount}</span>}</button></SheetTrigger>
   <SheetContent side="bottom" className="roster-sheet" showCloseButton={false}>
    <div className="roster-sheet-header"><SheetTitle>篩選角色</SheetTitle><SheetClose asChild><button className="icon-button" aria-label="關閉篩選"><X size={20}/></button></SheetClose></div>
    <SheetDescription className="roster-sheet-description">各類別皆可複選，未選擇代表不限。</SheetDescription>
    <div className="roster-sheet-body">
     <fieldset className="filter-group"><legend>角色星級</legend><div className="filter-options">{[5,4].map(rarity=><button key={rarity} aria-pressed={filters.rarities.includes(rarity)} onClick={()=>onFilters({...filters,rarities:toggle(filters.rarities,rarity)})}>{rarity===5?'五星':'四星'}<span className="filter-count">{characters.filter(c=>rarities[c.id]===rarity).length}</span></button>)}</div></fieldset>
     <fieldset className="filter-group"><legend>武器類型</legend><div className="filter-options">{weaponOptions.map(([value,label])=><button key={value} aria-pressed={filters.weapons.includes(value)} onClick={()=>onFilters({...filters,weapons:toggle(filters.weapons,value)})}>{label}<span className="filter-count">{characters.filter(c=>c.weapon_type===value).length}</span></button>)}</div></fieldset>
     <fieldset className="filter-group"><legend>元素類型</legend><div className="filter-options">{elementOptions.map(([value,label,Icon])=><button key={value} aria-pressed={filters.elements.includes(value)} onClick={()=>onFilters({...filters,elements:toggle(filters.elements,value)})}><Icon size={16}/>{label}<span className="filter-count">{characters.filter(c=>c.element===value).length}</span></button>)}</div></fieldset>
    </div>
    <div className="roster-sheet-footer"><button className="text-button" disabled={!filterCount} onClick={()=>onFilters({rarities:[],weapons:[],elements:[]})}>清除篩選</button><SheetClose asChild><button className="primary">完成</button></SheetClose></div>
   </SheetContent>
  </Sheet>
  <Sheet><SheetTrigger asChild><button className={'roster-action'+(sorts.length?' is-active':'')}><ArrowDownWideNarrow size={17}/><span>排序</span>{sorts.length>0&&<span className="action-count" aria-label={sorts.length+' 個排序條件'}>{sorts.length}</span>}</button></SheetTrigger>
   <SheetContent side="bottom" className="roster-sheet" showCloseButton={false}>
    <div className="roster-sheet-header"><SheetTitle>排序角色</SheetTitle><SheetClose asChild><button className="icon-button" aria-label="關閉排序"><X size={20}/></button></SheetClose></div>
    <SheetDescription className="roster-sheet-description">可選多項，先選的優先。使用箭頭調整順序與升降序。</SheetDescription>
    <div className="roster-sheet-body"><div className="sort-options">{[...sorts.map(rule=>sortOptions.find(option=>option.key===rule.key)!),...sortOptions.filter(option=>!sorts.some(rule=>rule.key===option.key))].map(option=>{
     const index=sorts.findIndex(rule=>rule.key===option.key),rule=sorts[index];
     return <div className={'sort-row'+(rule?' is-active':'')} key={option.key}>
      <button className="sort-choice" aria-pressed={!!rule} onClick={()=>toggleSort(option.key)}>{rule&&<span className="sort-priority" aria-label={'優先級 '+(index+1)}>{index+1}</span>}<span>{option.label}</span></button>
      {rule&&<div className="sort-row-actions"><button className="sort-direction" aria-label={option.label+(rule.direction==='desc'?'目前由高到低，改成由低到高':'目前由低到高，改成由高到低')} title={rule.direction==='desc'?'由高到低':'由低到高'} onClick={()=>onSorts(sorts.map(item=>item.key===option.key?{...item,direction:item.direction==='desc'?'asc':'desc'}:item))}>{rule.direction==='desc'?<ArrowDownWideNarrow size={16}/>:<ArrowUpNarrowWide size={16}/>}</button><button className="icon-button" aria-label={'提高'+option.label+'的排序優先級'} disabled={index===0} onClick={()=>moveSort(index,-1)}><ChevronUp size={17}/></button><button className="icon-button" aria-label={'降低'+option.label+'的排序優先級'} disabled={index===sorts.length-1} onClick={()=>moveSort(index,1)}><ChevronDown size={17}/></button></div>}
     </div>
    })}</div></div>
    <div className="roster-sheet-footer"><button className="text-button" disabled={!sorts.length} onClick={()=>onSorts([])}>重設排序</button><SheetClose asChild><button className="primary">完成</button></SheetClose></div>
   </SheetContent>
  </Sheet>
 </div></header>
}
