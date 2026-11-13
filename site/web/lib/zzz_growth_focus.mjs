import {effectiveDiscCount} from './zzz_discs.mjs';

const sources={
 ju_fufu:[{title:'橘福福・HoYoWiki技能表',url:'https://wiki.hoyolab.com/pc/zzz/entry/750?lang=zh-tw'},{title:'橘福福・Prydwen培養分析',url:'https://www.prydwen.gg/zenless/characters/ju-fufu'}],
 yanagi:[{title:'月城柳・Prydwen培養分析',url:'https://www.prydwen.gg/zenless/characters/yanagi'}],
 miyabi:[{title:'星見雅・Prydwen培養分析',url:'https://www.prydwen.gg/zenless/characters/miyabi'}],
 pyrois:[{title:'佩洛伊斯・Prydwen培養分析',url:'https://www.prydwen.gg/zenless/characters/pyrois'}],
};
const expectedTokens={yanagi:'8a178cdf',miyabi:'6538c121',pyrois:'7ac89e9e'};
const order=(left,right)=>left<right?-1:left>right?1:0;
const entries=object=>Object.entries(object??{}).sort(([left],[right])=>order(left,right));
const stat=entry=>entry?[entry.name??null,entry.value??null,entry.unit??null]:null;

/** A non-security change detector; the account remains the only source of current values. */
export function growthFocusObservationToken(character){
 const engine=character.wEngine;
 const context=JSON.stringify({
  mindscape:character.mindscape??null,
  engine:engine?[engine.name??null,engine.level??null,engine.maxLevel??null,engine.refinement??null,engine.rarity??null,entries(engine.stats)]:null,
  stats:entries(character.stats),
  discs:Array.isArray(character.driveDiscs)?[...character.driveDiscs].sort((left,right)=>left.slot-right.slot).map(disc=>[
   disc.id,disc.slot,disc.setName??null,disc.rarity??null,disc.level??null,stat(disc.mainStat),disc.substatsComplete,
   [...disc.substats].sort((left,right)=>order(left.name+'|'+left.unit,right.name+'|'+right.unit)).map(row=>[...stat(row),row.isEffective??null,row.enhancementCount??null]),
  ]):null,
 });
 let hash=2166136261;
 for(let index=0;index<context.length;index++)hash=Math.imul(hash^context.charCodeAt(index),16777619);
 return (hash>>>0).toString(16).padStart(8,'0');
}
const value=input=>input==null?'待核對':typeof input==='number'?input.toLocaleString('zh-TW',{maximumFractionDigits:2}):String(input);
const discAt=(character,slot)=>character.driveDiscs?.find(disc=>disc.slot===slot);
const main=disc=>disc?.mainStat?.value==null?'主詞條待核對':disc.mainStat.name+value(disc.mainStat.value)+(disc.mainStat.unit==='percent'?'%':'');
const pct=input=>typeof input==='number'&&Number.isFinite(input)?input:typeof input==='string'&&/^\d+(?:\.\d+)?%$/.test(input)?Number(input.slice(0,-1)):null;
const base=(character,id,title)=>({id:character.id+'/'+id,characterId:character.id,title,kind:'upgrade',priority:'優先',sources:sources[character.id]});
const changed=(character,id,title)=>({...base(character,id,title+'・需重評估'),kind:'verify',priority:undefined,detail:['目前資料或配裝已不符合本次盤點條件。先重新核對盤面、音擎、影畫與面板，再安排替換；不沿用舊觀測數字。']});

