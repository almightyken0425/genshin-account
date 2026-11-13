export type GenshinStatSource={title:string,url:string,version?:string};
export type GenshinStatProfile={
 id:string;
 name:string;
 role:string;
 effective_panel_keys:string[];
 conditional:{key:string,reason:string}[];
 summary:string;
 sources:GenshinStatSource[];
 confidence:string;
 unknown_reason?:string;
};
export function getGenshinStatProfile(id:string|null|undefined):GenshinStatProfile|null;
export function panelStatAssessment(id:string|null|undefined,key:string):{effective:boolean,reason?:string};
