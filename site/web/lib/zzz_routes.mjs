export function zzzSection(value){return value==='growth'?'growth':'roster'}

/** Retired team links keep their agent and roster state, then return to the roster. */
export function normalizeZzzRouteUrl(input){
 const url=new URL(input);
 url.searchParams.delete('team');
 if(url.searchParams.has('tab')&&url.searchParams.get('tab')!=='growth')url.searchParams.delete('tab');
 return url;
}

export function readZzzRoute(input){
 const url=normalizeZzzRouteUrl(input);
 return {section:zzzSection(url.searchParams.get('tab')),agent:url.searchParams.get('agent')||''};
}
