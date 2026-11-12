import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {validateRosterCrop,renderRosterCrop,buildRosterAssets} from '../scripts/build-roster-assets.mjs';

const dimensions={width:30,height:40};
const crop={x:3,y:4,width:24,height:32,sourceWidth:30,sourceHeight:40};
const fixtureRoots=[];
after(async()=>{for(const root of fixtureRoots)await rm(root,{recursive:true,force:true})});

const fixtureGames=[
 {id:'genshin',catalog:'lib/game_assets.json',manifest:'public/asset_sources.json',crops:'lib/genshin_roster_crops.json',directory:'/assets/characters/',kind:'splash'},
 {id:'zzz',catalog:'lib/zzz_assets.json',manifest:'public/zzz_asset_sources.json',crops:'lib/zzz_roster_crops.json',directory:'/assets/zzz/characters/',kind:'rosterSource'},
];

async function writeFixtureJson(root,path,value){
 const file=join(root,path);
 await mkdir(dirname(file),{recursive:true});
 await writeFile(file,JSON.stringify(value,null,2)+'\n');
}

async function buildFixture(){
 const root=await mkdtemp(join(tmpdir(),'hoyo-roster-integration-'));
 fixtureRoots.push(root);
 const {bytes}=await pngFixture(300,400);
 for(const game of fixtureGames){
  const sourcePath=game.directory+'sample_source.png';
  const file=join(root,'public'+sourcePath);
  await mkdir(dirname(file),{recursive:true});
  await writeFile(file,bytes);
  await writeFixtureJson(root,game.catalog,{characters:{sample:{icon:game.directory+'sample_icon.png',[game.kind]:sourcePath}}});
  await writeFixtureJson(root,game.manifest,{sources:[{
   path:sourcePath,kind:game.kind,width:300,height:400,sourceProvider:'HoYoWiki',officialEntryId:'1',
   sourcePage:`https://wiki.hoyolab.com/pc/${game.id}/entry/1`,sha256:createHash('sha256').update(bytes).digest('hex'),
  }]});
  await writeFixtureJson(root,game.crops,{sample:{sourcePath,x:0,y:0,width:300,height:400,sourceWidth:300,sourceHeight:400}});
 }
 return root;
}

async function pngFixture(width,height){
 const pixels=Buffer.alloc(width*height*4);
 const alphaLevels=[0,64,128,255];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const offset=(y*width+x)*4;
  pixels[offset]=40+x%180;
  pixels[offset+1]=80+y%140;
  pixels[offset+2]=160;
  pixels[offset+3]=alphaLevels[Math.min(3,Math.floor(x/width*4))];
 }
 const bytes=await sharp(pixels,{raw:{width,height,channels:4}}).png().toBuffer();
 return {bytes,pixels};
}

test('roster crop accepts exact 3:4 framing at image edges',()=>{
 assert.deepEqual(validateRosterCrop({...crop,x:6,y:8},dimensions),{width:24,height:32});
 assert.deepEqual(validateRosterCrop({x:0,y:0,width:3,height:4,sourceWidth:3,sourceHeight:4},{width:3,height:4}),{width:3,height:4});
});

test('roster crop rejects coordinates outside the original image',()=>{
 for(const invalid of [{x:-1},{y:-1},{x:7},{y:9},{width:0,height:0},{width:-3,height:-4}]){
  assert.throws(()=>validateRosterCrop({...crop,...invalid},dimensions),JSON.stringify(invalid));
 }
});

test('roster crop rejects source dimensions that disagree with the actual image',()=>{
 for(const invalid of [{sourceWidth:31},{sourceHeight:41}]){
  assert.throws(()=>validateRosterCrop({...crop,...invalid},dimensions),/source dimensions do not match/);
 }
});

test('roster crop rejects framing that is not exactly 3:4',()=>{
 for(const invalid of [{width:25},{height:31},{width:32,height:24}]){
  assert.throws(()=>validateRosterCrop({...crop,...invalid},dimensions),/exactly 3:4/);
 }
});

