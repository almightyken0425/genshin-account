import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm,rename,symlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {checkArtworkEdits} from '../scripts/check-artwork-edits.mjs';
import {createArtworkRegistry} from '../tools/artwork_editor/registry.mjs';
import {createDraftStore} from '../tools/artwork_editor/draft_store.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=(file,value)=>writeFile(file,JSON.stringify(value)+'\n');
const solid=(width,height,color='red',format='png')=>sharp({create:{width,height,channels:4,background:color}})[format]().toBuffer();

async function fixture(t,{empty=false}={}){
 const root=await mkdtemp(path.join(os.tmpdir(),'hoyo-check-artwork-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(path.join(root,'lib'));
 const docFile=path.join(root,'lib/artwork_edits.json');
 await json(docFile,{schemaVersion:1,revision:0,entries:{}});
 if(empty)return {root,docFile};
 await mkdir(path.join(root,'public/assets/sources'),{recursive:true});
 const bytes=await solid(120,160),sourcePath='/assets/sources/jane.png';
 const source={path:sourcePath,width:120,height:160,sha256:sha(bytes),
  sourcePage:'https://wiki.hoyolab.com/pc/zzz/entry/1',url:'https://act-upload.hoyoverse.com/wiki-test.png'};
 const sourceFile=path.join(root,'public',sourcePath.slice(1));
 const manifestFile=path.join(root,'public/zzz_asset_sources.json');
 await writeFile(sourceFile,bytes);
 await Promise.all([
  json(path.join(root,'lib/game_assets.json'),{characters:{}}),
  json(path.join(root,'lib/zzz_assets.json'),{characters:{jane:{roster:sourcePath,splash:sourcePath}}}),
  json(path.join(root,'lib/genshin_roster_crops.json'),{}),
  json(path.join(root,'lib/zzz_roster_crops.json'),{jane:{x:0,y:0,width:120,height:160,sourceWidth:120,sourceHeight:160,sourcePath}}),
  json(path.join(root,'public/asset_sources.json'),{sources:[]}),
  json(manifestFile,{sources:[source]}),
 ]);
 const registry=await createArtworkRegistry({root,accountRoot:root});
 const store=createDraftStore({root,resolveSource:registry.resolveSource});
 const {entry}=await store.save({game:'zzz',role:'roster',id:'jane',sourcePath,sourceSha256:source.sha256,
  view:{zoom:1,offsetX:0,offsetY:0},expectedRevision:0});
 return {root,docFile,source,sourceFile,manifestFile,entry,
  outputFile:path.join(root,'public',entry.renderedPath.slice(1))};
}

async function snapshot(root){
 const files={};
 async function walk(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
   const file=path.join(directory,entry.name);
   if(entry.isDirectory())await walk(file);
   else files[path.relative(root,file)]=sha(await readFile(file));
  }
 }
 await walk(root);
 return files;
}

async function replaceOutput(f,bytes){
 const doc=JSON.parse(await readFile(f.docFile,'utf8')),entry=doc.entries[f.entry.key];
 entry.renderedSha256=sha(bytes);
 entry.renderedPath=`/assets/artwork_edits/zzz/jane_roster-${entry.renderedSha256.slice(0,12)}.webp`;
 const file=path.join(f.root,'public',entry.renderedPath.slice(1));
 await writeFile(f.outputFile,bytes);
 if(file!==f.outputFile)await rename(f.outputFile,file);
 await json(f.docFile,doc);
 return file;
}

test('empty drafts pass without registry, assets or account files',async t=>{
 const f=await fixture(t,{empty:true}),before=await snapshot(f.root);
 assert.deepEqual(await checkArtworkEdits({root:f.root}),{revision:0,checked:0});
 assert.deepEqual(await snapshot(f.root),before);
});

test('valid drafts verify through the real registry without any filesystem changes or account reads',async t=>{
 const f=await fixture(t),before=await snapshot(f.root);
 assert.deepEqual(await checkArtworkEdits({root:f.root}),{revision:1,checked:1});
 assert.deepEqual(await snapshot(f.root),before);
 assert.ok(!Object.keys(before).some(file=>file.startsWith('data/')));
});

test('drafts with a source removed from the character registry fail',async t=>{
 const f=await fixture(t);
 await json(path.join(f.root,'lib/zzz_assets.json'),{characters:{}});
 const before=await snapshot(f.root);
 await assert.rejects(checkArtworkEdits({root:f.root}),/zzz\/roster\/jane/);
 assert.deepEqual(await snapshot(f.root),before);
});

test('changed registry SHA or provenance fails without altering the draft',async t=>{
 const f=await fixture(t),draft=await readFile(f.docFile);
 for(const patch of [{sha256:'0'.repeat(64)},{url:'https://act-upload.hoyoverse.com/changed.png'}]){
  await json(f.manifestFile,{sources:[{...f.source,...patch}]});
  await assert.rejects(checkArtworkEdits({root:f.root}),/registry/);
  assert.deepEqual(await readFile(f.docFile),draft);
 }
});

test('actual source SHA and dimensions are independently verified',async t=>{
 const f=await fixture(t);
 await writeFile(f.sourceFile,await solid(120,160,'blue'));
 await assert.rejects(checkArtworkEdits({root:f.root}),/來源圖片 SHA-256/);
 const resized=await solid(120,159);
 await writeFile(f.sourceFile,resized);
 const doc=JSON.parse(await readFile(f.docFile,'utf8'));
 doc.entries[f.entry.key].sourceSha256=sha(resized);
 await json(f.docFile,doc);
 await json(f.manifestFile,{sources:[{...f.source,sha256:sha(resized)}]});
 await assert.rejects(checkArtworkEdits({root:f.root}),/來源圖片實際尺寸/);
});

test('rendered bytes must match their recorded full SHA',async t=>{
 const f=await fixture(t),draft=await readFile(f.docFile);
 await writeFile(f.outputFile,await solid(600,800,'blue','webp'));
 await assert.rejects(checkArtworkEdits({root:f.root}),/輸出圖片 SHA-256/);
 assert.deepEqual(await readFile(f.docFile),draft);
});

test('a matching output hash cannot conceal wrong dimensions or a PNG named WebP',async t=>{
 for(const bytes of [await solid(500,500,'red','webp'),await solid(600,800,'red','png')]){
  const f=await fixture(t);
  await replaceOutput(f,bytes);
  const before=await snapshot(f.root);
  await assert.rejects(checkArtworkEdits({root:f.root}),/輸出圖片格式或畫框尺寸/);
  assert.deepEqual(await snapshot(f.root),before);
 }
});

test('foreign or wrong-hash output filenames are rejected by structural draft loading',async t=>{
 const f=await fixture(t),original=JSON.parse(await readFile(f.docFile,'utf8'));
 for(const renderedPath of ['/assets/sources/jane.png','/assets/artwork_edits/zzz/jane_roster-000000000000.webp']){
  const doc=structuredClone(original);
  doc.entries[f.entry.key].renderedPath=renderedPath;
  await json(f.docFile,doc);
  const bytes=await readFile(f.docFile);
  await assert.rejects(checkArtworkEdits({root:f.root}),/圖片編輯稿內容損壞/);
  assert.deepEqual(await readFile(f.docFile),bytes);
 }
});

test('missing output and symlinked output fail without repairing or rewriting files',async t=>{
 const f=await fixture(t),bytes=await readFile(f.outputFile),draft=await readFile(f.docFile);
 await rm(f.outputFile);
 await assert.rejects(checkArtworkEdits({root:f.root}),/ENOENT/);
 const target=path.join(f.root,'preserved.webp');
 await writeFile(target,bytes);
 await symlink(target,f.outputFile);
 await assert.rejects(checkArtworkEdits({root:f.root}),/符號連結/);
 assert.deepEqual(await readFile(target),bytes);
 assert.deepEqual(await readFile(f.docFile),draft);
});
