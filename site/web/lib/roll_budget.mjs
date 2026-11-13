/** Theoretical effective ceiling for the supplied key set, not the item's observed starting rolls. */
export function maximumEffectiveRollBudget({mainKey,effectiveKeys,initialLimit=4,enhancementLimit=5}={}) {
 if(typeof mainKey!=='string'||!mainKey||!Array.isArray(effectiveKeys))return null;
 if(!Number.isInteger(initialLimit)||initialLimit<1||!Number.isInteger(enhancementLimit)||enhancementLimit<0)return null;
 if(Array.from(effectiveKeys).some(key=>typeof key!=='string'||!key))return null;
 const candidates=new Set(effectiveKeys);candidates.delete(mainKey);
 return candidates.size===0?0:Math.min(candidates.size,initialLimit)+enhancementLimit;
}

/** A complete loadout has one item in every actual equipment slot. */
export function completeLoadout(items, slots) {
 return Array.isArray(items)&&items.length===slots.length&&slots.every(slot=>items.filter(item=>item?.slot===slot).length===1);
}
