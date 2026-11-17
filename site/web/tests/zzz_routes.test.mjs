import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeZzzRouteUrl,readZzzRoute,zzzSection} from '../lib/zzz_routes.mjs';

const base='https://example.test/?game=zzz';
test('retired ZZZ team routes normalize to the roster and clear team identifiers',()=>{
 const url=normalizeZzzRouteUrl(base+'&tab=teams&team=pyrois-burst');
 assert.equal(url.searchParams.get('game'),'zzz');
 assert.equal(url.searchParams.has('tab'),false);
 assert.equal(url.searchParams.has('team'),false);
 assert.deepEqual(readZzzRoute(url),{section:'roster',agent:''});
});
test('old team character links keep their agent and saved roster state',()=>{
 const original=new URL(base+'&tab=teams&team=old&agent=sunna');
 const state=JSON.stringify({query:'千夏',filters:{},sorts:[]});original.searchParams.set('roster',state);
 const normalized=normalizeZzzRouteUrl(original);
 assert.equal(normalized.searchParams.get('roster'),state);
 assert.deepEqual(readZzzRoute(normalized),{section:'roster',agent:'sunna'});
 assert.equal(original.searchParams.get('team'),'old','normalization does not mutate its input');
});
test('growth remains reachable after its obsolete team scope is discarded',()=>{
 const url=normalizeZzzRouteUrl(base+'&tab=growth&team=old&agent=ju_fufu');
 assert.equal(url.searchParams.has('team'),false);
 assert.deepEqual(readZzzRoute(url),{section:'growth',agent:'ju_fufu'});
});
test('normalization is stable for roster and growth without obsolete parameters',()=>{
 for(const suffix of ['','&tab=growth','&agent=nicole','&tab=growth&agent=nicole']){
  const once=normalizeZzzRouteUrl(base+suffix);
  assert.equal(normalizeZzzRouteUrl(once).href,once.href);
 }
 assert.equal(zzzSection('teams'),'roster');
 assert.equal(zzzSection('growth'),'growth');
 assert.equal(zzzSection(null),'roster');
});
