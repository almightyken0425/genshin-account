import type {ZzzAgent} from './zzz_types';
export type GrowthFocus={
 id:string;
 characterId:string;
 title:string;
 kind:'upgrade'|'verify'|'complete';
 priority?:string;
 current?:number|null;
 target?:number;
 main?:string;
 tags?:string[];
 context?:string;
 detail:string[];
 sources:{title:string,url:string}[];
};
export function growthFocusObservationToken(character:ZzzAgent):string;
export function zzzGrowthFocus(characters:readonly ZzzAgent[]):GrowthFocus[];
