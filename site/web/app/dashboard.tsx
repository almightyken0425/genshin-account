'use client';
import {useState,useEffect,useRef} from 'react';
import { BookOpen, Search, RefreshCw, X, AlertTriangle, Sword, Flower2, LoaderCircle, Tags, Shapes, ChevronDown, ArrowLeft, UsersRound, Sprout } from 'lucide-react';
import type {AccountResult,Stat} from '@/lib/types';
import {characterImage,characterRarity,weaponImage,artifactImage} from '@/lib/game_assets';
import GameImage from './game_image';
import MetricLabel,{MetricDisplayContext} from './metric_label';
import {artifactSummary} from '@/lib/artifact_summary.mjs';
import {effectiveSubstatCount,effectiveLoadoutCount,substatRoll} from '@/lib/artifact_rolls.mjs';
import ArtifactSubstat,{EffectiveBadge} from './artifact_substat';
import RosterControls from './roster_controls';
import {selectedTeams} from '@/lib/selected_teams';
import TeamFlow from './team_flow';
import CenteredHeader from './centered_header';
import GrowthTarget from './growth_target';
import SkirkFlow from './skirk_flow';
import {selectRoster} from '@/lib/roster_view.mjs';
import type {RosterFilters,SortRule} from '@/lib/roster_view.mjs';

