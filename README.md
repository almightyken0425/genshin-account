# 原神帳號紀錄

保存個人的角色現況、裝備與截圖證據，供後續 Sites 查看、編輯及助手分析使用。

先看 [帳號資料摘要](docs/account_summary.md)。首次匯入涵蓋四名角色、四件武器、20 件聖遺物與 48 張截圖，未盤點完整角色庫與背包。

## 資料入口

| 內容 | 位置 | 用途 |
| --- | --- | --- |
| 正式現況 | [data/account.json](data/account.json) | 角色、裝備、配裝、面板觀測及隊伍 |
| 個人偏好 | [data/preferences.json](data/preferences.json) | 培養目標、喜好與資源限制，未提供的欄位保持未知 |
| 閱讀摘要 | [docs/account_summary.md](docs/account_summary.md) | 由正式現況產生，含截圖連結 |
| 原始辨識 | [imports/video_001/extracted.json](imports/video_001/extracted.json) | 保留首次辨識結果，供回查 |
| 證據索引 | [evidence/video_001/manifest.json](evidence/video_001/manifest.json) | 影片資訊、截圖時間與檔案校驗值 |
| 更新方式 | [docs/update_workflow.md](docs/update_workflow.md) | 修改現況、加入新觀測及匯入新影片 |
| 資料契約 | [docs/data_contract.md](docs/data_contract.md) | 欄位、單位、未知值與面板失效規則 |
| 分析紀錄 | [analysis/README.md](analysis/README.md) | 建議的版本依據與保存格式 |
| Sites 交接 | [site/README.md](site/README.md) | 網站開發邊界與尚待完成的連線驗證 |

## 目前狀態

資料基礎、匯入工具、驗證器與閱讀摘要已建立。Sites 尚未建立或部署，網站登入、讀取與寫回 GitHub 尚未驗證。

GitHub 保存正式資料。Sites 預計透過受支援的服務端連線讀寫同一份資料，不建立另一份可獨立修改的帳號資料庫。

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
