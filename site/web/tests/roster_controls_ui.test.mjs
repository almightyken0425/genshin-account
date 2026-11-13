import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
let server,GenshinControls,ZzzControls;
const cacheDir=mkdtempSync(join(tmpdir(),'hoyo-roster-controls-tests-'));
before(async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 server=await createServer({configFile:false,root,cacheDir,plugins:[react()],resolve:{alias:{'@':root}},server:{middlewareMode:true,hmr:false},logLevel:'silent'});
 GenshinControls=(await server.ssrLoadModule('/app/roster_controls.tsx')).default;
 ZzzControls=(await server.ssrLoadModule('/components/roster/zzz_roster_controls.tsx')).default;
});
after(async()=>{await server?.close();rmSync(cacheDir,{recursive:true,force:true})});
const render=(Component,props)=>renderToStaticMarkup(createElement(Component,props));
test('Genshin public props still render the shared controls with numeric rarity selection',()=>{
 const html=render(GenshinControls,{characters:[],rarities:{},filters:{rarities:[5],weapons:[],elements:['pyro']},onFilters:()=>{},sorts:[{key:'ratio',direction:'desc'},{key:'name',direction:'asc'}],onSorts:()=>{},maximumTotals:{}});
 assert.match(html,/class="roster-actions"/);assert.match(html,/aria-label="2 個篩選項目"/);assert.match(html,/aria-label="2 個排序條件"/);
 assert.match(html,/>篩選<|>排序</);
});
test('ZZZ uses the same controls and counts selected advanced facets',()=>{
 const html=render(ZzzControls,{characters:[],catalog:{},filters:{rarities:['A'],elements:['火'],specialties:[],factions:['甲'],mindscapes:['0'],cultivation:[]},onFilters:()=>{},sorts:[{key:'maximum',direction:'asc'}],onSorts:()=>{}});
 assert.match(html,/class="roster-actions"/);assert.match(html,/aria-label="4 個篩選項目"/);assert.match(html,/aria-label="1 個排序條件"/);
});
