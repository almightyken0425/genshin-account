import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const dashboard=readFileSync(new URL('../app/dashboard.tsx',import.meta.url),'utf8');
const substat=readFileSync(new URL('../app/artifact_substat.tsx',import.meta.url),'utf8');
test('account presentation has no edit, draft or save controls',()=>{
 for(const token of ['SaveControls','setDraft','mutate(','editing','/api/account/check','POST','textarea','type="number"']) assert.ok(!dashboard.includes(token),token);
 assert.ok(!existsSync(new URL('../app/save_controls.tsx',import.meta.url)));
 for(const token of ['<input','<select','onChange','onRoll']) assert.ok(!substat.includes(token),token);
});
test('footer has only the two owner-specified destinations',()=>{
 assert.match(dashboard,/aria-label="主要分頁"/);
 assert.match(dashboard,/switchTab\('teams'\)/);assert.match(dashboard,/switchTab\('roster'\)/);
 assert.match(dashboard,/配隊建議確認後/);
 assert.match(dashboard,/window\.history\.pushState/);assert.match(dashboard,/popstate/);
});
