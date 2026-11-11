export type FlowStep={id:string,moves:string[]};
export const teamFlows:Record<string,FlowStep[]>={
 mavuika:[
  {id:'mavuika',moves:['短 E']},{id:'bennett',moves:['E → Q']},
  {id:'xilonen',moves:['E → A2','撿火結晶']},{id:'citlali',moves:['E → Q']},
  {id:'mavuika',moves:['掛冰後 Q → 跳躍','圈內持續摩托重擊']}],
 zibai:[
  {id:'columbina',moves:['E → Q 可用時施放']},{id:'linnea',moves:['A → 單按 E','需治療時 Q']},
  {id:'illuga',moves:['Q → E']},{id:'zibai',moves:['E','A4 → 強化 E，共 4 組','Q 可用：E 後 A → Q','或 Q 替代一組 A4']}],
 nefer:[
  {id:'nefer',moves:['首輪可先 E']},{id:'columbina',moves:['E → Q']},{id:'nahida',moves:['E → Q']},
  {id:'lauma',moves:['長 E → Q']},{id:'nefer',moves:['E → 重擊 → 衝刺，共 3 組','E → 重擊 → 衝刺，共 3 組','月露不足：Q 或換人補技能']}],
 neuvillette:[
  {id:'neuvillette',moves:['E 留水滴']},{id:'furina',moves:['E → A']},
  {id:'xilonen',moves:['E → Q → A2','撿水結晶']},{id:'kaedeharakazuha',moves:['短 E → 下落 → Q']},
  {id:'furina',moves:['Q']},{id:'neuvillette',moves:['吸水滴重擊 → E','吸水滴重擊 → Q']},
  {id:'xilonen',moves:['E → A2']},{id:'kaedeharakazuha',moves:['短 E → 下落']},
  {id:'neuvillette',moves:['技能就緒：吸水滴重擊 ×2']}],
 varesa:[
  {id:'varesa',moves:['首輪 E → 重擊 → 下落掛雷']},
  {id:'chevreuse',moves:['Q 超載 → 長 E 強化彈','Q 未就緒：先火雷超載 → 長 E']},
  {id:'iansan',moves:['E → 必要時重擊 → Q']},
  {id:'mavuika',moves:['E → Q','重擊 2 圈 → 衝刺，共 3 組']},
  {id:'varesa',moves:['E → 重擊 → 下落','強化 Q 可用時施放','E → 重擊 → 下落','再做 1 組']}],
 mizuki:[
  {id:'voyanitsa',moves:['E']},{id:'odetta',moves:['首輪 E → E','後續隔輪 Q → E，Q 須就緒']},
  {id:'traveler_cryo',moves:['首輪 E','後續 E → A → 重擊 → Q']},
  {id:'yumemizukimizuki',moves:['E → 繞敵移動','Q 可用時施放']}],
};
