// Presentation only: original observation notes remain unchanged in GitHub.
const wording={
 '音擎未確認者為 null':'音擎尚未確認',
 '技能與驅動盤尚未完整逐項轉錄':'技能與驅動盤尚未完整核對',
 '驅動盤逐片主副詞條尚未完整抽取':'驅動盤主副詞條尚未完整核對',
};
export function zzzNote(note){return wording[note]??note}
