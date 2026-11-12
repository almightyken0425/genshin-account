'use client';
import {useEffect,useState} from 'react';
import Dashboard from './dashboard';
import ZzzDashboard from './zzz_dashboard';
export default function Hoyo({initialGame='genshin',initialCharacter=''}:{initialGame?:string,initialCharacter?:string}){
 const [game,setGame]=useState(initialGame==='zzz'?'zzz':'genshin');
 const [character,setCharacter]=useState(initialCharacter);
 useEffect(()=>{const sync=()=>{const params=new URL(location.href).searchParams;setGame(params.get('game')==='zzz'?'zzz':'genshin');setCharacter(params.get('character')||'')};window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
 function select(next:string){if(game===next)return;const url=new URL(location.href);url.search='';if(next==='zzz')url.searchParams.set('game','zzz');history.pushState({},'',url);setGame(next);setCharacter('');window.scrollTo({top:0})}
 return <><nav className="game-switch" aria-label="遊戲"><span className="hoyo-wordmark">HOYO</span><div>{[['genshin','原神'],['zzz','絕區零']].map(([id,label])=><button key={id} aria-pressed={game===id} onClick={()=>select(id)}>{label}</button>)}</div></nav>{game==='zzz'?<ZzzDashboard/>:<Dashboard key={game} initialCharacter={character}/>}</>;
}
