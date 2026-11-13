import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {renderToStaticMarkup} from 'react-dom/server';
import {transpileModule,ModuleKind,JsxEmit} from 'typescript';

const require=createRequire(import.meta.url);
const compile=source=>transpileModule(source,{compilerOptions:{module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX}}).outputText;
const helperModule={exports:{}};
new Function('require','module','exports',compile(readFileSync(new URL('../components/metrics/effective_roll_metric.ts',import.meta.url),'utf8')))(require,helperModule,helperModule.exports);
const {formatEffectiveRolls,formatEffectivePercent,effectiveRollMetric,EFFECTIVE_ROLL_DESCRIPTION}=helperModule.exports;
const componentModule={exports:{}};
// The unrelated stat label is outside this badge's rendering path.
new Function('require','module','exports',compile(readFileSync(new URL('../components/equipment/artifact_substat.tsx',import.meta.url),'utf8')))(id=>id==='@/components/metrics/metric_label'?{default:()=>null}:id==='@/components/metrics/effective_roll_metric'?helperModule.exports:require(id),componentModule,componentModule.exports);
const {EffectiveBadge}=componentModule.exports;
const render=props=>renderToStaticMarkup(EffectiveBadge(props));

test('effective formatter always presents current before maximum and keeps unknowns independent',()=>{
 for(const [count,maximum,expected] of [[6,9,'6／9'],[0,9,'0／9'],[6,null,'6／—'],[null,9,'—／9'],[null,null,'—／—'],[0,0,'0／0'],[undefined,0,'—／0'],[0,undefined,'0／—']])assert.equal(formatEffectiveRolls(count,maximum),expected);
});
test('effective percentage rounds normally and preserves unpadded single digits and zero',()=>{
 for(const [count,maximum,expected] of [[4,9,'44%'],[1,20,'5%'],[0,9,'0%'],[9,9,'100%']])assert.equal(formatEffectivePercent(count,maximum),expected);
});
test('effective percentage never turns unknown or invalid denominators into zero percent',()=>{
 for(const [count,maximum] of [[null,9],[undefined,9],[4,null],[4,undefined],[0,0],[4,0],[4,-1],[-1,20],[NaN,9],[4,NaN],[Infinity,9],[4,Infinity]])assert.equal(formatEffectivePercent(count,maximum),'—');
});
test('shared portrait metric defines observed-attribute estimates and includes initial rows',()=>{
 assert.deepEqual(effectiveRollMetric(6,9),{label:'目前有效次數／理論上限',value:'6／9',description:'包含初始詞條。上限依角色已確認有效屬性、排除相同主詞條後估算，未觀測屬性未計入。'});
 assert.equal(effectiveRollMetric(0,null).value,'0／—');
});
test('effective badge preserves the current-only default and initial-row semantics',()=>{
 const html=render({count:6,maximum:9});assert.match(html,/>6<\/span>/);assert.match(html,/目前有效次數 6/);assert.match(html,/包含初始詞條/);assert.doesNotMatch(html,/理論上限|6／9|9／6/);
 assert.match(render({count:0}),/>0<\/span>/);
});
test('combined badge shares formatter order and explains the estimated cap in title and aria',()=>{
 for(const [count,maximum,expected] of [[6,9,'6／9'],[6,null,'6／—'],[null,9,'—／9'],[null,null,'—／—'],[0,9,'0／9'],[0,0,'0／0']]){
  const html=render({maximum,count,mode:'both'});assert.ok(html.includes('>'+expected+'</span>'));
  const description='有效副詞條，目前有效次數 '+(count??'未知')+'，理論上限 '+(maximum??'未知')+'。'+EFFECTIVE_ROLL_DESCRIPTION;
  assert.ok(html.includes('title="'+description+'"'));assert.ok(html.includes('aria-label="'+description+'"'));
 }
});
test('maximum-only badge displays the role-dependent estimate independently and retains zero',()=>{
 const html=render({maximum:9,count:null,mode:'maximum'});assert.match(html,/>9<\/span>/);assert.match(html,/理論上限 9/);assert.match(html,/依角色已確認有效屬性/);assert.match(html,/排除相同主詞條/);assert.match(html,/未觀測屬性未計入/);assert.doesNotMatch(html,/目前有效次數/);
 assert.match(render({maximum:0,count:null,mode:'maximum'}),/>0<\/span>/);
 assert.match(render({maximum:null,count:6,mode:'maximum'}),/>—<\/span>/);
});
