import type {ZzzAgent} from './zzz_types';

export type GuideSource = {label:string;url:string};
export type TrainingPlan = {
 observedMindscape:number;
 displayedCaps:Record<string,number>;
 skills:{skill:string;target:number;priority:1|2|3;reason:string}[];
 maintain:string[];
 sources?:GuideSource[];
};
export type ZzzTeamMember = {id:string;role:string;focus:string[]};
export type ZzzTeamGuide = {
 id:string;
 name:string;
 summary:string;
 reason:string;
 accountAssessment?:{verdict:string;reason:string;alternatives?:string[]};
 members:ZzzTeamMember[];
 activation:string[];
 steps:{characterId:string;action:string}[];
 sources:GuideSource[];
};
export type GrowthAction = {
 id:string;
 kind:'upgrade'|'verify'|'complete';
 title:string;
 detail:string;
 skill?:string;
 current?:number|string|null;
 target?:number|string;
 priority?:0|1|2|3;
};
export type GrowthAdvice = {
 characterId:string;
 actions:GrowthAction[];
 effectiveCount:number|null;
};
export function eligibleTeams(characters:readonly Pick<ZzzAgent,'id'>[],guides:readonly ZzzTeamGuide[]):ZzzTeamGuide[];
export function growthAdvice(characters:readonly ZzzAgent[],priorityIds?:readonly string[],plans?:Readonly<Record<string,TrainingPlan>>):GrowthAdvice[];
