export const ELEMENT_ORDER=['pyro','hydro','anemo','electro','dendro','cryo','geo'];
const names=new Intl.Collator('zh-Hant',{numeric:true});

export const defaultRosterSorts=()=>[{key:'ratio',direction:'desc'}];

export function effectiveRatio(current,maximum){return Number.isFinite(current)&&current>=0&&Number.isFinite(maximum)&&maximum>0?current/maximum:null}

/** Game adapters supply values; filtering and ordered comparison are shared. */
export function selectRosterItems(items,{filters={},sorts=[],query='',getFacet,getValue,compareDefault}){
 const needle=query.trim().toLocaleLowerCase('zh-Hant');
 const unknown=value=>value==null||(typeof value==='number'&&!Number.isFinite(value));
 return items.filter(item=>item.name.toLocaleLowerCase('zh-Hant').includes(needle)&&Object.entries(filters).every(([key,selected])=>{
  if(!selected.length)return true;
  const value=getFacet(item,key),values=Array.isArray(value)?value:[value];
  return selected.some(option=>values.includes(option));
 })).sort((a,b)=>{
  for(const rule of sorts){
   const left=getValue(a,rule.key),right=getValue(b,rule.key);
   if(unknown(left)&&!unknown(right))return 1;
   if(!unknown(left)&&unknown(right))return -1;
   if(!unknown(left)&&!unknown(right)){
    const difference=typeof left==='number'&&typeof right==='number'?left-right:names.compare(String(left),String(right));
    if(difference)return rule.direction==='asc'?difference:-difference;
   }
  }
  return (compareDefault?.(a,b)??0)||names.compare(a.name,b.name)||names.compare(a.id,b.id);
 });
}

/** Same-category alternatives are OR, different categories are AND. */
export function selectRoster(characters,{filters,sorts,query='',effectiveTotals={},maximumTotals={},rarities={}}){
 const elementRank=element=>{const index=ELEMENT_ORDER.indexOf(element);return index<0?ELEMENT_ORDER.length:index};
 return selectRosterItems(characters,{filters,sorts,query,
  getFacet:(c,key)=>key==='rarities'?rarities[c.id]:key==='weapons'?c.weapon_type:c.element,
  getValue:(c,key)=>({constellation:c.constellation,effective:effectiveTotals[c.id],maximum:maximumTotals[c.id],ratio:effectiveRatio(effectiveTotals[c.id],maximumTotals[c.id]),name:c.name,level:c.level.current})[key],
  compareDefault:(a,b)=>elementRank(a.element)-elementRank(b.element)||names.compare(a.element??'',b.element??''),
 });
}
