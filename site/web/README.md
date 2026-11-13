# HOYO

HOYO網站，唯讀查看GitHub的原神與絕區零角色紀錄。分享範圍沿用使用者已確認的公開設定，角色API仍檢查平台登入身分。

## 正式資料

固定來源為 almightyken0425/genshin-account 的 main 分支。原神 data/account.json 與絕區零 data/zzz/account.json 分別是各遊戲的正式現況。網站不內建帳號資料副本，不使用瀏覽器儲存作為正式紀錄。

來源碼由 Sites 的獨立託管庫保存。GitHub repo 的 site/web 是交付時的來源副本，Sites source push 不會同步角色資料。

## 功能

- 兩款遊戲共用人物大卡、正方形詳情圖、頁首與G／Z直接切換。
- 角色列表只顯示命座或影畫及有效達成率，不顯示等級。原神與絕區零都支援搜尋、多選篩選及多條件排序。
- 原神保留七隊操作建議，絕區零提供八隊建議，每隊三人加一個建議邦布，隊友允許重複。邦布持有狀態未知。
- 隊伍、成員、循環與培養目標採共用結構。理由、條件與來源預設收合。
- 詳情可展開武器或音擎、聖遺物或驅動盤。絕區零音擎手機數值為2×2。
- 詳情以目前／理論有效上限顯示整套與單件詞條。列表轉成四捨五入整數百分比，未知值顯示 —。
- 原神47名角色的面板有效屬性依公開來源與現有用途標示。公開培養資料與遊戲有效詞條觀測分開。
- 介面唯讀，保留GitHub即時讀取、配裝過期面板提示、未知數值與完整輔助標籤。

## 公開圖片與版面

兩款遊戲共用深灰展廳設計。列表為3:4立繪近景大卡，手機雙欄、桌面最多四欄。詳情圖框為正方形，資訊疊在半透明漸層上。頁首使用不透明深灰單色，向下捲動隱藏，向上或回頂顯示。

顯示素材來自HoYoWiki。來源網址、尺寸與SHA-256記錄在 [原神來源索引](public/asset_sources.json) 及 [絕區零來源索引](public/zzz_asset_sources.json)。角色與裝備依實際名稱、ID及部位對應，缺圖保留替代狀態，不使用私人證據代替展示素材。33種原神武器已依使用者要求恢復HoYoWiki方形圖示與原本顯示尺寸。

人物裁切設定在lib/artwork_edits.json，88張衍生圖與設定一起保存。日常構圖調整使用 [圖片編輯器](tools/artwork_editor/README.md)，完成後再部署。共用責任與視覺規則見 [元件說明](components/README.md)。

副詞條亮起與強化次數依遊戲畫面保存。每個有效初始詞條計一次，再加已確認的強化次數。理論上限使用角色已觀測的有效集合，排除相同主詞條後，最多四個有效初始詞條加五次有效強化。此計算不改寫觀測，不代表裝備還能強化幾次。

詳情可切換精簡或完整標籤。角色等級、命座或影畫及目前／最大仍保留在人物圖下方。裝備名稱與星數在完整模式顯示，讀屏保留完整名稱。全站保留觸控、滾輪及鍵盤捲動，減少動態效果時停用進入與展開動畫。

