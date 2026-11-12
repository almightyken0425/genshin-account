'use client';

import {useState} from 'react';
import {Shapes,Tags} from 'lucide-react';
import {zzzCharacterImage,zzzEngineImage,zzzDiscImage} from '@/lib/zzz_assets';
import CenteredHeader from '@/components/navigation/centered_header';
import MetricLabel,{MetricDisplayContext} from '@/components/metrics/metric_label';
import MetricValue from '@/components/metrics/metric_value';
import PortraitSummary from '@/components/character/portrait_summary';
import ArtifactSubstat,{EffectiveBadge} from '@/components/equipment/artifact_substat';
import EquipmentTile from '@/components/equipment/equipment_tile';
import ZzzEquipmentImage from '@/components/games/zzz/equipment_image';
import {effectiveDiscCount,effectiveDiscLoadout,discSlots} from '@/lib/zzz_discs.mjs';
import {zzzNote} from '@/lib/zzz_notes.mjs';
import type {ZzzAgent} from '@/lib/zzz_types';

const show=(value:string|number|null|undefined)=>value==null?'—':typeof value==='number'?value.toLocaleString('zh-TW',{maximumFractionDigits:2}):value;
function Field({label,value}:{label:string,value:string|number|null|undefined}){
 return <MetricValue label={label} value={show(value)}/>;
}

