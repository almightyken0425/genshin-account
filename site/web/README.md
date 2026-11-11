# 原神手帳

私人 Sites 網站，唯讀查看 GitHub 的原神角色紀錄。

## 正式資料

固定來源為 almightyken0425/genshin-account 的 main 分支。data/account.json 是唯一正式現況。網站不內建帳號資料副本，不使用瀏覽器儲存作為正式紀錄。

來源碼由 Sites 的獨立託管庫保存。GitHub repo 的 site/web 是交付時的來源副本，Sites source push 不會同步角色資料。

## 功能

- 唯讀查看角色面板、武器、聖遺物與天賦。介面不含編輯、保存、草稿下載或裝備轉移入口。
- 搜尋、多選篩選、多條件排序，以及精簡／完整標籤切換。
- 底部浮動分頁導覽提供「隊伍」、「角色列表」及「培養重點」（等待分析）。
- 隊伍列表僅顯示四人圖片，整卡進入七隊操作詳情（不含恰斯卡）；詳情成員可進角色頁。操作為依 2026/11/11 配裝調整的建議，非實測最佳秒軸。部分隊伍共用角色，不表示可同時出戰。
- 保留 GitHub 即時讀取與配裝過期面板提示。資料更正仍由既有 repo 流程處理，不更動來源紀錄。

## 公開圖片與版面

介面使用白底、角色大圖和緊湊列表。頁首固定放置篩選及排序兩個按鈕，各自展開底部 Sheet。搜尋列放在下方並隨內容捲離畫面。列表呈現圖片與三個數字，依序為角色目前等級、命座及有效詞條總數，不顯示名稱或圖示。手機寬度採三欄，數字疊在圖片下緣的漸層底色上。搜尋與讀屏仍保留角色名稱。篩選包含五星與四星、武器類型、元素類型，各類別支援多選。同類別採聯集，不同類別採交集，未選代表不限。選項附角色數量，清除篩選可恢復全部。排序支援命座、有效詞條總數及目前等級，依選取順序建立優先級，可調整順序與升降序。先套用所有手動排序條件，全部相同時才依元素及繁體中文名稱排序。未選手動條件時直接使用元素與名稱順序，這兩項不出現在選單。未知數值在升序及降序都排在最後。

詳情以置中為基礎。桌面版的角色圖與配裝入口左右排列，手機版改為上下排列。裝備展開內容接在下方，再依序顯示人物總體數值與天賦。角色等級、命之座及有效詞條總數依序疊在人物圖下方，三項左右排列，每項固定以圖示及數值橫排，完整模式也不顯示這三個欄位名稱。角色、武器與聖遺物等級只顯示目前值，既有上限仍保存在資料中供驗證使用。詳情僅保留角色名稱列，手機版往下瀏覽時收起，往回捲或回到頂端時顯示。武器及各件聖遺物展開後，同樣採左右分組，左側為圖片與名稱，右側集中所有數值。標題列的圖示按鈕可切換精簡或完整模式。精簡模式只顯示圖示及數值，完整模式補上欄位名稱、武器名稱與星數、聖遺物部位與名稱。偏好存在瀏覽器，讀屏始終保留完整標籤。配裝變更後仍提示舊數值待更新。

武器與聖遺物以圖片摘要呈現，點選才展開細節。聖遺物依實際套裝件數分組，以生之花圖代表同套裝。4 加 1 顯示主套裝，2 加 2 與 3 加 2 顯示兩個套裝。全散搭、空配裝及缺少圖片使用通用花形圖示。五個部位的有效副詞條總數包含散件，統一顯示於人物圖下方。展開後每件圖片右下顯示該部位的有效總數。

副詞條亮起狀態依遊戲強化畫面記錄。強化次數放在圖示或完整標籤右側，兩種模式都只顯示數字。有效項目使用淺藍底與邊框凸顯。總數依每個有效項目的強化次數加 1 計算。缺資料顯示破折號，不當成 0。編輯時可選擇副詞條屬性，選單區分固定值與百分比，停用與主詞條或其他副詞條重複的選項。更換屬性會同步單位，並清空該項數值、強化次數及有效判定，其他項目保留。編輯數值或等級時清除對應的舊強化次數，轉移裝備則需要確認新角色的有效判定。

天賦放在人物總體數值之後，基礎等級與加成可以展開。來源紀錄不出現在介面，仍保留在 data/account.json 的 provenance、panel_snapshots 及 evidence 索引。

進入角色詳情時淡入並向上滑入。武器與聖遺物細節以高度展開和淡入呈現。系統開啟減少動態效果時停用動畫。

全站隱藏捲軸，保留滾輪、觸控及鍵盤捲動。



