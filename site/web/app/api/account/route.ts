import { run,json } from '@/lib/api';
import { publicAccount } from '@/lib/github.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){return run(request,false,async client=>json(publicAccount(await client.read())))}
export function POST(){return json({error:'readonly',message:'請使用本機 HoYoLAB 同步工具更新正式資料。'},403)}
