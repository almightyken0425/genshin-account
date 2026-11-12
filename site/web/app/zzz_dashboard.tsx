'use client';
import {useEffect,useState} from 'react';
import {Search,RefreshCw,LoaderCircle,UserRound} from 'lucide-react';
import ZzzCharacterDetail from './zzz_character_detail';
import type {ZzzAgent as Agent} from '@/lib/zzz_types';
import {effectiveDiscLoadout} from '@/lib/zzz_discs.mjs';
type ZzzResult={account:{characters:Agent[],source?:{filename:string}},revision:string};
const valueText=(value:number|null|undefined)=>value==null?'—':String(value);
function Portrait({character,revision}:{character:Agent,revision:string}){const [failed,setFailed]=useState(false);return character.portraitPath&&!failed?<img src={'/api/zzz/image?id='+encodeURIComponent(character.id)+'&revision='+revision} loading="lazy" decoding="async" alt={character.name} onError={()=>setFailed(true)}/>:<span className="zzz-portrait-fallback"><UserRound size={42}/><span>{character.name}</span></span>}
export default function ZzzDashboard(){
 const [data,setData]=useState<ZzzResult|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState('');
 async function load(){setBusy(true);setError('');try{const r=await fetch('/api/zzz',{cache:'no-store'}),body=await r.json() as ZzzResult&{message?:string};if(!r.ok)throw new Error(body.message||'無法讀取絕區零資料');setData(body)}catch(e){setError(e instanceof Error?e.message:'無法讀取絕區零資料')}finally{setBusy(false)}}
 useEffect(()=>{load();const sync=()=>setSelected(new URL(location.href).searchParams.get('agent')||'');sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
 function open(id:string){const url=new URL(location.href);if(id)url.searchParams.set('agent',id);else url.searchParams.delete('agent');history.pushState({},'',url);setSelected(id);window.scrollTo({top:0})}
 const character=data?.account.characters.find(c=>c.id===selected);
 return <main className="main zzz-main">{error&&<div className="message error" role="alert"><p>{error}</p><button className="icon-button" aria-label="重新讀取" onClick={load}><RefreshCw size={18}/></button></div>}{busy&&!data?<div className="empty"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:character?<ZzzCharacterDetail key={character.id} character={character} portrait={<Portrait character={character} revision={data!.revision}/>} onBack={()=>open('')} sourceName={data?.account.source?.filename}/>:<section className="roster" aria-label="絕區零角色列表"><div className="roster-search"><label className="search"><Search size={17}/><input placeholder="搜尋角色名稱" aria-label="搜尋角色名稱" value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="character-list">{data?.account.characters.filter(c=>c.name.includes(query)).map(c=><button className="character-card" key={c.id} aria-label={'查看'+c.name} onClick={()=>open(c.id)}><div className="character-emblem"><Portrait character={c} revision={data!.revision}/></div><span className="character-card-stats zzz-card-stats"><span title="等級">{valueText(c.level)}</span><span title="影畫">{valueText(c.mindscape)}</span><span title="有效詞條總數">{valueText(effectiveDiscLoadout(c.driveDiscs))}</span></span></button>)}</div></section>}<footer className="page-footer"><span>遊戲圖片 © HoYoverse</span></footer></main>
}
