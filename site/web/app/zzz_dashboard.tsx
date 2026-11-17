'use client';

import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {RefreshCw,LoaderCircle} from 'lucide-react';
import {zzzRosterImage} from '@/lib/zzz_assets';
import ZzzCharacterDetail from './zzz_character_detail';
import {ZzzGrowthPage} from './zzz_guidance';
import CharacterCard from '@/components/character/character_card';
import {formatEffectivePercent} from '@/components/metrics/effective_roll_metric';
import GameNavigation,{type GameSection} from '@/components/navigation/game_navigation';
import {normalizeZzzRouteUrl,readZzzRoute,zzzSection,type ZzzRoute as Route} from '@/lib/zzz_routes.mjs';
import ZzzRosterControls from '@/components/roster/zzz_roster_controls';
import RosterHeader from '@/components/roster/roster_header';
import {revealAndFocus} from '@/components/pages/restore_focus';
import {selectZzzRoster,parseZzzRosterState,serializeZzzRosterState,emptyZzzFilters,type ZzzRosterState} from '@/lib/zzz_roster_view.mjs';
import catalogData from '@/lib/zzz_agent_catalog.json';
import type {ZzzAgent as Agent} from '@/lib/zzz_types';
import {effectiveDiscLoadout,maximumDiscLoadout,discEffectiveKeys} from '@/lib/zzz_discs.mjs';
import trainingPlans from '@/lib/zzz_training_plans.json';

type ZzzResult={account:{characters:Agent[],source?:{filename:string}},revision:string,review?:{id:string,label:string,basedOnCommit:string,accountSha256:string}};
type ReturnPosition={scroll:number,label:string,index:number,key?:string};
const readRoute=():Route=>{
 const current=new URL(location.href),normalized=normalizeZzzRouteUrl(current);
 if(normalized.href!==current.href)history.replaceState(history.state,'',normalized);
 return readZzzRoute(normalized);
};
async function readAccount():Promise<ZzzResult>{
 const response=await fetch('/api/zzz',{cache:'no-store'}),body=await response.json() as ZzzResult&{message?:string};
 if(!response.ok)throw new Error(body.message||'無法讀取絕區零資料');
 return body;
}