function juFufu(character){
 const advice=base(character,'skill-training-普通攻擊','普通攻擊'),current=character.skills?.['普通攻擊'];
 const known=Number.isInteger(current)&&current>=0&&current<=20;
 if(!known||character.mindscape!==0)return {...advice,kind:'verify',priority:undefined,current:known?current:null,target:11,detail:['普通攻擊顯示等級或影畫條件待核對，先確認技能頁後再安排11級目標。']};
 const complete=current>=11;
 return {...advice,kind:complete?'complete':'upgrade',priority:complete?undefined:'優先',current,target:11,
  main:current===6?'虎威失衡倍率 85.3% → 101.3%':undefined,
  context:complete?'普通攻擊已達本次11級目標。':current===6?'僅該招失衡倍率約提升18.8%，不代表整隊提升。':undefined,
  detail:[current===6?'虎威使用普通攻擊項的失衡倍率，先由6級補至11級。':'官方等級對照為6級85.3%、11級101.3%；此對照不冒充目前等級至11級的增幅計算。','約18.8%僅指上述同招倍率，不代表整隊失衡速度或傷害增加同樣比例。','其他技能依目前觀測與原有目標檢視，閃避不必同步升滿。'],
 };
}
function yanagi(character){
 const id='focus-discs-5-6',title='先改善5號、6號盤的副詞條';
 if(growthFocusObservationToken(character)!==expectedTokens.yanagi)return changed(character,id,title);
 const fifth=discAt(character,5),sixth=discAt(character,6);
 return {...base(character,id,title),main:'保留電傷與異常掌控主詞條',tags:['異常精通','攻擊力 %'],
  context:'5號有效 '+value(effectiveDiscCount(fifth))+'、6號有效 '+value(effectiveDiscCount(sixth))+'；攻擊 '+value(character.stats?.['攻擊力'])+'、精通 '+value(character.stats?.['異常精通'])+'。',
  detail:['5號保留'+main(fifth)+'，6號保留'+main(sixth)+'，維持4混沌爵士加2自由藍調。','先找同主詞條、帶異常精通與攻擊力%的替換盤。每件至少3個已標記有效詞條可作本次刷取中繼目標，不是遊戲門檻。','0僅指目前帳號的有效標記；固定攻擊與穿透仍可能提供少量傷害。'],
 };
}
function miyabi(character){
 const id='focus-disc-4',title='保留4號暴率主詞條，補強副詞條';
 if(growthFocusObservationToken(character)!==expectedTokens.miyabi)return changed(character,id,title);
 const fourth=discAt(character,4),rate=pct(character.stats?.['暴擊率']);
 return {...base(character,id,title),main:main(fourth),tags:['暴擊傷害','攻擊力 %'],
  context:'4號有效 '+value(effectiveDiscCount(fourth))+'；面板暴率 '+value(character.stats?.['暴擊率'])+'、暴傷 '+value(character.stats?.['暴擊傷害'])+'。',
  detail:['維持4折枝劍歌加2啄木鳥電音，先替換4號盤的副詞條，不因她屬異常角色就改成精通主詞條。','折枝四件效果觸發時另加12%暴率；目前'+value(character.stats?.['暴擊率'])+'加上12%為'+(rate===null?'待核對':value(Math.round((rate+12)*10)/10)+'%')+'。雅核心的暴率轉異常積蓄在80%封頂，不能直接把面板未達80%視為不足。'],
 };
}
function pyrois(character){
 const id='focus-disc-5',title='先換5號盤，補暴傷與攻擊';
 if(growthFocusObservationToken(character)!==expectedTokens.pyrois)return changed(character,id,title);
 const fifth=discAt(character,5);
 return {...base(character,id,title),main:'保留5號'+main(fifth),tags:['暴擊傷害','攻擊力 %'],
  context:'面板暴率 '+value(character.stats?.['暴擊率'])+'、暴傷 '+value(character.stats?.['暴擊傷害'])+'；5號有效 '+value(effectiveDiscCount(fifth))+'。',
  detail:['先換5號盤副詞條，維持4拂曉行紀加2啄木鳥電音。','4號暴傷盤可列候選；換前須把'+value(character.wEngine?.name)+'被動與影畫額外暴率計入進戰比較，不能只追面板雙暴比。','先接近實戰100%暴率，再比較暴傷與攻擊收益。尚未取得進戰面板，條件式加成估算不能當成實測。'],
 };
}

/** Specific focus cards are omitted when their recorded character is absent. */
export function zzzGrowthFocus(characters){
 if(!Array.isArray(characters))return [];
 return [['ju_fufu',juFufu],['yanagi',yanagi],['miyabi',miyabi],['pyrois',pyrois]].flatMap(([id,build])=>{
  const character=characters.find(character=>character?.id===id);
  return character?[build(character)]:[];
 });
}
