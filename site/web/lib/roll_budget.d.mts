export type EffectiveRollBudgetInput={mainKey?:string|null,effectiveKeys?:readonly string[]|null,initialLimit?:number,enhancementLimit?:number};
export function maximumEffectiveRollBudget(input?:EffectiveRollBudgetInput):number|null;
export function completeLoadout(items:({slot:string|number}|null|undefined)[]|null|undefined,slots:(string|number)[]):boolean;
