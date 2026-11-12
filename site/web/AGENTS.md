# 網站工作規則

本網站 HOYO 是私人原神與絕區零紀錄工具，屬於外部專案。

- 角色正式資料只存在 almightyken0425/genshin-account 的 main 分支。
- 網站來源庫與角色資料庫分開。先核對 Git 狀態和 .openai/hosting.json，再接續工作。
- 保存及部署沿用既有 Site 身分與 owner-private 範圍，依 Sites skill 操作。
- GITHUB_TOKEN 只存放在 Sites 秘密設定。不要讀出、列印或寫入來源碼。
- tests/fixtures 只供驗證，不能作為線上讀取失敗時的替代資料。
- 修改資料邏輯須維持 JSON schema、Python 指紋與摘要相容性。
- 保留原始觀測、來源及穩定 ID。新面板應從有依據的匯入流程加入。
- 回報時區分測試資料、正式部署、即時讀取與真正寫入的證據。

- 原神 data/account.json 與絕區零 data/zzz/account.json 分開，絕不可將兩個遊戲的配裝、面板或規則混用。
- HOYO 為產品名稱。既有 GitHub repository 與 Site URL 是相容識別，未經明確遷移不要改名。
