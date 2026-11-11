# 資料契約

## 正式資料與證據

[data/account.json](../data/account.json) 保存現況，格式由 [account.schema.json](../schemas/account.schema.json) 定義。
原始辨識留在 imports，截圖與校驗值留在 evidence。閱讀摘要從現況產生，分析另存 analysis。

`schema_version` 目前為 1。`updated_at` 為資料更新時間，使用含時區的 ISO 8601 字串。
`observed_at` 代表錄影或觀測時間，未知時為 `null`。`imported_at` 只代表匯入時間。

## 角色與物品

`characters`、`weapons`、`artifacts` 各自保存實體。ID 是穩定識別，不以名稱或目前穿戴者作為重新命名的理由。

`equipment` 以角色 ID 索引，引用一件武器及五個聖遺物部位。尚未記錄的部位用 `null`。裝備歸屬只保存在此處，物品本身不重複保存角色欄位。

`teams` 保存使用者指定的隊伍，目前為空。不能把影片側欄順序直接當成已確認的常用隊伍。

## 數值與單位

每個詞條包含 `key`、`value` 與 `unit`。

```json
{"key": "crit_rate", "value": 6.2, "unit": "percent"}
```

百分比使用畫面顯示的百分點。6.2% 保存為 6.2。固定生命值使用 `hp` 與 `flat`，生命值百分比使用 `hp_pct` 與 `percent`。

未知數值保存為 `null`，已確認為零才保存 0。主副詞條不能重複同一屬性鍵，固定值與百分比屬於不同鍵。

`level` 分成 `current` 與 `cap`。命座為 0 至 6，精煉為 1 至 5。名稱維持影片所用繁體中文，不依外部攻略改寫個人數值。

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

證據索引記錄 SHA-256、影片時間、截圖類型及對應角色。驗證器檢查路徑位於 repo 內、檔案存在及校驗一致。

## 檢查結果

結束碼 0 代表資料格式與引用有效。面板過期會另外輸出警告，不阻止保存真實的換裝結果。
結束碼 1 代表欄位、物品歸屬、來源或檔案校驗失敗，需要修正。

驗證器不判斷配裝強弱，不重算遊戲傷害，也不以加總四捨五入後的詞條取代畫面總值。
