export type FlowStep={id:string,moves:string[]};
export const teamFlows:Record<string,FlowStep[]>={
 mavuika:[
  {id:'mavuika',moves:['短 E']},{id:'bennett',moves:['E → Q']},
  {id:'xilonen',moves:['E → A2','撿火結晶']},{id:'citlali',moves:['E → Q']},
  {id:'mavuika',moves:['掛冰後 Q → 跳躍','圈內持續摩托重擊']}],
 zibai:[
  {id:'columbina',moves:['E → Q']},{id:'linnea',moves:['A → E']},
  {id:'illuga',moves:['E → Q']},{id:'zibai',moves:['E → Q','A4 → E','A4 → E','A4 → E','A4 → E']}],
 nefer:[
  {id:'nefer',moves:['E']},{id:'columbina',moves:['E → Q']},{id:'nahida',moves:['E → Q']},
  {id:'lauma',moves:['長 E → Q']},{id:'nefer',moves:['E → 長 A']},{id:'nefer',moves:['E → 長 A']}],
 neuvillette:[
  {id:'neuvillette',moves:['E']},{id:'furina',moves:['E → A']},
  {id:'xilonen',moves:['E → Q → A2 → 撿水結晶']},{id:'kaedeharakazuha',moves:['E → 下落 A → Q']},
  {id:'furina',moves:['Q']},{id:'neuvillette',moves:['重 A → E → 重 A → Q']},
  {id:'xilonen',moves:['E → A2 → 撿水結晶']},{id:'kaedeharakazuha',moves:['E → 下落 A']},
  {id:'neuvillette',moves:['重 A']},{id:'neuvillette',moves:['重 A']}],
 varesa:[
  {id:'varesa',moves:['E → A → 下落 A']},{id:'chevreuse',moves:['Q → 長 E']},
  {id:'iansan',moves:['E → Q']},{id:'mavuika',moves:['E → Q → 長 A']},
  {id:'varesa',moves:['E → A → 下落 A → 小 Q']},{id:'varesa',moves:['E → A → 下落 A']}],
 mizuki:[
  {id:'voyanitsa',moves:['E']},{id:'odetta',moves:['Q → E']},
  {id:'traveler_cryo',moves:['E → A → 重 A → Q']},
  {id:'yumemizukimizuki',moves:['E → 繞敵移動 → Q']}],
};

export const teamFlowNotes:Record<string,string[]>={
 nefer:['長 A 需有足夠月露；不足時以 Q 或換人補技能銜接，避免空打。','哥倫比婭 Q 的充能循環仍需實戰確認。'],
 neuvillette:['重 A 前先吸足水滴；Q 或技能未就緒時先補能量，不硬湊四次重 A。','水結晶由希諾寧拾取；中段換人刷新減抗後再回那維萊特。'],
 varesa:['夏沃蕾長 E 前先觸發超載；Q 未就緒時先用火雷命中完成超載。','E 後按 A 會轉成重擊起跳，再按空中 A 下落。','小 Q 只在強化下落後的有效窗口且能量足夠時使用，不是每次下落都能開。'],
 mizuki:['沃雅妮莎後直接切奧黛塔，讓討龍交給奧黛塔。','首輪奧黛塔 E → E、冰主只 E；之後奧黛塔隔輪 Q，Q 未就緒先補能量。','瑞希 E 後繞敵移動，Q 可用時施放；維持冰附著，不以普攻作主要輸出。'],
};
