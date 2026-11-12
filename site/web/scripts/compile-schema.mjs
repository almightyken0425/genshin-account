import { readFileSync, writeFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import standalone from 'ajv/dist/standalone/index.js';
for(const [schemaFile,moduleFile] of [['account.schema.json','account-schema.mjs'],['account.v1.schema.json','account-schema-v1.mjs'],['zzz.account.schema.json','zzz-schema-generated.mjs']]){
const ajv = new Ajv2020({ allErrors: true, strict: false, code: { source: true, esm: true, lines: true } });
const validate = ajv.compile(JSON.parse(readFileSync(new URL('../schemas/'+schemaFile, import.meta.url), 'utf8')));
const imports=[];
const code=standalone(ajv,validate).replace(/require\("([^"]+)"\)(?:\.default)?/g,(_,id)=>{const name='runtime'+imports.length;imports.push('import '+name+'Module from '+JSON.stringify(id+'.js')+';const '+name+'='+name+'Module.default??'+name+'Module;');return name});
writeFileSync(new URL('../lib/'+moduleFile, import.meta.url),imports.join('\n')+'\n'+code);

}
