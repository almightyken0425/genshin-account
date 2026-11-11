import type {Character} from './types';
export type RosterFilters={rarities:number[],weapons:string[],elements:string[]};
export type SortKey='constellation'|'effective'|'level';
export type SortRule={key:SortKey,direction:'asc'|'desc'};
export const ELEMENT_ORDER:string[];
export function selectRoster(characters:Character[],options:{filters:RosterFilters,sorts:SortRule[],query?:string,effectiveTotals?:Record<string,number|null>,rarities?:Record<string,number|null>}):Character[];
