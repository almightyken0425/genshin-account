import {selectRosterItems,effectiveRatio} from './roster_view.mjs';

export const ZZZ_ELEMENT_ORDER=['物理','火','冰','電','以太','風','烈霜','玄墨','凜刃','流明'];
export const ZZZ_SPECIALTY_ORDER=['強攻','擊破','異常','支援','防護','命破'];
export const ZZZ_SORT_KEYS=['level','mindscape','effective','maximum','ratio','name'];
export const ZZZ_CULTIVATION_OPTIONS=[{value:'levels-ready',label:'角色、音擎與盤等級到位'},{value:'character-leveling',label:'角色未60級'},{value:'engine-leveling',label:'音擎未60級'},{value:'discs-leveling',label:'驅動盤未15級'},{value:'unknown',label:'有等級待核對'}];
const filterKeys=['rarities','elements','specialties','factions','mindscapes','cultivation'];
const names=new Intl.Collator('zh-Hant',{numeric:true});
export const normalizeZzzElement=value=>typeof value==='string'?value.trim().replace(/屬性$/,'').replace(/^雷$/,'電'):null;
export const normalizeZzzSpecialty=value=>typeof value==='string'?value.trim().replace(/角色$/,''):null;
export const emptyZzzFilters=()=>Object.fromEntries(filterKeys.map(key=>[key,[]]));
const known=value=>Number.isInteger(value)&&value>=0;
export function zzzCultivation(character){
 const result=[],engineLevel=character.wEngine?.level,discs=character.driveDiscs??[];
 const slots=Array.from({length:6},(_,index)=>discs.find(disc=>disc.slot===index+1));
 if(known(character.level)&&character.level<60)result.push('character-leveling');
 if(known(engineLevel)&&engineLevel<60)result.push('engine-leveling');
 if(slots.some(disc=>known(disc?.level)&&disc.level<15))result.push('discs-leveling');
 if(!known(character.level)||!known(engineLevel)||slots.some(disc=>!known(disc?.level)))result.push('unknown');
 if(character.level===60&&engineLevel===60&&slots.every(disc=>disc?.level===15))result.push('levels-ready');
 return result;
}
export function zzzFacet(character,key,catalog={}){
 const entry=catalog[character.id];
 if(key==='rarities')return entry?.rarity??null;
 if(key==='elements')return normalizeZzzElement(character.element??entry?.element);
 if(key==='specialties')return normalizeZzzSpecialty(character.specialty??entry?.specialty);
 if(key==='factions')return entry?.faction??null;
 if(key==='mindscapes')return known(character.mindscape)?String(character.mindscape):null;
 if(key==='cultivation')return zzzCultivation(character);
 return null;
}
export function selectZzzRoster(characters,{filters=emptyZzzFilters(),sorts=[],query='',catalog={},effectiveTotals={},maximumTotals={}}={}){
 const rank=character=>{const index=ZZZ_ELEMENT_ORDER.indexOf(zzzFacet(character,'elements',catalog));return index<0?ZZZ_ELEMENT_ORDER.length:index};
 return selectRosterItems(characters,{filters,sorts,query,getFacet:(character,key)=>zzzFacet(character,key,catalog),
  getValue:(character,key)=>({level:character.level,mindscape:character.mindscape,effective:effectiveTotals[character.id],maximum:maximumTotals[character.id],ratio:effectiveRatio(effectiveTotals[character.id],maximumTotals[character.id]),name:character.name})[key],
  compareDefault:(a,b)=>rank(a)-rank(b)||names.compare(zzzFacet(a,'elements',catalog)??'',zzzFacet(b,'elements',catalog)??''),
 });
}
export function parseZzzRosterState(serialized){
 const state={query:'',filters:emptyZzzFilters(),sorts:[]};
 try{
  const value=JSON.parse(serialized??'null');
  if(!value||typeof value!=='object')return state;
  state.query=typeof value.query==='string'?value.query:'';
  for(const key of filterKeys)if(Array.isArray(value.filters?.[key]))state.filters[key]=[...new Set(value.filters[key].filter(item=>typeof item==='string'))];
  if(Array.isArray(value.sorts))for(const rule of value.sorts)if(ZZZ_SORT_KEYS.includes(rule?.key)&&['asc','desc'].includes(rule.direction)&&!state.sorts.some(item=>item.key===rule.key))state.sorts.push({key:rule.key,direction:rule.direction});
 }catch{}
 return state;
}
export function serializeZzzRosterState(state){return state.query||Object.values(state.filters).some(values=>values.length)||state.sorts.length?JSON.stringify(state):null}
