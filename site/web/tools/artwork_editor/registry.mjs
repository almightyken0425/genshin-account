import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {viewFromCrop} from '../../lib/artwork_math.mjs';
import {effectiveLoadoutCount} from '../../lib/artifact_rolls.mjs';
import {effectiveDiscLoadout} from '../../lib/zzz_discs.mjs';
import {selectRoster} from '../../lib/roster_view.mjs';

const json=async path=>JSON.parse(await readFile(path,'utf8'));
const roles=['roster','portrait'];
const key=(game,role,id)=>`${game}/${role}/${id}`;
const fitView={zoom:1,offsetX:0,offsetY:0};

export async function createArtworkRegistry({root,accountRoot}){
 const catalogs={genshin:await json(resolve(root,'lib/game_assets.json')),zzz:await json(resolve(root,'lib/zzz_assets.json'))};
 const crops={genshin:await json(resolve(root,'lib/genshin_roster_crops.json')),zzz:await json(resolve(root,'lib/zzz_roster_crops.json'))};
 const manifests=[await json(resolve(root,'public/asset_sources.json')),await json(resolve(root,'public/zzz_asset_sources.json'))];
 const sources=new Map(manifests.flatMap(manifest=>manifest.sources).map(source=>[source.path,source]));
 const templates=new Map();
 for(const game of ['genshin','zzz'])for(const [id,art] of Object.entries(catalogs[game].characters)){
  const isTraveler=game==='genshin'&&id==='traveler_cryo';
  const sourcePaths=isTraveler?[art.roster]:[crops[game][id]?.sourcePath,art.splash,art.rosterSource];
  const allowed=[...new Set(sourcePaths.filter(Boolean))].map(path=>{
   const source=sources.get(path);
   if(!source||!source.sourcePage?.startsWith(`https://wiki.hoyolab.com/pc/${game}/entry/`))throw Error('Unverified editor source '+path);
   return {path,width:source.width,height:source.height,sha256:source.sha256,label:isTraveler?'女性原畫近景':path===art.splash?'完整立繪':'另一張立繪',sourcePage:source.sourcePage,url:source.url,sourceProvider:'HoYoWiki'};
  });
  for(const role of roles){
   const defaultSourcePath=isTraveler?art.roster:role==='roster'?crops[game][id].sourcePath:art.splash;
   const defaultView=role==='roster'&&!isTraveler?viewFromCrop(crops[game][id],role):{...fitView};
   templates.set(key(game,role,id),{game,role,id,sources:allowed,defaultSourcePath,defaultView,basePreviewPath:role==='roster'?art.roster:defaultSourcePath});
  }
 }
 function resolveSource(game,role,id,path){
  const template=templates.get(key(game,role,id));
  const source=template?.sources.find(source=>source.path===path);
  if(!source)throw Object.assign(new Error('這個角色無法使用所選圖片'),{status:422,code:'source_not_allowed'});
  return source;
 }
 async function bootstrap(document,websitePreviewUrl){
  const gi=await json(resolve(accountRoot,'data/account.json'));
  const zzz=await json(resolve(accountRoot,'data/zzz/account.json'));
  const artifactIndex=new Map(gi.artifacts.map(artifact=>[artifact.id,artifact]));
  const totals=Object.fromEntries(gi.characters.map(character=>[character.id,effectiveLoadoutCount(Object.values(gi.equipment?.[character.id]?.artifacts??{}).map(id=>id?artifactIndex.get(id):undefined),character.id)]));
  const giOrder=selectRoster(gi.characters,{filters:{rarities:[],weapons:[],elements:[]},sorts:[]});
  const characters={genshin:giOrder,zzz:zzz.characters};
  const entries=[];
  for(const game of ['genshin','zzz'])for(const role of roles)for(const character of characters[game]){
   const template=templates.get(key(game,role,character.id));
   if(!template)throw Error('角色缺少已核對的圖片來源：'+character.name);
   const saved=document.entries[key(game,role,character.id)];
   const metrics=game==='genshin'?[{label:'角色等級',value:character.level.current},{label:'命之座',value:character.constellation},{label:'有效詞條總數',value:totals[character.id]}]:[{label:'角色等級',value:character.level},{label:'影畫',value:character.mindscape},{label:'有效詞條總數',value:effectiveDiscLoadout(character.driveDiscs)}];
   entries.push({game,role,id:character.id,name:character.name,metrics,sources:template.sources.map(({path,width,height,sha256,label})=>({path,width,height,sha256,label})),sourcePath:saved?.sourcePath??template.defaultSourcePath,view:saved?.view??template.defaultView,expectedRevision:saved?.revision??0,previewPath:saved?.renderedPath??template.basePreviewPath,defaultSourcePath:template.defaultSourcePath,defaultView:template.defaultView});
  }
  return {schemaVersion:1,revision:document.revision,entries,websitePreviewUrl};
 }
 return {resolveSource,bootstrap};
}
