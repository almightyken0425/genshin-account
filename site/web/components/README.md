# 共用介面元件

原神與絕區零共用呈現結構。遊戲頁提供已確認的圖片與數值，元件負責顯示及互動。

本次隊伍與培養頁以 Site 來源 `dde1b564f44d8fcfb6cd7c1ab44f3d94abfb899a` 為基準。帳號資料、遊戲計算與圖片來源契約維持各自的責任。

## 整站視覺規則

使用者已確認人物展示優先、全站深灰展廳，以及兩款遊戲採用同一套設計。列表採立繪裁切的近景大卡，詳情使用相同大小的正方形圖框。手機列表使用雙欄，桌面最多四欄。旅行者兩種圖框都使用已核對的女性原畫區域。

色彩、圖面、邊界、焦點、陰影與圓角的唯一值來源是 [theme.css](theme/theme.css)。頁面與元件引用語意變數，不自行建立遊戲配色。

| 視覺角色 | 變數 | 使用條件 |
| --- | --- | --- |
| 網頁背景 | `--canvas` | 所有頁面的最底層 |
| 資訊面板 | `--surface`、`--surface-raised` | 數值、裝備詳情、隊伍與培養內容 |
| 人物展示 | `--art-surface`、`--art-glow`、`--art-shade` | 兩款遊戲共用的圖框、柔和襯光與數字漸層 |
| 文字與註記 | `--ink`、`--muted`、`--subtle` | 依資訊重要程度選擇，深色服裝不靠加亮素材處理 |
| 選取與有效數值 | `--accent`、`--accent-soft`、`--effective-*` | 使用中操作與已確認有效的觀測 |
| 操作與焦點 | `--surface-hover`、`--focus-ring` | 滑鼠、觸控與鍵盤狀態 |
| 暫浮表面 | `--dock-surface`、`--scrim` | 底部導覽與彈出面板遮罩 |

人物素材可以依構圖採不同適配方式。背景、數字疊層與互動規則保持一致。原神與絕區零不再使用各自的明暗圖面變體。

## 層級與依賴

遊戲頁可以使用以下各層。共用元件不可反向依賴 `app`，也不可取得帳號資料。

| 層級 | 元件 | 責任 |
| --- | --- | --- |
| 視覺基礎 | [theme.css](theme/theme.css) | 全站設計值與原生深色控制項 |
| 媒體基礎 | [MediaImage](media/media_image.tsx) | 圖片載入、缺圖與失敗狀態。來源改變時重新建立載入狀態 |
| 數值呈現 | [MetricLabel](metrics/metric_label.tsx)、[MetricValue](metrics/metric_value.tsx) | 標籤、圖示與欄位結構。格式化由呼叫端提供 |
| 人物圖面 | [ImageSurface](character/image_surface.tsx) | 圖框、圖片適配、背景色與唯一的半透明疊層 |
| 人物組合 | [CharacterCard](character/character_card.tsx)、[PortraitSummary](character/portrait_summary.tsx) | 列表按鈕與詳情摘要。共用三欄數值列 |
| 裝備呈現 | [EquipmentTile](equipment/equipment_tile.tsx)、[ArtifactSubstat](equipment/artifact_substat.tsx) | 共用預覽按鈕、副詞條與有效數徽章。只顯示傳入結果 |
| 導覽 | [GameNavigation](navigation/game_navigation.tsx)、[GameSwitch](navigation/game_switch.tsx)、[NavigationDock](navigation/navigation_dock.tsx)、[CenteredHeader](navigation/centered_header.tsx) | 共用三個分頁、遊戲切換、底部導覽生命週期、標題與返回操作 |
| 隊伍呈現 | [TeamCard](teams/team_card.tsx)、[TeamMembers](teams/team_members.tsx) | 共用隊伍按鈕與成員導覽，按實際人數排列三人或四人隊 |
| 遊戲適配 | [絕區零裝備圖片](games/zzz/equipment_image.tsx) | 將絕區零透明邊界資料轉成圖片樣式，再使用 MediaImage |

人物組合依賴人物圖面、媒體與數值呈現。遊戲適配層可以使用共用元件，共用基礎層不查詢遊戲素材或套用遊戲規則。

隊伍與培養頁共用導覽及隊員呈現。遊戲頁持有網址、返回位置與帳號資料，共用元件只接收圖片、姓名及操作。原神保留既有七隊和愛可菲目標，絕區零依已記錄角色篩選三人搭配。

絕區零的官方技能依據與培養方向集中在 [隊伍建議資料](../lib/zzz_team_guides.json)，包含查證日期、版本、基準提交與資料限制。[建議邏輯](../lib/zzz_recommendations.mjs) 只從已確認的等級與盤面產生項目，不以有效詞條數量排列角色強弱。音擎、核心技或技能缺少觀測時列為待核對，不記成未培養。

