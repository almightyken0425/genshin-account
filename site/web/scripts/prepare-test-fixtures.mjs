import {writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=process.argv[2];
if(!root||!path.isAbsolute(root))throw new Error('Provide an absolute local genshin-account checkout path');
mkdirSync('tests/fixtures',{recursive:true});
// Fixed v1 regression baseline, independent of later account imports or edits.
const baseline='388de3dc4c6384709ccb8d74971f8ed55d270600';
for(const [from,to]of [['data/account.json','account.json'],['evidence/video_001/manifest.json','manifest.json'],['docs/account_summary.md','account_summary.md']])writeFileSync(path.join('tests/fixtures',to),execFileSync('git',['-C',root,'show',baseline+':'+from]));
console.log('Prepared ignored local contract fixtures. These files are not published.');
