import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const catalog=JSON.parse(readFileSync(new URL('../lib/game_assets.json',import.meta.url)));
const manifest=JSON.parse(readFileSync(new URL('../public/asset_sources.json',import.meta.url)));
const account=JSON.parse(readFileSync(new URL('./fixtures/current_genshin_account.json',import.meta.url)));
const byPath=new Map(manifest.sources.map(source=>[source.path,source]));
const references=[
 ...Object.values(catalog.characters).flatMap(art=>[art.icon,art.splash,art.roster,...(art.rosterSource?[art.rosterSource]:[])]),
 ...Object.values(catalog.weapons).map(art=>art.icon),
 ...Object.values(catalog.artifacts).flatMap(art=>Object.values(art.slots)),
];
// Originals are allowed only when reached from an actual display asset's derivation.
for(let index=0;index<references.length;index++){
 const source=byPath.get(references[index]);
 for(const dependency of [source?.derivedFrom,source?.sourcePath]){
  if(typeof dependency==='string'&&dependency.startsWith('/assets/')&&!references.includes(dependency))references.push(dependency);
 }
}

test('every Genshin display asset has verified HoYoWiki provenance and valid image content',async()=>{
 for(const character of account.characters){
  assert.ok(catalog.characters[character.id],character.name+' must have display art');
  assert.ok([4,5].includes(catalog.characters[character.id].rarity),character.name+' must have official rarity');
 }
 for(const weapon of account.weapons)assert.ok(catalog.weapons[weapon.name],weapon.name+' must have an icon');
 for(const artifact of account.artifacts)assert.ok(catalog.artifacts[artifact.set_name]?.slots[artifact.slot],artifact.name+' must have the correct set/slot image');
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

test('all displayed weapons retain verified HoYoWiki square icons without gallery normalization',async()=>{
 const sources=manifest.sources.filter(source=>source.category==='weapons');
 assert.equal(sources.length,Object.keys(catalog.weapons).length);
 assert.deepEqual(new Set(sources.map(source=>source.path)),new Set(Object.values(catalog.weapons).map(art=>art.icon)));
 for(const [name,art] of Object.entries(catalog.weapons)){
  const source=byPath.get(art.icon);
  assert.equal(source.name,name);assert.equal(source.game_id,art.gameId);
  assert.equal(source.kind,'icon');assert.ok(['bbs.hoyolab.com','act-webstatic.hoyoverse.com','upload-static.hoyoverse.com'].includes(new URL(source.url).hostname));
  assert.equal(source.sourcePage,'https://wiki.hoyolab.com/pc/genshin/entry/'+source.officialEntryId);
  assert.equal(source.transform.type,'none');assert.equal(source.rawSourceFormat,'png');
  assert.equal(source.rawSourceSha256,source.sha256);
  assert.deepEqual([source.width,source.height],[256,256]);
  const bytes=readFileSync(new URL('../public'+art.icon,import.meta.url)),info=await sharp(bytes).metadata();
  assert.equal(info.format,'png');assert.equal(info.hasAlpha,true);
  assert.deepEqual([info.width,info.height],[source.width,source.height]);
  assert.equal(bytes.length,source.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,name);
 }
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
 assert.ok(totalBytes<Object.keys(catalog.characters).length*160*1024,'The complete Genshin roster must average less than 160 KiB per character');
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

test('Manekin and Manekina use separate native illustration regions with the shared original retained',async()=>{
 const ids=['hoyolab_character_10000117','hoyolab_character_10000118'];
 const portraits=ids.map(id=>catalog.characters[id]);
 assert.equal(portraits[0].originalSource,portraits[1].originalSource);
 const original=byPath.get(portraits[0].originalSource);
 const originalBytes=readFileSync(new URL('../public'+original.path,import.meta.url));
 const regions=[];
 for(const portrait of portraits){
  const source=byPath.get(portrait.splash),crop=source.transform.crop;
  assert.equal(source.sourceLanguage,'en-us');
  assert.equal(source.derivedFrom,original.path);
  assert.equal(source.rawSourceSha256,original.sha256);
  assert.equal(source.transform.withoutEnlargement,true);
  const expected=await sharp(originalBytes).extract({left:crop.x,top:crop.y,width:crop.width,height:crop.height}).png().toBuffer();
  assert.equal(createHash('sha256').update(expected).digest('hex'),source.sha256);
  regions.push(crop);
 }
 assert.notEqual(byPath.get(portraits[0].splash).sha256,byPath.get(portraits[1].splash).sha256);
 assert.ok(regions[1].x+regions[1].width<=regions[0].x,'the individual crops must not reuse the same area');
});

test('Genshin public display directories contain no untracked legacy-provider images',()=>{
 for(const category of ['characters','weapons','artifacts']){
  for(const file of readdirSync(new URL('../public/assets/'+category+'/',import.meta.url))){
   assert.ok(byPath.has('/assets/'+category+'/'+file),file);
  }
 }
});
