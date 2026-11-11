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

test('Skirk flow is image and moves only, preserving full combo',()=>{
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 assert.match(dashboard,/team.id==='skirk'\?<SkirkFlow/);
 for(const text of ['E → A','E → Q','短 E → A2 → Q','A5 → 衝刺','A5 → 重擊'])assert.ok(flow.includes(text),text);
 for(const text of ['figcaption','flow-optional','flow-loop','flow-caution','step.name}</','連段 {'])assert.ok(!flow.includes(text),text);
});

test('Skirk exact four rows and no extra A5 or Escoffier Q',()=>{
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 assert.equal((flow.match(/A5/g)||[]).length,3);
 assert.equal((flow.match(/<span>/g)||[]).length,3);
 assert.match(flow,/id:'escoffier',name:'愛可菲',keys:'E → A'/);
 assert.match(dashboard,/skirk-centered-header/);
});

test('team members follow first appearance and detail cards contain images only',()=>{
 const teams=readFileSync(new URL('../lib/selected_teams.ts',import.meta.url),'utf8');
 assert.ok(teams.includes("members:['escoffier','furina','voyanitsa','skirk']"));
 const detail=dashboard.split('className="team-detail-members"')[1].split('<section className="team-guide">')[0];
 assert.ok(!detail.includes('<strong>'));assert.ok(!detail.includes('<small>'));assert.ok(detail.includes('<GameImage'));
});
test('all six other teams use minimal flows with conditional actions retained',()=>{
 const flow=readFileSync(new URL('../lib/team_flows.ts',import.meta.url),'utf8');
 for(const id of ['mavuika','zibai','nefer','neuvillette','varesa','mizuki'])assert.ok(flow.includes(' '+id+':['));
 for(const condition of ['可用時','親自撿火結晶','親自撿水結晶','月露不足','首輪','Q 未就緒'])assert.ok(flow.includes(condition));
 assert.match(dashboard,/<TeamFlow id={team.id}/);assert.ok(!dashboard.includes('目前配裝注意事項'));
});
test('Skirk action rows inherit one shared font size',()=>{
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.match(flow,/skirk-uniform-type/);
 assert.ok(css.includes('.skirk-uniform-type .minimal-flow-moves>strong,.skirk-uniform-type .minimal-flow-combos{font-size:inherit}'));
});
