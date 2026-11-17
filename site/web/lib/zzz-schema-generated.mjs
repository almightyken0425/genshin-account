import runtime0Module from "ajv/dist/runtime/ucs2length.js";const runtime0=runtime0Module.default??runtime0Module;
import runtime1Module from "ajv/dist/runtime/equal.js";const runtime1=runtime1Module.default??runtime1Module;
"use strict";
export const validate = validate20;
export default validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","title":"HOYO ZZZ observations v2","type":"object","required":["schemaVersion","game","source","characters"],"properties":{"schemaVersion":{"const":2},"game":{"const":"zzz"},"source":{"type":"object","required":["filename","sha256","durationSeconds","capturedAt"],"properties":{"filename":{"type":"string","minLength":1},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"durationSeconds":{"type":"number","exclusiveMinimum":0},"capturedAt":{"type":["string","null"]}},"additionalProperties":true},"characters":{"type":"array","items":{"type":"object","required":["id","name","level","mindscape","stats","skills","wEngine","driveDiscs","evidence","uncertainties"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9_]+$"},"name":{"type":"string","minLength":1},"level":{"type":["integer","null"],"minimum":1,"maximum":60},"mindscape":{"type":["integer","null"],"minimum":0,"maximum":6},"stats":{"type":["object","null"],"additionalProperties":{"type":["number","string","null"]}},"skills":{"type":["object","null"],"additionalProperties":{"anyOf":[{"type":["integer","null"],"minimum":0,"maximum":20},{"type":"string","pattern":"^[A-F]$"}]}},"wEngine":{"type":["object","null"],"properties":{"name":{"type":["string","null"]},"rarity":{"type":["string","null"]},"level":{"type":["integer","null"],"minimum":0,"maximum":60},"refinement":{"type":["integer","null"],"minimum":1,"maximum":5},"stats":{"type":["object","null"],"additionalProperties":{"type":["number","string","null"]}},"maxLevel":{"type":["integer","null"],"minimum":1,"maximum":60}},"additionalProperties":true},"driveDiscs":{"type":["array","null"],"maxItems":6,"items":{"type":"object","required":["id","slot","setName","rarity","level","mainStat","substats","effectiveRollCount","evidence","uncertainties","substatsComplete"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9_]+$"},"slot":{"type":"integer","minimum":1,"maximum":6},"setName":{"type":["string","null"]},"rarity":{"enum":["S","A","B",null]},"level":{"type":["integer","null"],"minimum":0,"maximum":15},"mainStat":{"type":"object","required":["name","value","unit"],"properties":{"name":{"type":["string","null"]},"value":{"type":["number","null"]},"unit":{"enum":["flat","percent",null]}},"additionalProperties":false},"substats":{"type":"array","maxItems":4,"items":{"type":"object","required":["name","value","unit","isEffective","enhancementCount"],"properties":{"name":{"type":["string","null"]},"value":{"type":["number","null"]},"unit":{"enum":["flat","percent",null]},"isEffective":{"type":["boolean","null"]},"enhancementCount":{"type":["integer","null"],"minimum":0,"maximum":5},"assessedEffective":{"type":["boolean","null"]},"enhancementSource":{"enum":["derived_fixed_roll","api","game_observed"]}},"additionalProperties":false}},"effectiveRollCount":{"type":["integer","null"],"minimum":0,"maximum":9},"evidence":{"type":"array","minItems":1,"items":{"oneOf":[{"type":"object","required":["timestampSec","framePath","sha256"],"properties":{"timestampSec":{"type":"number","minimum":0},"framePath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"page":{"type":"string"},"timestampToleranceSec":{"type":"number","minimum":0},"fields":{"type":"array","items":{"type":"string"}}},"additionalProperties":false},{"type":"object","required":["sourceId","record"],"properties":{"sourceId":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"record":{"type":"string","pattern":"^/zzz/characters/(0|[1-9][0-9]*)$"}},"additionalProperties":false}]}},"uncertainties":{"type":"array","items":{"type":"string"}},"substatsComplete":{"type":"boolean"},"effectiveKeys":{"type":"array","items":{"enum":["生命值|flat","生命值|percent","攻擊力|flat","攻擊力|percent","防禦力|flat","防禦力|percent","暴擊率|percent","暴擊傷害|percent","異常精通|flat","穿透值|flat"]},"uniqueItems":true},"assessment":{"type":"object","required":["ruleId","method"],"properties":{"ruleId":{"type":"string","minLength":1},"method":{"const":"role_rule"}},"additionalProperties":false}},"additionalProperties":false}},"evidence":{"type":"array","minItems":1,"items":{"oneOf":[{"type":"object","required":["timestampSec","framePath","sha256"],"properties":{"timestampSec":{"type":"number","minimum":0},"framePath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"page":{"type":"string"},"timestampToleranceSec":{"type":"number","minimum":0},"fields":{"type":"array","items":{"type":"string"}}},"additionalProperties":false},{"type":"object","required":["sourceId","record"],"properties":{"sourceId":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"record":{"type":"string","pattern":"^/zzz/characters/(0|[1-9][0-9]*)$"}},"additionalProperties":false}]}},"portraitPath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"uncertainties":{"type":"array","items":{"type":"string"}},"portraitSha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"element":{"type":["string","null"]},"specialty":{"type":["string","null"]},"statsEffective":{"type":"object","additionalProperties":{"type":["boolean","null"]}},"sync":{"type":"object","required":["apiId","sourceId"],"properties":{"apiId":{"type":"integer","minimum":1},"sourceId":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},"additionalProperties":false},"skillsBase":{"type":["object","null"],"properties":{"普通攻擊":{"type":["integer","null"],"minimum":0,"maximum":20},"閃避":{"type":["integer","null"],"minimum":0,"maximum":20},"支援技":{"type":["integer","null"],"minimum":0,"maximum":20},"特殊技":{"type":["integer","null"],"minimum":0,"maximum":20},"連攜技":{"type":["integer","null"],"minimum":0,"maximum":20}},"additionalProperties":false},"skillContext":{"type":"object","required":["provider","levelSemantics","coreRawLevel"],"properties":{"provider":{"const":"hoyolab"},"levelSemantics":{"const":"provider_displayed"},"coreRawLevel":{"type":["integer","null"],"minimum":0,"maximum":7}},"additionalProperties":false},"effectiveProfile":{"type":"object","required":["ruleId","method","keys"],"properties":{"ruleId":{"type":"string","minLength":1},"method":{"const":"role_rule"},"keys":{"type":"array","items":{"enum":["生命值|flat","生命值|percent","攻擊力|flat","攻擊力|percent","防禦力|flat","防禦力|percent","暴擊率|percent","暴擊傷害|percent","異常精通|flat","穿透值|flat"]},"uniqueItems":true}},"additionalProperties":false},"legacyObservation":{"type":"object","required":["id","name","level","mindscape","stats","skills","wEngine","driveDiscs","evidence","uncertainties"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9_]+$"},"name":{"type":"string","minLength":1},"level":{"type":["integer","null"],"minimum":1,"maximum":60},"mindscape":{"type":["integer","null"],"minimum":0,"maximum":6},"stats":{"type":["object","null"],"additionalProperties":{"type":["number","string","null"]}},"skills":{"type":["object","null"],"additionalProperties":{"anyOf":[{"type":["integer","null"],"minimum":0,"maximum":20},{"type":"string","pattern":"^[A-F]$"}]}},"wEngine":{"type":["object","null"],"properties":{"name":{"type":["string","null"]},"rarity":{"type":["string","null"]},"level":{"type":["integer","null"],"minimum":0,"maximum":60},"refinement":{"type":["integer","null"],"minimum":1,"maximum":5},"stats":{"type":["object","null"],"additionalProperties":{"type":["number","string","null"]}},"maxLevel":{"type":["integer","null"],"minimum":1,"maximum":60}},"additionalProperties":true},"driveDiscs":{"type":["array","null"],"maxItems":6,"items":{"type":"object","required":["id","slot","setName","rarity","level","mainStat","substats","effectiveRollCount","evidence","uncertainties","substatsComplete"],"properties":{"id":{"type":"string","pattern":"^[a-z0-9_]+$"},"slot":{"type":"integer","minimum":1,"maximum":6},"setName":{"type":["string","null"]},"rarity":{"enum":["S","A","B",null]},"level":{"type":["integer","null"],"minimum":0,"maximum":15},"mainStat":{"type":"object","required":["name","value","unit"],"properties":{"name":{"type":["string","null"]},"value":{"type":["number","null"]},"unit":{"enum":["flat","percent",null]}},"additionalProperties":false},"substats":{"type":"array","maxItems":4,"items":{"type":"object","required":["name","value","unit","isEffective","enhancementCount"],"properties":{"name":{"type":["string","null"]},"value":{"type":["number","null"]},"unit":{"enum":["flat","percent",null]},"isEffective":{"type":["boolean","null"]},"enhancementCount":{"type":["integer","null"],"minimum":0,"maximum":5}},"additionalProperties":false}},"effectiveRollCount":{"type":["integer","null"],"minimum":0,"maximum":9},"evidence":{"type":"array","minItems":1,"items":{"type":"object","required":["timestampSec","framePath","sha256"],"properties":{"timestampSec":{"type":"number","minimum":0},"framePath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"page":{"type":"string"},"timestampToleranceSec":{"type":"number","minimum":0},"fields":{"type":"array","items":{"type":"string"}}},"additionalProperties":false}},"uncertainties":{"type":"array","items":{"type":"string"}},"substatsComplete":{"type":"boolean"}},"additionalProperties":false}},"evidence":{"type":"array","minItems":1,"items":{"type":"object","required":["timestampSec","framePath","sha256"],"properties":{"timestampSec":{"type":"number","minimum":0},"framePath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"page":{"type":"string"},"timestampToleranceSec":{"type":"number","minimum":0},"fields":{"type":"array","items":{"type":"string"}}},"additionalProperties":false}},"portraitPath":{"type":"string","pattern":"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},"uncertainties":{"type":"array","items":{"type":"string"}},"portraitSha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"element":{"type":["string","null"]},"specialty":{"type":["string","null"]},"statsEffective":{"type":"object","additionalProperties":{"type":["boolean","null"]}}},"additionalProperties":false}},"additionalProperties":false}},"syncSources":{"type":"array","items":{"type":"object","required":["id","provider","retrievedAt","path","sha256"],"properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"provider":{"const":"hoyolab"},"retrievedAt":{"type":"string","minLength":1},"path":{"type":"string","pattern":"^imports/hoyolab/[a-z][a-z0-9_]*\\.json$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"}},"additionalProperties":false}}},"additionalProperties":true};
const func1 = runtime0;
const func2 = Object.prototype.hasOwnProperty;
const func0 = runtime1;
const pattern4 = new RegExp("^[0-9a-f]{64}$", "u");
const pattern5 = new RegExp("^[a-z0-9_]+$", "u");
const pattern6 = new RegExp("^[A-F]$", "u");
const pattern8 = new RegExp("^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$", "u");
const pattern10 = new RegExp("^[a-z][a-z0-9_]*$", "u");
const pattern11 = new RegExp("^/zzz/characters/(0|[1-9][0-9]*)$", "u");
const pattern29 = new RegExp("^imports/hoyolab/[a-z][a-z0-9_]*\\.json$", "u");

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
if(2 !== data.schemaVersion){
const err4 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue: 2},message:"must be equal to constant"};
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
if(data20 < 0 || isNaN(data20)){
const err53 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/level",schemaPath:"#/properties/characters/items/properties/wEngine/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
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
if(data17.maxLevel !== undefined){
let data24 = data17.maxLevel;
if((!((typeof data24 == "number") && (!(data24 % 1) && !isNaN(data24)))) && (data24 !== null)){
const err59 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/maxLevel",schemaPath:"#/properties/characters/items/properties/wEngine/properties/maxLevel/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.wEngine.properties.maxLevel.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
if(typeof data24 == "number"){
if(data24 > 60 || isNaN(data24)){
const err60 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/maxLevel",schemaPath:"#/properties/characters/items/properties/wEngine/properties/maxLevel/maximum",keyword:"maximum",params:{comparison: "<=", limit: 60},message:"must be <= 60"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
if(data24 < 1 || isNaN(data24)){
const err61 = {instancePath:instancePath+"/characters/" + i0+"/wEngine/maxLevel",schemaPath:"#/properties/characters/items/properties/wEngine/properties/maxLevel/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
}
}
}
}
if(data8.driveDiscs !== undefined){
let data25 = data8.driveDiscs;
if((!(Array.isArray(data25))) && (data25 !== null)){
const err62 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs",schemaPath:"#/properties/characters/items/properties/driveDiscs/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.type},message:"must be array,null"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
if(Array.isArray(data25)){
if(data25.length > 6){
const err63 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs",schemaPath:"#/properties/characters/items/properties/driveDiscs/maxItems",keyword:"maxItems",params:{limit: 6},message:"must NOT have more than 6 items"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
const len1 = data25.length;
for(let i1=0; i1<len1; i1++){
let data26 = data25[i1];
if(data26 && typeof data26 == "object" && !Array.isArray(data26)){
if(data26.id === undefined){
const err64 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
if(data26.slot === undefined){
const err65 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "slot"},message:"must have required property '"+"slot"+"'"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
if(data26.setName === undefined){
const err66 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "setName"},message:"must have required property '"+"setName"+"'"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
if(data26.rarity === undefined){
const err67 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "rarity"},message:"must have required property '"+"rarity"+"'"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if(data26.level === undefined){
const err68 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
if(data26.mainStat === undefined){
const err69 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "mainStat"},message:"must have required property '"+"mainStat"+"'"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
if(data26.substats === undefined){
const err70 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "substats"},message:"must have required property '"+"substats"+"'"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
if(data26.effectiveRollCount === undefined){
const err71 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "effectiveRollCount"},message:"must have required property '"+"effectiveRollCount"+"'"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
if(data26.evidence === undefined){
const err72 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "evidence"},message:"must have required property '"+"evidence"+"'"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
if(data26.uncertainties === undefined){
const err73 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "uncertainties"},message:"must have required property '"+"uncertainties"+"'"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
if(data26.substatsComplete === undefined){
const err74 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "substatsComplete"},message:"must have required property '"+"substatsComplete"+"'"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
for(const key4 in data26){
if(!(func2.call(schema31.properties.characters.items.properties.driveDiscs.items.properties, key4))){
const err75 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
if(data26.id !== undefined){
let data27 = data26.id;
if(typeof data27 === "string"){
if(!pattern5.test(data27)){
const err76 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/id",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z0-9_]+$"},message:"must match pattern \""+"^[a-z0-9_]+$"+"\""};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
else {
const err77 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/id",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
if(data26.slot !== undefined){
let data28 = data26.slot;
if(!((typeof data28 == "number") && (!(data28 % 1) && !isNaN(data28)))){
const err78 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/slot",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/slot/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
if(typeof data28 == "number"){
if(data28 > 6 || isNaN(data28)){
const err79 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/slot",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/slot/maximum",keyword:"maximum",params:{comparison: "<=", limit: 6},message:"must be <= 6"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
if(data28 < 1 || isNaN(data28)){
const err80 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/slot",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/slot/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
}
}
if(data26.setName !== undefined){
let data29 = data26.setName;
if((typeof data29 !== "string") && (data29 !== null)){
const err81 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/setName",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/setName/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.setName.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
}
if(data26.rarity !== undefined){
let data30 = data26.rarity;
if(!((((data30 === "S") || (data30 === "A")) || (data30 === "B")) || (data30 === null))){
const err82 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/rarity",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/rarity/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.driveDiscs.items.properties.rarity.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
}
if(data26.level !== undefined){
let data31 = data26.level;
if((!((typeof data31 == "number") && (!(data31 % 1) && !isNaN(data31)))) && (data31 !== null)){
const err83 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/level",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/level/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
if(typeof data31 == "number"){
if(data31 > 15 || isNaN(data31)){
const err84 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/level",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 15},message:"must be <= 15"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
if(data31 < 0 || isNaN(data31)){
const err85 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/level",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
}
}
if(data26.mainStat !== undefined){
let data32 = data26.mainStat;
if(data32 && typeof data32 == "object" && !Array.isArray(data32)){
if(data32.name === undefined){
const err86 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
if(data32.value === undefined){
const err87 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
if(data32.unit === undefined){
const err88 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
for(const key5 in data32){
if(!(((key5 === "name") || (key5 === "value")) || (key5 === "unit"))){
const err89 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
if(data32.name !== undefined){
let data33 = data32.name;
if((typeof data33 !== "string") && (data33 !== null)){
const err90 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat/name",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/properties/name/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.mainStat.properties.name.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
}
if(data32.value !== undefined){
let data34 = data32.value;
if((!(typeof data34 == "number")) && (data34 !== null)){
const err91 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat/value",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/properties/value/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.mainStat.properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
}
if(data32.unit !== undefined){
let data35 = data32.unit;
if(!(((data35 === "flat") || (data35 === "percent")) || (data35 === null))){
const err92 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat/unit",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/properties/unit/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.driveDiscs.items.properties.mainStat.properties.unit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err92];
}
else {
vErrors.push(err92);
}
errors++;
}
}
}
else {
const err93 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/mainStat",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/mainStat/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
}
if(data26.substats !== undefined){
let data36 = data26.substats;
if(Array.isArray(data36)){
if(data36.length > 4){
const err94 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/maxItems",keyword:"maxItems",params:{limit: 4},message:"must NOT have more than 4 items"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
const len2 = data36.length;
for(let i2=0; i2<len2; i2++){
let data37 = data36[i2];
if(data37 && typeof data37 == "object" && !Array.isArray(data37)){
if(data37.name === undefined){
const err95 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
if(data37.value === undefined){
const err96 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
if(data37.unit === undefined){
const err97 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
if(data37.isEffective === undefined){
const err98 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "isEffective"},message:"must have required property '"+"isEffective"+"'"};
if(vErrors === null){
vErrors = [err98];
}
else {
vErrors.push(err98);
}
errors++;
}
if(data37.enhancementCount === undefined){
const err99 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "enhancementCount"},message:"must have required property '"+"enhancementCount"+"'"};
if(vErrors === null){
vErrors = [err99];
}
else {
vErrors.push(err99);
}
errors++;
}
for(const key6 in data37){
if(!(((((((key6 === "name") || (key6 === "value")) || (key6 === "unit")) || (key6 === "isEffective")) || (key6 === "enhancementCount")) || (key6 === "assessedEffective")) || (key6 === "enhancementSource"))){
const err100 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err100];
}
else {
vErrors.push(err100);
}
errors++;
}
}
if(data37.name !== undefined){
let data38 = data37.name;
if((typeof data38 !== "string") && (data38 !== null)){
const err101 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/name",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/name/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.name.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err101];
}
else {
vErrors.push(err101);
}
errors++;
}
}
if(data37.value !== undefined){
let data39 = data37.value;
if((!(typeof data39 == "number")) && (data39 !== null)){
const err102 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/value",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/value/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err102];
}
else {
vErrors.push(err102);
}
errors++;
}
}
if(data37.unit !== undefined){
let data40 = data37.unit;
if(!(((data40 === "flat") || (data40 === "percent")) || (data40 === null))){
const err103 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/unit",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/unit/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.unit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err103];
}
else {
vErrors.push(err103);
}
errors++;
}
}
if(data37.isEffective !== undefined){
let data41 = data37.isEffective;
if((typeof data41 !== "boolean") && (data41 !== null)){
const err104 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/isEffective",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/isEffective/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.isEffective.type},message:"must be boolean,null"};
if(vErrors === null){
vErrors = [err104];
}
else {
vErrors.push(err104);
}
errors++;
}
}
if(data37.enhancementCount !== undefined){
let data42 = data37.enhancementCount;
if((!((typeof data42 == "number") && (!(data42 % 1) && !isNaN(data42)))) && (data42 !== null)){
const err105 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/enhancementCount",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/enhancementCount/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.enhancementCount.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err105];
}
else {
vErrors.push(err105);
}
errors++;
}
if(typeof data42 == "number"){
if(data42 > 5 || isNaN(data42)){
const err106 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/enhancementCount",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/enhancementCount/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err106];
}
else {
vErrors.push(err106);
}
errors++;
}
if(data42 < 0 || isNaN(data42)){
const err107 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/enhancementCount",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/enhancementCount/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err107];
}
else {
vErrors.push(err107);
}
errors++;
}
}
}
if(data37.assessedEffective !== undefined){
let data43 = data37.assessedEffective;
if((typeof data43 !== "boolean") && (data43 !== null)){
const err108 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/assessedEffective",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/assessedEffective/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.assessedEffective.type},message:"must be boolean,null"};
if(vErrors === null){
vErrors = [err108];
}
else {
vErrors.push(err108);
}
errors++;
}
}
if(data37.enhancementSource !== undefined){
let data44 = data37.enhancementSource;
if(!(((data44 === "derived_fixed_roll") || (data44 === "api")) || (data44 === "game_observed"))){
const err109 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2+"/enhancementSource",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/properties/enhancementSource/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.driveDiscs.items.properties.substats.items.properties.enhancementSource.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err109];
}
else {
vErrors.push(err109);
}
errors++;
}
}
}
else {
const err110 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats/" + i2,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err110];
}
else {
vErrors.push(err110);
}
errors++;
}
}
}
else {
const err111 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substats",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substats/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err111];
}
else {
vErrors.push(err111);
}
errors++;
}
}
if(data26.effectiveRollCount !== undefined){
let data45 = data26.effectiveRollCount;
if((!((typeof data45 == "number") && (!(data45 % 1) && !isNaN(data45)))) && (data45 !== null)){
const err112 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/effectiveRollCount",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/effectiveRollCount/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.driveDiscs.items.properties.effectiveRollCount.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err112];
}
else {
vErrors.push(err112);
}
errors++;
}
if(typeof data45 == "number"){
if(data45 > 9 || isNaN(data45)){
const err113 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/effectiveRollCount",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/effectiveRollCount/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9},message:"must be <= 9"};
if(vErrors === null){
vErrors = [err113];
}
else {
vErrors.push(err113);
}
errors++;
}
if(data45 < 0 || isNaN(data45)){
const err114 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/effectiveRollCount",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/effectiveRollCount/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err114];
}
else {
vErrors.push(err114);
}
errors++;
}
}
}
if(data26.evidence !== undefined){
let data46 = data26.evidence;
if(Array.isArray(data46)){
if(data46.length < 1){
const err115 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err115];
}
else {
vErrors.push(err115);
}
errors++;
}
const len3 = data46.length;
for(let i3=0; i3<len3; i3++){
let data47 = data46[i3];
const _errs104 = errors;
let valid19 = false;
let passing0 = null;
const _errs105 = errors;
if(data47 && typeof data47 == "object" && !Array.isArray(data47)){
if(data47.timestampSec === undefined){
const err116 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/required",keyword:"required",params:{missingProperty: "timestampSec"},message:"must have required property '"+"timestampSec"+"'"};
if(vErrors === null){
vErrors = [err116];
}
else {
vErrors.push(err116);
}
errors++;
}
if(data47.framePath === undefined){
const err117 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/required",keyword:"required",params:{missingProperty: "framePath"},message:"must have required property '"+"framePath"+"'"};
if(vErrors === null){
vErrors = [err117];
}
else {
vErrors.push(err117);
}
errors++;
}
if(data47.sha256 === undefined){
const err118 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err118];
}
else {
vErrors.push(err118);
}
errors++;
}
for(const key7 in data47){
if(!((((((key7 === "timestampSec") || (key7 === "framePath")) || (key7 === "sha256")) || (key7 === "page")) || (key7 === "timestampToleranceSec")) || (key7 === "fields"))){
const err119 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key7},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err119];
}
else {
vErrors.push(err119);
}
errors++;
}
}
if(data47.timestampSec !== undefined){
let data48 = data47.timestampSec;
if(typeof data48 == "number"){
if(data48 < 0 || isNaN(data48)){
const err120 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/timestampSec",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/timestampSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err120];
}
else {
vErrors.push(err120);
}
errors++;
}
}
else {
const err121 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/timestampSec",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/timestampSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err121];
}
else {
vErrors.push(err121);
}
errors++;
}
}
if(data47.framePath !== undefined){
let data49 = data47.framePath;
if(typeof data49 === "string"){
if(!pattern8.test(data49)){
const err122 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/framePath",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/framePath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err122];
}
else {
vErrors.push(err122);
}
errors++;
}
}
else {
const err123 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/framePath",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/framePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err123];
}
else {
vErrors.push(err123);
}
errors++;
}
}
if(data47.sha256 !== undefined){
let data50 = data47.sha256;
if(typeof data50 === "string"){
if(!pattern4.test(data50)){
const err124 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/sha256",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err124];
}
else {
vErrors.push(err124);
}
errors++;
}
}
else {
const err125 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/sha256",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err125];
}
else {
vErrors.push(err125);
}
errors++;
}
}
if(data47.page !== undefined){
if(typeof data47.page !== "string"){
const err126 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/page",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/page/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err126];
}
else {
vErrors.push(err126);
}
errors++;
}
}
if(data47.timestampToleranceSec !== undefined){
let data52 = data47.timestampToleranceSec;
if(typeof data52 == "number"){
if(data52 < 0 || isNaN(data52)){
const err127 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/timestampToleranceSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err127];
}
else {
vErrors.push(err127);
}
errors++;
}
}
else {
const err128 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/timestampToleranceSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err128];
}
else {
vErrors.push(err128);
}
errors++;
}
}
if(data47.fields !== undefined){
let data53 = data47.fields;
if(Array.isArray(data53)){
const len4 = data53.length;
for(let i4=0; i4<len4; i4++){
if(typeof data53[i4] !== "string"){
const err129 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/fields/" + i4,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/fields/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err129];
}
else {
vErrors.push(err129);
}
errors++;
}
}
}
else {
const err130 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/fields",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err130];
}
else {
vErrors.push(err130);
}
errors++;
}
}
}
else {
const err131 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err131];
}
else {
vErrors.push(err131);
}
errors++;
}
var _valid1 = _errs105 === errors;
if(_valid1){
valid19 = true;
passing0 = 0;
var props0 = true;
}
const _errs122 = errors;
if(data47 && typeof data47 == "object" && !Array.isArray(data47)){
if(data47.sourceId === undefined){
const err132 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/required",keyword:"required",params:{missingProperty: "sourceId"},message:"must have required property '"+"sourceId"+"'"};
if(vErrors === null){
vErrors = [err132];
}
else {
vErrors.push(err132);
}
errors++;
}
if(data47.record === undefined){
const err133 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/required",keyword:"required",params:{missingProperty: "record"},message:"must have required property '"+"record"+"'"};
if(vErrors === null){
vErrors = [err133];
}
else {
vErrors.push(err133);
}
errors++;
}
for(const key8 in data47){
if(!((key8 === "sourceId") || (key8 === "record"))){
const err134 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key8},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err134];
}
else {
vErrors.push(err134);
}
errors++;
}
}
if(data47.sourceId !== undefined){
let data55 = data47.sourceId;
if(typeof data55 === "string"){
if(!pattern10.test(data55)){
const err135 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/sourceId",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/properties/sourceId/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err135];
}
else {
vErrors.push(err135);
}
errors++;
}
}
else {
const err136 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/sourceId",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/properties/sourceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err136];
}
else {
vErrors.push(err136);
}
errors++;
}
}
if(data47.record !== undefined){
let data56 = data47.record;
if(typeof data56 === "string"){
if(!pattern11.test(data56)){
const err137 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/record",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/properties/record/pattern",keyword:"pattern",params:{pattern: "^/zzz/characters/(0|[1-9][0-9]*)$"},message:"must match pattern \""+"^/zzz/characters/(0|[1-9][0-9]*)$"+"\""};
if(vErrors === null){
vErrors = [err137];
}
else {
vErrors.push(err137);
}
errors++;
}
}
else {
const err138 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3+"/record",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/properties/record/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err138];
}
else {
vErrors.push(err138);
}
errors++;
}
}
}
else {
const err139 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err139];
}
else {
vErrors.push(err139);
}
errors++;
}
var _valid1 = _errs122 === errors;
if(_valid1 && valid19){
valid19 = false;
passing0 = [passing0, 1];
}
else {
if(_valid1){
valid19 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid19){
const err140 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence/" + i3,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/items/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err140];
}
else {
vErrors.push(err140);
}
errors++;
}
else {
errors = _errs104;
if(vErrors !== null){
if(_errs104){
vErrors.length = _errs104;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err141 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/evidence",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/evidence/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err141];
}
else {
vErrors.push(err141);
}
errors++;
}
}
if(data26.uncertainties !== undefined){
let data57 = data26.uncertainties;
if(Array.isArray(data57)){
const len5 = data57.length;
for(let i5=0; i5<len5; i5++){
if(typeof data57[i5] !== "string"){
const err142 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/uncertainties/" + i5,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/uncertainties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err142];
}
else {
vErrors.push(err142);
}
errors++;
}
}
}
else {
const err143 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/uncertainties",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/uncertainties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err143];
}
else {
vErrors.push(err143);
}
errors++;
}
}
if(data26.substatsComplete !== undefined){
if(typeof data26.substatsComplete !== "boolean"){
const err144 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/substatsComplete",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/substatsComplete/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err144];
}
else {
vErrors.push(err144);
}
errors++;
}
}
if(data26.effectiveKeys !== undefined){
let data60 = data26.effectiveKeys;
if(Array.isArray(data60)){
const len6 = data60.length;
for(let i6=0; i6<len6; i6++){
let data61 = data60[i6];
if(!((((((((((data61 === "生命值|flat") || (data61 === "生命值|percent")) || (data61 === "攻擊力|flat")) || (data61 === "攻擊力|percent")) || (data61 === "防禦力|flat")) || (data61 === "防禦力|percent")) || (data61 === "暴擊率|percent")) || (data61 === "暴擊傷害|percent")) || (data61 === "異常精通|flat")) || (data61 === "穿透值|flat"))){
const err145 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/effectiveKeys/" + i6,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/effectiveKeys/items/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.driveDiscs.items.properties.effectiveKeys.items.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err145];
}
else {
vErrors.push(err145);
}
errors++;
}
}
let i7 = data60.length;
let j0;
if(i7 > 1){
outer0:
for(;i7--;){
for(j0 = i7; j0--;){
if(func0(data60[i7], data60[j0])){
const err146 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/effectiveKeys",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/effectiveKeys/uniqueItems",keyword:"uniqueItems",params:{i: i7, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i7+" are identical)"};
if(vErrors === null){
vErrors = [err146];
}
else {
vErrors.push(err146);
}
errors++;
break outer0;
}
}
}
}
}
else {
const err147 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/effectiveKeys",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/effectiveKeys/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err147];
}
else {
vErrors.push(err147);
}
errors++;
}
}
if(data26.assessment !== undefined){
let data62 = data26.assessment;
if(data62 && typeof data62 == "object" && !Array.isArray(data62)){
if(data62.ruleId === undefined){
const err148 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/required",keyword:"required",params:{missingProperty: "ruleId"},message:"must have required property '"+"ruleId"+"'"};
if(vErrors === null){
vErrors = [err148];
}
else {
vErrors.push(err148);
}
errors++;
}
if(data62.method === undefined){
const err149 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/required",keyword:"required",params:{missingProperty: "method"},message:"must have required property '"+"method"+"'"};
if(vErrors === null){
vErrors = [err149];
}
else {
vErrors.push(err149);
}
errors++;
}
for(const key9 in data62){
if(!((key9 === "ruleId") || (key9 === "method"))){
const err150 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key9},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err150];
}
else {
vErrors.push(err150);
}
errors++;
}
}
if(data62.ruleId !== undefined){
let data63 = data62.ruleId;
if(typeof data63 === "string"){
if(func1(data63) < 1){
const err151 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment/ruleId",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/properties/ruleId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err151];
}
else {
vErrors.push(err151);
}
errors++;
}
}
else {
const err152 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment/ruleId",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/properties/ruleId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err152];
}
else {
vErrors.push(err152);
}
errors++;
}
}
if(data62.method !== undefined){
if("role_rule" !== data62.method){
const err153 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment/method",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/properties/method/const",keyword:"const",params:{allowedValue: "role_rule"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err153];
}
else {
vErrors.push(err153);
}
errors++;
}
}
}
else {
const err154 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1+"/assessment",schemaPath:"#/properties/characters/items/properties/driveDiscs/items/properties/assessment/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err154];
}
else {
vErrors.push(err154);
}
errors++;
}
}
}
else {
const err155 = {instancePath:instancePath+"/characters/" + i0+"/driveDiscs/" + i1,schemaPath:"#/properties/characters/items/properties/driveDiscs/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err155];
}
else {
vErrors.push(err155);
}
errors++;
}
}
}
}
if(data8.evidence !== undefined){
let data65 = data8.evidence;
if(Array.isArray(data65)){
if(data65.length < 1){
const err156 = {instancePath:instancePath+"/characters/" + i0+"/evidence",schemaPath:"#/properties/characters/items/properties/evidence/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err156];
}
else {
vErrors.push(err156);
}
errors++;
}
const len7 = data65.length;
for(let i8=0; i8<len7; i8++){
let data66 = data65[i8];
const _errs147 = errors;
let valid32 = false;
let passing1 = null;
const _errs148 = errors;
if(data66 && typeof data66 == "object" && !Array.isArray(data66)){
if(data66.timestampSec === undefined){
const err157 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/required",keyword:"required",params:{missingProperty: "timestampSec"},message:"must have required property '"+"timestampSec"+"'"};
if(vErrors === null){
vErrors = [err157];
}
else {
vErrors.push(err157);
}
errors++;
}
if(data66.framePath === undefined){
const err158 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/required",keyword:"required",params:{missingProperty: "framePath"},message:"must have required property '"+"framePath"+"'"};
if(vErrors === null){
vErrors = [err158];
}
else {
vErrors.push(err158);
}
errors++;
}
if(data66.sha256 === undefined){
const err159 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err159];
}
else {
vErrors.push(err159);
}
errors++;
}
for(const key10 in data66){
if(!((((((key10 === "timestampSec") || (key10 === "framePath")) || (key10 === "sha256")) || (key10 === "page")) || (key10 === "timestampToleranceSec")) || (key10 === "fields"))){
const err160 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key10},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err160];
}
else {
vErrors.push(err160);
}
errors++;
}
}
if(data66.timestampSec !== undefined){
let data67 = data66.timestampSec;
if(typeof data67 == "number"){
if(data67 < 0 || isNaN(data67)){
const err161 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/timestampSec",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/timestampSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err161];
}
else {
vErrors.push(err161);
}
errors++;
}
}
else {
const err162 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/timestampSec",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/timestampSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err162];
}
else {
vErrors.push(err162);
}
errors++;
}
}
if(data66.framePath !== undefined){
let data68 = data66.framePath;
if(typeof data68 === "string"){
if(!pattern8.test(data68)){
const err163 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/framePath",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/framePath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err163];
}
else {
vErrors.push(err163);
}
errors++;
}
}
else {
const err164 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/framePath",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/framePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err164];
}
else {
vErrors.push(err164);
}
errors++;
}
}
if(data66.sha256 !== undefined){
let data69 = data66.sha256;
if(typeof data69 === "string"){
if(!pattern4.test(data69)){
const err165 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/sha256",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err165];
}
else {
vErrors.push(err165);
}
errors++;
}
}
else {
const err166 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/sha256",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err166];
}
else {
vErrors.push(err166);
}
errors++;
}
}
if(data66.page !== undefined){
if(typeof data66.page !== "string"){
const err167 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/page",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/page/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err167];
}
else {
vErrors.push(err167);
}
errors++;
}
}
if(data66.timestampToleranceSec !== undefined){
let data71 = data66.timestampToleranceSec;
if(typeof data71 == "number"){
if(data71 < 0 || isNaN(data71)){
const err168 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/timestampToleranceSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err168];
}
else {
vErrors.push(err168);
}
errors++;
}
}
else {
const err169 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/timestampToleranceSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err169];
}
else {
vErrors.push(err169);
}
errors++;
}
}
if(data66.fields !== undefined){
let data72 = data66.fields;
if(Array.isArray(data72)){
const len8 = data72.length;
for(let i9=0; i9<len8; i9++){
if(typeof data72[i9] !== "string"){
const err170 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/fields/" + i9,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/fields/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err170];
}
else {
vErrors.push(err170);
}
errors++;
}
}
}
else {
const err171 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/fields",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err171];
}
else {
vErrors.push(err171);
}
errors++;
}
}
}
else {
const err172 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err172];
}
else {
vErrors.push(err172);
}
errors++;
}
var _valid2 = _errs148 === errors;
if(_valid2){
valid32 = true;
passing1 = 0;
var props1 = true;
}
const _errs165 = errors;
if(data66 && typeof data66 == "object" && !Array.isArray(data66)){
if(data66.sourceId === undefined){
const err173 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/required",keyword:"required",params:{missingProperty: "sourceId"},message:"must have required property '"+"sourceId"+"'"};
if(vErrors === null){
vErrors = [err173];
}
else {
vErrors.push(err173);
}
errors++;
}
if(data66.record === undefined){
const err174 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/required",keyword:"required",params:{missingProperty: "record"},message:"must have required property '"+"record"+"'"};
if(vErrors === null){
vErrors = [err174];
}
else {
vErrors.push(err174);
}
errors++;
}
for(const key11 in data66){
if(!((key11 === "sourceId") || (key11 === "record"))){
const err175 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key11},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err175];
}
else {
vErrors.push(err175);
}
errors++;
}
}
if(data66.sourceId !== undefined){
let data74 = data66.sourceId;
if(typeof data74 === "string"){
if(!pattern10.test(data74)){
const err176 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/sourceId",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/properties/sourceId/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err176];
}
else {
vErrors.push(err176);
}
errors++;
}
}
else {
const err177 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/sourceId",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/properties/sourceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err177];
}
else {
vErrors.push(err177);
}
errors++;
}
}
if(data66.record !== undefined){
let data75 = data66.record;
if(typeof data75 === "string"){
if(!pattern11.test(data75)){
const err178 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/record",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/properties/record/pattern",keyword:"pattern",params:{pattern: "^/zzz/characters/(0|[1-9][0-9]*)$"},message:"must match pattern \""+"^/zzz/characters/(0|[1-9][0-9]*)$"+"\""};
if(vErrors === null){
vErrors = [err178];
}
else {
vErrors.push(err178);
}
errors++;
}
}
else {
const err179 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8+"/record",schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/properties/record/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err179];
}
else {
vErrors.push(err179);
}
errors++;
}
}
}
else {
const err180 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err180];
}
else {
vErrors.push(err180);
}
errors++;
}
var _valid2 = _errs165 === errors;
if(_valid2 && valid32){
valid32 = false;
passing1 = [passing1, 1];
}
else {
if(_valid2){
valid32 = true;
passing1 = 1;
if(props1 !== true){
props1 = true;
}
}
}
if(!valid32){
const err181 = {instancePath:instancePath+"/characters/" + i0+"/evidence/" + i8,schemaPath:"#/properties/characters/items/properties/evidence/items/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err181];
}
else {
vErrors.push(err181);
}
errors++;
}
else {
errors = _errs147;
if(vErrors !== null){
if(_errs147){
vErrors.length = _errs147;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err182 = {instancePath:instancePath+"/characters/" + i0+"/evidence",schemaPath:"#/properties/characters/items/properties/evidence/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err182];
}
else {
vErrors.push(err182);
}
errors++;
}
}
if(data8.portraitPath !== undefined){
let data76 = data8.portraitPath;
if(typeof data76 === "string"){
if(!pattern8.test(data76)){
const err183 = {instancePath:instancePath+"/characters/" + i0+"/portraitPath",schemaPath:"#/properties/characters/items/properties/portraitPath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err183];
}
else {
vErrors.push(err183);
}
errors++;
}
}
else {
const err184 = {instancePath:instancePath+"/characters/" + i0+"/portraitPath",schemaPath:"#/properties/characters/items/properties/portraitPath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err184];
}
else {
vErrors.push(err184);
}
errors++;
}
}
if(data8.uncertainties !== undefined){
let data77 = data8.uncertainties;
if(Array.isArray(data77)){
const len9 = data77.length;
for(let i10=0; i10<len9; i10++){
if(typeof data77[i10] !== "string"){
const err185 = {instancePath:instancePath+"/characters/" + i0+"/uncertainties/" + i10,schemaPath:"#/properties/characters/items/properties/uncertainties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err185];
}
else {
vErrors.push(err185);
}
errors++;
}
}
}
else {
const err186 = {instancePath:instancePath+"/characters/" + i0+"/uncertainties",schemaPath:"#/properties/characters/items/properties/uncertainties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err186];
}
else {
vErrors.push(err186);
}
errors++;
}
}
if(data8.portraitSha256 !== undefined){
let data79 = data8.portraitSha256;
if(typeof data79 === "string"){
if(!pattern4.test(data79)){
const err187 = {instancePath:instancePath+"/characters/" + i0+"/portraitSha256",schemaPath:"#/properties/characters/items/properties/portraitSha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err187];
}
else {
vErrors.push(err187);
}
errors++;
}
}
else {
const err188 = {instancePath:instancePath+"/characters/" + i0+"/portraitSha256",schemaPath:"#/properties/characters/items/properties/portraitSha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err188];
}
else {
vErrors.push(err188);
}
errors++;
}
}
if(data8.element !== undefined){
let data80 = data8.element;
if((typeof data80 !== "string") && (data80 !== null)){
const err189 = {instancePath:instancePath+"/characters/" + i0+"/element",schemaPath:"#/properties/characters/items/properties/element/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.element.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err189];
}
else {
vErrors.push(err189);
}
errors++;
}
}
if(data8.specialty !== undefined){
let data81 = data8.specialty;
if((typeof data81 !== "string") && (data81 !== null)){
const err190 = {instancePath:instancePath+"/characters/" + i0+"/specialty",schemaPath:"#/properties/characters/items/properties/specialty/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.specialty.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err190];
}
else {
vErrors.push(err190);
}
errors++;
}
}
if(data8.statsEffective !== undefined){
let data82 = data8.statsEffective;
if(data82 && typeof data82 == "object" && !Array.isArray(data82)){
for(const key12 in data82){
let data83 = data82[key12];
if((typeof data83 !== "boolean") && (data83 !== null)){
const err191 = {instancePath:instancePath+"/characters/" + i0+"/statsEffective/" + key12.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/statsEffective/additionalProperties/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.statsEffective.additionalProperties.type},message:"must be boolean,null"};
if(vErrors === null){
vErrors = [err191];
}
else {
vErrors.push(err191);
}
errors++;
}
}
}
else {
const err192 = {instancePath:instancePath+"/characters/" + i0+"/statsEffective",schemaPath:"#/properties/characters/items/properties/statsEffective/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err192];
}
else {
vErrors.push(err192);
}
errors++;
}
}
if(data8.sync !== undefined){
let data84 = data8.sync;
if(data84 && typeof data84 == "object" && !Array.isArray(data84)){
if(data84.apiId === undefined){
const err193 = {instancePath:instancePath+"/characters/" + i0+"/sync",schemaPath:"#/properties/characters/items/properties/sync/required",keyword:"required",params:{missingProperty: "apiId"},message:"must have required property '"+"apiId"+"'"};
if(vErrors === null){
vErrors = [err193];
}
else {
vErrors.push(err193);
}
errors++;
}
if(data84.sourceId === undefined){
const err194 = {instancePath:instancePath+"/characters/" + i0+"/sync",schemaPath:"#/properties/characters/items/properties/sync/required",keyword:"required",params:{missingProperty: "sourceId"},message:"must have required property '"+"sourceId"+"'"};
if(vErrors === null){
vErrors = [err194];
}
else {
vErrors.push(err194);
}
errors++;
}
for(const key13 in data84){
if(!((key13 === "apiId") || (key13 === "sourceId"))){
const err195 = {instancePath:instancePath+"/characters/" + i0+"/sync",schemaPath:"#/properties/characters/items/properties/sync/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key13},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err195];
}
else {
vErrors.push(err195);
}
errors++;
}
}
if(data84.apiId !== undefined){
let data85 = data84.apiId;
if(!((typeof data85 == "number") && (!(data85 % 1) && !isNaN(data85)))){
const err196 = {instancePath:instancePath+"/characters/" + i0+"/sync/apiId",schemaPath:"#/properties/characters/items/properties/sync/properties/apiId/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err196];
}
else {
vErrors.push(err196);
}
errors++;
}
if(typeof data85 == "number"){
if(data85 < 1 || isNaN(data85)){
const err197 = {instancePath:instancePath+"/characters/" + i0+"/sync/apiId",schemaPath:"#/properties/characters/items/properties/sync/properties/apiId/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err197];
}
else {
vErrors.push(err197);
}
errors++;
}
}
}
if(data84.sourceId !== undefined){
let data86 = data84.sourceId;
if(typeof data86 === "string"){
if(!pattern10.test(data86)){
const err198 = {instancePath:instancePath+"/characters/" + i0+"/sync/sourceId",schemaPath:"#/properties/characters/items/properties/sync/properties/sourceId/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err198];
}
else {
vErrors.push(err198);
}
errors++;
}
}
else {
const err199 = {instancePath:instancePath+"/characters/" + i0+"/sync/sourceId",schemaPath:"#/properties/characters/items/properties/sync/properties/sourceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err199];
}
else {
vErrors.push(err199);
}
errors++;
}
}
}
else {
const err200 = {instancePath:instancePath+"/characters/" + i0+"/sync",schemaPath:"#/properties/characters/items/properties/sync/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err200];
}
else {
vErrors.push(err200);
}
errors++;
}
}
if(data8.skillsBase !== undefined){
let data87 = data8.skillsBase;
if((!(data87 && typeof data87 == "object" && !Array.isArray(data87))) && (data87 !== null)){
const err201 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase",schemaPath:"#/properties/characters/items/properties/skillsBase/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillsBase.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err201];
}
else {
vErrors.push(err201);
}
errors++;
}
if(data87 && typeof data87 == "object" && !Array.isArray(data87)){
for(const key14 in data87){
if(!(((((key14 === "普通攻擊") || (key14 === "閃避")) || (key14 === "支援技")) || (key14 === "特殊技")) || (key14 === "連攜技"))){
const err202 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase",schemaPath:"#/properties/characters/items/properties/skillsBase/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key14},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err202];
}
else {
vErrors.push(err202);
}
errors++;
}
}
if(data87["普通攻擊"] !== undefined){
let data88 = data87["普通攻擊"];
if((!((typeof data88 == "number") && (!(data88 % 1) && !isNaN(data88)))) && (data88 !== null)){
const err203 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/普通攻擊",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E6%99%AE%E9%80%9A%E6%94%BB%E6%93%8A/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillsBase.properties["普通攻擊"].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err203];
}
else {
vErrors.push(err203);
}
errors++;
}
if(typeof data88 == "number"){
if(data88 > 20 || isNaN(data88)){
const err204 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/普通攻擊",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E6%99%AE%E9%80%9A%E6%94%BB%E6%93%8A/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err204];
}
else {
vErrors.push(err204);
}
errors++;
}
if(data88 < 0 || isNaN(data88)){
const err205 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/普通攻擊",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E6%99%AE%E9%80%9A%E6%94%BB%E6%93%8A/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err205];
}
else {
vErrors.push(err205);
}
errors++;
}
}
}
if(data87["閃避"] !== undefined){
let data89 = data87["閃避"];
if((!((typeof data89 == "number") && (!(data89 % 1) && !isNaN(data89)))) && (data89 !== null)){
const err206 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/閃避",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E9%96%83%E9%81%BF/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillsBase.properties["閃避"].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err206];
}
else {
vErrors.push(err206);
}
errors++;
}
if(typeof data89 == "number"){
if(data89 > 20 || isNaN(data89)){
const err207 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/閃避",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E9%96%83%E9%81%BF/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err207];
}
else {
vErrors.push(err207);
}
errors++;
}
if(data89 < 0 || isNaN(data89)){
const err208 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/閃避",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E9%96%83%E9%81%BF/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err208];
}
else {
vErrors.push(err208);
}
errors++;
}
}
}
if(data87["支援技"] !== undefined){
let data90 = data87["支援技"];
if((!((typeof data90 == "number") && (!(data90 % 1) && !isNaN(data90)))) && (data90 !== null)){
const err209 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/支援技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E6%94%AF%E6%8F%B4%E6%8A%80/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillsBase.properties["支援技"].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err209];
}
else {
vErrors.push(err209);
}
errors++;
}
if(typeof data90 == "number"){
if(data90 > 20 || isNaN(data90)){
const err210 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/支援技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E6%94%AF%E6%8F%B4%E6%8A%80/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err210];
}
else {
vErrors.push(err210);
}
errors++;
}
if(data90 < 0 || isNaN(data90)){
const err211 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/支援技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E6%94%AF%E6%8F%B4%E6%8A%80/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err211];
}
else {
vErrors.push(err211);
}
errors++;
}
}
}
if(data87["特殊技"] !== undefined){
let data91 = data87["特殊技"];
if((!((typeof data91 == "number") && (!(data91 % 1) && !isNaN(data91)))) && (data91 !== null)){
const err212 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/特殊技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E7%89%B9%E6%AE%8A%E6%8A%80/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillsBase.properties["特殊技"].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err212];
}
else {
vErrors.push(err212);
}
errors++;
}
if(typeof data91 == "number"){
if(data91 > 20 || isNaN(data91)){
const err213 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/特殊技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E7%89%B9%E6%AE%8A%E6%8A%80/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err213];
}
else {
vErrors.push(err213);
}
errors++;
}
if(data91 < 0 || isNaN(data91)){
const err214 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/特殊技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E7%89%B9%E6%AE%8A%E6%8A%80/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err214];
}
else {
vErrors.push(err214);
}
errors++;
}
}
}
if(data87["連攜技"] !== undefined){
let data92 = data87["連攜技"];
if((!((typeof data92 == "number") && (!(data92 % 1) && !isNaN(data92)))) && (data92 !== null)){
const err215 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/連攜技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E9%80%A3%E6%94%9C%E6%8A%80/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillsBase.properties["連攜技"].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err215];
}
else {
vErrors.push(err215);
}
errors++;
}
if(typeof data92 == "number"){
if(data92 > 20 || isNaN(data92)){
const err216 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/連攜技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E9%80%A3%E6%94%9C%E6%8A%80/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err216];
}
else {
vErrors.push(err216);
}
errors++;
}
if(data92 < 0 || isNaN(data92)){
const err217 = {instancePath:instancePath+"/characters/" + i0+"/skillsBase/連攜技",schemaPath:"#/properties/characters/items/properties/skillsBase/properties/%E9%80%A3%E6%94%9C%E6%8A%80/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err217];
}
else {
vErrors.push(err217);
}
errors++;
}
}
}
}
}
if(data8.skillContext !== undefined){
let data93 = data8.skillContext;
if(data93 && typeof data93 == "object" && !Array.isArray(data93)){
if(data93.provider === undefined){
const err218 = {instancePath:instancePath+"/characters/" + i0+"/skillContext",schemaPath:"#/properties/characters/items/properties/skillContext/required",keyword:"required",params:{missingProperty: "provider"},message:"must have required property '"+"provider"+"'"};
if(vErrors === null){
vErrors = [err218];
}
else {
vErrors.push(err218);
}
errors++;
}
if(data93.levelSemantics === undefined){
const err219 = {instancePath:instancePath+"/characters/" + i0+"/skillContext",schemaPath:"#/properties/characters/items/properties/skillContext/required",keyword:"required",params:{missingProperty: "levelSemantics"},message:"must have required property '"+"levelSemantics"+"'"};
if(vErrors === null){
vErrors = [err219];
}
else {
vErrors.push(err219);
}
errors++;
}
if(data93.coreRawLevel === undefined){
const err220 = {instancePath:instancePath+"/characters/" + i0+"/skillContext",schemaPath:"#/properties/characters/items/properties/skillContext/required",keyword:"required",params:{missingProperty: "coreRawLevel"},message:"must have required property '"+"coreRawLevel"+"'"};
if(vErrors === null){
vErrors = [err220];
}
else {
vErrors.push(err220);
}
errors++;
}
for(const key15 in data93){
if(!(((key15 === "provider") || (key15 === "levelSemantics")) || (key15 === "coreRawLevel"))){
const err221 = {instancePath:instancePath+"/characters/" + i0+"/skillContext",schemaPath:"#/properties/characters/items/properties/skillContext/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key15},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err221];
}
else {
vErrors.push(err221);
}
errors++;
}
}
if(data93.provider !== undefined){
if("hoyolab" !== data93.provider){
const err222 = {instancePath:instancePath+"/characters/" + i0+"/skillContext/provider",schemaPath:"#/properties/characters/items/properties/skillContext/properties/provider/const",keyword:"const",params:{allowedValue: "hoyolab"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err222];
}
else {
vErrors.push(err222);
}
errors++;
}
}
if(data93.levelSemantics !== undefined){
if("provider_displayed" !== data93.levelSemantics){
const err223 = {instancePath:instancePath+"/characters/" + i0+"/skillContext/levelSemantics",schemaPath:"#/properties/characters/items/properties/skillContext/properties/levelSemantics/const",keyword:"const",params:{allowedValue: "provider_displayed"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err223];
}
else {
vErrors.push(err223);
}
errors++;
}
}
if(data93.coreRawLevel !== undefined){
let data96 = data93.coreRawLevel;
if((!((typeof data96 == "number") && (!(data96 % 1) && !isNaN(data96)))) && (data96 !== null)){
const err224 = {instancePath:instancePath+"/characters/" + i0+"/skillContext/coreRawLevel",schemaPath:"#/properties/characters/items/properties/skillContext/properties/coreRawLevel/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.skillContext.properties.coreRawLevel.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err224];
}
else {
vErrors.push(err224);
}
errors++;
}
if(typeof data96 == "number"){
if(data96 > 7 || isNaN(data96)){
const err225 = {instancePath:instancePath+"/characters/" + i0+"/skillContext/coreRawLevel",schemaPath:"#/properties/characters/items/properties/skillContext/properties/coreRawLevel/maximum",keyword:"maximum",params:{comparison: "<=", limit: 7},message:"must be <= 7"};
if(vErrors === null){
vErrors = [err225];
}
else {
vErrors.push(err225);
}
errors++;
}
if(data96 < 0 || isNaN(data96)){
const err226 = {instancePath:instancePath+"/characters/" + i0+"/skillContext/coreRawLevel",schemaPath:"#/properties/characters/items/properties/skillContext/properties/coreRawLevel/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err226];
}
else {
vErrors.push(err226);
}
errors++;
}
}
}
}
else {
const err227 = {instancePath:instancePath+"/characters/" + i0+"/skillContext",schemaPath:"#/properties/characters/items/properties/skillContext/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err227];
}
else {
vErrors.push(err227);
}
errors++;
}
}
if(data8.effectiveProfile !== undefined){
let data97 = data8.effectiveProfile;
if(data97 && typeof data97 == "object" && !Array.isArray(data97)){
if(data97.ruleId === undefined){
const err228 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile",schemaPath:"#/properties/characters/items/properties/effectiveProfile/required",keyword:"required",params:{missingProperty: "ruleId"},message:"must have required property '"+"ruleId"+"'"};
if(vErrors === null){
vErrors = [err228];
}
else {
vErrors.push(err228);
}
errors++;
}
if(data97.method === undefined){
const err229 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile",schemaPath:"#/properties/characters/items/properties/effectiveProfile/required",keyword:"required",params:{missingProperty: "method"},message:"must have required property '"+"method"+"'"};
if(vErrors === null){
vErrors = [err229];
}
else {
vErrors.push(err229);
}
errors++;
}
if(data97.keys === undefined){
const err230 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile",schemaPath:"#/properties/characters/items/properties/effectiveProfile/required",keyword:"required",params:{missingProperty: "keys"},message:"must have required property '"+"keys"+"'"};
if(vErrors === null){
vErrors = [err230];
}
else {
vErrors.push(err230);
}
errors++;
}
for(const key16 in data97){
if(!(((key16 === "ruleId") || (key16 === "method")) || (key16 === "keys"))){
const err231 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile",schemaPath:"#/properties/characters/items/properties/effectiveProfile/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key16},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err231];
}
else {
vErrors.push(err231);
}
errors++;
}
}
if(data97.ruleId !== undefined){
let data98 = data97.ruleId;
if(typeof data98 === "string"){
if(func1(data98) < 1){
const err232 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile/ruleId",schemaPath:"#/properties/characters/items/properties/effectiveProfile/properties/ruleId/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err232];
}
else {
vErrors.push(err232);
}
errors++;
}
}
else {
const err233 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile/ruleId",schemaPath:"#/properties/characters/items/properties/effectiveProfile/properties/ruleId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err233];
}
else {
vErrors.push(err233);
}
errors++;
}
}
if(data97.method !== undefined){
if("role_rule" !== data97.method){
const err234 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile/method",schemaPath:"#/properties/characters/items/properties/effectiveProfile/properties/method/const",keyword:"const",params:{allowedValue: "role_rule"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err234];
}
else {
vErrors.push(err234);
}
errors++;
}
}
if(data97.keys !== undefined){
let data100 = data97.keys;
if(Array.isArray(data100)){
const len10 = data100.length;
for(let i11=0; i11<len10; i11++){
let data101 = data100[i11];
if(!((((((((((data101 === "生命值|flat") || (data101 === "生命值|percent")) || (data101 === "攻擊力|flat")) || (data101 === "攻擊力|percent")) || (data101 === "防禦力|flat")) || (data101 === "防禦力|percent")) || (data101 === "暴擊率|percent")) || (data101 === "暴擊傷害|percent")) || (data101 === "異常精通|flat")) || (data101 === "穿透值|flat"))){
const err235 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile/keys/" + i11,schemaPath:"#/properties/characters/items/properties/effectiveProfile/properties/keys/items/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.effectiveProfile.properties.keys.items.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err235];
}
else {
vErrors.push(err235);
}
errors++;
}
}
let i12 = data100.length;
let j1;
if(i12 > 1){
outer1:
for(;i12--;){
for(j1 = i12; j1--;){
if(func0(data100[i12], data100[j1])){
const err236 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile/keys",schemaPath:"#/properties/characters/items/properties/effectiveProfile/properties/keys/uniqueItems",keyword:"uniqueItems",params:{i: i12, j: j1},message:"must NOT have duplicate items (items ## "+j1+" and "+i12+" are identical)"};
if(vErrors === null){
vErrors = [err236];
}
else {
vErrors.push(err236);
}
errors++;
break outer1;
}
}
}
}
}
else {
const err237 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile/keys",schemaPath:"#/properties/characters/items/properties/effectiveProfile/properties/keys/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err237];
}
else {
vErrors.push(err237);
}
errors++;
}
}
}
else {
const err238 = {instancePath:instancePath+"/characters/" + i0+"/effectiveProfile",schemaPath:"#/properties/characters/items/properties/effectiveProfile/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err238];
}
else {
vErrors.push(err238);
}
errors++;
}
}
if(data8.legacyObservation !== undefined){
let data102 = data8.legacyObservation;
if(data102 && typeof data102 == "object" && !Array.isArray(data102)){
if(data102.id === undefined){
const err239 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err239];
}
else {
vErrors.push(err239);
}
errors++;
}
if(data102.name === undefined){
const err240 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err240];
}
else {
vErrors.push(err240);
}
errors++;
}
if(data102.level === undefined){
const err241 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err241];
}
else {
vErrors.push(err241);
}
errors++;
}
if(data102.mindscape === undefined){
const err242 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "mindscape"},message:"must have required property '"+"mindscape"+"'"};
if(vErrors === null){
vErrors = [err242];
}
else {
vErrors.push(err242);
}
errors++;
}
if(data102.stats === undefined){
const err243 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "stats"},message:"must have required property '"+"stats"+"'"};
if(vErrors === null){
vErrors = [err243];
}
else {
vErrors.push(err243);
}
errors++;
}
if(data102.skills === undefined){
const err244 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "skills"},message:"must have required property '"+"skills"+"'"};
if(vErrors === null){
vErrors = [err244];
}
else {
vErrors.push(err244);
}
errors++;
}
if(data102.wEngine === undefined){
const err245 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "wEngine"},message:"must have required property '"+"wEngine"+"'"};
if(vErrors === null){
vErrors = [err245];
}
else {
vErrors.push(err245);
}
errors++;
}
if(data102.driveDiscs === undefined){
const err246 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "driveDiscs"},message:"must have required property '"+"driveDiscs"+"'"};
if(vErrors === null){
vErrors = [err246];
}
else {
vErrors.push(err246);
}
errors++;
}
if(data102.evidence === undefined){
const err247 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "evidence"},message:"must have required property '"+"evidence"+"'"};
if(vErrors === null){
vErrors = [err247];
}
else {
vErrors.push(err247);
}
errors++;
}
if(data102.uncertainties === undefined){
const err248 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/required",keyword:"required",params:{missingProperty: "uncertainties"},message:"must have required property '"+"uncertainties"+"'"};
if(vErrors === null){
vErrors = [err248];
}
else {
vErrors.push(err248);
}
errors++;
}
for(const key17 in data102){
if(!(func2.call(schema31.properties.characters.items.properties.legacyObservation.properties, key17))){
const err249 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key17},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err249];
}
else {
vErrors.push(err249);
}
errors++;
}
}
if(data102.id !== undefined){
let data103 = data102.id;
if(typeof data103 === "string"){
if(!pattern5.test(data103)){
const err250 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/id",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z0-9_]+$"},message:"must match pattern \""+"^[a-z0-9_]+$"+"\""};
if(vErrors === null){
vErrors = [err250];
}
else {
vErrors.push(err250);
}
errors++;
}
}
else {
const err251 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/id",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err251];
}
else {
vErrors.push(err251);
}
errors++;
}
}
if(data102.name !== undefined){
let data104 = data102.name;
if(typeof data104 === "string"){
if(func1(data104) < 1){
const err252 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/name",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err252];
}
else {
vErrors.push(err252);
}
errors++;
}
}
else {
const err253 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/name",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err253];
}
else {
vErrors.push(err253);
}
errors++;
}
}
if(data102.level !== undefined){
let data105 = data102.level;
if((!((typeof data105 == "number") && (!(data105 % 1) && !isNaN(data105)))) && (data105 !== null)){
const err254 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/level/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err254];
}
else {
vErrors.push(err254);
}
errors++;
}
if(typeof data105 == "number"){
if(data105 > 60 || isNaN(data105)){
const err255 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 60},message:"must be <= 60"};
if(vErrors === null){
vErrors = [err255];
}
else {
vErrors.push(err255);
}
errors++;
}
if(data105 < 1 || isNaN(data105)){
const err256 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err256];
}
else {
vErrors.push(err256);
}
errors++;
}
}
}
if(data102.mindscape !== undefined){
let data106 = data102.mindscape;
if((!((typeof data106 == "number") && (!(data106 % 1) && !isNaN(data106)))) && (data106 !== null)){
const err257 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/mindscape",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/mindscape/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.mindscape.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err257];
}
else {
vErrors.push(err257);
}
errors++;
}
if(typeof data106 == "number"){
if(data106 > 6 || isNaN(data106)){
const err258 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/mindscape",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/mindscape/maximum",keyword:"maximum",params:{comparison: "<=", limit: 6},message:"must be <= 6"};
if(vErrors === null){
vErrors = [err258];
}
else {
vErrors.push(err258);
}
errors++;
}
if(data106 < 0 || isNaN(data106)){
const err259 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/mindscape",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/mindscape/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err259];
}
else {
vErrors.push(err259);
}
errors++;
}
}
}
if(data102.stats !== undefined){
let data107 = data102.stats;
if((!(data107 && typeof data107 == "object" && !Array.isArray(data107))) && (data107 !== null)){
const err260 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/stats",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/stats/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.stats.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err260];
}
else {
vErrors.push(err260);
}
errors++;
}
if(data107 && typeof data107 == "object" && !Array.isArray(data107)){
for(const key18 in data107){
let data108 = data107[key18];
if(((!(typeof data108 == "number")) && (typeof data108 !== "string")) && (data108 !== null)){
const err261 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/stats/" + key18.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/stats/additionalProperties/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.stats.additionalProperties.type},message:"must be number,string,null"};
if(vErrors === null){
vErrors = [err261];
}
else {
vErrors.push(err261);
}
errors++;
}
}
}
}
if(data102.skills !== undefined){
let data109 = data102.skills;
if((!(data109 && typeof data109 == "object" && !Array.isArray(data109))) && (data109 !== null)){
const err262 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.skills.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err262];
}
else {
vErrors.push(err262);
}
errors++;
}
if(data109 && typeof data109 == "object" && !Array.isArray(data109)){
for(const key19 in data109){
let data110 = data109[key19];
const _errs245 = errors;
let valid50 = false;
const _errs246 = errors;
if((!((typeof data110 == "number") && (!(data110 % 1) && !isNaN(data110)))) && (data110 !== null)){
const err263 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills/" + key19.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/additionalProperties/anyOf/0/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.skills.additionalProperties.anyOf[0].type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err263];
}
else {
vErrors.push(err263);
}
errors++;
}
if(typeof data110 == "number"){
if(data110 > 20 || isNaN(data110)){
const err264 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills/" + key19.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/additionalProperties/anyOf/0/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err264];
}
else {
vErrors.push(err264);
}
errors++;
}
if(data110 < 0 || isNaN(data110)){
const err265 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills/" + key19.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/additionalProperties/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err265];
}
else {
vErrors.push(err265);
}
errors++;
}
}
var _valid3 = _errs246 === errors;
valid50 = valid50 || _valid3;
const _errs248 = errors;
if(typeof data110 === "string"){
if(!pattern6.test(data110)){
const err266 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills/" + key19.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/additionalProperties/anyOf/1/pattern",keyword:"pattern",params:{pattern: "^[A-F]$"},message:"must match pattern \""+"^[A-F]$"+"\""};
if(vErrors === null){
vErrors = [err266];
}
else {
vErrors.push(err266);
}
errors++;
}
}
else {
const err267 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills/" + key19.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/additionalProperties/anyOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err267];
}
else {
vErrors.push(err267);
}
errors++;
}
var _valid3 = _errs248 === errors;
valid50 = valid50 || _valid3;
if(!valid50){
const err268 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/skills/" + key19.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/skills/additionalProperties/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err268];
}
else {
vErrors.push(err268);
}
errors++;
}
else {
errors = _errs245;
if(vErrors !== null){
if(_errs245){
vErrors.length = _errs245;
}
else {
vErrors = null;
}
}
}
}
}
}
if(data102.wEngine !== undefined){
let data111 = data102.wEngine;
if((!(data111 && typeof data111 == "object" && !Array.isArray(data111))) && (data111 !== null)){
const err269 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err269];
}
else {
vErrors.push(err269);
}
errors++;
}
if(data111 && typeof data111 == "object" && !Array.isArray(data111)){
if(data111.name !== undefined){
let data112 = data111.name;
if((typeof data112 !== "string") && (data112 !== null)){
const err270 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/name",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/name/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.name.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err270];
}
else {
vErrors.push(err270);
}
errors++;
}
}
if(data111.rarity !== undefined){
let data113 = data111.rarity;
if((typeof data113 !== "string") && (data113 !== null)){
const err271 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/rarity",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/rarity/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.rarity.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err271];
}
else {
vErrors.push(err271);
}
errors++;
}
}
if(data111.level !== undefined){
let data114 = data111.level;
if((!((typeof data114 == "number") && (!(data114 % 1) && !isNaN(data114)))) && (data114 !== null)){
const err272 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/level/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err272];
}
else {
vErrors.push(err272);
}
errors++;
}
if(typeof data114 == "number"){
if(data114 > 60 || isNaN(data114)){
const err273 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 60},message:"must be <= 60"};
if(vErrors === null){
vErrors = [err273];
}
else {
vErrors.push(err273);
}
errors++;
}
if(data114 < 0 || isNaN(data114)){
const err274 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err274];
}
else {
vErrors.push(err274);
}
errors++;
}
}
}
if(data111.refinement !== undefined){
let data115 = data111.refinement;
if((!((typeof data115 == "number") && (!(data115 % 1) && !isNaN(data115)))) && (data115 !== null)){
const err275 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/refinement",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/refinement/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.refinement.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err275];
}
else {
vErrors.push(err275);
}
errors++;
}
if(typeof data115 == "number"){
if(data115 > 5 || isNaN(data115)){
const err276 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/refinement",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/refinement/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err276];
}
else {
vErrors.push(err276);
}
errors++;
}
if(data115 < 1 || isNaN(data115)){
const err277 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/refinement",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/refinement/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err277];
}
else {
vErrors.push(err277);
}
errors++;
}
}
}
if(data111.stats !== undefined){
let data116 = data111.stats;
if((!(data116 && typeof data116 == "object" && !Array.isArray(data116))) && (data116 !== null)){
const err278 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/stats",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/stats/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.stats.type},message:"must be object,null"};
if(vErrors === null){
vErrors = [err278];
}
else {
vErrors.push(err278);
}
errors++;
}
if(data116 && typeof data116 == "object" && !Array.isArray(data116)){
for(const key20 in data116){
let data117 = data116[key20];
if(((!(typeof data117 == "number")) && (typeof data117 !== "string")) && (data117 !== null)){
const err279 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/stats/" + key20.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/stats/additionalProperties/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.stats.additionalProperties.type},message:"must be number,string,null"};
if(vErrors === null){
vErrors = [err279];
}
else {
vErrors.push(err279);
}
errors++;
}
}
}
}
if(data111.maxLevel !== undefined){
let data118 = data111.maxLevel;
if((!((typeof data118 == "number") && (!(data118 % 1) && !isNaN(data118)))) && (data118 !== null)){
const err280 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/maxLevel",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/maxLevel/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.wEngine.properties.maxLevel.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err280];
}
else {
vErrors.push(err280);
}
errors++;
}
if(typeof data118 == "number"){
if(data118 > 60 || isNaN(data118)){
const err281 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/maxLevel",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/maxLevel/maximum",keyword:"maximum",params:{comparison: "<=", limit: 60},message:"must be <= 60"};
if(vErrors === null){
vErrors = [err281];
}
else {
vErrors.push(err281);
}
errors++;
}
if(data118 < 1 || isNaN(data118)){
const err282 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/wEngine/maxLevel",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/wEngine/properties/maxLevel/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err282];
}
else {
vErrors.push(err282);
}
errors++;
}
}
}
}
}
if(data102.driveDiscs !== undefined){
let data119 = data102.driveDiscs;
if((!(Array.isArray(data119))) && (data119 !== null)){
const err283 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.type},message:"must be array,null"};
if(vErrors === null){
vErrors = [err283];
}
else {
vErrors.push(err283);
}
errors++;
}
if(Array.isArray(data119)){
if(data119.length > 6){
const err284 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/maxItems",keyword:"maxItems",params:{limit: 6},message:"must NOT have more than 6 items"};
if(vErrors === null){
vErrors = [err284];
}
else {
vErrors.push(err284);
}
errors++;
}
const len11 = data119.length;
for(let i13=0; i13<len11; i13++){
let data120 = data119[i13];
if(data120 && typeof data120 == "object" && !Array.isArray(data120)){
if(data120.id === undefined){
const err285 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err285];
}
else {
vErrors.push(err285);
}
errors++;
}
if(data120.slot === undefined){
const err286 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "slot"},message:"must have required property '"+"slot"+"'"};
if(vErrors === null){
vErrors = [err286];
}
else {
vErrors.push(err286);
}
errors++;
}
if(data120.setName === undefined){
const err287 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "setName"},message:"must have required property '"+"setName"+"'"};
if(vErrors === null){
vErrors = [err287];
}
else {
vErrors.push(err287);
}
errors++;
}
if(data120.rarity === undefined){
const err288 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "rarity"},message:"must have required property '"+"rarity"+"'"};
if(vErrors === null){
vErrors = [err288];
}
else {
vErrors.push(err288);
}
errors++;
}
if(data120.level === undefined){
const err289 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err289];
}
else {
vErrors.push(err289);
}
errors++;
}
if(data120.mainStat === undefined){
const err290 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "mainStat"},message:"must have required property '"+"mainStat"+"'"};
if(vErrors === null){
vErrors = [err290];
}
else {
vErrors.push(err290);
}
errors++;
}
if(data120.substats === undefined){
const err291 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "substats"},message:"must have required property '"+"substats"+"'"};
if(vErrors === null){
vErrors = [err291];
}
else {
vErrors.push(err291);
}
errors++;
}
if(data120.effectiveRollCount === undefined){
const err292 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "effectiveRollCount"},message:"must have required property '"+"effectiveRollCount"+"'"};
if(vErrors === null){
vErrors = [err292];
}
else {
vErrors.push(err292);
}
errors++;
}
if(data120.evidence === undefined){
const err293 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "evidence"},message:"must have required property '"+"evidence"+"'"};
if(vErrors === null){
vErrors = [err293];
}
else {
vErrors.push(err293);
}
errors++;
}
if(data120.uncertainties === undefined){
const err294 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "uncertainties"},message:"must have required property '"+"uncertainties"+"'"};
if(vErrors === null){
vErrors = [err294];
}
else {
vErrors.push(err294);
}
errors++;
}
if(data120.substatsComplete === undefined){
const err295 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/required",keyword:"required",params:{missingProperty: "substatsComplete"},message:"must have required property '"+"substatsComplete"+"'"};
if(vErrors === null){
vErrors = [err295];
}
else {
vErrors.push(err295);
}
errors++;
}
for(const key21 in data120){
if(!(func2.call(schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties, key21))){
const err296 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key21},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err296];
}
else {
vErrors.push(err296);
}
errors++;
}
}
if(data120.id !== undefined){
let data121 = data120.id;
if(typeof data121 === "string"){
if(!pattern5.test(data121)){
const err297 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/id",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z0-9_]+$"},message:"must match pattern \""+"^[a-z0-9_]+$"+"\""};
if(vErrors === null){
vErrors = [err297];
}
else {
vErrors.push(err297);
}
errors++;
}
}
else {
const err298 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/id",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err298];
}
else {
vErrors.push(err298);
}
errors++;
}
}
if(data120.slot !== undefined){
let data122 = data120.slot;
if(!((typeof data122 == "number") && (!(data122 % 1) && !isNaN(data122)))){
const err299 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/slot",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/slot/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err299];
}
else {
vErrors.push(err299);
}
errors++;
}
if(typeof data122 == "number"){
if(data122 > 6 || isNaN(data122)){
const err300 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/slot",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/slot/maximum",keyword:"maximum",params:{comparison: "<=", limit: 6},message:"must be <= 6"};
if(vErrors === null){
vErrors = [err300];
}
else {
vErrors.push(err300);
}
errors++;
}
if(data122 < 1 || isNaN(data122)){
const err301 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/slot",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/slot/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err301];
}
else {
vErrors.push(err301);
}
errors++;
}
}
}
if(data120.setName !== undefined){
let data123 = data120.setName;
if((typeof data123 !== "string") && (data123 !== null)){
const err302 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/setName",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/setName/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.setName.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err302];
}
else {
vErrors.push(err302);
}
errors++;
}
}
if(data120.rarity !== undefined){
let data124 = data120.rarity;
if(!((((data124 === "S") || (data124 === "A")) || (data124 === "B")) || (data124 === null))){
const err303 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/rarity",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/rarity/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.rarity.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err303];
}
else {
vErrors.push(err303);
}
errors++;
}
}
if(data120.level !== undefined){
let data125 = data120.level;
if((!((typeof data125 == "number") && (!(data125 % 1) && !isNaN(data125)))) && (data125 !== null)){
const err304 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/level/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err304];
}
else {
vErrors.push(err304);
}
errors++;
}
if(typeof data125 == "number"){
if(data125 > 15 || isNaN(data125)){
const err305 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 15},message:"must be <= 15"};
if(vErrors === null){
vErrors = [err305];
}
else {
vErrors.push(err305);
}
errors++;
}
if(data125 < 0 || isNaN(data125)){
const err306 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/level",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err306];
}
else {
vErrors.push(err306);
}
errors++;
}
}
}
if(data120.mainStat !== undefined){
let data126 = data120.mainStat;
if(data126 && typeof data126 == "object" && !Array.isArray(data126)){
if(data126.name === undefined){
const err307 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err307];
}
else {
vErrors.push(err307);
}
errors++;
}
if(data126.value === undefined){
const err308 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err308];
}
else {
vErrors.push(err308);
}
errors++;
}
if(data126.unit === undefined){
const err309 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err309];
}
else {
vErrors.push(err309);
}
errors++;
}
for(const key22 in data126){
if(!(((key22 === "name") || (key22 === "value")) || (key22 === "unit"))){
const err310 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key22},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err310];
}
else {
vErrors.push(err310);
}
errors++;
}
}
if(data126.name !== undefined){
let data127 = data126.name;
if((typeof data127 !== "string") && (data127 !== null)){
const err311 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat/name",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/properties/name/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.mainStat.properties.name.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err311];
}
else {
vErrors.push(err311);
}
errors++;
}
}
if(data126.value !== undefined){
let data128 = data126.value;
if((!(typeof data128 == "number")) && (data128 !== null)){
const err312 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat/value",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/properties/value/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.mainStat.properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err312];
}
else {
vErrors.push(err312);
}
errors++;
}
}
if(data126.unit !== undefined){
let data129 = data126.unit;
if(!(((data129 === "flat") || (data129 === "percent")) || (data129 === null))){
const err313 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat/unit",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/properties/unit/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.mainStat.properties.unit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err313];
}
else {
vErrors.push(err313);
}
errors++;
}
}
}
else {
const err314 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/mainStat",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/mainStat/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err314];
}
else {
vErrors.push(err314);
}
errors++;
}
}
if(data120.substats !== undefined){
let data130 = data120.substats;
if(Array.isArray(data130)){
if(data130.length > 4){
const err315 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/maxItems",keyword:"maxItems",params:{limit: 4},message:"must NOT have more than 4 items"};
if(vErrors === null){
vErrors = [err315];
}
else {
vErrors.push(err315);
}
errors++;
}
const len12 = data130.length;
for(let i14=0; i14<len12; i14++){
let data131 = data130[i14];
if(data131 && typeof data131 == "object" && !Array.isArray(data131)){
if(data131.name === undefined){
const err316 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err316];
}
else {
vErrors.push(err316);
}
errors++;
}
if(data131.value === undefined){
const err317 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err317];
}
else {
vErrors.push(err317);
}
errors++;
}
if(data131.unit === undefined){
const err318 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err318];
}
else {
vErrors.push(err318);
}
errors++;
}
if(data131.isEffective === undefined){
const err319 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "isEffective"},message:"must have required property '"+"isEffective"+"'"};
if(vErrors === null){
vErrors = [err319];
}
else {
vErrors.push(err319);
}
errors++;
}
if(data131.enhancementCount === undefined){
const err320 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/required",keyword:"required",params:{missingProperty: "enhancementCount"},message:"must have required property '"+"enhancementCount"+"'"};
if(vErrors === null){
vErrors = [err320];
}
else {
vErrors.push(err320);
}
errors++;
}
for(const key23 in data131){
if(!(((((key23 === "name") || (key23 === "value")) || (key23 === "unit")) || (key23 === "isEffective")) || (key23 === "enhancementCount"))){
const err321 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key23},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err321];
}
else {
vErrors.push(err321);
}
errors++;
}
}
if(data131.name !== undefined){
let data132 = data131.name;
if((typeof data132 !== "string") && (data132 !== null)){
const err322 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/name",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/name/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.substats.items.properties.name.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err322];
}
else {
vErrors.push(err322);
}
errors++;
}
}
if(data131.value !== undefined){
let data133 = data131.value;
if((!(typeof data133 == "number")) && (data133 !== null)){
const err323 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/value",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/value/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.substats.items.properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err323];
}
else {
vErrors.push(err323);
}
errors++;
}
}
if(data131.unit !== undefined){
let data134 = data131.unit;
if(!(((data134 === "flat") || (data134 === "percent")) || (data134 === null))){
const err324 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/unit",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/unit/enum",keyword:"enum",params:{allowedValues: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.substats.items.properties.unit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err324];
}
else {
vErrors.push(err324);
}
errors++;
}
}
if(data131.isEffective !== undefined){
let data135 = data131.isEffective;
if((typeof data135 !== "boolean") && (data135 !== null)){
const err325 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/isEffective",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/isEffective/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.substats.items.properties.isEffective.type},message:"must be boolean,null"};
if(vErrors === null){
vErrors = [err325];
}
else {
vErrors.push(err325);
}
errors++;
}
}
if(data131.enhancementCount !== undefined){
let data136 = data131.enhancementCount;
if((!((typeof data136 == "number") && (!(data136 % 1) && !isNaN(data136)))) && (data136 !== null)){
const err326 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/enhancementCount",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/enhancementCount/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.substats.items.properties.enhancementCount.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err326];
}
else {
vErrors.push(err326);
}
errors++;
}
if(typeof data136 == "number"){
if(data136 > 5 || isNaN(data136)){
const err327 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/enhancementCount",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/enhancementCount/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err327];
}
else {
vErrors.push(err327);
}
errors++;
}
if(data136 < 0 || isNaN(data136)){
const err328 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14+"/enhancementCount",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/properties/enhancementCount/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err328];
}
else {
vErrors.push(err328);
}
errors++;
}
}
}
}
else {
const err329 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats/" + i14,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err329];
}
else {
vErrors.push(err329);
}
errors++;
}
}
}
else {
const err330 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substats",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substats/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err330];
}
else {
vErrors.push(err330);
}
errors++;
}
}
if(data120.effectiveRollCount !== undefined){
let data137 = data120.effectiveRollCount;
if((!((typeof data137 == "number") && (!(data137 % 1) && !isNaN(data137)))) && (data137 !== null)){
const err331 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/effectiveRollCount",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/effectiveRollCount/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.driveDiscs.items.properties.effectiveRollCount.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err331];
}
else {
vErrors.push(err331);
}
errors++;
}
if(typeof data137 == "number"){
if(data137 > 9 || isNaN(data137)){
const err332 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/effectiveRollCount",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/effectiveRollCount/maximum",keyword:"maximum",params:{comparison: "<=", limit: 9},message:"must be <= 9"};
if(vErrors === null){
vErrors = [err332];
}
else {
vErrors.push(err332);
}
errors++;
}
if(data137 < 0 || isNaN(data137)){
const err333 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/effectiveRollCount",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/effectiveRollCount/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err333];
}
else {
vErrors.push(err333);
}
errors++;
}
}
}
if(data120.evidence !== undefined){
let data138 = data120.evidence;
if(Array.isArray(data138)){
if(data138.length < 1){
const err334 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err334];
}
else {
vErrors.push(err334);
}
errors++;
}
const len13 = data138.length;
for(let i15=0; i15<len13; i15++){
let data139 = data138[i15];
if(data139 && typeof data139 == "object" && !Array.isArray(data139)){
if(data139.timestampSec === undefined){
const err335 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/required",keyword:"required",params:{missingProperty: "timestampSec"},message:"must have required property '"+"timestampSec"+"'"};
if(vErrors === null){
vErrors = [err335];
}
else {
vErrors.push(err335);
}
errors++;
}
if(data139.framePath === undefined){
const err336 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/required",keyword:"required",params:{missingProperty: "framePath"},message:"must have required property '"+"framePath"+"'"};
if(vErrors === null){
vErrors = [err336];
}
else {
vErrors.push(err336);
}
errors++;
}
if(data139.sha256 === undefined){
const err337 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err337];
}
else {
vErrors.push(err337);
}
errors++;
}
for(const key24 in data139){
if(!((((((key24 === "timestampSec") || (key24 === "framePath")) || (key24 === "sha256")) || (key24 === "page")) || (key24 === "timestampToleranceSec")) || (key24 === "fields"))){
const err338 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key24},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err338];
}
else {
vErrors.push(err338);
}
errors++;
}
}
if(data139.timestampSec !== undefined){
let data140 = data139.timestampSec;
if(typeof data140 == "number"){
if(data140 < 0 || isNaN(data140)){
const err339 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/timestampSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/timestampSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err339];
}
else {
vErrors.push(err339);
}
errors++;
}
}
else {
const err340 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/timestampSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/timestampSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err340];
}
else {
vErrors.push(err340);
}
errors++;
}
}
if(data139.framePath !== undefined){
let data141 = data139.framePath;
if(typeof data141 === "string"){
if(!pattern8.test(data141)){
const err341 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/framePath",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/framePath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err341];
}
else {
vErrors.push(err341);
}
errors++;
}
}
else {
const err342 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/framePath",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/framePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err342];
}
else {
vErrors.push(err342);
}
errors++;
}
}
if(data139.sha256 !== undefined){
let data142 = data139.sha256;
if(typeof data142 === "string"){
if(!pattern4.test(data142)){
const err343 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/sha256",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err343];
}
else {
vErrors.push(err343);
}
errors++;
}
}
else {
const err344 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/sha256",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err344];
}
else {
vErrors.push(err344);
}
errors++;
}
}
if(data139.page !== undefined){
if(typeof data139.page !== "string"){
const err345 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/page",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/page/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err345];
}
else {
vErrors.push(err345);
}
errors++;
}
}
if(data139.timestampToleranceSec !== undefined){
let data144 = data139.timestampToleranceSec;
if(typeof data144 == "number"){
if(data144 < 0 || isNaN(data144)){
const err346 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/timestampToleranceSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err346];
}
else {
vErrors.push(err346);
}
errors++;
}
}
else {
const err347 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/timestampToleranceSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err347];
}
else {
vErrors.push(err347);
}
errors++;
}
}
if(data139.fields !== undefined){
let data145 = data139.fields;
if(Array.isArray(data145)){
const len14 = data145.length;
for(let i16=0; i16<len14; i16++){
if(typeof data145[i16] !== "string"){
const err348 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/fields/" + i16,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/fields/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err348];
}
else {
vErrors.push(err348);
}
errors++;
}
}
}
else {
const err349 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15+"/fields",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err349];
}
else {
vErrors.push(err349);
}
errors++;
}
}
}
else {
const err350 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence/" + i15,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err350];
}
else {
vErrors.push(err350);
}
errors++;
}
}
}
else {
const err351 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/evidence",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/evidence/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err351];
}
else {
vErrors.push(err351);
}
errors++;
}
}
if(data120.uncertainties !== undefined){
let data147 = data120.uncertainties;
if(Array.isArray(data147)){
const len15 = data147.length;
for(let i17=0; i17<len15; i17++){
if(typeof data147[i17] !== "string"){
const err352 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/uncertainties/" + i17,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/uncertainties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err352];
}
else {
vErrors.push(err352);
}
errors++;
}
}
}
else {
const err353 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/uncertainties",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/uncertainties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err353];
}
else {
vErrors.push(err353);
}
errors++;
}
}
if(data120.substatsComplete !== undefined){
if(typeof data120.substatsComplete !== "boolean"){
const err354 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13+"/substatsComplete",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/properties/substatsComplete/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err354];
}
else {
vErrors.push(err354);
}
errors++;
}
}
}
else {
const err355 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/driveDiscs/" + i13,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/driveDiscs/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err355];
}
else {
vErrors.push(err355);
}
errors++;
}
}
}
}
if(data102.evidence !== undefined){
let data150 = data102.evidence;
if(Array.isArray(data150)){
if(data150.length < 1){
const err356 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err356];
}
else {
vErrors.push(err356);
}
errors++;
}
const len16 = data150.length;
for(let i18=0; i18<len16; i18++){
let data151 = data150[i18];
if(data151 && typeof data151 == "object" && !Array.isArray(data151)){
if(data151.timestampSec === undefined){
const err357 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/required",keyword:"required",params:{missingProperty: "timestampSec"},message:"must have required property '"+"timestampSec"+"'"};
if(vErrors === null){
vErrors = [err357];
}
else {
vErrors.push(err357);
}
errors++;
}
if(data151.framePath === undefined){
const err358 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/required",keyword:"required",params:{missingProperty: "framePath"},message:"must have required property '"+"framePath"+"'"};
if(vErrors === null){
vErrors = [err358];
}
else {
vErrors.push(err358);
}
errors++;
}
if(data151.sha256 === undefined){
const err359 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err359];
}
else {
vErrors.push(err359);
}
errors++;
}
for(const key25 in data151){
if(!((((((key25 === "timestampSec") || (key25 === "framePath")) || (key25 === "sha256")) || (key25 === "page")) || (key25 === "timestampToleranceSec")) || (key25 === "fields"))){
const err360 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key25},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err360];
}
else {
vErrors.push(err360);
}
errors++;
}
}
if(data151.timestampSec !== undefined){
let data152 = data151.timestampSec;
if(typeof data152 == "number"){
if(data152 < 0 || isNaN(data152)){
const err361 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/timestampSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/timestampSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err361];
}
else {
vErrors.push(err361);
}
errors++;
}
}
else {
const err362 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/timestampSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/timestampSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err362];
}
else {
vErrors.push(err362);
}
errors++;
}
}
if(data151.framePath !== undefined){
let data153 = data151.framePath;
if(typeof data153 === "string"){
if(!pattern8.test(data153)){
const err363 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/framePath",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/framePath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err363];
}
else {
vErrors.push(err363);
}
errors++;
}
}
else {
const err364 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/framePath",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/framePath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err364];
}
else {
vErrors.push(err364);
}
errors++;
}
}
if(data151.sha256 !== undefined){
let data154 = data151.sha256;
if(typeof data154 === "string"){
if(!pattern4.test(data154)){
const err365 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/sha256",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err365];
}
else {
vErrors.push(err365);
}
errors++;
}
}
else {
const err366 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/sha256",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err366];
}
else {
vErrors.push(err366);
}
errors++;
}
}
if(data151.page !== undefined){
if(typeof data151.page !== "string"){
const err367 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/page",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/page/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err367];
}
else {
vErrors.push(err367);
}
errors++;
}
}
if(data151.timestampToleranceSec !== undefined){
let data156 = data151.timestampToleranceSec;
if(typeof data156 == "number"){
if(data156 < 0 || isNaN(data156)){
const err368 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/timestampToleranceSec/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err368];
}
else {
vErrors.push(err368);
}
errors++;
}
}
else {
const err369 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/timestampToleranceSec",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/timestampToleranceSec/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err369];
}
else {
vErrors.push(err369);
}
errors++;
}
}
if(data151.fields !== undefined){
let data157 = data151.fields;
if(Array.isArray(data157)){
const len17 = data157.length;
for(let i19=0; i19<len17; i19++){
if(typeof data157[i19] !== "string"){
const err370 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/fields/" + i19,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/fields/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err370];
}
else {
vErrors.push(err370);
}
errors++;
}
}
}
else {
const err371 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18+"/fields",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/properties/fields/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err371];
}
else {
vErrors.push(err371);
}
errors++;
}
}
}
else {
const err372 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence/" + i18,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err372];
}
else {
vErrors.push(err372);
}
errors++;
}
}
}
else {
const err373 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/evidence",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/evidence/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err373];
}
else {
vErrors.push(err373);
}
errors++;
}
}
if(data102.portraitPath !== undefined){
let data159 = data102.portraitPath;
if(typeof data159 === "string"){
if(!pattern8.test(data159)){
const err374 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/portraitPath",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/portraitPath/pattern",keyword:"pattern",params:{pattern: "^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"},message:"must match pattern \""+"^evidence/zzz/(?!.*\\.\\.)[a-zA-Z0-9_./-]+\\.(png|jpe?g)$"+"\""};
if(vErrors === null){
vErrors = [err374];
}
else {
vErrors.push(err374);
}
errors++;
}
}
else {
const err375 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/portraitPath",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/portraitPath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err375];
}
else {
vErrors.push(err375);
}
errors++;
}
}
if(data102.uncertainties !== undefined){
let data160 = data102.uncertainties;
if(Array.isArray(data160)){
const len18 = data160.length;
for(let i20=0; i20<len18; i20++){
if(typeof data160[i20] !== "string"){
const err376 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/uncertainties/" + i20,schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/uncertainties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err376];
}
else {
vErrors.push(err376);
}
errors++;
}
}
}
else {
const err377 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/uncertainties",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/uncertainties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err377];
}
else {
vErrors.push(err377);
}
errors++;
}
}
if(data102.portraitSha256 !== undefined){
let data162 = data102.portraitSha256;
if(typeof data162 === "string"){
if(!pattern4.test(data162)){
const err378 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/portraitSha256",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/portraitSha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err378];
}
else {
vErrors.push(err378);
}
errors++;
}
}
else {
const err379 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/portraitSha256",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/portraitSha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err379];
}
else {
vErrors.push(err379);
}
errors++;
}
}
if(data102.element !== undefined){
let data163 = data102.element;
if((typeof data163 !== "string") && (data163 !== null)){
const err380 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/element",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/element/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.element.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err380];
}
else {
vErrors.push(err380);
}
errors++;
}
}
if(data102.specialty !== undefined){
let data164 = data102.specialty;
if((typeof data164 !== "string") && (data164 !== null)){
const err381 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/specialty",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/specialty/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.specialty.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err381];
}
else {
vErrors.push(err381);
}
errors++;
}
}
if(data102.statsEffective !== undefined){
let data165 = data102.statsEffective;
if(data165 && typeof data165 == "object" && !Array.isArray(data165)){
for(const key26 in data165){
let data166 = data165[key26];
if((typeof data166 !== "boolean") && (data166 !== null)){
const err382 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/statsEffective/" + key26.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/statsEffective/additionalProperties/type",keyword:"type",params:{type: schema31.properties.characters.items.properties.legacyObservation.properties.statsEffective.additionalProperties.type},message:"must be boolean,null"};
if(vErrors === null){
vErrors = [err382];
}
else {
vErrors.push(err382);
}
errors++;
}
}
}
else {
const err383 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation/statsEffective",schemaPath:"#/properties/characters/items/properties/legacyObservation/properties/statsEffective/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err383];
}
else {
vErrors.push(err383);
}
errors++;
}
}
}
else {
const err384 = {instancePath:instancePath+"/characters/" + i0+"/legacyObservation",schemaPath:"#/properties/characters/items/properties/legacyObservation/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err384];
}
else {
vErrors.push(err384);
}
errors++;
}
}
}
else {
const err385 = {instancePath:instancePath+"/characters/" + i0,schemaPath:"#/properties/characters/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err385];
}
else {
vErrors.push(err385);
}
errors++;
}
}
}
else {
const err386 = {instancePath:instancePath+"/characters",schemaPath:"#/properties/characters/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err386];
}
else {
vErrors.push(err386);
}
errors++;
}
}
if(data.syncSources !== undefined){
let data167 = data.syncSources;
if(Array.isArray(data167)){
const len19 = data167.length;
for(let i21=0; i21<len19; i21++){
let data168 = data167[i21];
if(data168 && typeof data168 == "object" && !Array.isArray(data168)){
if(data168.id === undefined){
const err387 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err387];
}
else {
vErrors.push(err387);
}
errors++;
}
if(data168.provider === undefined){
const err388 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/required",keyword:"required",params:{missingProperty: "provider"},message:"must have required property '"+"provider"+"'"};
if(vErrors === null){
vErrors = [err388];
}
else {
vErrors.push(err388);
}
errors++;
}
if(data168.retrievedAt === undefined){
const err389 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err389];
}
else {
vErrors.push(err389);
}
errors++;
}
if(data168.path === undefined){
const err390 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/required",keyword:"required",params:{missingProperty: "path"},message:"must have required property '"+"path"+"'"};
if(vErrors === null){
vErrors = [err390];
}
else {
vErrors.push(err390);
}
errors++;
}
if(data168.sha256 === undefined){
const err391 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err391];
}
else {
vErrors.push(err391);
}
errors++;
}
for(const key27 in data168){
if(!(((((key27 === "id") || (key27 === "provider")) || (key27 === "retrievedAt")) || (key27 === "path")) || (key27 === "sha256"))){
const err392 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key27},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err392];
}
else {
vErrors.push(err392);
}
errors++;
}
}
if(data168.id !== undefined){
let data169 = data168.id;
if(typeof data169 === "string"){
if(!pattern10.test(data169)){
const err393 = {instancePath:instancePath+"/syncSources/" + i21+"/id",schemaPath:"#/properties/syncSources/items/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err393];
}
else {
vErrors.push(err393);
}
errors++;
}
}
else {
const err394 = {instancePath:instancePath+"/syncSources/" + i21+"/id",schemaPath:"#/properties/syncSources/items/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err394];
}
else {
vErrors.push(err394);
}
errors++;
}
}
if(data168.provider !== undefined){
if("hoyolab" !== data168.provider){
const err395 = {instancePath:instancePath+"/syncSources/" + i21+"/provider",schemaPath:"#/properties/syncSources/items/properties/provider/const",keyword:"const",params:{allowedValue: "hoyolab"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err395];
}
else {
vErrors.push(err395);
}
errors++;
}
}
if(data168.retrievedAt !== undefined){
let data171 = data168.retrievedAt;
if(typeof data171 === "string"){
if(func1(data171) < 1){
const err396 = {instancePath:instancePath+"/syncSources/" + i21+"/retrievedAt",schemaPath:"#/properties/syncSources/items/properties/retrievedAt/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err396];
}
else {
vErrors.push(err396);
}
errors++;
}
}
else {
const err397 = {instancePath:instancePath+"/syncSources/" + i21+"/retrievedAt",schemaPath:"#/properties/syncSources/items/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err397];
}
else {
vErrors.push(err397);
}
errors++;
}
}
if(data168.path !== undefined){
let data172 = data168.path;
if(typeof data172 === "string"){
if(!pattern29.test(data172)){
const err398 = {instancePath:instancePath+"/syncSources/" + i21+"/path",schemaPath:"#/properties/syncSources/items/properties/path/pattern",keyword:"pattern",params:{pattern: "^imports/hoyolab/[a-z][a-z0-9_]*\\.json$"},message:"must match pattern \""+"^imports/hoyolab/[a-z][a-z0-9_]*\\.json$"+"\""};
if(vErrors === null){
vErrors = [err398];
}
else {
vErrors.push(err398);
}
errors++;
}
}
else {
const err399 = {instancePath:instancePath+"/syncSources/" + i21+"/path",schemaPath:"#/properties/syncSources/items/properties/path/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err399];
}
else {
vErrors.push(err399);
}
errors++;
}
}
if(data168.sha256 !== undefined){
let data173 = data168.sha256;
if(typeof data173 === "string"){
if(!pattern4.test(data173)){
const err400 = {instancePath:instancePath+"/syncSources/" + i21+"/sha256",schemaPath:"#/properties/syncSources/items/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err400];
}
else {
vErrors.push(err400);
}
errors++;
}
}
else {
const err401 = {instancePath:instancePath+"/syncSources/" + i21+"/sha256",schemaPath:"#/properties/syncSources/items/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err401];
}
else {
vErrors.push(err401);
}
errors++;
}
}
}
else {
const err402 = {instancePath:instancePath+"/syncSources/" + i21,schemaPath:"#/properties/syncSources/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err402];
}
else {
vErrors.push(err402);
}
errors++;
}
}
}
else {
const err403 = {instancePath:instancePath+"/syncSources",schemaPath:"#/properties/syncSources/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err403];
}
else {
vErrors.push(err403);
}
errors++;
}
}
}
else {
const err404 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err404];
}
else {
vErrors.push(err404);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
