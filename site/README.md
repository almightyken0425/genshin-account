# HOYO

[開啟 HOYO](https://ken-genshin-archive.almightyken0425.chatgpt.site)，僅擁有者可見。

## 來源與資料

Sites 託管庫保存網站來源；web 是對應來源的副本，source.json 記錄部署版本。GitHub main 的 data/account.json 保留原神現況，data/zzz/account.json 是獨立的絕區零觀測。網站從固定 revision 讀取資料與證據，不使用測試資料冒充正式帳號。

保留原 GitHub repo 與 Site 網址，產品名稱改為 HOYO。未更改分享或登入權限。全站介面唯讀，原神既有角色、隊伍、培養頁與循環卡片保持原有功能。

## 絕區零

目前38名角色來自使用者指定影片，基本面板、等級、影畫與頭像有截圖依據。技能與音擎僅保留已核對資訊。38名角色的228張驅動盤已逐項核對，包含主副詞條、畫面有效標記及強化次數；未能確定的資訊仍保持 null。影片日期未知，不把匯入時間當錄影時間。

圖片經 owner-only API 取得，驗證 GitHub revision、允許的路徑與SHA-256；未將私人圖片包進公開靜態來源。

## 驗證

HOYO 整合來源通過80項網站測試及14項資料測試、TypeScript與build；資料通過獨立schema、116張既有證據與頭像，以及228張新增驅動盤證據與1張穩定面板影格hash驗證。部署結果以 source.json 為準，不能把本機測試等同線上已驗收。
