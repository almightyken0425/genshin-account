# 絕區零資料契約

HOYO 將原神與絕區零分開保存。`data/zzz/account.json` 是絕區零正式觀測，`schemaVersion: 1`、`game: zzz`。原神仍使用既有 `data/account.json` 與原神 schema，兩者不互相遷移或覆蓋。

## 來源與未知值

`source` 保存原影片檔名、SHA-256、時長及錄影時間。檔名時間不等同已核實錄影時間；未確認 `capturedAt` 保持 null。原 MP4 留在使用者電腦，repo 僅保存必要截圖與校驗值。

每個角色有穩定 `id`、畫面上的 `name` 與至少一份 `evidence`。證據含 `timestampSec`、repo 相對 `framePath`、截圖 `sha256`，可加 `page`。`portraitPath` 是角色頭像裁切，只能用於辨識與顯示，不能由頭像推斷未顯示的屬性。

角色庫只代表本影片已確認範圍，不能推定完整持有角色清單。模糊或未顯示數值保持 null，疑點記錄 `uncertainties`。不得用 0 填未知值，亦不得由稀有度或畫面顏色猜屬性。

## 欄位

- `level`、`mindscape` 為畫面確認值；影畫未知時 null。
- `stats` 使用原畫面詞彙，數值保持 number，百分比保留帶 `%` 的字串，不換算推測。
- `skills` 為技能名稱到畫面等級的映射；不把顯示等級擅自反推基礎等級。
- `wEngine` 獨立記錄音擎名稱、稀有度、等級、精煉與面板，未見部分 null。
- `driveDiscs` 為已確認驅動盤的逐槽觀測；未見時 null，不能套用原神聖遺物規則。
- 所有觀測都是影片當時狀態，不代表即時遊戲伺服器狀態。

## 驗證與展示

執行 `python scripts/validate_zzz.py`，檢查 schema、唯一角色 ID、時間落在影片內、證據路徑、檔案存在及 SHA-256。修改時保留原神資料與既有證據。新的影片使用新的來源資料夾，不覆寫原始證據。

Sites 從同一 GitHub revision 讀取資料及圖片。圖片須經 owner-only API 提供，不把私人證據放進公開前端靜態目錄。尚未核對與缺少欄位必須在頁面保持可辨識，不展示推測值。

## 驅動盤逐項觀測

`driveDiscs` 可為部分槽位的陣列；缺少槽位或 null 代表未核對，不代表未裝備。每盤 `slot` 為1到6，`id`識別該來源的盤面觀測，不根據同名同數值合併物品。主副詞條 value 為數字、unit 為 flat/percent；未看清保留 null。

依使用者指定，橘黃色副詞條標示 isEffective=true，清楚顯示但非橘黃者false，顏色無法確認者null。數值後 `+N` 是 enhancementCount，僅在清晰完整畫面確定沒有 `+N` 時記0，不從數值反推。有效詞條總數為有效副詞條各計初始1次加強化次數；副詞條區不完整 substatsComplete=false、任有效性未知、或有效詞條強化次數未知，effectiveRollCount為null。主詞條不計入該總數。

每盤保留各自的時間戳及遮UID圖像SHA-256；新增證據另存於獨立資料夾，不覆寫先前截圖。

角色基本面板的 `statsEffective` 另外逐圖核對，key與stats原語相同、value為boolean或null；不由驅動盤有效詞條推算角色面板標記。未見標記不默認true或false。
