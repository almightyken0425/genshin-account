"""Validate schemas, equipment ownership, observations, and evidence integrity."""
import argparse
from datetime import datetime
from pathlib import Path
import sys
from jsonschema import Draft202012Validator
from account_model import contained_path, file_sha256, read_json, snapshot_status

ROOT = Path(__file__).resolve().parents[1]

def schema_errors(instance, name):
    schema = read_json(ROOT / "schemas" / name)
    Draft202012Validator.check_schema(schema)
    return [f"{'.'.join(map(str, e.absolute_path)) or '$'}: {e.message}" for e in Draft202012Validator(schema).iter_errors(instance)]

def timestamp_error(value, label):
    if value is None:
        return []
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            raise ValueError("timezone required")
    except (ValueError, TypeError, AttributeError):
        return [f"{label}: expected ISO 8601 timestamp with timezone"]
    return []

def validate_account(account):
    errors = schema_errors(account, "account.schema.json")
    warnings = []
    if errors:
        return errors, warnings
    errors.extend(timestamp_error(account["updated_at"], "updated_at"))
    indexes = {}
    for kind in ("characters", "weapons", "artifacts", "panel_snapshots", "teams"):
        records = account[kind]
        ids = [record["id"] for record in records]
        if len(ids) != len(set(ids)):
            errors.append(f"{kind}: duplicate IDs")
        indexes[kind] = {record["id"]: record for record in records}
    chars, weapons, artifacts, snapshots = (indexes[k] for k in ("characters", "weapons", "artifacts", "panel_snapshots"))
    if set(account["equipment"]) != set(chars):
        errors.append("equipment: must contain exactly the known character IDs")
    if len(account["source_ids"]) != len(set(account["source_ids"])):
        errors.append("source_ids: duplicate source IDs")
    used = set()
    for cid, equipment in account["equipment"].items():
        wid = equipment["weapon_id"]
        if wid:
            if wid not in weapons:
                errors.append(f"{cid}: unknown weapon {wid}")
            elif cid in chars and weapons[wid]["weapon_type"] != chars[cid]["weapon_type"]:
                errors.append(f"{cid}: incompatible weapon type")
            if wid in used:
                errors.append(f"{wid}: equipped by multiple characters")
            used.add(wid)
        for slot, aid in equipment["artifacts"].items():
            if not aid:
                continue
            if aid not in artifacts:
                errors.append(f"{cid}: unknown artifact {aid}")
            elif artifacts[aid]["slot"] != slot:
                errors.append(f"{cid}: wrong slot for {aid}")
            if aid in used:
                errors.append(f"{aid}: equipped by multiple characters")
            used.add(aid)
    for record in account["characters"] + account["weapons"]:
        level = record["level"]
        if level["current"] is not None and level["cap"] is not None and level["current"] > level["cap"]:
            errors.append(f"{record['id']}: level exceeds cap")
    for artifact in account["artifacts"]:
        keys = [s["key"] for s in artifact["substats"]]
        if len(keys) != len(set(keys)) or artifact["main_stat"]["key"] in keys:
            errors.append(f"{artifact['id']}: duplicate main/substat keys")
        expected = {"flower": "hp", "plume": "atk"}.get(artifact["slot"])
        if expected and artifact["main_stat"]["key"] != expected:
            errors.append(f"{artifact['id']}: invalid fixed main stat")
    for character in account["characters"]:
        sid = character["panel_snapshot_id"]
        if sid and (sid not in snapshots or snapshots[sid]["character_id"] != character["id"]):
            errors.append(f"{character['id']}: invalid panel snapshot reference")
    for snapshot in account["panel_snapshots"]:
        errors.extend(timestamp_error(snapshot["observed_at"], snapshot["id"] + ".observed_at"))
        errors.extend(timestamp_error(snapshot["imported_at"], snapshot["id"] + ".imported_at"))
        if snapshot["character_id"] not in chars:
            errors.append(f"{snapshot['id']}: unknown character")
        keys = [s["key"] for s in snapshot["stats"]]
        if len(keys) != len(set(keys)):
            errors.append(f"{snapshot['id']}: duplicate panel stat")
        if snapshot["context"]["team_character_ids"] is not None:
            for cid in snapshot["context"]["team_character_ids"]:
                if cid not in chars:
                    errors.append(f"{snapshot['id']}: unknown context character {cid}")
    for team in account["teams"]:
        for cid in team["character_ids"]:
            if cid not in chars:
                errors.append(f"{team['id']}: unknown character {cid}")
    for kind in ("characters", "weapons", "artifacts", "panel_snapshots"):
        for record in account[kind]:
            for source_id in record["provenance"]["source_ids"]:
                if source_id not in account["source_ids"]:
                    errors.append(f"{record['id']}: unknown source {source_id}")
    if not errors:
        # Old observations stay intact. Report staleness rather than manufacturing new totals.
        for character in account["characters"]:
            sid = character["panel_snapshot_id"]
            if sid and snapshot_status(account, snapshots[sid]) == "build_changed":
                warnings.append(f"{character['name']}: recorded panel no longer matches the current build")
    return errors, warnings

