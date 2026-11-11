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