遊戲美術版權歸HoYoverse。公開展示素材與私人影片證據分開保存，索引參考 [genshin-db](https://github.com/theBowja/genshin-db)。

## 本機預覽

本機預覽只供介面驗證。發布沿用既有Site身分、分享範圍與本次授權。

PowerShell 啟動方式：

```powershell
$env:GENSHIN_PREVIEW_REPO = (Resolve-Path ../genshin-account).Path
npm run dev -- --host 127.0.0.1 --port 5173
```

指定路徑後，僅開發伺服器從該repo讀取角色，資料唯讀且拒絕保存請求。正式建置不啟用本機資料讀取，也不把它作為GitHub連線失敗的替代。

## 執行與驗證

使用 Node 22.13 以上版本。首次安裝遵循 Sites skill 的 install-dependencies.mjs。若新增依賴，先更新 package-lock.json。

```text
node scripts/prepare-test-fixtures.mjs <本機資料 repo 的絕對路徑>
npm test
node node_modules/typescript/bin/tsc --noEmit
npm run dev
npm run build
```

帳號驗證器保留v1與v2相容性，v2保存強化次數與有效判定。substat_rolls註記不參與fingerprint，兩版沿用相同面板比較規則。網站介面維持唯讀。

修改 schemas/account.schema.json 或 schemas/account.v1.schema.json 後，先執行 node scripts/compile-schema.mjs，重新產生不依賴執行期 eval 的驗證器。schema 應與資料 repo 一致。

測試資料只供驗證，tests/fixtures保持忽略且不進來源同步或部署。prepare-test-fixtures保留固定v1歷史基準，並從明確指定的帳號repo準備目前兩款正式資料、來源索引及SHA。獨立Sites來源也必須先執行這個準備步驟。測試涵蓋摘要、指紋、資料驗證、未知值、觀測保留、正式API讀取、衝突、原子保存、重複請求與不確定寫入結果。

## 身分與秘密設定

Sites分享範圍依使用者已確認的公開設定。角色API讀取與寫入仍檢查Sites注入的登入身分，寫入另檢查同源Origin。伺服器固定repo、分支及可寫檔案，不提供任意代理。

在 Sites 環境設定加入 GITHUB_TOKEN 並標記為 Secret。使用只涵蓋此 repo 的 fine-grained token，Contents 設為 Read and write。變更秘密值後須重新部署。token 不放入原始碼、瀏覽器、.openai/hosting.json 或日誌。

GET /api/health是唯讀運作檢查，只回傳連線狀態、版本及數量，不回傳憑證。它不代替角色API的登入與寫入檢查。

## 保存與證據

API 保存會驗證與 repo 相同的 schema、裝備歸屬、部位、固定主詞條及引用。限制編輯既有記錄，原始來源、穩定 ID、角色類型和觀測不可改寫。手動更新標為 user_reported。

所有讀取固定在同一 commit。GraphQL createCommitOnBranch 使用 expectedHeadOid 並原子寫入兩個檔案。保存後讀回新 commit 的 account.json 核對。近期提交保存 requestId 和候選內容摘要，最多檢查最近 30 次帳號更新。

截圖由正式 manifest 解析，檔案路徑由伺服器限定，讀取後核對 SHA-256。此版在開啟截圖時校驗該檔，不在每次編輯時重下載全部證據。完整證據校驗由資料 repo 的 validate.py 執行。

API 參考：[GitHub commit mutation](https://docs.github.com/en/graphql/reference/commits)、[fine-grained token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)。

## 發布

沿用 .openai/hosting.json 的 project_id。依 Sites skill 使用 source helper 保存精確來源及封裝，再發布到既有Site。保留目前公開範圍，不另建Site或變更分享設定。

尚未執行真正的角色資料寫入驗收，不應僅憑測試通過就宣稱線上寫入已驗證。

## HOYO 多遊戲結構

- `app/hoyo.tsx` 提供遊戲切換，原有角色、隊伍與培養頁面保留。
- 原神維持 `data/account.json` 與既有 schema，避免歷史證據、面板指紋或使用者修改遺失。
- 絕區零使用獨立 `data/zzz/account.json`、`/api/zzz` 與角色畫面；未確認數值保留 null。
- 展示圖片採已核對官方角色資產；私人錄影截圖仍留在 evidence/zzz，僅經登入保護 API 讀取作為證據。
- 品牌統一 HOYO；既有 GitHub repo 和 Site slug 保留，舊連結繼續可用。

### 角色與配裝共用展示

原神與絕區零共用 `MetricLabel`、`ArtifactSubstat`、`EffectiveBadge` 與角色／配裝卡片 CSS；`CenteredHeader` 的可選 action 保持標題置中。數值規則不共用：原神沿用 `artifact_rolls.mjs`，絕區零使用 `zzz_discs.mjs`，只計入有證據的有效性及強化次數，未確認回傳 null。絕區零固定呈現六個槽位，缺少觀測顯示尚未確認而非未裝備。低等級盤以 `substatsComplete` 確認完整性，不以副詞條必須四個判定。正式帳號資料與證據不因排版修改而更動。

## 絕區零展示圖片

38位角色與音擎、驅動盤及建議邦布使用已核對的HoYoWiki展示素材。來源按名稱、官方條目與內容ID核對，不猜近似名稱。人物列表優先使用已保存的裁切稿，詳情使用同一套正方形圖框。

來源 URL、官方 ID、名稱、尺寸與 SHA-256 見 public/zzz_asset_sources.json；顯示對照見 lib/zzz_assets.json。遊戲美術版權歸 HoYoverse，這不是額外授權聲明。原始影片截圖仍在私人資料庫保留，僅作數值證據，與展示圖片分離。此更新不改角色配裝、面板或有效詞條。
