import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm,access,symlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {frameSize,imagePlacement,viewFromCrop,zoomView,clampView,assertValidView} from '../lib/artwork_math.mjs';
import {createDraftStore,DraftStoreError} from '../tools/artwork_editor/draft_store.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const initial={schemaVersion:1,revision:0,entries:{}};
const centered={zoom:1,offsetX:0,offsetY:0};
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} ≠ ${expected}`);
const errorWith=(status,code)=>error=>error instanceof DraftStoreError&&error.status===status&&(!code||error.code===code);

async function fixture(t,{width=100,height=100}={}){
 const root=await mkdtemp(path.join(os.tmpdir(),'hoyo-artwork-drafts-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(path.join(root,'public/assets/sources'),{recursive:true});
 await mkdir(path.join(root,'lib'));
 await mkdir(path.join(root,'data'));
 await writeFile(path.join(root,'lib/artwork_edits.json'),JSON.stringify(initial)+'\n');
 await writeFile(path.join(root,'data/account.json'),'unchanged account evidence\n');
 const bytes=await sharp({create:{width,height,channels:4,background:{r:255,g:0,b:0,alpha:1}}}).png().toBuffer();
 const source={path:'/assets/sources/verified.png',width,height,sha256:sha(bytes),
  sourcePage:'https://wiki.hoyolab.com/pc/zzz/entry/1',
  url:'https://act-upload.hoyoverse.com/wiki-test-source.png',sourceProvider:'HoYoWiki'};
 const sourceFile=path.join(root,'public',source.path.slice(1));
 await writeFile(sourceFile,bytes);
 const resolveSource=(game,role,id,sourcePath)=>
  ['genshin','zzz'].includes(game)&&['roster','portrait'].includes(role)&&['jane','ellen'].includes(id)&&sourcePath===source.path?{...source}:undefined;
 const store=createDraftStore({root,resolveSource});
 const input=(overrides={})=>({game:'zzz',role:'roster',id:'jane',sourcePath:source.path,sourceSha256:source.sha256,view:{...centered},expectedRevision:0,...overrides});
 return {root,source,sourceFile,bytes,resolveSource,store,input,
  jsonFile:path.join(root,'lib/artwork_edits.json'),
  outputFile:entry=>path.join(root,'public',entry.renderedPath.slice(1))};
}

async function pixel(bytes,x,y){
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 return Array.from(data.subarray((y*info.width+x)*info.channels,(y*info.width+x)*info.channels+4));
}

function assertRed(pixel){
 assert.ok(pixel[0]>230&&pixel[1]<25&&pixel[2]<25&&pixel[3]===255,`Expected opaque red, got ${pixel}`);
}

test('frame roles use fixed roster and square portrait dimensions',()=>{
 assert.deepEqual(frameSize('roster'),{width:600,height:800});
 assert.deepEqual(frameSize('portrait'),{width:900,height:900});
 assert.throws(()=>frameSize('unknown'),RangeError);
 const square=imagePlacement({width:100,height:100},centered,frameSize('portrait'));
 assert.deepEqual(square,{left:0,top:0,width:900,height:900});
});

test('crop conversion reconstructs the exact original crop for both roles',()=>{
 for(const [role,crop] of [
  ['roster',{x:100,y:200,w:300,h:400,sourceWidth:1200,sourceHeight:1600}],
  ['portrait',{x:-100,y:200,width:500,height:500,sourceWidth:1000,sourceHeight:2000}],
 ]){
  const frame=frameSize(role),view=viewFromCrop(crop,role);
  const placed=imagePlacement({width:crop.sourceWidth,height:crop.sourceHeight},view,frame);
  const scale=placed.width/crop.sourceWidth;
  close(-placed.left/scale,crop.x);
  close(-placed.top/scale,crop.y);
  close(frame.width/scale,crop.w??crop.width);
  close(frame.height/scale,crop.h??crop.height);
 }
 const crop={x:100,y:200,sourceWidth:1200,sourceHeight:1600};
 assert.deepEqual(viewFromCrop({...crop,w:300,h:400},'roster'),viewFromCrop({...crop,width:300,height:400},'roster'));
 assert.throws(()=>viewFromCrop({...crop,width:300,height:300},'roster'),RangeError);
 assert.throws(()=>viewFromCrop({...crop,x:NaN,width:300,height:400},'roster'),RangeError);
});

test('zoom preserves the source point under the selected frame anchor',()=>{
 const source={width:1200,height:1800},frame=frameSize('roster');
 const view={zoom:2,offsetX:0.2,offsetY:-0.15},anchor={x:0.2,y:0.85};
 const before=imagePlacement(source,view,frame);
 const sourceX=(anchor.x*frame.width-before.left)/before.width;
 const sourceY=(anchor.y*frame.height-before.top)/before.height;
 const next=zoomView(view,3.5,anchor.x,anchor.y);
 const after=imagePlacement(source,next,frame);
 close(after.left+sourceX*after.width,anchor.x*frame.width);
 close(after.top+sourceY*after.height,anchor.y*frame.height);
 assert.deepEqual(zoomView(centered,2),{zoom:2,offsetX:0,offsetY:0});
});

test('drag offsets are normalized by frame dimensions and do not change image scale',()=>{
 const frame=frameSize('roster'),source={width:400,height:800};
 const before=imagePlacement(source,centered,frame);
 const after=imagePlacement(source,{zoom:1,offsetX:0.1,offsetY:-0.25},frame);
 close(after.left-before.left,60);
 close(after.top-before.top,-200);
 assert.equal(after.width,before.width);
 assert.equal(after.height,before.height);
});

test('view validation rejects nonfinite and out-of-range input without coercion',()=>{
 for(const view of [null,[],{},
  {zoom:NaN,offsetX:0,offsetY:0},{zoom:Infinity,offsetX:0,offsetY:0},
  {zoom:'1',offsetX:0,offsetY:0},{zoom:0,offsetX:0,offsetY:0},
  {zoom:20.001,offsetX:0,offsetY:0},{zoom:1,offsetX:20.1,offsetY:0},
  {zoom:1,offsetX:0,offsetY:-Infinity}])assert.throws(()=>assertValidView(view),RangeError);
 assert.deepEqual(assertValidView({zoom:0.1,offsetX:-20,offsetY:20,ignored:true}),{zoom:0.1,offsetX:-20,offsetY:20});
 assert.deepEqual(clampView(),centered);
 assert.deepEqual(clampView({zoom:100,offsetX:-99,offsetY:NaN}),{zoom:20,offsetX:-20,offsetY:0});
 assert.throws(()=>imagePlacement({width:0,height:1},centered,frameSize('roster')),RangeError);
 assert.throws(()=>zoomView(centered,0),RangeError);
 assert.throws(()=>zoomView(centered,2,NaN,0.5),RangeError);
});

test('save persists verified provenance and a matching rendered WebP hash',async t=>{
 const f=await fixture(t);
 const {revision,entry}=await f.store.save(f.input({sourceWidth:9999,sourceHeight:9999}));
 assert.equal(revision,1);
 assert.equal(entry.revision,1);
 assert.equal(entry.key,'zzz/roster/jane');
 assert.equal(entry.sourceWidth,100);
 assert.equal(entry.sourceHeight,100);
 assert.equal(entry.sourceSha256,sha(f.bytes));
 assert.equal(entry.sourcePage,f.source.sourcePage);
 assert.equal(entry.sourceUrl,f.source.url);
 assert.equal(entry.sourceProvider,'HoYoWiki');
 assert.ok(Number.isFinite(Date.parse(entry.updatedAt)));
 const bytes=await readFile(f.outputFile(entry)),metadata=await sharp(bytes).metadata();
 assert.equal(metadata.format,'webp');
 assert.equal(metadata.width,600);
 assert.equal(metadata.height,800);
 assert.equal(metadata.hasAlpha,true);
 assert.equal(sha(bytes),entry.renderedSha256);
 assert.match(entry.renderedPath,new RegExp(`^/assets/artwork_edits/zzz/jane_roster-${entry.renderedSha256.slice(0,12)}\\.webp$`));
 const restarted=createDraftStore({root:f.root,resolveSource:f.resolveSource});
 assert.deepEqual(await restarted.load(),{schemaVersion:1,revision:1,entries:{[entry.key]:entry}});
 assert.equal(await readFile(path.join(f.root,'data/account.json'),'utf8'),'unchanged account evidence\n');
 assert.deepEqual(await readFile(f.sourceFile),f.bytes);
});

test('transparent zoom-out and negative-offset output follows the shared placement math',async t=>{
 const f=await fixture(t);
 const {entry}=await f.store.save(f.input({role:'portrait',view:{zoom:0.5,offsetX:-0.25,offsetY:0}}));
 assert.deepEqual(imagePlacement(f.source,entry.view,frameSize('portrait')),{left:0,top:225,width:450,height:450});
 const bytes=await readFile(f.outputFile(entry));
 assertRed(await pixel(bytes,100,300));
 assert.equal((await pixel(bytes,500,300))[3],0);
 assert.equal((await pixel(bytes,100,100))[3],0);
 const cropped=await f.store.save(f.input({role:'portrait',expectedRevision:1,view:{zoom:1,offsetX:-0.5,offsetY:0}}));
 const clipped=await readFile(f.outputFile(cropped.entry));
 assertRed(await pixel(clipped,100,450));
 assert.equal((await pixel(clipped,600,450))[3],0);
});

test('cancelled local edits only load and never write a draft or output',async t=>{
 const f=await fixture(t),before=await readFile(f.jsonFile);
 const local=await f.store.load();
 local.entries['zzz/roster/jane']={view:{zoom:5,offsetX:2,offsetY:1}};
 assert.deepEqual(await f.store.load(),initial);
 assert.deepEqual(await readFile(f.jsonFile),before);
 await assert.rejects(access(path.join(f.root,'public/assets/artwork_edits')),{code:'ENOENT'});
});

test('same-entry stale or concurrent writes conflict without overwriting the winner',async t=>{
 const f=await fixture(t);
 const other=createDraftStore({root:f.root,resolveSource:f.resolveSource});
 const results=await Promise.allSettled([
  f.store.save(f.input()),other.save(f.input({view:{zoom:2,offsetX:0,offsetY:0}})),
 ]);
 assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
 const rejected=results.find(result=>result.status==='rejected');
 assert.ok(errorWith(409,'revision_conflict')(rejected.reason));
 const before=await readFile(f.jsonFile);
 await assert.rejects(f.store.save(f.input()),errorWith(409,'revision_conflict'));
 assert.deepEqual(await readFile(f.jsonFile),before);
 const doc=await f.store.load();
 assert.equal(doc.revision,1);
 assert.equal(doc.entries['zzz/roster/jane'].revision,1);
});

test('different entries merge across simultaneous store instances and retain independent revisions',async t=>{
 const f=await fixture(t),other=createDraftStore({root:f.root,resolveSource:f.resolveSource});
 await Promise.all([
  f.store.save(f.input()),other.save(f.input({id:'ellen'})),
 ]);
 const doc=await other.load();
 assert.equal(doc.revision,2);
 assert.deepEqual(Object.keys(doc.entries).sort(),['zzz/roster/ellen','zzz/roster/jane']);
 assert.equal(doc.entries['zzz/roster/ellen'].revision,1);
 assert.equal(doc.entries['zzz/roster/jane'].revision,1);
 const next=await f.store.save(f.input({expectedRevision:1,view:{zoom:2,offsetX:0,offsetY:0}}));
 assert.equal(next.revision,3);
 assert.equal(next.entry.revision,2);
 assert.equal((await other.load()).entries['zzz/roster/ellen'].revision,1);
});

test('a subsequent save cleans only the unreferenced previous generated output',async t=>{
 const f=await fixture(t);
 const first=await f.store.save(f.input());
 const second=await f.store.save(f.input({expectedRevision:1,view:{zoom:0.5,offsetX:0,offsetY:0}}));
 assert.notEqual(second.entry.renderedPath,first.entry.renderedPath);
 await assert.rejects(access(f.outputFile(first.entry)),{code:'ENOENT'});
 await access(f.outputFile(second.entry));
 assert.deepEqual(await readFile(f.sourceFile),f.bytes);
 const names=await readdir(path.dirname(f.outputFile(second.entry)));
 assert.deepEqual(names,[path.basename(second.entry.renderedPath)]);
});

test('cleanup preserves a previous output referenced by another entry',async t=>{
 const f=await fixture(t),first=await f.store.save(f.input());
 await f.store.save(f.input({id:'ellen'}));
 const doc=await f.store.load();
 const key='zzz/roster/ellen';
 doc.entries[key]={...doc.entries[key],sourcePath:first.entry.renderedPath,
  sourceSha256:first.entry.renderedSha256,sourceWidth:first.entry.width,sourceHeight:first.entry.height};
 await writeFile(f.jsonFile,JSON.stringify(doc));
 await f.store.save(f.input({expectedRevision:1,view:{zoom:0.5,offsetX:0,offsetY:0}}));
 await access(f.outputFile(first.entry));
 assert.equal((await f.store.load()).entries[key].sourcePath,first.entry.renderedPath);
});

test('unapproved source, traversal and mismatched client SHA are rejected before saving',async t=>{
 const f=await fixture(t),before=await readFile(f.jsonFile);
 for(const sourcePath of ['/assets/sources/unknown.png','/assets/sources/../verified.png','https://example.com/a.png']){
  await assert.rejects(f.store.save(f.input({sourcePath})),errorWith(422,'invalid_source'));
 }
 await assert.rejects(f.store.save(f.input({sourceSha256:'0'.repeat(64)})),errorWith(422,'source_hash_mismatch'));
 assert.deepEqual(await readFile(f.jsonFile),before);
 await assert.rejects(access(path.join(f.root,'public/assets/artwork_edits')),{code:'ENOENT'});
});

test('actual source bytes and dimensions are checked independently of registry metadata',async t=>{
 const f=await fixture(t),before=await readFile(f.jsonFile);
 await writeFile(f.sourceFile,Buffer.from('changed source'));
 await assert.rejects(f.store.save(f.input()),errorWith(422,'source_hash_mismatch'));
 await writeFile(f.sourceFile,f.bytes);
 f.source.width=101;
 await assert.rejects(f.store.save(f.input()),errorWith(422,'source_dimensions_mismatch'));
 assert.deepEqual(await readFile(f.jsonFile),before);
});

test('known-looking source paths cannot resolve outside public or inject vector content',async t=>{
 const f=await fixture(t),outside=path.join(f.root,'outside.png');
 await writeFile(outside,f.bytes);
 const link='/assets/sources/link.png';
 await symlink(outside,path.join(f.root,'public',link.slice(1)));
 const linked=createDraftStore({root:f.root,resolveSource:()=>({...f.source,path:link})});
 await assert.rejects(linked.save(f.input({sourcePath:link})),errorWith(422,'invalid_source'));
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100"/></svg>');
 await writeFile(f.sourceFile,svg);
 f.source.sha256=sha(svg);
 await assert.rejects(f.store.save(f.input()),errorWith(422,'source_dimensions_mismatch'));
});

test('invalid numeric or identity payloads never create output',async t=>{
 const f=await fixture(t),before=await readFile(f.jsonFile);
 for(const view of [
  {...centered,zoom:NaN},{...centered,zoom:Infinity},{...centered,zoom:'2'},
  {...centered,zoom:0.099},{...centered,offsetX:20.01},{...centered,offsetY:-20.01},
 ])await assert.rejects(f.store.save(f.input({view})),errorWith(422,'invalid_view'));
 for(const expectedRevision of [-1,0.1,'0',NaN]){
  await assert.rejects(f.store.save(f.input({expectedRevision})),errorWith(422,'invalid_revision'));
 }
 await assert.rejects(f.store.save(f.input({id:'../jane'})),errorWith(422,'invalid_identity'));
 await assert.rejects(f.store.save(null),errorWith(422,'invalid_input'));
 assert.deepEqual(await readFile(f.jsonFile),before);
 await assert.rejects(access(path.join(f.root,'public/assets/artwork_edits')),{code:'ENOENT'});
});

test('malformed JSON and invalid schema are preserved instead of reset',async t=>{
 const f=await fixture(t);
 for(const text of ['{','{"schemaVersion":2,"revision":0,"entries":{}}','{"schemaVersion":1,"revision":0,"entries":{"bad":{}}}']){
  await writeFile(f.jsonFile,text);
  await assert.rejects(f.store.load(),errorWith(422,'invalid_document'));
  await assert.rejects(f.store.save(f.input()),errorWith(422,'invalid_document'));
  assert.equal(await readFile(f.jsonFile,'utf8'),text);
 }
});

test('store refuses symlinked JSON and output directories without changing their targets',async t=>{
 const f=await fixture(t),target=path.join(f.root,'preserved.json');
 const bytes=await readFile(f.jsonFile);
 await writeFile(target,bytes);
 await rm(f.jsonFile);
 await symlink(target,f.jsonFile);
 await assert.rejects(f.store.save(f.input()),errorWith(422,'invalid_document'));
 assert.deepEqual(await readFile(target),bytes);
 await rm(f.jsonFile);
 await writeFile(f.jsonFile,bytes);
 const output=path.join(f.root,'outside-output');
 await mkdir(output);
 await symlink(output,path.join(f.root,'public/assets/artwork_edits'));
 await assert.rejects(f.store.save(f.input()),errorWith(422,'unsafe_storage_path'));
 assert.deepEqual(await readdir(output),[]);
 assert.deepEqual(await readFile(f.jsonFile),bytes);
});


test('load rejects foreign output paths, wrong hash suffixes and impossible entry revisions',async t=>{
 const f=await fixture(t),{entry}=await f.store.save(f.input());
 const original=await f.store.load();
 for(const patch of [
  {renderedPath:'/assets/sources/verified.png'},
  {renderedPath:`/assets/artwork_edits/zzz/ellen_roster-${entry.renderedSha256.slice(0,12)}.webp`},
  {renderedPath:`/assets/artwork_edits/zzz/jane_roster-${'0'.repeat(12)}.webp`},
  {renderedPath:`/assets/artwork_edits/zzz/../jane_roster-${entry.renderedSha256.slice(0,12)}.webp`},
  {revision:original.revision+1},{sourcePage:''},{sourceUrl:''},
 ]){
  const doc=structuredClone(original);
  Object.assign(doc.entries[entry.key],patch);
  const text=JSON.stringify(doc);
  await writeFile(f.jsonFile,text);
  await assert.rejects(f.store.load(),errorWith(422,'invalid_document'));
  assert.equal(await readFile(f.jsonFile,'utf8'),text);
 }
});