export default function ZzzCharacterDetail({character,onBack,sourceName}:{character:ZzzAgent,onBack:()=>void,sourceName?:string}){
 const [fullLabels,setFullLabels]=useState(false),[expanded,setExpanded]=useState<'engine'|'discs'|null>(null);
 const weapon=character.wEngine;
 const engineImage=zzzEngineImage(weapon?.name);
 const sets=Array.from(new Set((character.driveDiscs||[]).map(disc=>disc.setName).filter((name):name is string=>!!name)));
 return <MetricDisplayContext value={fullLabels}><section className="detail detail-centered zzz-detail" aria-label="角色詳細資料">
  <CenteredHeader title={character.name} onBack={onBack} backLabel="返回角色列表" action={<button className="icon-button mode-toggle" aria-label={fullLabels?'切換精簡模式':'切換完整模式'} aria-pressed={fullLabels} onClick={()=>setFullLabels(!fullLabels)}>{fullLabels?<Shapes size={19}/>:<Tags size={19}/>}</button>}/>
  {fullLabels&&<p className="zzz-classification">{[character.element,character.specialty].filter(Boolean).join(' · ')}</p>}
  <section className="character-summary" aria-label="角色與配裝">
   <PortraitSummary image={{src:zzzCharacterImage(character.id,'splash'),alt:character.name,eager:true}} metrics={[{label:'角色等級',value:character.level},{label:'影畫',value:character.mindscape},{label:'有效詞條總數',value:effectiveDiscLoadout(character.driveDiscs)}]}/>
   <div className="loadout-overview" aria-label="音擎與驅動盤">
    <EquipmentTile label="音擎" aria-label={'展開音擎詳情：'+(weapon?.name||'尚未確認')} aria-expanded={expanded==='engine'} aria-controls="engine-details" onClick={()=>setExpanded(expanded==='engine'?null:'engine')}>
     <ZzzEquipmentImage src={engineImage} alt={weapon?.name||'音擎'} kind="engine"/>
    </EquipmentTile>
    <EquipmentTile label="驅動盤" aria-label="展開驅動盤詳情" aria-expanded={expanded==='discs'} aria-controls="disc-details" onClick={()=>setExpanded(expanded==='discs'?null:'discs')}>
     <span className="zzz-equipment-sets">{sets.length?sets.map(name=><span className="zzz-set-art" key={name}><ZzzEquipmentImage src={zzzDiscImage(name)} alt={name} kind="disc"/></span>):<span className="zzz-set-art"><ZzzEquipmentImage alt="驅動盤" kind="disc"/></span>}</span>
    </EquipmentTile>
   </div>
  </section>
  <section className="loadout" aria-label="配裝詳情">
   {expanded==='engine'&&<div className="equipment-expanded" id="engine-details" aria-label="音擎詳情"><div className="expanded-weapon">
    <div className="equipment-identity"><ZzzEquipmentImage src={engineImage} alt={weapon?.name||'音擎'} kind="engine"/>{fullLabels&&<h3>{weapon?.name||'尚未確認'}</h3>}</div>
    <div className="weapon-content">{weapon?<div className="item-fields"><Field label="音擎等級" value={weapon.level}/><Field label="精煉階數" value={weapon.refinement}/>{Object.entries(weapon.stats||{}).map(([label,value])=><Field key={label} label={label} value={value}/>)}</div>:<p className="zzz-unconfirmed">尚未確認</p>}</div>
   </div></div>}
   {expanded==='discs'&&<div className="equipment-expanded" id="disc-details" aria-label="驅動盤詳情"><div className="artifact-details-grid">
    {discSlots(character.driveDiscs).map(({slot,disc})=><article className="artifact-details zzz-disc-details" key={slot} aria-label={'驅動盤 '+slot}>
     <header className="zzz-disc-heading"><span>{slot}號驅動盤</span><span className="zzz-disc-divider" aria-hidden="true">·</span><span className="zzz-disc-effectiveness">有效詞條 <EffectiveBadge count={effectiveDiscCount(disc)}/></span></header>
     <div className="artifact-identity"><div className="zzz-disc-picture"><ZzzEquipmentImage src={zzzDiscImage(disc?.setName)} alt={disc?.setName||'驅動盤'} kind="disc"/></div>{fullLabels&&<div className="artifact-ident"><h4>{disc?.setName||'尚未確認'}</h4></div>}</div>
     <div className="artifact-values">{disc?<>
      <div className="artifact-primary"><Field label="強化等級" value={disc.level}/><Field label={disc.mainStat?.name||'主詞條'} value={disc.mainStat?.value==null?null:show(disc.mainStat.value)+(disc.mainStat.unit==='percent'?'%':disc.mainStat.unit===null?' 單位待核':'')}/></div>
      <div className="artifact-substats">{disc.substats.map((stat,index)=><ArtifactSubstat key={index} stat={{key:stat.name||String(index),value:stat.value,unit:stat.unit}} label={(stat.name||'副詞條待核')+(stat.unit==='percent'?' (%)':'')} roll={{key:stat.name||String(index),enhancements:stat.enhancementCount,effective:stat.isEffective}}/>)}</div>
     </>:<p className="zzz-unconfirmed">尚未確認</p>}</div>
    </article>)}
   </div></div>}
  </section>
  <section className="summary-surface" aria-label="人物總體數值"><div className="stats-container"><div className="summary-stats">{Object.entries(character.stats||{}).map(([label,value])=><div key={label} className={character.statsEffective?.[label]===true?'is-effective':undefined} aria-label={character.statsEffective?.[label]===true?label+'，已確認有效':label}><MetricLabel label={label}/><strong>{show(value)}</strong></div>)}</div></div></section>
  <section className="talent-section" aria-label="技能">{character.skills?<div className="talent-values">{Object.entries(character.skills).map(([label,value])=><Field key={label} label={label} value={value}/>)}</div>:<p className="zzz-unconfirmed">技能尚未確認</p>}</section>
  {!!character.uncertainties?.length&&<div className="zzz-notes">{character.uncertainties.map((note,index)=><p key={index}>{zzzNote(note)}</p>)}</div>}
  <details className="zzz-evidence"><summary>影片來源</summary><p>{sourceName}</p><p>{character.evidence.map(evidence=>(evidence.timestampToleranceSec?'約 ':'')+Math.floor(evidence.timestampSec/60)+':'+String(Math.floor(evidence.timestampSec%60)).padStart(2,'0')).join(' · ')}</p></details>
 </section></MetricDisplayContext>;
}
