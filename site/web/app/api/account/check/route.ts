import { run,json,body } from '@/lib/api';
import { publicAccount } from '@/lib/github.mjs';
export const dynamic='force-dynamic';
export function POST(request:Request){return run(request,true,async client=>{const r=await client.check(await body(request));return json({...r,current:publicAccount(r.current)})})}