## 人物圖與數值

列表卡片與詳情摘要都使用人物圖面。圖面依序包含圖片、半透明漸層與三個數值。

- 列表只顯示數字。等級、命之座或影畫、有效詞條的名稱保留在輔助名稱與提示。
- 詳情數值列可以顯示圖示，仍使用同一疊層。切換完整模式不會讓這列出現文字標籤。
- 呼叫端先計算有效詞條。元件保留 `0`，將 `null` 顯示為破折號。
- 圖片適配由呼叫端提供。兩款遊戲共用圖面、背景與漸層結構。
- 兩款遊戲的詳情圖框都固定為正方形。未編輯的立繪完整置入圖框，儲存構圖後直接顯示正方形衍生圖。
- CharacterCard 保留原生按鈕屬性與 ref，讓角色頁返回後可以恢復焦點。
- 圖片失敗時保留圖框與數值。MediaImage 不改用帳號證據或其他未指定的來源。

圖面與疊層樣式集中在 [character.css](character/character.css)。媒體替代狀態集中在 [media.css](media/media.css)。頁面樣式只管理頁面排列與遊戲特有內容。

列表裁切座標分別保存在 [原神裁切表](../lib/genshin_roster_crops.json) 與 [絕區零裁切表](../lib/zzz_roster_crops.json)。兩款遊戲都以頭部和上半身佔比檢查構圖，不以原圖總尺寸判斷清晰度。卡片使用精確的 3:4 縮圖，不再由 CSS 二次裁切不同長寬比的圖片。

共用 [縮圖建置腳本](../scripts/build-roster-assets.mjs) 核對來源校驗值與裁切邊界，保留透明度，輸出最高 600×800 的 WebP。原生裁切較小時維持原尺寸，不放大頭像或補繪角色。每張衍生圖在來源索引記錄原圖、裁切座標、輸出尺寸與校驗值。

修改裁切表後執行 `npm run assets:roster`。使用 `npm run assets:roster -- --check` 重新產生並比對衍生圖片與來源紀錄。清單完整後才更新網站，避免部分角色回退成大頭貼。

日常構圖調整使用 [本機圖片編輯器](../tools/artwork_editor/README.md)。四個總覽直接使用 CharacterCard 與 PortraitSummary，讓圖框、漸層與數值結構和網站一致。編輯器不取得遊戲計算責任，資料適配器提供實際帳號中的三項數值。

[共用裁切運算](../lib/artwork_math.mjs) 定義縮放、位移及輸出尺寸。瀏覽器遮罩與伺服器輸出使用相同座標。儲存後的圖像與來源校驗資料分別保存在 `public/assets/artwork_edits/` 及 `lib/artwork_edits.json`。兩款遊戲的素材選擇器優先讀取這份編輯稿，部署時也沿用同一份檔案。

裝備預覽共用 [equipment_tile.css](equipment/equipment_tile.css)。精簡模式顯示圖片與展開提示，完整模式才顯示武器、聖遺物、音擎或驅動盤名稱。遊戲頁持有展開狀態與資料，EquipmentTile 保留原生按鈕屬性及輔助名稱。

武器與音擎使用明確尺寸的方形格子，圖片完整置入並保留內距。完整武器立繪由 HoYoWiki 圖鑑取得，避免圖示來源已截斷尖端時仍靠放大容器處理。

## 本次盤點的責任邊界

| 項目 | 處理方式 | 理由 |
| --- | --- | --- |
| 人物列表、詳情與三欄數值 | 抽成同一套組合元件 | 兩款遊戲具有相同呈現與焦點需求 |
| 圖片載入失敗 | 合併到 MediaImage | 避免兩套圖片元件對缺圖採不同處理 |
| 底部導覽的捲動與焦點生命週期 | 合併到 NavigationDock | 兩頁原本具有相同事件與清理規則 |
| 數值標籤、有效詞條與頁面標題 | 保留既有共用行為並整理目錄 | 已有多個呼叫端，不再新增平行實作 |
| 裝備預覽與標籤模式 | 合併到 EquipmentTile | 圖片種類不同，按鈕與資訊層級相同 |
| 裝備詳情與套裝排列 | 保留遊戲頁適配 | 槽位、觀測資料與可展開內容不同 |
| 帳號讀取、歷史導覽與數值計算 | 留在遊戲頁及各自的 lib | 使用不同資料契約，不由視覺元件統一 |

後續新增介面時，先判斷共用責任，再選擇既有元件或明確變體。只有實際行為不同時，才建立遊戲適配元件。

修改人物共用元件後，驗證兩款遊戲的列表與詳情。檢查桌面、窄螢幕、零值、未知值、缺圖及返回焦點。涉及遊戲切換時，再檢查 G／Z、鍵盤與瀏覽器歷史導覽。
