import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 return <Dashboard initialCharacter={typeof params.character==='string'?params.character:''}/>;
}
