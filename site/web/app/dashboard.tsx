'use client';
import {useState,useEffect,useRef} from 'react';
import { BookOpen, Search, RefreshCw, AlertTriangle, Sword, Flower2, LoaderCircle, Tags, Shapes, ChevronDown } from 'lucide-react';
import type {AccountResult,Stat} from '@/lib/types';
import {characterImage,characterRarity,weaponImage,artifactImage} from '@/lib/game_assets';
import MediaImage from '@/components/media/media_image';
import CharacterCard from '@/components/character/character_card';
import GameNavigation,{gameSection,type GameSection} from '@/components/navigation/game_navigation';
import TeamOverviewPage from '@/components/pages/team_overview_page';
import TeamDetailPage from '@/components/pages/team_detail_page';
import {revealAndFocus} from '@/components/pages/restore_focus';
import PortraitSummary from '@/components/character/portrait_summary';
import MetricValue from '@/components/metrics/metric_value';
import {MetricDisplayContext} from '@/components/metrics/metric_label';
import SummaryStat from '@/components/metrics/summary_stat';
import {getGenshinStatProfile,panelStatAssessment} from '@/lib/genshin_stat_profiles.mjs';
import {artifactSummary} from '@/lib/artifact_summary.mjs';
import {effectiveSubstatCount,effectiveLoadoutCount,maximumArtifactLoadout,maximumArtifactCount,artifactEffectiveKeys,substatRoll} from '@/lib/artifact_rolls.mjs';
import {effectiveRollMetric,formatEffectivePercent} from '@/components/metrics/effective_roll_metric';
import ArtifactSubstat,{EffectiveBadge} from '@/components/equipment/artifact_substat';
import EquipmentTile from '@/components/equipment/equipment_tile';
import RosterControls from './roster_controls';
import RosterHeader from '@/components/roster/roster_header';
import {selectedTeams} from '@/lib/selected_teams';
import TeamFlow from './team_flow';
import {teamFlowNotes} from '@/lib/team_flows';
import CenteredHeader from '@/components/navigation/centered_header';
import GrowthTarget from './growth_target';
import SkirkFlow from './skirk_flow';
import {selectRoster,defaultRosterSorts} from '@/lib/roster_view.mjs';
import type {RosterFilters,SortRule} from '@/lib/roster_view.mjs';

