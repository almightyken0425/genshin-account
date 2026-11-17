import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {githubClient} from '../lib/github.mjs';
import {hash} from '../lib/account.mjs';
const base=JSON.parse(readFileSync(new URL('./fixtures/account.json',import.meta.url),'utf8'));
const legacy=JSON.parse(readFileSync(new URL('./fixtures/manifest.json',import.meta.url),'utf8'));
const revision='a'.repeat(40),blob='b'.repeat(40);
function reader({apiSource=false,tamper=false,missing=false}={}){
 const account=structuredClone(base);const sourceId='hoyolab_test_source';
 const proof=Buffer.from(JSON.stringify({genshin:{characters:missing?[]:[{api_id:10000001}]}}));
 const manifest={schema_version:3,id:sourceId,imported_at:'2026-11-16T09:00:00Z',media:{type:'hoyolab',recorded_at:null},screenshots:[],extraction:{path:'imports/hoyolab/'+sourceId+'.json',sha256:tamper?'0'.repeat(64):hash(proof)},observations:[{id:sourceId+'_character',kind:'hoyolab',character_id:account.characters[0].id,pointer:'/genshin/characters/0'}]};
 if(apiSource){account.schema_version=3;for(const artifact of account.artifacts)artifact.substat_rolls={character_id:null,values:artifact.substats.map(stat=>({key:stat.key,enhancements:null,effective:null}))};account.source_ids.push(sourceId);account.characters[0].provenance.source_ids.push(sourceId);account.characters[0].provenance.evidence_refs.push(sourceId+'_character');}
 const calls=[];
 const client=githubClient('test-token',async(url,options)=>{
  const path=new URL(url).pathname;calls.push(path);
  if(path.endsWith('/commits/main'))return Response.json({sha:revision,commit:{message:'test'}});
  if(path.endsWith('/git/blobs/'+blob)){const content=Buffer.from(JSON.stringify(account));return Response.json({encoding:'base64',size:content.length,content:content.toString('base64')});}
  const file=path.split('/contents/')[1];
  assert.equal(options.headers.Accept,'application/vnd.github.object+json');
  if(file==='data/account.json')return Response.json({type:'file',encoding:'none',sha:blob,size:1500000});
  const content=file===manifest.extraction.path?proof:Buffer.from(JSON.stringify(file==='evidence/'+sourceId+'/manifest.json'?manifest:legacy));
  return Response.json({type:'file',encoding:'base64',size:content.length,content:content.toString('base64')});
 });
 return {client,calls};
}
test('large formal account is read through pinned GitHub blob fallback',async()=>{const {client,calls}=reader();const result=await client.read();assert.equal(result.revision,revision);assert.ok(calls.some(path=>path.endsWith('/git/blobs/'+blob)));});
test('API source is pinned, hashed and resolves its character observation',async()=>{const result=await reader({apiSource:true}).client.read();assert.equal(result.account.schema_version,3);});
test('tampered API source and absent character pointer are rejected',async()=>{for(const options of [{tamper:true},{missing:true}])await assert.rejects(reader({apiSource:true,...options}).client.read(),{code:'invalid_data'});});