角色頭像與立繪、武器、聖遺物圖示來自 Enka Network 的公開素材。以 genshin-db 公開索引核對名稱、ID 及部位，再下載至 public/assets。來源 URL、尺寸與 SHA-256 記錄於 [asset_sources.json](public/asset_sources.json)，名稱對照與角色星級在 lib/game_assets.json，星級同樣依 genshin-db 的角色 ID 核對。

共 236 張圖片，角色大圖只載入當前選取角色，裝備圖片延後載入。旅行者使用已核對的女性頭像，不放大裁切成招募立繪。沒有對應圖或載入失敗時顯示尚無圖片，不影響現況查看。新增裝備時，應補充經核對的素材對照，避免以近似名稱猜測圖片。

遊戲圖片版權歸 HoYoverse 所有。索引來自 [genshin-db](https://github.com/theBowja/genshin-db)，圖源為 [Enka Network](https://enka.network)。遊戲素材不等於此專案自行創作的圖片。
## 本機預覽

日常調整預設只在本機進行。使用者明確要求發布時，才執行 Sites 保存與部署。

PowerShell 啟動方式：

```powershell
$env:GENSHIN_PREVIEW_REPO = (Resolve-Path ../genshin-account).Path
npm run dev -- --host 127.0.0.1 --port 5173
```

指定路徑後，僅開發伺服器會從該 repo 讀取角色。編輯區標示本機預覽，可試編輯及下載草稿，所有保存請求拒絕寫入。這不是 GitHub 連線失敗時的備援，正式建置不啟用此讀取方式。

## 執行與驗證

使用 Node 22.13 以上版本。首次安裝遵循 Sites skill 的 install-dependencies.mjs。若新增依賴，先更新 package-lock.json。

```text
node scripts/prepare-test-fixtures.mjs <本機資料 repo 的絕對路徑>
npm test
node node_modules/typescript/bin/tsc --noEmit
npm run dev
npm run build
```

網站可讀取資料 v1 與 v2。v2 才能編輯強化次數與有效判定，兩版共用原本的面板比較規則。substat_rolls 註記不參與 fingerprint。未來發布此變更時，先部署支援兩版的網站，再合併 v2 資料。

修改 schemas/account.schema.json 或 schemas/account.v1.schema.json 後，先執行 node scripts/compile-schema.mjs，重新產生不依賴執行期 eval 的驗證器。schema 應與資料 repo 一致。

測試樣本只供本機測試，tests/fixtures 已排除於來源同步與部署之外。prepare-test-fixtures 從資料 repo 的首版歷史建立固定 v1 回歸樣本，新增強化邏輯測試在記憶體建立 v2。完整新匯入資料另與 Python 摘要交叉比對。測試涵蓋摘要與指紋相容性、資料驗證、未知值、觀測保留、衝突、原子保存、重複請求和不確定寫入結果。

## 身分與秘密設定

本網站依賴 Sites 的 owner-private 存取限制，維持僅擁有者可見。網頁 API 的讀取與寫入檢查 Sites 注入的使用者身分，寫入另檢查同源 Origin。伺服器固定 repo、分支及可寫檔案，不提供任意代理。

在 Sites 環境設定加入 GITHUB_TOKEN 並標記為 Secret。使用只涵蓋此 repo 的 fine-grained token，Contents 設為 Read and write。變更秘密值後須重新部署。token 不放入原始碼、瀏覽器、.openai/hosting.json 或日誌。

GET /api/health 是唯讀運作檢查，依賴 Sites 私人存取邊界，允許平台服務存取。只回傳連線狀態、版本及數量，不回傳憑證。它不代替網站訪客的寫入授權。

## 保存與證據

API 保存會驗證與 repo 相同的 schema、裝備歸屬、部位、固定主詞條及引用。限制編輯既有記錄，原始來源、穩定 ID、角色類型和觀測不可改寫。手動更新標為 user_reported。

所有讀取固定在同一 commit。GraphQL createCommitOnBranch 使用 expectedHeadOid 並原子寫入兩個檔案。保存後讀回新 commit 的 account.json 核對。近期提交保存 requestId 和候選內容摘要，最多檢查最近 30 次帳號更新。

截圖由正式 manifest 解析，檔案路徑由伺服器限定，讀取後核對 SHA-256。此版在開啟截圖時校驗該檔，不在每次編輯時重下載全部證據。完整證據校驗由資料 repo 的 validate.py 執行。

API 參考：[GitHub commit mutation](https://docs.github.com/en/graphql/reference/commits)、[fine-grained token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)。

## 發布

沿用 .openai/hosting.json 的 project_id。依 Sites skill 使用 source helper 保存精確來源及封裝，再發布到既有私人 Site。不要另建 Site 或切換可見範圍。

尚未執行真正的角色資料寫入驗收，不應僅憑測試通過就宣稱線上寫入已驗證。
