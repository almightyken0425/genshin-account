import runtime0Module from "ajv/dist/runtime/ucs2length.js";const runtime0=runtime0Module.default??runtime0Module;
"use strict";
export const validate = validate20;
export default validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","title":"HOYO ZZZ video observations v1","type":"object","required":["schemaVersion","game","source","characters"],"properties":{"schemaVersion":{"const":1},"game":{"const":"zzz"},"source":{"type":"object","required":["filename","sha256","durationSeconds","capturedAt"],"properties":{"filename":{"type":"string","minLength":1},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"durationSeconds":{"type":"number","exclusiveMinimum":0},"capturedAt":{"type":["string","null"]}},"additionalProperties":true},"characters":{"type":"array","items":{"type":"object","required":["id","name","level","mindscape","stats","skills","wEngine","driveDiscs","evidence","uncertainties"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9_]+$"},"name":{"type":"string","minLength":1},"level":{"type":["integer","null"],"minimum":1,"maximum":60},"mindscape":{"type":["integer","null"],"minimum":0,"maximum":6},"stats":{"type":["object","null"],"additionalProperties":{"type":["number","string","null"]}},"skills":{"type":["object","null"],"additionalProperties":{"anyOf":[{"type":["integer","null"],"minimum":0,"maximum":20},{"type":"string","pattern":"^[A-F]$"}]}},"wEngine":{"type":["object","null"],"properties":{"name":{"type":["string","null"]},"rarity":{"type":["string","null"]},"level":{"type":["integer","null"],"minimum":1,"maximum":60},"refinement":{"type":["integer","null"],"minimum":1,"maximum":5},"stats":{"type":["object","null"],"additionalProperties":{"type":["number","string","null"]}}},"additionalProperties":true},"driveDiscs":{"type":["array","null"],"items":{"type":"object"}},"evidence":{"type":"array","minItems":1,"items":{"type":"object","required":["timestampSec","framePath","sha256"],"properties":{"timestampSec":{"type":"number","minimum":0},"framePath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"page":{"type":"string"},"timestampToleranceSec":{"type":"number","minimum":0},"fields":{"type":"array","items":{"type":"string"}}},"additionalProperties":false}},"portraitPath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"uncertainties":{"type":"array","items":{"type":"string"}},"portraitSha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"element":{"type":["string","null"]},"specialty":{"type":["string","null"]}},"additionalProperties":false}}},"additionalProperties":true};
const func1 = runtime0;
const func2 = Object.prototype.hasOwnProperty;
const pattern4 = new RegExp("^[0-9a-f]{64}$", "u");
const pattern5 = new RegExp("^[a-z0-9_]+$", "u");
const pattern6 = new RegExp("^[A-F]$", "u");
const pattern7 = new RegExp("^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$", "u");

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.game === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "game"},message:"must have required property '"+"game"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.source === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "source"},message:"must have required property '"+"source"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.characters === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "characters"},message:"must have required property '"+"characters"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.schemaVersion !== undefined){
if(1 !== data.schemaVersion){
const err4 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.game !== undefined){
if("zzz" !== data.game){
const err5 = {instancePath:instancePath+"/game",schemaPath:"#/properties/game/const",keyword:"const",params:{allowedValue: "zzz"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.source !== undefined){
let data2 = data.source;
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
if(data2.filename === undefined){
const err6 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/required",keyword:"required",params:{missingProperty: "filename"},message:"must have required property '"+"filename"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data2.sha256 === undefined){
const err7 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data2.durationSeconds === undefined){
const err8 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/required",keyword:"required",params:{missingProperty: "durationSeconds"},message:"must have required property '"+"durationSeconds"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data2.capturedAt === undefined){
const err9 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/required",keyword:"required",params:{missingProperty: "capturedAt"},message:"must have required property '"+"capturedAt"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data2.filename !== undefined){
let data3 = data2.filename;
if(typeof data3 === "string"){
if(func1(data3) < 1){
const err10 = {instancePath:instancePath+"/source/filename",schemaPath:"#/properties/source/properties/filename/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/source/filename",schemaPath:"#/properties/source/properties/filename/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data2.sha256 !== undefined){
let data4 = data2.sha256;
if(typeof data4 === "string"){
if(!pattern4.test(data4)){
const err12 = {instancePath:instancePath+"/source/sha256",schemaPath:"#/properties/source/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/source/sha256",schemaPath:"#/properties/source/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data2.durationSeconds !== undefined){
let data5 = data2.durationSeconds;
if(typeof data5 == "number"){
if(data5 <= 0 || isNaN(data5)){
const err14 = {instancePath:instancePath+"/source/durationSeconds",schemaPath:"#/properties/source/properties/durationSeconds/exclusiveMinimum",keyword:"exclusiveMinimum",params:{comparison: ">", limit: 0},message:"must be > 0"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/source/durationSeconds",schemaPath:"#/properties/source/properties/durationSeconds/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data2.capturedAt !== undefined){
let data6 = data2.capturedAt;
if((typeof data6 !== "string") && (data6 !== null)){
const err16 = {instancePath:instancePath+"/source/capturedAt",schemaPath:"#/properties/source/properties/capturedAt/type",keyword:"type",params:{type: schema31.properties.source.properties.capturedAt.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
}
else {
const err17 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.characters !== undefined){
let data7 = data.characters;
if(Array.isArray(data7)){
const len0 = data7.length;
for(let i0=0; i0<len0; i0++){
let data8 = data7[i0];
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
if(data8.id === undefined){
const err18 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data8.name === undefined){
const err19 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data8.level === undefined){
const err20 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(data8.mindscape === undefined){
const err21 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "mindscape"},message:"must have required property '"+"mindscape"+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(data8.stats === undefined){
const err22 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "stats"},message:"must have required property '"+"stats"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(data8.skills === undefined){
const err23 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "skills"},message:"must have required property '"+"skills"+"'"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(data8.wEngine === undefined){
const err24 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "wEngine"},message:"must have required property '"+"wEngine"+"'"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
if(data8.driveDiscs === undefined){
const err25 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "driveDiscs"},message:"must have required property '"+"driveDiscs"+"'"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(data8.evidence === undefined){
const err26 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "evidence"},message:"must have required property '"+"evidence"+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(data8.uncertainties === undefined){
const err27 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/required",keyword:"required",params:{missingProperty: "uncertainties"},message:"must have required property '"+"uncertainties"+"'"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
for(const key0 in data8){
if(!(func2.call(schema31.properties.characters.items.properties, key0))){
const err28 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data8.id !== undefined){
let data9 = data8.id;
if(typeof data9 === "string"){
if(!pattern5.test(data9)){
const err29 = {instancePath:instancePath+"/characters/" + i0+"/id",schemaPath:"#/properties/characters/items/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z0-9_]+$"},message:"must match pattern \""+"^[a-z0-9_]+$"+"\""};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/characters/" + i0+"/id",schemaPath:"#/properties/characters/items/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data8.name !== undefined){
let data10 = data8.name;
if(typeof data10 === "string"){
if(func1(data10) < 1){
const err31 = {instancePath:instancePath+"/characters/" + i0+"/name",schemaPath:"#/properties/characters/items/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
else {
const err32 = {instancePath:instancePath+"/characters/" + i0+"/name",schemaPath:"#/properties/characters/items/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data8.level !== undefined){
let data11 = data8.level;
if((!((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11)))) && (data11 !== null)){
const err33 = {instancePath:instancePath+"/characters/" + i0+"/level",schemaPath:"#/properties/characters/items/properties/level/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(typeof data11 == "number"){
if(data11 > 60 || isNaN(data11)){
const err34 = {instancePath:instancePath+"/characters/" + i0+"/level",schemaPath:"#/properties/characters/items/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 60},message:"must be <= 60"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(data11 < 1 || isNaN(data11)){
const err35 = {instancePath:instancePath+"/characters/" + i0+"/level",schemaPath:"#/properties/characters/items/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
}
if(data8.mindscape !== undefined){
let data12 = data8.mindscape;
if((!((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12)))) && (data12 !== null)){
const err36 = {instancePath:instancePath+"/characters/" + i0+"/mindscape",schemaPath:"#/properties/characters/items/properties/mindscape/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.mindscape.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if(typeof data12 == "number"){
if(data12 > 6 || isNaN(data12)){
const err37 = {instancePath:instancePath+"/characters/" + i0+"/mindscape",schemaPath:"#/properties/characters/items/properties/mindscape/maximum",keyword:"maximum",params:{comparison: "<=", limit: 6},message:"must be <= 6"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if(data12 < 0 || isNaN(data12)){
const err38 = {instancePath:instancePath+"/characters/" + i0+"/mindscape",schemaPath:"#/properties/characters/items/properties/mindscape/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
}
if(data8.stats !== undefined){
let data13 = data8.stats;
if((!(data13 && typeof data13 == "object" && !Array.isArray(data13))) && (data13 !== null)){
const err39 = {instancePath:instancePath+"/characters/" + i0+"/stats",schemaPath:"#/properties/characters/items/properties/stats/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.stats.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(data13 && typeof data13 == "object" && !Array.isArray(data13)){
for(const key1 in data13){
let data14 = data13[key1];
if(((!(typeof data14 == "number")) && (typeof data14 !== "string")) && (data14 !== null)){
const err40 = {instancePath:instancePath+"/characters/" + i0+"/stats/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/stats/additionalProperties/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.stats.additionalProperties.type},message:"must be number,string,null"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
}
}
if(data8.skills !== undefined){
let data15 = data8.skills;
if((!(data15 && typeof data15 == "object" && !Array.isArray(data15))) && (data15 !== null)){
const err41 = {instancePath:instancePath+"/characters/" + i0+"/skills",schemaPath:"#/properties/characters/items/properties/skills/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skills.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if(data15 && typeof data15 == "object" && !Array.isArray(data15)){
for(const key2 in data15){
let data16 = data15[key2];
const _errs37 = errors;
let valid7 = false;
const _errs38 = errors;
if((!((typeof data16 == "number") && (!(data16 % 1) && !isNaN(data16)))) && (data16 !== null)){
const err42 = {instancePath:instancePath+"/characters/" + i0+"/skills/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/skills/additionalProperties/anyOf/0/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skills.additionalProperties.anyOf[0].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
if(typeof data16 == "number"){
if(data16 > 20 || isNaN(data16)){
const err43 = {instancePath:instancePath+"/characters/" + i0+"/skills/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/skills/additionalProperties/anyOf/0/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if(data16 < 0 || isNaN(data16)){
const err44 = {instancePath:instancePath+"/characters/" + i0+"/skills/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/skills/additionalProperties/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
var _valid0 = _errs38 === errors;
valid7 = valid7 || _valid0;
const _errs40 = errors;
if(typeof data16 === "string"){
if(!pattern6.test(data16)){
const err45 = {instancePath:instancePath+"/characters/" + i0+"/skills/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/skills/additionalProperties/anyOf/1/pattern",keyword:"pattern",params:{pattern: "^[A-F]$"},message:"must match pattern \""+"^[A-F]$"+"\""};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
else {
const err46 = {instancePath:instancePath+"/characters/" + i0+"/skills/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/skills/additionalProperties/anyOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
var _valid0 = _errs40 === errors;
valid7 = valid7 || _valid0;
if(!valid7){
const err47 = {instancePath:instancePath+"/characters/" + i0+"/skills/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/skills/additionalProperties/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
else {
errors = _errs37;
if(vErrors !== null){
if(_errs37){
vErrors.length = _errs37;
}
else {
vErrors = null;
}
}
}
}
}
}
if(data8.wEngine !== undefined){
let data17 = data8.wEngine;
if((!(data17 && typeof data17 == "object" && !Array.isArray(data17))) && (data17 !== null)){
const err48 = {instancePath:instancePath+"/characters/" + i0+"/wEngine",schemaPath:"#/properties/characters/items/properties/wEngine/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
if(data17 && typeof data17 == "object" && !Array.isArray(data17)){
if(data17.name !== undefined){
let data18 = data17.name;
if((typeof data18 !== "string") && (data18 !== null)){
const err49 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/name",schemaPath:"#/properties/characters/items/properties/wEngine/properties/name/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.name.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
if(data17.rarity !== undefined){
let data19 = data17.rarity;
if((typeof data19 !== "string") && (data19 !== null)){
const err50 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/rarity",schemaPath:"#/properties/characters/items/properties/wEngine/properties/rarity/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.rarity.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
if(data17.level !== undefined){
let data20 = data17.level;
if((!((typeof data20 == "number") && (!(data20 % 1) && !isNaN(data20)))) && (data20 !== null)){
const err51 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/level",schemaPath:"#/properties/characters/items/properties/wEngine/properties/level/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
if(typeof data20 == "number"){
if(data20 > 60 || isNaN(data20)){
const err52 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/level",schemaPath:"#/properties/characters/items/properties/wEngine/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 60},message:"must be <= 60"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if(data20 < 1 || isNaN(data20)){
const err53 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/level",schemaPath:"#/properties/characters/items/properties/wEngine/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
}
if(data17.refinement !== undefined){
let data21 = data17.refinement;
if((!((typeof data21 == "number") && (!(data21 % 1) && !isNaN(data21)))) && (data21 !== null)){
const err54 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/refinement",schemaPath:"#/properties/characters/items/properties/wEngine/properties/refinement/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.refinement.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(typeof data21 == "number"){
if(data21 > 5 || isNaN(data21)){
const err55 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/refinement",schemaPath:"#/properties/characters/items/properties/wEngine/properties/refinement/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
if(data21 < 1 || isNaN(data21)){
const err56 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/refinement",schemaPath:"#/properties/characters/items/properties/wEngine/properties/refinement/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
}
if(data17.stats !== undefined){
let data22 = data17.stats;
if((!(data22 && typeof data22 == "object" && !Array.isArray(data22))) && (data22 !== null)){
const err57 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/stats",schemaPath:"#/properties/characters/items/properties/wEngine/properties/stats/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.stats.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
if(data22 && typeof data22 == "object" && !Array.isArray(data22)){
for(const key3 in data22){
let data23 = data22[key3];
if(((!(typeof data23 == "number")) && (typeof data23 !== "string")) && (data23 !== null)){
const err58 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/stats/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/wEngine/properties/stats/additionalProperties/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.stats.additionalProperties.type},message:"must be number,string,null"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
}
}
}
}
if(data8.driveDiscs !== undefined){
let data24 = data8.driveDiscs;
if((!(Array.isArray(data24))) && (data24 !== null)){
const err59 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs",schemaPath:"#/properties/characters/items/properties/driveDiscs/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.type},message:"must be array,null"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
if(Array.isArray(data24)){
const len1 = data24.length;
for(let i1=0; i1<len1; i1++){
let data25 = data24[i1];
if(!(data25 && typeof data25 == "object" && !Array.isArray(data25))){
const err60 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
}
}
if(data8.evidence !== undefined){
let data26 = data8.evidence;
if(Array.isArray(data26)){
if(data26.length < 1){
const err61 = {instancePath:instancePath+"/characters/" + i0+"/evidence",schemaPath:"#/properties/characters/items/properties/evidence/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
const len2 = data26.length;
for(let i2=0; i2<len2; i2++){
let data27 = data26[i2];
if(data27 && typeof data27 == "object" && !Array.isArray(data27)){
if(data27.timestampSec === undefined){
const err62 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2,schemaPath:"#/properties/characters/items/properties/evidence/items/required",keyword:"required",params:{missingProperty: "timestampSec"},message:"must have required property '"+"timestampSec"+"'"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
if(data27.framePath === undefined){
const err63 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2,schemaPath:"#/properties/characters/items/properties/evidence/items/required",keyword:"required",params:{missingProperty: "framePath"},message:"must have required property '"+"framePath"+"'"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
if(data27.sha256 === undefined){
const err64 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2,schemaPath:"#/properties/characters/items/properties/evidence/items/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
for(const key4 in data27){
if(!((((((key4 === "timestampSec") || (key4 === "framePath")) || (key4 === "sha256")) || (key4 === "page")) || (key4 === "timestampToleranceSec")) || (key4 === "fields"))){
const err65 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2,schemaPath:"#/properties/characters/items/properties/evidence/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
if(data27.timestampSec !== undefined){
let data28 = data27.timestampSec;
if(typeof data28 == "number"){
if(data28 < 0 || isNaN(data28)){
const err66 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/timestampSec",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/timestampSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
else {
const err67 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/timestampSec",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/timestampSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
if(data27.framePath !== undefined){
let data29 = data27.framePath;
if(typeof data29 === "string"){
if(!pattern7.test(data29)){
const err68 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/framePath",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/framePath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
else {
const err69 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/framePath",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/framePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
if(data27.sha256 !== undefined){
let data30 = data27.sha256;
if(typeof data30 === "string"){
if(!pattern4.test(data30)){
const err70 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/sha256",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
else {
const err71 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/sha256",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
if(data27.page !== undefined){
if(typeof data27.page !== "string"){
const err72 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/page",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/page/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
if(data27.timestampToleranceSec !== undefined){
let data32 = data27.timestampToleranceSec;
if(typeof data32 == "number"){
if(data32 < 0 || isNaN(data32)){
const err73 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/timestampToleranceSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
else {
const err74 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/timestampToleranceSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
if(data27.fields !== undefined){
let data33 = data27.fields;
if(Array.isArray(data33)){
const len3 = data33.length;
for(let i3=0; i3<len3; i3++){
if(typeof data33[i3] !== "string"){
const err75 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/fields/" + i3,schemaPath:"#/properties/characters/items/properties/evidence/items/properties/fields/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
}
else {
const err76 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2+"/fields",schemaPath:"#/properties/characters/items/properties/evidence/items/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
}
else {
const err77 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i2,schemaPath:"#/properties/characters/items/properties/evidence/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
}
else {
const err78 = {instancePath:instancePath+"/characters/" + i0+"/evidence",schemaPath:"#/properties/characters/items/properties/evidence/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
}
if(data8.portraitPath !== undefined){
let data35 = data8.portraitPath;
if(typeof data35 === "string"){
if(!pattern7.test(data35)){
const err79 = {instancePath:instancePath+"/characters/" + i0+"/portraitPath",schemaPath:"#/properties/characters/items/properties/portraitPath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
}
else {
const err80 = {instancePath:instancePath+"/characters/" + i0+"/portraitPath",schemaPath:"#/properties/characters/items/properties/portraitPath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
}
if(data8.uncertainties !== undefined){
let data36 = data8.uncertainties;
if(Array.isArray(data36)){
const len4 = data36.length;
for(let i4=0; i4<len4; i4++){
if(typeof data36[i4] !== "string"){
const err81 = {instancePath:instancePath+"/characters/" + i0+"/uncertainties/" + i4,schemaPath:"#/properties/characters/items/properties/uncertainties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
}
}
else {
const err82 = {instancePath:instancePath+"/characters/" + i0+"/uncertainties",schemaPath:"#/properties/characters/items/properties/uncertainties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
}
if(data8.portraitSha256 !== undefined){
let data38 = data8.portraitSha256;
if(typeof data38 === "string"){
if(!pattern4.test(data38)){
const err83 = {instancePath:instancePath+"/characters/" + i0+"/portraitSha256",schemaPath:"#/properties/characters/items/properties/portraitSha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
}
else {
const err84 = {instancePath:instancePath+"/characters/" + i0+"/portraitSha256",schemaPath:"#/properties/characters/items/properties/portraitSha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
}
if(data8.element !== undefined){
let data39 = data8.element;
if((typeof data39 !== "string") && (data39 !== null)){
const err85 = {instancePath:instancePath+"/characters/" + i0+"/element",schemaPath:"#/properties/characters/items/properties/element/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.element.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
}
if(data8.specialty !== undefined){
let data40 = data8.specialty;
if((typeof data40 !== "string") && (data40 !== null)){
const err86 = {instancePath:instancePath+"/characters/" + i0+"/specialty",schemaPath:"#/properties/characters/items/properties/specialty/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.specialty.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
}
}
else {
const err87 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
}
}
else {
const err88 = {instancePath:instancePath+"/characters",schemaPath:"#/properties/characters/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
}
}
else {
const err89 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
