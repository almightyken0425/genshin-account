# 原神手帳網站

[開啟原神手帳](https://ken-genshin-archive.almightyken0425.chatgpt.site)。沿用既有私人 Sites 網站，僅擁有者可見。

## 來源與正式資料

網站來源由 Sites 託管庫保存。[web](web) 是對應部署來源的副本，完整來源版本記錄在 [source.json](source.json)。修改網站時先接回既有 Site，不另建網站或變更可見範圍。

GitHub main 分支的 [data/account.json](../data/account.json) 是唯一正式角色現況。Sites 的來源推送只更新網站程式，並不合併此資料 repo。feat/roster-import 中的 47 位角色需合併 main 後才會在線上出現。

既有 Site ID 為 `appgprj_6af3d7df0f3481919cbe1b4416108ff6`，在 [hosting.json](web/.openai/hosting.json) 保留。部署操作依 Sites skill，先建置與推送精確來源，再發布對應版本。

## 讀取與保存

伺服器使用 Sites 秘密設定中的 GITHUB_TOKEN 連接 almightyken0425/genshin-account，只讀寫指定 repo。憑證不進入程式碼、瀏覽器或此副本。

正式網站進入編輯後，底部固定顯示「保存修改」。核對變更並填寫備註後，透過 GraphQL createCommitOnBranch 同時寫入 account.json 與衍生摘要，以 expectedHeadOid 檢查版本衝突，完成後讀回確認。衝突保留草稿，寫入結果不確定時先核對 requestId，不直接重送。

本機預覽只讀取指定資料 checkout，可編輯及下載 JSON 草稿，不寫入正式資料。草稿不是已保存版本，也不會在重新整理後自動載入。

網站支援資料格式 v1 與 v2，先部署支援兩版的網站，再合併 v2 資料。實際配裝變更會使舊面板標示待更新，觀測保留不重算。強化次數與有效判定不參與配裝 fingerprint。

## 驗證範圍

網站已通過 40 項自動測試與 TypeScript 檢查。資料已通過 25 項 Python 測試、schema、裝備歸屬、證據 SHA-256 及摘要檢查。

測試涵蓋版本衝突、原子保存、重複請求、未知值、舊觀測保留與寫入結果不確定。這些自動測試不代表已執行真正的線上角色修改。瀏覽器驗證工具啟動失敗，視覺與真實登入保存流程尚未完成本次驗證。

網站功能與本機命令見 [網站 README](web/README.md)。
