import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync(new URL('../lib/zzz_assets.json',import.meta.url)));
const manifest=JSON.parse(readFileSync(new URL('../public/zzz_asset_sources.json',import.meta.url)));
const pngSize=bytes=>{
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
};
function webpSize(bytes){
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 for(let offset=12;offset+8<=bytes.length;){
  const kind=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),start=offset+8;
  assert.ok(start+size<=bytes.length,'WebP chunk must be complete');
  if(kind==='VP8X')return [bytes.readUIntLE(start+4,3)+1,bytes.readUIntLE(start+7,3)+1];
  if(kind==='VP8 ')return [bytes.readUInt16LE(start+6)&0x3fff,bytes.readUInt16LE(start+8)&0x3fff];
  if(kind==='VP8L'){
   assert.equal(bytes[start],0x2f);const bits=bytes.readUInt32LE(start+1);
   return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1];
  }
  offset=start+size+(size%2);
 }
 assert.fail('WebP image dimensions are missing');
}
test('all 38 entry icons and full illustrations come from verified HoYoWiki character pages',()=>{
 assert.equal(Object.keys(catalog.characters).length,38);
 for(const [id,art] of Object.entries(catalog.characters)){
  assert.notEqual(art.icon,art.splash,id);
  for(const kind of ['icon','splash']){
   const source=manifest.sources.find(item=>item.path===art[kind]);
   assert.equal(source?.characterId,id);
   assert.equal(source?.kind,kind);
   assert.equal(source?.sourceProvider,'HoYoWiki');
   assert.deepEqual(pngSize(readFileSync(new URL('../public'+art[kind],import.meta.url))),[source.width,source.height]);
  }
  const splash=manifest.sources.find(item=>item.path===art.splash);
  assert.equal(splash.artworkKind,'full-body',id);
  assert.equal(splash.defaultAppearance,true,id);
 }
});
test('all 38 rectangular roster crops use verified Wiki artwork with valid 3:4 framing',()=>{
 const crops=JSON.parse(readFileSync(new URL('../lib/zzz_roster_crops.json',import.meta.url)));
 assert.deepEqual(Object.keys(crops).sort(),Object.keys(catalog.characters).sort());
 for(const [id,crop] of Object.entries(crops)){
  const src=crop.sourcePath;
  const source=manifest.sources.find(item=>item.path===src);
  assert.ok([catalog.characters[id].rosterSource,catalog.characters[id].splash].includes(src),id);
  assert.ok(['rosterSource','splash'].includes(source?.kind),id);
  assert.equal(source.sourceProvider,'HoYoWiki',id);
  assert.ok(['profile-header','full-body'].includes(source.artworkKind),id);
  assert.deepEqual(pngSize(readFileSync(new URL('../public'+src,import.meta.url))),[crop.sourceWidth,crop.sourceHeight],id);
  assert.ok(['x','y','width','height','sourceWidth','sourceHeight'].every(key=>Number.isInteger(crop[key])),id);
  assert.ok(crop.x>=0&&crop.y>=0&&crop.width>0&&crop.height>0,id);
  assert.equal(crop.width*4,crop.height*3,id);
  assert.ok(crop.x+crop.width<=crop.sourceWidth&&crop.y+crop.height<=crop.sourceHeight,id);
 }
});
test('all 38 roster thumbnails match their crop and source while staying within the download budget',()=>{
 const crops=JSON.parse(readFileSync(new URL('../lib/zzz_roster_crops.json',import.meta.url)));
 assert.equal(manifest.sources.filter(item=>item.kind==='roster').length,38);
 let totalBytes=0;
 for(const [id,art] of Object.entries(catalog.characters)){
  assert.equal(art.roster,`/assets/zzz/characters/${id}_roster.webp`);
  assert.notEqual(art.roster,art.splash);
  const bytes=readFileSync(new URL('../public'+art.roster,import.meta.url));
  const sourceBytes=readFileSync(new URL('../public'+crops[id].sourcePath,import.meta.url));
  const derived=manifest.sources.find(item=>item.path===art.roster);
  assert.equal(derived?.kind,'roster',id);
  assert.equal(derived.sourcePath,crops[id].sourcePath,id);
  assert.equal(derived.derivedFrom,crops[id].sourcePath,id);
  assert.equal(derived.sourceSha256,createHash('sha256').update(sourceBytes).digest('hex'),id);
  assert.deepEqual(derived.crop,crops[id],id);
  const unit=Math.floor(Math.min(200,crops[id].width/3,crops[id].height/4));
  assert.deepEqual(webpSize(bytes),[unit*3,unit*4],id);
  assert.deepEqual([derived.width,derived.height],[unit*3,unit*4],id);
  assert.equal(derived.format,'webp',id);assert.equal(derived.quality,92,id);
  assert.equal(derived.bytes,bytes.length,id);
  assert.ok(bytes.length<sourceBytes.length,`${id} thumbnail must be smaller than its source`);
  totalBytes+=bytes.length;
 }
 assert.ok(totalBytes<6*1024*1024,'The complete ZZZ roster must stay below 6 MiB');
});
test('ZZZ artwork provenance is local, complete and hash verified',()=>{
 assert.equal(manifest.sources.filter(item=>item.kind==='icon').length,38);
 const paths=new Set(manifest.sources.map(item=>item.path));
 assert.equal(paths.size,manifest.sources.length);
 const active=new Set([...Object.values(catalog.characters).flatMap(art=>Object.values(art)),...Object.values(catalog.engines),...Object.values(catalog.discs)]);
 assert.deepEqual([...paths].sort(),[...active].sort());
 const assetRoot=new URL('../public/assets/zzz/',import.meta.url);
 const files=readdirSync(assetRoot,{recursive:true}).map(name=>name.replaceAll('\\','/')).filter(name=>statSync(new URL(name,assetRoot)).isFile()).map(name=>'/assets/zzz/'+name);
 assert.deepEqual(files.sort(),[...paths].sort(),'Every retained public asset must have a current Wiki source');
 for(const item of manifest.sources){
  assert.match(item.path,/^\/assets\/zzz\//);
  assert.equal(item.sourceProvider,'HoYoWiki');
  assert.match(item.officialEntryId,/^\d+$/);
  assert.equal(item.sourcePage,'https://wiki.hoyolab.com/pc/zzz/entry/'+item.officialEntryId);
  assert.match(item.url,/^https:\/\/(?:act-upload|act-webstatic)\.hoyoverse\.com\/event-(?:ugc-hoyowiki|static-hoyowiki-admin)\//);
  assert.match(item.rawSourceSha256,/^[a-f0-9]{64}$/);
  assert.equal(createHash('sha256').update(readFileSync(new URL('../public'+item.path,import.meta.url))).digest('hex'),item.sha256);
 }
});
test('equipment framing covers every engine and disc without extending beyond original pixels',()=>{
 const frames=JSON.parse(readFileSync(new URL('../lib/zzz_asset_frames.json',import.meta.url)));
 const equipment=[...Object.values(catalog.engines),...Object.values(catalog.discs)];
 assert.equal(Object.keys(frames).length,equipment.length);
 for(const src of equipment){
  const frame=frames[src];assert.ok(frame,src);
  assert.deepEqual(pngSize(readFileSync(new URL('../public'+src,import.meta.url))),[frame.width,frame.height]);
  const [left,top,right,bottom]=frame.bounds;
  assert.ok(left>=0&&top>=0&&right<=frame.width&&bottom<=frame.height,src);
  assert.ok(right>left&&bottom>top,src);
 }
});
test('display portraits do not fall back to video crops and preserve evidence API',()=>{
 const dashboard=readFileSync(new URL('../app/zzz_dashboard.tsx',import.meta.url),'utf8');
 assert.match(dashboard,/zzzRosterImage/);assert.ok(!dashboard.includes('/api/zzz/image'));
 const evidence=readFileSync(new URL('../lib/github.mjs',import.meta.url),'utf8');assert.match(evidence,/portraitSha256/);
});
