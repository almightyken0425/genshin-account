"""Migrate v1 account data without changing observations or build fingerprints."""
import argparse
from copy import deepcopy
from pathlib import Path
from account_model import read_json, write_json

def migrate(account):
    result = deepcopy(account)
    if result["schema_version"] == 2:
        return result
    if result["schema_version"] != 1:
        raise ValueError("Unsupported account version")
    owners = {aid: cid for cid, e in result["equipment"].items() for aid in e["artifacts"].values() if aid}
    for artifact in result["artifacts"]:
        artifact["substat_rolls"] = {
            "character_id": owners.get(artifact["id"]),
            "values": [{"key": s["key"], "enhancements": None, "effective": None} for s in artifact["substats"]],
        }
    result["schema_version"] = 2
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Refusing to overwrite an existing output")
    write_json(args.output, migrate(read_json(args.input)))
