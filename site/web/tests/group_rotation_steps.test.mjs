import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {groupRotationSteps} from '../lib/group_rotation_steps.mjs';
const source=readFileSync(new URL('../lib/team_flows.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022}});
const {teamFlows}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
for(const [id,steps] of Object.entries(teamFlows))test(`${id}: group adjacent cards without changing actions or mutating source`,()=>{
 const before=structuredClone(steps),cards=groupRotationSteps(steps);
 assert.deepEqual(steps,before);
 assert.deepEqual(cards.flatMap(s=>s.moves.map(move=>[s.id,move])),steps.flatMap(s=>s.moves.map(move=>[s.id,move])));
 assert.ok(cards.every((s,i)=>!i||s.id!==cards[i-1].id));
});
test('requested repeated sections share cards and switch-backs remain separate',()=>{
 const n=groupRotationSteps(teamFlows.nefer);assert.equal(n.length,5);assert.deepEqual(n.at(-1).moves,['E → 長 A','E → 長 A']);
 const v=groupRotationSteps(teamFlows.neuvillette);assert.equal(v.length,9);assert.deepEqual(v.at(-1).moves,['重 A','重 A']);assert.equal(v.filter(s=>s.id==='neuvillette').length,3);
 const va=groupRotationSteps(teamFlows.varesa);assert.equal(va.length,5);assert.equal(va.at(-1).moves.length,2);
 assert.equal(groupRotationSteps(teamFlows.zibai).at(-1).moves.length,5);
});
test('renderer uses shared grouping',()=>assert.match(readFileSync(new URL('../app/team_flow.tsx',import.meta.url),'utf8'),/groupRotationSteps\(teamFlows\[id\]\)/));
