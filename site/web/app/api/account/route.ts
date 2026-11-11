import { run,json,body } from '@/lib/api';
import { publicAccount } from '@/lib/github.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){return run(request,false,async client=>json(publicAccount(await client.read())))}
export function POST(request:Request){return run(request,true,async client=>json(publicAccount(await client.save(await body(request)))))}
