import {run,json} from '@/lib/api';
export const dynamic='force-dynamic';
export function GET(request:Request){return run(request,false,async client=>json(await client.readZzz()))}
