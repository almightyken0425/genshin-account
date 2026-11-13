import test from 'node:test';
import assert from 'node:assert/strict';
import {maximumEffectiveRollBudget,completeLoadout} from '../lib/roll_budget.mjs';

test('theoretical effective maximum excludes exact main key, deduplicates and caps initial rows at four',()=>{
 assert.equal(maximumEffectiveRollBudget({mainKey:'atk',effectiveKeys:['atk','atk_pct']}),6);
 assert.equal(maximumEffectiveRollBudget({mainKey:'atk_pct',effectiveKeys:['atk','atk_pct']}),6);
 assert.equal(maximumEffectiveRollBudget({mainKey:'hp',effectiveKeys:['atk','atk','atk_pct']}),7);
 assert.equal(maximumEffectiveRollBudget({mainKey:'hp',effectiveKeys:['atk','atk_pct','crit_rate','crit_dmg','em','energy_recharge']}),9);
});
test('no eligible effective candidate yields zero instead of five and unknown stays unknown',()=>{
 assert.equal(maximumEffectiveRollBudget({mainKey:'atk',effectiveKeys:[]}),0);
 assert.equal(maximumEffectiveRollBudget({mainKey:'atk',effectiveKeys:['atk']}),0);
 assert.equal(maximumEffectiveRollBudget({mainKey:'atk',effectiveKeys:null}),null);
 assert.equal(maximumEffectiveRollBudget({mainKey:null,effectiveKeys:['atk']}),null);
 assert.equal(maximumEffectiveRollBudget(),null);
});
test('malformed profiles or limits cannot create a theoretical maximum',()=>{
 for(const effectiveKeys of [['atk',null],['atk',''],Array(2)])assert.equal(maximumEffectiveRollBudget({mainKey:'hp',effectiveKeys}),null);
 assert.equal(maximumEffectiveRollBudget({mainKey:'hp',effectiveKeys:['atk'],initialLimit:0}),null);
 assert.equal(maximumEffectiveRollBudget({mainKey:'hp',effectiveKeys:['atk'],enhancementLimit:-1}),null);
});
test('complete loadout validation rejects unknown, duplicate and extra slots',()=>{
 const slots=[1,2,3];const items=slots.map(slot=>({slot}));assert.equal(completeLoadout(items,slots),true);
 for(const incomplete of [null,undefined,[...items,null],[items[0],items[0],items[2]],[items[0],undefined,items[2]],[items[0],{slot:9},items[2]]])assert.equal(completeLoadout(incomplete,slots),false);
});
