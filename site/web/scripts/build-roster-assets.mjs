import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import sharp from 'sharp';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const games=[
 {id:'genshin',catalog:'lib/game_assets.json',manifest:'public/asset_sources.json',crops:'lib/genshin_roster_crops.json',directory:'/assets/characters/'},
 {id:'zzz',catalog:'lib/zzz_assets.json',manifest:'public/zzz_asset_sources.json',crops:'lib/zzz_roster_crops.json',directory:'/assets/zzz/characters/'},
];

export function validateRosterCrop(crop,dimensions){
 const fields=['x','y','width','height','sourceWidth','sourceHeight'];
 if(!fields.every(key=>Number.isInteger(crop[key])))throw Error('Crop coordinates and source dimensions must be integers');
 if(crop.x<0||crop.y<0||crop.width<=0||crop.height<=0)throw Error('Crop must have positive dimensions and nonnegative origin');
 if(crop.width*4!==crop.height*3)throw Error('Roster crops must be exactly 3:4');
 if(crop.sourceWidth!==dimensions.width||crop.sourceHeight!==dimensions.height)throw Error('Crop source dimensions do not match the image');
 if(crop.x+crop.width>dimensions.width||crop.y+crop.height>dimensions.height)throw Error('Crop extends beyond the original image');
 const unit=Math.floor(Math.min(200,crop.width/3,crop.height/4));
 if(unit<1)throw Error('Crop is too small');
 return {width:unit*3,height:unit*4};
}

export async function renderRosterCrop(bytes,crop){
 const dimensions=await sharp(bytes).metadata();
 const output=validateRosterCrop(crop,dimensions);
 const image=await sharp(bytes)
  .extract({left:crop.x,top:crop.y,width:crop.width,height:crop.height})
  .resize({...output,fit:'fill',withoutEnlargement:true,kernel:'lanczos3'})
  .webp({quality:92,alphaQuality:100,effort:6,smartSubsample:true})
  .toBuffer();
 return {bytes:image,...output};
}

export async function buildRosterAssets({root=process.cwd(),check=false}={}){
 const pending=[],documents=[];
 for(const game of games){
  const json=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
  const catalog=await json(game.catalog),manifest=await json(game.manifest),crops=await json(game.crops);
  const ids=Object.keys(catalog.characters);
  if(JSON.stringify(ids.slice().sort())!==JSON.stringify(Object.keys(crops).sort()))throw Error(game.id+' crop coverage differs from its character catalog');
  const sourceMap=new Map(manifest.sources.map(source=>[source.path,source]));
  const derived=[];
  for(let start=0;start<ids.length;start+=4){
   const batch=await Promise.all(ids.slice(start,start+4).map(async id=>{
   const crop=crops[id],art=catalog.characters[id],source=sourceMap.get(crop.sourcePath);
   if(!source)throw Error(id+' crop source is not in the verified manifest');
   if(!['splash','rosterSource'].includes(source.kind)||![art.splash,art.rosterSource].includes(crop.sourcePath))throw Error(id+' roster must be derived from verified illustration art');
   if(source.width<=256||source.height<=256||source.assetType?.includes('avatar')||source.artworkKind==='entry-icon')throw Error(id+' roster must not enlarge a small avatar');
   if(source.sourcePage!==`https://wiki.hoyolab.com/pc/${game.id}/entry/${source.officialEntryId}`)throw Error(id+' source is missing its HoYoWiki entry');
   const sourceBytes=await readFile(resolve(root,'public'+crop.sourcePath));
   const sourceHash=hash(sourceBytes);
   if(sourceHash!==source.sha256)throw Error(id+' source hash mismatch');
   const output=await renderRosterCrop(sourceBytes,crop);
   const path=game.directory+id+'_roster.webp';
   if(check&&art.roster!==path)throw Error(id+' catalog roster reference differs from its generated path');
   const record={...source,path,characterId:id,kind:'roster',sourceProvider:'HoYoWiki',artworkKind:'illustration-close-up',derivedFrom:crop.sourcePath,sourcePath:crop.sourcePath,sourceSha256:sourceHash,crop,...{width:output.width,height:output.height},format:'webp',quality:92,alphaQuality:100,sha256:hash(output.bytes),bytes:output.bytes.length,transform:{type:'crop-and-downsample',crop,outputFormat:'webp',width:output.width,height:output.height,kernel:'lanczos3',withoutEnlargement:true,alpha:'preserved'}};
   delete record.assetType;
    return {id,path,bytes:output.bytes,record,previous:sourceMap.get(path)};
   }));
   for(const item of batch){
    derived.push(item.record);
    catalog.characters[item.id].roster=item.path;
    pending.push(item);
   }
  }
  manifest.sources=[...manifest.sources.filter(source=>source.kind!=='roster'),...derived];
  documents.push({path:game.catalog,body:catalog},{path:game.manifest,body:manifest});
 }
 if(check){
  for(const item of pending){
   if(hash(await readFile(resolve(root,'public'+item.path)))!==item.record.sha256)throw Error(item.path+' does not match its reproducible crop');
   if(!isDeepStrictEqual(item.previous,item.record))throw Error(item.path+' manifest does not match its complete derived record');
  }
 }else{
  // Prepare and validate the complete set before replacing any retained output.
  for(const item of pending)await writeFile(resolve(root,'public'+item.path),item.bytes);
  for(const document of documents)await writeFile(resolve(root,document.path),JSON.stringify(document.body,null,2)+'\n');
 }
 return {count:pending.length,bytes:pending.reduce((sum,item)=>sum+item.bytes.length,0),check};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flags=process.argv.slice(2);
 if(flags.some(flag=>flag!=='--check'))throw Error('Usage: node scripts/build-roster-assets.mjs [--check]');
 console.log(JSON.stringify(await buildRosterAssets({check:flags.includes('--check')})));
}