const slots:Record<string,string>={flower:'生之花',plume:'死之羽',sands:'時之沙',goblet:'空之杯',circlet:'理之冠'};
const labels:Record<string,string>={hp:'生命值',atk:'攻擊力',def:'防禦力',em:'元素精通',stamina:'體力',hp_pct:'生命值',atk_pct:'攻擊力',def_pct:'防禦力',crit_rate:'暴擊率',crit_dmg:'暴擊傷害',energy_recharge:'元素充能效率',cryo_dmg_bonus:'冰元素傷害加成',hydro_dmg_bonus:'水元素傷害加成',pyro_dmg_bonus:'火元素傷害加成',electro_dmg_bonus:'雷元素傷害加成',anemo_dmg_bonus:'風元素傷害加成',geo_dmg_bonus:'岩元素傷害加成',dendro_dmg_bonus:'草元素傷害加成',healing_bonus:'治療加成',physical_dmg_bonus:'物理傷害加成'};
const fmt=(n:number|null|undefined)=>n==null?'未知':n.toLocaleString('zh-TW',{maximumFractionDigits:2});
const show=(s:Stat)=>fmt(s.value)+(s.value!==null&&s.unit==='percent'?'%':'');
function Numeric({label,value}:{label:string,value:number|null}){
 return <MetricValue label={label} value={<>{fmt(value)}{label.endsWith('(%)')?'%':''}</>}/>;
}
export default function Dashboard({initialCharacter='',gameControl}:{initialCharacter?:string,gameControl?:React.ReactNode}){
 const [data,setData]=useState<AccountResult|null>(null),[selected,setSelected]=useState(initialCharacter),[query,setQuery]=useState(''),[filters,setFilters]=useState<RosterFilters>({rarities:[],weapons:[],elements:[]}),[sorts,setSorts]=useState<SortRule[]>(defaultRosterSorts),[fullLabels,setFullLabels]=useState(false),[expanded,setExpanded]=useState<'weapon'|'artifacts'|null>(null),[section,setSection]=useState<GameSection>('roster'),[selectedTeam,setSelectedTeam]=useState('');
 const [busy,setBusy]=useState(true),[error,setError]=useState<{code:string,message:string}|null>(null);
 useEffect(()=>{try{setFullLabels((localStorage.getItem('hoyo-genshin-detail-labels')??localStorage.getItem('genshin-detail-labels'))==='full')}catch{}},[]);
 function toggleLabels(){setFullLabels(previous=>{const next=!previous;try{localStorage.setItem('hoyo-genshin-detail-labels',next?'full':'compact')}catch{}return next})}

 const headingRef=useRef<HTMLHeadingElement>(null),searchRef=useRef<HTMLInputElement>(null);
 const cardRefs=useRef(new Map<string,HTMLButtonElement>()),listScroll=useRef(0),lastOpened=useRef('');
 const focusTarget=useRef<'list'|'detail'|null>(null);
 const sourceFocus=useRef<{section:GameSection,key?:string,scroll:number}|null>(null);
 const teamReturnPosition=useRef({id:'',scroll:0});
 useEffect(()=>{
  const previousScrollMode=window.history.scrollRestoration;
  window.history.scrollRestoration='manual';
  const sync=()=>{
   const id=new URL(window.location.href).searchParams.get('character')||'';
   focusTarget.current=id?'detail':'list';
   const url=new URL(window.location.href),nextSection=gameSection(url.searchParams.get('tab'));
   if(!id&&nextSection==='teams'&&!url.searchParams.get('team')&&teamReturnPosition.current.id)sourceFocus.current={section:'teams',key:'team:'+teamReturnPosition.current.id,scroll:teamReturnPosition.current.scroll};
   setSelected(id);setSelectedTeam(url.searchParams.get('team')||'');setSection(nextSection);setExpanded(null);
  };
  const initialId=new URL(window.location.href).searchParams.get('character')||'';
  if(initialId){focusTarget.current='detail';setSelected(initialId)}
  window.addEventListener('popstate',sync);
  return()=>{window.removeEventListener('popstate',sync);window.history.scrollRestoration=previousScrollMode};
 },[]);
 useEffect(()=>{
  if(busy||!focusTarget.current)return;
  if(focusTarget.current==='detail'&&section==='roster'){
   headingRef.current?.focus({preventScroll:true});window.scrollTo({top:0});
  }else{
   const source=sourceFocus.current;
   const returnControl=source?.section===section&&source.key?Array.from(document.querySelectorAll<HTMLElement>('[data-focus-key]')).find(element=>element.dataset.focusKey===source.key):undefined;
   revealAndFocus(returnControl||(section==='roster'?(cardRefs.current.get(lastOpened.current)||searchRef.current):undefined));
   window.scrollTo({top:source?.section===section?source.scroll:listScroll.current});
  }
  focusTarget.current=null;
 },[selected,selectedTeam,section,busy]);
 function openCharacter(id:string){
  sourceFocus.current={section,key:(document.activeElement as HTMLElement|null)?.dataset.focusKey,scroll:window.scrollY};
  listScroll.current=window.scrollY;lastOpened.current=id;focusTarget.current='detail';
  const url=new URL(window.location.href);url.searchParams.delete('tab');url.searchParams.delete('team');url.searchParams.set('character',id);
  window.history.pushState({...window.history.state,hoyoCharacterFromList:true},'',url);
  setSelected(id);setSection('roster');setExpanded(null);
 }
 function returnToList(){
  if(new URL(window.location.href).searchParams.has('character')&&(window.history.state?.hoyoCharacterFromList||window.history.state?.genshinCharacterFromList)){
   window.history.back();return;
  }
  const url=new URL(window.location.href);url.searchParams.delete('character');
  window.history.replaceState({...window.history.state,genshinCharacterFromList:false},'',url);
  focusTarget.current='list';setSelected('');setSection('roster');
 }
 function openTeam(id:string){teamReturnPosition.current={id,scroll:window.scrollY};sourceFocus.current={section:'teams',key:'team:'+id,scroll:window.scrollY};const url=new URL(window.location.href);url.searchParams.set('tab','teams');url.searchParams.set('team',id);url.searchParams.delete('character');window.history.pushState({...window.history.state},'',url);setSelectedTeam(id);setSection('teams');window.scrollTo({top:0})}
 function returnToTeams(){sourceFocus.current={section:'teams',key:'team:'+selectedTeam,scroll:teamReturnPosition.current.id===selectedTeam?teamReturnPosition.current.scroll:0};focusTarget.current='list';switchTab('teams')}
 function selectGrowthTeam(id:string){const url=new URL(window.location.href);if(id)url.searchParams.set('team',id);else url.searchParams.delete('team');window.history.replaceState({...window.history.state},'',url);setSelectedTeam(id)}
 function switchTab(tab:'teams'|'roster'|'growth'){
  const url=new URL(window.location.href);url.searchParams.delete('character');url.searchParams.delete('team');
  if(tab!=='roster')url.searchParams.set('tab',tab);else url.searchParams.delete('tab');
  window.history.pushState({...window.history.state,genshinCharacterFromList:false},'',url);
  setSelected('');setSelectedTeam('');setSection(tab);setExpanded(null);window.scrollTo({top:0});
 }
 const a=data?.account,c=a?.characters.find(x=>x.id===selected);
 useEffect(()=>{void refresh();const url=new URL(window.location.href);setSection(gameSection(url.searchParams.get('tab')));setSelectedTeam(url.searchParams.get('team')||'')},[]);
 const team=selectedTeams.find(t=>t.id===selectedTeam);
 async function refresh(){setBusy(true);setError(null);try{const r=await fetch('/api/account',{cache:'no-store'});const result:any=await r.json();if(!r.ok)throw result;setData(result)}catch(e:any){setError({code:e.error||'network_error',message:e.message||'無法連線，請稍後重試'})}finally{setBusy(false)}}
 const e=c&&a?.equipment[c.id],w=a?.weapons.find(x=>x.id===e?.weapon_id),panel=a?.panel_snapshots.find(x=>x.id===c?.panel_snapshot_id);
 const stale=!!c&&!!data&&data.panels[c.id]==='stale';
 const artifactIndex=new Map(a?.artifacts.map(artifact=>[artifact.id,artifact]));
 const effectiveTotals=Object.fromEntries((a?.characters||[]).map(character=>[character.id,effectiveLoadoutCount(Object.values(a!.equipment[character.id].artifacts).map(id=>id?artifactIndex.get(id):undefined),character.id)]));
 const effectiveKeysByCharacter=Object.fromEntries((a?.characters||[]).map(character=>[character.id,artifactEffectiveKeys(Object.values(a!.equipment[character.id].artifacts).map(id=>id?artifactIndex.get(id):undefined),character.id)]));
 const maximumTotals=Object.fromEntries((a?.characters||[]).map(character=>[character.id,maximumArtifactLoadout(Object.values(a!.equipment[character.id].artifacts).map(id=>id?artifactIndex.get(id):undefined),effectiveKeysByCharacter[character.id])]));
 const equippedArtifacts=Object.values(e?.artifacts||{}).map(id=>id?artifactIndex.get(id):undefined);
 const artifactOverview=artifactSummary(equippedArtifacts);
 const effectiveTotal=c?effectiveTotals[c.id]:null;
 const effectiveKeys=c?effectiveKeysByCharacter[c.id]:null;
 const maximumTotal=c?maximumTotals[c.id]:null;
 const statProfile=c?getGenshinStatProfile(c.id):null;
 const rarities=Object.fromEntries((a?.characters||[]).map(character=>[character.id,characterRarity(character.id)]));
 const visible=selectRoster(a?.characters||[],{filters,sorts,query,effectiveTotals,maximumTotals,rarities});
 const feedback=error&&<div className="message error" role="alert"><AlertTriangle size={18}/><div><strong>{error.code==='signin_required'?'請先登入':'目前無法讀取資料'}</strong><p>{error.message}{data?' 目前畫面保留上次讀取資料。':''}</p>{error.code==='signin_required'&&<a href="/signin-with-chatgpt?return_to=%2F" target="_top">使用 ChatGPT 登入</a>}</div><button className="icon-button" onClick={refresh} disabled={busy} aria-label="重新讀取"><RefreshCw size={17} className={busy?'spin':''}/></button></div>;
 return <MetricDisplayContext value={fullLabels}><div className="app-shell">
  <main className="main hoyo-main">
   {feedback}
   {section==='teams'?(team?<TeamDetailPage title={team.name} members={team.members.map(id=>({id,name:a?.characters.find(character=>character.id===id)?.name||id,src:characterImage(id,'icon')}))} onBack={returnToTeams} onOpenCharacter={openCharacter} supplementary={teamFlowNotes[team.id]?.length?<ul>{teamFlowNotes[team.id].map((note,index)=><li key={index}>{note}</li>)}</ul>:undefined}>{team.id==='skirk'?<SkirkFlow/>:<TeamFlow id={team.id} showNotes={false}/>}</TeamDetailPage>:<TeamOverviewPage teams={selectedTeams.map(team=>({id:team.id,name:team.name,members:team.members.map(id=>({id,name:a?.characters.find(character=>character.id===id)?.name||id,src:characterImage(id,'icon')}))}))} onOpenTeam={openTeam}/>)
   :section==='growth'?<GrowthTarget teamId={selectedTeam} onSelectTeam={selectGrowthTeam} onOpenCharacter={openCharacter}/>
   :!selected?<section className="roster" aria-label="角色列表"><RosterHeader controls={<RosterControls characters={a?.characters||[]} rarities={rarities} maximumTotals={maximumTotals} filters={filters} onFilters={setFilters} sorts={sorts} onSorts={setSorts}/>} query={query} onQueryChange={setQuery} searchRef={searchRef}/>
    <div className="character-list">{!a?(busy?<div className="empty small"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:<div className="empty small"><BookOpen/><p>連接 GitHub 後<br/>角色會顯示在這裡</p></div>):visible.length===0?<div className="empty small"><Search/><p>找不到符合條件的角色</p><button className="text-button" onClick={()=>{setQuery('');setFilters({rarities:[],weapons:[],elements:[]})}}>清除篩選</button></div>:visible.map((x,index)=><CharacterCard key={x.id} name={x.name} ref={el=>{if(el)cardRefs.current.set(x.id,el);else cardRefs.current.delete(x.id)}} onClick={()=>openCharacter(x.id)} image={{src:characterImage(x.id,'roster'),alt:'',eager:index<4}} metrics={[{label:'命之座',value:x.constellation},{label:'有效達成率',value:formatEffectivePercent(effectiveTotals[x.id],maximumTotals[x.id])}]}/>)}</div></section>
   :<section className="detail detail-centered" aria-label="角色詳細資料">
    <CenteredHeader title={c?.name||(busy?'讀取中':'角色詳情')} titleRef={headingRef} onBack={returnToList} backLabel="返回上一頁" action={<button className="icon-button mode-toggle" onClick={toggleLabels} aria-pressed={fullLabels} aria-label={fullLabels?'切換精簡模式':'切換完整模式'} title={fullLabels?'切換精簡模式':'切換完整模式'}>{fullLabels?<Shapes size={19}/>:<Tags size={19}/>}</button>}/>
    {c&&a&&data?<>
     <fieldset key={c.id} className="detail-fieldset">
      <section className="character-summary" aria-label="角色與配裝">
       <PortraitSummary image={{src:characterImage(c.id,'splash'),alt:c.name+'角色圖片',eager:true}} metrics={[{label:'角色等級',value:c.level.current},{label:'命之座',value:c.constellation},effectiveRollMetric(effectiveTotal,maximumTotal)]}/>
       <div className="loadout-overview" aria-label="武器與聖遺物">
        <EquipmentTile className="genshin-weapon-tile" label="武器" aria-label={'展開武器詳情：'+(w?.name||'未裝備')} aria-expanded={expanded==='weapon'} aria-controls="weapon-details" onClick={()=>setExpanded(previous=>previous==='weapon'?null:'weapon')}>
         <span className="equipment-art">{w?<MediaImage src={weaponImage(w.name)} alt={w.name}/>:<Sword size={44}/>}</span>
        </EquipmentTile>
        <EquipmentTile label="聖遺物" aria-label={'展開聖遺物詳情：'+(artifactOverview.groups.map(group=>group.name+' '+group.count+' 件').join('、')||'未裝備')} aria-expanded={expanded==='artifacts'} aria-controls="artifact-details" onClick={()=>setExpanded(previous=>previous==='artifacts'?null:'artifacts')}>
         <span className="set-icons">{artifactOverview.sets.length?artifactOverview.sets.map(group=><span className="set-art" key={group.name} title={group.name+' · '+group.count+' 件'}>{artifactImage(group.name,'flower')?<MediaImage src={artifactImage(group.name,'flower')} alt={group.name}/>:<Flower2 size={44}/>}</span>):<span className="set-art" title={artifactOverview.total?'散搭':'未裝備'}><Flower2 size={44}/></span>}</span>
        </EquipmentTile>
       </div>
      </section>
      <section className="loadout" aria-label="配裝詳情">
       {expanded==='weapon'&&<div className="equipment-disclosure" key="weapon"><div className="equipment-clip"><div className="equipment-expanded" id="weapon-details" aria-label="武器詳情"><div className="expanded-weapon"><div className="equipment-identity"><div className="expanded-art"><MediaImage src={w?weaponImage(w.name):undefined} alt={w?.name||'未裝備武器'}/></div><div className="item-kicker">裝備武器</div>{fullLabels?<h3>{w?.name||'未裝備武器'}</h3>:null}{fullLabels&&w&&<div className="item-stars">{'★'.repeat(w.rarity||0)}</div>}</div><div className="weapon-content">{w&&<div className="item-fields"><Numeric label="武器等級" value={w.level.current}/><Numeric label="精煉階數" value={w.refinement}/><Numeric label="基礎攻擊力" value={w.base_atk}/>{w.secondary_stat&&<Numeric label={(labels[w.secondary_stat.key]||w.secondary_stat.key)+(w.secondary_stat.unit==='percent'?' (%)':'')} value={w.secondary_stat.value}/>}</div>}</div></div></div></div></div>}
       {expanded==='artifacts'&&<div className="equipment-disclosure" key="artifacts"><div className="equipment-clip"><div className="equipment-expanded" id="artifact-details" aria-label="聖遺物詳情"><div className="artifact-details-grid">{Object.entries(slots).map(([slot,label])=>{const x=a.artifacts.find(x=>x.id===e?.artifacts[slot]);return <article className="artifact-details" key={slot}><div className="artifact-identity"><div className="artifact-art"><MediaImage src={x?artifactImage(x.set_name,slot):undefined} alt={x?.name||label}/><EffectiveBadge count={effectiveSubstatCount(x,c.id)} maximum={maximumArtifactCount(x,effectiveKeys)} mode="both"/></div>{fullLabels&&<div className="artifact-ident"><div><span className="slot-label">{label}</span><h4>{x?.name||'未裝備'}</h4>{x&&<p>{x.set_name}</p>}</div></div>}</div><div className="artifact-values">{x&&<><div className="artifact-primary"><Numeric label="強化等級" value={x.level}/><Numeric label={(labels[x.main_stat.key]||x.main_stat.key)+(x.main_stat.unit==='percent'?' (%)':'')} value={x.main_stat.value}/></div><div className="artifact-substats">{x.substats.map((s,i)=><ArtifactSubstat key={i} stat={s} label={(labels[s.key]||s.key)+(s.unit==='percent'?' (%)':'')} roll={substatRoll(x,s.key,c.id)}/>)}</div></>}</div></article>})}</div></div></div></div>}

      </section>
      <section className="summary-surface" aria-label="人物總體數值"><div className="stats-container">{stale&&<span className="stats-state" role="img" aria-label="配裝已變更，以下數值待更新" title="配裝已變更，以下數值待更新"><AlertTriangle size={15}/></span>}<div className="summary-stats" aria-label="角色屬性">{panel?.stats.filter(s=>s.key!=='stamina').map(s=><SummaryStat key={s.key} label={labels[s.key]||s.key} value={show(s)} {...panelStatAssessment(c.id,s.key)} effectiveLabel="培養有效屬性"/>)}</div></div></section>
      <details className="talent-extra"><summary><ChevronDown size={14}/><span>有效屬性依據</span></summary><div className="field context-field">{statProfile?<><p>{statProfile.role}</p><p>{statProfile.summary}</p><p>標記依目前採用的配隊與用途判定，聖遺物上的有效標記保留遊戲紀錄。</p>{statProfile.unknown_reason&&<p>{statProfile.unknown_reason}</p>}{statProfile.conditional.map(condition=><p key={condition.key}>{labels[condition.key]||condition.key}：{condition.reason}</p>)}{statProfile.sources.map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>{source.version?' · '+source.version:''}</p>)}</>:<p>尚未確認</p>}</div></details>
       <section className="talent-section" aria-label="天賦">
        <div className="talent-values">{(['normal','skill','burst'] as const).map((key,i)=><Numeric key={key} label={['普通攻擊','元素戰技','元素爆發'][i]} value={c.talents.displayed[key]}/>)}</div>
        <details className="talent-extra"><summary aria-label="展開基礎天賦與加成"><ChevronDown size={14}/>{fullLabels&&<span>基礎等級與加成</span>}</summary><div className="talent-values">{(['normal','skill','burst'] as const).map((key,i)=><Numeric key={key} label={['普通攻擊','元素戰技','元素爆發'][i]+'（基礎）'} value={c.talents.base[key]}/>)}</div><label className="field context-field"><span>加成來源</span><p>{c.talents.bonus_context||'尚未確認'}</p></label></details>
       </section>
     </fieldset>


   </>:<div className="welcome">{busy?<LoaderCircle className="spin" size={26}/>:<BookOpen size={28}/>}<h2>{busy?'正在讀取角色資料':data?'找不到這位角色':'開始查看角色'}</h2><p>{busy?'連接你的 GitHub 紀錄中…':data?'請返回列表，選擇已記錄的角色。':'連線後即可查看數值、天賦和配裝。'}</p></div>}</section>}
   <footer className="page-footer"><span>遊戲圖片 © HoYoverse</span><span>圖源 <a href="https://wiki.hoyolab.com/pc/genshin/home" target="_blank" rel="noreferrer">HoYoWiki</a><span className="footer-separator">/</span>資料索引 <a href="https://github.com/theBowja/genshin-db" target="_blank" rel="noreferrer">genshin-db</a></span></footer>
   <GameNavigation section={section} onSelect={switchTab} gameControl={gameControl}/>
  </main>
 </div></MetricDisplayContext>
}
