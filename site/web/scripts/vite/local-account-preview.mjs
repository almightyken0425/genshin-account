import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {panelStates,validateAccount} from '../../lib/account.mjs';
import {validateZzz} from '../../lib/zzz-schema.mjs';

// Explicit local-only source. Never enabled by a failed GitHub request or in a build.
export function localAccountPreview(){
 const repository=process.env.GENSHIN_PREVIEW_REPO;
 return {
  name:'genshin-local-account-preview',
  apply:'serve',
  enforce:'pre',
  configureServer(server){
   if(!repository)return;
   server.middlewares.use(async(req,res,next)=>{
    const path=new URL(req.url||'/','http://localhost').pathname;
    if(!['/api/account','/api/account/check','/api/zzz'].includes(path))return next();
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('Cache-Control','no-store');
    if(req.method!=='GET'||path==='/api/account/check'){
     res.statusCode=405;res.end(JSON.stringify({error:'preview_read_only',message:'本機預覽不寫入正式資料，請下載草稿。'}));return;
    }
    try{
     const isZzz=path==='/api/zzz';
     const account=JSON.parse(await readFile(resolve(repository,isZzz?'data/zzz/account.json':'data/account.json'),'utf8'));
     if((isZzz?validateZzz:validateAccount)(account).length)throw Error('Invalid local account');
     const revision=execFileSync('git',['-C',repository,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
     res.end(JSON.stringify({account,revision,repository:'local-preview',preview:true,...(isZzz?{}:{panels:panelStates(account),evidence:[]})}));
    }catch{
     res.statusCode=503;res.end(JSON.stringify({error:'preview_unavailable',message:'無法讀取指定的本機資料。'}));
    }
   });
  }
 };
}
