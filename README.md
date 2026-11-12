# HOYO

保存原神與絕區零的個人角色現況、裝備及影片截圖證據，供唯讀 Sites 查看與助手分析。兩款遊戲使用獨立資料契約，不混用角色、裝備或數值規則。

產品名稱為 HOYO。既有 GitHub repo 與 Sites 網址保留，避免中斷連結及資料連線。

先看 [帳號資料摘要](docs/account_summary.md)。原神現況涵蓋 47 名角色、47 件武器、236 件聖遺物，未盤點完整角色庫與背包。本次新增內容與補充核對見 [匯入核對紀錄](docs/import_review_20261111.md)。

## 資料入口

| 內容 | 位置 | 用途 |
| --- | --- | --- |
| 原神正式現況 | [data/account.json](data/account.json) | 角色、裝備、配裝、面板觀測及隊伍 |
| 個人偏好 | [data/preferences.json](data/preferences.json) | 培養目標、喜好與資源限制，未提供的欄位保持未知 |
| 閱讀摘要 | [docs/account_summary.md](docs/account_summary.md) | 由正式現況產生，含截圖連結 |
| 原始辨識 | [imports/video_001/extracted.json](imports/video_001/extracted.json) | 保留首次辨識結果，供回查 |
| 證據索引 | [evidence/video_001/manifest.json](evidence/video_001/manifest.json) | 影片資訊、截圖時間與檔案校驗值 |
| 更新方式 | [docs/update_workflow.md](docs/update_workflow.md) | 修改現況、加入新觀測及匯入新影片 |
| 資料契約 | [docs/data_contract.md](docs/data_contract.md) | 欄位、單位、未知值與面板失效規則 |
| 分析紀錄 | [analysis/README.md](analysis/README.md) | 建議的版本依據與保存格式 |
| Sites 交接 | [site/README.md](site/README.md) | 網站來源、部署方式與驗證狀態 |

| 絕區零正式現況 | [data/zzz/account.json](data/zzz/account.json) | 影片確認的角色與裝備觀測，未知欄位保持 null |
| 絕區零資料契約 | [docs/zzz_data_contract.md](docs/zzz_data_contract.md) | 獨立 schema、來源及證據規則 |

## 目前狀態

原神資料及網站已建立。絕區零以獨立影片匯入，未出現在影片或未看清的資訊不補猜；收錄清單不代表完整角色庫。

GitHub 保存正式資料。Sites 透過服務端專用連線唯讀取得資料，不建立另一份可獨立修改的帳號資料庫。

本次影片的錄影日期與遊戲版本未知。匯入時間不代表錄影時間。天賦是畫面顯示等級，基礎等級保持 `null`。

## 本機檢查

使用 Python 3.14。套件版本記錄在 [requirements.txt](requirements.txt)。

```sh
python -m venv .venv
```

Windows PowerShell：

```powershell
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe scripts/validate.py
.venv/Scripts/python.exe -m unittest discover -s tests -v
.venv/Scripts/python.exe scripts/report.py --check
```

macOS 或 Linux：

```sh
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python scripts/validate.py
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python scripts/report.py --check
```

資料變更後執行 `python scripts/report.py` 重新產生摘要，再完成上述檢查。命令中的 `python` 指已啟用虛擬環境的執行器。

GitHub Actions 範本位於 [.github/workflow_templates/validate.yml](.github/workflow_templates/validate.yml)。目前 GitHub 登入缺少 `workflow` 權限，範本尚未啟用。取得所需權限後移入 `.github/workflows/validate.yml`，即可在推送與 Pull Request 時執行相同驗證。

## 保存原則

- 以穩定 ID 表示實際裝備。換裝移動引用，同一件物品不能同時穿在兩個角色身上。
- 保留原始截圖與辨識結果。修正寫入正式現況，並記錄核對依據。
- 不把建議、假設配裝或推算數值當成已完成的遊戲內變更。
- 面板只代表觀測當下。配裝或相關角色資料改變時，舊面板保留並顯示待更新。
- 原始 MP4 留在本機，repo 保存必要截圖及影片校驗值。
