import {readFile,writeFile,mkdir,realpath,lstat,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {assertValidView,frameSize,imagePlacement} from '../../lib/artwork_math.mjs';

const queues=new Map();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const shaPattern=/^[a-f0-9]{64}$/;
const idPattern=/^[a-z0-9][a-z0-9_-]{0,127}$/;
const mimeByFormat={png:'image/png',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',avif:'image/avif'};
const emptyDocument=()=>({schemaVersion:1,revision:0,entries:{}});
const isRecord=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const revision=value=>Number.isSafeInteger(value)&&value>=0;
const dimensions=value=>Number.isSafeInteger(value)&&value>0;
const inside=(root,file)=>{
 const relative=path.relative(root,file);
 return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);
};

export class DraftStoreError extends Error{
 constructor(code,message,status=422,options){
  super(message,options);
  this.name='DraftStoreError';this.code=code;this.status=status;this.statusCode=status;
 }
}

function invalid(code,message,cause){
 return new DraftStoreError(code,message,422,cause?{cause}:undefined);
}

function identity(game,role,id){
 if(!['genshin','zzz'].includes(game)||!['roster','portrait'].includes(role)||typeof id!=='string'||!idPattern.test(id)){
  throw invalid('invalid_identity','圖片編輯對象無效。');
 }
 return `${game}/${role}/${id}`;
}

function sourcePublicPath(value){
 return typeof value==='string'&&/^\/assets\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|gif|avif)$/.test(value)&&
  !value.slice(1).split('/').some(part=>part==='.'||part==='..'||part==='');
}

function assertDocument(doc){
 if(!isRecord(doc)||doc.schemaVersion!==1||!revision(doc.revision)||!isRecord(doc.entries)){
  throw invalid('invalid_document','圖片編輯稿的格式或版本無效，已保留原檔。');
 }
 for(const [key,entry] of Object.entries(doc.entries)){
  try{
   if(!isRecord(entry)||identity(entry.game,entry.role,entry.id)!==key||entry.key!==key||
    !revision(entry.revision)||entry.revision<1||entry.revision>doc.revision||!sourcePublicPath(entry.sourcePath)||
    typeof entry.sourceSha256!=='string'||!shaPattern.test(entry.sourceSha256)||
    typeof entry.renderedSha256!=='string'||!shaPattern.test(entry.renderedSha256)||
    !dimensions(entry.sourceWidth)||!dimensions(entry.sourceHeight)||
    typeof entry.renderedPath!=='string'||!dimensions(entry.width)||!dimensions(entry.height)||
    typeof entry.updatedAt!=='string'||!Number.isFinite(Date.parse(entry.updatedAt))||
    entry.sourceProvider!=='HoYoWiki'||typeof entry.sourcePage!=='string'||!entry.sourcePage||
    typeof entry.sourceUrl!=='string'||!entry.sourceUrl){
    throw new Error('Invalid entry');
   }
   assertValidView(entry.view);
   const frame=frameSize(entry.role);
   if(entry.width!==frame.width||entry.height!==frame.height)throw new Error('Invalid frame');
   const expectedPath=`/assets/artwork_edits/${entry.game}/${entry.id}_${entry.role}-${entry.renderedSha256.slice(0,12)}.webp`;
   if(entry.renderedPath!==expectedPath)throw new Error('Invalid rendered path');
  }catch(cause){
   throw invalid('invalid_document','圖片編輯稿內容損壞，已保留原檔。',cause);
  }
 }
 return doc;
}

async function safeDirectory(root,segments,create=false){
 let current=root;
 for(const segment of segments){
  current=path.join(current,segment);
  if(create)await mkdir(current,{recursive:true});
  const stat=await lstat(current);
  if(stat.isSymbolicLink()||!stat.isDirectory())throw invalid('unsafe_storage_path','圖片編輯資料夾無效。');
 }
 return current;
}

