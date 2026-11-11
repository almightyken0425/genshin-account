import { env } from 'cloudflare:workers';
import { assertRequest, githubClient, AppError } from './github.mjs';
const noCache={'Cache-Control':'private, no-store','Vary':'Cookie, oai-authenticated-user-id','X-Content-Type-Options':'nosniff'};
export function json(value:unknown,status=200){return Response.json(value,{status,headers:noCache})}
export async function run(request:Request,write:boolean,fn:(client:ReturnType<typeof githubClient>)=>Promise<Response>){
 try{assertRequest(request,write);return await fn(githubClient((env as unknown as Record<string,string>).GITHUB_TOKEN))}
 catch(e){const error=e as AppError;return json({error:error.code||'request_failed',message:error.status?error.message:'無法完成請求，請稍後重新讀取。'},error.status||500)}
}
export async function body(request:Request){
 const raw=await request.text();
 if(raw.length>500000)throw new AppError('修改內容過大',413,'invalid_input');
 try{return JSON.parse(raw)}catch{throw new AppError('無效 JSON',400,'invalid_input')}
}
