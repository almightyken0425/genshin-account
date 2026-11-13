import test from 'node:test';
import assert from 'node:assert/strict';
import {selectZzzRoster,normalizeZzzElement,normalizeZzzSpecialty,zzzCultivation,emptyZzzFilters,parseZzzRosterState,serializeZzzRosterState} from '../lib/zzz_roster_view.mjs';
const make=(id,patch={})=>({id,name:id,level:60,mindscape:0,element:'火屬性',specialty:'強攻',wEngine:{level:60},driveDiscs:Array.from({length:6},(_,index)=>({slot:index+1,level:15})),...patch});
const rows=[make('a',{name:'A',element:'火',mindscape:0}),make('b',{name:'B',element:'火屬性',specialty:'支援',mindscape:6}),make('c',{name:'C',element:'電',mindscape:null}),make('d',{name:'D',element:'烈霜',level:null})];
const catalog={a:{rarity:'S',faction:'甲'},b:{rarity:'A',faction:'甲'},c:{rarity:'A',faction:'乙'},d:{rarity:'S',faction:'乙'}};
const ids=result=>result.map(row=>row.id);
const options=patch=>({catalog,filters:emptyZzzFilters(),sorts:[],...patch});

test('normalization preserves special attributes and does not rewrite account strings',()=>{
 assert.equal(normalizeZzzElement('火屬性'),'火');assert.equal(normalizeZzzElement('電'),'電');assert.equal(normalizeZzzElement('雷'),'電');assert.equal(normalizeZzzElement('烈霜屬性'),'烈霜');
 assert.equal(normalizeZzzSpecialty(' 支援角色 '),'支援');assert.equal(normalizeZzzElement(null),null);
 const before=structuredClone(rows);selectZzzRoster(rows,options());assert.deepEqual(rows,before);
});
test('base facets use OR within each category and AND across categories',()=>{
 assert.deepEqual(ids(selectZzzRoster(rows,options({filters:{...emptyZzzFilters(),rarities:['S','A'],elements:['火'],specialties:['強攻','支援']}}))),['a','b']);
 assert.deepEqual(ids(selectZzzRoster(rows,options({filters:{...emptyZzzFilters(),rarities:['A'],elements:['火']}}))),['b']);
});
test('advanced facets preserve observed zero and never infer rarity or faction',()=>{
 assert.deepEqual(ids(selectZzzRoster(rows,options({filters:{...emptyZzzFilters(),mindscapes:['0'],factions:['甲']}}))),['a']);
 assert.equal(selectZzzRoster(rows,options({catalog:{},filters:{...emptyZzzFilters(),rarities:['A','S']}})).length,0);
 assert.deepEqual(ids(selectZzzRoster(rows,options({filters:{...emptyZzzFilters(),factions:['甲','乙'],mindscapes:['6']}}))),['b']);
});
test('cultivation states describe levels and keep zero separate from missing data',()=>{
 assert.deepEqual(zzzCultivation(make('ready')),['levels-ready']);
 assert.deepEqual(zzzCultivation(make('zero',{wEngine:{level:0}})),['engine-leveling']);
 assert.deepEqual(zzzCultivation(make('unknown',{wEngine:null})),['unknown']);
 const discs=make('partial').driveDiscs.slice(1);discs[0].level=0;
 assert.deepEqual(zzzCultivation(make('partial',{level:20,driveDiscs:discs})),['character-leveling','discs-leveling','unknown']);
});
test('maximum and effective ratio sorts keep unknown values last in both directions',()=>{
 const effectiveTotals={a:12,b:20,c:0,d:null},maximumTotals={a:20,b:40,c:8,d:null};
 assert.deepEqual(ids(selectZzzRoster(rows,options({effectiveTotals,maximumTotals,sorts:[{key:'ratio',direction:'desc'}]}))),['a','b','c','d']);
 assert.deepEqual(ids(selectZzzRoster(rows,options({effectiveTotals,maximumTotals,sorts:[{key:'ratio',direction:'asc'}]}))),['c','b','a','d']);
 assert.deepEqual(ids(selectZzzRoster(rows,options({maximumTotals,sorts:[{key:'maximum',direction:'asc'}]}))),['c','a','b','d']);
 assert.deepEqual(ids(selectZzzRoster(rows,options({maximumTotals,sorts:[{key:'maximum',direction:'desc'}]}))),['b','a','c','d']);
});
test('ordered criteria, string direction and search remain independent of import order',()=>{
 assert.deepEqual(ids(selectZzzRoster([...rows].reverse(),options({sorts:[{key:'mindscape',direction:'desc'},{key:'level',direction:'desc'}]}))),['b','a','d','c']);
 assert.deepEqual(ids(selectZzzRoster(rows,options({sorts:[{key:'name',direction:'desc'}]}))),['d','c','b','a']);
 assert.deepEqual(ids(selectZzzRoster(rows,options({query:' b '}))),['b']);
});
test('zero denominators and missing numerator do not become zero percent',()=>{
 const effectiveTotals={a:0,b:0,c:null,d:2},maximumTotals={a:4,b:0,c:4,d:4};
 assert.deepEqual(ids(selectZzzRoster(rows,options({effectiveTotals,maximumTotals,sorts:[{key:'ratio',direction:'asc'}]}))),['a','d','b','c']);
});
test('roster URL state round trips and rejects malformed or duplicate sort rules',()=>{
 const state={query:'角色名字',filters:{...emptyZzzFilters(),rarities:['S'],factions:['甲'],mindscapes:['0']},sorts:[{key:'ratio',direction:'desc'},{key:'name',direction:'asc'}]};
 assert.deepEqual(parseZzzRosterState(serializeZzzRosterState(state)),state);
 assert.equal(serializeZzzRosterState(parseZzzRosterState(null)),null);
 assert.deepEqual(parseZzzRosterState('{bad'),parseZzzRosterState(null));
 const parsed=parseZzzRosterState(JSON.stringify({filters:{rarities:['A','A',1]},sorts:[{key:'ratio',direction:'desc'},{key:'ratio',direction:'asc'},{key:'invalid',direction:'desc'},{key:'name',direction:'sideways'}]}));
 assert.deepEqual(parsed.filters.rarities,['A']);assert.deepEqual(parsed.sorts,[{key:'ratio',direction:'desc'}]);
});
