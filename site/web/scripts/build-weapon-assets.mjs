import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import sharp from 'sharp';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifestPath='public/asset_sources.json';
export const WEAPON_MAX_SIDE=1200;
export const WEAPON_PADDING=8;

export async function normalizeWeaponAsset(bytes){
 const metadata=await sharp(bytes).metadata();
 if(metadata.format!=='png'||!metadata.hasAlpha)throw Error('Weapon sources must be transparent PNG illustrations');
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=-1,bottom=-1,transparentPixels=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const alpha=data[(y*info.width+x)*info.channels+info.channels-1];
  if(alpha===0){transparentPixels++;continue}
  left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
 }
 if(!transparentPixels||right<left||bottom<top)throw Error('Weapon source must contain both artwork and transparent pixels');
 const crop={x:left,y:top,width:right-left+1,height:bottom-top+1,sourceWidth:info.width,sourceHeight:info.height};
 const image=await sharp(bytes)
  .extract({left:crop.x,top:crop.y,width:crop.width,height:crop.height})
  .resize({width:WEAPON_MAX_SIDE-2*WEAPON_PADDING,height:WEAPON_MAX_SIDE-2*WEAPON_PADDING,fit:'inside',withoutEnlargement:true,kernel:'lanczos3'})
  .extend({top:WEAPON_PADDING,bottom:WEAPON_PADDING,left:WEAPON_PADDING,right:WEAPON_PADDING,background:{r:0,g:0,b:0,alpha:0}})
  .png({compressionLevel:9,adaptiveFiltering:true})
  .toBuffer({resolveWithObject:true});
 const transform={type:'trim-transparent-downsample-and-pad',crop,alphaThreshold:0,padding:WEAPON_PADDING,maxSide:WEAPON_MAX_SIDE,contentMaxSide:WEAPON_MAX_SIDE-2*WEAPON_PADDING,withoutEnlargement:true,kernel:'lanczos3',outputFormat:'png',alpha:'preserved'};
 return {bytes:image.data,width:image.info.width,height:image.info.height,rawWidth:info.width,rawHeight:info.height,transform};
}

async function verifiedRawSource(source,{sourceDirectory,allowFetch,fetcher}){
 if(!/^[a-f0-9]{64}$/.test(source.rawSourceSha256))throw Error(source.name+' has no verified raw source SHA-256');
 const file=join(sourceDirectory,source.rawSourceSha256+'.png');
 let bytes;
 try{bytes=await readFile(file)}catch(error){
  if(error.code!=='ENOENT')throw error;
  if(!allowFetch)throw Error(source.name+' raw source is missing. Supply --source-directory or explicitly use --fetch');
  const url=new URL(source.url);
  if(url.protocol!=='https:'||!['upload-static.hoyoverse.com','act-webstatic.hoyoverse.com','act-upload.hoyoverse.com'].includes(url.hostname))throw Error('Weapon source must use the recorded official HoYoWiki image host');
  const response=await fetcher(source.url);
  if(!response.ok)throw Error(source.name+' raw source download failed: '+response.status);
  bytes=Buffer.from(await response.arrayBuffer());
  if(hash(bytes)!==source.rawSourceSha256)throw Error(source.name+' raw source SHA-256 differs');
  await mkdir(sourceDirectory,{recursive:true});await writeFile(file,bytes);
 }
 if(hash(bytes)!==source.rawSourceSha256)throw Error(source.name+' raw source SHA-256 differs');
 return bytes;
}

export async function buildWeaponAssets({root=process.cwd(),sourceDirectory=join(tmpdir(),'hoyo-weapon-source-cache'),allowFetch=false,fetcher=fetch,sourceRecords,check=false}={}){
 const catalog=JSON.parse(await readFile(resolve(root,'lib/game_assets.json'),'utf8'));
 const manifest=JSON.parse(await readFile(resolve(root,manifestPath),'utf8'));
 const overrides=sourceRecords?new Map(sourceRecords.map(source=>[source.path,source])):null;
 if(overrides&&(overrides.size!==Object.keys(catalog.weapons).length||Object.values(catalog.weapons).some(art=>!overrides.has(art.icon))))throw Error('Weapon source coverage differs from the catalog');
 const originals=new Map(manifest.sources.map(source=>[source.path,source])),pending=[];
 for(const [name,art] of Object.entries(catalog.weapons)){
  const source=overrides?.get(art.icon)??originals.get(art.icon);
  if(!source||source.path!==art.icon||source.name!==name||source.game_id!==art.gameId||source.category!=='weapons'||source.kind!=='icon')throw Error(name+' source identity differs from the weapon catalog');
  if(source.assetType!=='complete-weapon-illustration'||source.sourceProvider!=='HoYoWiki'||source.sourceField!=='modules.gallery_character.list[].img'||source.gallery?.componentId!=='gallery_character'||source.gallery?.imageUrl!==source.url)throw Error(name+' source must be a recorded HoYoWiki gallery illustration');
  if(source.sourcePage!==`https://wiki.hoyolab.com/pc/genshin/entry/${source.officialEntryId}`||!['zh-tw','en-us'].includes(source.sourceLanguage))throw Error(name+' is missing its official gallery page or language');
  const bytes=await verifiedRawSource(source,{sourceDirectory,allowFetch,fetcher});
  const output=await normalizeWeaponAsset(bytes);
  if(source.rawSourceFormat!=='png'||output.rawWidth!==source.rawSourceWidth||output.rawHeight!==source.rawSourceHeight)throw Error(name+' recorded raw source dimensions differ');
  const record={...source,width:output.width,height:output.height,bytes:output.bytes.length,sha256:hash(output.bytes),transform:output.transform};
  pending.push({record,bytes:output.bytes,previous:originals.get(art.icon)});
 }
 if(check){
  for(const item of pending){
   if(!isDeepStrictEqual(item.record,item.previous))throw Error(item.record.name+' manifest differs from its complete normalized record');
   if(hash(await readFile(resolve(root,'public'+item.record.path)))!==item.record.sha256)throw Error(item.record.name+' PNG differs from its reproducible normalization');
  }
 }else{
  // All source hashes and complete image outputs are ready before replacing files.
  for(const item of pending)await writeFile(resolve(root,'public'+item.record.path),item.bytes);
  const latest=JSON.parse(await readFile(resolve(root,manifestPath),'utf8'));
  const replacements=new Map(pending.map(item=>[item.record.path,item.record]));
  latest.sources=latest.sources.map(source=>replacements.get(source.path)??source);
  await writeFile(resolve(root,manifestPath),JSON.stringify(latest,null,2)+'\n');
 }
 return {count:pending.length,bytes:pending.reduce((sum,item)=>sum+item.bytes.length,0),check};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),options={};
 for(let index=0;index<args.length;index++){
  if(args[index]==='--check')options.check=true;
  else if(args[index]==='--fetch')options.allowFetch=true;
  else if(args[index]==='--source-directory'&&args[index+1])options.sourceDirectory=resolve(args[++index]);
  else throw Error('Usage: node scripts/build-weapon-assets.mjs [--check] [--fetch] [--source-directory path]');
 }
 console.log(JSON.stringify(await buildWeaponAssets(options)));
}