async function readDocument(root){
 try{
  const directory=await safeDirectory(root,['lib']);
  const file=path.join(directory,'artwork_edits.json'),stat=await lstat(file);
  if(stat.isSymbolicLink()||!stat.isFile())throw invalid('invalid_document','圖片編輯稿必須是一般檔案。');
  let doc;
  try{doc=JSON.parse(await readFile(file,'utf8'));}
  catch(cause){throw invalid('invalid_document','圖片編輯稿無法解析，已保留原檔。',cause);}
  return assertDocument(doc);
 }catch(error){
  if(error.code==='ENOENT')return emptyDocument();
  if(error instanceof DraftStoreError)throw error;
  throw invalid('storage_error','無法讀取圖片編輯稿。',error);
 }
}

async function atomicDocument(root,doc){
 const directory=await safeDirectory(root,['lib'],true);
 const target=path.join(directory,'artwork_edits.json'),temp=path.join(directory,'.artwork_edits.'+randomUUID()+'.tmp');
 try{
  await writeFile(temp,JSON.stringify(doc,null,2)+'\n',{flag:'wx'});
  await rename(temp,target);
 }finally{
  await unlink(temp).catch(()=>{});
 }
}

async function verifiedSource(root,resolveSource,input){
 let source;
 try{source=await resolveSource(input.game,input.role,input.id,input.sourcePath);}
 catch(cause){throw invalid('invalid_source','圖片來源不在允許清單。',cause);}
 if(!source||source.path!==input.sourcePath||!sourcePublicPath(source.path)||
  source.sourceProvider!=='HoYoWiki'||!shaPattern.test(source.sha256)||
  !dimensions(source.width)||!dimensions(source.height)||
  typeof source.sourcePage!=='string'||!source.sourcePage||typeof source.url!=='string'||!source.url){
  throw invalid('invalid_source','圖片來源不在允許清單。');
 }
 if(typeof input.sourceSha256!=='string'||input.sourceSha256!==source.sha256){
  throw invalid('source_hash_mismatch','圖片來源版本已改變，請重新讀取。');
 }
 let bytes,metadata;
 try{
  const publicRoot=await safeDirectory(root,['public']);
  const expected=path.join(publicRoot,source.path.slice(1)),actual=await realpath(expected);
  if(!inside(publicRoot,actual))throw invalid('invalid_source','圖片來源超出允許範圍。');
  const stat=await lstat(actual);
  if(!stat.isFile())throw invalid('invalid_source','圖片來源必須是一般檔案。');
  bytes=await readFile(actual);
  if(hash(bytes)!==source.sha256)throw invalid('source_hash_mismatch','圖片來源校驗失敗，未保存編輯稿。');
  metadata=await sharp(bytes).metadata();
 }catch(error){
  if(error instanceof DraftStoreError)throw error;
  throw invalid('invalid_source','無法讀取已確認的圖片來源。',error);
 }
 if(!mimeByFormat[metadata.format]||(metadata.pages||1)!==1||
  metadata.width!==source.width||metadata.height!==source.height){
  throw invalid('source_dimensions_mismatch','圖片來源格式或尺寸與紀錄不符。');
 }
 return {source,bytes,mime:mimeByFormat[metadata.format]};
}

async function renderedImage(source,bytes,mime,view,role){
 const frame=frameSize(role),placement=imagePlacement(source,view,frame);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}" overflow="hidden"><image x="${placement.left}" y="${placement.top}" width="${placement.width}" height="${placement.height}" preserveAspectRatio="none" href="data:${mime};base64,${bytes.toString('base64')}"/></svg>`;
 return {frame,buffer:await sharp(Buffer.from(svg)).webp({quality:92,alphaQuality:100}).toBuffer()};
}

async function writeRendered(root,game,id,role,buffer,sha256){
 const directory=await safeDirectory(root,['public','assets','artwork_edits',game],true);
 const name=`${id}_${role}-${sha256.slice(0,12)}.webp`,target=path.join(directory,name);
 try{
  const stat=await lstat(target);
  if(stat.isSymbolicLink()||!stat.isFile()||hash(await readFile(target))!==sha256){
   throw invalid('render_collision','輸出圖片路徑已存在其他內容，未覆寫。');
  }
 }catch(error){
  if(error.code!=='ENOENT')throw error;
  const temp=path.join(directory,'.'+name+'.'+randomUUID()+'.tmp');
  try{await writeFile(temp,buffer,{flag:'wx'});await rename(temp,target);}
  finally{await unlink(temp).catch(()=>{});}
 }
 return `/assets/artwork_edits/${game}/${name}`;
}

