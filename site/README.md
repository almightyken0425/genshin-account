# Sites 開發交接

目前只有資料基礎。尚無網站程式、Site ID、部署網址或可用的線上保存功能。

## 已確認方向

GitHub 的 data/account.json 保存唯一正式現況。Sites 提供帳號總覽、角色詳情、現況編輯、隊伍目標及分析歷史。
網站必須從服務端存取私有 repo，讀取時帶回版本，保存時驗證版本及資料。瀏覽器不得持有 GitHub 憑證。

Sites 自己的託管來源庫與這個 GitHub repo 是不同概念。不得假定 source push 就會同步個人帳號資料，也不將建置時的資料副本冒充即時讀取。

## 第一項驗證

依當時可用的 Sites 能力查詢 GitHub 整合資格，確認受支援的讀取與寫回方式。本次工具未提供 Sites 整合資格查詢，因此此項尚未完成。

驗證需涵蓋指定私有 repo 的讀取、使用者登入、明確按下保存、讀回新版本及重新開啟後仍可讀取。
若無法取得支援的寫入能力，回報此缺口。不要以另一份可修改資料庫冒充 GitHub 已同步。

## 預定介面契約

| 操作 | 輸入 | 成功結果 | 錯誤處理 |
| --- | --- | --- | --- |
| readAccount | 固定的已授權 repo | account、版本 revision | 顯示讀取失敗，舊資料標示過期 |
| saveAccount | candidate、expectedRevision、requestId | 已保存資料及新 revision | 版本衝突保留草稿，不覆蓋遠端 |
| readEvidence | 已知 evidence ID | 授權的截圖內容 | 找不到來源時顯示缺失 |

GitHub Contents API 更新檔案需提供原檔 blob SHA，可作為 expectedRevision。多檔更新必須在同一個 Git commit 中完成，避免半套現況。保存超時時先讀回核對 requestId 或內容，不盲目重送。

每次保存都要執行相同的 schema 與裝備引用驗證。編輯介面需要明確區分未知值、零、草稿與已保存值。
網址受限不等於每個操作都已授權。服務端仍需驗證身分、來源、固定 repo 範圍及寫入權限。

## 驗收

- 網站與 repo 顯示同一資料版本。
- 重新開啟或換裝置後可以讀到已保存資料。
- 兩個頁面同時編輯不互相覆蓋。
- 換裝後舊面板提示待更新，未推算成確定數值。
- 每筆匯入資料能打開對應截圖。
- 未授權訪客無法讀取私有資料或執行修改。

GitHub API 參考：[repository contents](https://docs.github.com/en/rest/repos/contents)、[Git database](https://docs.github.com/en/rest/guides/using-the-rest-api-to-interact-with-your-git-database)。
