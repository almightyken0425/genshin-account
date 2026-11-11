export const ELEMENT_ORDER=['pyro','hydro','anemo','electro','dendro','cryo','geo'];
const names=new Intl.Collator('zh-Hant',{numeric:true});

/** Same-category alternatives are OR, different categories are AND. */
export function selectRoster(characters,{filters,sorts,query='',effectiveTotals={},rarities={}}){
 const result=characters.filter(c=>
  (!filters.rarities.length||filters.rarities.includes(rarities[c.id]))&&
  (!filters.weapons.length||filters.weapons.includes(c.weapon_type))&&
  (!filters.elements.length||filters.elements.includes(c.element))&&
  c.name.includes(query.trim())
 );
 const elementRank=element=>{const index=ELEMENT_ORDER.indexOf(element);return index<0?ELEMENT_ORDER.length:index};
 const value=(c,key)=>key==='constellation'?c.constellation:key==='effective'?effectiveTotals[c.id]:c.level.current;
 return result.sort((a,b)=>{
  for(const rule of sorts){
   const left=value(a,rule.key),right=value(b,rule.key);
   // Unknown values stay last in both directions, and zero remains a real value.
   if(left==null&&right!=null)return 1;
   if(left!=null&&right==null)return -1;
   if(left!=null&&right!=null&&left!==right)return rule.direction==='asc'?left-right:right-left;
  }
  const group=elementRank(a.element)-elementRank(b.element)||names.compare(a.element,b.element);
  if(group)return group;
  return names.compare(a.name,b.name)||names.compare(a.id,b.id);
 });
}
