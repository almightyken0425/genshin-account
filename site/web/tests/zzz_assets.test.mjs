import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync(new URL('../lib/zzz_assets.json',import.meta.url)));
test('all 38 ZZZ characters have independent full display artwork',()=>{
 assert.equal(Object.keys(catalog.characters).length,38);
 for(const art of Object.values(catalog.characters))for(const kind of ['icon','splash']){
  assert.match(art[kind],/^\/assets\/zzz\/characters\//);
  assert.ok(readFileSync(new URL('../public'+art[kind],import.meta.url)).length>1000);
 }
});
test('ZZZ artwork provenance is local, complete and hash verified',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/zzz_asset_sources.json',import.meta.url)));
 assert.ok(manifest.sources.length>=67);
 for(const item of manifest.sources){
  assert.match(item.path,/^\/assets\/zzz\//);
  assert.match(item.url,/^https:\/\/((?:fastcdn|webstatic)\.hoyoverse\.com|enka\.network)\//);
  assert.equal(createHash('sha256').update(readFileSync(new URL('../public'+item.path,import.meta.url))).digest('hex'),item.sha256);
 }
});
test('display portraits do not fall back to video crops and preserve evidence API',()=>{
 const dashboard=readFileSync(new URL('../app/zzz_dashboard.tsx',import.meta.url),'utf8');
 assert.match(dashboard,/zzzCharacterImage/);assert.ok(!dashboard.includes('/api/zzz/image'));
 const evidence=readFileSync(new URL('../lib/github.mjs',import.meta.url),'utf8');assert.match(evidence,/portraitSha256/);
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');assert.match(css,/zzz-portrait-stage>img\{transform:none;object-fit:contain/);
});
