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
- `wEngine` 獨立記錄音擎名稱、稀有度、等級、精煉與面板，未見部分 null。`level` 可為影片明確顯示的0，`maxLevel` 是畫面當時的突破上限，不由稀有度推算。
- `driveDiscs` 為已確認驅動盤的逐槽觀測；未見時 null，不能套用原神聖遺物規則。
- 所有觀測都是影片當時狀態，不代表即時遊戲伺服器狀態。

## 驗證與展示

執行 `python scripts/validate_zzz.py`，檢查 schema、唯一角色 ID、時間落在影片內、證據路徑、檔案存在及 SHA-256。修改時保留原神資料與既有證據。新的影片使用新的來源資料夾，不覆寫原始證據。

Sites 從同一 GitHub revision 讀取資料及圖片。圖片須經 owner-only API 提供，不把私人證據放進公開前端靜態目錄。尚未核對與缺少欄位必須在頁面保持可辨識，不展示推測值。

## HoYoLAB 同步 v2

v1 影片觀測保持可讀。同步候選採 schemaVersion 2，保留 source 與全部既有證據。首次同步前的角色紀錄存入 legacyObservation。新增 syncSources 保存 API JSON 的相對路徑、SHA 與讀取時間，API evidence 使用 sourceId 與 record 指向 JSON 角色記錄，不填假的影片時間或截圖。

技能使用官方戰績頁顯示等級，不再重複加影畫。核心數字 1 對應未升階，2 至 7 對應 A 至 F。skillsBase 只在逐角色影畫規則與顯示等級語義均已核對時，扣除該角色已啟用的普通技能加成。核心技能不參與這項扣除。規則、影畫或等級未知，以及結果超出普通技能 1 至 12 級時，基礎值維持 null。skillContext 保留原始來源與顯示語義。

逐角色規則與官方多語言來源保存在[技能加成對照](../tools/hoyolab_sync/data/zzz_talent_rules.json)。正規化來源另記規則檔 SHA，基礎等級是依已確認機制推導的值，不冒充 API 直接回傳的基礎欄位。

isEffective 仍只代表遊戲觀測，assessedEffective 是獨立的角色規則判定，明確觀測優先。規則使用 effectiveProfile 或驅動盤 assessment 識別。無法套用或未涵蓋的項目維持 null。

副詞條 enhancementCount 可在 v2 採用已核對的 S 級增量推導，enhancementSource 必須標示 derived_fixed_roll。推導只在單項整數與整盤預算均通過時採用，A、B 級不推導。原始 API 沒有回傳次數，不能把推導說成直接觀測。完整依據與邊界見 [同步判定](../tools/hoyolab_sync/README.md#資料判定)。

## 驅動盤逐項觀測

`driveDiscs` 可為部分槽位的陣列；缺少槽位或 null 代表未核對，不代表未裝備。每盤 `slot` 為1到6，`id`識別該來源的盤面觀測，不根據同名同數值合併物品。主副詞條 value 為數字、unit 為 flat/percent；未看清保留 null。

依使用者指定，橘黃色副詞條標示 isEffective=true，清楚顯示但非橘黃者false，顏色無法確認者null。數值後 `+N` 是 enhancementCount，僅在清晰完整畫面確定沒有 `+N` 時記0，不從數值反推。有效詞條總數為有效副詞條各計初始1次加強化次數；副詞條區不完整 substatsComplete=false、任有效性未知、或有效詞條強化次數未知，effectiveRollCount為null。主詞條不計入該總數。

每盤保留各自的時間戳及遮UID圖像SHA-256；新增證據另存於獨立資料夾，不覆寫先前截圖。

角色基本面板的 `statsEffective` 另外逐圖核對，key與stats原語相同、value為boolean或null；不由驅動盤有效詞條推算角色面板標記。未見標記不默認true或false。
