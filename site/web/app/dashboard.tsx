'use client';
import {useState,useEffect,useRef} from 'react';
import { BookOpen, Flame, Zap, Wind, Mountain, Leaf, Sparkles, Search, ArrowUpRight, RefreshCw, LockKeyhole, Snowflake, Droplets, Pencil, X, Check, AlertTriangle, Camera, Sword, Flower2, Shield, Download, Link2, LoaderCircle, Save, Menu, GitBranch, Tags, Shapes, ChevronDown, Settings2, ArrowLeft } from 'lucide-react';
import type {Account,AccountResult,Character,Stat} from '@/lib/types';
import {characterImage,characterRarity,weaponImage,artifactImage} from '@/lib/game_assets';
import GameImage from './game_image';
import MetricLabel,{MetricDisplayContext} from './metric_label';
import {artifactSummary} from '@/lib/artifact_summary.mjs';
import {effectiveSubstatCount,effectiveLoadoutCount,substatRoll,editSubstatRoll} from '@/lib/artifact_rolls.mjs';
import ArtifactSubstat,{EffectiveBadge} from './artifact_substat';
import {artifactSubstatOptions,changeArtifactSubstat} from '@/lib/artifact_substats.mjs';
import RosterControls from './roster_controls';
import SaveControls from './save_controls';
import {selectRoster} from '@/lib/roster_view.mjs';
import type {RosterFilters,SortRule} from '@/lib/roster_view.mjs';

