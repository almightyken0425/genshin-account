import {readFileSync} from 'node:fs';

function fixture(name){
 try{return readFileSync(new URL('../fixtures/'+name,import.meta.url),'utf8')}
 catch(error){if(error.code==='ENOENT')throw new Error('Current formal-data fixtures are missing. Run node scripts/prepare-test-fixtures.mjs <absolute HOYO checkout> before tests.');throw error}
}
export function loadCurrentGenshin(){
 const raw=fixture('current_genshin_account.json');
 return {raw,account:JSON.parse(raw),metadata:JSON.parse(fixture('current_genshin_metadata.json')),manifests:JSON.parse(fixture('current_genshin_manifests.json'))};
}
export function loadCurrentZzz(){
 const raw=fixture('current_zzz_account.json');
 return {raw,account:JSON.parse(raw),metadata:JSON.parse(fixture('current_zzz_metadata.json'))};
}
