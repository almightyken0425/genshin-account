import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const guides=JSON.parse(readFileSync(new URL('../lib/zzz_team_guides.json',import.meta.url),'utf8')).teams;
const plans=JSON.parse(readFileSync(new URL('../lib/zzz_training_plans.json',import.meta.url),'utf8')).characters;
const cacheDir=mkdtempSync(join(tmpdir(),'hoyo-guidance-ui-tests-'));
let server,ZzzGrowthPage,ZzzTeamDetail,ZzzTeamsOverview;
before(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 server=await createServer({configFile:false,root,cacheDir,plugins:[react()],resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false},logLevel:'silent'});
 ({ZzzGrowthPage,ZzzTeamDetail,ZzzTeamsOverview}=await server.ssrLoadModule('/app/zzz_guidance.tsx'));
});
after(async()=>{await server?.close();rmSync(cacheDir,{recursive:true,force:true})});

function character(id,skills={}){
 return {id,name:id,level:60,mindscape:plans[id].observedMindscape,skills:{...plans[id].displayedCaps,'核心技':'F',...skills},stats:null,wEngine:{name:'已確認音擎',level:60,refinement:1,rarity:'A',stats:null},driveDiscs:null,evidence:[]};
}
const charactersFor=(team,overrides={})=>team.members.map(member=>character(member.id,overrides[member.id]));
const renderGrowth=(team,characters)=>renderToStaticMarkup(createElement(ZzzGrowthPage,{teams:[team],characters,initialTeamId:team.id,onOpenCharacter:()=>{}}));
const upgradeSection=html=>html.split('aria-label="可提升項目"')[1]?.split('</section>')[0]||'';

test('shared member summary keeps observed values 13 to 16, zero and unknown in both pages',()=>{
 const team=guides.find(team=>team.members.some(member=>member.id==='manato'));
 const characters=charactersFor(team,{manato:{'普通攻擊':13,'閃避':14,'支援技':15,'特殊技':16,'連攜技':null,'核心技':0}});
 for(const html of [renderGrowth(team,characters),renderToStaticMarkup(createElement(ZzzTeamDetail,{team,characters,onBack:()=>{},onOpenCharacter:()=>{}}))]){
  const summary=html.split('aria-label="manato的技能顯示等級"')[1]?.split('</dl>')[0];
  assert.ok(summary);
  for(const value of ['13','14','15','16','0','—'])assert.ok(summary.includes('<dd>'+value+'</dd>'),value);
 }
});

test('priority one team member appears before a priority two main attacker',()=>{
 const team=guides.find(team=>team.members.some(member=>member.id==='manato'));
 const html=renderGrowth(team,charactersFor(team,{manato:{'特殊技':15,'連攜技':15},ju_fufu:{'普通攻擊':6}}));
 const upgrades=upgradeSection(html);
 assert.ok(upgrades.includes('aria-label="目前顯示6，本隊目標11"'));
 assert.ok(upgrades.includes('優先'));
 assert.ok(upgrades.includes('下一步'));
 assert.ok(upgrades.indexOf('查看ju_fufu角色詳情')<upgrades.indexOf('查看manato角色詳情'));
});

test('same priority preserves team order and low priority remains visibly optional',()=>{
 const team=guides.find(team=>team.members.some(member=>member.id==='damielle'));
 const html=renderGrowth(team,charactersFor(team,{velina:{'普通攻擊':11},yanagi:{'普通攻擊':11}}));
 const upgrades=upgradeSection(html);
 assert.ok(upgrades.includes('資源充裕再補'));
 assert.ok(upgrades.indexOf('查看velina角色詳情')<upgrades.indexOf('查看yanagi角色詳情'));
});

test('completed targets use a native disclosure that starts closed',()=>{
 const team=guides[0],html=renderGrowth(team,charactersFor(team));
 const disclosure=html.match(/<details[^>]*growth-disclosure--complete[^>]*>/)?.[0];
 assert.ok(disclosure);
 assert.doesNotMatch(disclosure,/\sopen(?:\s|=|>)/);
 assert.ok(html.includes('已達本次目標'));
 assert.ok(html.includes('目前主要技能目標已到位，可繼續檢視裝備詞條與操作循環。'));
});

test('unknown skill observations are not presented as completed training',()=>{
 const team=guides[0],characters=charactersFor(team).map(character=>({...character,skills:null}));
 const html=renderGrowth(team,characters);
 assert.ok(upgradeSection(html).includes('先核對技能目標與觀測'));
 assert.ok(!upgradeSection(html).includes('主要技能目標已到位'));
 assert.ok(html.includes('aria-label="目前顯示待核對，本隊目標'));
 assert.match(html,/<details[^>]*growth-disclosure--verify/);
});

