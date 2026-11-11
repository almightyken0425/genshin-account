"""Import this extraction format as a new account candidate, without overwriting state."""
import argparse
from datetime import datetime, timezone
from pathlib import Path
import re
import shutil

from account_model import build_fingerprint, contained_path, file_sha256, read_json, write_json

SLOT_MAP = dict(zip(("生之花", "死之羽", "時之沙", "空之杯", "理之冠"), ("flower", "plume", "sands", "goblet", "circlet")))
ELEMENTS = {"冰": "cryo", "水": "hydro", "火": "pyro", "草": "dendro", "雷": "electro", "風": "anemo", "岩": "geo"}
WEAPON_TYPES = {"長柄武器": "polearm", "單手劍": "sword", "雙手劍": "claymore", "弓": "bow", "法器": "catalyst"}
STAT_NAMES = {"生命值": "hp", "攻擊力": "atk", "防禦力": "def", "元素精通": "em", "暴擊率": "crit_rate", "暴擊傷害": "crit_dmg", "元素充能效率": "energy_recharge", **{name + "元素傷害加成": key + "_dmg_bonus" for name, key in ELEMENTS.items()}}

def parse_stat(text):
    match = re.fullmatch(r"(.+?)\s*\+?([0-9][0-9,.]*)(%)?", text)
    if not match or match[1].strip() not in STAT_NAMES:
        raise ValueError(f"Unknown stat: {text}")
    key = STAT_NAMES[match[1].strip()]
    percent = bool(match[3])
    if key in ("hp", "atk", "def") and percent:
        key += "_pct"
    value = float(match[2].replace(",", ""))
    return {"key": key, "value": int(value) if value.is_integer() else value, "unit": "percent" if percent else "flat"}

