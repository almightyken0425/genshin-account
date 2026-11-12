"""Validate independently sourced ZZZ observations without touching Genshin."""
import hashlib
import json
from pathlib import Path
import sys
import jsonschema

ROOT = Path(__file__).resolve().parents[1]

def validate(account, root=ROOT, check_files=True):
    schema = json.loads((ROOT / 'schemas/zzz.account.schema.json').read_text())
    errors = [f'{list(e.path)}: {e.message}' for e in jsonschema.Draft202012Validator(schema).iter_errors(account)]
    if errors:
        return errors
    ids = set()
    duration = account['source']['durationSeconds']
    for character in account['characters']:
        cid = character['id']
        if cid in ids:
            errors.append(f'duplicate character: {cid}')
        ids.add(cid)
        if not set(character.get('statsEffective', {})) <= set(character.get('stats') or {}):
            errors.append(f'{cid}: effective stat label not in observed stats')
        evidence_records = list(character['evidence'])
        disc_ids, slots = set(), set()
        for disc in character.get('driveDiscs') or []:
            if disc['id'] in disc_ids or disc['slot'] in slots:
                errors.append(f'{cid}: duplicate drive disc ID or slot')
            disc_ids.add(disc['id']); slots.add(disc['slot'])
            substats = disc['substats']
            names = [(s['name'], s['unit']) for s in substats if s['name'] is not None]
            if len(names) != len(set(names)):
                errors.append(f'{cid}: duplicate drive disc substat')
            unknown = not disc['substatsComplete'] or any(s['isEffective'] is None or (s['isEffective'] and s['enhancementCount'] is None) for s in substats)
            expected = None if unknown else sum(1 + s['enhancementCount'] for s in substats if s['isEffective'])
            if disc['effectiveRollCount'] != expected:
                errors.append(f'{cid}: effective roll count is inconsistent with observations')
            evidence_records.extend(disc['evidence'])
        for evidence in evidence_records:
            if evidence['timestampSec'] > duration:
                errors.append(f'{cid}: timestamp exceeds source duration')
            path = root / evidence['framePath']
            if check_files:
                if not path.is_file():
                    errors.append(f'{cid}: missing evidence {evidence["framePath"]}')
                elif hashlib.sha256(path.read_bytes()).hexdigest() != evidence['sha256']:
                    errors.append(f'{cid}: evidence checksum mismatch {evidence["framePath"]}')
        if check_files and character.get('portraitPath'):
            portrait = root / character['portraitPath']
            if not portrait.is_file():
                errors.append(f'{cid}: missing portrait')
            elif character.get('portraitSha256') and hashlib.sha256(portrait.read_bytes()).hexdigest() != character['portraitSha256']:
                errors.append(f'{cid}: portrait checksum mismatch')
    return errors

if __name__ == '__main__':
    account = json.loads((ROOT / 'data/zzz/account.json').read_text())
    errors = validate(account)
    if errors:
        print('\n'.join(errors)); sys.exit(1)
    print(f'Validated {len(account["characters"])} ZZZ characters with source evidence')
