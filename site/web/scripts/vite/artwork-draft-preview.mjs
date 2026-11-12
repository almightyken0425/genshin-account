import {readFile,realpath} from 'node:fs/promises';
import {resolve,sep} from 'node:path';

// Vite's public-file inventory does not include files saved after startup when
// editor output is excluded from its watcher. Serve only owned draft images.
export function artworkDraftAssets(root){
 let publicRoot;
 return async(req,res,next)=>{
  const pathname=new URL(req.url??'/','http://localhost').pathname;
  if(!pathname.startsWith('/assets/artwork_edits/'))return next();
  if(!['GET','HEAD'].includes(req.method)||!/^\/assets\/artwork_edits\/(genshin|zzz)\/[a-z0-9_]+_(roster|portrait)-[a-f0-9]{12}\.webp$/.test(pathname)){
   res.statusCode=404;res.end();return;
  }
  try{
   const directory=await(publicRoot??=realpath(resolve(root,'public')));
   const target=await realpath(resolve(directory,pathname.slice(1)));
   if(!target.startsWith(directory+sep)){res.statusCode=404;res.end();return}
   const bytes=await readFile(target);
   res.statusCode=200;res.setHeader('Content-Type','image/webp');res.setHeader('Content-Length',bytes.length);
   res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','public, max-age=31536000, immutable');
   res.end(req.method==='HEAD'?undefined:bytes);
  }catch(error){res.statusCode=error.code==='ENOENT'?404:500;res.end()}
 };
}

export function artworkDraftPreview(){
 return {name:'artwork-draft-preview',apply:'serve',configureServer(server){server.middlewares.use(artworkDraftAssets(server.config.root))}};
}
