'use client';

import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Search,RefreshCw,LoaderCircle} from 'lucide-react';
import {zzzRosterImage} from '@/lib/zzz_assets';
import ZzzCharacterDetail from './zzz_character_detail';
import {ZzzTeamsOverview,ZzzTeamDetail,ZzzGrowthPage} from './zzz_guidance';
import CharacterCard from '@/components/character/character_card';
import GameNavigation,{gameSection,type GameSection} from '@/components/navigation/game_navigation';
import type {ZzzAgent as Agent} from '@/lib/zzz_types';
import {effectiveDiscLoadout} from '@/lib/zzz_discs.mjs';
import {eligibleTeams} from '@/lib/zzz_recommendations.mjs';
import guideData from '@/lib/zzz_team_guides.json';

type ZzzResult={account:{characters:Agent[],source?:{filename:string}},revision:string};
type Route={section:GameSection,team:string,agent:string};
type ReturnPosition={scroll:number,label:string,index:number};
const readRoute=():Route=>{const params=new URL(location.href).searchParams;return {section:gameSection(params.get('tab')),team:params.get('team')||'',agent:params.get('agent')||''}};
async function readAccount():Promise<ZzzResult>{
 const response=await fetch('/api/zzz',{cache:'no-store'}),body=await response.json() as ZzzResult&{message?:string};
 if(!response.ok)throw new Error(body.message||'無法讀取絕區零資料');
 return body;
}

