import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateZzz} from '../lib/zzz-schema.mjs';
import {loadCurrentZzz} from './helpers/current_accounts.mjs';

const file=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const {raw,account,metadata}=loadCurrentZzz();
test('formal ZZZ observations validate and retain exact source identity',()=>{
 assert.deepEqual(validateZzz(account),[]);
 assert.equal(metadata.accountSha256,createHash('sha256').update(raw).digest('hex'));
 assert.match(metadata.preparedFromCommit,/^[a-f0-9]{40}$/);
 assert.equal(metadata.sourcePath,'data/zzz/account.json');
 assert.equal(account.characters.filter(c=>c.wEngine?.name&&c.wEngine?.stats).length,37);
 const partial=account.characters.find(c=>c.id==='koleda').wEngine;
 assert.deepEqual(partial,{name:null,rarity:'A',level:60,maxLevel:60,refinement:null,stats:null});
 const soldier=account.characters.find(c=>c.id==='soldier_11');
 assert.equal(soldier.wEngine.level,0);
 assert.equal(soldier.skills['核心技'],0);
});
test('formal ZZZ reads stay behind authentication without a snapshot fallback',()=>{
 const route=file('../app/api/zzz/route.ts');
 assert.match(route,/run\(request,false/);
 assert.match(route,/json\(await client\.readZzz\(\)\)/);
 assert.doesNotMatch(route,/withZzzReview|fixtures|review\//);
 assert.doesNotMatch(file('../app/zzz_dashboard.tsx'),/review\/zzz_account|zzz_review/);
});
