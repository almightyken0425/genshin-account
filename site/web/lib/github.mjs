import { applyCandidate, validateAccount, validateEvidence, hash, canonical, panelStates } from './account.mjs';
import { renderSummary } from './report.mjs';
export const REPO='almightyken0425/genshin-account';
const ROOT='https://api.github.com';
export class AppError extends Error { constructor(message,status=502,code='github_error'){super(message);this.status=status;this.code=code;} }
export function assertRequest(request,write=false){
 if(!request.headers.get('oai-authenticated-user-id'))throw new AppError('請先使用 ChatGPT 登入',401,'signin_required');
 if(write&&request.headers.get('origin')!==new URL(request.url).origin)throw new AppError('請從本站提交修改',403,'invalid_origin');
 if(write&&!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('需要 JSON 格式',415,'invalid_content_type');
}
export function githubClient(token,fetcher=fetch){
 if(!token)throw new AppError('尚未設定 GitHub 專用連線。請先完成安全設定。',503,'connection_missing');
 async function api(path,options={}){
  let response;
  try{response=await fetcher(ROOT+path,{...options,signal:AbortSignal.timeout(20000),headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Genshin-Sites','Authorization':'Bearer '+token,...options.headers},cache:'no-store'})}
  catch{throw new AppError('GitHub 回應逾時，請先重新讀取確認狀態',504,'upstream_timeout')}
  if(!response.ok)throw new AppError(response.status===401?'GitHub 連線憑證無效或已到期':response.status===403?'GitHub 權限不足或暫時限制請求':response.status===404?'無法讀取私人 repo，請確認專用 token 的範圍':'GitHub 暫時無法完成請求',response.status===409?409:502,response.status===409?'conflict':'github_error');
  return response.json();
 }
 async function file(path,ref){
  const data=await api('/repos/'+REPO+'/contents/'+path+'?ref='+encodeURIComponent(ref));
  if(data.type!=='file'||data.encoding!=='base64'||data.size>2500000||typeof data.content!=='string')throw new AppError('檔案格式或大小不受支援');
  return Buffer.from(data.content.replaceAll('\n',''),'base64');
 }
 async function read(){
  const head=await api('/repos/'+REPO+'/commits/main');
  if(!/^[a-f0-9]{40}$/.test(head.sha))throw new AppError('GitHub 版本格式錯誤');
  const account=JSON.parse((await file('data/account.json',head.sha)).toString('utf8'));
  const errors=validateAccount(account);if(errors.length)throw new AppError('正式資料未通過驗證：'+errors.slice(0,3).join('、'),422,'invalid_data');
  if(account.source_ids.length>20)throw new AppError('來源數超過目前支援範圍');
  const manifests=await Promise.all(account.source_ids.map(id=>file('evidence/'+id+'/manifest.json',head.sha).then(b=>JSON.parse(b.toString('utf8')))));
  const refs=validateEvidence(account,manifests);if(refs.length)throw new AppError(refs.join('、'),422,'invalid_data');
  return {account,manifests,revision:head.sha,commitMessage:head.commit.message,panels:panelStates(account),repository:REPO};
 }
 async function receipt(current,requestId,digest){
  const marker='Sites-Request-ID: '+requestId;
  if(current.commitMessage.includes(marker)){
   if(!current.commitMessage.includes('Sites-Payload-SHA256: '+digest))throw new AppError('此請求編號已使用',422,'request_reused');
   return current.revision;
  }
  const history=await api('/repos/'+REPO+'/commits?sha=main&path=data%2Faccount.json&per_page=30');
  const found=history.find(c=>c.commit.message.includes(marker));
  if(found){if(!found.commit.message.includes('Sites-Payload-SHA256: '+digest))throw new AppError('此請求編號已使用',422,'request_reused');return found.sha}
  return null;
 }
 async function save(input){
  if(!input||!/^[a-f0-9]{40}$/.test(input.expectedRevision)||!/^[a-f0-9-]{36}$/.test(input.requestId))throw new AppError('保存請求格式不正確',422,'invalid_input');
  const digest=hash(canonical({candidate:input.candidate,note:input.note})),current=await read();
  if(current.revision!==input.expectedRevision){
   const saved=await receipt(current,input.requestId,digest);
   if(saved)return {...current,savedRevision:saved,alreadyApplied:true};
   throw new AppError('GitHub 已有新版本。草稿已保留，請比較後再保存。',409,'conflict');
  }
  const {account,changed}=applyCandidate(current.account,input.candidate,input.note);
  if(!changed)return {...current,unchanged:true,savedRevision:current.revision};
  const text=JSON.stringify(account,null,2)+'\n', summary=renderSummary(account,text,current.manifests);
  const message={headline:'Update character records from Sites',body:'Sites-Request-ID: '+input.requestId+'\nSites-Payload-SHA256: '+digest+'\n\n'+input.note.trim()};
  const query='mutation($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input:$input) { commit { oid } } }';
  let result;
  try{
   result=await api('/graphql',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables:{input:{branch:{repositoryNameWithOwner:REPO,branchName:'main'},expectedHeadOid:input.expectedRevision,message,fileChanges:{additions:[{path:'data/account.json',contents:Buffer.from(text).toString('base64')},{path:'docs/account_summary.md',contents:Buffer.from(summary).toString('base64')}]},clientMutationId:input.requestId}}})});
  }catch(error){throw new AppError('保存結果尚未確認。請按「確認保存結果」，不要直接重送。',error.status||502,'write_uncertain')}
  if(result.errors?.length){
   const conflict=result.errors.some(e=>/head|expected|stale/i.test(e.message));
   throw new AppError(conflict?'GitHub 版本已變更，草稿已保留':'GitHub 拒絕保存，請確認 Contents 寫入權限與分支規則',conflict?409:502,conflict?'conflict':'write_rejected');
  }
  const savedRevision=result.data?.createCommitOnBranch?.commit?.oid;
  if(!savedRevision)throw new AppError('保存結果尚未確認，請先讀回',502,'write_uncertain');
  try{
   const readback=JSON.parse((await file('data/account.json',savedRevision)).toString('utf8'));
   if(canonical(readback)!==canonical(account))throw new Error('mismatch');
  }catch{throw new AppError('GitHub 已接受保存，但讀回尚未確認。請確認保存結果。',502,'write_uncertain')}
  return {account,revision:savedRevision,savedRevision,panels:panelStates(account),repository:REPO,manifests:current.manifests};
 }
 async function check(input){
  if(!/^[a-f0-9-]{36}$/.test(input?.requestId||''))throw new AppError('請求編號錯誤',422);
  const digest=hash(canonical({candidate:input.candidate,note:input.note})),current=await read();
  const savedRevision=await receipt(current,input.requestId,digest);
  return {confirmed:!!savedRevision,savedRevision,current};
 }
 async function evidence(id,revision){
  if(!/^[a-z][a-z0-9_]*$/.test(id)||!/^[a-f0-9]{40}$/.test(revision))throw new AppError('來源格式錯誤',400);
  const current=await read();
  const shot=current.manifests.flatMap(m=>m.screenshots).find(s=>s.id===id);
  if(!shot||!/^evidence\/[a-z0-9_]+\/screenshots\/[a-zA-Z0-9_.-]+\.(png|jpe?g)$/.test(shot.path))throw new AppError('找不到這張截圖',404);
  // Evidence is resolved only from the canonical manifest, never from a browser path.
  const bytes=await file(shot.path,current.revision);
  if(hash(bytes)!==shot.sha256)throw new AppError('截圖完整性檢查失敗',422);
  return {bytes,contentType:shot.path.endsWith('.png')?'image/png':'image/jpeg'};
 }
 return {read,save,check,evidence};
}
export function publicAccount(result){
 const {commitMessage,manifests,...rest}=result;
 return {...rest,evidence:(manifests||[]).flatMap(m=>m.screenshots).map(({id,time_seconds,character_id,kind})=>({id,time_seconds,character_id,kind}))};
}
