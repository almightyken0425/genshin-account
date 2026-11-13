import catalog from './zzz_assets.json';
import frames from './zzz_asset_frames.json';
import {editedArtwork} from './artwork_edits';
type CharacterArt={icon:string,splash:string,roster:string,rosterSource:string};
export function zzzCharacterImage(id:string,kind:'icon'|'splash'){
 const art=(catalog.characters as Record<string,CharacterArt>)[id];
 return kind==='splash'?editedArtwork('zzz','portrait',id)??art?.splash:art?.icon;
}
export function zzzEngineImage(name:string|null|undefined){return name?(catalog.engines as Record<string,string>)[name]:undefined}
export function zzzDiscImage(name:string|null|undefined){return name?(catalog.discs as Record<string,string>)[name]:undefined}
export function zzzRosterImage(id:string){
 const src=editedArtwork('zzz','roster',id)??(catalog.characters as Record<string,CharacterArt>)[id]?.roster;
 return src?{src,style:{width:'100%',height:'100%',left:'0%',top:'0%'}}:undefined;
}
type AssetFrame={width:number,height:number,bounds:number[]};
export function zzzEquipmentFrame(kind:'engine'|'disc',name:string|null|undefined){
 const src=kind==='engine'?zzzEngineImage(name):zzzDiscImage(name);
 const frame=src?(frames as Record<string,AssetFrame>)[src]:undefined;
 if(!frame)return undefined;
 const [left,top,right,bottom]=frame.bounds;
 const basis=Math.max(frame.width,frame.height);
 return {
  scale:basis/Math.max(right-left,bottom-top),
  translateX:(frame.width-left-right)/basis*50,
  translateY:(frame.height-top-bottom)/basis*50,
 };
}
