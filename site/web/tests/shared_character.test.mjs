import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync,readdirSync,mkdtempSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

let server,CharacterCard,PortraitSummary,MediaImage,EquipmentTile,MetricDisplayContext,GameNavigation,TeamCard,TeamMembers,TeamOverviewPage,TeamDetailPage,GrowthTargetCard,GrowthPage,EscoffierGrowthTarget,revealAndFocus,effectiveRollMetric;
const cacheDir=mkdtempSync(join(tmpdir(),'hoyo-component-tests-'));
before(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 server=await createServer({configFile:false,root,cacheDir,plugins:[react()],resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false},logLevel:'silent'});
 CharacterCard=(await server.ssrLoadModule('/components/character/character_card.tsx')).default;
 PortraitSummary=(await server.ssrLoadModule('/components/character/portrait_summary.tsx')).default;
 MediaImage=(await server.ssrLoadModule('/components/media/media_image.tsx')).default;
 EquipmentTile=(await server.ssrLoadModule('/components/equipment/equipment_tile.tsx')).default;
 GameNavigation=(await server.ssrLoadModule('/components/navigation/game_navigation.tsx')).default;
 TeamCard=(await server.ssrLoadModule('/components/teams/team_card.tsx')).default;
 TeamMembers=(await server.ssrLoadModule('/components/teams/team_members.tsx')).default;
 TeamOverviewPage=(await server.ssrLoadModule('/components/pages/team_overview_page.tsx')).default;
 TeamDetailPage=(await server.ssrLoadModule('/components/pages/team_detail_page.tsx')).default;
 GrowthTargetCard=(await server.ssrLoadModule('/components/growth/growth_target_card.tsx')).default;
 GrowthPage=(await server.ssrLoadModule('/components/pages/growth_page.tsx')).default;
 EscoffierGrowthTarget=(await server.ssrLoadModule('/app/growth_target.tsx')).default;
 ({revealAndFocus}=await server.ssrLoadModule('/components/pages/restore_focus.ts'));
 ({effectiveRollMetric}=await server.ssrLoadModule('/components/metrics/effective_roll_metric.ts'));
 ({MetricDisplayContext}=await server.ssrLoadModule('/components/metrics/metric_label.tsx'));
});
after(async()=>{await server?.close();rmSync(cacheDir,{recursive:true,force:true})});

const metrics=[{label:'角色等級',value:60},{label:'影畫',value:0},{label:'有效詞條總數',value:null}];
const cardMetrics=[{label:'影畫',value:0},{label:'有效達成率',value:'—'}];
const image={src:'/test-art.png',alt:'測試角色'};
const render=(Component,props)=>renderToStaticMarkup(createElement(Component,props));

test('character card shows only mindscape and effective percentage in its visible and accessible values',()=>{
 for(const value of ['0%','—']){
  const html=render(CharacterCard,{name:'測試角色',image,metrics:[cardMetrics[0],{label:'有效達成率',value}],disabled:true});
  assert.match(html,/<strong>0<\/strong>/);
  assert.ok(html.includes('<strong>'+value+'</strong>'));
  assert.ok(html.includes('aria-label="查看測試角色的角色詳情，影畫 0，有效達成率 '+(value==='—'?'未知':value)+'"'));
  assert.doesNotMatch(html,/角色等級|有效詞條總數|>影畫<|>有效達成率</);
  assert.match(html,/<button[^>]*disabled/);
 }
});

test('card has two metrics and portrait has three while sharing the same image and shade stack',()=>{
 for(const [Component,values,count,variant] of [[CharacterCard,cardMetrics,2,'card'],[PortraitSummary,metrics,3,'portrait']]){
  const html=render(Component,{name:'測試角色',image,metrics:values});
  const picture=html.indexOf('<img'),shade=html.indexOf('class="image-surface__shade"'),overlay=html.indexOf('class="image-surface__overlay"');
  assert.ok(picture>=0&&shade>picture&&overlay>shade);
  assert.equal((html.match(/class="character-metric"/g)||[]).length,count);
  assert.ok(html.includes('character-metrics--'+variant));
 }
});

test('portrait summary keeps metric text hidden under a parent full-label mode',()=>{
 const html=renderToStaticMarkup(createElement(MetricDisplayContext,{value:true},createElement(PortraitSummary,{image,metrics})));
 assert.doesNotMatch(html,/class="metric-text"/);
 assert.match(html,/<strong>0<\/strong>/);
 assert.match(html,/<strong>—<\/strong>/);
});

