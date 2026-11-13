import {useEffect,useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {ArrowLeft,ArrowUpRight,Check,LoaderCircle,RotateCcw,Save} from 'lucide-react';
import CharacterCard from '../../components/character/character_card';
import PortraitSummary from '../../components/character/portrait_summary';
import type {CharacterMetrics2,CharacterMetrics3} from '../../components/character/types';
import {effectiveRollMetric,formatEffectivePercent} from '../../components/metrics/effective_roll_metric';
import {clampView} from '../../lib/artwork_math.mjs';
import CropStage from './crop_stage';
import type {ArtworkBootstrap,ArtworkEntry,ArtworkGame,ArtworkRole,ArtworkSource,CropView} from './types';

type Route={game:ArtworkGame,role:ArtworkRole,id?:string};
type Position={scroll:number,id?:string};
const editorPages:ReadonlyArray<{game:ArtworkGame,role:ArtworkRole}>=[
 {game:'genshin',role:'roster'},{game:'genshin',role:'portrait'},
 {game:'zzz',role:'roster'},{game:'zzz',role:'portrait'},
];
class ArtworkRequestError extends Error{
 constructor(public status:number,message:string){super(message);this.name='ArtworkRequestError'}
}
const gameName=(game:ArtworkGame)=>game==='genshin'?'原神':'絕區零';
const roleName=(role:ArtworkRole)=>role==='roster'?'角色列表':'角色詳情';
const rosterMetrics=(entry:ArtworkEntry):CharacterMetrics2=>[entry.metrics[1],{label:'有效達成率',value:formatEffectivePercent(entry.metrics[2].value,entry.effectiveMaximum)}];
const portraitMetrics=(entry:ArtworkEntry):CharacterMetrics3=>[entry.metrics[0],entry.metrics[1],effectiveRollMetric(entry.metrics[2].value,entry.effectiveMaximum)];
const editLabel=(entry:ArtworkEntry)=>'編輯'+entry.name+'的'+roleName(entry.role)+'圖片，'+(entry.role==='roster'?rosterMetrics(entry):portraitMetrics(entry)).map(metric=>metric.label+' '+(metric.value===null||metric.value==='—'?'未知':metric.value)).join('，');
const overviewPath=(route:Route)=>'/'+route.game+'/'+route.role;
const sameEntry=(a:Route,b:ArtworkEntry)=>a.game===b.game&&a.role===b.role&&a.id===b.id;
const routePattern=/^\/(genshin|zzz)\/(roster|portrait)(?:\/([^/]+))?\/?$/;
function readRoute():Route{
 const match=routePattern.exec(location.pathname);
 if(!match)return {game:'genshin',role:'roster'};
 let id:string|undefined;
 try{id=match[3]?decodeURIComponent(match[3]):undefined}catch{id=match[3]}
 return {game:match[1] as ArtworkGame,role:match[2] as ArtworkRole,id};
}
async function requestJson<T>(path:string,init?:RequestInit):Promise<T>{
 const response=await fetch(path,{cache:'no-store',...init});
 const body=await response.json().catch(()=>null) as (T&{message?:string,error?:string})|null;
 if(!response.ok)throw new ArtworkRequestError(response.status,body?.message||body?.error||'無法完成操作，請重試。');
 if(!body)throw new Error('伺服器回應不完整，請重試。');
 return body;
}
const bootstrap=()=>requestJson<ArtworkBootstrap>('/__artwork_editor/bootstrap');
function previewSource(entry:ArtworkEntry){
 return entry.previewPath+(entry.previewPath.includes('?')?'&':'?')+'artwork_revision='+entry.expectedRevision;
}

export default function ArtworkEditor(){
 const [route,setRoute]=useState<Route>(readRoute),[data,setData]=useState<ArtworkBootstrap|null>(null);
 const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[notice,setNotice]=useState('');
 const [saving,setSaving]=useState(false),[saveError,setSaveError]=useState(''),[refreshNeeded,setRefreshNeeded]=useState(false);
 const [conflicts,setConflicts]=useState<string[]>([]),[readingLatest,setReadingLatest]=useState(false),[formVersion,setFormVersion]=useState(0);
 const [queries,setQueries]=useState<Record<string,string>>({});
 const routeRef=useRef(route),positions=useRef(new Map<string,Position>()),cardRefs=useRef(new Map<string,HTMLButtonElement>());
 const restore=useRef<{path:string,id?:string}|null>(null),committed=useRef<string|null>(null);
 const renderedRoute=useRef<string|null>(null);
 useLayoutEffect(()=>{routeRef.current=route},[route]);
 const currentPath=overviewPath(route),entries=data?.entries.filter(entry=>entry.game===route.game&&entry.role===route.role)??[];
 const selected=route.id?entries.find(entry=>entry.id===route.id):undefined;
 const query=queries[currentPath]??'',visible=entries.filter(entry=>(entry.name+' '+entry.id).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

 async function load(){
  setLoading(true);setLoadError('');
  try{setData(await bootstrap())}catch(error){setLoadError(error instanceof Error?error.message:'無法讀取本機編輯稿。')}
  finally{setLoading(false)}
 }
 useEffect(()=>{
  let active=true;
  bootstrap().then(value=>{if(active){setData(value);setLoadError('')}}).catch(error=>{if(active)setLoadError(error instanceof Error?error.message:'無法讀取本機編輯稿。')}).finally(()=>{if(active)setLoading(false)});
  if(!routePattern.test(location.pathname))history.replaceState({artworkEditor:true},'', '/genshin/roster');
  const previousRestoration=history.scrollRestoration;
  history.scrollRestoration='manual';
  const pop=()=>{
   const previous=routeRef.current,next=readRoute();
   if(previous.id&&!next.id&&overviewPath(previous)===overviewPath(next))restore.current={path:overviewPath(next),id:previous.id};
   setRoute(next);setSaveError('');setRefreshNeeded(false);committed.current=null;
  };
  addEventListener('popstate',pop);
  return()=>{active=false;history.scrollRestoration=previousRestoration;removeEventListener('popstate',pop)};
 },[]);
 useEffect(()=>{
  if(!data)return;
  const key=overviewPath(route)+(route.id?'/'+route.id:''),changed=renderedRoute.current!==key;
  renderedRoute.current=key;
  if(route.id){if(changed)window.scrollTo({top:0});return}
  const path=overviewPath(route),requested=restore.current?.path===path?restore.current:null;
  if(!changed&&!requested)return;
  const position=positions.current.get(path);
  const frame=requestAnimationFrame(()=>{
   window.scrollTo({top:requested?position?.scroll??0:0});
   if(requested?.id)cardRefs.current.get(path+'/'+requested.id)?.focus({preventScroll:true});
   if(requested)restore.current=null;
  });
  return()=>cancelAnimationFrame(frame);
 },[route,data]);

 function navigateOverview(game:ArtworkGame,role:ArtworkRole,event?:MouseEvent<HTMLAnchorElement>){
  if(event&&(event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||event.button!==0))return;
  event?.preventDefault();
  if(saving||refreshNeeded||readingLatest)return;
  if(!route.id)positions.current.set(currentPath,{scroll:window.scrollY});
  const next={game,role};
  if(!route.id&&currentPath===overviewPath(next))return;
  history.pushState({artworkEditor:true},'',overviewPath(next));
  setRoute(next);setSaveError('');setRefreshNeeded(false);committed.current=null;setNotice('');
 }
 function open(entry:ArtworkEntry){
  if(saving||readingLatest)return;
  positions.current.set(currentPath,{scroll:window.scrollY,id:entry.id});
  history.pushState({artworkEditor:true,fromOverview:currentPath},'',currentPath+'/'+encodeURIComponent(entry.id));
  setRoute({game:entry.game,role:entry.role,id:entry.id});setNotice('');setSaveError('');setRefreshNeeded(false);committed.current=null;
 }
 function returnToOverview(entry?:ArtworkEntry){
  const target=entry??route,current=overviewPath(target);
  restore.current={path:current,id:target.id};
  if(history.state?.fromOverview===current){history.back();return}
  history.replaceState({artworkEditor:true},'',current);
  setRoute({game:target.game,role:target.role});setSaveError('');setRefreshNeeded(false);committed.current=null;
 }
 async function save(entry:ArtworkEntry,source:ArtworkSource,view:CropView){
  if(saving)return;
  setSaving(true);setSaveError('');
  const key=overviewPath(entry)+'/'+entry.id;
  try{
   if(committed.current!==key){
    await requestJson('/__artwork_editor/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game:entry.game,role:entry.role,id:entry.id,sourcePath:source.path,sourceSha256:source.sha256,view:clampView(view),expectedRevision:entry.expectedRevision})});
    committed.current=key;
   }
   const latest=await bootstrap();
   setData(latest);setRefreshNeeded(false);committed.current=null;
   setNotice(entry.name+'的'+roleName(entry.role)+'圖片已儲存到本機編輯稿，尚未部署。');
   if(sameEntry(routeRef.current,entry))returnToOverview(entry);
  }catch(error){
   const message=error instanceof Error?error.message:'無法儲存構圖。';
   if(error instanceof ArtworkRequestError&&error.status===409)setConflicts(current=>current.includes(key)?current:[...current,key]);
   const saved=committed.current===key;
   setRefreshNeeded(saved);
   setSaveError(saved?'構圖已儲存，但重新讀取失敗。請重試讀取後返回。 '+message:message+' 目前調整仍保留在畫面中。');
  }finally{setSaving(false)}
 }
 async function readLatest(entry:ArtworkEntry){
  if(saving||readingLatest)return;
  setReadingLatest(true);
  try{
   const latest=await bootstrap();
   if(!latest.entries.some(value=>value.game===entry.game&&value.role===entry.role&&value.id===entry.id))throw new Error('最新編輯稿中找不到這位角色。');
   setData(latest);setConflicts([]);setSaveError('');setRefreshNeeded(false);committed.current=null;
   if(sameEntry(routeRef.current,entry))setFormVersion(current=>current+1);
  }catch(error){
   const message=error instanceof Error?error.message:'無法讀取最新編輯稿。';
   setSaveError('讀取最新構圖失敗。尚未儲存的調整仍保留。 '+message);
  }finally{setReadingLatest(false)}
 }

 return <div className={'artwork-editor'+(route.id?' artwork-editor--editing':'')}>
  {!route.id&&<>
  <header className="artwork-editor__header">
   <div><h1>圖片構圖編輯器</h1><p>使用網站共用圖框，調整每位角色的圖片。</p></div>
   <div className="artwork-editor__header-actions"><span className="artwork-editor__draft-status">本機編輯稿 · 尚未部署</span>{data&&<a className="artwork-editor__preview-link" href={data.websitePreviewUrl} target="_blank" rel="noreferrer">完整網站預覽<ArrowUpRight size={17}/></a>}</div>
  </header>
  <nav className="artwork-editor__tabs" aria-label="圖片類型">
   {editorPages.map(({game,role})=><a key={game+'/'+role} href={'/'+game+'/'+role} aria-current={route.game===game&&route.role===role?'page':undefined} aria-disabled={saving||refreshNeeded||readingLatest||undefined} onClick={event=>navigateOverview(game,role,event)}><span className="artwork-editor__game-letter" aria-hidden="true">{game==='genshin'?'G':'Z'}</span><span>{gameName(game)}<small>{roleName(role)}</small></span></a>)}
  </nav>
  </>}
  <main className="artwork-editor__main">
   {notice&&<p className="artwork-editor__notice" role="status"><Check size={17}/>{notice}</p>}
   {loadError&&<div className="artwork-editor__error" role="alert"><p>{loadError}</p><button type="button" className="artwork-editor__secondary" disabled={loading} onClick={()=>void load()}>重新讀取</button></div>}
   {loading&&!data?<div className="artwork-editor__empty" role="status"><LoaderCircle className="spin" size={24}/><p>正在讀取本機圖片設定…</p></div>:data&&route.id?selected?<EntryEditor key={currentPath+'/'+selected.id+'/'+formVersion} entry={selected} websitePreviewUrl={data.websitePreviewUrl} saving={saving} error={saveError} refreshNeeded={refreshNeeded} conflict={conflicts.includes(currentPath+'/'+selected.id)} readingLatest={readingLatest} onReadLatest={()=>void readLatest(selected)} onCancel={()=>returnToOverview(selected)} onSave={(source,view)=>void save(selected,source,view)}/>:<div className="artwork-editor__empty"><h2>找不到這位角色</h2><p>此角色沒有對應的圖片設定。</p><button type="button" className="artwork-editor__secondary" onClick={()=>returnToOverview()}><ArrowLeft size={17}/>返回總覽</button></div>:data&&<>
    <div className="artwork-editor__overview-heading"><div><h2>{gameName(route.game)} · {roleName(route.role)}</h2><p>{entries.length} 位角色 · {route.role==='roster'?'3:4 近景大卡':'1:1 詳情圖框'} · 點選圖片調整構圖</p></div><label className="artwork-editor__search"><span>搜尋角色</span><input type="search" placeholder="名稱或角色 ID" value={query} onChange={event=>setQueries(current=>({...current,[currentPath]:event.target.value}))}/></label></div>
    <div className="artwork-editor__grid">
     {visible.map(entry=><article className="artwork-editor__preview-card" key={entry.id}>
      {route.role==='roster'?<CharacterCard ref={node=>{const key=currentPath+'/'+entry.id;if(node)cardRefs.current.set(key,node);else cardRefs.current.delete(key)}} name={entry.name} image={{src:previewSource(entry),alt:entry.name}} metrics={rosterMetrics(entry)} disabled={saving||readingLatest} aria-label={editLabel(entry)} onClick={()=>open(entry)}/>:<button type="button" className="artwork-editor__portrait-card" ref={node=>{const key=currentPath+'/'+entry.id;if(node)cardRefs.current.set(key,node);else cardRefs.current.delete(key)}} disabled={saving||readingLatest} aria-label={editLabel(entry)} onClick={()=>open(entry)}><PortraitSummary image={{src:previewSource(entry),alt:entry.name}} metrics={portraitMetrics(entry)}/></button>}
      <span className="artwork-editor__character-name">{entry.name}</span>
     </article>)}
    </div>
    {!visible.length&&<div className="artwork-editor__empty"><p>找不到符合的角色。</p><button type="button" className="artwork-editor__secondary" onClick={()=>setQueries(current=>({...current,[currentPath]:''}))}>清除搜尋</button></div>}
   </>}
  </main>
 </div>;
}

function EntryEditor({entry,websitePreviewUrl,saving,error,refreshNeeded,conflict,readingLatest,onReadLatest,onCancel,onSave}:{entry:ArtworkEntry,websitePreviewUrl:string,saving:boolean,error:string,refreshNeeded:boolean,conflict:boolean,readingLatest:boolean,onReadLatest:()=>void,onCancel:()=>void,onSave:(source:ArtworkSource,view:CropView)=>void}){
 const [sourcePath,setSourcePath]=useState(entry.sourcePath),[view,setView]=useState<CropView>(()=>clampView(entry.view));
 const views=useRef(new Map<string,CropView>()),headingRef=useRef<HTMLHeadingElement>(null);
 const source=entry.sources.find(source=>source.path===sourcePath),locked=saving||refreshNeeded||readingLatest;
 useEffect(()=>{headingRef.current?.focus({preventScroll:true})},[]);
 function choose(path:string){
  views.current.set(sourcePath,view);
  setSourcePath(path);
  setView(views.current.get(path)??clampView(path===entry.sourcePath?entry.view:path===entry.defaultSourcePath?entry.defaultView:{zoom:1,offsetX:0,offsetY:0}));
 }
 function reset(){
  views.current.clear();setSourcePath(entry.defaultSourcePath);setView(clampView(entry.defaultView));
 }
 return <form className="artwork-editor__edit" onSubmit={event=>{event.preventDefault();if(source&&!saving&&!readingLatest&&!conflict)onSave(source,view)}}>
  <header className="artwork-editor__edit-header">
   <div><p className="artwork-editor__eyebrow">{gameName(entry.game)} · {roleName(entry.role)}<span className="artwork-editor__inline-draft">本機編輯稿 · 尚未部署</span></p><h2 ref={headingRef} tabIndex={-1}>{entry.name}</h2>{refreshNeeded&&<p className="artwork-editor__unsaved">構圖已儲存，等待重新讀取。</p>}</div>
   <div className="artwork-editor__edit-actions"><a className="artwork-editor__edit-preview-link" href={websitePreviewUrl} target="_blank" rel="noreferrer" aria-label="開啟完整網站預覽"><ArrowUpRight size={18}/><span>網站預覽</span></a><button type="button" className="artwork-editor__secondary" disabled={locked} onClick={onCancel}>取消</button><button type="submit" className="artwork-editor__primary" disabled={saving||readingLatest||conflict||!source}>{saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>}<span>{saving?'儲存中…':refreshNeeded?'重新讀取並返回':'儲存構圖'}</span></button></div>
  </header>
  {(error||conflict)&&<div className="artwork-editor__error" role="alert"><div><p>{error||'這張圖片已有較新的編輯稿。目前調整仍保留。'}</p>{conflict&&<p>讀取最新構圖會取代畫面上尚未儲存的調整。</p>}</div>{conflict&&<button type="button" className="artwork-editor__secondary" disabled={saving||readingLatest} onClick={onReadLatest}>{readingLatest?<LoaderCircle className="spin" size={17}/>:<RotateCcw size={17}/>}<span>{readingLatest?'讀取中…':'讀取最新構圖'}</span></button>}</div>}
  <div className="artwork-editor__source-controls">
   <label className="artwork-editor__source-select"><span>原圖來源</span><select value={sourcePath} disabled={locked} onChange={event=>choose(event.target.value)}>{entry.sources.map(source=><option key={source.path} value={source.path}>{source.label} · {source.width} × {source.height}</option>)}</select></label>
   <button type="button" className="artwork-editor__secondary" disabled={locked} onClick={reset}><RotateCcw size={17}/>重設位置</button>
  </div>
  {source?<><p className="artwork-editor__source-info">原圖 {source.width.toLocaleString()} × {source.height.toLocaleString()} px · 遮罩內為保留區域，外側原圖只供對照。</p><CropStage source={source} role={entry.role} view={view} onChange={setView} disabled={locked}/></>:<div className="artwork-editor__error" role="alert">找不到目前的原圖。請選擇來源，或按重設位置。</div>}
 </form>;
}
