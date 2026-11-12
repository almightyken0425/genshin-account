# HOYO

[開啟 HOYO](https://ken-genshin-archive.almightyken0425.chatgpt.site)，僅擁有者可見。

## 來源與資料

Sites 託管庫保存網站來源；web 是對應來源的副本，source.json 記錄部署版本。GitHub main 的 data/account.json 保留原神現況，data/zzz/account.json 是獨立的絕區零觀測。網站從固定 revision 讀取資料與證據，不使用測試資料冒充正式帳號。

保留原 GitHub repo 與 Site 網址，產品名稱改為 HOYO。未更改分享或登入權限。全站介面唯讀，原神既有角色、隊伍、培養頁與循環卡片保持原有功能。

## 本機圖片編輯稿

在 `web` 執行 `npm run artwork:edit`，開啟 [圖片編輯器](http://127.0.0.1:4180/genshin/roster)。原神與絕區零各有角色列表與角色詳情總覽。詳情共用正方形圖框，列表共用 3:4 大卡。操作與保存方式見 [編輯器說明](web/tools/artwork_editor/README.md)。

本機編輯稿的正式保存位置是 `web/lib/artwork_edits.json` 與 `web/public/assets/artwork_edits/`。這兩組檔案須一起保留，並在使用者確認後一起帶入 Sites 部署。尚未部署的本機編輯稿不應被舊託管來源覆蓋。source.json 仍只描述上次正式部署。

第 33 版已套用第 127 次修訂的 88 張編輯圖片。原神列表 46 張，絕區零列表 26 張、詳情 16 張。其餘圖片沿用既有構圖。後續本機編輯仍須再次部署才會更新正式網站。

## 絕區零

目前38名角色來自使用者指定影片，基本面板、等級、影畫與頭像有截圖依據。技能與音擎僅保留已核對資訊。38名角色的228張驅動盤已逐項核對，包含主副詞條、畫面有效標記及強化次數；未能確定的資訊仍保持 null。影片日期未知，不把匯入時間當錄影時間。

圖片經 owner-only API 取得，驗證 GitHub revision、允許的路徑與SHA-256；未將私人圖片包進公開靜態來源。

## 驗證

本次網站來源通過 145 項網站測試、TypeScript 與建置。88 張編輯圖片在來源與部署包中逐張核對 SHA-256，來源與輸出尺寸皆符合紀錄。

帳號與證據資料未改動。既有資料曾通過 14 項資料測試、獨立 schema，以及 116 張既有證據與頭像、228 張驅動盤證據和 1 張穩定面板影格的校驗。部署結果以 source.json 為準，不能把本機測試等同線上已驗收。
