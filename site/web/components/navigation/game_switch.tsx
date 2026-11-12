'use client';

import {useEffect,useRef} from 'react';

export type GameId='genshin'|'zzz';
const gameLabels:Record<GameId,string>={genshin:'原神',zzz:'絕區零'};

export default function GameSwitch({game,onSelect,focusOnMount=false,onFocusRestored}:{game:GameId,onSelect:(game:GameId)=>void,focusOnMount?:boolean,onFocusRestored?:()=>void}){
 const buttonRef=useRef<HTMLButtonElement>(null);
 const nextGame:GameId=game==='genshin'?'zzz':'genshin';
 useEffect(()=>{
  if(!focusOnMount)return;
  buttonRef.current?.focus({preventScroll:true});
  onFocusRestored?.();
 },[focusOnMount,onFocusRestored]);
 return <button type="button" ref={buttonRef} className="game-switch-button" aria-label={'目前為'+gameLabels[game]+'，切換至'+gameLabels[nextGame]} onClick={()=>onSelect(nextGame)}>{game==='genshin'?'G':'Z'}</button>;
}
