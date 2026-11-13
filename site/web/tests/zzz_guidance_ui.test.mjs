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

const plans=JSON.parse(readFileSync(new URL('../lib/zzz_training_plans.json',import.meta.url),'utf8')).characters;
const catalog=JSON.parse(readFileSync(new URL('../lib/zzz_agent_catalog.json',import.meta.url),'utf8')).characters;
const cacheDir=mkdtempSync(join(tmpdir(),'hoyo-guidance-ui-tests-'));
let server,ZzzGrowthPage,GameNavigation;
before(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 server=await createServer({configFile:false,root,cacheDir,plugins:[react()],resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false},logLevel:'silent'});
 ({ZzzGrowthPage}=await server.ssrLoadModule('/app/zzz_guidance.tsx'));
 GameNavigation=(await server.ssrLoadModule('/components/navigation/game_navigation.tsx')).default;
});
after(async()=>{await server?.close();rmSync(cacheDir,{recursive:true,force:true})});

function character(id,skills={}){
 const plan=plans[id];
 return {id,name:id,level:60,mindscape:plan?.observedMindscape??0,skills:{...plan?.displayedCaps,'核心技':'F',...skills},stats:null,wEngine:{name:'已確認音擎',level:60,refinement:1,rarity:'A',stats:null},driveDiscs:null,evidence:[]};
}
const renderGrowth=characters=>renderToStaticMarkup(createElement(ZzzGrowthPage,{characters,onOpenCharacter:()=>{}}));
const upgradeSection=html=>html.split('aria-label="可提升項目"')[1]?.split('</section>')[0]||'';

test('ZZZ navigation contains only roster and growth while Genshin keeps all three destinations',()=>{
 const zzz=renderToStaticMarkup(createElement(GameNavigation,{sections:['roster','growth'],section:'roster',onSelect:()=>{}}));
 const genshin=renderToStaticMarkup(createElement(GameNavigation,{section:'roster',onSelect:()=>{}}));
 assert.doesNotMatch(zzz,/aria-label="隊伍"/);
 assert.equal((zzz.match(/<button\b/g)||[]).length,2);
 for(const label of ['隊伍','角色列表','培養重點'])assert.ok(genshin.includes('aria-label="'+label+'"'));
});

test('growth no longer renders team scope or consumes team guides',()=>{
 const html=renderGrowth([character('pyrois')]);
 assert.doesNotMatch(html,/<select\b|隊伍範圍|全部隊伍|本隊目標/);
 const guidance=readFileSync(new URL('../app/zzz_guidance.tsx',import.meta.url),'utf8');
 const dashboard=readFileSync(new URL('../app/zzz_dashboard.tsx',import.meta.url),'utf8');
 for(const source of [guidance,dashboard])assert.doesNotMatch(source,/zzz_team_guides|eligibleTeams|ZzzTeamsOverview|ZzzTeamDetail/);
 assert.match(dashboard,/sections=\{\['roster','growth'\]\}/);
});

test('all 38 recorded character identities reach growth, including characters outside old teams',()=>{
 const ids=Object.keys(catalog);
 assert.equal(ids.length,38);
 const html=renderGrowth(ids.map(id=>character(id)));
 for(const id of ids)assert.ok(html.includes('aria-label="'+id+'的技能顯示等級"'),id);
 for(const id of ids.filter(id=>!plans[id]))assert.ok(html.includes('aria-label="'+id+' · 培養目標待核對"'),id);
});

test('characters without a plan stay in verification without inventing skill targets',()=>{
 const html=renderGrowth([{...character('billy'),level:30,skills:null}]);
 assert.ok(html.includes('billy · 培養目標待核對'));
 assert.match(html,/<details[^>]*growth-disclosure--verify/);
 assert.doesNotMatch(html,/growth-progress|growth-disclosure--complete/);
 assert.ok(!upgradeSection(html).includes('查看billy角色詳情'));
});

test('skill summaries preserve displayed levels 13 to 16, zero and unknown',()=>{
 const html=renderGrowth([character('manato',{'普通攻擊':13,'閃避':14,'支援技':15,'特殊技':16,'連攜技':null,'核心技':0})]);
 const summary=html.split('aria-label="manato的技能顯示等級"')[1]?.split('</dl>')[0];
 assert.ok(summary);
 for(const value of ['13','14','15','16','0','—'])assert.ok(summary.includes('<dd>'+value+'</dd>'),value);
});

test('skill priority remains independent of roster order and low priorities stay optional',()=>{
 const html=renderGrowth([character('manato',{'特殊技':15,'連攜技':15}),character('ju_fufu',{'普通攻擊':6}),character('velina',{'普通攻擊':11})]);
 const upgrades=upgradeSection(html);
 assert.ok(upgrades.includes('aria-label="目前顯示6，培養目標11"'));
 for(const label of ['優先','下一步','資源充裕再補'])assert.ok(upgrades.includes(label));
 assert.ok(upgrades.indexOf('查看ju_fufu角色詳情')<upgrades.indexOf('查看manato角色詳情'));
});

test('completed targets stay in a closed disclosure and unknown skills cannot look complete',()=>{
 const complete=renderGrowth([character('pyrois')]);
 const disclosure=complete.match(/<details[^>]*growth-disclosure--complete[^>]*>/)?.[0];
 assert.ok(disclosure);assert.doesNotMatch(disclosure,/\sopen(?:\s|=|>)/);
 assert.ok(complete.includes('目前主要技能目標已到位'));
 const unknown=renderGrowth([{...character('pyrois'),skills:null}]);
 assert.ok(!upgradeSection(unknown).includes('主要技能目標已到位'));
 assert.ok(unknown.includes('aria-label="目前顯示待核對，培養目標'));
 assert.match(unknown,/<details[^>]*growth-disclosure--verify/);
});

test('an unplanned character prevents a blanket all-characters-complete claim',()=>{
 const html=renderGrowth([character('pyrois'),character('billy')]);
 assert.ok(!upgradeSection(html).includes('主要技能目標已到位'));
 assert.ok(html.includes('billy · 培養目標待核對'));
});

test('empty observations stay explicit rather than falling back to a team or fixture roster',()=>{
 const html=renderGrowth([]);
 assert.ok(html.includes('目前沒有角色紀錄。'));
 assert.doesNotMatch(html,/<select\b|growth-target-card--/);
});

test('the four focus cards lead upgrades, share card structure, and avoid duplicate Fufu or disc verification cards',()=>{
 const characters=JSON.parse(readFileSync(new URL('./fixtures/zzz_growth_focus.json',import.meta.url),'utf8'));
 const html=renderGrowth(characters),upgrades=upgradeSection(html);
 assert.equal((html.match(/aria-label="橘福福 · 普通攻擊"/g)||[]).length,1);
 for(const title of ['月城柳 · 先改善5號、6號盤的副詞條','星見雅 · 保留4號暴率主詞條，補強副詞條','佩洛伊斯 · 先換5號盤，補暴傷與攻擊'])assert.ok(upgrades.includes('aria-label="'+title+'"'),title);
 assert.ok(upgrades.indexOf('橘福福 · 普通攻擊')<upgrades.indexOf('月城柳 · 先改善'));
 assert.ok(!html.includes('檢視已強化盤的副詞條'));
 assert.ok(!html.includes('三支主力隊'));
 assert.match(html,/<summary>培養說明<\/summary>/);
 assert.ok(html.includes('https://wiki.hoyolab.com/pc/zzz/entry/750?lang=zh-tw'));
 assert.ok(html.includes('https://www.prydwen.gg/zenless/characters/miyabi'));
});
