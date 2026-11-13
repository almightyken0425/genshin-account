export const EFFECTIVE_ROLL_DESCRIPTION='包含初始詞條。上限依角色已確認有效屬性、排除相同主詞條後估算，未觀測屬性未計入。';

export function formatEffectiveRolls(count:number|null|undefined,maximum:number|null|undefined):string{
 return (count??'—')+'／'+(maximum??'—');
}

export function formatEffectivePercent(count:number|null|undefined,maximum:number|null|undefined):string{
 if(count==null||maximum==null||!Number.isFinite(count)||!Number.isFinite(maximum)||count<0||maximum<=0)return '—';
 return Math.round(count/maximum*100)+'%';
}

export function effectiveRollMetric(count:number|null|undefined,maximum:number|null|undefined){
 return {label:'目前有效次數／理論上限' as const,value:formatEffectiveRolls(count,maximum),description:EFFECTIVE_ROLL_DESCRIPTION};
}
