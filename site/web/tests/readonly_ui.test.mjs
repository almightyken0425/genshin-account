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
 for(const text of ['E → Q','短 E → A2 → Q','A5 → 衝刺','A5 → 重擊'])assert.ok(flow.includes(text),text);
 for(const text of ['figcaption','flow-optional','flow-loop','flow-caution','step.name}</','連段 {'])assert.ok(!flow.includes(text),text);
});

test('Skirk exact four rows and no extra A5 or Escoffier Q',()=>{
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 assert.equal((flow.match(/A5/g)||[]).length,3);
 assert.match(flow,/RotationCard/);
 assert.match(flow,/id:'escoffier',name:'愛可菲',keys:'E'/);
 assert.match(dashboard,/<CenteredHeader title={team.name}/);
});

test('team members follow first appearance and detail cards contain images only',()=>{
 const teams=readFileSync(new URL('../lib/selected_teams.ts',import.meta.url),'utf8');
 assert.ok(teams.includes("members:['escoffier','furina','voyanitsa','skirk']"));
 const detail=dashboard.split('className="team-detail-members"')[1].split('<section className="team-guide"')[0];
 assert.ok(!detail.includes('<strong>'));assert.ok(!detail.includes('<small>'));assert.ok(detail.includes('<GameImage'));
});
test('all six other teams use minimal flows with conditional actions retained',()=>{
 const flow=readFileSync(new URL('../lib/team_flows.ts',import.meta.url),'utf8');
 for(const id of ['mavuika','zibai','nefer','neuvillette','varesa','mizuki'])assert.ok(flow.includes(' '+id+':['));
 for(const condition of ['可用時','撿火結晶','撿水結晶','月露不足','首輪','Q 未就緒'])assert.ok(flow.includes(condition));
 assert.match(dashboard,/<TeamFlow id={team.id}/);assert.ok(!dashboard.includes('目前配裝注意事項'));
});
test('Skirk action rows inherit one shared font size',()=>{
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.match(flow,/skirk-uniform-type/);
 assert.ok(css.includes('.skirk-uniform-type .minimal-flow-moves>strong,.skirk-uniform-type .minimal-flow-combos{font-size:inherit}'));
});
test('FAB restores after scrolling and stays reachable by keyboard',()=>{
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.match(dashboard,/idle=setTimeout\(\(\)=>setNavScrolling\(false\),180\)/);
 assert.match(dashboard,/onFocusCapture={\(\)=>setNavScrolling\(false\)}/);
 assert.match(css,/\.footer-fab.is-scrolling:not\(:focus-within\)/);
});
test('Mavuika keeps Bennett and the original melt rotation',()=>{
 const teams=readFileSync(new URL('../lib/selected_teams.ts',import.meta.url),'utf8');
 const flow=readFileSync(new URL('../lib/team_flows.ts',import.meta.url),'utf8').split(' zibai:[')[0];
 assert.ok(teams.includes("members:['mavuika','bennett','xilonen','citlali']"));
 assert.ok(flow.includes("id:'bennett'"));assert.ok(!flow.includes("id:'iansan'"));
 for(const text of ['撿火結晶','掛冰後','圈內持續摩托重擊'])assert.ok(flow.includes(text));
});
test('all team flow cards use equal action typography',()=>{
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.ok(css.includes('.skirk-minimal-flow .minimal-flow-moves>strong,.skirk-minimal-flow .minimal-flow-combos{font-size:inherit;font-weight:600;color:var(--ink);line-height:1.8;background:transparent;letter-spacing:normal}'));
});

test('rotation card copy has no parentheses and move area is centered',()=>{
 const flow=readFileSync(new URL('../lib/team_flows.ts',import.meta.url),'utf8');
 assert.ok(!/[（）()]/.test(flow));assert.ok(!flow.includes('親自'));
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.ok(css.includes('.skirk-minimal-flow .minimal-flow-moves{text-align:center}'));
});

test('team detail has no redundant rotation title',()=>{assert.ok(!dashboard.includes('<h3>操作手法</h3>'))});
test('growth page contains exactly the requested Escoffier sands target',()=>{
 const page=readFileSync(new URL('../app/growth_target.tsx',import.meta.url),'utf8');
 for(const text of ['愛可菲','黃金劇團','時之沙','攻擊力 %','暴擊率','暴擊傷害','元素充能效率','罪禍的終末','替換生命沙'])assert.ok(page.includes(text));
 assert.equal((page.match(/<article/g)||[]).length,1);assert.ok(!page.includes('等待根據'));
});

test('all team headers share a symmetric accessible component',()=>{
 const header=readFileSync(new URL('../app/centered_header.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
 assert.ok(header.includes('aria-label={backLabel}'));assert.ok(css.includes('grid-template-columns:44px minmax(0,1fr) 44px'));
 assert.ok(!dashboard.includes("team.id==='skirk'?'skirk-centered-header'"));
 for(const name of ['skirk_flow','team_flow'])assert.match(readFileSync(new URL('../app/'+name+'.tsx',import.meta.url),'utf8'),/RotationCard/);
});
test('shared rotation cards expose character identity to screen readers',()=>{
 const card=readFileSync(new URL('../app/rotation_card.tsx',import.meta.url),'utf8');
 assert.ok(card.includes('alt={characterName||lookupCharacterName(characterId)}'));
});
test('Zibai requested exact five rows and simplified support skills',()=>{
 const flow=readFileSync(new URL('../lib/team_flows.ts',import.meta.url),'utf8').split(' zibai:[')[1].split(' nefer:[')[0];
 assert.ok(flow.includes("id:'columbina',moves:['E → Q']"));assert.ok(flow.includes("id:'linnea',moves:['A → E']"));
 assert.ok(flow.includes("moves:['E → Q','A4 → E','A4 → E','A4 → E','A4 → E']"));assert.ok(!flow.includes('治療'));
});
test('rotation cards have compact layout without inter-card arrows',()=>{
 for(const name of ['skirk_flow','team_flow']){
  const flow=readFileSync(new URL('../app/'+name+'.tsx',import.meta.url),'utf8');
  assert.ok(!flow.includes('ArrowDown'));assert.ok(!flow.includes('minimal-flow-arrow'));
 }
 const flow=readFileSync(new URL('../app/skirk_flow.tsx',import.meta.url),'utf8');
 assert.ok(flow.includes('短 E → A2 → Q'));assert.ok(flow.includes('A5 → 衝刺'));
});