async function cleanupPrevious(root,previous,doc){
 if(!previous)return;
 const expected=`/assets/artwork_edits/${previous.game}/${previous.id}_${previous.role}-${previous.renderedSha256.slice(0,12)}.webp`;
 if(previous.renderedPath!==expected||Object.values(doc.entries).some(entry=>entry.renderedPath===expected||entry.sourcePath===expected))return;
 try{
  await safeDirectory(root,['public','assets','artwork_edits',previous.game]);
  const target=path.join(root,'public',expected.slice(1)),stat=await lstat(target);
  if(stat.isSymbolicLink()||!stat.isFile()||hash(await readFile(target))!==previous.renderedSha256)return;
  await unlink(target);
 }catch{
  // Cleanup is optional and must not turn a successful atomic save into a failure.
 }
}

export function createDraftStore({root,resolveSource}){
 if(typeof root!=='string'||!root||typeof resolveSource!=='function')throw new TypeError('root and resolveSource are required');
 let rootPromise;
 const canonicalRoot=()=>rootPromise??=realpath(path.resolve(root)).catch(cause=>{throw invalid('storage_error','圖片編輯工作目錄無效。',cause);});
 async function queued(operation){
  const directory=await canonicalRoot(),previous=queues.get(directory)||Promise.resolve();
  const result=previous.then(()=>operation(directory)),tail=result.catch(()=>{});
  queues.set(directory,tail);
  try{return await result;}
  finally{if(queues.get(directory)===tail)queues.delete(directory);}
 }
 return {
  load(){return queued(directory=>readDocument(directory));},
  save(input){return queued(async directory=>{
   try{
    if(!isRecord(input))throw invalid('invalid_input','圖片編輯資料無效。');
    const key=identity(input.game,input.role,input.id);
    let view;
    try{view=assertValidView(input.view);}
    catch(cause){throw invalid('invalid_view','圖片縮放或位置無效。',cause);}
    if(!revision(input.expectedRevision))throw invalid('invalid_revision','圖片編輯稿版本無效。');
    const doc=await readDocument(directory),previous=doc.entries[key];
    if((previous?.revision||0)!==input.expectedRevision){
     throw new DraftStoreError('revision_conflict','這張圖片已被更新，請重新讀取後再保存。',409);
    }
    if(doc.revision===Number.MAX_SAFE_INTEGER||previous?.revision===Number.MAX_SAFE_INTEGER)throw invalid('invalid_revision','圖片編輯稿版本已超出範圍。');
    const {source,bytes,mime}=await verifiedSource(directory,resolveSource,input);
    const {frame,buffer}=await renderedImage(source,bytes,mime,view,input.role),renderedSha256=hash(buffer);
    const renderedPath=await writeRendered(directory,input.game,input.id,input.role,buffer,renderedSha256);
    const entry={game:input.game,role:input.role,id:input.id,key,revision:(previous?.revision||0)+1,
     sourcePath:source.path,sourceSha256:source.sha256,sourceWidth:source.width,sourceHeight:source.height,
     view,renderedPath,renderedSha256,width:frame.width,height:frame.height,updatedAt:new Date().toISOString(),
     sourcePage:source.sourcePage,sourceUrl:source.url,sourceProvider:source.sourceProvider};
    const next={...doc,revision:doc.revision+1,entries:{...doc.entries,[key]:entry}};
    await atomicDocument(directory,next);
    await cleanupPrevious(directory,previous,next);
    return {revision:next.revision,entry};
   }catch(error){
    if(error instanceof DraftStoreError)throw error;
    throw invalid('storage_error','無法保存圖片編輯稿。',error);
   }
  });},
 };
}
