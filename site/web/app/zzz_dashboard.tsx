'use client';

import {useEffect,useState} from 'react';
import {Search,RefreshCw,LoaderCircle,BookOpen} from 'lucide-react';
import {zzzRosterImage} from '@/lib/zzz_assets';
import ZzzCharacterDetail from './zzz_character_detail';
import CharacterCard from '@/components/character/character_card';
import NavigationDock from '@/components/navigation/navigation_dock';
import type {ZzzAgent as Agent} from '@/lib/zzz_types';
import {effectiveDiscLoadout} from '@/lib/zzz_discs.mjs';

type ZzzResult={account:{characters:Agent[],source?:{filename:string}},revision:string};

export default function ZzzDashboard({gameControl}:{gameControl?:React.ReactNode}){
 const [data,setData]=useState<ZzzResult|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState('');
 async function load(){
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/zzz',{cache:'no-store'}),body=await response.json() as ZzzResult&{message?:string};
   if(!response.ok)throw new Error(body.message||'無法讀取絕區零資料');
   setData(body);
  }catch(error){setError(error instanceof Error?error.message:'無法讀取絕區零資料')}
  finally{setBusy(false)}
 }
 useEffect(()=>{
  load();
  const sync=()=>setSelected(new URL(location.href).searchParams.get('agent')||'');
  sync();window.addEventListener('popstate',sync);
  return()=>window.removeEventListener('popstate',sync);
 },[]);
 function open(id:string){
  const url=new URL(location.href);
  if(id)url.searchParams.set('agent',id);else url.searchParams.delete('agent');
  history.pushState({},'',url);setSelected(id);window.scrollTo({top:0});
 }
 const character=data?.account.characters.find(character=>character.id===selected);
 return <main className="main hoyo-main zzz-main">
  {error&&<div className="message error" role="alert"><p>{error}</p><button className="icon-button" aria-label="重新讀取" onClick={load}><RefreshCw size={18}/></button></div>}
  {busy&&!data?<div className="empty"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:character?<ZzzCharacterDetail key={character.id} character={character} onBack={()=>open('')} sourceName={data?.account.source?.filename}/>:<section className="roster" aria-label="絕區零角色列表">
   <div className="roster-search"><label className="search"><Search size={17}/><input placeholder="搜尋角色名稱" aria-label="搜尋角色名稱" value={query} onChange={event=>setQuery(event.target.value)}/></label></div>
   <div className="character-list">
    {data?.account.characters.filter(character=>character.name.includes(query)).map((character,index)=>{
     const art=zzzRosterImage(character.id),effective=effectiveDiscLoadout(character.driveDiscs);
     return <CharacterCard key={character.id} name={character.name} onClick={()=>open(character.id)} image={{src:art?.src,style:art?.style,alt:character.name,eager:index<4}} metrics={[{label:'角色等級',value:character.level},{label:'影畫',value:character.mindscape},{label:'有效詞條總數',value:effective}]}/>;
    })}
   </div>
  </section>}
  <footer className="page-footer"><span>遊戲圖片 © HoYoverse</span><span>圖源 <a href="https://wiki.hoyolab.com/pc/zzz/home" target="_blank" rel="noreferrer">HoYoWiki</a></span></footer>
  <NavigationDock>{gameControl}<button className={!character?'active':''} aria-current={!character?'page':undefined} aria-label="角色列表" title="角色列表" onClick={()=>{if(selected)open('')}}><BookOpen size={21} aria-hidden="true"/></button></NavigationDock>
 </main>;
}