test('roster crop rejects fractional, nonnumeric and nonfinite values in every numeric field',()=>{
 for(const field of ['x','y','width','height','sourceWidth','sourceHeight']){
  for(const value of [1.5,'24',NaN,Infinity,undefined]){
   assert.throws(()=>validateRosterCrop({...crop,[field]:value},dimensions),/must be integers/,field+' '+String(value));
  }
 }
});

test('rendering keeps small crops at their original size and verifies decoded source dimensions',async()=>{
 const {bytes}=await pngFixture(12,16);
 const small={x:3,y:4,width:6,height:8,sourceWidth:12,sourceHeight:16};
 const result=await renderRosterCrop(bytes,small);
 const metadata=await sharp(result.bytes).metadata();
 assert.equal(metadata.format,'webp');
 assert.deepEqual([result.width,result.height,metadata.width,metadata.height],[6,8,6,8]);
 await assert.rejects(renderRosterCrop(bytes,{...small,sourceWidth:13}),/source dimensions do not match/);
});

test('rendering downsamples large crops to a maximum of 600 by 800',async()=>{
 const {bytes}=await pngFixture(603,804);
 const result=await renderRosterCrop(bytes,{x:0,y:0,width:603,height:804,sourceWidth:603,sourceHeight:804});
 const metadata=await sharp(result.bytes).metadata();
 assert.deepEqual([result.width,result.height,metadata.width,metadata.height],[600,800,600,800]);
});

test('rendering preserves transparent and semitransparent alpha without changing source bytes',async()=>{
 const {bytes,pixels}=await pngFixture(24,32);
 const original=Buffer.from(bytes);
 const region={x:3,y:4,width:18,height:24,sourceWidth:24,sourceHeight:32};
 const result=await renderRosterCrop(bytes,region);
 const {data,info}=await sharp(result.bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.deepEqual(bytes,original);
 assert.equal(info.channels,4);
 const expectedAlpha=[],actualAlpha=[];
 for(let y=0;y<region.height;y++)for(let x=0;x<region.width;x++){
  expectedAlpha.push(pixels[((y+region.y)*24+x+region.x)*4+3]);
  actualAlpha.push(data[(y*info.width+x)*info.channels+3]);
 }
 assert.deepEqual([...new Set(expectedAlpha)],[0,64,128,255]);
 assert.deepEqual(actualAlpha,expectedAlpha);
});

test('build check rejects catalog references redirected from generated rosters to icons in either game',async()=>{
 const root=await buildFixture();
 assert.equal((await buildRosterAssets({root})).count,2);
 const checked=await buildRosterAssets({root,check:true});
 assert.equal(checked.check,true);
 assert.equal(checked.count,2);
 for(const game of fixtureGames){
  const catalog=JSON.parse(await readFile(join(root,game.catalog),'utf8'));
  const expected=catalog.characters.sample.roster;
  catalog.characters.sample.roster=catalog.characters.sample.icon;
  await writeFixtureJson(root,game.catalog,catalog);
  await assert.rejects(buildRosterAssets({root,check:true}),/catalog roster reference differs/,game.id);
  assert.equal(JSON.parse(await readFile(join(root,game.catalog),'utf8')).characters.sample.roster,catalog.characters.sample.icon);
  catalog.characters.sample.roster=expected;
  await writeFixtureJson(root,game.catalog,catalog);
 }
});

test('build check rejects changed derived provenance and nested transforms in either game',async()=>{
 const root=await buildFixture();
 await buildRosterAssets({root});
 assert.equal((await buildRosterAssets({root,check:true})).count,2);
 for(const game of fixtureGames){
  const file=join(root,game.manifest),original=await readFile(file,'utf8');
  for(const field of ['derivedFrom','transform']){
   const manifest=JSON.parse(original);
   const derived=manifest.sources.find(source=>source.kind==='roster');
   if(field==='derivedFrom')derived.derivedFrom=game.directory+'sample_icon.png';
   else derived.transform.withoutEnlargement=false;
   await writeFixtureJson(root,game.manifest,manifest);
   await assert.rejects(buildRosterAssets({root,check:true}),/complete derived record/,game.id+' '+field);
   await writeFile(file,original);
  }
 }
});
