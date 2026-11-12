'use client';
import {useEffect,useState} from 'react';
import Dashboard from './dashboard';
import ZzzDashboard from './zzz_dashboard';
import GameSwitch,{type GameId} from '@/components/navigation/game_switch';
export default function Hoyo({initialGame='genshin',initialCharacter=''}:{initialGame?:string,initialCharacter?:string}){
 const [game,setGame]=useState<GameId>(initialGame==='zzz'?'zzz':'genshin');
 const [character,setCharacter]=useState(initialCharacter);
 const [switchFocusRequest,setSwitchFocusRequest]=useState<GameId|null>(null);
 useEffect(()=>{const sync=()=>{const params=new URL(location.href).searchParams;setGame(params.get('game')==='zzz'?'zzz':'genshin');setCharacter(params.get('character')||'');setSwitchFocusRequest(null)};window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
 function select(next:GameId){if(game===next)return;const url=new URL(location.href);url.search='';if(next==='zzz')url.searchParams.set('game','zzz');history.pushState({},'',url);setSwitchFocusRequest(next);setGame(next);setCharacter('');window.scrollTo({top:0})}
 const gameControl=<GameSwitch game={game} onSelect={select} focusOnMount={switchFocusRequest===game} onFocusRestored={()=>setSwitchFocusRequest(null)}/>;
 return game==='zzz'?<ZzzDashboard gameControl={gameControl}/>:<Dashboard key={game} initialCharacter={character} gameControl={gameControl}/>;
}