export default function ZzzDashboard({gameControl}:{gameControl?:ReactNode}){
 const [data,setData]=useState<ZzzResult|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState('');
 const [route,setRoute]=useState<Route>({section:'roster',team:'',agent:''});
 const routeRef=useRef(route),mainRef=useRef<HTMLElement>(null),returnPosition=useRef<ReturnPosition>({scroll:0,label:'',index:0}),teamReturnPosition=useRef<ReturnPosition>({scroll:0,label:'',index:0}),restore=useRef<'character'|'team'|null>(null);
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
  const initialRoute=requestAnimationFrame(()=>setRoute(readRoute()));
  const previousMode=history.scrollRestoration;history.scrollRestoration='manual';
  const sync=()=>{const next=readRoute();if(routeRef.current.agent&&!next.agent)restore.current='character';else if(routeRef.current.section==='teams'&&routeRef.current.team&&next.section==='teams'&&!next.team)restore.current='team';else window.scrollTo({top:0});setRoute(next)};
  window.addEventListener('popstate',sync);
  return()=>{active=false;cancelAnimationFrame(initialRoute);window.removeEventListener('popstate',sync);history.scrollRestoration=previousMode};
 },[]);
 useEffect(()=>{
  if(route.agent||busy||!restore.current)return;
  const request=requestAnimationFrame(()=>{
   const position=restore.current==='team'?teamReturnPosition.current:returnPosition.current;
   const buttons=Array.from(mainRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-label]')||[]).filter(button=>button.getAttribute('aria-label')===position.label);
   const button=buttons[position.index]??buttons[0];
   button?.focus({preventScroll:true});window.scrollTo({top:position.scroll});restore.current=null;
  });
  return()=>cancelAnimationFrame(request);
 },[route,busy]);
 function navigate(next:Route,replace=false,scroll=true){
  const url=new URL(location.href);url.search='';url.searchParams.set('game','zzz');
  if(next.section!=='roster')url.searchParams.set('tab',next.section);
  if(next.team&&next.section!=='roster')url.searchParams.set('team',next.team);
  if(next.agent)url.searchParams.set('agent',next.agent);
  history[replace?'replaceState':'pushState']({hoyoZzzFromView:!!next.agent,hoyoZzzTeamFromOverview:next.section==='teams'&&!!next.team&&!next.agent&&!route.team},'',url);
  setRoute(next);if(scroll)window.scrollTo({top:0});
 }
 function rememberPosition():ReturnPosition{
  const active=document.activeElement,label=active?.getAttribute('aria-label')||'';
  const matches=Array.from(mainRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-label]')||[]).filter(button=>button.getAttribute('aria-label')===label);
  return {scroll:window.scrollY,label,index:Math.max(0,matches.findIndex(button=>button===active))};
 }
 function openCharacter(id:string){
  returnPosition.current=rememberPosition();
  navigate({...route,agent:id});
 }
 function returnToView(){
  if(history.state?.hoyoZzzFromView){history.back();return}
  restore.current='character';navigate({...route,agent:''},true,false);
 }
 function openTeam(id:string){
  teamReturnPosition.current=rememberPosition();
  navigate({section:'teams',team:id,agent:''});
 }
 function returnToTeams(){
  if(history.state?.hoyoZzzTeamFromOverview){history.back();return}
  restore.current='team';navigate({section:'teams',team:'',agent:''},true,false);
 }
 function switchTab(section:GameSection){
  if(section===route.section&&!route.agent&&!route.team){window.scrollTo({top:0});return}
  navigate({section,agent:'',team:''});
 }
 const characters=data?.account.characters??[],character=characters.find(character=>character.id===route.agent);
 const teams=eligibleTeams(characters,guideData.teams),team=teams.find(team=>team.id===route.team);
 const backLabel=route.section==='teams'&&team?'返回隊伍詳情':route.section==='growth'?'返回培養重點':'返回角色列表';
 return <main ref={mainRef} className="main hoyo-main zzz-main">
  {error&&<div className="message error" role="alert"><p>{error}</p><button className="icon-button" aria-label="重新讀取" onClick={load}><RefreshCw size={18}/></button></div>}
  {busy&&!data?<div className="empty"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:route.agent?character?<ZzzCharacterDetail key={character.id} character={character} onBack={returnToView} backLabel={backLabel} sourceName={data?.account.source?.filename}/>:<div className="empty"><h2>找不到已記錄的角色</h2><button className="text-button" onClick={returnToView}>返回上一頁</button></div>
   :route.section==='teams'?route.team?team?<ZzzTeamDetail team={team} characters={characters} onBack={returnToTeams} onOpenCharacter={openCharacter}/>:<div className="empty"><h2>目前沒有這支隊伍的完整角色紀錄</h2><button className="text-button" onClick={()=>switchTab('teams')}>返回隊伍列表</button></div>:<ZzzTeamsOverview characters={characters} teams={teams} onOpenTeam={openTeam}/>
   :route.section==='growth'?<ZzzGrowthPage characters={characters} teams={teams} initialTeamId={route.team} onSelectTeam={id=>navigate({section:'growth',team:id,agent:''},true,false)} onOpenCharacter={openCharacter}/>
   :<section className="roster" aria-label="絕區零角色列表">
    <div className="roster-search"><label className="search"><Search size={17}/><input placeholder="搜尋角色名稱" aria-label="搜尋角色名稱" value={query} onChange={event=>setQuery(event.target.value)}/></label></div>
    <div className="character-list">{characters.filter(character=>character.name.includes(query)).map((character,index)=>{
     const art=zzzRosterImage(character.id),effective=effectiveDiscLoadout(character.driveDiscs);
     return <CharacterCard key={character.id} name={character.name} onClick={()=>openCharacter(character.id)} image={{src:art?.src,style:art?.style,alt:character.name,eager:index<4}} metrics={[{label:'角色等級',value:character.level},{label:'影畫',value:character.mindscape},{label:'有效詞條總數',value:effective}]}/>;
    })}</div>
   </section>}
  {!route.agent&&route.section!=='roster'&&<details className="zzz-guidance__context"><summary>資料範圍與依據</summary><p>角色技能於 {guideData.meta.checkedAt} 依官方 {guideData.meta.gameVersion} 版本資料核對。</p><ul>{guideData.meta.limitations.map((note,index)=><li key={index}>{note}</li>)}</ul></details>}
  <footer className="page-footer"><span>遊戲圖片 © HoYoverse</span><span>圖源 <a href="https://wiki.hoyolab.com/pc/zzz/home" target="_blank" rel="noreferrer">HoYoWiki</a></span></footer>
  <GameNavigation section={route.agent?'roster':route.section} onSelect={switchTab} gameControl={gameControl}/>
 </main>;
}
