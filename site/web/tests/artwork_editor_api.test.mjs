import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {editorApi} from '../tools/artwork_editor/server.mjs';
import {artworkDraftAssets} from '../scripts/vite/artwork-draft-preview.mjs';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

function setup(){
 let writes=0;
 const store={load:async()=>({schemaVersion:1,revision:0,entries:{}}),save:async body=>{writes++;return {revision:1,entry:body}}};
 const registry={bootstrap:async document=>({...document,entries:[]})};
 const middleware=editorApi({store,registry,websitePreviewUrl:'http://127.0.0.1:5173'});
 async function request({url='/__artwork_editor/save',method='POST',origin='http://127.0.0.1:4180',host='127.0.0.1:4180',contentType='application/json',body='{}'}={}){
  const req=Readable.from([Buffer.from(body)]);
  Object.assign(req,{url,method,headers:{host,origin,'content-type':contentType}});
  const result={headers:{},statusCode:200,body:null,next:false};
  const res={setHeader(name,value){result.headers[name]=value},set statusCode(value){result.statusCode=value},end(value){result.body=JSON.parse(value)}};
  await middleware(req,res,()=>{result.next=true});
  return result;
 }
 return {request,get writes(){return writes}};
}

test('editor bootstrap is read-only and is never cached',async()=>{
 const api=setup(),result=await api.request({url:'/__artwork_editor/bootstrap',method:'GET'});
 assert.equal(result.statusCode,200);assert.deepEqual(result.body.entries,[]);
 assert.equal(result.headers['Cache-Control'],'no-store');assert.equal(api.writes,0);
});

test('editor accepts a same-origin JSON save and returns its receipt',async()=>{
 const api=setup(),result=await api.request({body:JSON.stringify({id:'example'})});
 assert.equal(result.statusCode,200);assert.equal(result.body.revision,1);assert.equal(result.body.entry.id,'example');assert.equal(api.writes,1);
});

test('editor rejects cross-origin, missing-origin, non-JSON and non-loopback writes',async()=>{
 for(const patch of [{origin:'https://example.com'},{origin:null},{contentType:'text/plain'},{host:'example.com:4180',origin:'http://example.com:4180'}]){
  const api=setup(),result=await api.request(patch);
  assert.equal(result.statusCode,403);assert.equal(api.writes,0);
 }
});

test('editor rejects malformed or excessive request bodies without saving',async()=>{
 for(const [body,status] of [['not json',422],['x'.repeat(32769),413]]){
  const api=setup(),result=await api.request({body});assert.equal(result.statusCode,status);assert.equal(api.writes,0);
 }
});

test('editor does not expose save through GET or unknown API paths',async()=>{
 const api=setup();assert.equal((await api.request({method:'GET'})).statusCode,405);
 assert.equal((await api.request({url:'/__artwork_editor/unknown'})).statusCode,404);
 assert.equal((await api.request({url:'/assets/example.png',method:'GET'})).next,true);
 assert.equal(api.writes,0);
});

test('draft previews serve images saved after startup without returning the SPA',async()=>{
 const root=await mkdtemp(join(tmpdir(),'artwork-preview-'));
 try{
  await mkdir(join(root,'public'));
  const middleware=artworkDraftAssets(root),url='/assets/artwork_edits/genshin/example_roster-123456abcdef.webp';
  async function request(path=url,method='GET'){
   const result={headers:{},status:200,bytes:null,next:false};
   await middleware({url:path,method},{set statusCode(value){result.status=value},setHeader(name,value){result.headers[name]=value},end(bytes){result.bytes=bytes}},()=>{result.next=true});
   return result;
  }
  const missing=await request();assert.equal(missing.status,404);assert.equal(missing.next,false);
  await mkdir(join(root,'public/assets/artwork_edits/genshin'),{recursive:true});
  const bytes=Buffer.from('newly saved image');await writeFile(join(root,'public',url.slice(1)),bytes);
  const saved=await request();assert.equal(saved.status,200);assert.deepEqual(saved.bytes,bytes);assert.equal(saved.headers['Content-Type'],'image/webp');
  assert.equal((await request(url,'HEAD')).bytes,undefined);
  assert.equal((await request('/assets/artwork_edits/genshin/unknown.webp')).status,404);
 }finally{await rm(root,{recursive:true,force:true})}
});
