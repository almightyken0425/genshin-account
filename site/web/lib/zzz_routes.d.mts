export type ZzzSection='roster'|'growth';
export type ZzzRoute={section:ZzzSection,agent:string};
export function zzzSection(value:string|null|undefined):ZzzSection;
export function normalizeZzzRouteUrl(input:string|URL):URL;
export function readZzzRoute(input:string|URL):ZzzRoute;
