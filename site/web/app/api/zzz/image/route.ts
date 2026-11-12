import {run} from '@/lib/api';
export const dynamic='force-dynamic';
export function GET(request:Request){return run(request,false,async client=>{
 const params=new URL(request.url).searchParams;
 const {bytes,contentType}=await client.zzzImage(params.get('id')||'',params.get('revision')||'');
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':contentType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})
})}
