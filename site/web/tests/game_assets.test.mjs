import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {normalizeWeaponAsset} from '../scripts/build-weapon-assets.mjs';

const catalog=JSON.parse(readFileSync(new URL('../lib/game_assets.json',import.meta.url)));
const manifest=JSON.parse(readFileSync(new URL('../public/asset_sources.json',import.meta.url)));
const byPath=new Map(manifest.sources.map(source=>[source.path,source]));
const references=[
 ...Object.values(catalog.characters).flatMap(art=>[art.icon,art.splash,art.roster,...(art.rosterSource?[art.rosterSource]:[])]),
 ...Object.values(catalog.weapons).map(art=>art.icon),
 ...Object.values(catalog.artifacts).flatMap(art=>Object.values(art.slots)),
];

test('every Genshin display asset has verified HoYoWiki provenance and valid image content',async()=>{
 assert.equal(Object.keys(catalog.characters).length,47);
 assert.equal(Object.keys(catalog.weapons).length,33);
 assert.equal(Object.keys(catalog.artifacts).length,27);
 assert.equal(byPath.size,manifest.sources.length);
 assert.deepEqual(new Set(references),new Set(byPath.keys()));
 for(const source of manifest.sources){
  const url=new URL(source.url);
  assert.ok(['bbs.hoyolab.com','upload-static.hoyoverse.com','act-upload.hoyoverse.com','act-webstatic.hoyoverse.com'].includes(url.hostname),source.path);
  assert.equal(source.sourcePage,'https://wiki.hoyolab.com/pc/genshin/entry/'+source.officialEntryId);
  const bytes=readFileSync(new URL('../public'+source.path,import.meta.url));
  const info=await sharp(bytes).metadata();
  assert.equal(info.format,source.kind==='roster'?'webp':'png',source.path);
  assert.deepEqual([info.width,info.height],[source.width,source.height]);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,source.path);
  assert.match(source.rawSourceSha256,/^[a-f0-9]{64}$/);
 }
});

test('Genshin artifact images retain their actual set and equipment slot',()=>{
 for(const [name,art] of Object.entries(catalog.artifacts)){
  const hashes=[];
  for(const [slot,path] of Object.entries(art.slots)){
   const source=byPath.get(path);
   assert.equal(source.name,name);
   assert.equal(source.game_id,art.gameId);
   assert.equal(source.kind,slot);
   assert.ok(source.pieceName);
   hashes.push(source.sha256);
  }
  assert.equal(new Set(hashes).size,hashes.length,name+' must not reuse a set icon for different equipment slots');
 }
});

test('all 33 weapons retain their catalog identity and use verified complete HoYoWiki gallery art',async()=>{
 const sources=manifest.sources.filter(source=>source.category==='weapons');
 assert.equal(sources.length,33);
 assert.deepEqual(new Set(sources.map(source=>source.path)),new Set(Object.values(catalog.weapons).map(art=>art.icon)));
 for(const [name,art] of Object.entries(catalog.weapons)){
  const source=byPath.get(art.icon),crop=source.transform.crop;
  assert.equal(source.name,name);assert.equal(source.game_id,art.gameId);
  assert.equal(source.kind,'icon');assert.equal(source.assetType,'complete-weapon-illustration');
  assert.equal(source.sourceProvider,'HoYoWiki');
  assert.equal(source.sourceField,'modules.gallery_character.list[].img');
  assert.equal(source.gallery.componentId,'gallery_character');
  assert.equal(source.gallery.pageId,source.officialEntryId);
  assert.equal(source.gallery.imageUrl,source.url);
  assert.ok(source.gallery.label&&source.gallery.pageName);
  assert.ok(['zh-tw','en-us'].includes(source.sourceLanguage));
  assert.equal(source.sourcePage,'https://wiki.hoyolab.com/pc/genshin/entry/'+source.officialEntryId);
  assert.equal(source.rawSourceFormat,'png');
  assert.ok(Math.max(source.rawSourceWidth,source.rawSourceHeight)>256,name);
  assert.ok(source.rawSourceBytes>0,name);
  assert.match(source.rawSourceSha256,/^[a-f0-9]{64}$/);
  assert.equal(crop.sourceWidth,source.rawSourceWidth);assert.equal(crop.sourceHeight,source.rawSourceHeight);
  for(const key of ['x','y','width','height','sourceWidth','sourceHeight'])assert.ok(Number.isInteger(crop[key]),name+' '+key);
  assert.ok(crop.x>=0&&crop.y>=0&&crop.width>0&&crop.height>0,name);
  assert.ok(crop.x+crop.width<=crop.sourceWidth&&crop.y+crop.height<=crop.sourceHeight,name);
  assert.equal(source.transform.alphaThreshold,0);
  assert.equal(source.transform.withoutEnlargement,true);
  assert.equal(source.transform.alpha,'preserved');
  assert.equal(source.transform.outputFormat,'png');
  assert.equal(source.transform.maxSide,1200);
  assert.ok(source.transform.padding>0&&source.transform.padding<=16);
  assert.ok(Math.max(source.width,source.height)<=1200,name);
  const bytes=readFileSync(new URL('../public'+art.icon,import.meta.url)),info=await sharp(bytes).metadata();
  assert.equal(info.format,'png');assert.equal(info.hasAlpha,true);
  assert.deepEqual([info.width,info.height],[source.width,source.height]);
  assert.equal(bytes.length,source.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,name);
 }
});