export default function ZzzDashboard({gameControl}:{gameControl?:ReactNode}){
 const [data,setData]=useState<ZzzResult|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState('');
 const [rosterState,setRosterState]=useState<ZzzRosterState>(()=>parseZzzRosterState(null));
 const [route,setRoute]=useState<Route>({section:'roster',agent:''});
 const routeRef=useRef(route),mainRef=useRef<HTMLElement>(null),searchRef=useRef<HTMLInputElement>(null),clickedControl=useRef<HTMLButtonElement|null>(null),returnPosition=useRef<ReturnPosition>({scroll:0,label:'',index:0}),restore=useRef(false);
 useLayoutEffect(()=>{routeRef.current=route},[route]);
 async function load(){
  setBusy(true);setError('');
  try{
   setData(await readAccount());
  }catch(error){setError(error instanceof Error?error.message:'無法讀取絕區零資料')}
  finally{setBusy(false)}
 }
 useEffect(()=>{
  let active=true;
  readAccount().then(value=>{if(active)setData(value)}).catch(error=>{if(active)setError(error instanceof Error?error.message:'無法讀取絕區零資料')}).finally(()=>{if(active)setBusy(false)});
  const initialRoute=requestAnimationFrame(()=>{setRoute(readRoute());setRosterState(parseZzzRosterState(new URL(location.href).searchParams.get('roster')))});
  const previousMode=history.scrollRestoration;history.scrollRestoration='manual';
  const sync=()=>{const next=readRoute();setRosterState(parseZzzRosterState(new URL(location.href).searchParams.get('roster')));if(routeRef.current.agent&&!next.agent)restore.current=true;else window.scrollTo({top:0});setRoute(next)};
  window.addEventListener('popstate',sync);
  return()=>{active=false;cancelAnimationFrame(initialRoute);window.removeEventListener('popstate',sync);history.scrollRestoration=previousMode};
 },[]);
 useEffect(()=>{
  if(route.agent||busy||!restore.current)return;
  const request=requestAnimationFrame(()=>{
   const position=returnPosition.current;
   const allButtons=Array.from(mainRef.current?.querySelectorAll<HTMLButtonElement>('button')||[]);
   const buttons=allButtons.filter(button=>button.getAttribute('aria-label')===position.label);
   const button=(position.key?allButtons.find(button=>button.dataset.focusKey===position.key):undefined)??buttons[position.index]??buttons[0];
   if(!revealAndFocus(button)&&route.section==='roster')searchRef.current?.focus({preventScroll:true});
   window.scrollTo({top:position.scroll});restore.current=false;
  });
  return()=>cancelAnimationFrame(request);
 },[route,busy]);
 function navigate(next:Route,replace=false,scroll=true){
  const url=new URL(location.href);url.search='';url.searchParams.set('game','zzz');
  const savedRoster=serializeZzzRosterState(rosterState);if(savedRoster)url.searchParams.set('roster',savedRoster);
  if(next.section!=='roster')url.searchParams.set('tab',next.section);
  if(next.agent)url.searchParams.set('agent',next.agent);
  history[replace?'replaceState':'pushState']({hoyoZzzFromView:!!next.agent},'',url);
  setRoute(next);if(scroll)window.scrollTo({top:0});
 }
 function rememberPosition():ReturnPosition{
  const active=clickedControl.current?.isConnected?clickedControl.current:document.activeElement,label=active?.getAttribute('aria-label')||'';
  const matches=Array.from(mainRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-label]')||[]).filter(button=>button.getAttribute('aria-label')===label);
  return {scroll:window.scrollY,label,index:Math.max(0,matches.findIndex(button=>button===active)),key:active instanceof HTMLElement?active.dataset.focusKey:undefined};
 }
 function openCharacter(id:string){
  returnPosition.current=rememberPosition();
  if(!returnPosition.current.key)returnPosition.current.key=(route.section==='roster'?'roster:':'growth:')+id;
  navigate({...route,agent:id});
 }
 function returnToView(){
  if(history.state?.hoyoZzzFromView){history.back();return}
  restore.current=true;navigate({...route,agent:''},true,false);
 }
 function switchTab(section:GameSection){
  const next=zzzSection(section);
  if(next===route.section&&!route.agent){window.scrollTo({top:0});return}
  navigate({section:next,agent:''});
 }
 function updateRoster(next:ZzzRosterState){
  setRosterState(next);
  const url=new URL(location.href),serialized=serializeZzzRosterState(next);
  if(serialized)url.searchParams.set('roster',serialized);else url.searchParams.delete('roster');
  history.replaceState(history.state,'',url);
 }
 const characters=data?.account.characters??[],character=characters.find(character=>character.id===route.agent);
 const effectiveTotals=Object.fromEntries(characters.map(character=>[character.id,effectiveDiscLoadout(character.driveDiscs)]));
 const maximumTotals=Object.fromEntries(characters.map(character=>[character.id,maximumDiscLoadout(character.driveDiscs,discEffectiveKeys(character.driveDiscs))]));
 const visibleCharacters=selectZzzRoster(characters,{...rosterState,catalog:catalogData.characters,effectiveTotals,maximumTotals});
 const backLabel=route.section==='growth'?'返回培養重點':'返回角色列表';
 return <main ref={mainRef} className="main hoyo-main zzz-main" onClickCapture={event=>{clickedControl.current=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button'):null}}>
  {error&&<div className="message error" role="alert"><p>{error}</p><button className="icon-button" aria-label="重新讀取" onClick={load}><RefreshCw size={18}/></button></div>}
  {busy&&!data?<div className="empty"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:route.agent?character?<ZzzCharacterDetail key={character.id} character={character} onBack={returnToView} backLabel={backLabel} sourceName={data?.account.source?.filename}/>:<div className="empty"><h2>找不到已記錄的角色</h2><button className="text-button" onClick={returnToView}>返回上一頁</button></div>
   :route.section==='growth'?<ZzzGrowthPage characters={characters} onOpenCharacter={openCharacter}/>
   :<section className="roster" aria-label="絕區零角色列表">
    <RosterHeader controls={<ZzzRosterControls characters={characters} catalog={catalogData.characters} filters={rosterState.filters} onFilters={filters=>updateRoster({...rosterState,filters})} sorts={rosterState.sorts} onSorts={sorts=>updateRoster({...rosterState,sorts})}/>} query={rosterState.query} onQueryChange={query=>updateRoster({...rosterState,query})} searchRef={searchRef}/>
    <div className="character-list">{visibleCharacters.map((character,index)=>{
     const art=zzzRosterImage(character.id);
     return <CharacterCard key={character.id} data-focus-key={"roster:"+character.id} name={character.name} onClick={()=>openCharacter(character.id)} image={{src:art?.src,style:art?.style,alt:character.name,eager:index<4}} metrics={[{label:'影畫',value:character.mindscape},{label:'有效達成率',value:formatEffectivePercent(effectiveTotals[character.id],maximumTotals[character.id])}]}/>;
    })}</div>
    {!visibleCharacters.length&&<div className="empty"><h2>沒有符合條件的角色</h2><button type="button" className="text-button" onClick={()=>updateRoster({...rosterState,query:'',filters:emptyZzzFilters()})}>清除搜尋與篩選</button></div>}
   </section>}
  {!route.agent&&route.section==='growth'&&<details className="zzz-guidance__context"><summary>資料範圍與依據</summary><p>既有技能目標於 {trainingPlans.meta.checkedAt} 核對。尚未建立角色培養目標者列為待核對。</p></details>}
  <footer className="page-footer"><span>遊戲圖片 © HoYoverse</span><span>圖源 <a href="https://wiki.hoyolab.com/pc/zzz/home" target="_blank" rel="noreferrer">HoYoWiki</a></span></footer>
  <GameNavigation sections={['roster','growth']} section={route.agent?'roster':route.section} onSelect={switchTab} gameControl={gameControl}/>
 </main>;
}