test('unknown core or a missing teammate cannot make the whole team appear complete',()=>{
 const team=guides[0];
 const unknownCore=charactersFor(team,{[team.members[0].id]:{'核心技':null}});
 for(const characters of [unknownCore,charactersFor(team).slice(0,2)]){
  const upgrades=upgradeSection(renderGrowth(team,characters));
  assert.ok(!upgrades.includes('主要技能目標已到位'));
  assert.ok(upgrades.includes('先核對技能目標與觀測'));
 }
});

test('maintained support skills stay out of upgrade actions and retain follow-up direction',()=>{
 const team=guides.find(team=>team.members.some(member=>member.id==='sunna'));
 const html=renderGrowth(team,charactersFor(team,{sunna:{'普通攻擊':1,'閃避':1}}));
 assert.ok(!upgradeSection(html).includes('查看sunna角色詳情'));
 assert.ok(html.includes('維持與後續檢視'));
 for(const detail of plans.sunna.maintain)assert.ok(html.includes(detail));
});

test('account assessment remains optional and exposes alternatives when supplied',()=>{
 const original=guides[0],team={...original,accountAssessment:{verdict:'保留這套搭配',reason:'目前主線已到位',alternatives:['有生存需要時調整支援']}};
 const html=renderGrowth(team,charactersFor(team));
 for(const copy of ['保留這套搭配','目前主線已到位','有生存需要時調整支援'])assert.ok(html.includes(copy));
 assert.ok(!renderGrowth({...original,accountAssessment:undefined},charactersFor(original)).includes('目前主線已到位'));
 assert.ok(!html.includes('本隊培養方向'));
});


test('ZZZ overview shares the pure four-slot presentation without visible title or summary',()=>{
 const team=guides[0],html=renderToStaticMarkup(createElement(ZzzTeamsOverview,{teams:[team],characters:charactersFor(team),onOpenTeam:()=>{}}));
 assert.match(html,/shared-team-overview/);
 assert.equal((html.match(/<button\b/g)||[]).length,1);
 assert.equal((html.match(/<img\b/g)||[]).length,4);
 assert.ok(html.includes(team.companion.src));
 assert.doesNotMatch(html,/<h[1-6]\b|<strong\b|zzz-guidance__intro|zzz-guidance__card-copy/);
 assert.ok(!html.includes(team.summary));
});

test('a team without a confirmed companion retains the shared fourth slot',()=>{
 const team={...guides[0],companion:undefined};
 const html=renderToStaticMarkup(createElement(ZzzTeamsOverview,{teams:[team],characters:charactersFor(team),onOpenTeam:()=>{}}));
 assert.equal((html.match(/<img\b/g)||[]).length,3);
 assert.match(html,/team-companion-placeholder/);
});

test('ZZZ detail keeps exact actions before a single closed supplement and a static companion slot',()=>{
 const team=guides[0],html=renderToStaticMarkup(createElement(ZzzTeamDetail,{team,characters:charactersFor(team),onBack:()=>{},onOpenCharacter:()=>{}}));
 assert.equal((html.match(/<details\b/g)||[]).length,1);
 assert.match(html,/<summary>補充資訊<\/summary>/);
 assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|=|>)/);
 assert.equal((html.match(/aria-label="查看[^"]*角色詳情"/g)||[]).length,3);
 const supplement=html.indexOf('<summary>補充資訊');
 for(const step of team.steps){assert.ok(html.indexOf(step.action)>0);assert.ok(html.indexOf(step.action)<supplement)}
 for(const text of [team.summary,team.reason,...team.activation])assert.ok(html.indexOf(text)>supplement,text);
});

test('all-team growth is the default and shared teammates produce one set of targets',()=>{
 const selected=guides.filter(team=>team.members.some(member=>member.id==='ju_fufu'));
 const ids=[...new Set(selected.flatMap(team=>team.members.map(member=>member.id)))];
 const characters=ids.map(id=>character(id,id==='ju_fufu'?{'普通攻擊':6}:{}));
 const html=renderToStaticMarkup(createElement(ZzzGrowthPage,{teams:selected,characters,onOpenCharacter:()=>{}}));
 assert.match(html,/<option value="" selected="">全部隊伍<\/option>/);
 assert.equal((upgradeSection(html).match(/aria-label="ju_fufu · 普通攻擊"/g)||[]).length,1);
 assert.ok(!html.includes('本隊培養方向'));
});

test('choosing a team limits growth targets to its observed members',()=>{
 const selected=guides.slice(0,2),ids=[...new Set(selected.flatMap(team=>team.members.map(member=>member.id)))],characters=ids.map(id=>character(id));
 const html=renderToStaticMarkup(createElement(ZzzGrowthPage,{teams:selected,characters,initialTeamId:selected[1].id,onOpenCharacter:()=>{}}));
 for(const member of selected[0].members.filter(member=>!selected[1].members.some(other=>other.id===member.id)))assert.ok(!html.includes('查看'+member.id+'角色詳情'));
 for(const member of selected[1].members)assert.ok(html.includes('查看'+member.id+'角色詳情'));
});