test('weapon normalization trims only fully transparent margins and preserves faint and detached pixels',async()=>{
 const width=10,height=12,pixels=Buffer.alloc(width*height*4);
 const setPixel=(x,y,alpha)=>{const offset=(y*width+x)*4;pixels[offset]=80;pixels[offset+1]=140;pixels[offset+2]=200;pixels[offset+3]=alpha};
 for(let y=4;y<9;y++)for(let x=3;x<7;x++)setPixel(x,y,255);
 setPixel(1,2,1);
 for(const keepCanvas of [false,true]){
  if(keepCanvas){setPixel(0,0,1);setPixel(width-1,height-1,1)}
  const source=await sharp(pixels,{raw:{width,height,channels:4}}).png().toBuffer(),original=Buffer.from(source);
  const result=await normalizeWeaponAsset(source),crop=result.transform.crop,padding=result.transform.padding;
  assert.deepEqual(source,original);
  assert.deepEqual(crop,keepCanvas?{x:0,y:0,width:10,height:12,sourceWidth:10,sourceHeight:12}:{x:1,y:2,width:6,height:7,sourceWidth:10,sourceHeight:12});
  assert.deepEqual([result.width,result.height],[crop.width+2*padding,crop.height+2*padding]);
  const {data,info}=await sharp(result.bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const alpha=pixels[(y*width+x)*4+3],outside=x<crop.x||y<crop.y||x>=crop.x+crop.width||y>=crop.y+crop.height;
   if(outside)assert.equal(alpha,0,'A removed source pixel must be fully transparent');
   else assert.equal(data[((y-crop.y+padding)*info.width+x-crop.x+padding)*4+3],alpha,'Every retained alpha value must survive');
  }
  assert.equal(data[3],0,'Added padding remains transparent');
 }
});

test('weapon normalization limits the long side without enlarging small artwork',async()=>{
 const width=1300,height=20,pixels=Buffer.alloc(width*height*4);
 for(let y=5;y<15;y++)for(let x=0;x<width;x++)pixels[(y*width+x)*4+3]=255;
 const bytes=await sharp(pixels,{raw:{width,height,channels:4}}).png().toBuffer();
 const result=await normalizeWeaponAsset(bytes),info=await sharp(result.bytes).metadata();
 assert.equal(Math.max(result.width,result.height),1200);
 assert.deepEqual([info.width,info.height],[result.width,result.height]);
 assert.equal(info.hasAlpha,true);
 assert.ok(result.width<=result.transform.crop.width+2*result.transform.padding);
 assert.ok(result.height<=result.transform.crop.height+2*result.transform.padding);
});

test('Genshin roster uses native 3:4 illustration crops with complete source provenance',async()=>{
 const crops=JSON.parse(readFileSync(new URL('../lib/genshin_roster_crops.json',import.meta.url)));
 assert.deepEqual(Object.keys(crops).sort(),Object.keys(catalog.characters).sort());
 let totalBytes=0;
 for(const [id,art] of Object.entries(catalog.characters)){
  const crop=crops[id],source=byPath.get(crop.sourcePath),derived=byPath.get(art.roster);
  assert.equal(art.roster,`/assets/characters/${id}_roster.webp`);
  assert.equal(crop.sourcePath,art.rosterSource);
  assert.ok(['splash','rosterSource'].includes(source.kind),id);
  assert.ok(source.width>256&&source.height>256,id);
  assert.equal(crop.width*4,crop.height*3,id);
  assert.ok(crop.x>=0&&crop.y>=0&&crop.x+crop.width<=source.width&&crop.y+crop.height<=source.height,id);
  const bytes=readFileSync(new URL('../public'+art.roster,import.meta.url));
  const sourceBytes=readFileSync(new URL('../public'+crop.sourcePath,import.meta.url));
  const unit=Math.floor(Math.min(200,crop.width/3,crop.height/4));
  const info=await sharp(bytes).metadata();
  assert.deepEqual([info.width,info.height],[unit*3,unit*4],id);
  assert.equal(derived.sourceSha256,createHash('sha256').update(sourceBytes).digest('hex'),id);
  assert.equal(derived.derivedFrom,crop.sourcePath,id);
  assert.deepEqual(derived.crop,crop,id);
  assert.equal(derived.quality,92,id);
  assert.equal(derived.alphaQuality,100,id);
  totalBytes+=bytes.length;
 }
 assert.ok(totalBytes<7*1024*1024,'The complete Genshin roster must stay below 7 MiB');
 const dashboard=readFileSync(new URL('../app/dashboard.tsx',import.meta.url),'utf8');
 assert.match(dashboard,/characterImage\(x.id,'roster'\)/);
});

test('female Traveler keeps the verified avatar and uses female illustration art for the roster',()=>{
 const traveler=catalog.characters.traveler_cryo;
 assert.equal(traveler.gameId,10000007);
 for(const path of [traveler.icon]){
  const source=byPath.get(path);
  assert.equal(source.officialEntryId,'11609');
  assert.equal(source.assetType,'verified-female-traveler-avatar');
  assert.equal(source.rawSourceFormat,'gif');
  assert.equal(source.transform.frameIndex,1);
 }
 const illustration=byPath.get(traveler.rosterSource),roster=byPath.get(traveler.roster);
 assert.equal(illustration.kind,'rosterSource');
 assert.equal(illustration.game_id,10000007);
 assert.ok(illustration.width>256&&illustration.height>256);
 assert.equal(roster.sourcePath,traveler.rosterSource);
});

test('Genshin public display directories contain no untracked legacy-provider images',()=>{
 for(const category of ['characters','weapons','artifacts']){
  for(const file of readdirSync(new URL('../public/assets/'+category+'/',import.meta.url))){
   assert.ok(byPath.has('/assets/'+category+'/'+file),file);
  }
 }
});