def import_bundle(source_dir, output_dir, source_id, imported_at, video_path=None, recorded_at=None):
    source_dir, output_dir = Path(source_dir).resolve(), Path(output_dir).resolve()
    if not re.fullmatch(r"[a-z][a-z0-9_]*", source_id):
        raise ValueError("source_id must be a stable snake_case ID")
    datetime.fromisoformat(imported_at.replace("Z", "+00:00"))
    if recorded_at:
        datetime.fromisoformat(recorded_at.replace("Z", "+00:00"))
    for relative in ("data/account.json", f"imports/{source_id}", f"evidence/{source_id}"):
        if (output_dir / relative).exists():
            raise ValueError(f"Refusing to overwrite {relative}. Use a fresh candidate directory.")
    raw_path = source_dir / "character_data.json"
    raw = read_json(raw_path)
    account = {"schema_version": 1, "updated_at": imported_at, "source_ids": [source_id], "coverage": {"roster": "partial", "inventory": "equipped_items_only", "notes": ["只涵蓋影片展開資料頁的角色與穿戴裝備，未盤點完整帳號。", "錄影日期及遊戲版本未知。"]}, "characters": [], "weapons": [], "artifacts": [], "equipment": {}, "panel_snapshots": [], "teams": []}
    screenshots = []
    copies = []
    def proof(character_id, kind, relative, seconds):
        path = contained_path(source_dir, relative)
        if not path.is_file():
            raise ValueError(f"Missing evidence: {relative}")
        evidence_id = f"{source_id}_{path.stem}"
        target = f"evidence/{source_id}/screenshots/{path.name}"
        screenshots.append({"id": evidence_id, "path": target, "sha256": file_sha256(path), "time_seconds": seconds, "character_id": character_id, "kind": kind, "verification": "agent_reviewed"})
        copies.append((path, output_dir / target))
        return evidence_id
    def provenance(refs):
        return {"source_ids": [source_id], "evidence_refs": refs, "verification": "agent_reviewed", "notes": []}
    for index, old in enumerate(raw["characters"], 1):
        cid = old["id"]
        refs = {kind: proof(cid, kind, relative, old["sources"][kind]) for kind, relative in old["source_screenshots"].items()}
        level, cap = map(int, old["level"].split("/"))
        sid = f"{source_id}_{cid}_panel"
        character = {"id": cid, "name": old["name"], "element": ELEMENTS[old["element"]], "weapon_type": WEAPON_TYPES[old["weapon_type"]], "level": {"current": level, "cap": cap}, "constellation": old["constellation"], "friendship": old["friendship"], "talents": {"base": dict.fromkeys(("normal", "skill", "burst")), "displayed": old["talents_displayed"], "bonus_context": None}, "panel_snapshot_id": sid, "provenance": provenance([refs[k] for k in ("overview", "constellation", "talents")])}
        account["characters"].append(character)
        wid = f"weapon_{source_id}_{index:03d}"
        weapon = old["weapon"]
        wl, wc = map(int, weapon["level"].split("/"))
        account["weapons"].append({"id": wid, "name": weapon["name"], "weapon_type": character["weapon_type"], "rarity": weapon["rarity"], "level": {"current": wl, "cap": wc}, "refinement": weapon["refinement"], "base_atk": weapon["base_atk"], "secondary_stat": parse_stat(weapon["substat"]), "provenance": provenance([refs["weapon"]])})
        equipped = {"weapon_id": wid, "artifacts": {}}
        for old_artifact in old["artifacts"]:
            slot = SLOT_MAP[old_artifact["slot"]]
            aid = f"artifact_{source_id}_{len(account['artifacts']) + 1:03d}"
            evidence_id = proof(cid, f"artifact_{slot}", old_artifact["screenshot"], old_artifact["time_seconds"])
            account["artifacts"].append({"id": aid, "name": old_artifact["name"], "set_name": old_artifact["set"], "slot": slot, "rarity": old_artifact["rarity"], "level": old_artifact["level"], "main_stat": parse_stat(old_artifact["main_stat"]), "substats": [parse_stat(s) for s in old_artifact["substats"]], "provenance": provenance([evidence_id])})
            equipped["artifacts"][slot] = aid
        account["equipment"][cid] = equipped
        stats = []
        for key, value in old["stats"].items():
            key = {"defense": "def", "elemental_mastery": "em", "crit_damage": "crit_dmg", "element_damage_bonus": character["element"] + "_dmg_bonus"}.get(key, key)
            stats.append({"key": key, "value": value, "unit": "flat" if key in ("hp", "atk", "def", "em", "stamina") else "percent"})
        account["panel_snapshots"].append({"id": sid, "character_id": cid, "observed_at": recorded_at, "imported_at": imported_at, "build_fingerprint": build_fingerprint(account, cid), "stats": stats, "context": {"team_character_ids": None, "buffs": None, "notes": ["錄影當時面板。未確認共鳴、臨時加成及天賦加成來源。"]}, "provenance": provenance([refs[k] for k in ("overview", "stats", "elements")])})
    ids = [s["id"] for s in screenshots]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate evidence IDs")
    # Validate the entire in-memory candidate before creating persistent files.
    from validate import validate_account
    errors, warnings = validate_account(account)
    if errors:
        raise ValueError("\n".join(errors))
    extracted_target = f"imports/{source_id}/extracted.json"
    manifest = {"schema_version": 1, "id": source_id, "imported_at": imported_at, "video": {"file_name": Path(raw["source_video"]).name, "sha256": file_sha256(video_path) if video_path else None, "duration_seconds": raw["video_duration_seconds"], "resolution": raw["video_resolution"], "recorded_at": recorded_at, "game_version": None, "stored_in_repo": False}, "extraction": {"path": extracted_target, "sha256": file_sha256(raw_path)}, "screenshots": screenshots, "notes": raw["notes"]}
    copies.append((raw_path, output_dir / extracted_target))
    for src, dest in copies:
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
    write_json(output_dir / f"evidence/{source_id}/manifest.json", manifest)
    write_json(output_dir / "data/account.json", account)
    return account

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--video", type=Path)
    parser.add_argument("--recorded-at")
    parser.add_argument("--imported-at", default=datetime.now(timezone.utc).isoformat(timespec="seconds"))
    args = parser.parse_args()
    try:
        account = import_bundle(args.source_dir, args.output, args.source_id, args.imported_at, args.video, args.recorded_at)
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f"Import failed: {error}\n")
    print(f"Imported {len(account['characters'])} characters, {len(account['weapons'])} weapons, {len(account['artifacts'])} artifacts")

if __name__ == "__main__":
    main()
