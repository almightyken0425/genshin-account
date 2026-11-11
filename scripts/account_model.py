"""Shared account format, observations, and build change detection."""
import hashlib
import json
from pathlib import Path

SLOTS = ("flower", "plume", "sands", "goblet", "circlet")
FLAT_KEYS = ("hp", "atk", "def", "em", "stamina")
PERCENT_KEYS = ("hp_pct", "atk_pct", "def_pct", "crit_rate", "crit_dmg", "energy_recharge", "healing_bonus", "incoming_healing_bonus", "cooldown_reduction", "shield_strength", "physical_dmg_bonus") + tuple(f"{e}_dmg_bonus" for e in ("pyro", "hydro", "dendro", "electro", "anemo", "cryo", "geo"))

def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))

def write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8", newline="\n")

def file_sha256(path):
    with Path(path).open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()

def contained_path(root, relative):
    root = Path(root).resolve()
    relative_path = Path(relative)
    if relative_path.is_absolute() or "\\" in relative or ":" in relative:
        raise ValueError(f"Path must be relative POSIX: {relative}")
    target = (root / relative_path).resolve()
    if not target.is_relative_to(root):
        raise ValueError(f"Path escapes root: {relative}")
    return target

def build_fingerprint(account, character_id):
    character = next(c for c in account["characters"] if c["id"] == character_id)
    equipment = account["equipment"][character_id]
    weapons = {w["id"]: w for w in account["weapons"]}
    artifacts = {a["id"]: a for a in account["artifacts"]}
    def mechanics(item):
        return {k: v for k, v in item.items() if k not in ("provenance", "name")}
    payload = {
        "character": {k: character[k] for k in ("id", "element", "weapon_type", "level", "constellation", "talents")},
        "weapon": mechanics(weapons[equipment["weapon_id"]]) if equipment["weapon_id"] else None,
        "artifacts": {slot: mechanics(artifacts[item_id]) if item_id else None for slot, item_id in sorted(equipment["artifacts"].items())},
    }
    encoded = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()

def snapshot_status(account, snapshot):
    return "matches_recorded_build" if snapshot["build_fingerprint"] == build_fingerprint(account, snapshot["character_id"]) else "build_changed"
