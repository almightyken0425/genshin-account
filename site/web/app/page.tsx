import Hoyo from './hoyo';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 return <Hoyo initialGame={typeof params.game==='string'?params.game:'genshin'} initialCharacter={typeof params.character==='string'?params.character:''}/>;
}