test('media image exposes missing art and preserves decorative semantics',()=>{
 const missing=render(MediaImage,{alt:'測試角色'});
 assert.match(missing,/role="img"/);
 assert.match(missing,/aria-label="測試角色，尚無圖片"/);
 const decorative=render(MediaImage,{alt:''});
 assert.match(decorative,/aria-hidden="true"/);
 assert.doesNotMatch(decorative,/role="img"/);
 const ready=render(MediaImage,{src:'/test.png',alt:'測試角色',eager:true,style:{objectFit:'contain'}});
 assert.match(ready,/<img[^>]*loading="eager"/);
 assert.match(ready,/object-fit:contain/);
});

test('equipment labels follow the shared display mode while retaining accessible names',()=>{
 const preview=createElement('span',null,'裝備圖片');
 const compact=render(EquipmentTile,{label:'音擎',children:preview});
 assert.match(compact,/aria-label="音擎"/);
 assert.doesNotMatch(compact,/equipment-tile__label/);
 const full=renderToStaticMarkup(createElement(MetricDisplayContext,{value:true},createElement(EquipmentTile,{label:'武器'},preview)));
 assert.match(full,/<span class="equipment-tile__label">武器<\/span>/);
 assert.match(full,/裝備圖片/);
});

test('equipment tile keeps native disclosure and button semantics',()=>{
 const html=render(EquipmentTile,{label:'驅動盤','aria-label':'展開驅動盤詳情','aria-expanded':true,'aria-controls':'disc-details',disabled:true,children:'圖片'});
 assert.match(html,/type="button"/);
 assert.match(html,/aria-label="展開驅動盤詳情"/);
 assert.match(html,/aria-expanded="true"/);
 assert.match(html,/aria-controls="disc-details"/);
 assert.match(html,/<button[^>]*disabled/);
});

