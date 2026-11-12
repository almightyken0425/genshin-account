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

let server,CharacterCard,PortraitSummary,MediaImage,EquipmentTile,MetricDisplayContext;
const cacheDir=mkdtempSync(join(tmpdir(),'hoyo-component-tests-'));
before(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 server=await createServer({configFile:false,root,cacheDir,plugins:[react()],resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false},logLevel:'silent'});
 CharacterCard=(await server.ssrLoadModule('/components/character/character_card.tsx')).default;
 PortraitSummary=(await server.ssrLoadModule('/components/character/portrait_summary.tsx')).default;
 MediaImage=(await server.ssrLoadModule('/components/media/media_image.tsx')).default;
 EquipmentTile=(await server.ssrLoadModule('/components/equipment/equipment_tile.tsx')).default;
 ({MetricDisplayContext}=await server.ssrLoadModule('/components/metrics/metric_label.tsx'));
});
after(async()=>{await server?.close();rmSync(cacheDir,{recursive:true,force:true})});

const metrics=[{label:'角色等級',value:60},{label:'影畫',value:0},{label:'有效詞條總數',value:null}];
const image={src:'/test-art.png',alt:'測試角色'};
const render=(Component,props)=>renderToStaticMarkup(createElement(Component,props));

test('character card renders zero and unknown distinctly without visible metric labels',()=>{
 const html=render(CharacterCard,{name:'測試角色',image,metrics,disabled:true});
 assert.match(html,/<strong>60<\/strong>/);
 assert.match(html,/<strong>0<\/strong>/);
 assert.match(html,/<strong>—<\/strong>/);
 assert.match(html,/aria-label="[^\"]*影畫 0[^\"]*有效詞條總數 未知/);
 assert.doesNotMatch(html,/>角色等級<|>影畫<|>有效詞條總數</);
 assert.match(html,/<button[^>]*disabled/);
});

test('card and portrait keep image, translucent shade and metrics in the same order',()=>{
 for(const Component of [CharacterCard,PortraitSummary]){
  const html=render(Component,{name:'測試角色',image,metrics});
  const picture=html.indexOf('<img'),shade=html.indexOf('class="image-surface__shade"'),overlay=html.indexOf('class="image-surface__overlay"');
  assert.ok(picture>=0&&shade>picture&&overlay>shade);
  assert.equal((html.match(/class="character-metric"/g)||[]).length,3);
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
 for(const folder of ['media','metrics','character','equipment','navigation']){
  const directory=new URL('../components/'+folder+'/',import.meta.url);
  for(const name of readdirSync(directory).filter(name=>/\.tsx?$/.test(name))){
   const source=readFileSync(new URL(name,directory),'utf8');
   assert.doesNotMatch(source,/from ['"](?:@\/app\/|(?:\.\.\/)+app\/|@\/lib\/(?:zzz_|game_assets|account|types))/);
  }
 }
});
