# 更新流程

## 修改現況

1. 核對最新分支及資料版本，保留其他未提交成果。
2. 修改 data/account.json。補上來源或使用者敘述，更新 updated_at。
3. 換裝時移動 equipment 內的 ID 引用。先移除原角色引用，確保一次保存的最終狀態沒有重複穿戴。
4. 保留既有面板觀測。驗證器會提示配裝是否已與面板不符。
5. 執行驗證、產生摘要及測試。

```sh
python scripts/validate.py
python scripts/report.py
python -m unittest discover -s tests -v
python scripts/report.py --check
```

檢查完成後依當次授權提交與推送。建議修改與帳號實際變更分開記錄。

## 新影片

現有匯入器接受本次 extracted.json 的格式與同目錄 screenshots 資料夾。先將輸入 JSON 命名為 character_data.json。

```sh
python scripts/import_video.py --source-dir /path/to/extraction --source-id video_002 --output /path/to/new_candidate --video /path/to/source.mp4
```

輸出位置必須沒有 data/account.json、同來源的 imports 或 evidence。工具拒絕覆蓋現況，先產生可核對的候選資料。
`--video` 只用來計算來源校驗值，不會複製影片。知道錄影時間時可加 `--recorded-at` 並提供含時區的時間。

新影片候選不是整個帳號的替代品。合併時保留未出現的角色，核對物品身分並重用既有 ID，再加入新的來源與快照。跨影片物品配對目前需要人工核對。

匯入中斷時保留已寫出的成果，先核對狀態。可在新的候選目錄重跑，不以刪除既有現況補救。

## 新面板

加入新證據與新的 panel_snapshot，填入觀測數值及其對應配裝 fingerprint，將角色 panel_snapshot_id 指向新觀測。
若配裝與截圖不一致，先釐清，不將舊值或估算值寫成已觀測結果。

## 修正辨識錯誤

修改正式資料並在 provenance.notes 說明原因與證據。原始 extracted.json 與截圖保留，避免失去首次辨識紀錄。
若需要補充更清楚的截圖，建立新的來源索引並引用它，不覆寫原始證據。