const slots:Record<string,string>={flower:'生之花',plume:'死之羽',sands:'時之沙',goblet:'空之杯',circlet:'理之冠'};
const labels:Record<string,string>={hp:'生命值',atk:'攻擊力',def:'防禦力',em:'元素精通',stamina:'體力',hp_pct:'生命值',atk_pct:'攻擊力',def_pct:'防禦力',crit_rate:'暴擊率',crit_dmg:'暴擊傷害',energy_recharge:'元素充能效率',cryo_dmg_bonus:'冰元素傷害加成',hydro_dmg_bonus:'水元素傷害加成',pyro_dmg_bonus:'火元素傷害加成',electro_dmg_bonus:'雷元素傷害加成',anemo_dmg_bonus:'風元素傷害加成',geo_dmg_bonus:'岩元素傷害加成',dendro_dmg_bonus:'草元素傷害加成',healing_bonus:'治療加成',physical_dmg_bonus:'物理傷害加成'};
const fmt=(n:number|null|undefined)=>n==null?'未知':n.toLocaleString('zh-TW',{maximumFractionDigits:2});
const show=(s:Stat)=>fmt(s.value)+(s.value!==null&&s.unit==='percent'?'%':'');
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
function build(a:Account,id:string){const c=a.characters.find(x=>x.id===id)!,e=a.equipment[id];const mechanics=(x:any)=>x?Object.fromEntries(Object.entries(x).filter(([k])=>!['name','provenance','substat_rolls'].includes(k))):null;return {c:[c.id,c.element,c.weapon_type,c.level,c.constellation,c.talents],w:mechanics(a.weapons.find(x=>x.id===e.weapon_id)),a:Object.values(e.artifacts).map(id=>mechanics(a.artifacts.find(x=>x.id===id)))}}
function changes(old:Account,next:Account){const out:string[]=[];
 for(const k of ['characters','weapons','artifacts'] as const)next[k].forEach((x:any,i:number)=>{const b:any=old[k][i];for(const key of Object.keys(x))if(!['provenance','id'].includes(key)&&!same(b[key],x[key]))out.push(x.name+' · '+({level:'等級',constellation:'命座',friendship:'好感',talents:'天賦',refinement:'精煉',base_atk:'基礎攻擊力',secondary_stat:'副屬性',main_stat:'主詞條',substats:'副詞條',substat_rolls:'詞條強化紀錄'} as Record<string,string>)[key])});
 for(const c of next.characters)if(!same(old.equipment[c.id],next.equipment[c.id]))out.push(c.name+' · 裝備配置');
 return out;
}
function Numeric({label,value,onChange,min=0,max,step=1,editing}:{label:string,value:number|null,onChange:(v:number|null)=>void,min?:number,max?:number,step?:number,editing:boolean}){
 return <label className="field" title={label}><MetricLabel label={label}/>{editing?<span className="input-value"><input aria-label={label} type="number" min={min} max={max} step={step} placeholder="未知" value={value??''} onChange={e=>onChange(e.target.value===''?null:Number(e.target.value))}/>{label.endsWith('(%)')&&<small>%</small>}</span>:<strong>{fmt(value)}{label.endsWith('(%)')?'%':''}</strong>}</label>
}
// Artifact enhancement caps by rarity. Source: https://keqingmains.com/misc/artifacts/
const artifactLevelCaps:Record<number,number>={1:4,2:4,3:12,4:16,5:20};
function artifactLevelCap(rarity:number|null){return rarity==null?null:artifactLevelCaps[rarity]??null}
export default function Dashboard({initialCharacter=''}:{initialCharacter?:string}){
 const [data,setData]=useState<AccountResult|null>(null),[draft,setDraft]=useState<Account|null>(null),[selected,setSelected]=useState(initialCharacter),[query,setQuery]=useState(''),[filters,setFilters]=useState<RosterFilters>({rarities:[],weapons:[],elements:[]}),[sorts,setSorts]=useState<SortRule[]>([]),[fullLabels,setFullLabels]=useState(false),[expanded,setExpanded]=useState<'weapon'|'artifacts'|null>(null),[section,setSection]=useState('roster');
 const [busy,setBusy]=useState(true),[editing,setEditing]=useState(false),[error,setError]=useState<{code:string,message:string}|null>(null),[notice,setNotice]=useState(''),[note,setNote]=useState(''),[pending,setPending]=useState<any>(null),[conflict,setConflict]=useState<AccountResult|null>(null);
 const noteRef=useRef<HTMLTextAreaElement>(null);
 const [saveOpen,setSaveOpen]=useState(false);
 const [headerCollapsed,setHeaderCollapsed]=useState(false);
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
   setSelected(id);setSection('roster');setExpanded(null);
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
  const url=new URL(window.location.href);url.searchParams.set('character',id);
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
 const a=draft||data?.account,c=a?.characters.find(x=>x.id===selected),diff=data&&draft?changes(data.account,draft):[],dirty=diff.length>0;
 useEffect(()=>{void refresh()},[]);
 useEffect(()=>{const fn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',fn);return()=>window.removeEventListener('beforeunload',fn)},[dirty]);

 async function api(path:string,body?:unknown){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,cache:'no-store'});const j:any=await r.json();if(!r.ok)throw j;return j}
 function accept(r:AccountResult){setSaveOpen(false);setData(r);setDraft(null);setEditing(false);setNote('');setPending(null);setConflict(null);setError(null)}
 async function refresh(){if(dirty)return;setBusy(true);setError(null);try{accept(await api('/api/account'))}catch(e:any){setError({code:e.error||'network_error',message:e.message||'無法連線，請稍後重試'})}finally{setBusy(false)}}
 function mutate(fn:(a:Account)=>void){setDraft(prev=>{const next=structuredClone(prev||data!.account);fn(next);return next});setNotice('')}
 const changeCharacter=(fn:(c:Character)=>void)=>mutate(a=>fn(a.characters.find(x=>x.id===c!.id)!));
 function discard(){if(dirty&&!window.confirm('放棄尚未保存的修改？'))return;setSaveOpen(false);setDraft(null);setEditing(false);setNote('');setPending(null);setError(null);setConflict(null)}
 function download(){const blob=new Blob([JSON.stringify(draft,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),el=document.createElement('a');el.href=url;el.download='genshin-draft.json';el.click();setNotice('已開始下載 genshin-draft.json，尚未寫回角色資料。');setTimeout(()=>URL.revokeObjectURL(url),1000)}
 async function save(){if(!note.trim()){noteRef.current?.focus();return}setBusy(true);setError(null);const input={candidate:draft,expectedRevision:data!.revision,requestId:crypto.randomUUID(),note};try{const r=await api('/api/account',input);accept(r);setNotice('已保存到 GitHub，並讀回確認。')}catch(e:any){setError({code:e.error||'write_uncertain',message:e.message||'保存結果未確認，請先確認保存結果'});if(!e.error||e.error==='write_uncertain')setPending(input)}finally{setBusy(false)}}
 async function check(){setBusy(true);try{const r=await api('/api/account/check',pending);if(r.confirmed){accept(r.current);setNotice('已確認保存成功。顯示 GitHub 最新版本。')}else{setPending(null);setError({code:'not_saved',message:'最近的 GitHub 紀錄未找到這次保存。草稿仍保留，請檢視最新版本後再處理。'})}}catch(e:any){setError({code:'write_uncertain',message:e.message||'仍無法確認，請稍後再試'})}finally{setBusy(false)}}
 async function readConflict(){setBusy(true);try{setConflict(await api('/api/account'))}catch(e:any){setError({code:e.error,message:e.message})}finally{setBusy(false)}}
 const e=c&&a?.equipment[c.id],w=a?.weapons.find(x=>x.id===e?.weapon_id),panel=a?.panel_snapshots.find(x=>x.id===c?.panel_snapshot_id);
 const stale=!!c&&!!data&&(data.panels[c.id]==='stale'||!!draft&&!same(build(data.account,c.id),build(draft,c.id)));
 const edit=editing&&!busy&&!pending;
 const artifactIndex=new Map(a?.artifacts.map(artifact=>[artifact.id,artifact]));
 const effectiveTotals=Object.fromEntries((a?.characters||[]).map(character=>[character.id,effectiveLoadoutCount(Object.values(a!.equipment[character.id].artifacts).map(id=>id?artifactIndex.get(id):undefined),character.id)]));
 const equippedArtifacts=Object.values(e?.artifacts||{}).map(id=>id?artifactIndex.get(id):undefined);
 const artifactOverview=artifactSummary(equippedArtifacts);
 const effectiveTotal=c?effectiveTotals[c.id]:null;
 const rarities=Object.fromEntries((a?.characters||[]).map(character=>[character.id,characterRarity(character.id)]));
 const visible=selectRoster(a?.characters||[],{filters,sorts,query,effectiveTotals,rarities});
 // Evidence and provenance remain in AccountResult/account.json. They are intentionally not rendered.
 function equip(kind:string,id:string|null){mutate(a=>{if(kind==='weapon'){for(const eq of Object.values(a.equipment))if(id&&eq.weapon_id===id)eq.weapon_id=null;a.equipment[c!.id].weapon_id=id}else{for(const eq of Object.values(a.equipment))if(id&&eq.artifacts[kind]===id)eq.artifacts[kind]=null;a.equipment[c!.id].artifacts[kind]=id}})}
 function owner(id:string){const found=a?.characters.find(x=>a.equipment[x.id].weapon_id===id||Object.values(a.equipment[x.id].artifacts).includes(id));return found&&found.id!==c?.id?'（從'+found.name+'轉移）':''}
 const feedback=<>
   {notice&&<div className="message success" role="status"><Check size={17}/>{notice}<button onClick={()=>setNotice('')} aria-label="關閉通知"><X size={16}/></button></div>}
   {error&&<div className="message error" role="alert"><AlertTriangle size={18}/><div><strong>{error.code==='conflict'?'資料已有新版本':error.code==='connection_missing'?'完成連線，即可開始記錄':error.code==='signin_required'?'請先登入':'目前無法完成操作'}</strong><p>{error.message}{data?' 目前畫面保留上次讀取資料。':''}</p>{error.code==='signin_required'&&<a href="/signin-with-chatgpt?return_to=%2F" target="_top">使用 ChatGPT 登入</a>}{pending&&<button className="small-button" disabled={busy} onClick={check}>確認保存結果</button>}{dirty&&!pending&&<button className="small-button" onClick={readConflict} disabled={busy}>檢視最新版本</button>}{!data&&<button className="small-button" onClick={()=>setSection('connection')}>查看連線設定</button>}</div>{!dirty&&!pending&&<button className="icon-button" onClick={refresh} disabled={busy} aria-label="重新讀取"><RefreshCw size={17} className={busy?'spin':''}/></button>}</div>}
   {conflict&&data&&<div className="conflict"><h3>最新版本 {conflict.revision.slice(0,7)}</h3><p>你的草稿根據 {data.revision.slice(0,7)} 編輯。遠端變動：</p><ul>{changes(data.account,conflict.account).map((s,i)=><li key={i}>{s}</li>)}</ul><button className="secondary" onClick={download}><Download size={15}/>下載我的草稿</button><button className="secondary" onClick={()=>{if(window.confirm('使用最新版本並放棄目前草稿？'))accept(conflict)}}>使用最新版本並放棄草稿</button></div>}
 </>;
 return <MetricDisplayContext value={fullLabels}><div className={"app-shell"+(editing?" is-editing":"")}>
  <main className="main">
   {!saveOpen&&feedback}
   {section==='connection'?<section className="setup-panel"><div className="section-title"><Link2 size={22}/><h2>GitHub 連線</h2><button className="icon-button setup-close" onClick={returnToList} aria-label="關閉連線設定" title="關閉連線設定"><X size={20}/></button></div><p className="lead">almightyken0425 / genshin-account <span className="tag">main</span></p><div className="setup-grid"><article><span className="step">01</span><h3>建立專用存取權</h3><p>在 GitHub 建立 fine-grained token，只選 genshin-account，授予 Contents 讀取與寫入權限。</p><a className="secondary" target="_blank" rel="noreferrer" href="https://github.com/settings/personal-access-tokens/new?name=Genshin-Sites&target_name=almightyken0425&expires_in=90&contents=write">前往 GitHub 設定 <ArrowUpRight size={15}/></a></article><article><span className="step">02</span><h3>存放在 Sites 秘密設定</h3><p>在此 Site 的環境設定新增秘密值 <code>GITHUB_TOKEN</code>，套用設定後重新部署。網頁不接收或保存 token。</p></article><article><span className="step">03</span><h3>讀取正式角色紀錄</h3><p>連線成功後，角色現況會直接從私人 repo 讀取。每次保存都會產生可追溯的 GitHub 版本。</p><button className="primary" disabled={busy||dirty} onClick={async()=>{returnToList();await refresh()}}><RefreshCw size={16}/>重新檢查連線</button></article></div><div className="muted-box"><Shield size={18}/><p>此網站僅供本人使用。若連線過期，可更新專用 token 後重新部署。原始影片截圖與面板觀測會保留。</p></div></section>
   :!selected?<section className="roster" aria-label="角色列表"><RosterControls characters={a?.characters||[]} rarities={rarities} filters={filters} onFilters={setFilters} sorts={sorts} onSorts={setSorts}/><div className="roster-search"><label className="search"><Search size={17}/><input ref={searchRef} placeholder="搜尋角色名稱" aria-label="搜尋角色名稱" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清除搜尋" onClick={()=>setQuery('')}><X size={13}/></button>}</label></div>
    <div className="character-list">{!a?(busy?<div className="empty small"><LoaderCircle className="spin"/><p>正在讀取角色紀錄…</p></div>:<div className="empty small"><BookOpen/><p>連接 GitHub 後<br/>角色會顯示在這裡</p></div>):visible.length===0?<div className="empty small"><Search/><p>找不到符合條件的角色</p><button className="text-button" onClick={()=>{setQuery('');setFilters({rarities:[],weapons:[],elements:[]})}}>清除篩選</button></div>:visible.map(x=><button className="character-card" key={x.id} ref={el=>{if(el)cardRefs.current.set(x.id,el);else cardRefs.current.delete(x.id)}} onClick={()=>openCharacter(x.id)} aria-label={'查看'+x.name+'的角色詳情，角色等級 '+fmt(x.level.current)+'，命之座 '+fmt(x.constellation)+'，有效詞條總數 '+fmt(effectiveTotals[x.id])}><div className="character-emblem"><GameImage src={characterImage(x.id,'icon')} alt="" eager/></div><span className="character-card-stats" aria-hidden="true"><span title="角色等級">{x.level.current??'—'}</span><span title="命之座">{x.constellation??'—'}</span><span title="有效詞條總數">{effectiveTotals[x.id]??'—'}</span></span></button>)}</div></section>
   :<section className="detail detail-centered" aria-label="角色詳細資料">
    <header className={'detail-header '+(headerCollapsed?'is-collapsed':'')} onFocusCapture={()=>setHeaderCollapsed(false)}>
     <div className="character-heading"><button className="icon-button detail-back" onClick={returnToList} aria-label="返回角色列表" title="返回角色列表"><ArrowLeft size={20}/></button><h2 ref={headingRef} tabIndex={-1}>{c?.name||(busy?'讀取中':'角色詳情')}</h2></div>
     <div className="detail-navigation"><button className="icon-button mode-toggle" onClick={toggleLabels} aria-pressed={fullLabels} aria-label={fullLabels?'切換精簡模式':'切換完整模式'} title={fullLabels?'切換精簡模式':'切換完整模式'}>{fullLabels?<Shapes size={19}/>:<Tags size={19}/>}</button>{c&&data&&<button className={'icon-button edit-toggle '+(editing?'active':'')} aria-label={editing?'取消編輯':'編輯現況'} title={editing?'取消編輯':'編輯現況'} disabled={busy||!!pending} onClick={()=>{if(editing)discard();else{setEditing(true);setDraft(structuredClone(data.account))}}}><Pencil size={17}/></button>}</div>
    </header>
    {c&&a&&data?<>
     <fieldset key={c.id} disabled={busy||!!pending} className="edit-fieldset">
      <section className="character-summary" aria-label="角色與配裝">
       <div className={'portrait-stage '+c.element+(c.id==='traveler_cryo'?' portrait-icon':'')}>
        <GameImage src={characterImage(c.id,'splash')} alt={c.name+'公開角色立繪'} eager/>
        <MetricDisplayContext value={false}><div className="portrait-basics"><Numeric label="角色等級" value={c.level.current} min={1} max={c.level.cap??100} editing={edit} onChange={v=>changeCharacter(c=>c.level.current=v)}/><Numeric label="命之座" value={c.constellation} max={6} editing={edit} onChange={v=>changeCharacter(c=>c.constellation=v)}/><div className="field" title="有效詞條總數"><MetricLabel label="有效詞條總數"/><strong>{effectiveTotal??'—'}</strong></div></div></MetricDisplayContext>
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
       {expanded==='weapon'&&<div className="equipment-disclosure" key="weapon"><div className="equipment-clip"><div className="equipment-expanded" id="weapon-details" aria-label="武器詳情"><div className="expanded-weapon"><div className="equipment-identity"><div className="expanded-art"><GameImage src={w?weaponImage(w.name):undefined} alt={w?.name||'未裝備武器'}/></div><div className="item-kicker">裝備武器</div>{editing?<select aria-label="裝備武器" value={e?.weapon_id??''} onChange={ev=>equip('weapon',ev.target.value||null)}><option value="">未裝備</option>{a.weapons.filter(x=>x.weapon_type===c.weapon_type).map(x=><option key={x.id} value={x.id}>{x.name}{owner(x.id)}</option>)}</select>:fullLabels?<h3>{w?.name||'未裝備武器'}</h3>:null}{fullLabels&&w&&<div className="item-stars">{'★'.repeat(w.rarity||0)}</div>}</div><div className="weapon-content">{w&&<div className="item-fields"><Numeric label="武器等級" value={w.level.current} min={1} max={w.level.cap??90} editing={edit} onChange={v=>mutate(a=>a.weapons.find(x=>x.id===w.id)!.level.current=v)}/><Numeric label="精煉階數" value={w.refinement} min={1} max={5} editing={edit} onChange={v=>mutate(a=>a.weapons.find(x=>x.id===w.id)!.refinement=v)}/><Numeric label="基礎攻擊力" value={w.base_atk} step={0.1} editing={edit} onChange={v=>mutate(a=>a.weapons.find(x=>x.id===w.id)!.base_atk=v)}/>{w.secondary_stat&&<Numeric label={(labels[w.secondary_stat.key]||w.secondary_stat.key)+(w.secondary_stat.unit==='percent'?' (%)':'')} value={w.secondary_stat.value} step={0.1} editing={edit} onChange={v=>mutate(a=>a.weapons.find(x=>x.id===w.id)!.secondary_stat!.value=v)}/>}</div>}</div></div></div></div></div>}
       {expanded==='artifacts'&&<div className="equipment-disclosure" key="artifacts"><div className="equipment-clip"><div className="equipment-expanded" id="artifact-details" aria-label="聖遺物詳情"><div className="artifact-details-grid">{Object.entries(slots).map(([slot,label])=>{const x=a.artifacts.find(x=>x.id===e?.artifacts[slot]);return <article className={'artifact-details '+(editing?'is-editing':'')} key={slot}><div className="artifact-identity"><div className="artifact-art"><GameImage src={x?artifactImage(x.set_name,slot):undefined} alt={x?.name||label}/><EffectiveBadge count={effectiveSubstatCount(x,c.id)}/></div>{fullLabels&&<div className="artifact-ident"><div><span className="slot-label">{label}</span><h4>{x?.name||'未裝備'}</h4>{x&&<p>{x.set_name}</p>}</div></div>}{editing&&<select aria-label={label+'裝備'} value={e?.artifacts[slot]??''} onChange={ev=>equip(slot,ev.target.value||null)}><option value="">未裝備</option>{a.artifacts.filter(x=>x.slot===slot).map(x=><option value={x.id} key={x.id}>{x.name}{owner(x.id)}</option>)}</select>}</div><div className="artifact-values">{x&&<><div className="artifact-primary"><Numeric label="強化等級" value={x.level} min={0} max={artifactLevelCap(x.rarity)??20} editing={edit} onChange={v=>mutate(a=>{const ar=a.artifacts.find(ar=>ar.id===x.id)!;if(ar.level!==v){ar.level=v;ar.substat_rolls?.values.forEach(row=>row.enhancements=null)}})}/><Numeric label={(labels[x.main_stat.key]||x.main_stat.key)+(x.main_stat.unit==='percent'?' (%)':'')} value={x.main_stat.value} step={0.1} editing={edit} onChange={v=>mutate(a=>a.artifacts.find(ar=>ar.id===x.id)!.main_stat.value=v)}/></div><div className="artifact-substats">{x.substats.map((s,i)=><ArtifactSubstat key={i} stat={s} label={(labels[s.key]||s.key)+(s.unit==='percent'?' (%)':'')} roll={substatRoll(x,s.key,c.id)} editing={edit} rollEditing={edit&&a.schema_version>=2} options={artifactSubstatOptions(x,i)} onKey={key=>mutate(a=>changeArtifactSubstat(a.artifacts.find(ar=>ar.id===x.id)!,i,key))} onValue={v=>mutate(a=>{const ar=a.artifacts.find(ar=>ar.id===x.id)!;if(ar.substats[i].value!==v){ar.substats[i].value=v;if(a.schema_version>=2)editSubstatRoll(ar,c.id,s.key,{enhancements:null})}})} onRoll={patch=>mutate(a=>editSubstatRoll(a.artifacts.find(ar=>ar.id===x.id)!,c.id,s.key,patch))}/>)}</div></>}</div></article>})}</div>{editing&&<p className="footnote">轉移已被其他角色使用的裝備，會同時卸下對方的該件裝備。保存前請核對變更清單。</p>}</div></div></div>}

      </section>
      <section className="summary-surface" aria-label="人物總體數值"><div className="stats-container">{stale&&<span className="stats-state" role="img" aria-label="配裝已變更，以下數值待更新" title="配裝已變更，以下數值待更新"><AlertTriangle size={15}/></span>}<div className="summary-stats" aria-label="角色屬性">{panel?.stats.filter(s=>s.key!=='stamina').map(s=><div key={s.key}><MetricLabel label={labels[s.key]||s.key}/><strong>{show(s)}</strong></div>)}</div></div></section>
       <section className="talent-section" aria-label="天賦">
        <div className="talent-values">{(['normal','skill','burst'] as const).map((key,i)=><Numeric key={key} label={['普通攻擊','元素戰技','元素爆發'][i]} value={c.talents.displayed[key]} editing={edit} onChange={v=>changeCharacter(c=>c.talents.displayed[key]=v)}/>)}</div>
        <details className="talent-extra"><summary aria-label="展開基礎天賦與加成"><ChevronDown size={14}/>{fullLabels&&<span>基礎等級與加成</span>}</summary><div className="talent-values">{(['normal','skill','burst'] as const).map((key,i)=><Numeric key={key} label={['普通攻擊','元素戰技','元素爆發'][i]+'（基礎）'} value={c.talents.base[key]} editing={edit} onChange={v=>changeCharacter(c=>c.talents.base[key]=v)}/>)}</div><label className="field context-field"><span>加成來源</span>{editing?<textarea placeholder="未知，保留空白" value={c.talents.bonus_context??''} onChange={event=>changeCharacter(character=>character.talents.bonus_context=event.target.value||null)}/>:<p>{c.talents.bonus_context||'尚未確認'}</p>}</label></details>
       </section>
     </fieldset>


   </>:<div className="welcome">{busy?<LoaderCircle className="spin" size={26}/>:<BookOpen size={28}/>}<h2>{busy?'正在讀取角色資料':data?'找不到這位角色':'開始查看角色'}</h2><p>{busy?'連接你的 GitHub 紀錄中…':data?'請返回列表，選擇已記錄的角色。':'連線後即可查看數值、天賦和配裝。'}</p>{!busy&&!data&&<button className="primary" onClick={()=>setSection('connection')}><Link2 size={16}/>設定連線</button>}</div>}</section>}
   {editing&&data&&<SaveControls preview={!!data.preview} diff={diff} busy={busy} pending={!!pending} blocked={!!conflict||error?.code==='conflict'} open={saveOpen} onOpenChange={setSaveOpen} note={note} onNote={setNote} noteRef={noteRef} feedback={feedback} onDiscard={discard} onDownload={download} onSave={save} onCheck={check}/>}
   <footer className="page-footer"><button className="icon-button footer-settings" onClick={()=>{setSection('connection');window.scrollTo({top:0})}} aria-label="連線設定" title="連線設定"><Settings2 size={15}/></button>{dirty&&<span className="draft-status" role="status">有未保存修改</span>}<span>遊戲圖片 © HoYoverse</span><span>圖源 <a href="https://enka.network" target="_blank" rel="noreferrer">Enka Network</a><span className="footer-separator">/</span>資料索引 <a href="https://github.com/theBowja/genshin-db" target="_blank" rel="noreferrer">genshin-db</a></span></footer>
  </main>
 </div></MetricDisplayContext>
}
