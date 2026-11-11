export type FlowStep={id:string,moves:string[]};
export const teamFlows:Record<string,FlowStep[]>={
 mavuika:[
  {id:'mavuika',moves:['短 E']},{id:'bennett',moves:['E → Q']},
  {id:'xilonen',moves:['E → A2','親自撿火結晶']},{id:'citlali',moves:['E → Q']},
  {id:'mavuika',moves:['敵人掛冰 → Q → 跳躍','持續摩托重擊（班尼特圈內）']}],
 zibai:[
  {id:'columbina',moves:['E → Q（可用時）']},{id:'linnea',moves:['A → E（單按）','Q（需要治療時）']},
  {id:'illuga',moves:['Q → E']},{id:'zibai',moves:['E','（A4 → 強化 E）×4','Q 可用：E 後 A → Q','或以 Q 取代一組 A4']}],
 nefer:[
  {id:'nefer',moves:['首輪可先 E']},{id:'columbina',moves:['E → Q']},{id:'nahida',moves:['E → Q']},
  {id:'lauma',moves:['長 E → Q']},{id:'nefer',moves:['E →（重擊 → 衝刺）×3','E →（重擊 → 衝刺）×3','月露不足：Q 或換人補技能']}],
 neuvillette:[
  {id:'neuvillette',moves:['E（留水滴）']},{id:'furina',moves:['E → A']},
  {id:'xilonen',moves:['E → Q → A2','親自撿水結晶']},{id:'kaedeharakazuha',moves:['短 E → 下落 → Q']},
  {id:'furina',moves:['Q']},{id:'neuvillette',moves:['吸水滴重擊 → E','吸水滴重擊 → Q']},
  {id:'xilonen',moves:['E → A2']},{id:'kaedeharakazuha',moves:['短 E → 下落']},
  {id:'neuvillette',moves:['吸水滴重擊 ×2（技能就緒時）']}],
 varesa:[
  {id:'varesa',moves:['首輪 E → 重擊 → 下落（掛雷）']},
  {id:'chevreuse',moves:['Q 觸發超載 → 長 E 強化彈','Q 未就緒：先火雷觸發超載 → 長 E']},
  {id:'iansan',moves:['E → 重擊（需要時）→ Q']},
  {id:'mavuika',moves:['E → Q','（重擊 2 圈 → 衝刺）×3']},
  {id:'varesa',moves:['E → 重擊 → 下落','強化 Q（可用時）','E → 重擊 → 下落','以上再做 1 組']}],
 mizuki:[
  {id:'voyanitsa',moves:['E']},{id:'odetta',moves:['首輪 E → E','後續 Q → E（Q 可用、隔輪）']},
  {id:'traveler_cryo',moves:['首輪 E','後續 E → A → 重擊 → Q']},
  {id:'yumemizukimizuki',moves:['E → 圍繞敵群移動','Q（可用時）']}],
};