def validate_evidence(account, root):
    errors = []
    evidence = {}
    for source_id in account["source_ids"]:
        try:
            manifest = read_json(root / "evidence" / source_id / "manifest.json")
            if manifest["id"] != source_id or manifest["schema_version"] != 1:
                raise ValueError("manifest identity/version mismatch")
            errors.extend(timestamp_error(manifest["imported_at"], source_id + ".imported_at"))
            errors.extend(timestamp_error(manifest["video"]["recorded_at"], source_id + ".recorded_at"))
            records = [manifest["extraction"]] + manifest["screenshots"]
            for record in records:
                path = contained_path(root, record["path"])
                if not path.is_file():
                    errors.append(f"Missing evidence file: {record['path']}")
                elif file_sha256(path) != record["sha256"]:
                    errors.append(f"Evidence hash mismatch: {record['path']}")
            for shot in manifest["screenshots"]:
                if shot["id"] in evidence:
                    errors.append(f"Duplicate evidence ID: {shot['id']}")
                if not 0 <= shot["time_seconds"] <= manifest["video"]["duration_seconds"]:
                    errors.append(f"Invalid screenshot time: {shot['id']}")
                evidence[shot["id"]] = source_id
        except (ValueError, TypeError, KeyError, OSError) as error:
            errors.append(f"{source_id}: {error}")
    for kind in ("characters", "weapons", "artifacts", "panel_snapshots"):
        for record in account[kind]:
            for eid in record["provenance"]["evidence_refs"]:
                if eid not in evidence:
                    errors.append(f"{record['id']}: unknown evidence {eid}")
                elif evidence[eid] not in record["provenance"]["source_ids"]:
                    errors.append(f"{record['id']}: evidence belongs to an undeclared source")
    return errors

def validate_repository(root):
    root = Path(root)
    account = read_json(root / "data/account.json")
    errors, warnings = validate_account(account)
    if not errors:
        errors.extend(validate_evidence(account, root))
    preferences = read_json(root / "data/preferences.json")
    preference_errors = schema_errors(preferences, "preferences.schema.json")
    errors.extend(preference_errors)
    if not preference_errors:
        errors.extend(timestamp_error(preferences["updated_at"], "preferences.updated_at"))
        known = {c["id"] for c in account.get("characters", []) if isinstance(c, dict) and "id" in c}
        for cid in preferences["favorite_character_ids"]:
            if cid not in known:
                errors.append(f"preferences: unknown character {cid}")
    return errors, warnings

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    try:
        errors, warnings = validate_repository(args.root)
    except (ValueError, OSError) as error:
        parser.exit(1, f"Validation failed: {error}\n")
    for warning in warnings:
        print("WARNING: " + warning)
    for error in errors:
        print("ERROR: " + error)
    if errors:
        return 1
    print("Validation passed: schema, references, equipment ownership, evidence hashes")
    return 0

if __name__ == "__main__":
    sys.exit(main())
