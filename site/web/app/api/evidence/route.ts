import {run} from '@/lib/api';
export const dynamic='force-dynamic';
export function GET(request:Request){return run(request,false,async client=>{
 const u=new URL(request.url), {bytes,contentType}=await client.evidence(u.searchParams.get('id')||'',u.searchParams.get('revision')||'');
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':contentType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
})}
