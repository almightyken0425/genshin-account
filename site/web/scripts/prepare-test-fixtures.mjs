import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=process.argv[2];
if(!root||!path.isAbsolute(root))throw new Error('Provide an absolute local genshin-account checkout path');
const directory=fileURLToPath(new URL('../tests/fixtures/',import.meta.url));
mkdirSync(directory,{recursive:true});
// Fixed v1 regression baseline, independent of later account imports or edits.
const baseline='388de3dc4c6384709ccb8d74971f8ed55d270600';
for(const [from,to]of [['data/account.json','account.json'],['evidence/video_001/manifest.json','manifest.json'],['docs/account_summary.md','account_summary.md']])writeFileSync(path.join(directory,to),execFileSync('git',['-C',root,'show',baseline+':'+from]));

// The accepted growth observations remain a fixed regression baseline after later imports.
const focusBaseline='2afcdece74b98a3bcb9ff6cc7e252dcd7f994d6c';
const focusAccount=JSON.parse(execFileSync('git',['-C',root,'show',focusBaseline+':data/zzz/account.json'],{encoding:'utf8'}));
const focusIds=new Set(['ju_fufu','yanagi','miyabi','pyrois']);
writeFileSync(path.join(directory,'zzz_growth_focus.json'),JSON.stringify(focusAccount.characters.filter(character=>focusIds.has(character.id)),null,2)+'\n');

// Explicit test inputs only. Never imported by app/lib or included in publication.
// A standalone Site checkout receives these ignored files before running tests.
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const preparedFromCommit=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
for(const [game,sourcePath]of [['genshin','data/account.json'],['zzz','data/zzz/account.json']]){
 const raw=readFileSync(path.join(root,sourcePath)),account=JSON.parse(raw);
 const metadata={sourcePath,accountSha256:digest(raw),preparedFromCommit};
 writeFileSync(path.join(directory,'current_'+game+'_account.json'),raw);
 if(game==='genshin'){
  const manifests=account.source_ids.map(id=>JSON.parse(readFileSync(path.join(root,'evidence',id,'manifest.json'),'utf8')));
  writeFileSync(path.join(directory,'current_genshin_manifests.json'),JSON.stringify(manifests,null,2)+'\n');
  metadata.sourceReviewIds=account.source_ids.filter(id=>id.endsWith('_review_20261113'));
 }
 writeFileSync(path.join(directory,'current_'+game+'_metadata.json'),JSON.stringify(metadata,null,2)+'\n');
}
console.log('Prepared ignored baseline and current formal-data test fixtures. These files are not published.');
