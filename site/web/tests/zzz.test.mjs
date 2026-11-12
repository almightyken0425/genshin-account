import test from 'node:test';
import assert from 'node:assert/strict';
import {validateZzz,allowedZzzImage} from '../lib/zzz-schema.mjs';
import {readFileSync} from 'node:fs';
const character={id:'test_agent',name:'測試角色',level:null,mindscape:null,stats:null,skills:null,wEngine:null,driveDiscs:null,uncertainties:[],evidence:[{timestampSec:12,framePath:'evidence/zzz/test/frame.jpg',sha256:'a'.repeat(64)}]};
test('ZZZ preserves unknown values and requires evidence',()=>{
 assert.deepEqual(validateZzz({schemaVersion:1,game:'zzz',source:{filename:'test.mp4',sha256:'b'.repeat(64),durationSeconds:20,capturedAt:null},characters:[character]}),[]);
 assert.ok(validateZzz({schemaVersion:1,game:'zzz',source:{filename:'test.mp4',sha256:'b'.repeat(64),durationSeconds:20,capturedAt:null},characters:[{...character,evidence:[]}]}).length);
 assert.ok(validateZzz({schemaVersion:1,game:'genshin',characters:[character]}).length);
 assert.ok(validateZzz({schemaVersion:1,game:'zzz',source:{filename:'test.mp4',sha256:'b'.repeat(64),durationSeconds:20,capturedAt:null},characters:[character,character]}).length);
});
test('ZZZ image paths stay in owner-protected evidence directory',()=>{
 assert.ok(allowedZzzImage('evidence/zzz/recording/portraits/test.jpg'));
 for(const path of ['evidence/zzz/../secret.jpg','https://example.com/test.jpg','/Users/test.jpg','evidence/zzz/file.svg'])assert.equal(allowedZzzImage(path),false);
});
test('HOYO separates games, retains existing source and has no fabricated ZZZ fallback',()=>{
 const shell=readFileSync(new URL('../app/hoyo.tsx',import.meta.url),'utf8');
 assert.match(shell,/HOYO/);assert.match(shell,/絕區零/);assert.match(shell,/popstate/);
 const source=readFileSync(new URL('../lib/github.mjs',import.meta.url),'utf8');
 assert.match(source,/data\/account.json/);assert.match(source,/data\/zzz\/account.json/);
 const ui=readFileSync(new URL('../app/zzz_dashboard.tsx',import.meta.url),'utf8');
 assert.ok(!ui.includes('fixture'));assert.ok(!ui.includes('POST'));assert.ok(ui.includes('尚未確認'));
});

test('ZZZ account is read at a fixed GitHub head and does not write',async()=>{
 const {githubClient}=await import('../lib/github.mjs');
 const sha='f'.repeat(40),account={schemaVersion:1,game:'zzz',source:{filename:'test.mp4',sha256:'b'.repeat(64),durationSeconds:20,capturedAt:null},characters:[character]},calls=[];
 const client=githubClient('test-only',async(url,options)=>{calls.push([url,options]);if(url.endsWith('/commits/main'))return Response.json({sha});assert.ok(url.endsWith('/contents/data/zzz/account.json?ref='+sha));const text=JSON.stringify(account);return Response.json({type:'file',encoding:'base64',size:text.length,content:Buffer.from(text).toString('base64')})});
 const result=await client.readZzz();assert.equal(result.revision,sha);assert.deepEqual(result.account,account);assert.ok(calls.every(([,options])=>!options.method));
});

test('portrait uses the account revision and verifies its content',async()=>{
 const {githubClient}=await import('../lib/github.mjs');const {createHash}=await import('node:crypto');
 const revision='e'.repeat(40),image=Buffer.from('test image'),sha256=createHash('sha256').update(image).digest('hex');
 const account={schemaVersion:1,game:'zzz',source:{filename:'test.mp4',sha256:'b'.repeat(64),durationSeconds:20,capturedAt:null},characters:[{...character,portraitPath:'evidence/zzz/test/portrait.jpg',portraitSha256:sha256}]};
 const calls=[];const client=githubClient('test-only',async(url)=>{calls.push(url);assert.ok(url.endsWith('?ref='+revision));const data=url.includes('account.json')?Buffer.from(JSON.stringify(account)):image;return Response.json({type:'file',encoding:'base64',size:data.length,content:data.toString('base64')})});
 const result=await client.zzzImage(character.id,revision);assert.deepEqual(result.bytes,image);assert.equal(calls.length,2);assert.ok(calls.every(url=>!url.includes('/commits/')));
 await assert.rejects(()=>client.zzzImage(character.id,'main'));
});

test('observation notes use natural wording without changing source evidence',async()=>{
 const {zzzNote}=await import('../lib/zzz_notes.mjs');
 assert.equal(zzzNote('音擎未確認者為 null'),'音擎尚未確認');
 assert.equal(zzzNote('技能與驅動盤尚未完整逐項轉錄'),'技能與驅動盤尚未完整核對');
 assert.equal(zzzNote('驅動盤逐片主副詞條尚未完整抽取'),'驅動盤主副詞條尚未完整核對');
 assert.equal(zzzNote('驅動盤尚未逐片完整核對'),'驅動盤尚未逐片完整核對');
});
