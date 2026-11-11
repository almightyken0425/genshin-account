import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAccount,applyCandidate,panelStates,canonical,hash} from '../lib/account.mjs';
import {renderSummary} from '../lib/report.mjs';
import {githubClient,assertRequest} from '../lib/github.mjs';
const raw=readFileSync(new URL('./fixtures/account.json',import.meta.url),'utf8'),base=JSON.parse(raw),manifest=JSON.parse(readFileSync(new URL('./fixtures/manifest.json',import.meta.url),'utf8'));
const copy=()=>structuredClone(base),sha1='a'.repeat(40),sha2='b'.repeat(40),id='07df84e7-0eab-4e6e-8124-125d939d7cbe';
function mock(options={}){
 let head=sha1, account=copy(), message='Initial',writes=0,history=[],summary='';
 const fetcher=async(url,opts={})=>{
  const u=new URL(url),path=u.pathname;
  if(path.endsWith('/commits/main'))return Response.json({sha:head,commit:{message}});
  if(path.endsWith('/commits'))return Response.json(history);
  if(path.includes('/contents/')){
   const key=path.split('/contents/')[1];const text=key==='data/account.json'?JSON.stringify(account):key.endsWith('manifest.json')?JSON.stringify(manifest):'';
   return Response.json({type:'file',size:text.length,encoding:'base64',content:Buffer.from(text).toString('base64')});
  }
  if(path==='/graphql'){
   writes++;
   const {input}=JSON.parse(opts.body).variables;
   if(options.conflict)return Response.json({errors:[{message:'Expected head does not match'}]});
   assert.equal(input.expectedHeadOid,head);
   assert.equal(input.branch.repositoryNameWithOwner,'almightyken0425/genshin-account');
   assert.deepEqual(input.fileChanges.additions.map(x=>x.path),['data/account.json','docs/account_summary.md']);
   account=JSON.parse(Buffer.from(input.fileChanges.additions[0].contents,'base64').toString('utf8'));
   summary=Buffer.from(input.fileChanges.additions[1].contents,'base64').toString('utf8');
   head=sha2;message=input.message.headline+'\n'+input.message.body;history=[{sha:head,commit:{message}}];
   if(options.afterWriteTimeout)throw new Error('Connection lost after commit');
   return Response.json({data:{createCommitOnBranch:{commit:{oid:head}}}});
  }
  throw new Error('Unexpected route '+path);
 };
 return {client:githubClient('test-credential',fetcher),get writes(){return writes},get summary(){return summary},advance(){head='c'.repeat(40)}};
}
const input=()=>{const a=copy();a.characters[0].friendship=9;return {candidate:a,note:'更新好感度',expectedRevision:sha1,requestId:id}};
test('imported data and recorded fingerprints match Python',()=>{assert.deepEqual(validateAccount(base),[]);assert.deepEqual(Object.values(panelStates(base)),['current','current','current','current'])});
test('report exactly matches Python output for same serialized data',()=>{
 const expected=readFileSync(new URL('./fixtures/account_summary.md',import.meta.url),'utf8').replaceAll('\r\n','\n');
 const actual=renderSummary(base,raw,[manifest]);
 assert.equal(actual,expected);
});
test('null remains unknown while zero is retained',()=>{const a=copy();a.characters[0].friendship=0;a.characters[0].talents.base.normal=null;const r=applyCandidate(base,a,'確認好感度');assert.equal(r.account.characters[0].friendship,0);assert.equal(r.account.characters[0].talents.base.normal,null)});
test('edited build marks snapshot stale without modifying observation',()=>{const a=copy();a.weapons[0].refinement=2;const r=applyCandidate(base,a,'提升武器');assert.equal(r.panels.escoffier,'stale');assert.equal(canonical(r.account.panel_snapshots),canonical(base.panel_snapshots));assert.equal(r.account.weapons[0].provenance.verification,'user_reported')});
test('identity and observation changes are rejected',()=>{for(const change of [a=>a.characters[0].id='other',a=>a.panel_snapshots[0].stats[0].value=999,a=>a.source_ids.push('other')]){const a=copy();change(a);assert.throws(()=>applyCandidate(base,a,'修改'))}});
test('duplicate ownership, weapon types and slots are rejected',()=>{const a=copy();a.equipment.skirk.weapon_id=a.equipment.furina.weapon_id;assert.ok(validateAccount(a).length);const b=copy();b.equipment.furina.weapon_id=b.equipment.escoffier.weapon_id;assert.ok(validateAccount(b).length);const c=copy();c.equipment.escoffier.artifacts.goblet=c.equipment.escoffier.artifacts.flower;assert.ok(validateAccount(c).length)});
test('invalid range, units and duplicate stats are rejected',()=>{for(const change of [a=>a.characters[0].constellation=7,a=>a.characters[0].level.current=100,a=>a.artifacts[0].main_stat.unit='percent',a=>a.artifacts[0].substats.push(a.artifacts[0].substats[0])]){const a=copy();change(a);assert.ok(validateAccount(a).length)}});
test('save requires a meaningful note',()=>{assert.throws(()=>applyCandidate(base,copy(),'  '));assert.throws(()=>applyCandidate(base,copy(),'x'.repeat(501)))});
test('missing credentials never expose fixtures as live data',()=>{assert.throws(()=>githubClient(''),{code:'connection_missing'})});
test('unauthenticated and cross-origin writes rejected',()=>{assert.throws(()=>assertRequest(new Request('https://example.com/api/account')),{status:401});assert.throws(()=>assertRequest(new Request('https://example.com/api/account',{headers:{'oai-authenticated-user-id':'user',origin:'https://evil.example','content-type':'application/json'}}),true),{status:403})});
test('reads are pinned to one head and validated',async()=>{const m=mock();const r=await m.client.read();assert.equal(r.revision,sha1);assert.equal(r.account.characters.length,4);assert.equal(m.writes,0)});
test('save atomically writes data and matching summary then reads back',async()=>{const m=mock();const r=await m.client.save(input());assert.equal(r.savedRevision,sha2);assert.equal(r.account.characters[0].friendship,9);assert.equal(m.writes,1);assert.equal(m.summary,renderSummary(r.account,JSON.stringify(r.account,null,2)+'\n',[manifest]))});
test('stale revision rejects without mutation',async()=>{const m=mock();m.advance();await assert.rejects(m.client.save(input()),{status:409});assert.equal(m.writes,0)});
test('concurrent update is protected by expectedHeadOid',async()=>{const m=mock({conflict:true});await assert.rejects(m.client.save(input()),{status:409});assert.equal(m.writes,1)});
test('duplicate request returns receipt without second write',async()=>{const m=mock();await m.client.save(input());const second=await m.client.save(input());assert.equal(second.alreadyApplied,true);assert.equal(m.writes,1)});
test('reusing request ID with different content is rejected',async()=>{const m=mock();await m.client.save(input());const p=input();p.note='different';await assert.rejects(m.client.save(p),{code:'request_reused'});assert.equal(m.writes,1)});
test('uncertain write can be confirmed without replay',async()=>{const m=mock({afterWriteTimeout:true});await assert.rejects(m.client.save(input()),{code:'write_uncertain'});const r=await m.client.check(input());assert.equal(r.confirmed,true);assert.equal(m.writes,1)});
test('checking an unrecorded request does not write',async()=>{const m=mock();const r=await m.client.check(input());assert.equal(r.confirmed,false);assert.equal(m.writes,0)});

test('evidence accepts a supplementary JPEG and returns its media type',async()=>{
 const m=structuredClone(manifest),bytes=Buffer.from([255,216,255,217]);
 const shot=m.screenshots[0];shot.path='evidence/video_001/screenshots/supplement.jpg';shot.sha256=hash(bytes);shot.time_seconds=null;
 m.schema_version=2;m.media={type:'image'};delete m.video;
 const client=githubClient('test-credential',async url=>{
  const path=new URL(url).pathname;
  if(path.endsWith('/commits/main'))return Response.json({sha:sha1,commit:{message:'test'}});
  const key=path.split('/contents/')[1],content=key==='data/account.json'?Buffer.from(raw):key.endsWith('manifest.json')?Buffer.from(JSON.stringify(m)):bytes;
  return Response.json({type:'file',encoding:'base64',size:content.length,content:content.toString('base64')});
 });
 const result=await client.evidence(shot.id,sha1);assert.equal(result.contentType,'image/jpeg');assert.deepEqual(result.bytes,bytes);
 shot.sha256='0'.repeat(64);await assert.rejects(client.evidence(shot.id,sha1),{status:422});
});
