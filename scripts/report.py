"""Generate a GitHub-readable summary from the canonical account."""
import argparse
from pathlib import Path
import sys
from account_model import file_sha256, read_json, snapshot_status
from validate import validate_repository

ROOT = Path(__file__).resolve().parents[1]
LABELS = {"hp": "生命值", "atk": "攻擊力", "def": "防禦力", "em": "元素精通", "stamina": "體力", "hp_pct": "生命值", "atk_pct": "攻擊力", "def_pct": "防禦力", "crit_rate": "暴擊率", "crit_dmg": "暴擊傷害", "energy_recharge": "元素充能效率", "cryo_dmg_bonus": "冰傷加成", "hydro_dmg_bonus": "水傷加成"}
SLOT_LABELS = {"flower": "生之花", "plume": "死之羽", "sands": "時之沙", "goblet": "空之杯", "circlet": "理之冠"}

def cell(value):
    return str(value).replace("|", "\\|").replace("\n", " ")

def number(value):
    return "未知" if value is None else f"{value:g}"

def stat_text(stat):
    value = number(stat["value"])
    if stat["unit"] == "percent" and stat["value"] is not None:
        value += "%"
    return LABELS.get(stat["key"], stat["key"]) + " " + value

def render(root):
    root = Path(root)
    account = read_json(root / "data/account.json")
    weapons = {x["id"]: x for x in account["weapons"]}
    artifacts = {x["id"]: x for x in account["artifacts"]}
    snapshots = {x["id"]: x for x in account["panel_snapshots"]}
    evidence = {}
    for source_id in account["source_ids"]:
        manifest = read_json(root / f"evidence/{source_id}/manifest.json")
        evidence.update({x["id"]: x for x in manifest["screenshots"]})
    def links(record):
        return "、".join(f"[{int(evidence[eid]['time_seconds']) // 60:02d}:{evidence[eid]['time_seconds'] % 60:04.1f}](../{evidence[eid]['path']})" for eid in record["provenance"]["evidence_refs"])
    lines = ["# 帳號資料摘要", "", "此檔由 `scripts/report.py` 產生，修改現況請更新 `data/account.json`。", "", f"資料 SHA-256：`{file_sha256(root / 'data/account.json')}`", "", f"已記錄 {len(account['characters'])} 名角色、{len(weapons)} 件武器、{len(artifacts)} 件聖遺物。", "", f"角色庫範圍：{account['coverage']['roster']}。裝備庫範圍：{account['coverage']['inventory']}。面板代表觀測值，非實戰傷害計算。", "", "天賦依序為普攻／戰技／爆發，表格使用記錄的顯示等級。基礎等級與觀測時間見正式資料，未知值保留為 null。", "", "| 角色 | 等級 | 命座 | 武器 | 精煉 | 天賦 | 面板與配裝 |", "| --- | --- | --- | --- | --- | --- | --- |"]
    for c in account["characters"]:
        eq = account["equipment"][c["id"]]
        w = weapons.get(eq["weapon_id"])
        snapshot = snapshots.get(c["panel_snapshot_id"])
        status = "尚無面板" if snapshot is None else ("符合紀錄時配裝" if snapshot_status(account, snapshot) == "matches_recorded_build" else "配裝已變更，待補面板")
        talents = "／".join(number(c["talents"]["displayed"][key]) for key in ("normal", "skill", "burst"))
        values = [c["name"], number(c["level"]["current"]) + "/" + number(c["level"]["cap"]), number(c["constellation"]), w["name"] if w else "未知", number(w["refinement"]) if w else "未知", talents, status]
        lines.append("| " + " | ".join(cell(v) for v in values) + " |")
    for c in account["characters"]:
        lines += ["", "## " + c["name"], "", "角色證據：" + links(c), ""]
        snapshot = snapshots.get(c["panel_snapshot_id"])
        if snapshot:
            lines += ["面板觀測：" + "、".join(stat_text(s) for s in snapshot["stats"]), "", "面板證據：" + links(snapshot), ""]
        eq = account["equipment"][c["id"]]
        weapon = weapons.get(eq["weapon_id"])
        if weapon:
            lines += [f"武器：{weapon['name']}，{number(weapon['level']['current'])}/{number(weapon['level']['cap'])} 級，精煉 {number(weapon['refinement'])} 階。基礎攻擊力 {number(weapon['base_atk'])}。", "", "武器副屬性：" + (stat_text(weapon["secondary_stat"]) if weapon["secondary_stat"] else "未知"), "", "武器證據：" + links(weapon), ""]
        lines += ["| 部位 | 名稱與套裝 | 強化 | 主詞條 | 副詞條 | 證據 |", "| --- | --- | --- | --- | --- | --- |"]
        for slot, aid in eq["artifacts"].items():
            artifact = artifacts.get(aid)
            if artifact is None:
                lines.append(f"| {SLOT_LABELS[slot]} | 未記錄 | — | — | — | — |")
                continue
            values = [SLOT_LABELS[slot], artifact["name"] + " · " + artifact["set_name"], "+" + number(artifact["level"]), stat_text(artifact["main_stat"]), "、".join(stat_text(s) for s in artifact["substats"]), links(artifact)]
            lines.append("| " + " | ".join(cell(v) for v in values) + " |")
    return "\n".join(lines) + "\n"

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    errors, _ = validate_repository(ROOT)
    if errors:
        print("\n".join(errors))
        return 1
    content = render(ROOT)
    output = ROOT / "docs/account_summary.md"
    if args.check:
        if not output.exists() or output.read_text(encoding="utf-8") != content:
            print("Summary is outdated. Run python scripts/report.py")
            return 1
        print("Summary matches account data")
    else:
        output.write_text(content, encoding="utf-8", newline="\n")
        print("Wrote docs/account_summary.md")
    return 0

if __name__ == "__main__":
    sys.exit(main())
