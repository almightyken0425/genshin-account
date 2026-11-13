import test from 'node:test';
import assert from 'node:assert/strict';
import {selectRoster} from '../lib/roster_view.mjs';

const make=(id,name,element,weapon_type,constellation,level)=>({id,name,element,weapon_type,constellation,level:{current:level}});
const roster=[make('a','A','hydro','sword',1,90),make('b','B','hydro','bow',1,80),make('c','C','cryo','sword',6,90),make('d','D','pyro','catalyst',0,60)];
const options=(patch={})=>({filters:{rarities:[],weapons:[],elements:[]},sorts:[],query:'',effectiveTotals:{a:12,b:20,c:null,d:0},rarities:{a:5,b:4,c:5,d:4},...patch});
const ids=rows=>rows.map(row=>row.id);

test('filters accept alternatives within a category and combine categories',()=>{
 assert.deepEqual(ids(selectRoster(roster,options({filters:{rarities:[4,5],weapons:['sword','bow'],elements:['hydro']}}))),['a','b']);
 assert.deepEqual(ids(selectRoster(roster,options({filters:{rarities:[5],weapons:['sword','bow'],elements:['hydro']}}))),['a']);
});
test('all filters and search can produce an empty result without changing the roster',()=>{
 const before=structuredClone(roster);
 assert.deepEqual(selectRoster(roster,options({filters:{rarities:[4],weapons:['sword'],elements:[]}})),[]);
 assert.deepEqual(ids(selectRoster(roster,options({query:' B '}))),['b']);
 assert.deepEqual(roster,before);
});
test('default order groups elements and finishes with name, independent of import order',()=>{
 assert.deepEqual(ids(selectRoster([...roster].reverse(),options())),['d','a','b','c']);
});
test('manual sorting has priority over default element groups',()=>{
 assert.deepEqual(ids(selectRoster(roster,options({sorts:[{key:'constellation',direction:'desc'}]}))),['c','a','b','d']);
 assert.deepEqual(ids(selectRoster(roster,options({sorts:[{key:'effective',direction:'desc'}]}))),['b','a','d','c']);
});
test('default element and name ordering only break ties after every manual criterion',()=>{
 const rows=[make('hydro90','B','hydro','sword',2,90),make('pyro80','A','pyro','sword',2,80),make('pyro90','Z','pyro','sword',2,90)];
 assert.deepEqual(ids(selectRoster(rows,options({sorts:[{key:'constellation',direction:'desc'},{key:'level',direction:'desc'}]}))),['pyro90','hydro90','pyro80']);
});
test('multiple criteria follow the selected priority',()=>{
 const filters={rarities:[],weapons:[],elements:['hydro']};
 assert.deepEqual(ids(selectRoster(roster,options({filters,sorts:[{key:'constellation',direction:'desc'},{key:'effective',direction:'desc'},{key:'level',direction:'desc'}]}))),['b','a']);
 assert.deepEqual(ids(selectRoster(roster,options({filters,sorts:[{key:'level',direction:'desc'},{key:'effective',direction:'desc'}]}))),['a','b']);
});
test('ascending and descending keep unknown values last and preserve zero',()=>{
 const rows=[make('unknown','A','hydro','sword',null,null),make('zero','B','hydro','sword',0,0),make('high','C','hydro','sword',6,90)];
 for(const key of ['constellation','level','effective']){
  const effectiveTotals={unknown:null,zero:0,high:30};
  assert.deepEqual(ids(selectRoster(rows,options({effectiveTotals,sorts:[{key,direction:'desc'}]}))),['high','zero','unknown']);
  assert.deepEqual(ids(selectRoster(rows,options({effectiveTotals,sorts:[{key,direction:'asc'}]}))),['zero','high','unknown']);
 }
});
test('tied selected values finish with name and a stable identity fallback',()=>{
 const rows=[make('b','B','hydro','sword',2,90),make('a2','A','hydro','sword',2,90),make('a1','A','hydro','sword',2,90)];
 assert.deepEqual(ids(selectRoster(rows,options({sorts:[{key:'constellation',direction:'desc'},{key:'level',direction:'desc'}]}))),['a1','a2','b']);
});
test('missing catalog rarity is not silently treated as four or five stars',()=>{
 assert.equal(selectRoster(roster,options({rarities:{},filters:{rarities:[4,5],weapons:[],elements:[]}})).length,0);
 assert.equal(selectRoster(roster,options({rarities:{}})).length,4);
});

test('Genshin adapter shares maximum, ratio and name sorting with the generic engine',()=>{
 const maximumTotals={a:20,b:40,c:null,d:8};
 assert.deepEqual(ids(selectRoster(roster,options({maximumTotals,sorts:[{key:'maximum',direction:'desc'}]}))),['b','a','d','c']);
 assert.deepEqual(ids(selectRoster(roster,options({maximumTotals,sorts:[{key:'ratio',direction:'desc'}]}))),['a','b','d','c']);
 assert.deepEqual(ids(selectRoster(roster,options({sorts:[{key:'name',direction:'asc'}]}))),['a','b','c','d']);
});