const slots:Record<string,string>={flower:'生之花',plume:'死之羽',sands:'時之沙',goblet:'空之杯',circlet:'理之冠'};
const labels:Record<string,string>={hp:'生命值',atk:'攻擊力',def:'防禦力',em:'元素精通',stamina:'體力',hp_pct:'生命值',atk_pct:'攻擊力',def_pct:'防禦力',crit_rate:'暴擊率',crit_dmg:'暴擊傷害',energy_recharge:'元素充能效率',cryo_dmg_bonus:'冰元素傷害加成',hydro_dmg_bonus:'水元素傷害加成',pyro_dmg_bonus:'火元素傷害加成',electro_dmg_bonus:'雷元素傷害加成',anemo_dmg_bonus:'風元素傷害加成',geo_dmg_bonus:'岩元素傷害加成',dendro_dmg_bonus:'草元素傷害加成',healing_bonus:'治療加成',physical_dmg_bonus:'物理傷害加成'};
const fmt=(n:number|null|undefined)=>n==null?'未知':n.toLocaleString('zh-TW',{maximumFractionDigits:2});
const show=(s:Stat)=>fmt(s.value)+(s.value!==null&&s.unit==='percent'?'%':'');
function Numeric({label,value}:{label:string,value:number|null}){
 return <div className="field" title={label}><MetricLabel label={label}/><strong>{fmt(value)}{label.endsWith('(%)')?'%':''}</strong></div>
}
export default function Dashboard({initialCharacter=''}:{initialCharacter?:string}){
 const [data,setData]=useState<AccountResult|null>(null),[selected,setSelected]=useState(initialCharacter),[query,setQuery]=useState(''),[filters,setFilters]=useState<RosterFilters>({rarities:[],weapons:[],elements:[]}),[sorts,setSorts]=useState<SortRule[]>([]),[fullLabels,setFullLabels]=useState(false),[expanded,setExpanded]=useState<'weapon'|'artifacts'|null>(null),[section,setSection]=useState('roster'),[selectedTeam,setSelectedTeam]=useState('');
 const [busy,setBusy]=useState(true),[error,setError]=useState<{code:string,message:string}|null>(null);
 const [headerCollapsed,setHeaderCollapsed]=useState(false);
 const [navScrolling,setNavScrolling]=useState(false);
 const footerRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  let idle:ReturnType<typeof setTimeout>|undefined;
  const show=()=>{clearTimeout(idle);setNavScrolling(false)};
  const onScroll=()=>{
   clearTimeout(idle);
   if(footerRef.current?.contains(document.activeElement)){setNavScrolling(false);return}
   setNavScrolling(true);idle=setTimeout(()=>setNavScrolling(false),180);
  };
  const onVisibility=()=>{if(document.visibilityState!=='visible')show()};
  window.addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{clearTimeout(idle);window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',onVisibility)};
 },[]);
 useEffect(()=>{
  setHeaderCollapsed(false);
  if(!selected||section!=='roster')return;
  let previousY=window.scrollY,travel=0,direction=0;
  const onScroll=()=>{
   const y=Math.max(0,window.scrollY),delta=y-previousY;
   previousY=y;
   if(y<64){travel=0;setHeaderCollapsed(false);return}
   const nextDirection=Math.sign(delta);
   if(nextDirection!==direction){travel=0;direction=nextDirection}
   travel+=delta;
   if(Math.abs(travel)>=16){setHeaderCollapsed(travel>0);travel=0}
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>window.removeEventListener('scroll',onScroll);
 },[selected,section]);
 useEffect(()=>{try{setFullLabels(localStorage.getItem('genshin-detail-labels')==='full')}catch{}},[]);
 function toggleLabels(){setFullLabels(previous=>{const next=!previous;try{localStorage.setItem('genshin-detail-labels',next?'full':'compact')}catch{}return next})}

 const headingRef=useRef<HTMLHeadingElement>(null),searchRef=useRef<HTMLInputElement>(null);
 const cardRefs=useRef(new Map<string,HTMLButtonElement>()),listScroll=useRef(0),lastOpened=useRef('');
 const focusTarget=useRef<'list'|'detail'|null>(null);
 useEffect(()=>{
  const previousScrollMode=window.history.scrollRestoration;
  window.history.scrollRestoration='manual';
  const sync=()=>{
   const id=new URL(window.location.href).searchParams.get('character')||'';
   focusTarget.current=id?'detail':'list';
   const url=new URL(window.location.href);setSelected(id);setSelectedTeam(url.searchParams.get('team')||'');setSection(['teams','growth'].includes(url.searchParams.get('tab')||'')?url.searchParams.get('tab')!:'roster');setExpanded(null);
  };
  const initialId=new URL(window.location.href).searchParams.get('character')||'';
  if(initialId){focusTarget.current='detail';setSelected(initialId)}
  window.addEventListener('popstate',sync);
  return()=>{window.removeEventListener('popstate',sync);window.history.scrollRestoration=previousScrollMode};
 },[]);
 useEffect(()=>{
  if(section!=='roster'||busy||!focusTarget.current)return;
  if(focusTarget.current==='detail'){
   headingRef.current?.focus({preventScroll:true});window.scrollTo({top:0});
  }else{
   (cardRefs.current.get(lastOpened.current)||searchRef.current)?.focus({preventScroll:true});
   window.scrollTo({top:listScroll.current});
  }
  focusTarget.current=null;
 },[selected,section,busy]);
 function openCharacter(id:string){
  listScroll.current=window.scrollY;lastOpened.current=id;focusTarget.current='detail';
  const url=new URL(window.location.href);url.searchParams.delete('tab');url.searchParams.delete('team');url.searchParams.set('character',id);
  window.history.pushState({...window.history.state,genshinCharacterFromList:true},'',url);
  setSelected(id);setSection('roster');setExpanded(null);
 }
 function returnToList(){
  if(new URL(window.location.href).searchParams.has('character')&&window.history.state?.genshinCharacterFromList){
   window.history.back();return;
  }
  const url=new URL(window.location.href);url.searchParams.delete('character');
  window.history.replaceState({...window.history.state,genshinCharacterFromList:false},'',url);
  focusTarget.current='list';setSelected('');setSection('roster');
 }
 function openTeam(id:string){const url=new URL(window.location.href);url.searchParams.set('tab','teams');url.searchParams.set('team',id);url.searchParams.delete('character');window.history.pushState({...window.history.state},'',url);setSelectedTeam(id);setSection('teams');window.scrollTo({top:0})}
 function switchTab(tab:'teams'|'roster'|'growth'){
  const url=new URL(window.location.href);url.searchParams.delete('character');url.searchParams.delete('team');
  if(tab!=='roster')url.searchParams.set('tab',tab);else url.searchParams.delete('tab');
  window.history.pushState({...window.history.state,genshinCharacterFromList:false},'',url);
  setSelected('');setSelectedTeam('');setSection(tab);setExpanded(null);window.scrollTo({top:0});
 }
 const a=data?.account,c=a?.characters.find(x=>x.id===selected);
 useEffect(()=>{void refresh();const url=new URL(window.location.href);const tab=url.searchParams.get('tab');if(tab==='teams'||tab==='growth')setSection(tab);setSelectedTeam(url.searchParams.get('team')||'')},[]);
 const team=selectedTeams.find(t=>t.id===selectedTeam);
 async function refresh(){setBusy(true);setError(null);try{const r=await fetch('/api/account',{cache:'no-store'});const result:any=await r.json();if(!r.ok)throw result;setData(result)}catch(e:any){setError({code:e.error||'network_error',message:e.message||'無法連線，請稍後重試'})}finally{setBusy(false)}}
 const e=c&&a?.equipment[c.id],w=a?.weapons.find(x=>x.id===e?.weapon_id),panel=a?.panel_snapshots.find(x=>x.id===c?.panel_snapshot_id);
 const stale=!!c&&!!data&&data.panels[c.id]==='stale';
 const artifactIndex=new Map(a?.artifacts.map(artifact=>[artifact.id,artifact]));
 const effectiveTotals=Object.fromEntries((a?.characters||[]).map(character=>[character.id,effectiveLoadoutCount(Object.values(a!.equipment[character.id].artifacts).map(id=>id?artifactIndex.get(id):undefined),character.id)]));
 const equippedArtifacts=Object.values(e?.artifacts||{}).map(id=>id?artifactIndex.get(id):undefined);
 const artifactOverview=artifactSummary(equippedArtifacts);
 const effectiveTotal=c?effectiveTotals[c.id]:null;
 const rarities=Object.fromEntries((a?.characters||[]).map(character=>[character.id,characterRarity(character.id)]));
 const visible=selectRoster(a?.characters||[],{filters,sorts,query,effectiveTotals,rarities});
 const feedback=error&&<div className="message error" role="alert"><AlertTriangle size={18}/><div><strong>{error.code==='signin_required'?'請先登入':'目前無法讀取資料'}</strong><p>{error.message}{data?' 目前畫面保留上次讀取資料。':''}</p>{error.code==='signin_required'&&<a href="/signin-with-chatgpt?return_to=%2F" target="_top">使用 ChatGPT 登入</a>}</div><button className="icon-button" onClick={refresh} disabled={busy} aria-label="重新讀取"><RefreshCw size={17} className={busy?'spin':''}/></button></div>;
 return <MetricDisplayContext value={fullLabels}><div className="app-shell">
  <main className="main">
   {feedback}
   {section==='teams'?<section className="teams-page" aria-label="隊伍">{team?<><CenteredHeader title={team.name} onBack={()=>switchTab('teams')} backLabel="返回隊伍列表"/><div className="team-detail-members">{team.members.map(id=>{const character=a?.characters.find(c=>c.id===id);return <button key={id} onClick={()=>openCharacter(id)} aria-label={'查看'+(character?.name||id)+'角色詳情'}><GameImage src={characterImage(id,'icon')} alt=""/></button>})}</div><section className="team-guide" aria-label="隊伍循環">{team.id==='skirk'?<SkirkFlow/>:<TeamFlow id={team.id}/>}</section></>:<div className="teams-grid">{selectedTeams.map(team=><button className="team-card team-image-card" key={team.id} onClick={()=>openTeam(team.id)} aria-label={'查看'+team.name+'操作手法：'+team.members.map(id=>a?.characters.find(c=>c.id===id)?.name||id).join('、')}><div className="team-members">{team.members.map(id=><GameImage key={id} src={characterImage(id,'icon')} alt=""/>)}</div></button>)}</div>}</section>
   :section==='growth'?<section className="teams-page" aria-label="培養重點"><GrowthTarget/></section>
   :!selected?<section className="roster" aria-label="角色列表"><RosterControls characters={a?.characters||[]} rarities={rarities} filters={filters} onFilters={setFilters} sorts={sorts} onSorts={setSorts}/><div className="roster-search"><label className="search"><Search size={17}/><input ref={searchRef} placeholder="搜尋角色名稱" aria-label="搜尋角色名稱" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清除搜尋" onClick={()=>setQuery('')}><X size={13}/></button>}</label></div>
    <div className="character-list">{!a?(busy?<div className="empty small"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:<div className="empty small"><BookOpen/><p>連接 GitHub 後<br/>角色會顯示在這裡</p></div>):visible.length===0?<div className="empty small"><Search/><p>找不到符合條件的角色</p><button className="text-button" onClick={()=>{setQuery('');setFilters({rarities:[],weapons:[],elements:[]})}}>清除篩選</button></div>:visible.map(x=><button className="character-card" key={x.id} ref={el=>{if(el)cardRefs.current.set(x.id,el);else cardRefs.current.delete(x.id)}} onClick={()=>openCharacter(x.id)} aria-label={'查看'+x.name+'的角色詳情，角色等級 '+fmt(x.level.current)+'，命之座 '+fmt(x.constellation)+'，有效詞條總數 '+fmt(effectiveTotals[x.id])}><div className="character-emblem"><GameImage src={characterImage(x.id,'icon')} alt="" eager/></div><span className="character-card-stats" aria-hidden="true"><span title="角色等級">{x.level.current??'—'}</span><span title="命之座">{x.constellation??'—'}</span><span title="有效詞條總數">{effectiveTotals[x.id]??'—'}</span></span></button>)}</div></section>
   :<section className="detail detail-centered" aria-label="角色詳細資料">
    <header className={'detail-header '+(headerCollapsed?'is-collapsed':'')} onFocusCapture={()=>setHeaderCollapsed(false)}>
     <div className="character-heading"><button className="icon-button detail-back" onClick={returnToList} aria-label="返回上一頁" title="返回上一頁"><ArrowLeft size={20}/></button><h2 ref={headingRef} tabIndex={-1}>{c?.name||(busy?'讀取中':'角色詳情')}</h2></div>
     <div className="detail-navigation"><button className="icon-button mode-toggle" onClick={toggleLabels} aria-pressed={fullLabels} aria-label={fullLabels?'切換精簡模式':'切換完整模式'} title={fullLabels?'切換精簡模式':'切換完整模式'}>{fullLabels?<Shapes size={19}/>:<Tags size={19}/>}</button></div>
    </header>
    {c&&a&&data?<>
     <fieldset key={c.id} className="detail-fieldset">
      <section className="character-summary" aria-label="角色與配裝">
       <div className={'portrait-stage '+c.element+(c.id==='traveler_cryo'?' portrait-icon':'')}>
        <GameImage src={characterImage(c.id,'splash')} alt={c.name+'公開角色立繪'} eager/>
        <MetricDisplayContext value={false}><div className="portrait-basics"><Numeric label="角色等級" value={c.level.current}/><Numeric label="命之座" value={c.constellation}/><div className="field" title="有效詞條總數"><MetricLabel label="有效詞條總數"/><strong>{effectiveTotal??'—'}</strong></div></div></MetricDisplayContext>
       </div>
       <div className="loadout-overview" aria-label="武器與聖遺物">
        <button className={'equipment-tile '+(expanded==='weapon'?'expanded':'')} aria-label={'展開武器詳情：'+(w?.name||'未裝備')} aria-expanded={expanded==='weapon'} aria-controls="weapon-details" onClick={()=>setExpanded(previous=>previous==='weapon'?null:'weapon')}>
         <span className="equipment-art">{w?<GameImage src={weaponImage(w.name)} alt={w.name}/>:<Sword size={44}/>}</span>
         <ChevronDown className="expand-chevron" size={16}/>
        </button>
        <button className={'equipment-tile '+(expanded==='artifacts'?'expanded':'')} aria-label={'展開聖遺物詳情：'+(artifactOverview.groups.map(group=>group.name+' '+group.count+' 件').join('、')||'未裝備')} aria-expanded={expanded==='artifacts'} aria-controls="artifact-details" onClick={()=>setExpanded(previous=>previous==='artifacts'?null:'artifacts')}>
         <span className="set-icons">{artifactOverview.sets.length?artifactOverview.sets.map(group=><span className="set-art" key={group.name} title={group.name+' · '+group.count+' 件'}>{artifactImage(group.name,'flower')?<GameImage src={artifactImage(group.name,'flower')} alt={group.name}/>:<Flower2 size={44}/>}</span>):<span className="set-art" title={artifactOverview.total?'散搭':'未裝備'}><Flower2 size={44}/></span>}</span>
         <ChevronDown className="expand-chevron" size={16}/>
        </button>
       </div>
      </section>
      <section className="loadout" aria-label="配裝詳情">
       {expanded==='weapon'&&<div className="equipment-disclosure" key="weapon"><div className="equipment-clip"><div className="equipment-expanded" id="weapon-details" aria-label="武器詳情"><div className="expanded-weapon"><div className="equipment-identity"><div className="expanded-art"><GameImage src={w?weaponImage(w.name):undefined} alt={w?.name||'未裝備武器'}/></div><div className="item-kicker">裝備武器</div>{fullLabels?<h3>{w?.name||'未裝備武器'}</h3>:null}{fullLabels&&w&&<div className="item-stars">{'★'.repeat(w.rarity||0)}</div>}</div><div className="weapon-content">{w&&<div className="item-fields"><Numeric label="武器等級" value={w.level.current}/><Numeric label="精煉階數" value={w.refinement}/><Numeric label="基礎攻擊力" value={w.base_atk}/>{w.secondary_stat&&<Numeric label={(labels[w.secondary_stat.key]||w.secondary_stat.key)+(w.secondary_stat.unit==='percent'?' (%)':'')} value={w.secondary_stat.value}/>}</div>}</div></div></div></div></div>}
       {expanded==='artifacts'&&<div className="equipment-disclosure" key="artifacts"><div className="equipment-clip"><div className="equipment-expanded" id="artifact-details" aria-label="聖遺物詳情"><div className="artifact-details-grid">{Object.entries(slots).map(([slot,label])=>{const x=a.artifacts.find(x=>x.id===e?.artifacts[slot]);return <article className="artifact-details" key={slot}><div className="artifact-identity"><div className="artifact-art"><GameImage src={x?artifactImage(x.set_name,slot):undefined} alt={x?.name||label}/><EffectiveBadge count={effectiveSubstatCount(x,c.id)}/></div>{fullLabels&&<div className="artifact-ident"><div><span className="slot-label">{label}</span><h4>{x?.name||'未裝備'}</h4>{x&&<p>{x.set_name}</p>}</div></div>}</div><div className="artifact-values">{x&&<><div className="artifact-primary"><Numeric label="強化等級" value={x.level}/><Numeric label={(labels[x.main_stat.key]||x.main_stat.key)+(x.main_stat.unit==='percent'?' (%)':'')} value={x.main_stat.value}/></div><div className="artifact-substats">{x.substats.map((s,i)=><ArtifactSubstat key={i} stat={s} label={(labels[s.key]||s.key)+(s.unit==='percent'?' (%)':'')} roll={substatRoll(x,s.key,c.id)}/>)}</div></>}</div></article>})}</div></div></div></div>}

      </section>
      <section className="summary-surface" aria-label="人物總體數值"><div className="stats-container">{stale&&<span className="stats-state" role="img" aria-label="配裝已變更，以下數值待更新" title="配裝已變更，以下數值待更新"><AlertTriangle size={15}/></span>}<div className="summary-stats" aria-label="角色屬性">{panel?.stats.filter(s=>s.key!=='stamina').map(s=><div key={s.key}><MetricLabel label={labels[s.key]||s.key}/><strong>{show(s)}</strong></div>)}</div></div></section>
       <section className="talent-section" aria-label="天賦">
        <div className="talent-values">{(['normal','skill','burst'] as const).map((key,i)=><Numeric key={key} label={['普通攻擊','元素戰技','元素爆發'][i]} value={c.talents.displayed[key]}/>)}</div>
        <details className="talent-extra"><summary aria-label="展開基礎天賦與加成"><ChevronDown size={14}/>{fullLabels&&<span>基礎等級與加成</span>}</summary><div className="talent-values">{(['normal','skill','burst'] as const).map((key,i)=><Numeric key={key} label={['普通攻擊','元素戰技','元素爆發'][i]+'（基礎）'} value={c.talents.base[key]}/>)}</div><label className="field context-field"><span>加成來源</span><p>{c.talents.bonus_context||'尚未確認'}</p></label></details>
       </section>
     </fieldset>


   </>:<div className="welcome">{busy?<LoaderCircle className="spin" size={26}/>:<BookOpen size={28}/>}<h2>{busy?'正在讀取角色資料':data?'找不到這位角色':'開始查看角色'}</h2><p>{busy?'連接你的 GitHub 紀錄中…':data?'請返回列表，選擇已記錄的角色。':'連線後即可查看數值、天賦和配裝。'}</p></div>}</section>}
   <footer className="page-footer"><span>遊戲圖片 © HoYoverse</span><span>圖源 <a href="https://enka.network" target="_blank" rel="noreferrer">Enka Network</a><span className="footer-separator">/</span>資料索引 <a href="https://github.com/theBowja/genshin-db" target="_blank" rel="noreferrer">genshin-db</a></span></footer>
   <nav ref={footerRef} className={'footer-fab '+(navScrolling?'is-scrolling':'')} onFocusCapture={()=>setNavScrolling(false)} aria-label="主要分頁"><button className={section==='teams'?'active':''} aria-current={section==='teams'?'page':undefined} onClick={()=>switchTab('teams')}><UsersRound size={21}/><span>隊伍</span></button><button className={section==='roster'?'active':''} aria-current={section==='roster'?'page':undefined} onClick={()=>switchTab('roster')}><BookOpen size={21}/><span>角色列表</span></button><button className={section==='growth'?'active':''} aria-current={section==='growth'?'page':undefined} onClick={()=>switchTab('growth')}><Sprout size={21}/><span>培養重點</span></button></nav>
  </main>
 </div></MetricDisplayContext>
}
