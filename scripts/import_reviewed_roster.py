"""Merge a reviewed local capture batch, retaining existing IDs and observations.

The review folder contains reviewed.json, catalog_*.json, inventory.json,
existing_artifact_updates.json and full captured frames. This command only
writes a new account file when every new source directory is absent.
"""
import argparse
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import shutil

from account_model import SLOTS, FLAT_KEYS, build_fingerprint, file_sha256, read_json, write_json
from migrate_account import migrate

ALIASES = {"elemental_mastery": "em", "hp_percent": "hp_pct", "atk_percent": "atk_pct", "def_percent": "def_pct"}
WEAPONS = {"WEAPON_SWORD_ONE_HAND": "sword", "WEAPON_CLAYMORE": "claymore", "WEAPON_POLE": "polearm", "WEAPON_BOW": "bow", "WEAPON_CATALYST": "catalyst"}

def stat(key, value):
    key = ALIASES.get(key, key)
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return {"key": key, "value": value, "unit": "flat" if key in FLAT_KEYS else "percent"}

def substats(text):
    result = []
    for item in text.split(","):
        key, value = item.split("=")
        result.append(stat(key, None if value == "null" else float(value)))
    return result

def import_reviewed(review, root, imported_at):
    review, root = Path(review).resolve(), Path(root).resolve()
    raw = read_json(review / "reviewed.json")
    updates = read_json(review / "existing_artifact_updates.json")
    catalog = {x["name"]: x for x in read_json(review / "catalog_characters.json")}
    artifact_catalog = {x["id"]: x for x in read_json(review / "catalog_artifacts.json")}
    inventory = {x["file"][4:8]: x for x in read_json(review / "inventory.json")}
    source_ids = {v: "video_" + v + "_20261111" for v in inventory}
    source_ids["jpeg"] = "image_chevreuse_flower_20261111"
    for sid in source_ids.values():
        if (root / "evidence" / sid).exists() or (root / "imports" / sid).exists():
            raise ValueError("Refusing to overwrite source " + sid)
    account = migrate(read_json(root / "data/account.json"))
    evidence_sources = {shot["id"]: source_id for source_id in account["source_ids"] for shot in read_json(root / f"evidence/{source_id}/manifest.json")["screenshots"]}
    existing_ids = {c["id"] for c in account["characters"]}
    if existing_ids.intersection(raw):
        raise ValueError("New character ID collides with an existing record")
    shots, files, refs, source_raw = {}, [], {}, {}
    recasts = {v: read_json(review / f"IMG_{v}/recasts/index.json") for v in inventory}

    def proof(video, frame, cid, kind):
        if frame is None:
            return None
        if isinstance(frame, str) and ":" in frame:
            video, frame = frame.split(":")
            frame = int(frame) if frame.isdigit() else frame
        sid = source_ids[video]
        key = (video, str(frame), cid, kind)
        if key in refs:
            return refs[key]
        if video == "jpeg":
            path = review.parent / "6314203053497718022_121.jpg"
            seconds = None
        elif isinstance(frame, int):
            path = review / f"IMG_{video}/frames/{frame:04d}.png"
            seconds = frame - .5
        elif frame.startswith("r"):
            recast = recasts[video][int(frame[1:]) - 1]
            path = review / f"IMG_{video}/recasts" / recast["file"]
            seconds = recast["time_seconds"]
        elif frame.startswith("t"):
            path = review / f"IMG_{video}/samples/{frame}.png"
            seconds = float(frame[1:])
        else:
            raise ValueError("Unknown frame " + str(frame))
        if not path.is_file():
            raise ValueError("Missing reviewed frame " + str(path))
        index = len(shots.setdefault(video, [])) + 1
        eid = f"{sid}_shot_{index:03d}"
        relative = f"evidence/{sid}/screenshots/{index:03d}{path.suffix.lower()}"
        shots[video].append({"id": eid, "path": relative, "sha256": file_sha256(path), "time_seconds": seconds, "character_id": cid, "kind": kind, "verification": "agent_reviewed"})
        files.append((path, root / relative))
        refs[key] = eid
        return eid

    def provenance(eids, notes=None):
        eids = list(dict.fromkeys(e for e in eids if e))
        sources = list(dict.fromkeys(evidence_sources.get(e, e.rsplit("_shot_", 1)[0]) for e in eids))
        return {"source_ids": sources, "evidence_refs": eids, "verification": "agent_reviewed", "notes": notes or []}

    def rolls(artifact, cid, counts, effective):
        return {"character_id": cid, "values": [{"key": s["key"], "enhancements": counts[i], "effective": None if effective is None else i in effective} for i, s in enumerate(artifact["substats"])]}

    def artifact_from_capture(capture, cid, slot, aid, video):
        frame, set_id, key, value, subs, level, rarity, counts, effective = capture
        definition = artifact_catalog[set_id]
        result = {"id": aid, "name": definition[slot]["name"], "set_name": definition["name"], "slot": slot, "rarity": rarity, "level": level, "main_stat": stat(key, value), "substats": substats(subs), "provenance": provenance([proof(video, frame, cid, "artifact_" + slot)])}
        result["substat_rolls"] = rolls(result, cid, counts, effective)
        return result

    for cid, c in raw.items():
        v = c["video"]
        source_raw.setdefault(v, []).append(c)
        overview, panel, weapon = c["overview"], c["panel"], c["weapon"]
        definition = catalog.get(c["name"])
        element = "cryo" if cid == "traveler_cryo" else definition["elementType"].removeprefix("ELEMENT_").lower()
        weapon_type = "sword" if cid == "traveler_cryo" else WEAPONS[definition["weaponType"]]
        sid = source_ids[v] + "_" + cid + "_panel"
        character = {"id": cid, "name": c["name"], "element": element, "weapon_type": weapon_type, "level": {"current": overview[1], "cap": overview[2]}, "constellation": c["constellation"][1], "friendship": overview[3], "talents": {"base": dict.fromkeys(("normal", "skill", "burst")), "displayed": dict(zip(("normal", "skill", "burst"), c["talents"][1:])), "bonus_context": None}, "panel_snapshot_id": sid, "provenance": provenance([proof(v, overview[0], cid, "overview"), proof(v, c["constellation"][0], cid, "constellation"), proof(v, c["talents"][0], cid, "talents")], c.get("notes", []))}
        account["characters"].append(character)
        wid = f"weapon_{source_ids[v]}_{cid}"
        account["weapons"].append({"id": wid, "name": weapon[1], "weapon_type": weapon_type, "rarity": weapon[2], "level": {"current": weapon[3], "cap": weapon[4]}, "refinement": weapon[5], "base_atk": weapon[6], "secondary_stat": stat(weapon[7], weapon[8]), "provenance": provenance([proof(v, weapon[0], cid, "weapon")])})
        eq = {"weapon_id": wid, "artifacts": {}}
        for slot, capture in zip(SLOTS, c["artifacts"]):
            aid = f"artifact_{source_ids[v]}_{cid}_{slot}"
            artifact = artifact_from_capture(capture, cid, slot, aid, v)
            # Exact equipped-item observations are retained as distinct identities.
            # Revisited known items are updated through explicit existing IDs below.
            account["artifacts"].append(artifact)
            eq["artifacts"][slot] = aid
        account["equipment"][cid] = eq
        stats = [stat(k, value) for k, value in zip(("hp", "atk", "def", "em"), overview[4:])]
        stats += [stat(k, value) for k, value in zip(("crit_rate", "crit_dmg", "energy_recharge", element + "_dmg_bonus"), panel[1:])]
        if "healing_bonus" in c:
            stats.append(stat("healing_bonus", c["healing_bonus"]))
        panel_refs = [proof(v, overview[0], cid, "overview"), proof(v, panel[0], cid, "panel")]
        panel_refs += [proof(v, f, cid, "panel_elements") for f in c.get("panel_extra_frames", [])]
        account["panel_snapshots"].append({"id": sid, "character_id": cid, "observed_at": None, "imported_at": imported_at, "build_fingerprint": build_fingerprint(account, cid), "stats": stats, "context": {"team_character_ids": None, "buffs": None, "notes": ["影片當時的顯示值。未確認隊伍、臨時加成、天賦加成來源及遊戲版本。"]}, "provenance": provenance(panel_refs)})

    for update in updates:
        artifact = next(x for x in account["artifacts"] if x["id"] == update["artifact_id"])
        artifact["substat_rolls"] = rolls(artifact, update["character_id"], update["counts"], update["effective"])
        eid = proof(update["video"], update["frame"], update["character_id"], "artifact_" + artifact["slot"])
        old = artifact["provenance"]
        artifact["provenance"] = provenance(old["evidence_refs"] + [eid], old["notes"] + ["新影片核對主副詞條數值一致，補記強化次數與亮起狀態。"])

    # The additional image supersedes the flower. The earlier panel remains stale.
    cid = "chevreuse"
    aid = account["equipment"][cid]["artifacts"]["flower"]
    previous = next(x for x in account["artifacts"] if x["id"] == aid)
    current = artifact_from_capture(raw[cid]["flower_update"], cid, "flower", aid, "jpeg")
    current["provenance"] = provenance(previous["provenance"]["evidence_refs"] + current["provenance"]["evidence_refs"], ["使用者指認補充圖為夏沃蕾生之花。以 +20 截圖更新同件聖遺物，原 +0 影片證據與面板保留。"])
    account["artifacts"][account["artifacts"].index(previous)] = current
    account["source_ids"].extend(source_ids.values())
    account["updated_at"] = imported_at
    account["coverage"]["notes"].append("新增九段影片的 43 位已培養角色，合計 47 位。原有四位角色的裝備 ID 保留。僅盤點實際展開的裝備，未覆蓋完整背包。")
    from validate import validate_account
    errors, warnings = validate_account(account)
    if errors:
        raise ValueError("\n".join(errors))
    # All input files and in-memory data have passed checks before writing.
    for source, target in files:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    for v, source_id in source_ids.items():
        extraction = {"format": "reviewed_capture_v1", "characters": source_raw.get(v, []), "artifact_updates": updates if v == "5689" else [], "notes": ["整數 frame 代表一秒擷取的第 n 張，時間為 n-0.5 秒。r 前綴對應本來源精選畫面，t 前綴為秒數。數值與強化次數由畫面核對，亮起狀態依畫面背景辨識及人工核對。"]}
        extraction["frames"] = {s["id"]: {"path": s["path"], "time_seconds": s["time_seconds"]} for s in shots.get(v, [])}
        if v == "jpeg":
            extraction["flower_update"] = raw["chevreuse"]["flower_update"]
        relative = f"imports/{source_id}/extracted.json"
        write_json(root / relative, extraction)
        filename = "6314203053497718022_121.jpg" if v == "jpeg" else inventory[v]["file"]
        media = {"type": "image" if v == "jpeg" else "video", "file_name": filename, "sha256": file_sha256(review.parent / filename), "resolution": [1280, 588] if v == "jpeg" else [inventory[v]["width"], inventory[v]["height"]], "recorded_at": None, "game_version": None, "stored_in_repo": v == "jpeg"}
        if v != "jpeg":
            media["duration_seconds"] = inventory[v]["duration"]
        write_json(root / f"evidence/{source_id}/manifest.json", {"schema_version": 2, "id": source_id, "imported_at": imported_at, "media": media, "extraction": {"path": relative, "sha256": file_sha256(root / relative)}, "screenshots": shots.get(v, []), "notes": ["來源錄影日期與遊戲版本未知。截圖保留完整畫面及原擷取解析度。"]})
    write_json(root / "data/account.json", account)
    return account, warnings

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--imported-at", default=datetime.now(timezone.utc).isoformat(timespec="seconds"))
    args = parser.parse_args()
    account, warnings = import_reviewed(args.review, args.root, args.imported_at)
    print(f"Imported {len(account['characters'])} characters, {len(account['artifacts'])} artifacts")
    for warning in warnings:
        print("WARNING: " + warning)
