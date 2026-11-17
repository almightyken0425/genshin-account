import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pruneDeployAssets} from '../scripts/prune-deploy-assets.mjs';

async function fixture(run){
 const root=await mkdtemp(path.join(tmpdir(),'hoyo-deploy-assets-'));
 try{
  for(const folder of ['lib','public/assets','dist/client/assets'])await mkdir(path.join(root,folder),{recursive:true});
  const json=async(name,value)=>writeFile(path.join(root,name),JSON.stringify(value));
  await json('lib/game_assets.json',{characters:{test:{icon:'/assets/icon.png',splash:'/assets/portrait.png',roster:'/assets/card.webp'}},weapons:{},artifacts:{}});
  await json('lib/zzz_assets.json',{characters:{},engines:{},discs:{}});
  await json('lib/artwork_edits.json',{entries:{test:{renderedPath:'/assets/edited.webp'}}});
  await json('public/asset_sources.json',{sources:[{path:'/assets/editor.png',kind:'rosterSource'},{path:'/assets/portrait.png',kind:'rosterSource'},{path:'/assets/edited.webp',kind:'rosterSource'}]});
  await json('public/zzz_asset_sources.json',{sources:[]});
  for(const name of ['editor.png','portrait.png','icon.png','card.webp','edited.webp'])for(const base of ['public/assets','dist/client/assets'])await writeFile(path.join(root,base,name),'original-'+name);
  await run({root,json});
 }finally{await rm(root,{recursive:true,force:true})}
}
test('deployment pruning keeps authored sources and every runtime or edited image',()=>fixture(async({root})=>{
 const result=await pruneDeployAssets(root);assert.equal(result.removed,1);
 assert.equal(await readFile(path.join(root,'public/assets/editor.png'),'utf8'),'original-editor.png');
 await assert.rejects(access(path.join(root,'dist/client/assets/editor.png')));
 for(const name of ['portrait.png','icon.png','card.webp','edited.webp'])await access(path.join(root,'dist/client/assets',name));
 assert.equal((await pruneDeployAssets(root)).removed,0);
}));
test('invalid paths abort before deleting any build asset',()=>fixture(async({root,json})=>{
 await json('public/zzz_asset_sources.json',{sources:[{path:'/assets/../../private.png',kind:'rosterSource'}]});
 await assert.rejects(pruneDeployAssets(root));await access(path.join(root,'dist/client/assets/editor.png'));
}));
