import runtime0Module from "ajv/dist/runtime/ucs2length.js";const runtime0=runtime0Module.default??runtime0Module;
"use strict";
export const validate = validate20;
export default validate20;
const schema31 = {"type":"object","properties":{"schema_version":{"const":2},"updated_at":{"type":"string","minLength":1},"source_ids":{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},"coverage":{"type":"object","properties":{"roster":{"enum":["partial","complete"]},"inventory":{"enum":["equipped_items_only","partial","complete"]},"notes":{"type":"array","items":{"type":"string","minLength":1}}},"required":["roster","inventory","notes"],"additionalProperties":false},"characters":{"type":"array","items":{"$ref":"#/$defs/character"}},"weapons":{"type":"array","items":{"$ref":"#/$defs/weapon"}},"artifacts":{"type":"array","items":{"$ref":"#/$defs/artifact"}},"equipment":{"type":"object","propertyNames":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"additionalProperties":{"type":"object","properties":{"weapon_id":{"type":["string","null"]},"artifacts":{"type":"object","properties":{"flower":{"type":["string","null"]},"plume":{"type":["string","null"]},"sands":{"type":["string","null"]},"goblet":{"type":["string","null"]},"circlet":{"type":["string","null"]}},"required":["flower","plume","sands","goblet","circlet"],"additionalProperties":false}},"required":["weapon_id","artifacts"],"additionalProperties":false}},"panel_snapshots":{"type":"array","items":{"$ref":"#/$defs/snapshot"}},"teams":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"character_ids":{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"uniqueItems":true,"maxItems":4},"notes":{"type":"array","items":{"type":"string","minLength":1}}},"required":["id","name","character_ids","notes"],"additionalProperties":false}}},"required":["schema_version","updated_at","source_ids","coverage","characters","weapons","artifacts","equipment","panel_snapshots","teams"],"additionalProperties":false,"$schema":"https://json-schema.org/draft/2020-12/schema","title":"Genshin account version 2","$defs":{"measurement":{"oneOf":[{"type":"object","properties":{"key":{"enum":["hp","atk","def","em","stamina"]},"value":{"type":["number","null"],"minimum":0},"unit":{"const":"flat"}},"required":["key","value","unit"],"additionalProperties":false},{"type":"object","properties":{"key":{"enum":["hp_pct","atk_pct","def_pct","crit_rate","crit_dmg","energy_recharge","healing_bonus","incoming_healing_bonus","cooldown_reduction","shield_strength","physical_dmg_bonus","pyro_dmg_bonus","hydro_dmg_bonus","dendro_dmg_bonus","electro_dmg_bonus","anemo_dmg_bonus","cryo_dmg_bonus","geo_dmg_bonus"]},"value":{"type":["number","null"],"minimum":0},"unit":{"const":"percent"}},"required":["key","value","unit"],"additionalProperties":false}]},"provenance":{"type":"object","properties":{"source_ids":{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},"evidence_refs":{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},"verification":{"enum":["agent_reviewed","user_reported","pending"]},"notes":{"type":"array","items":{"type":"string","minLength":1}}},"required":["source_ids","evidence_refs","verification","notes"],"additionalProperties":false},"level":{"type":"object","properties":{"current":{"type":["integer","null"],"minimum":1},"cap":{"type":["integer","null"],"minimum":1}},"required":["current","cap"],"additionalProperties":false},"character":{"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"element":{"enum":["pyro","hydro","dendro","electro","anemo","cryo","geo"]},"weapon_type":{"enum":["sword","claymore","polearm","bow","catalyst"]},"level":{"$ref":"#/$defs/level"},"constellation":{"type":["integer","null"],"minimum":0,"maximum":6},"friendship":{"type":["integer","null"],"minimum":0,"maximum":10},"talents":{"type":"object","properties":{"base":{"type":"object","properties":{"normal":{"type":["integer","null"],"minimum":0},"skill":{"type":["integer","null"],"minimum":0},"burst":{"type":["integer","null"],"minimum":0}},"required":["normal","skill","burst"],"additionalProperties":false},"displayed":{"type":"object","properties":{"normal":{"type":["integer","null"],"minimum":0},"skill":{"type":["integer","null"],"minimum":0},"burst":{"type":["integer","null"],"minimum":0}},"required":["normal","skill","burst"],"additionalProperties":false},"bonus_context":{"type":["string","null"]}},"required":["base","displayed","bonus_context"],"additionalProperties":false},"panel_snapshot_id":{"type":["string","null"]},"provenance":{"$ref":"#/$defs/provenance"}},"required":["id","name","element","weapon_type","level","constellation","friendship","talents","panel_snapshot_id","provenance"],"additionalProperties":false},"weapon":{"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"weapon_type":{"enum":["sword","claymore","polearm","bow","catalyst"]},"rarity":{"type":["integer","null"],"minimum":1,"maximum":5},"level":{"$ref":"#/$defs/level"},"refinement":{"type":["integer","null"],"minimum":1,"maximum":5},"base_atk":{"type":["number","null"],"minimum":0},"secondary_stat":{"anyOf":[{"$ref":"#/$defs/measurement"},{"type":"null"}]},"provenance":{"$ref":"#/$defs/provenance"}},"required":["id","name","weapon_type","rarity","level","refinement","base_atk","secondary_stat","provenance"],"additionalProperties":false},"artifact":{"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"set_name":{"type":"string","minLength":1},"slot":{"enum":["flower","plume","sands","goblet","circlet"]},"rarity":{"type":["integer","null"],"minimum":1,"maximum":5},"level":{"type":["integer","null"],"minimum":0,"maximum":20},"main_stat":{"$ref":"#/$defs/measurement"},"substats":{"type":"array","items":{"$ref":"#/$defs/measurement"},"maxItems":4},"provenance":{"$ref":"#/$defs/provenance"},"substat_rolls":{"type":"object","properties":{"character_id":{"type":["string","null"]},"values":{"type":"array","maxItems":4,"items":{"type":"object","properties":{"key":{"type":"string"},"enhancements":{"type":["integer","null"],"minimum":0,"maximum":5},"effective":{"type":["boolean","null"]}},"required":["key","enhancements","effective"],"additionalProperties":false}}},"required":["character_id","values"],"additionalProperties":false}},"required":["id","name","set_name","slot","rarity","level","main_stat","substats","provenance","substat_rolls"],"additionalProperties":false},"snapshot":{"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"character_id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"observed_at":{"type":["string","null"]},"imported_at":{"type":"string","minLength":1},"build_fingerprint":{"type":"string","pattern":"^[0-9a-f]{64}$"},"stats":{"type":"array","items":{"$ref":"#/$defs/measurement"}},"context":{"type":"object","properties":{"team_character_ids":{"anyOf":[{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},{"type":"null"}]},"buffs":{"type":["string","null"]},"notes":{"type":"array","items":{"type":"string","minLength":1}}},"required":["team_character_ids","buffs","notes"],"additionalProperties":false},"provenance":{"$ref":"#/$defs/provenance"}},"required":["id","character_id","observed_at","imported_at","build_fingerprint","stats","context","provenance"],"additionalProperties":false}}};
const func1 = Object.prototype.hasOwnProperty;
const func2 = runtime0;
const pattern4 = new RegExp("^[a-z][a-z0-9_]*$", "u");
const schema32 = {"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"element":{"enum":["pyro","hydro","dendro","electro","anemo","cryo","geo"]},"weapon_type":{"enum":["sword","claymore","polearm","bow","catalyst"]},"level":{"$ref":"#/$defs/level"},"constellation":{"type":["integer","null"],"minimum":0,"maximum":6},"friendship":{"type":["integer","null"],"minimum":0,"maximum":10},"talents":{"type":"object","properties":{"base":{"type":"object","properties":{"normal":{"type":["integer","null"],"minimum":0},"skill":{"type":["integer","null"],"minimum":0},"burst":{"type":["integer","null"],"minimum":0}},"required":["normal","skill","burst"],"additionalProperties":false},"displayed":{"type":"object","properties":{"normal":{"type":["integer","null"],"minimum":0},"skill":{"type":["integer","null"],"minimum":0},"burst":{"type":["integer","null"],"minimum":0}},"required":["normal","skill","burst"],"additionalProperties":false},"bonus_context":{"type":["string","null"]}},"required":["base","displayed","bonus_context"],"additionalProperties":false},"panel_snapshot_id":{"type":["string","null"]},"provenance":{"$ref":"#/$defs/provenance"}},"required":["id","name","element","weapon_type","level","constellation","friendship","talents","panel_snapshot_id","provenance"],"additionalProperties":false};
const schema33 = {"type":"object","properties":{"current":{"type":["integer","null"],"minimum":1},"cap":{"type":["integer","null"],"minimum":1}},"required":["current","cap"],"additionalProperties":false};
const schema34 = {"type":"object","properties":{"source_ids":{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},"evidence_refs":{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},"verification":{"enum":["agent_reviewed","user_reported","pending"]},"notes":{"type":"array","items":{"type":"string","minLength":1}}},"required":["source_ids","evidence_refs","verification","notes"],"additionalProperties":false};

function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate21.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.name === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.element === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "element"},message:"must have required property '"+"element"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.weapon_type === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "weapon_type"},message:"must have required property '"+"weapon_type"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.level === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.constellation === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "constellation"},message:"must have required property '"+"constellation"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.friendship === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "friendship"},message:"must have required property '"+"friendship"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.talents === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "talents"},message:"must have required property '"+"talents"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.panel_snapshot_id === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "panel_snapshot_id"},message:"must have required property '"+"panel_snapshot_id"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.provenance === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "provenance"},message:"must have required property '"+"provenance"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema32.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err11 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.name !== undefined){
let data1 = data.name;
if(typeof data1 === "string"){
if(func2(data1) < 1){
const err13 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.element !== undefined){
let data2 = data.element;
if(!(((((((data2 === "pyro") || (data2 === "hydro")) || (data2 === "dendro")) || (data2 === "electro")) || (data2 === "anemo")) || (data2 === "cryo")) || (data2 === "geo"))){
const err15 = {instancePath:instancePath+"/element",schemaPath:"#/properties/element/enum",keyword:"enum",params:{allowedValues: schema32.properties.element.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.weapon_type !== undefined){
let data3 = data.weapon_type;
if(!(((((data3 === "sword") || (data3 === "claymore")) || (data3 === "polearm")) || (data3 === "bow")) || (data3 === "catalyst"))){
const err16 = {instancePath:instancePath+"/weapon_type",schemaPath:"#/properties/weapon_type/enum",keyword:"enum",params:{allowedValues: schema32.properties.weapon_type.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.level !== undefined){
let data4 = data.level;
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(data4.current === undefined){
const err17 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/required",keyword:"required",params:{missingProperty: "current"},message:"must have required property '"+"current"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(data4.cap === undefined){
const err18 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/required",keyword:"required",params:{missingProperty: "cap"},message:"must have required property '"+"cap"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
for(const key1 in data4){
if(!((key1 === "current") || (key1 === "cap"))){
const err19 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data4.current !== undefined){
let data5 = data4.current;
if((!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))) && (data5 !== null)){
const err20 = {instancePath:instancePath+"/level/current",schemaPath:"#/$defs/level/properties/current/type",keyword:"type",params:{type: schema33.properties.current.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(typeof data5 == "number"){
if(data5 < 1 || isNaN(data5)){
const err21 = {instancePath:instancePath+"/level/current",schemaPath:"#/$defs/level/properties/current/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
if(data4.cap !== undefined){
let data6 = data4.cap;
if((!((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6)))) && (data6 !== null)){
const err22 = {instancePath:instancePath+"/level/cap",schemaPath:"#/$defs/level/properties/cap/type",keyword:"type",params:{type: schema33.properties.cap.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(typeof data6 == "number"){
if(data6 < 1 || isNaN(data6)){
const err23 = {instancePath:instancePath+"/level/cap",schemaPath:"#/$defs/level/properties/cap/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
}
else {
const err24 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.constellation !== undefined){
let data7 = data.constellation;
if((!((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7)))) && (data7 !== null)){
const err25 = {instancePath:instancePath+"/constellation",schemaPath:"#/properties/constellation/type",keyword:"type",params:{type: schema32.properties.constellation.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(typeof data7 == "number"){
if(data7 > 6 || isNaN(data7)){
const err26 = {instancePath:instancePath+"/constellation",schemaPath:"#/properties/constellation/maximum",keyword:"maximum",params:{comparison: "<=", limit: 6},message:"must be <= 6"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(data7 < 0 || isNaN(data7)){
const err27 = {instancePath:instancePath+"/constellation",schemaPath:"#/properties/constellation/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
if(data.friendship !== undefined){
let data8 = data.friendship;
if((!((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8)))) && (data8 !== null)){
const err28 = {instancePath:instancePath+"/friendship",schemaPath:"#/properties/friendship/type",keyword:"type",params:{type: schema32.properties.friendship.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(typeof data8 == "number"){
if(data8 > 10 || isNaN(data8)){
const err29 = {instancePath:instancePath+"/friendship",schemaPath:"#/properties/friendship/maximum",keyword:"maximum",params:{comparison: "<=", limit: 10},message:"must be <= 10"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if(data8 < 0 || isNaN(data8)){
const err30 = {instancePath:instancePath+"/friendship",schemaPath:"#/properties/friendship/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
if(data.talents !== undefined){
let data9 = data.talents;
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
if(data9.base === undefined){
const err31 = {instancePath:instancePath+"/talents",schemaPath:"#/properties/talents/required",keyword:"required",params:{missingProperty: "base"},message:"must have required property '"+"base"+"'"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if(data9.displayed === undefined){
const err32 = {instancePath:instancePath+"/talents",schemaPath:"#/properties/talents/required",keyword:"required",params:{missingProperty: "displayed"},message:"must have required property '"+"displayed"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data9.bonus_context === undefined){
const err33 = {instancePath:instancePath+"/talents",schemaPath:"#/properties/talents/required",keyword:"required",params:{missingProperty: "bonus_context"},message:"must have required property '"+"bonus_context"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
for(const key2 in data9){
if(!(((key2 === "base") || (key2 === "displayed")) || (key2 === "bonus_context"))){
const err34 = {instancePath:instancePath+"/talents",schemaPath:"#/properties/talents/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
if(data9.base !== undefined){
let data10 = data9.base;
if(data10 && typeof data10 == "object" && !Array.isArray(data10)){
if(data10.normal === undefined){
const err35 = {instancePath:instancePath+"/talents/base",schemaPath:"#/properties/talents/properties/base/required",keyword:"required",params:{missingProperty: "normal"},message:"must have required property '"+"normal"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if(data10.skill === undefined){
const err36 = {instancePath:instancePath+"/talents/base",schemaPath:"#/properties/talents/properties/base/required",keyword:"required",params:{missingProperty: "skill"},message:"must have required property '"+"skill"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if(data10.burst === undefined){
const err37 = {instancePath:instancePath+"/talents/base",schemaPath:"#/properties/talents/properties/base/required",keyword:"required",params:{missingProperty: "burst"},message:"must have required property '"+"burst"+"'"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
for(const key3 in data10){
if(!(((key3 === "normal") || (key3 === "skill")) || (key3 === "burst"))){
const err38 = {instancePath:instancePath+"/talents/base",schemaPath:"#/properties/talents/properties/base/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
if(data10.normal !== undefined){
let data11 = data10.normal;
if((!((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11)))) && (data11 !== null)){
const err39 = {instancePath:instancePath+"/talents/base/normal",schemaPath:"#/properties/talents/properties/base/properties/normal/type",keyword:"type",params:{type: schema32.properties.talents.properties.base.properties.normal.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(typeof data11 == "number"){
if(data11 < 0 || isNaN(data11)){
const err40 = {instancePath:instancePath+"/talents/base/normal",schemaPath:"#/properties/talents/properties/base/properties/normal/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
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
if(data10.skill !== undefined){
let data12 = data10.skill;
if((!((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12)))) && (data12 !== null)){
const err41 = {instancePath:instancePath+"/talents/base/skill",schemaPath:"#/properties/talents/properties/base/properties/skill/type",keyword:"type",params:{type: schema32.properties.talents.properties.base.properties.skill.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if(typeof data12 == "number"){
if(data12 < 0 || isNaN(data12)){
const err42 = {instancePath:instancePath+"/talents/base/skill",schemaPath:"#/properties/talents/properties/base/properties/skill/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
}
if(data10.burst !== undefined){
let data13 = data10.burst;
if((!((typeof data13 == "number") && (!(data13 % 1) && !isNaN(data13)))) && (data13 !== null)){
const err43 = {instancePath:instancePath+"/talents/base/burst",schemaPath:"#/properties/talents/properties/base/properties/burst/type",keyword:"type",params:{type: schema32.properties.talents.properties.base.properties.burst.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if(typeof data13 == "number"){
if(data13 < 0 || isNaN(data13)){
const err44 = {instancePath:instancePath+"/talents/base/burst",schemaPath:"#/properties/talents/properties/base/properties/burst/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
}
}
else {
const err45 = {instancePath:instancePath+"/talents/base",schemaPath:"#/properties/talents/properties/base/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data9.displayed !== undefined){
let data14 = data9.displayed;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
if(data14.normal === undefined){
const err46 = {instancePath:instancePath+"/talents/displayed",schemaPath:"#/properties/talents/properties/displayed/required",keyword:"required",params:{missingProperty: "normal"},message:"must have required property '"+"normal"+"'"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
if(data14.skill === undefined){
const err47 = {instancePath:instancePath+"/talents/displayed",schemaPath:"#/properties/talents/properties/displayed/required",keyword:"required",params:{missingProperty: "skill"},message:"must have required property '"+"skill"+"'"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
if(data14.burst === undefined){
const err48 = {instancePath:instancePath+"/talents/displayed",schemaPath:"#/properties/talents/properties/displayed/required",keyword:"required",params:{missingProperty: "burst"},message:"must have required property '"+"burst"+"'"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
for(const key4 in data14){
if(!(((key4 === "normal") || (key4 === "skill")) || (key4 === "burst"))){
const err49 = {instancePath:instancePath+"/talents/displayed",schemaPath:"#/properties/talents/properties/displayed/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
if(data14.normal !== undefined){
let data15 = data14.normal;
if((!((typeof data15 == "number") && (!(data15 % 1) && !isNaN(data15)))) && (data15 !== null)){
const err50 = {instancePath:instancePath+"/talents/displayed/normal",schemaPath:"#/properties/talents/properties/displayed/properties/normal/type",keyword:"type",params:{type: schema32.properties.talents.properties.displayed.properties.normal.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
if(typeof data15 == "number"){
if(data15 < 0 || isNaN(data15)){
const err51 = {instancePath:instancePath+"/talents/displayed/normal",schemaPath:"#/properties/talents/properties/displayed/properties/normal/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
}
if(data14.skill !== undefined){
let data16 = data14.skill;
if((!((typeof data16 == "number") && (!(data16 % 1) && !isNaN(data16)))) && (data16 !== null)){
const err52 = {instancePath:instancePath+"/talents/displayed/skill",schemaPath:"#/properties/talents/properties/displayed/properties/skill/type",keyword:"type",params:{type: schema32.properties.talents.properties.displayed.properties.skill.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if(typeof data16 == "number"){
if(data16 < 0 || isNaN(data16)){
const err53 = {instancePath:instancePath+"/talents/displayed/skill",schemaPath:"#/properties/talents/properties/displayed/properties/skill/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
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
if(data14.burst !== undefined){
let data17 = data14.burst;
if((!((typeof data17 == "number") && (!(data17 % 1) && !isNaN(data17)))) && (data17 !== null)){
const err54 = {instancePath:instancePath+"/talents/displayed/burst",schemaPath:"#/properties/talents/properties/displayed/properties/burst/type",keyword:"type",params:{type: schema32.properties.talents.properties.displayed.properties.burst.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(typeof data17 == "number"){
if(data17 < 0 || isNaN(data17)){
const err55 = {instancePath:instancePath+"/talents/displayed/burst",schemaPath:"#/properties/talents/properties/displayed/properties/burst/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
}
}
else {
const err56 = {instancePath:instancePath+"/talents/displayed",schemaPath:"#/properties/talents/properties/displayed/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data9.bonus_context !== undefined){
let data18 = data9.bonus_context;
if((typeof data18 !== "string") && (data18 !== null)){
const err57 = {instancePath:instancePath+"/talents/bonus_context",schemaPath:"#/properties/talents/properties/bonus_context/type",keyword:"type",params:{type: schema32.properties.talents.properties.bonus_context.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
}
else {
const err58 = {instancePath:instancePath+"/talents",schemaPath:"#/properties/talents/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
if(data.panel_snapshot_id !== undefined){
let data19 = data.panel_snapshot_id;
if((typeof data19 !== "string") && (data19 !== null)){
const err59 = {instancePath:instancePath+"/panel_snapshot_id",schemaPath:"#/properties/panel_snapshot_id/type",keyword:"type",params:{type: schema32.properties.panel_snapshot_id.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
if(data.provenance !== undefined){
let data20 = data.provenance;
if(data20 && typeof data20 == "object" && !Array.isArray(data20)){
if(data20.source_ids === undefined){
const err60 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "source_ids"},message:"must have required property '"+"source_ids"+"'"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
if(data20.evidence_refs === undefined){
const err61 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "evidence_refs"},message:"must have required property '"+"evidence_refs"+"'"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
if(data20.verification === undefined){
const err62 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "verification"},message:"must have required property '"+"verification"+"'"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
if(data20.notes === undefined){
const err63 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
for(const key5 in data20){
if(!((((key5 === "source_ids") || (key5 === "evidence_refs")) || (key5 === "verification")) || (key5 === "notes"))){
const err64 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
if(data20.source_ids !== undefined){
let data21 = data20.source_ids;
if(Array.isArray(data21)){
const len0 = data21.length;
for(let i0=0; i0<len0; i0++){
let data22 = data21[i0];
if(typeof data22 === "string"){
if(!pattern4.test(data22)){
const err65 = {instancePath:instancePath+"/provenance/source_ids/" + i0,schemaPath:"#/$defs/provenance/properties/source_ids/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
else {
const err66 = {instancePath:instancePath+"/provenance/source_ids/" + i0,schemaPath:"#/$defs/provenance/properties/source_ids/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
}
else {
const err67 = {instancePath:instancePath+"/provenance/source_ids",schemaPath:"#/$defs/provenance/properties/source_ids/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
if(data20.evidence_refs !== undefined){
let data23 = data20.evidence_refs;
if(Array.isArray(data23)){
const len1 = data23.length;
for(let i1=0; i1<len1; i1++){
let data24 = data23[i1];
if(typeof data24 === "string"){
if(!pattern4.test(data24)){
const err68 = {instancePath:instancePath+"/provenance/evidence_refs/" + i1,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
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
const err69 = {instancePath:instancePath+"/provenance/evidence_refs/" + i1,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
}
else {
const err70 = {instancePath:instancePath+"/provenance/evidence_refs",schemaPath:"#/$defs/provenance/properties/evidence_refs/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
if(data20.verification !== undefined){
let data25 = data20.verification;
if(!(((data25 === "agent_reviewed") || (data25 === "user_reported")) || (data25 === "pending"))){
const err71 = {instancePath:instancePath+"/provenance/verification",schemaPath:"#/$defs/provenance/properties/verification/enum",keyword:"enum",params:{allowedValues: schema34.properties.verification.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
if(data20.notes !== undefined){
let data26 = data20.notes;
if(Array.isArray(data26)){
const len2 = data26.length;
for(let i2=0; i2<len2; i2++){
let data27 = data26[i2];
if(typeof data27 === "string"){
if(func2(data27) < 1){
const err72 = {instancePath:instancePath+"/provenance/notes/" + i2,schemaPath:"#/$defs/provenance/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
else {
const err73 = {instancePath:instancePath+"/provenance/notes/" + i2,schemaPath:"#/$defs/provenance/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
}
else {
const err74 = {instancePath:instancePath+"/provenance/notes",schemaPath:"#/$defs/provenance/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
}
else {
const err75 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/type",keyword:"type",params:{type: "object"},message:"must be object"};
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
const err76 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
validate21.errors = vErrors;
return errors === 0;
}
validate21.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema35 = {"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"weapon_type":{"enum":["sword","claymore","polearm","bow","catalyst"]},"rarity":{"type":["integer","null"],"minimum":1,"maximum":5},"level":{"$ref":"#/$defs/level"},"refinement":{"type":["integer","null"],"minimum":1,"maximum":5},"base_atk":{"type":["number","null"],"minimum":0},"secondary_stat":{"anyOf":[{"$ref":"#/$defs/measurement"},{"type":"null"}]},"provenance":{"$ref":"#/$defs/provenance"}},"required":["id","name","weapon_type","rarity","level","refinement","base_atk","secondary_stat","provenance"],"additionalProperties":false};
const schema37 = {"oneOf":[{"type":"object","properties":{"key":{"enum":["hp","atk","def","em","stamina"]},"value":{"type":["number","null"],"minimum":0},"unit":{"const":"flat"}},"required":["key","value","unit"],"additionalProperties":false},{"type":"object","properties":{"key":{"enum":["hp_pct","atk_pct","def_pct","crit_rate","crit_dmg","energy_recharge","healing_bonus","incoming_healing_bonus","cooldown_reduction","shield_strength","physical_dmg_bonus","pyro_dmg_bonus","hydro_dmg_bonus","dendro_dmg_bonus","electro_dmg_bonus","anemo_dmg_bonus","cryo_dmg_bonus","geo_dmg_bonus"]},"value":{"type":["number","null"],"minimum":0},"unit":{"const":"percent"}},"required":["key","value","unit"],"additionalProperties":false}]};

function validate23(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate23.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.name === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.weapon_type === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "weapon_type"},message:"must have required property '"+"weapon_type"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.rarity === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "rarity"},message:"must have required property '"+"rarity"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.level === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.refinement === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "refinement"},message:"must have required property '"+"refinement"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.base_atk === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "base_atk"},message:"must have required property '"+"base_atk"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.secondary_stat === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "secondary_stat"},message:"must have required property '"+"secondary_stat"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.provenance === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "provenance"},message:"must have required property '"+"provenance"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema35.properties, key0))){
const err9 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err10 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
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
const err11 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.name !== undefined){
let data1 = data.name;
if(typeof data1 === "string"){
if(func2(data1) < 1){
const err12 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
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
const err13 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.weapon_type !== undefined){
let data2 = data.weapon_type;
if(!(((((data2 === "sword") || (data2 === "claymore")) || (data2 === "polearm")) || (data2 === "bow")) || (data2 === "catalyst"))){
const err14 = {instancePath:instancePath+"/weapon_type",schemaPath:"#/properties/weapon_type/enum",keyword:"enum",params:{allowedValues: schema35.properties.weapon_type.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.rarity !== undefined){
let data3 = data.rarity;
if((!((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3)))) && (data3 !== null)){
const err15 = {instancePath:instancePath+"/rarity",schemaPath:"#/properties/rarity/type",keyword:"type",params:{type: schema35.properties.rarity.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(typeof data3 == "number"){
if(data3 > 5 || isNaN(data3)){
const err16 = {instancePath:instancePath+"/rarity",schemaPath:"#/properties/rarity/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(data3 < 1 || isNaN(data3)){
const err17 = {instancePath:instancePath+"/rarity",schemaPath:"#/properties/rarity/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
if(data.level !== undefined){
let data4 = data.level;
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(data4.current === undefined){
const err18 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/required",keyword:"required",params:{missingProperty: "current"},message:"must have required property '"+"current"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data4.cap === undefined){
const err19 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/required",keyword:"required",params:{missingProperty: "cap"},message:"must have required property '"+"cap"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
for(const key1 in data4){
if(!((key1 === "current") || (key1 === "cap"))){
const err20 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data4.current !== undefined){
let data5 = data4.current;
if((!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))) && (data5 !== null)){
const err21 = {instancePath:instancePath+"/level/current",schemaPath:"#/$defs/level/properties/current/type",keyword:"type",params:{type: schema33.properties.current.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(typeof data5 == "number"){
if(data5 < 1 || isNaN(data5)){
const err22 = {instancePath:instancePath+"/level/current",schemaPath:"#/$defs/level/properties/current/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
}
if(data4.cap !== undefined){
let data6 = data4.cap;
if((!((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6)))) && (data6 !== null)){
const err23 = {instancePath:instancePath+"/level/cap",schemaPath:"#/$defs/level/properties/cap/type",keyword:"type",params:{type: schema33.properties.cap.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(typeof data6 == "number"){
if(data6 < 1 || isNaN(data6)){
const err24 = {instancePath:instancePath+"/level/cap",schemaPath:"#/$defs/level/properties/cap/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
}
else {
const err25 = {instancePath:instancePath+"/level",schemaPath:"#/$defs/level/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.refinement !== undefined){
let data7 = data.refinement;
if((!((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7)))) && (data7 !== null)){
const err26 = {instancePath:instancePath+"/refinement",schemaPath:"#/properties/refinement/type",keyword:"type",params:{type: schema35.properties.refinement.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(typeof data7 == "number"){
if(data7 > 5 || isNaN(data7)){
const err27 = {instancePath:instancePath+"/refinement",schemaPath:"#/properties/refinement/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
if(data7 < 1 || isNaN(data7)){
const err28 = {instancePath:instancePath+"/refinement",schemaPath:"#/properties/refinement/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
}
if(data.base_atk !== undefined){
let data8 = data.base_atk;
if((!(typeof data8 == "number")) && (data8 !== null)){
const err29 = {instancePath:instancePath+"/base_atk",schemaPath:"#/properties/base_atk/type",keyword:"type",params:{type: schema35.properties.base_atk.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if(typeof data8 == "number"){
if(data8 < 0 || isNaN(data8)){
const err30 = {instancePath:instancePath+"/base_atk",schemaPath:"#/properties/base_atk/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
if(data.secondary_stat !== undefined){
let data9 = data.secondary_stat;
const _errs22 = errors;
let valid3 = false;
const _errs23 = errors;
const _errs25 = errors;
let valid5 = false;
let passing0 = null;
const _errs26 = errors;
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
if(data9.key === undefined){
const err31 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if(data9.value === undefined){
const err32 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data9.unit === undefined){
const err33 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
for(const key2 in data9){
if(!(((key2 === "key") || (key2 === "value")) || (key2 === "unit"))){
const err34 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
if(data9.key !== undefined){
let data10 = data9.key;
if(!(((((data10 === "hp") || (data10 === "atk")) || (data10 === "def")) || (data10 === "em")) || (data10 === "stamina"))){
const err35 = {instancePath:instancePath+"/secondary_stat/key",schemaPath:"#/$defs/measurement/oneOf/0/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[0].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data9.value !== undefined){
let data11 = data9.value;
if((!(typeof data11 == "number")) && (data11 !== null)){
const err36 = {instancePath:instancePath+"/secondary_stat/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/type",keyword:"type",params:{type: schema37.oneOf[0].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if(typeof data11 == "number"){
if(data11 < 0 || isNaN(data11)){
const err37 = {instancePath:instancePath+"/secondary_stat/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
}
if(data9.unit !== undefined){
if("flat" !== data9.unit){
const err38 = {instancePath:instancePath+"/secondary_stat/unit",schemaPath:"#/$defs/measurement/oneOf/0/properties/unit/const",keyword:"const",params:{allowedValue: "flat"},message:"must be equal to constant"};
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
else {
const err39 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
var _valid1 = _errs26 === errors;
if(_valid1){
valid5 = true;
passing0 = 0;
var props0 = true;
}
const _errs33 = errors;
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
if(data9.key === undefined){
const err40 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if(data9.value === undefined){
const err41 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if(data9.unit === undefined){
const err42 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
for(const key3 in data9){
if(!(((key3 === "key") || (key3 === "value")) || (key3 === "unit"))){
const err43 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
if(data9.key !== undefined){
let data13 = data9.key;
if(!((((((((((((((((((data13 === "hp_pct") || (data13 === "atk_pct")) || (data13 === "def_pct")) || (data13 === "crit_rate")) || (data13 === "crit_dmg")) || (data13 === "energy_recharge")) || (data13 === "healing_bonus")) || (data13 === "incoming_healing_bonus")) || (data13 === "cooldown_reduction")) || (data13 === "shield_strength")) || (data13 === "physical_dmg_bonus")) || (data13 === "pyro_dmg_bonus")) || (data13 === "hydro_dmg_bonus")) || (data13 === "dendro_dmg_bonus")) || (data13 === "electro_dmg_bonus")) || (data13 === "anemo_dmg_bonus")) || (data13 === "cryo_dmg_bonus")) || (data13 === "geo_dmg_bonus"))){
const err44 = {instancePath:instancePath+"/secondary_stat/key",schemaPath:"#/$defs/measurement/oneOf/1/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[1].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data9.value !== undefined){
let data14 = data9.value;
if((!(typeof data14 == "number")) && (data14 !== null)){
const err45 = {instancePath:instancePath+"/secondary_stat/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/type",keyword:"type",params:{type: schema37.oneOf[1].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
if(typeof data14 == "number"){
if(data14 < 0 || isNaN(data14)){
const err46 = {instancePath:instancePath+"/secondary_stat/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
}
if(data9.unit !== undefined){
if("percent" !== data9.unit){
const err47 = {instancePath:instancePath+"/secondary_stat/unit",schemaPath:"#/$defs/measurement/oneOf/1/properties/unit/const",keyword:"const",params:{allowedValue: "percent"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
}
else {
const err48 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
var _valid1 = _errs33 === errors;
if(_valid1 && valid5){
valid5 = false;
passing0 = [passing0, 1];
}
else {
if(_valid1){
valid5 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid5){
const err49 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/$defs/measurement/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
else {
errors = _errs25;
if(vErrors !== null){
if(_errs25){
vErrors.length = _errs25;
}
else {
vErrors = null;
}
}
}
var _valid0 = _errs23 === errors;
valid3 = valid3 || _valid0;
const _errs40 = errors;
if(data9 !== null){
const err50 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/properties/secondary_stat/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
var _valid0 = _errs40 === errors;
valid3 = valid3 || _valid0;
if(!valid3){
const err51 = {instancePath:instancePath+"/secondary_stat",schemaPath:"#/properties/secondary_stat/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
else {
errors = _errs22;
if(vErrors !== null){
if(_errs22){
vErrors.length = _errs22;
}
else {
vErrors = null;
}
}
}
}
if(data.provenance !== undefined){
let data16 = data.provenance;
if(data16 && typeof data16 == "object" && !Array.isArray(data16)){
if(data16.source_ids === undefined){
const err52 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "source_ids"},message:"must have required property '"+"source_ids"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if(data16.evidence_refs === undefined){
const err53 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "evidence_refs"},message:"must have required property '"+"evidence_refs"+"'"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
if(data16.verification === undefined){
const err54 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "verification"},message:"must have required property '"+"verification"+"'"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(data16.notes === undefined){
const err55 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
for(const key4 in data16){
if(!((((key4 === "source_ids") || (key4 === "evidence_refs")) || (key4 === "verification")) || (key4 === "notes"))){
const err56 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data16.source_ids !== undefined){
let data17 = data16.source_ids;
if(Array.isArray(data17)){
const len0 = data17.length;
for(let i0=0; i0<len0; i0++){
let data18 = data17[i0];
if(typeof data18 === "string"){
if(!pattern4.test(data18)){
const err57 = {instancePath:instancePath+"/provenance/source_ids/" + i0,schemaPath:"#/$defs/provenance/properties/source_ids/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
else {
const err58 = {instancePath:instancePath+"/provenance/source_ids/" + i0,schemaPath:"#/$defs/provenance/properties/source_ids/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
else {
const err59 = {instancePath:instancePath+"/provenance/source_ids",schemaPath:"#/$defs/provenance/properties/source_ids/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
if(data16.evidence_refs !== undefined){
let data19 = data16.evidence_refs;
if(Array.isArray(data19)){
const len1 = data19.length;
for(let i1=0; i1<len1; i1++){
let data20 = data19[i1];
if(typeof data20 === "string"){
if(!pattern4.test(data20)){
const err60 = {instancePath:instancePath+"/provenance/evidence_refs/" + i1,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
else {
const err61 = {instancePath:instancePath+"/provenance/evidence_refs/" + i1,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
else {
const err62 = {instancePath:instancePath+"/provenance/evidence_refs",schemaPath:"#/$defs/provenance/properties/evidence_refs/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
if(data16.verification !== undefined){
let data21 = data16.verification;
if(!(((data21 === "agent_reviewed") || (data21 === "user_reported")) || (data21 === "pending"))){
const err63 = {instancePath:instancePath+"/provenance/verification",schemaPath:"#/$defs/provenance/properties/verification/enum",keyword:"enum",params:{allowedValues: schema34.properties.verification.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data16.notes !== undefined){
let data22 = data16.notes;
if(Array.isArray(data22)){
const len2 = data22.length;
for(let i2=0; i2<len2; i2++){
let data23 = data22[i2];
if(typeof data23 === "string"){
if(func2(data23) < 1){
const err64 = {instancePath:instancePath+"/provenance/notes/" + i2,schemaPath:"#/$defs/provenance/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
else {
const err65 = {instancePath:instancePath+"/provenance/notes/" + i2,schemaPath:"#/$defs/provenance/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
}
else {
const err66 = {instancePath:instancePath+"/provenance/notes",schemaPath:"#/$defs/provenance/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
}
else {
const err67 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
}
else {
const err68 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
validate23.errors = vErrors;
return errors === 0;
}
validate23.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema39 = {"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"name":{"type":"string","minLength":1},"set_name":{"type":"string","minLength":1},"slot":{"enum":["flower","plume","sands","goblet","circlet"]},"rarity":{"type":["integer","null"],"minimum":1,"maximum":5},"level":{"type":["integer","null"],"minimum":0,"maximum":20},"main_stat":{"$ref":"#/$defs/measurement"},"substats":{"type":"array","items":{"$ref":"#/$defs/measurement"},"maxItems":4},"provenance":{"$ref":"#/$defs/provenance"},"substat_rolls":{"type":"object","properties":{"character_id":{"type":["string","null"]},"values":{"type":"array","maxItems":4,"items":{"type":"object","properties":{"key":{"type":"string"},"enhancements":{"type":["integer","null"],"minimum":0,"maximum":5},"effective":{"type":["boolean","null"]}},"required":["key","enhancements","effective"],"additionalProperties":false}}},"required":["character_id","values"],"additionalProperties":false}},"required":["id","name","set_name","slot","rarity","level","main_stat","substats","provenance","substat_rolls"],"additionalProperties":false};

function validate25(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate25.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.name === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.set_name === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "set_name"},message:"must have required property '"+"set_name"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.slot === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "slot"},message:"must have required property '"+"slot"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.rarity === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "rarity"},message:"must have required property '"+"rarity"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.level === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "level"},message:"must have required property '"+"level"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.main_stat === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "main_stat"},message:"must have required property '"+"main_stat"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.substats === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "substats"},message:"must have required property '"+"substats"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.provenance === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "provenance"},message:"must have required property '"+"provenance"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.substat_rolls === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "substat_rolls"},message:"must have required property '"+"substat_rolls"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema39.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err11 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.name !== undefined){
let data1 = data.name;
if(typeof data1 === "string"){
if(func2(data1) < 1){
const err13 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.set_name !== undefined){
let data2 = data.set_name;
if(typeof data2 === "string"){
if(func2(data2) < 1){
const err15 = {instancePath:instancePath+"/set_name",schemaPath:"#/properties/set_name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/set_name",schemaPath:"#/properties/set_name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.slot !== undefined){
let data3 = data.slot;
if(!(((((data3 === "flower") || (data3 === "plume")) || (data3 === "sands")) || (data3 === "goblet")) || (data3 === "circlet"))){
const err17 = {instancePath:instancePath+"/slot",schemaPath:"#/properties/slot/enum",keyword:"enum",params:{allowedValues: schema39.properties.slot.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.rarity !== undefined){
let data4 = data.rarity;
if((!((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4)))) && (data4 !== null)){
const err18 = {instancePath:instancePath+"/rarity",schemaPath:"#/properties/rarity/type",keyword:"type",params:{type: schema39.properties.rarity.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(typeof data4 == "number"){
if(data4 > 5 || isNaN(data4)){
const err19 = {instancePath:instancePath+"/rarity",schemaPath:"#/properties/rarity/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data4 < 1 || isNaN(data4)){
const err20 = {instancePath:instancePath+"/rarity",schemaPath:"#/properties/rarity/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
}
if(data.level !== undefined){
let data5 = data.level;
if((!((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5)))) && (data5 !== null)){
const err21 = {instancePath:instancePath+"/level",schemaPath:"#/properties/level/type",keyword:"type",params:{type: schema39.properties.level.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(typeof data5 == "number"){
if(data5 > 20 || isNaN(data5)){
const err22 = {instancePath:instancePath+"/level",schemaPath:"#/properties/level/maximum",keyword:"maximum",params:{comparison: "<=", limit: 20},message:"must be <= 20"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(data5 < 0 || isNaN(data5)){
const err23 = {instancePath:instancePath+"/level",schemaPath:"#/properties/level/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
if(data.main_stat !== undefined){
let data6 = data.main_stat;
const _errs15 = errors;
let valid2 = false;
let passing0 = null;
const _errs16 = errors;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if(data6.key === undefined){
const err24 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
if(data6.value === undefined){
const err25 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(data6.unit === undefined){
const err26 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
for(const key1 in data6){
if(!(((key1 === "key") || (key1 === "value")) || (key1 === "unit"))){
const err27 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data6.key !== undefined){
let data7 = data6.key;
if(!(((((data7 === "hp") || (data7 === "atk")) || (data7 === "def")) || (data7 === "em")) || (data7 === "stamina"))){
const err28 = {instancePath:instancePath+"/main_stat/key",schemaPath:"#/$defs/measurement/oneOf/0/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[0].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data6.value !== undefined){
let data8 = data6.value;
if((!(typeof data8 == "number")) && (data8 !== null)){
const err29 = {instancePath:instancePath+"/main_stat/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/type",keyword:"type",params:{type: schema37.oneOf[0].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if(typeof data8 == "number"){
if(data8 < 0 || isNaN(data8)){
const err30 = {instancePath:instancePath+"/main_stat/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
if(data6.unit !== undefined){
if("flat" !== data6.unit){
const err31 = {instancePath:instancePath+"/main_stat/unit",schemaPath:"#/$defs/measurement/oneOf/0/properties/unit/const",keyword:"const",params:{allowedValue: "flat"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
var _valid0 = _errs16 === errors;
if(_valid0){
valid2 = true;
passing0 = 0;
var props0 = true;
}
const _errs23 = errors;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if(data6.key === undefined){
const err33 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data6.value === undefined){
const err34 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(data6.unit === undefined){
const err35 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
for(const key2 in data6){
if(!(((key2 === "key") || (key2 === "value")) || (key2 === "unit"))){
const err36 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
if(data6.key !== undefined){
let data10 = data6.key;
if(!((((((((((((((((((data10 === "hp_pct") || (data10 === "atk_pct")) || (data10 === "def_pct")) || (data10 === "crit_rate")) || (data10 === "crit_dmg")) || (data10 === "energy_recharge")) || (data10 === "healing_bonus")) || (data10 === "incoming_healing_bonus")) || (data10 === "cooldown_reduction")) || (data10 === "shield_strength")) || (data10 === "physical_dmg_bonus")) || (data10 === "pyro_dmg_bonus")) || (data10 === "hydro_dmg_bonus")) || (data10 === "dendro_dmg_bonus")) || (data10 === "electro_dmg_bonus")) || (data10 === "anemo_dmg_bonus")) || (data10 === "cryo_dmg_bonus")) || (data10 === "geo_dmg_bonus"))){
const err37 = {instancePath:instancePath+"/main_stat/key",schemaPath:"#/$defs/measurement/oneOf/1/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[1].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
if(data6.value !== undefined){
let data11 = data6.value;
if((!(typeof data11 == "number")) && (data11 !== null)){
const err38 = {instancePath:instancePath+"/main_stat/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/type",keyword:"type",params:{type: schema37.oneOf[1].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
if(typeof data11 == "number"){
if(data11 < 0 || isNaN(data11)){
const err39 = {instancePath:instancePath+"/main_stat/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
}
if(data6.unit !== undefined){
if("percent" !== data6.unit){
const err40 = {instancePath:instancePath+"/main_stat/unit",schemaPath:"#/$defs/measurement/oneOf/1/properties/unit/const",keyword:"const",params:{allowedValue: "percent"},message:"must be equal to constant"};
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
else {
const err41 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
var _valid0 = _errs23 === errors;
if(_valid0 && valid2){
valid2 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid2 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid2){
const err42 = {instancePath:instancePath+"/main_stat",schemaPath:"#/$defs/measurement/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
else {
errors = _errs15;
if(vErrors !== null){
if(_errs15){
vErrors.length = _errs15;
}
else {
vErrors = null;
}
}
}
}
if(data.substats !== undefined){
let data13 = data.substats;
if(Array.isArray(data13)){
if(data13.length > 4){
const err43 = {instancePath:instancePath+"/substats",schemaPath:"#/properties/substats/maxItems",keyword:"maxItems",params:{limit: 4},message:"must NOT have more than 4 items"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
const len0 = data13.length;
for(let i0=0; i0<len0; i0++){
let data14 = data13[i0];
const _errs34 = errors;
let valid8 = false;
let passing1 = null;
const _errs35 = errors;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
if(data14.key === undefined){
const err44 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
if(data14.value === undefined){
const err45 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
if(data14.unit === undefined){
const err46 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
for(const key3 in data14){
if(!(((key3 === "key") || (key3 === "value")) || (key3 === "unit"))){
const err47 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
if(data14.key !== undefined){
let data15 = data14.key;
if(!(((((data15 === "hp") || (data15 === "atk")) || (data15 === "def")) || (data15 === "em")) || (data15 === "stamina"))){
const err48 = {instancePath:instancePath+"/substats/" + i0+"/key",schemaPath:"#/$defs/measurement/oneOf/0/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[0].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data14.value !== undefined){
let data16 = data14.value;
if((!(typeof data16 == "number")) && (data16 !== null)){
const err49 = {instancePath:instancePath+"/substats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/type",keyword:"type",params:{type: schema37.oneOf[0].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(typeof data16 == "number"){
if(data16 < 0 || isNaN(data16)){
const err50 = {instancePath:instancePath+"/substats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
}
if(data14.unit !== undefined){
if("flat" !== data14.unit){
const err51 = {instancePath:instancePath+"/substats/" + i0+"/unit",schemaPath:"#/$defs/measurement/oneOf/0/properties/unit/const",keyword:"const",params:{allowedValue: "flat"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
}
else {
const err52 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
var _valid1 = _errs35 === errors;
if(_valid1){
valid8 = true;
passing1 = 0;
var props1 = true;
}
const _errs42 = errors;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
if(data14.key === undefined){
const err53 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
if(data14.value === undefined){
const err54 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(data14.unit === undefined){
const err55 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
for(const key4 in data14){
if(!(((key4 === "key") || (key4 === "value")) || (key4 === "unit"))){
const err56 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data14.key !== undefined){
let data18 = data14.key;
if(!((((((((((((((((((data18 === "hp_pct") || (data18 === "atk_pct")) || (data18 === "def_pct")) || (data18 === "crit_rate")) || (data18 === "crit_dmg")) || (data18 === "energy_recharge")) || (data18 === "healing_bonus")) || (data18 === "incoming_healing_bonus")) || (data18 === "cooldown_reduction")) || (data18 === "shield_strength")) || (data18 === "physical_dmg_bonus")) || (data18 === "pyro_dmg_bonus")) || (data18 === "hydro_dmg_bonus")) || (data18 === "dendro_dmg_bonus")) || (data18 === "electro_dmg_bonus")) || (data18 === "anemo_dmg_bonus")) || (data18 === "cryo_dmg_bonus")) || (data18 === "geo_dmg_bonus"))){
const err57 = {instancePath:instancePath+"/substats/" + i0+"/key",schemaPath:"#/$defs/measurement/oneOf/1/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[1].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
if(data14.value !== undefined){
let data19 = data14.value;
if((!(typeof data19 == "number")) && (data19 !== null)){
const err58 = {instancePath:instancePath+"/substats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/type",keyword:"type",params:{type: schema37.oneOf[1].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
if(typeof data19 == "number"){
if(data19 < 0 || isNaN(data19)){
const err59 = {instancePath:instancePath+"/substats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
}
if(data14.unit !== undefined){
if("percent" !== data14.unit){
const err60 = {instancePath:instancePath+"/substats/" + i0+"/unit",schemaPath:"#/$defs/measurement/oneOf/1/properties/unit/const",keyword:"const",params:{allowedValue: "percent"},message:"must be equal to constant"};
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
else {
const err61 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
var _valid1 = _errs42 === errors;
if(_valid1 && valid8){
valid8 = false;
passing1 = [passing1, 1];
}
else {
if(_valid1){
valid8 = true;
passing1 = 1;
if(props1 !== true){
props1 = true;
}
}
}
if(!valid8){
const err62 = {instancePath:instancePath+"/substats/" + i0,schemaPath:"#/$defs/measurement/oneOf",keyword:"oneOf",params:{passingSchemas: passing1},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
else {
errors = _errs34;
if(vErrors !== null){
if(_errs34){
vErrors.length = _errs34;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err63 = {instancePath:instancePath+"/substats",schemaPath:"#/properties/substats/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data.provenance !== undefined){
let data21 = data.provenance;
if(data21 && typeof data21 == "object" && !Array.isArray(data21)){
if(data21.source_ids === undefined){
const err64 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "source_ids"},message:"must have required property '"+"source_ids"+"'"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
if(data21.evidence_refs === undefined){
const err65 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "evidence_refs"},message:"must have required property '"+"evidence_refs"+"'"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
if(data21.verification === undefined){
const err66 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "verification"},message:"must have required property '"+"verification"+"'"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
if(data21.notes === undefined){
const err67 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
for(const key5 in data21){
if(!((((key5 === "source_ids") || (key5 === "evidence_refs")) || (key5 === "verification")) || (key5 === "notes"))){
const err68 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
if(data21.source_ids !== undefined){
let data22 = data21.source_ids;
if(Array.isArray(data22)){
const len1 = data22.length;
for(let i1=0; i1<len1; i1++){
let data23 = data22[i1];
if(typeof data23 === "string"){
if(!pattern4.test(data23)){
const err69 = {instancePath:instancePath+"/provenance/source_ids/" + i1,schemaPath:"#/$defs/provenance/properties/source_ids/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
else {
const err70 = {instancePath:instancePath+"/provenance/source_ids/" + i1,schemaPath:"#/$defs/provenance/properties/source_ids/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
}
else {
const err71 = {instancePath:instancePath+"/provenance/source_ids",schemaPath:"#/$defs/provenance/properties/source_ids/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
if(data21.evidence_refs !== undefined){
let data24 = data21.evidence_refs;
if(Array.isArray(data24)){
const len2 = data24.length;
for(let i2=0; i2<len2; i2++){
let data25 = data24[i2];
if(typeof data25 === "string"){
if(!pattern4.test(data25)){
const err72 = {instancePath:instancePath+"/provenance/evidence_refs/" + i2,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
else {
const err73 = {instancePath:instancePath+"/provenance/evidence_refs/" + i2,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
}
else {
const err74 = {instancePath:instancePath+"/provenance/evidence_refs",schemaPath:"#/$defs/provenance/properties/evidence_refs/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
if(data21.verification !== undefined){
let data26 = data21.verification;
if(!(((data26 === "agent_reviewed") || (data26 === "user_reported")) || (data26 === "pending"))){
const err75 = {instancePath:instancePath+"/provenance/verification",schemaPath:"#/$defs/provenance/properties/verification/enum",keyword:"enum",params:{allowedValues: schema34.properties.verification.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
if(data21.notes !== undefined){
let data27 = data21.notes;
if(Array.isArray(data27)){
const len3 = data27.length;
for(let i3=0; i3<len3; i3++){
let data28 = data27[i3];
if(typeof data28 === "string"){
if(func2(data28) < 1){
const err76 = {instancePath:instancePath+"/provenance/notes/" + i3,schemaPath:"#/$defs/provenance/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
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
const err77 = {instancePath:instancePath+"/provenance/notes/" + i3,schemaPath:"#/$defs/provenance/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
const err78 = {instancePath:instancePath+"/provenance/notes",schemaPath:"#/$defs/provenance/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
}
}
else {
const err79 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
}
if(data.substat_rolls !== undefined){
let data29 = data.substat_rolls;
if(data29 && typeof data29 == "object" && !Array.isArray(data29)){
if(data29.character_id === undefined){
const err80 = {instancePath:instancePath+"/substat_rolls",schemaPath:"#/properties/substat_rolls/required",keyword:"required",params:{missingProperty: "character_id"},message:"must have required property '"+"character_id"+"'"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
if(data29.values === undefined){
const err81 = {instancePath:instancePath+"/substat_rolls",schemaPath:"#/properties/substat_rolls/required",keyword:"required",params:{missingProperty: "values"},message:"must have required property '"+"values"+"'"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
for(const key6 in data29){
if(!((key6 === "character_id") || (key6 === "values"))){
const err82 = {instancePath:instancePath+"/substat_rolls",schemaPath:"#/properties/substat_rolls/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
}
if(data29.character_id !== undefined){
let data30 = data29.character_id;
if((typeof data30 !== "string") && (data30 !== null)){
const err83 = {instancePath:instancePath+"/substat_rolls/character_id",schemaPath:"#/properties/substat_rolls/properties/character_id/type",keyword:"type",params:{type: schema39.properties.substat_rolls.properties.character_id.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
}
if(data29.values !== undefined){
let data31 = data29.values;
if(Array.isArray(data31)){
if(data31.length > 4){
const err84 = {instancePath:instancePath+"/substat_rolls/values",schemaPath:"#/properties/substat_rolls/properties/values/maxItems",keyword:"maxItems",params:{limit: 4},message:"must NOT have more than 4 items"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
const len4 = data31.length;
for(let i4=0; i4<len4; i4++){
let data32 = data31[i4];
if(data32 && typeof data32 == "object" && !Array.isArray(data32)){
if(data32.key === undefined){
const err85 = {instancePath:instancePath+"/substat_rolls/values/" + i4,schemaPath:"#/properties/substat_rolls/properties/values/items/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
if(data32.enhancements === undefined){
const err86 = {instancePath:instancePath+"/substat_rolls/values/" + i4,schemaPath:"#/properties/substat_rolls/properties/values/items/required",keyword:"required",params:{missingProperty: "enhancements"},message:"must have required property '"+"enhancements"+"'"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
if(data32.effective === undefined){
const err87 = {instancePath:instancePath+"/substat_rolls/values/" + i4,schemaPath:"#/properties/substat_rolls/properties/values/items/required",keyword:"required",params:{missingProperty: "effective"},message:"must have required property '"+"effective"+"'"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
for(const key7 in data32){
if(!(((key7 === "key") || (key7 === "enhancements")) || (key7 === "effective"))){
const err88 = {instancePath:instancePath+"/substat_rolls/values/" + i4,schemaPath:"#/properties/substat_rolls/properties/values/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key7},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
}
if(data32.key !== undefined){
if(typeof data32.key !== "string"){
const err89 = {instancePath:instancePath+"/substat_rolls/values/" + i4+"/key",schemaPath:"#/properties/substat_rolls/properties/values/items/properties/key/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
if(data32.enhancements !== undefined){
let data34 = data32.enhancements;
if((!((typeof data34 == "number") && (!(data34 % 1) && !isNaN(data34)))) && (data34 !== null)){
const err90 = {instancePath:instancePath+"/substat_rolls/values/" + i4+"/enhancements",schemaPath:"#/properties/substat_rolls/properties/values/items/properties/enhancements/type",keyword:"type",params:{type: schema39.properties.substat_rolls.properties.values.items.properties.enhancements.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
if(typeof data34 == "number"){
if(data34 > 5 || isNaN(data34)){
const err91 = {instancePath:instancePath+"/substat_rolls/values/" + i4+"/enhancements",schemaPath:"#/properties/substat_rolls/properties/values/items/properties/enhancements/maximum",keyword:"maximum",params:{comparison: "<=", limit: 5},message:"must be <= 5"};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
if(data34 < 0 || isNaN(data34)){
const err92 = {instancePath:instancePath+"/substat_rolls/values/" + i4+"/enhancements",schemaPath:"#/properties/substat_rolls/properties/values/items/properties/enhancements/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
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
if(data32.effective !== undefined){
let data35 = data32.effective;
if((typeof data35 !== "boolean") && (data35 !== null)){
const err93 = {instancePath:instancePath+"/substat_rolls/values/" + i4+"/effective",schemaPath:"#/properties/substat_rolls/properties/values/items/properties/effective/type",keyword:"type",params:{type: schema39.properties.substat_rolls.properties.values.items.properties.effective.type},message:"must be boolean,null"};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
}
}
else {
const err94 = {instancePath:instancePath+"/substat_rolls/values/" + i4,schemaPath:"#/properties/substat_rolls/properties/values/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
}
}
else {
const err95 = {instancePath:instancePath+"/substat_rolls/values",schemaPath:"#/properties/substat_rolls/properties/values/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
}
}
else {
const err96 = {instancePath:instancePath+"/substat_rolls",schemaPath:"#/properties/substat_rolls/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
}
}
else {
const err97 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
validate25.errors = vErrors;
return errors === 0;
}
validate25.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema43 = {"type":"object","properties":{"id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"character_id":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"},"observed_at":{"type":["string","null"]},"imported_at":{"type":"string","minLength":1},"build_fingerprint":{"type":"string","pattern":"^[0-9a-f]{64}$"},"stats":{"type":"array","items":{"$ref":"#/$defs/measurement"}},"context":{"type":"object","properties":{"team_character_ids":{"anyOf":[{"type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]*$"}},{"type":"null"}]},"buffs":{"type":["string","null"]},"notes":{"type":"array","items":{"type":"string","minLength":1}}},"required":["team_character_ids","buffs","notes"],"additionalProperties":false},"provenance":{"$ref":"#/$defs/provenance"}},"required":["id","character_id","observed_at","imported_at","build_fingerprint","stats","context","provenance"],"additionalProperties":false};
const pattern17 = new RegExp("^[0-9a-f]{64}$", "u");

function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.character_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "character_id"},message:"must have required property '"+"character_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.observed_at === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "observed_at"},message:"must have required property '"+"observed_at"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.imported_at === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "imported_at"},message:"must have required property '"+"imported_at"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.build_fingerprint === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "build_fingerprint"},message:"must have required property '"+"build_fingerprint"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.stats === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "stats"},message:"must have required property '"+"stats"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.context === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "context"},message:"must have required property '"+"context"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.provenance === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "provenance"},message:"must have required property '"+"provenance"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "character_id")) || (key0 === "observed_at")) || (key0 === "imported_at")) || (key0 === "build_fingerprint")) || (key0 === "stats")) || (key0 === "context")) || (key0 === "provenance"))){
const err8 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err9 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.character_id !== undefined){
let data1 = data.character_id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err11 = {instancePath:instancePath+"/character_id",schemaPath:"#/properties/character_id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/character_id",schemaPath:"#/properties/character_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.observed_at !== undefined){
let data2 = data.observed_at;
if((typeof data2 !== "string") && (data2 !== null)){
const err13 = {instancePath:instancePath+"/observed_at",schemaPath:"#/properties/observed_at/type",keyword:"type",params:{type: schema43.properties.observed_at.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.imported_at !== undefined){
let data3 = data.imported_at;
if(typeof data3 === "string"){
if(func2(data3) < 1){
const err14 = {instancePath:instancePath+"/imported_at",schemaPath:"#/properties/imported_at/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
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
const err15 = {instancePath:instancePath+"/imported_at",schemaPath:"#/properties/imported_at/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.build_fingerprint !== undefined){
let data4 = data.build_fingerprint;
if(typeof data4 === "string"){
if(!pattern17.test(data4)){
const err16 = {instancePath:instancePath+"/build_fingerprint",schemaPath:"#/properties/build_fingerprint/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/build_fingerprint",schemaPath:"#/properties/build_fingerprint/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.stats !== undefined){
let data5 = data.stats;
if(Array.isArray(data5)){
const len0 = data5.length;
for(let i0=0; i0<len0; i0++){
let data6 = data5[i0];
const _errs16 = errors;
let valid4 = false;
let passing0 = null;
const _errs17 = errors;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if(data6.key === undefined){
const err18 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data6.value === undefined){
const err19 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data6.unit === undefined){
const err20 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
for(const key1 in data6){
if(!(((key1 === "key") || (key1 === "value")) || (key1 === "unit"))){
const err21 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data6.key !== undefined){
let data7 = data6.key;
if(!(((((data7 === "hp") || (data7 === "atk")) || (data7 === "def")) || (data7 === "em")) || (data7 === "stamina"))){
const err22 = {instancePath:instancePath+"/stats/" + i0+"/key",schemaPath:"#/$defs/measurement/oneOf/0/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[0].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data6.value !== undefined){
let data8 = data6.value;
if((!(typeof data8 == "number")) && (data8 !== null)){
const err23 = {instancePath:instancePath+"/stats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/type",keyword:"type",params:{type: schema37.oneOf[0].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(typeof data8 == "number"){
if(data8 < 0 || isNaN(data8)){
const err24 = {instancePath:instancePath+"/stats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/0/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
if(data6.unit !== undefined){
if("flat" !== data6.unit){
const err25 = {instancePath:instancePath+"/stats/" + i0+"/unit",schemaPath:"#/$defs/measurement/oneOf/0/properties/unit/const",keyword:"const",params:{allowedValue: "flat"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
else {
const err26 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
var _valid0 = _errs17 === errors;
if(_valid0){
valid4 = true;
passing0 = 0;
var props0 = true;
}
const _errs24 = errors;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if(data6.key === undefined){
const err27 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
if(data6.value === undefined){
const err28 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
if(data6.unit === undefined){
const err29 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/required",keyword:"required",params:{missingProperty: "unit"},message:"must have required property '"+"unit"+"'"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
for(const key2 in data6){
if(!(((key2 === "key") || (key2 === "value")) || (key2 === "unit"))){
const err30 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data6.key !== undefined){
let data10 = data6.key;
if(!((((((((((((((((((data10 === "hp_pct") || (data10 === "atk_pct")) || (data10 === "def_pct")) || (data10 === "crit_rate")) || (data10 === "crit_dmg")) || (data10 === "energy_recharge")) || (data10 === "healing_bonus")) || (data10 === "incoming_healing_bonus")) || (data10 === "cooldown_reduction")) || (data10 === "shield_strength")) || (data10 === "physical_dmg_bonus")) || (data10 === "pyro_dmg_bonus")) || (data10 === "hydro_dmg_bonus")) || (data10 === "dendro_dmg_bonus")) || (data10 === "electro_dmg_bonus")) || (data10 === "anemo_dmg_bonus")) || (data10 === "cryo_dmg_bonus")) || (data10 === "geo_dmg_bonus"))){
const err31 = {instancePath:instancePath+"/stats/" + i0+"/key",schemaPath:"#/$defs/measurement/oneOf/1/properties/key/enum",keyword:"enum",params:{allowedValues: schema37.oneOf[1].properties.key.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data6.value !== undefined){
let data11 = data6.value;
if((!(typeof data11 == "number")) && (data11 !== null)){
const err32 = {instancePath:instancePath+"/stats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/type",keyword:"type",params:{type: schema37.oneOf[1].properties.value.type},message:"must be number,null"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(typeof data11 == "number"){
if(data11 < 0 || isNaN(data11)){
const err33 = {instancePath:instancePath+"/stats/" + i0+"/value",schemaPath:"#/$defs/measurement/oneOf/1/properties/value/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
}
if(data6.unit !== undefined){
if("percent" !== data6.unit){
const err34 = {instancePath:instancePath+"/stats/" + i0+"/unit",schemaPath:"#/$defs/measurement/oneOf/1/properties/unit/const",keyword:"const",params:{allowedValue: "percent"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
}
else {
const err35 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf/1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var _valid0 = _errs24 === errors;
if(_valid0 && valid4){
valid4 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid4 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
}
if(!valid4){
const err36 = {instancePath:instancePath+"/stats/" + i0,schemaPath:"#/$defs/measurement/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
else {
errors = _errs16;
if(vErrors !== null){
if(_errs16){
vErrors.length = _errs16;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err37 = {instancePath:instancePath+"/stats",schemaPath:"#/properties/stats/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
if(data.context !== undefined){
let data13 = data.context;
if(data13 && typeof data13 == "object" && !Array.isArray(data13)){
if(data13.team_character_ids === undefined){
const err38 = {instancePath:instancePath+"/context",schemaPath:"#/properties/context/required",keyword:"required",params:{missingProperty: "team_character_ids"},message:"must have required property '"+"team_character_ids"+"'"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
if(data13.buffs === undefined){
const err39 = {instancePath:instancePath+"/context",schemaPath:"#/properties/context/required",keyword:"required",params:{missingProperty: "buffs"},message:"must have required property '"+"buffs"+"'"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(data13.notes === undefined){
const err40 = {instancePath:instancePath+"/context",schemaPath:"#/properties/context/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
for(const key3 in data13){
if(!(((key3 === "team_character_ids") || (key3 === "buffs")) || (key3 === "notes"))){
const err41 = {instancePath:instancePath+"/context",schemaPath:"#/properties/context/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data13.team_character_ids !== undefined){
let data14 = data13.team_character_ids;
const _errs35 = errors;
let valid8 = false;
const _errs36 = errors;
if(Array.isArray(data14)){
const len1 = data14.length;
for(let i1=0; i1<len1; i1++){
let data15 = data14[i1];
if(typeof data15 === "string"){
if(!pattern4.test(data15)){
const err42 = {instancePath:instancePath+"/context/team_character_ids/" + i1,schemaPath:"#/properties/context/properties/team_character_ids/anyOf/0/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
else {
const err43 = {instancePath:instancePath+"/context/team_character_ids/" + i1,schemaPath:"#/properties/context/properties/team_character_ids/anyOf/0/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
}
else {
const err44 = {instancePath:instancePath+"/context/team_character_ids",schemaPath:"#/properties/context/properties/team_character_ids/anyOf/0/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
var _valid1 = _errs36 === errors;
valid8 = valid8 || _valid1;
const _errs40 = errors;
if(data14 !== null){
const err45 = {instancePath:instancePath+"/context/team_character_ids",schemaPath:"#/properties/context/properties/team_character_ids/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
var _valid1 = _errs40 === errors;
valid8 = valid8 || _valid1;
if(!valid8){
const err46 = {instancePath:instancePath+"/context/team_character_ids",schemaPath:"#/properties/context/properties/team_character_ids/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
else {
errors = _errs35;
if(vErrors !== null){
if(_errs35){
vErrors.length = _errs35;
}
else {
vErrors = null;
}
}
}
}
if(data13.buffs !== undefined){
let data16 = data13.buffs;
if((typeof data16 !== "string") && (data16 !== null)){
const err47 = {instancePath:instancePath+"/context/buffs",schemaPath:"#/properties/context/properties/buffs/type",keyword:"type",params:{type: schema43.properties.context.properties.buffs.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
if(data13.notes !== undefined){
let data17 = data13.notes;
if(Array.isArray(data17)){
const len2 = data17.length;
for(let i2=0; i2<len2; i2++){
let data18 = data17[i2];
if(typeof data18 === "string"){
if(func2(data18) < 1){
const err48 = {instancePath:instancePath+"/context/notes/" + i2,schemaPath:"#/properties/context/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
else {
const err49 = {instancePath:instancePath+"/context/notes/" + i2,schemaPath:"#/properties/context/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
}
else {
const err50 = {instancePath:instancePath+"/context/notes",schemaPath:"#/properties/context/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
}
else {
const err51 = {instancePath:instancePath+"/context",schemaPath:"#/properties/context/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
if(data.provenance !== undefined){
let data19 = data.provenance;
if(data19 && typeof data19 == "object" && !Array.isArray(data19)){
if(data19.source_ids === undefined){
const err52 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "source_ids"},message:"must have required property '"+"source_ids"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if(data19.evidence_refs === undefined){
const err53 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "evidence_refs"},message:"must have required property '"+"evidence_refs"+"'"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
if(data19.verification === undefined){
const err54 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "verification"},message:"must have required property '"+"verification"+"'"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(data19.notes === undefined){
const err55 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
for(const key4 in data19){
if(!((((key4 === "source_ids") || (key4 === "evidence_refs")) || (key4 === "verification")) || (key4 === "notes"))){
const err56 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data19.source_ids !== undefined){
let data20 = data19.source_ids;
if(Array.isArray(data20)){
const len3 = data20.length;
for(let i3=0; i3<len3; i3++){
let data21 = data20[i3];
if(typeof data21 === "string"){
if(!pattern4.test(data21)){
const err57 = {instancePath:instancePath+"/provenance/source_ids/" + i3,schemaPath:"#/$defs/provenance/properties/source_ids/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
else {
const err58 = {instancePath:instancePath+"/provenance/source_ids/" + i3,schemaPath:"#/$defs/provenance/properties/source_ids/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
else {
const err59 = {instancePath:instancePath+"/provenance/source_ids",schemaPath:"#/$defs/provenance/properties/source_ids/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
if(data19.evidence_refs !== undefined){
let data22 = data19.evidence_refs;
if(Array.isArray(data22)){
const len4 = data22.length;
for(let i4=0; i4<len4; i4++){
let data23 = data22[i4];
if(typeof data23 === "string"){
if(!pattern4.test(data23)){
const err60 = {instancePath:instancePath+"/provenance/evidence_refs/" + i4,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
else {
const err61 = {instancePath:instancePath+"/provenance/evidence_refs/" + i4,schemaPath:"#/$defs/provenance/properties/evidence_refs/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
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
else {
const err62 = {instancePath:instancePath+"/provenance/evidence_refs",schemaPath:"#/$defs/provenance/properties/evidence_refs/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
if(data19.verification !== undefined){
let data24 = data19.verification;
if(!(((data24 === "agent_reviewed") || (data24 === "user_reported")) || (data24 === "pending"))){
const err63 = {instancePath:instancePath+"/provenance/verification",schemaPath:"#/$defs/provenance/properties/verification/enum",keyword:"enum",params:{allowedValues: schema34.properties.verification.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data19.notes !== undefined){
let data25 = data19.notes;
if(Array.isArray(data25)){
const len5 = data25.length;
for(let i5=0; i5<len5; i5++){
let data26 = data25[i5];
if(typeof data26 === "string"){
if(func2(data26) < 1){
const err64 = {instancePath:instancePath+"/provenance/notes/" + i5,schemaPath:"#/$defs/provenance/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
else {
const err65 = {instancePath:instancePath+"/provenance/notes/" + i5,schemaPath:"#/$defs/provenance/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
}
else {
const err66 = {instancePath:instancePath+"/provenance/notes",schemaPath:"#/$defs/provenance/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
}
else {
const err67 = {instancePath:instancePath+"/provenance",schemaPath:"#/$defs/provenance/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
}
else {
const err68 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
validate27.errors = vErrors;
return errors === 0;
}
validate27.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


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
if(data.schema_version === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schema_version"},message:"must have required property '"+"schema_version"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.updated_at === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "updated_at"},message:"must have required property '"+"updated_at"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.source_ids === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "source_ids"},message:"must have required property '"+"source_ids"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.coverage === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "coverage"},message:"must have required property '"+"coverage"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.characters === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "characters"},message:"must have required property '"+"characters"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.weapons === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "weapons"},message:"must have required property '"+"weapons"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.artifacts === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "artifacts"},message:"must have required property '"+"artifacts"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.equipment === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "equipment"},message:"must have required property '"+"equipment"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.panel_snapshots === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "panel_snapshots"},message:"must have required property '"+"panel_snapshots"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.teams === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "teams"},message:"must have required property '"+"teams"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema31.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.schema_version !== undefined){
if(2 !== data.schema_version){
const err11 = {instancePath:instancePath+"/schema_version",schemaPath:"#/properties/schema_version/const",keyword:"const",params:{allowedValue: 2},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.updated_at !== undefined){
let data1 = data.updated_at;
if(typeof data1 === "string"){
if(func2(data1) < 1){
const err12 = {instancePath:instancePath+"/updated_at",schemaPath:"#/properties/updated_at/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
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
const err13 = {instancePath:instancePath+"/updated_at",schemaPath:"#/properties/updated_at/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.source_ids !== undefined){
let data2 = data.source_ids;
if(Array.isArray(data2)){
const len0 = data2.length;
for(let i0=0; i0<len0; i0++){
let data3 = data2[i0];
if(typeof data3 === "string"){
if(!pattern4.test(data3)){
const err14 = {instancePath:instancePath+"/source_ids/" + i0,schemaPath:"#/properties/source_ids/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
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
const err15 = {instancePath:instancePath+"/source_ids/" + i0,schemaPath:"#/properties/source_ids/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
else {
const err16 = {instancePath:instancePath+"/source_ids",schemaPath:"#/properties/source_ids/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.coverage !== undefined){
let data4 = data.coverage;
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(data4.roster === undefined){
const err17 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "roster"},message:"must have required property '"+"roster"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(data4.inventory === undefined){
const err18 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "inventory"},message:"must have required property '"+"inventory"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data4.notes === undefined){
const err19 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
for(const key1 in data4){
if(!(((key1 === "roster") || (key1 === "inventory")) || (key1 === "notes"))){
const err20 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data4.roster !== undefined){
let data5 = data4.roster;
if(!((data5 === "partial") || (data5 === "complete"))){
const err21 = {instancePath:instancePath+"/coverage/roster",schemaPath:"#/properties/coverage/properties/roster/enum",keyword:"enum",params:{allowedValues: schema31.properties.coverage.properties.roster.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data4.inventory !== undefined){
let data6 = data4.inventory;
if(!(((data6 === "equipped_items_only") || (data6 === "partial")) || (data6 === "complete"))){
const err22 = {instancePath:instancePath+"/coverage/inventory",schemaPath:"#/properties/coverage/properties/inventory/enum",keyword:"enum",params:{allowedValues: schema31.properties.coverage.properties.inventory.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data4.notes !== undefined){
let data7 = data4.notes;
if(Array.isArray(data7)){
const len1 = data7.length;
for(let i1=0; i1<len1; i1++){
let data8 = data7[i1];
if(typeof data8 === "string"){
if(func2(data8) < 1){
const err23 = {instancePath:instancePath+"/coverage/notes/" + i1,schemaPath:"#/properties/coverage/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/coverage/notes/" + i1,schemaPath:"#/properties/coverage/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
else {
const err25 = {instancePath:instancePath+"/coverage/notes",schemaPath:"#/properties/coverage/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
else {
const err26 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.characters !== undefined){
let data9 = data.characters;
if(Array.isArray(data9)){
const len2 = data9.length;
for(let i2=0; i2<len2; i2++){
if(!(validate21(data9[i2], {instancePath:instancePath+"/characters/" + i2,parentData:data9,parentDataProperty:i2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
errors = vErrors.length;
}
}
}
else {
const err27 = {instancePath:instancePath+"/characters",schemaPath:"#/properties/characters/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.weapons !== undefined){
let data11 = data.weapons;
if(Array.isArray(data11)){
const len3 = data11.length;
for(let i3=0; i3<len3; i3++){
if(!(validate23(data11[i3], {instancePath:instancePath+"/weapons/" + i3,parentData:data11,parentDataProperty:i3,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate23.errors : vErrors.concat(validate23.errors);
errors = vErrors.length;
}
}
}
else {
const err28 = {instancePath:instancePath+"/weapons",schemaPath:"#/properties/weapons/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.artifacts !== undefined){
let data13 = data.artifacts;
if(Array.isArray(data13)){
const len4 = data13.length;
for(let i4=0; i4<len4; i4++){
if(!(validate25(data13[i4], {instancePath:instancePath+"/artifacts/" + i4,parentData:data13,parentDataProperty:i4,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
errors = vErrors.length;
}
}
}
else {
const err29 = {instancePath:instancePath+"/artifacts",schemaPath:"#/properties/artifacts/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data.equipment !== undefined){
let data15 = data.equipment;
if(data15 && typeof data15 == "object" && !Array.isArray(data15)){
for(const key2 in data15){
const _errs29 = errors;
if(typeof key2 === "string"){
if(!pattern4.test(key2)){
const err30 = {instancePath:instancePath+"/equipment",schemaPath:"#/properties/equipment/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\"",propertyName:key2};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
else {
const err31 = {instancePath:instancePath+"/equipment",schemaPath:"#/properties/equipment/propertyNames/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key2};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
var valid12 = _errs29 === errors;
if(!valid12){
const err32 = {instancePath:instancePath+"/equipment",schemaPath:"#/properties/equipment/propertyNames",keyword:"propertyNames",params:{propertyName: key2},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
for(const key3 in data15){
let data16 = data15[key3];
if(data16 && typeof data16 == "object" && !Array.isArray(data16)){
if(data16.weapon_id === undefined){
const err33 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/equipment/additionalProperties/required",keyword:"required",params:{missingProperty: "weapon_id"},message:"must have required property '"+"weapon_id"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data16.artifacts === undefined){
const err34 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/equipment/additionalProperties/required",keyword:"required",params:{missingProperty: "artifacts"},message:"must have required property '"+"artifacts"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
for(const key4 in data16){
if(!((key4 === "weapon_id") || (key4 === "artifacts"))){
const err35 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/equipment/additionalProperties/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data16.weapon_id !== undefined){
let data17 = data16.weapon_id;
if((typeof data17 !== "string") && (data17 !== null)){
const err36 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/weapon_id",schemaPath:"#/properties/equipment/additionalProperties/properties/weapon_id/type",keyword:"type",params:{type: schema31.properties.equipment.additionalProperties.properties.weapon_id.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
if(data16.artifacts !== undefined){
let data18 = data16.artifacts;
if(data18 && typeof data18 == "object" && !Array.isArray(data18)){
if(data18.flower === undefined){
const err37 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/required",keyword:"required",params:{missingProperty: "flower"},message:"must have required property '"+"flower"+"'"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if(data18.plume === undefined){
const err38 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/required",keyword:"required",params:{missingProperty: "plume"},message:"must have required property '"+"plume"+"'"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
if(data18.sands === undefined){
const err39 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/required",keyword:"required",params:{missingProperty: "sands"},message:"must have required property '"+"sands"+"'"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(data18.goblet === undefined){
const err40 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/required",keyword:"required",params:{missingProperty: "goblet"},message:"must have required property '"+"goblet"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if(data18.circlet === undefined){
const err41 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/required",keyword:"required",params:{missingProperty: "circlet"},message:"must have required property '"+"circlet"+"'"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
for(const key5 in data18){
if(!(((((key5 === "flower") || (key5 === "plume")) || (key5 === "sands")) || (key5 === "goblet")) || (key5 === "circlet"))){
const err42 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
if(data18.flower !== undefined){
let data19 = data18.flower;
if((typeof data19 !== "string") && (data19 !== null)){
const err43 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts/flower",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/properties/flower/type",keyword:"type",params:{type: schema31.properties.equipment.additionalProperties.properties.artifacts.properties.flower.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
if(data18.plume !== undefined){
let data20 = data18.plume;
if((typeof data20 !== "string") && (data20 !== null)){
const err44 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts/plume",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/properties/plume/type",keyword:"type",params:{type: schema31.properties.equipment.additionalProperties.properties.artifacts.properties.plume.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data18.sands !== undefined){
let data21 = data18.sands;
if((typeof data21 !== "string") && (data21 !== null)){
const err45 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts/sands",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/properties/sands/type",keyword:"type",params:{type: schema31.properties.equipment.additionalProperties.properties.artifacts.properties.sands.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data18.goblet !== undefined){
let data22 = data18.goblet;
if((typeof data22 !== "string") && (data22 !== null)){
const err46 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts/goblet",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/properties/goblet/type",keyword:"type",params:{type: schema31.properties.equipment.additionalProperties.properties.artifacts.properties.goblet.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
if(data18.circlet !== undefined){
let data23 = data18.circlet;
if((typeof data23 !== "string") && (data23 !== null)){
const err47 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts/circlet",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/properties/circlet/type",keyword:"type",params:{type: schema31.properties.equipment.additionalProperties.properties.artifacts.properties.circlet.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
}
else {
const err48 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/artifacts",schemaPath:"#/properties/equipment/additionalProperties/properties/artifacts/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
}
else {
const err49 = {instancePath:instancePath+"/equipment/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/equipment/additionalProperties/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
}
else {
const err50 = {instancePath:instancePath+"/equipment",schemaPath:"#/properties/equipment/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
if(data.panel_snapshots !== undefined){
let data24 = data.panel_snapshots;
if(Array.isArray(data24)){
const len5 = data24.length;
for(let i5=0; i5<len5; i5++){
if(!(validate27(data24[i5], {instancePath:instancePath+"/panel_snapshots/" + i5,parentData:data24,parentDataProperty:i5,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
errors = vErrors.length;
}
}
}
else {
const err51 = {instancePath:instancePath+"/panel_snapshots",schemaPath:"#/properties/panel_snapshots/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
if(data.teams !== undefined){
let data26 = data.teams;
if(Array.isArray(data26)){
const len6 = data26.length;
for(let i6=0; i6<len6; i6++){
let data27 = data26[i6];
if(data27 && typeof data27 == "object" && !Array.isArray(data27)){
if(data27.id === undefined){
const err52 = {instancePath:instancePath+"/teams/" + i6,schemaPath:"#/properties/teams/items/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
if(data27.name === undefined){
const err53 = {instancePath:instancePath+"/teams/" + i6,schemaPath:"#/properties/teams/items/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
if(data27.character_ids === undefined){
const err54 = {instancePath:instancePath+"/teams/" + i6,schemaPath:"#/properties/teams/items/required",keyword:"required",params:{missingProperty: "character_ids"},message:"must have required property '"+"character_ids"+"'"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
if(data27.notes === undefined){
const err55 = {instancePath:instancePath+"/teams/" + i6,schemaPath:"#/properties/teams/items/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
for(const key6 in data27){
if(!((((key6 === "id") || (key6 === "name")) || (key6 === "character_ids")) || (key6 === "notes"))){
const err56 = {instancePath:instancePath+"/teams/" + i6,schemaPath:"#/properties/teams/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data27.id !== undefined){
let data28 = data27.id;
if(typeof data28 === "string"){
if(!pattern4.test(data28)){
const err57 = {instancePath:instancePath+"/teams/" + i6+"/id",schemaPath:"#/properties/teams/items/properties/id/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
else {
const err58 = {instancePath:instancePath+"/teams/" + i6+"/id",schemaPath:"#/properties/teams/items/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
if(data27.name !== undefined){
let data29 = data27.name;
if(typeof data29 === "string"){
if(func2(data29) < 1){
const err59 = {instancePath:instancePath+"/teams/" + i6+"/name",schemaPath:"#/properties/teams/items/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
else {
const err60 = {instancePath:instancePath+"/teams/" + i6+"/name",schemaPath:"#/properties/teams/items/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
if(data27.character_ids !== undefined){
let data30 = data27.character_ids;
if(Array.isArray(data30)){
if(data30.length > 4){
const err61 = {instancePath:instancePath+"/teams/" + i6+"/character_ids",schemaPath:"#/properties/teams/items/properties/character_ids/maxItems",keyword:"maxItems",params:{limit: 4},message:"must NOT have more than 4 items"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
const len7 = data30.length;
for(let i7=0; i7<len7; i7++){
let data31 = data30[i7];
if(typeof data31 === "string"){
if(!pattern4.test(data31)){
const err62 = {instancePath:instancePath+"/teams/" + i6+"/character_ids/" + i7,schemaPath:"#/properties/teams/items/properties/character_ids/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]*$"},message:"must match pattern \""+"^[a-z][a-z0-9_]*$"+"\""};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
else {
const err63 = {instancePath:instancePath+"/teams/" + i6+"/character_ids/" + i7,schemaPath:"#/properties/teams/items/properties/character_ids/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
let i8 = data30.length;
let j0;
if(i8 > 1){
const indices0 = {};
for(;i8--;){
let item0 = data30[i8];
if(typeof item0 !== "string"){
continue;
}
if(typeof indices0[item0] == "number"){
j0 = indices0[item0];
const err64 = {instancePath:instancePath+"/teams/" + i6+"/character_ids",schemaPath:"#/properties/teams/items/properties/character_ids/uniqueItems",keyword:"uniqueItems",params:{i: i8, j: j0},message:"must NOT have duplicate items (items ## "+j0+" and "+i8+" are identical)"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
break;
}
indices0[item0] = i8;
}
}
}
else {
const err65 = {instancePath:instancePath+"/teams/" + i6+"/character_ids",schemaPath:"#/properties/teams/items/properties/character_ids/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
if(data27.notes !== undefined){
let data32 = data27.notes;
if(Array.isArray(data32)){
const len8 = data32.length;
for(let i9=0; i9<len8; i9++){
let data33 = data32[i9];
if(typeof data33 === "string"){
if(func2(data33) < 1){
const err66 = {instancePath:instancePath+"/teams/" + i6+"/notes/" + i9,schemaPath:"#/properties/teams/items/properties/notes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
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
const err67 = {instancePath:instancePath+"/teams/" + i6+"/notes/" + i9,schemaPath:"#/properties/teams/items/properties/notes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
}
else {
const err68 = {instancePath:instancePath+"/teams/" + i6+"/notes",schemaPath:"#/properties/teams/items/properties/notes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
}
else {
const err69 = {instancePath:instancePath+"/teams/" + i6,schemaPath:"#/properties/teams/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
}
else {
const err70 = {instancePath:instancePath+"/teams",schemaPath:"#/properties/teams/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
}
else {
const err71 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
