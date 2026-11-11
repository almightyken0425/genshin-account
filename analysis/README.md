# 分析紀錄

此目錄保存培養、配隊與換裝建議。建議不會自動修改 data/account.json。

每份分析至少記錄下列資訊。

| 欄位 | 內容 |
| --- | --- |
| based_on_commit | 讀取資料時的完整 Git commit SHA |
| working_tree_changes | 有無未提交差異及其範圍 |
| generated_at | 含時區的分析時間 |
| goal | 使用者想改善的問題 |
| coverage | 已知角色、裝備與資源範圍 |
| missing_information | 影響結論的資料缺口 |
| recommendations | 建議、理由、優先序與適用條件 |
| sources | 外部機制來源、查證時間與適用版本 |
| status | proposed、accepted、completed 或 superseded |

尚未取得培養目標與完整角色庫，因此目前沒有預先填入配隊或抽卡建議。
新增報告使用日期與主題命名，例如 `2026_11_11_team_review.md`。資料版本改變後，舊報告保留並標明是否仍適用。
