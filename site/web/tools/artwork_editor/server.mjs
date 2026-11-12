import {createServer as createViteServer} from 'vite';
import react from '@vitejs/plugin-react';
import {access,realpath} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {createArtworkRegistry} from './registry.mjs';
import {createDraftStore} from './draft_store.mjs';
import {artworkDraftAssets} from '../../scripts/vite/artwork-draft-preview.mjs';

export async function findAccountRoot(webRoot,explicit){
 if(explicit)return resolve(explicit);
 let candidate=resolve(webRoot);
 for(let depth=0;depth<7;depth++){
  try{await access(resolve(candidate,'data/account.json'));await access(resolve(candidate,'data/zzz/account.json'));return candidate}catch{}
  const parent=dirname(candidate);if(parent===candidate)break;candidate=parent;
 }
 throw Error('找不到本機帳號資料。請使用 --account-repo 指定 HOYO 專案。');
}

function send(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body))}

async function readBody(req){
 const chunks=[];let length=0;
 for await(const chunk of req){length+=chunk.length;if(length>32768)throw Object.assign(new Error('儲存內容過大'),{status:413});chunks.push(chunk)}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw Object.assign(new Error('無法讀取儲存內容'),{status:422})}
}

export function editorApi({registry,store,websitePreviewUrl}){
 return async(req,res,next)=>{
  const pathname=new URL(req.url??'/','http://localhost').pathname;
  if(!pathname.startsWith('/__artwork_editor/'))return next();
  try{
   const host=new URL('http://'+(req.headers.host??''));
   if(!['127.0.0.1','localhost'].includes(host.hostname))return send(res,403,{message:'編輯器只接受本機連線'});
   if(pathname==='/__artwork_editor/bootstrap'){
    if(req.method!=='GET')return send(res,405,{message:'不支援這個操作'});
    return send(res,200,await registry.bootstrap(await store.load(),websitePreviewUrl));
   }
   if(pathname!=='/__artwork_editor/save')return send(res,404,{message:'找不到這個操作'});
   if(req.method!=='POST')return send(res,405,{message:'不支援這個操作'});
   if(req.headers.origin!==host.origin||!/^application\/json(?:;|$)/i.test(req.headers['content-type']??''))return send(res,403,{message:'儲存必須從本機編輯器操作'});
   const result=await store.save(await readBody(req));
   return send(res,200,result);
  }catch(error){
   const status=[409,413,422].includes(error.status)?error.status:error instanceof RangeError?422:500;
   const message=status===500?'無法讀取或儲存編輯稿，請稍後重試。':error instanceof RangeError?'裁切位置或縮放超出範圍，請重設位置。':error.message;
   if(status===500)console.error('Artwork editor:',error.message);
   return send(res,status,{message,code:error.code??'editor_error'});
  }
 };
}

export async function startEditor({webRoot,accountRoot,port=4180,websitePreviewUrl='http://127.0.0.1:5173'}={}){
 webRoot=resolve(webRoot??fileURLToPath(new URL('../../',import.meta.url)));
 accountRoot=await findAccountRoot(webRoot,accountRoot??process.env.HOYO_EDITOR_ACCOUNT_REPO??process.env.GENSHIN_PREVIEW_REPO);
 const registry=await createArtworkRegistry({root:webRoot,accountRoot});
 const store=createDraftStore({root:webRoot,resolveSource:registry.resolveSource});
 // Fail before listening when a saved draft or the account location is unusable.
 await registry.bootstrap(await store.load(),websitePreviewUrl);
 const modules=await realpath(resolve(webRoot,'node_modules'));
 const vite=await createViteServer({
  configFile:false,
  root:resolve(webRoot,'tools/artwork_editor'),
  publicDir:resolve(webRoot,'public'),
  cacheDir:resolve(webRoot,'.sites-runtime/artwork-editor/vite'),
  plugins:[react(),{name:'local-artwork-drafts',configureServer(server){server.middlewares.use(editorApi({registry,store,websitePreviewUrl}));server.middlewares.use(artworkDraftAssets(webRoot))}}],
  resolve:{alias:{'@':webRoot}},
  css:{postcss:webRoot},
  server:{host:'127.0.0.1',port,strictPort:true,cors:false,allowedHosts:['localhost','127.0.0.1'],fs:{allow:[webRoot,modules]},watch:{useFsEvents:false,usePolling:true,ignored:['**/public/assets/artwork_edits/**','**/lib/artwork_edits.json','**/.sites-runtime/**']}},
 });
 await vite.listen();
 console.log(`圖片編輯器：http://127.0.0.1:${port}/genshin/roster`);
 console.log('儲存位置：lib/artwork_edits.json。儲存編輯稿不會部署正式網站。');
 return vite;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {values}=parseArgs({options:{port:{type:'string',default:'4180'},'account-repo':{type:'string'},'preview-url':{type:'string'}}});
 const port=Number(values.port);if(!Number.isInteger(port)||port<1024||port>65535)throw Error('連線埠必須介於 1024 與 65535');
 const server=await startEditor({port,accountRoot:values['account-repo'],websitePreviewUrl:values['preview-url']});
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await server.close();process.exit(0)});
}
