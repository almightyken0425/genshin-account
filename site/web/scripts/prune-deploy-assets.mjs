import {readFile,lstat,realpath,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/** Remove only editor source copies from dist. Authored originals stay in public. */
export async function pruneDeployAssets(root=process.cwd()){
 const canonicalRoot=await realpath(root),output=path.join(canonicalRoot,'dist/client');
 for(const folder of [path.join(canonicalRoot,'dist'),output]){
  const stat=await lstat(folder);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Deployment output must be a regular directory');
 }
 const json=async name=>JSON.parse(await readFile(path.join(canonicalRoot,name),'utf8'));
 const game=await json('lib/game_assets.json'),zzz=await json('lib/zzz_assets.json'),edits=await json('lib/artwork_edits.json');
 const runtime=new Set();
 for(const art of [...Object.values(game.characters),...Object.values(zzz.characters)])for(const kind of ['icon','splash','roster'])if(art[kind])runtime.add(art[kind]);
 for(const art of Object.values(game.weapons))runtime.add(art.icon);
 for(const art of Object.values(game.artifacts))for(const value of Object.values(art.slots))runtime.add(value);
 for(const collection of [zzz.engines,zzz.discs])for(const value of Object.values(collection))runtime.add(value);
 for(const entry of Object.values(edits.entries))runtime.add(entry.renderedPath);
 const candidates=new Map();
 for(const name of ['asset_sources.json','zzz_asset_sources.json'])for(const source of (await json('public/'+name)).sources){
  if(!['rosterSource','illustrationSource'].includes(source.kind)||runtime.has(source.path))continue;
  if(typeof source.path!=='string'||!source.path.startsWith('/assets/')||source.path.slice(1).split('/').some(part=>!part||part==='.'||part==='..'))throw Error('Invalid editor source path');
  const target=path.join(output,source.path.slice(1));
  let stat;try{stat=await lstat(target)}catch(error){if(error.code==='ENOENT')continue;throw error}
  if(!stat.isFile()||stat.isSymbolicLink()||!(await realpath(target)).startsWith(output+path.sep))throw Error('Deployment asset must stay inside dist/client');
  candidates.set(target,stat.size);
 }
 for(const target of candidates.keys())await unlink(target);
 return {removed:candidates.size,bytesRemoved:[...candidates.values()].reduce((sum,size)=>sum+size,0),originalsPreserved:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await pruneDeployAssets()));
