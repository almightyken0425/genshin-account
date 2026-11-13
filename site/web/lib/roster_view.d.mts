import type {Character} from './types';
export type RosterFilters={rarities:number[],weapons:string[],elements:string[]};
export type SortKey='constellation'|'effective'|'maximum'|'ratio'|'level'|'name';
export type SortRule={key:SortKey,direction:'asc'|'desc'};
export const ELEMENT_ORDER:string[];
export function effectiveRatio(current:number|null|undefined,maximum:number|null|undefined):number|null;
export function selectRosterItems<T extends {id:string;name:string},K extends string=string>(items:readonly T[],options:{filters?:Record<string,readonly (string|number)[]>,sorts?:readonly {key:K;direction:'asc'|'desc'}[],query?:string,getFacet:(item:T,key:string)=>string|number|null|undefined|readonly (string|number)[],getValue:(item:T,key:K)=>string|number|null|undefined,compareDefault?:(a:T,b:T)=>number}):T[];
export function selectRoster(characters:Character[],options:{filters:RosterFilters,sorts:SortRule[],query?:string,effectiveTotals?:Record<string,number|null>,maximumTotals?:Record<string,number|null>,rarities?:Record<string,number|null>}):Character[];
