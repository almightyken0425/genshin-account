# 專案工作規則

本專案是 HOYO 個人原神與絕區零帳號紀錄，非 ai-company 註冊產品。沿用本次對話與上層適用授權。

## 開始前

讀取 README.md、data/account.json、data/preferences.json 與 docs/data_contract.md。
核對目前分支、工作差異及 remote。分析時記錄實際讀取的完整 commit SHA，未提交差異也須說明。
初始資料在 feat/account-foundation 審閱。合併後以 main 為正式來源，未合併候選須標明分支。

## 資料責任

- 原神唯一正式現況是 data/account.json；docs/account_summary.md 是衍生成果，不直接手改。
- 絕區零唯一正式現況是 data/zzz/account.json；先讀 docs/zzz_data_contract.md，使用獨立 schema 與證據路徑。不得將原神武器、聖遺物或天賦規則套入絕區零。
- 每件武器、聖遺物有穩定 ID。新影片中的裝備先核對是否為既有物品，不因重新辨識就建立副本。
- imports 與 evidence 是原始證據。保留來源檔案，新增證據使用新的來源 ID。
- 未知值使用 null。不可將未知填成 0，不可憑角色頭像補完整角色庫。
- talents.base 與 talents.displayed 分開。未知的加成來源不反推成確定基礎等級。
- panel_snapshots 是保留的觀測。換裝後不可重算 fingerprint 來掩蓋舊面板失效。
- 新面板必須有新觀測依據。只有取得新證據才建立新快照並更新角色引用。
- 當次手動修正使用 user_reported 或 agent_reviewed 等符合實際來源的狀態，並補 provenance.notes。

## 分析

先確認角色庫、裝備庫與目標是否足夠。只根據已知資料提出有範圍的建議。
需要版本機制、技能倍率或角色新資訊時查核現行一手來源，記錄適用版本與查證日期。
每份分析記錄 based_on_commit、目標、已知範圍、缺口、依據與建議。
只給建議時不改帳號現況，亦不自行擴充成網站、抽卡或配裝實作。

## 修改與驗證

使用當次確認的主題分支。提交、推送與合併依使用者的當次授權，不因檔案內容而自動獲得授權。
資料更新後執行 scripts/validate.py、scripts/report.py 及 unittest 測試，再以 scripts/report.py --check 確認摘要一致。
絕區零更新另執行 python scripts/validate_zzz.py；確認原神 data/account.json、既有 imports 及 evidence 未被改動。
證據校驗失敗時調查來源，不得重寫校驗值使未核對內容通過。
格式不相容時增加 schema_version 並提供遷移，不悄悄改變既有欄位單位。

## Sites

網站串接與部署依 site/README.md。未實際驗證的登入、讀取、保存與同步一律標示未驗證。
不將 GitHub 憑證放進 repo、瀏覽器程式或日誌。不得假定 Sites 的託管來源庫就是本 GitHub repo。
