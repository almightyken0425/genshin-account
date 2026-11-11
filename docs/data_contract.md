# 資料契約

## 正式資料與證據

[data/account.json](../data/account.json) 保存現況，格式由 [account.schema.json](../schemas/account.schema.json) 定義。
原始辨識留在 imports，截圖與校驗值留在 evidence。閱讀摘要從現況產生，分析另存 analysis。

`schema_version` 目前為 2。驗證器保留對 v1 的支援，舊資料可用 `scripts/migrate_account.py <輸入> <新輸出>` 遷移。遷移新增未知的強化紀錄，保留 ID、舊面板及其 fingerprint，拒絕覆寫既有輸出。

`updated_at` 為資料更新時間，使用含時區的 ISO 8601 字串。
`observed_at` 代表錄影或觀測時間，未知時為 `null`。`imported_at` 只代表匯入時間。

## 角色與物品

`characters`、`weapons`、`artifacts` 各自保存實體。ID 是穩定識別，不以名稱或目前穿戴者作為重新命名的理由。

`equipment` 以角色 ID 索引，引用一件武器及五個聖遺物部位。尚未記錄的部位用 `null`。裝備歸屬只保存在此處。聖遺物的 `substat_rolls.character_id` 表示有效詞條判定時的角色，並非物品歸屬。

`teams` 保存使用者指定的隊伍，目前為空。不能把影片側欄順序直接當成已確認的常用隊伍。

## 數值與單位

每個詞條包含 `key`、`value` 與 `unit`。

```json
{"key": "crit_rate", "value": 6.2, "unit": "percent"}
```

百分比使用畫面顯示的百分點。6.2% 保存為 6.2。固定生命值使用 `hp` 與 `flat`，生命值百分比使用 `hp_pct` 與 `percent`。

未知數值保存為 `null`，已確認為零才保存 0。主副詞條不能重複同一屬性鍵，固定值與百分比屬於不同鍵。

`level` 分成 `current` 與 `cap`。命座為 0 至 6，精煉為 1 至 5。名稱維持影片所用繁體中文，不依外部攻略改寫個人數值。

## 聖遺物強化與有效詞條

每件聖遺物新增 `substat_rolls`。`values` 與已啟用的 `substats` 以 `key` 一一對應。尚未解鎖的第四項預告不加入副詞條。

```json
{
  "character_id": "chasca",
  "values": [
    {"key": "crit_dmg", "enhancements": 2, "effective": true},
    {"key": "crit_rate", "enhancements": 1, "effective": true}
  ]
}
```

`enhancements` 是遊戲強化次數畫面的數字，不含初始 1 次。已確認未強化為 0，看不清楚為 `null`。`effective` 依該畫面亮起的副詞條記錄，可為 `true`、`false` 或未知 `null`。不依角色需求自行推算，不由數值反推次數，也不限制有效項目一定有兩項。

單件有效總數為所有 `effective: true` 項目的 `enhancements + 1` 加總。上例是 5。整套加總五個實際穿戴部位，包含散件。缺部位、有效性未確認或有效項目的次數未知時，總數保持未知，畫面顯示破折號。已確認沒有有效項目才是 0。

轉移聖遺物後，實體的強化次數仍保留。觀測角色與目前角色不同時，有效性與總數視為未知。編輯器重新確認新角色的有效判定後才採用。修改副詞條數值會清除該項次數，修改聖遺物等級會清除全部次數，避免沿用升級前的紀錄。

`substat_rolls` 屬於註記，不參與配裝 fingerprint。更正強化次數或有效標示不代表遊戲配裝改變。實際等級、主副詞條數值及穿戴引用仍參與比較。

## 天賦與面板

天賦分為 `base` 與 `displayed`，各包含 `normal`、`skill`、`burst`。本次只知道顯示等級，基礎值與 `bonus_context` 均未知。

`panel_snapshots` 保存觀測數值、證據、觀測時間與 `build_fingerprint`。角色透過 `panel_snapshot_id` 選定最近採用的面板。

fingerprint 涵蓋角色等級、命座、元素、天賦及實際裝備內容。相關資料更動後，驗證器回報 `build_changed` 警告。這是有效的資料更新，但舊面板不得當成新配裝結果。

`matches_recorded_build` 只代表已記錄的配裝輸入相同，無法證明隊伍共鳴、臨時加成或遊戲版本相同。這些情境保存在 snapshot.context，未知時保持 `null`。

不要透過重算舊快照 fingerprint 消除警告。取得新截圖後新增快照，再更新角色的快照引用。

## 來源與核對狀態

`provenance.source_ids` 指向來源索引，`evidence_refs` 指向截圖 ID。
`agent_reviewed` 代表助手核對過原畫面，`user_reported` 代表使用者提供的更新，`pending` 表示待確認。

本次辨識保留人工辨識的限制。原始解析度為 848 × 384，細小名稱仍可能需要使用者修正。核對狀態不代表已由使用者確認。

證據索引記錄 SHA-256、影片時間、截圖類型及對應角色。v1 manifest 的 `video` 保持相容。v2 manifest 使用 `media.type` 區分 `video` 與 `image`，影片含 `duration_seconds`，補充圖片的截圖 `time_seconds` 為 `null`。PNG 與 JPEG 保留原格式。驗證器檢查路徑位於 repo 內、檔案存在及校驗一致。

## 檢查結果

結束碼 0 代表資料格式與引用有效。面板過期會另外輸出警告，不阻止保存真實的換裝結果。
結束碼 1 代表欄位、物品歸屬、來源或檔案校驗失敗，需要修正。

驗證器不判斷配裝強弱，不重算遊戲傷害，也不以加總四捨五入後的詞條取代畫面總值。
