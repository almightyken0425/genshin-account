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
test('footer has three owner-specified destinations',()=>{
 assert.match(dashboard,/aria-label="主要分頁"/);
 assert.match(dashboard,/switchTab\('teams'\)/);assert.match(dashboard,/switchTab\('roster'\)/);
 assert.match(dashboard,/selectedTeams.map/);assert.match(dashboard,/switchTab\('growth'\)/);assert.match(dashboard,/openTeam\(team.id\)/);assert.ok(!dashboard.includes('teams-heading'));assert.match(dashboard,/返回隊伍列表/);
 assert.match(dashboard,/window\.history\.pushState/);assert.match(dashboard,/popstate/);
});

test('exactly seven owner-selected teams and no Chasca',()=>{
 const teams=readFileSync(new URL('../lib/selected_teams.ts',import.meta.url),'utf8');
 assert.equal((teams.match(/members:/g)||[]).length,7);assert.ok(!teams.includes("'chasca'"));
});

test('Skirk uses a mobile flow diagram with optional healing and direct handoff',()=>{
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 assert.match(dashboard,/team.id==='skirk'\?<SkirkFlow/);
 for(const text of ['短 E → A2 → Q','A5 → 衝刺','A5 → 重擊','預設不按','不插入其他角色','不能保證絲柯克第一刀已滿層'])assert.ok(flow.includes(text),text);
});