test('shared presentation layers do not depend on page or game-data modules',()=>{
 for(const folder of ['media','metrics','character','equipment','navigation','teams','pages','growth']){
  const directory=new URL('../components/'+folder+'/',import.meta.url);
  for(const name of readdirSync(directory).filter(name=>/\.tsx?$/.test(name))){
   const source=readFileSync(new URL(name,directory),'utf8');
   assert.doesNotMatch(source,/from ['"](?:@\/app\/|(?:\.\.\/)+app\/|@\/lib\/(?:zzz_|game_assets|account|types))/);
  }
 }
});

test('shared game navigation exposes three destinations with one current page',()=>{
 for(const section of ['teams','roster','growth']){
  const html=render(GameNavigation,{section,onSelect:()=>{}});
  for(const label of ['隊伍','角色列表','培養重點'])assert.ok(html.includes('aria-label="'+label+'"'));
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
  assert.doesNotMatch(html,/>隊伍<|>角色列表<|>培養重點</);
 }
});

test('team presentation keeps the same four-column surface and preserves member order',()=>{
 for(const count of [3,4]){
  const members=Array.from({length:count},(_,index)=>({id:'member_'+index,name:'角色'+index,src:'/member-'+index+'.webp'}));
  const card=render(TeamCard,{members,label:'查看隊伍',onClick:()=>{}});
  const detail=render(TeamMembers,{members,onOpenCharacter:()=>{}});
  assert.match(card,/shared-team-slots/);
  assert.match(detail,/shared-team-slots/);
  assert.doesNotMatch(card,/--team-count/);
  assert.doesNotMatch(detail,/--team-count/);
  assert.equal((detail.match(/aria-label="查看角色/g)||[]).length,count);
  for(let index=1;index<count;index++)assert.ok(detail.indexOf('/member-'+(index-1)+'.webp')<detail.indexOf('/member-'+index+'.webp'));
 }
});

test('a companion occupies a fourth slot without exposing a character route',()=>{
 const members=[
  {id:'agent_a',name:'角色甲',src:'/a.webp'},
  {id:'agent_b',name:'角色乙',src:'/b.webp'},
  {id:'agent_c',name:'角色丙',src:'/c.webp'},
  {kind:'companion',id:'companion',name:'尚未確認邦布'},
 ];
 const html=render(TeamMembers,{members,onOpenCharacter:()=>{}});
 assert.equal((html.match(/<button\b/g)||[]).length,3);
 assert.equal((html.match(/aria-label="查看角色/g)||[]).length,3);
 assert.doesNotMatch(html,/aria-label="查看尚未確認邦布角色詳情"/);
 assert.ok(html.indexOf('/c.webp')<html.indexOf('尚未確認邦布'));
 const opened=[];
 const slots=TeamMembers({members,onOpenCharacter:id=>opened.push(id)}).props.children;
 for(const slot of slots)slot.props.onClick?.();
 assert.deepEqual(opened,['agent_a','agent_b','agent_c']);
 assert.equal(slots[3].props.onClick,undefined);
});

test('team overview exposes a named team action while showing only four pictures',()=>{
 const members=Array.from({length:4},(_,index)=>({id:'member_'+index,name:'角色'+index,src:'/member-'+index+'.webp'}));
 const html=render(TeamOverviewPage,{teams:[{id:'test',name:'測試隊伍',members}],onOpenTeam:()=>{}});
 assert.equal((html.match(/<button\b/g)||[]).length,1);
 assert.equal((html.match(/<img\b/g)||[]).length,4);
 assert.match(html,/aria-label="[^"]*測試隊伍/);
 assert.doesNotMatch(html,/<h[1-6]\b|<strong\b|<figcaption\b|>測試隊伍</);
});

test('team detail owns the shared header, four slots, actions and one supplementary disclosure',()=>{
 const members=[
  {id:'agent_a',name:'角色甲',src:'/a.webp'},
  {id:'agent_b',name:'角色乙',src:'/b.webp'},
  {id:'agent_c',name:'角色丙',src:'/c.webp'},
  {kind:'companion',id:'companion',name:'邦布占位'},
 ];
 const html=render(TeamDetailPage,{title:'測試隊伍',members,onBack:()=>{},onOpenCharacter:()=>{},children:createElement('p',null,'保留原始操作內容'),supplementary:createElement('p',null,'隊伍理由與來源')});
 assert.match(html,/aria-label="返回隊伍列表"/);
 assert.equal((html.match(/<details\b/g)||[]).length,1);
 assert.equal((html.match(/<summary\b/g)||[]).length,1);
 assert.ok(html.indexOf('測試隊伍')<html.indexOf('/a.webp'));
 assert.ok(html.indexOf('/c.webp')<html.indexOf('保留原始操作內容'));
 assert.ok(html.indexOf('保留原始操作內容')<html.indexOf('隊伍理由與來源'));
 assert.equal((html.match(/aria-label="查看角色/g)||[]).length,3);
});

test('a recommended companion remains distinct from an owned character',()=>{
 const html=render(TeamMembers,{members:[{kind:'companion',id:'recommended_bot',name:'測試邦布',src:'/bot.webp',status:'recommended'}],onOpenCharacter:()=>{}});
 assert.match(html,/測試邦布，推薦邦布，持有狀態未確認/);
 assert.match(html,/<img[^>]*src="\/bot.webp"/);
 assert.doesNotMatch(html,/<button\b|data-focus-key="team-member:/);
});

test('growth target cards preserve observed zero, unknown and the requested target separately',()=>{
 const base={id:'test_target',character:{id:'agent',name:'測試角色',src:'/agent.webp'},title:'特殊技',kind:'upgrade',target:12,priority:'優先 2',detail:createElement('p',null,'僅在資源足夠時補足')};
 const zero=render(GrowthTargetCard,{target:{...base,current:0},onOpenCharacter:()=>{}});
 assert.match(zero,/aria-label="目前顯示0，本隊目標12"/);
 assert.match(zero,/aria-label="查看測試角色角色詳情"/);
 assert.match(zero,/<span class="growth-priority">優先 2<\/span>/);
 assert.equal((zero.match(/<details\b/g)||[]).length,1);
 assert.match(zero,/<summary>培養說明<\/summary>/);
 assert.match(zero,/僅在資源足夠時補足/);
 assert.doesNotMatch(zero,/<details[^>]*\bopen(?:[\s=>])/);
 const unknown=render(GrowthTargetCard,{target:{...base,current:null}});
 assert.match(unknown,/aria-label="目前顯示待核對，本隊目標12"/);
 assert.doesNotMatch(unknown,/aria-label="目前顯示0/);
});

test('growth page defaults to the all-team scope and collapses verification and completed records',()=>{
 const character={id:'agent',name:'測試角色',src:'/agent.webp'};
 const targets=[
  {id:'upgrade',character,title:'普攻升級',kind:'upgrade',current:6,target:11,priority:'優先 1'},
  {id:'verify',character,title:'核對音擎',kind:'verify'},
  {id:'complete',character,title:'核心技已達目標',kind:'complete',current:'F',target:'F'},
 ];
 const html=render(GrowthPage,{teams:[{id:'first',name:'第一隊'},{id:'second',name:'第二隊'}],teamId:'',onSelectTeam:()=>{},targets});
 assert.match(html,/<option value="" selected="">全部隊伍<\/option>/);
 assert.equal((html.match(/<select\b/g)||[]).length,1);
 assert.equal((html.match(/<article\b/g)||[]).length,3);
 assert.equal((html.match(/<details\b/g)||[]).length,2);
 assert.match(html,/<summary>待核對紀錄<span>1 項<\/span><\/summary>/);
 assert.match(html,/<summary>已達本次目標<span>1 項<\/span><\/summary>/);
 assert.doesNotMatch(html,/<details[^>]*\bopen(?:[\s=>])/);
 assert.doesNotMatch(html,/<h1\b/);
});

test('a filtered growth scope with no target exposes an explicit empty state',()=>{
 const html=render(GrowthPage,{teams:[{id:'without_target',name:'沒有愛可菲的隊伍'}],teamId:'without_target',onSelectTeam:()=>{},targets:[],emptyMessage:'這隊沒有既有的愛可菲培養目標。'});
 assert.match(html,/<option value="without_target" selected="">/);
 assert.match(html,/<p class="shared-page-empty" role="status">這隊沒有既有的愛可菲培養目標。<\/p>/);
 assert.doesNotMatch(html,/<article\b|<details\b/);
});

test('Genshin retains its one observed sands goal and filters it only by the shared team scope',()=>{
 for(const teamId of ['', 'skirk']){
  const html=render(EscoffierGrowthTarget,{teamId});
  assert.equal((html.match(/<article\b/g)||[]).length,1);
  for(const text of ['愛可菲','黃金劇團 · 時之沙','攻擊力 %','暴擊率','暴擊傷害','元素充能效率','楓丹 · 罪禍的終末','替換生命沙，保留劇團四件套'])assert.ok(html.includes(text),text);
  assert.equal((html.match(/class="growth-substats"/g)||[]).length,1);
  assert.equal((html.match(/<select\b/g)||[]).length,1);
 }
 const withoutEscoffier=render(EscoffierGrowthTarget,{teamId:'mavuika'});
 assert.doesNotMatch(withoutEscoffier,/<article\b/);
 assert.match(withoutEscoffier,/role="status"/);
 assert.match(withoutEscoffier,/<option value="mavuika" selected="">/);
});

test('return focus reveals every closed details ancestor before focusing the saved control',()=>{
 const events=[];
 const outer={tagName:'DETAILS',parentElement:null},middle={tagName:'DIV',parentElement:outer,open:'unchanged'},inner={tagName:'DETAILS',parentElement:middle};
 for(const [name,ancestor] of [['outer',outer],['inner',inner]]){
  let open=false;
  Object.defineProperty(ancestor,'open',{get:()=>open,set:value=>{open=value;events.push(name+':'+value)}});
 }
 const control={parentElement:inner,focus:options=>{
  assert.equal(inner.open,true);assert.equal(outer.open,true);
  assert.deepEqual(options,{preventScroll:true});events.push('focus');
 }};
 assert.equal(revealAndFocus(control),true);
 assert.deepEqual(events,['inner:true','outer:true','focus']);
 assert.equal(middle.open,'unchanged');
});

test('return focus leaves non-details ancestors untouched',()=>{
 const ancestor={tagName:'SECTION',parentElement:null,open:false};
 let focused=0;
 assert.equal(revealAndFocus({parentElement:ancestor,focus:options=>{assert.deepEqual(options,{preventScroll:true});focused++}}),true);
 assert.equal(ancestor.open,false);assert.equal(focused,1);
});

test('return focus reports a missing saved control without attempting focus',()=>{
 assert.equal(revealAndFocus(null),false);
 assert.equal(revealAndFocus(undefined),false);
});

test('effective portrait metric keeps the ratio visible and its explanation accessible only',()=>{
 const effective=effectiveRollMetric(6,9);
 const html=render(PortraitSummary,{image,metrics:[{label:'角色等級',value:60},{label:'影畫',value:0},effective]});
 assert.ok(html.includes('<strong>6／9</strong>'));
 assert.ok(html.includes('title="'+effective.label+'。'+effective.description+'"'));
 assert.ok(html.includes('aria-label="'+effective.label+' 6／9。'+effective.description+'"'));
 assert.doesNotMatch(html,/class="metric-text"/);
 assert.doesNotMatch(html,/>包含初始詞條/);
});
