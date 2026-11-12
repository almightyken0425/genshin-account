import {useEffect,useId,useLayoutEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent,type KeyboardEvent} from 'react';
import {ChevronDown,ChevronUp,Grid3X3,Minus,Plus,Scan} from 'lucide-react';
import {clampView,frameSize,imagePlacement,zoomView} from '../../lib/artwork_math.mjs';
import type {ArtworkRole,ArtworkSource,CropView} from './types';

type Point={x:number,y:number};
type PanGesture={kind:'pan',view:CropView,point:Point};
type PinchGesture={kind:'pinch',view:CropView,midpoint:Point,distance:number};
type Props={source:ArtworkSource,role:ArtworkRole,view:CropView,onChange:(view:CropView)=>void,disabled?:boolean};
const minimumZoom=.1,maximumZoom=20;
const integerZoom=(value:number)=>Math.min(maximumZoom,Math.max(minimumZoom,Math.round(value*100)/100));
const midpoint=(a:Point,b:Point)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);

export default function CropStage({source,role,view,onChange,disabled=false}:Props){
 const stageRef=useRef<HTMLDivElement>(null),frameRef=useRef<HTMLDivElement>(null),imageRef=useRef<HTMLImageElement>(null);
 const points=useRef(new Map<number,Point>()),gesture=useRef<PanGesture|PinchGesture|null>(null);
 const currentView=useRef(view),change=useRef(onChange),locked=useRef(disabled);
 const [imageStatus,setImageStatus]=useState<'loading'|'ready'|'error'>('loading'),[grid,setGrid]=useState(false);
 const [zoomInput,setZoomInput]=useState<string|null>(null),zoomPercent=Math.round(view.zoom*100);
 const helpId=useId(),frame=frameSize(role);
 useLayoutEffect(()=>{currentView.current=view;change.current=onChange;locked.current=disabled},[view,onChange,disabled]);
 const placement=imagePlacement({width:source.width,height:source.height},view,frame);
 const imageStyle:CSSProperties={left:placement.left/frame.width*100+'%',top:placement.top/frame.height*100+'%',width:placement.width/frame.width*100+'%',height:placement.height/frame.height*100+'%'};
 const frameStyle={'--artwork-editor-frame-ratio':frame.width/frame.height} as CSSProperties;

 useEffect(()=>{
  const image=imageRef.current;
  setImageStatus(image?.complete?(image.naturalWidth?'ready':'error'):'loading');
  points.current.clear();gesture.current=null;
 },[source.path,source.sha256]);
 function update(next:CropView){
  const safe=clampView(next);
  currentView.current=safe;
  change.current(safe);
 }
 function zoom(next:number,anchorX=.5,anchorY=.5){
  const safe=integerZoom(next);
  update(zoomView(currentView.current,safe,anchorX,anchorY));
  restartGesture();
 }
 function stepZoom(points:number){
  setZoomInput(null);
  zoom((Math.round(currentView.current.zoom*100)+points)/100);
 }
 function commitZoom(){
  if(zoomInput!==null&&/^\d+$/.test(zoomInput))zoom(Number(zoomInput)/100);
  setZoomInput(null);
 }
 function editZoom(value:string){
  if(!/^\d*$/.test(value))return;
  if(value!==''&&Number(value)>maximumZoom*100){setZoomInput(String(maximumZoom*100));zoom(maximumZoom);return}
  setZoomInput(value);
  if(value!==''&&Number(value)>=minimumZoom*100)zoom(Number(value)/100);
 }
 function numberKey(event:KeyboardEvent<HTMLInputElement>){
  if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();stepZoom(event.key==='ArrowUp'?1:-1)}
  else if(event.key==='Enter'){event.preventDefault();commitZoom()}
  else if(event.key==='Escape'){event.preventDefault();setZoomInput(null)}
  else if(['.',',','e','E','+','-'].includes(event.key))event.preventDefault();
 }
 useEffect(()=>{
  const stage=stageRef.current;
  if(!stage)return;
  const wheel=(event:WheelEvent)=>{
   if(locked.current)return;
   event.preventDefault();
   const rect=frameRef.current?.getBoundingClientRect();
   if(!rect?.width||!rect.height)return;
   const anchorX=Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width)),anchorY=Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height));
   const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?rect.height:1);
   const next=integerZoom(currentView.current.zoom*Math.exp(-delta*.0015));
   const safe=clampView(zoomView(currentView.current,next,anchorX,anchorY));
   currentView.current=safe;change.current(safe);setZoomInput(null);restartGesture();
  };
  stage.addEventListener('wheel',wheel,{passive:false});
  return()=>stage.removeEventListener('wheel',wheel);
 },[]);
 function restartGesture(){
  const positions=[...points.current.values()];
  gesture.current=positions.length>1?{kind:'pinch',view:{...currentView.current},midpoint:midpoint(positions[0],positions[1]),distance:Math.max(1,distance(positions[0],positions[1]))}:positions.length?{kind:'pan',view:{...currentView.current},point:positions[0]}:null;
 }
 function start(event:ReactPointerEvent<HTMLDivElement>){
  if(disabled||event.button!==0)return;
  event.preventDefault();
  event.currentTarget.focus({preventScroll:true});
  event.currentTarget.setPointerCapture(event.pointerId);
  points.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
  restartGesture();
 }
 function move(event:ReactPointerEvent<HTMLDivElement>){
  if(disabled||!points.current.has(event.pointerId))return;
  event.preventDefault();
  points.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
  const active=gesture.current,rect=frameRef.current?.getBoundingClientRect();
  if(!active||!rect?.width||!rect.height)return;
  if(active.kind==='pan'){
   const point=[...points.current.values()][0];
   update({...active.view,offsetX:active.view.offsetX+(point.x-active.point.x)/rect.width,offsetY:active.view.offsetY+(point.y-active.point.y)/rect.height});
  }else{
   const positions=[...points.current.values()];
   if(positions.length<2){restartGesture();return}
   const centre=midpoint(positions[0],positions[1]);
   const next=integerZoom(active.view.zoom*distance(positions[0],positions[1])/active.distance);
   const anchored=zoomView(active.view,next,(active.midpoint.x-rect.left)/rect.width,(active.midpoint.y-rect.top)/rect.height);
   update({...anchored,offsetX:anchored.offsetX+(centre.x-active.midpoint.x)/rect.width,offsetY:anchored.offsetY+(centre.y-active.midpoint.y)/rect.height});
  }
 }
 function end(event:ReactPointerEvent<HTMLDivElement>){
  points.current.delete(event.pointerId);
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  restartGesture();
 }
 function keyboard(event:KeyboardEvent<HTMLDivElement>){
  if(disabled)return;
  const step=event.shiftKey ? .05 : .01,current=currentView.current;
  if(event.key==='ArrowLeft'){event.preventDefault();update({...current,offsetX:current.offsetX-step})}
  else if(event.key==='ArrowRight'){event.preventDefault();update({...current,offsetX:current.offsetX+step})}
  else if(event.key==='ArrowUp'){event.preventDefault();update({...current,offsetY:current.offsetY-step})}
  else if(event.key==='ArrowDown'){event.preventDefault();update({...current,offsetY:current.offsetY+step})}
  else if(event.key==='+'||event.key==='='){event.preventDefault();stepZoom(4)}
  else if(event.key==='-'){event.preventDefault();stepZoom(-4)}
  else if(event.key==='Home'){event.preventDefault();update({zoom:1,offsetX:0,offsetY:0})}
 }
 return <section className="artwork-editor__crop" aria-label="圖片位置與縮放">
  <div ref={stageRef} className={'artwork-editor__stage'+(disabled?' artwork-editor__stage--locked':'')} role="group" aria-label="拖曳原圖調整位置" aria-describedby={helpId} tabIndex={disabled?-1:0} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={event=>{if(points.current.has(event.pointerId)){points.current.delete(event.pointerId);restartGesture()}}} onKeyDown={keyboard}>
   <div ref={frameRef} className={'artwork-editor__crop-frame'+(grid?' artwork-editor__crop-frame--grid':'')} style={frameStyle}>
    <img ref={imageRef} key={source.path+source.sha256} src={source.path} alt={source.label} draggable={false} className="artwork-editor__source-image" style={imageStyle} onLoad={()=>setImageStatus('ready')} onError={()=>setImageStatus('error')}/>
    <span className="artwork-editor__crop-mask" aria-hidden="true"/>
    {grid&&<span className="artwork-editor__crop-grid" aria-hidden="true"/>}
   </div>
   <span className="artwork-editor__frame-note" aria-hidden="true">保留區域 {role==='roster'?'3:4':'1:1'}</span>
   {imageStatus==='loading'&&<span className="artwork-editor__image-status" role="status">正在載入原圖…</span>}
   {imageStatus==='error'&&<span className="artwork-editor__image-status artwork-editor__image-status--error" role="alert">原圖無法載入，請重新選擇來源。</span>}
  </div>
  <div className="artwork-editor__zoom-controls">
   <button type="button" className="artwork-editor__square-button" aria-label="縮小圖片" title="縮小 4%" disabled={disabled||zoomPercent<=minimumZoom*100} onClick={()=>stepZoom(-4)}><Minus size={18}/></button>
   <input type="range" min={minimumZoom*100} max={maximumZoom*100} step="1" value={zoomPercent} disabled={disabled} aria-label="圖片縮放" aria-valuetext={zoomPercent+'%'} onChange={event=>{setZoomInput(null);zoom(Number(event.target.value)/100)}}/>
   <button type="button" className="artwork-editor__square-button" aria-label="放大圖片" title="放大 4%" disabled={disabled||zoomPercent>=maximumZoom*100} onClick={()=>stepZoom(4)}><Plus size={18}/></button>
   <div className="artwork-editor__zoom-number">
    <input className="artwork-editor__zoom-input" type="number" inputMode="numeric" min={minimumZoom*100} max={maximumZoom*100} step="1" aria-label="縮放百分比" value={zoomInput??String(zoomPercent)} disabled={disabled} onChange={event=>editZoom(event.target.value)} onBlur={commitZoom} onKeyDown={numberKey}/>
    <span aria-hidden="true">%</span>
    <div className="artwork-editor__zoom-steppers">
     <button type="button" className="artwork-editor__zoom-step-button" aria-label="增加縮放 1%" disabled={disabled||zoomPercent>=maximumZoom*100} onClick={()=>stepZoom(1)}><ChevronUp size={14}/></button>
     <button type="button" className="artwork-editor__zoom-step-button" aria-label="減少縮放 1%" disabled={disabled||zoomPercent<=minimumZoom*100} onClick={()=>stepZoom(-1)}><ChevronDown size={14}/></button>
    </div>
   </div>
   <button type="button" className="artwork-editor__tool-button" disabled={disabled} onClick={()=>update({zoom:1,offsetX:0,offsetY:0})}><Scan size={17}/>顯示全圖</button>
   <button type="button" className="artwork-editor__tool-button" disabled={disabled} aria-pressed={grid} onClick={()=>setGrid(!grid)}><Grid3X3 size={17}/>格線</button>
  </div>
  <p className="artwork-editor__help" id={helpId}>拖曳移動，滾輪或雙指縮放。鍵盤方向鍵可微調位置，按住 Shift 可加大移動幅度。</p>
 </section>;
}
