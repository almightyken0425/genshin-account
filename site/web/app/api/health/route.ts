import { env } from 'cloudflare:workers';
import { githubClient } from '@/lib/github.mjs';
import {json} from '@/lib/api';
export const dynamic='force-dynamic';
// Read-only operational check, gated by Sites owner-private dispatch.
// Service access authenticates at dispatch and intentionally has no visitor ID.
export async function GET(){
 try{const r=await githubClient((env as unknown as Record<string,string>).GITHUB_TOKEN).read();
 return json({status:'connected',revision:r.revision,characters:r.account.characters.length,weapons:r.account.weapons.length,artifacts:r.account.artifacts.length,panels:r.panels});
 }catch(e){const error=e as {code?:string,message:string,status?:number};return json({status:'unavailable',error:error.code||'read_failed',message:error.status?error.message:'讀取失敗'},error.status||500)}
}
