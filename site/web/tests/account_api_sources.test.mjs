import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'vite';
import {loadCurrentGenshin,loadCurrentZzz} from './helpers/current_accounts.mjs';

const genshin=loadCurrentGenshin(),zzz=loadCurrentZzz();
const cacheDir=mkdtempSync(join(tmpdir(),'hoyo-formal-api-tests-'));
let server,accountGET,zzzGET,evidenceGET,portraitGET;
before(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 server=await createServer({configFile:false,root,cacheDir,resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false},logLevel:'silent',plugins:[{
  name:'test-worker-environment',
  resolveId(id){if(id==='cloudflare:workers')return '\0test-worker-environment'},
  load(id){if(id==='\0test-worker-environment')return "export const env={GITHUB_TOKEN:'unit-test-only'}"},
 }]});
 ({GET:accountGET}=await server.ssrLoadModule('/app/api/account/route.ts'));
 ({GET:zzzGET}=await server.ssrLoadModule('/app/api/zzz/route.ts'));
 ({GET:evidenceGET}=await server.ssrLoadModule('/app/api/evidence/route.ts'));
 ({GET:portraitGET}=await server.ssrLoadModule('/app/api/zzz/image/route.ts'));
});
after(async()=>{await server?.close();rmSync(cacheDir,{recursive:true,force:true})});

const request=(path,authenticated=true)=>new Request('https://unit.test'+path,{headers:authenticated?{'oai-authenticated-user-id':'test-user'}:{}});
async function upstream({revision,account,manifests=[],unavailable=false},run){
 const previous=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,options)=>{
  const address=new URL(url);calls[calls.length]={path:address.pathname,ref:address.searchParams.get('ref'),method:options?.method};
  assert.equal(address.origin,'https://api.github.com');
  if(unavailable)return Response.json({message:'test unavailable'},{status:503});
  if(address.pathname.endsWith('/commits/main'))return Response.json({sha:revision,commit:{message:'Formal account source'}});
  assert.equal(address.searchParams.get('ref'),revision);
  const key=address.pathname.split('/contents/')[1];
  let value;
  if(key==='data/account.json'||key==='data/zzz/account.json')value=account;
  else value=manifests.find(manifest=>key==='evidence/'+manifest.id+'/manifest.json');
  assert.ok(value,'Unexpected upstream path '+key);
  const text=JSON.stringify(value);
  return Response.json({type:'file',encoding:'base64',size:Buffer.byteLength(text),content:Buffer.from(text).toString('base64')});
 };
 try{return await run(calls)}finally{globalThis.fetch=previous}
}

function privateResponse(response){
 assert.equal(response.headers.get('cache-control'),'private, no-store');
 assert.match(response.headers.get('vary'),/oai-authenticated-user-id/);
}

test('both account and private image GETs reject unauthenticated requests before GitHub access',async()=>{
 await upstream({unavailable:true},async calls=>{
  for(const [handler,path]of [[accountGET,'/api/account'],[zzzGET,'/api/zzz'],[evidenceGET,'/api/evidence'],[portraitGET,'/api/zzz/image']]){
   const response=await handler(request(path,false));assert.equal(response.status,401);privateResponse(response);assert.equal((await response.json()).error,'signin_required');
  }
  assert.equal(calls.length,0);
 });
});

test('Genshin GET reads main once, validates pinned formal data and strips private manifest details',async()=>{
 const revision='a'.repeat(40);
 await upstream({revision,account:genshin.account,manifests:genshin.manifests},async calls=>{
  const response=await accountGET(request('/api/account'));assert.equal(response.status,200);privateResponse(response);
  const result=await response.json();assert.equal(result.revision,revision);assert.deepEqual(result.account,genshin.account);
  assert.equal(result.review,undefined);assert.equal(result.manifests,undefined);assert.equal(result.commitMessage,undefined);
  assert.ok(result.evidence.length>0);assert.ok(result.evidence.every(item=>!('path'in item)&&!('sha256'in item)));
  assert.equal(calls.filter(call=>call.path.endsWith('/commits/main')).length,1);
  assert.equal(calls.filter(call=>call.path.includes('/contents/')).length,1+genshin.manifests.length);
  assert.ok(calls.filter(call=>call.path.includes('/contents/')).every(call=>call.ref===revision));
  assert.ok(calls.every(call=>!call.method));
 });
});

test('ZZZ GET returns the validated formal account at the main revision without an overlay',async()=>{
 const revision='b'.repeat(40);
 await upstream({revision,account:zzz.account},async calls=>{
  const response=await zzzGET(request('/api/zzz'));assert.equal(response.status,200);privateResponse(response);
  const result=await response.json();assert.equal(result.revision,revision);assert.deepEqual(result.account,zzz.account);assert.equal(result.review,undefined);
  assert.equal(calls.length,2);assert.ok(calls[0].path.endsWith('/commits/main'));assert.equal(calls[1].ref,revision);assert.ok(calls.every(call=>!call.method));
 });
});

test('invalid upstream accounts return validation errors rather than local observations',async()=>{
 for(const [handler,path,account,revision]of [[accountGET,'/api/account',{...genshin.account,schema_version:999},'c'.repeat(40)],[zzzGET,'/api/zzz',{...zzz.account,game:'genshin'},'d'.repeat(40)]]){
  await upstream({revision,account},async()=>{
   const response=await handler(request(path));assert.equal(response.status,422);privateResponse(response);const result=await response.json();assert.equal(result.error,'invalid_data');assert.equal(result.account,undefined);
  });
 }
});

test('an upstream outage never falls back to test fixtures or generated account snapshots',async()=>{
 await upstream({unavailable:true},async()=>{
  for(const [handler,path]of [[accountGET,'/api/account'],[zzzGET,'/api/zzz']]){
   const response=await handler(request(path));assert.equal(response.status,502);const result=await response.json();assert.equal(result.error,'github_error');assert.equal(result.account,undefined);
  }
 });
});

test('deployment-only account overlays and their generator are absent from Site source',()=>{
 for(const path of ['../lib/review/','../lib/genshin_review.ts','../lib/zzz_review.ts','../scripts/prepare-review-snapshot.mjs'])assert.equal(existsSync(new URL(path,import.meta.url)),false,path);
});
