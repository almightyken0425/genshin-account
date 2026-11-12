import {readFile,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {createDraftStore} from '../tools/artwork_editor/draft_store.mjs';
import {createArtworkRegistry} from '../tools/artwork_editor/registry.mjs';
import {frameSize} from '../lib/artwork_math.mjs';

const siteRoot=fileURLToPath(new URL('../',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const rasterFormats=new Set(['png','jpeg','webp','gif','avif']);

async function publicImage(root,url){
 if(typeof url!=='string'||!url.startsWith('/assets/')||url.slice(1).split('/').some(part=>!part||part==='.'||part==='..')){
  throw Error('圖片路徑不在 public/assets 範圍內。');
 }
 let file=root;
 const segments=['public',...url.slice(1).split('/')];
 for(let i=0;i<segments.length;i++){
  file=path.join(file,segments[i]);
  const stat=await lstat(file);
  if(stat.isSymbolicLink()||(i===segments.length-1?!stat.isFile():!stat.isDirectory())){
   throw Error('圖片與資料夾必須是一般檔案或資料夾，不可使用符號連結。');
  }
 }
 const bytes=await readFile(file),metadata=await sharp(bytes).metadata();
 if(!rasterFormats.has(metadata.format)||(metadata.pages||1)!==1)throw Error('圖片必須是單幀點陣圖。');
 return {sha256:hash(bytes),metadata};
}

/** Verify saved drafts without generating, deleting, or updating any files. */
export async function checkArtworkEdits({root=siteRoot,resolveSource}={}){
 const canonicalRoot=await realpath(root);
 const store=createDraftStore({root:canonicalRoot,resolveSource:()=>undefined});
 const document=await store.load(),entries=Object.values(document.entries);
 if(entries.length===0)return {revision:document.revision,checked:0};
 const resolver=resolveSource??(await createArtworkRegistry({root:canonicalRoot,accountRoot:canonicalRoot})).resolveSource;
 const images=new Map();
 const image=url=>{
  if(!images.has(url))images.set(url,publicImage(canonicalRoot,url));
  return images.get(url);
 };
 for(const entry of entries){
  try{
   const source=await resolver(entry.game,entry.role,entry.id,entry.sourcePath);
   if(!source||source.path!==entry.sourcePath||source.sourceProvider!=='HoYoWiki')throw Error('來源已不在角色允許清單內。');
   if(source.sha256!==entry.sourceSha256||source.width!==entry.sourceWidth||source.height!==entry.sourceHeight){
    throw Error('來源版本或尺寸與目前 registry 不符。');
   }
   if(source.sourcePage!==entry.sourcePage||source.url!==entry.sourceUrl)throw Error('來源頁面或網址與 registry 不符。');
   const actualSource=await image(entry.sourcePath);
   if(actualSource.sha256!==source.sha256)throw Error('來源圖片 SHA-256 不符。');
   if(actualSource.metadata.width!==source.width||actualSource.metadata.height!==source.height)throw Error('來源圖片實際尺寸不符。');
   const expectedPath=`/assets/artwork_edits/${entry.game}/${entry.id}_${entry.role}-${entry.renderedSha256.slice(0,12)}.webp`;
   if(entry.renderedPath!==expectedPath)throw Error('輸出圖片命名或路徑不符。');
   const rendered=await image(entry.renderedPath),frame=frameSize(entry.role);
   if(rendered.sha256!==entry.renderedSha256)throw Error('輸出圖片 SHA-256 不符。');
   if(rendered.metadata.format!=='webp'||rendered.metadata.width!==frame.width||rendered.metadata.height!==frame.height||
    entry.width!==frame.width||entry.height!==frame.height)throw Error('輸出圖片格式或畫框尺寸不符。');
  }catch(cause){
   throw Error(`${entry.key}：${cause.message}`,{cause});
  }
 }
 return {revision:document.revision,checked:entries.length};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const result=await checkArtworkEdits();
  console.log(`Artwork drafts verified: ${result.checked} entries (revision ${result.revision}).`);
 }catch(error){
  console.error(`Artwork draft check failed: ${error.message}`);
  process.exitCode=1;
 }
}
