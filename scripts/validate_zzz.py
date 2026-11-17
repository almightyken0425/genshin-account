"""Validate independently sourced ZZZ observations without touching Genshin."""
import hashlib
import json
from datetime import datetime
from pathlib import Path
import re
import sys
import jsonschema
try:
    from account_model import contained_path, file_sha256, read_json, resolve_pointer
except ModuleNotFoundError:
    from scripts.account_model import contained_path, file_sha256, read_json, resolve_pointer

ROOT = Path(__file__).resolve().parents[1]

def validate(account, root=ROOT, check_files=True):
    schema_name = 'zzz.account.v1.schema.json' if account.get('schemaVersion') == 1 else 'zzz.account.schema.json'
    schema = json.loads((ROOT / 'schemas' / schema_name).read_text())
    errors = [f'{list(e.path)}: {e.message}' for e in jsonschema.Draft202012Validator(schema).iter_errors(account)]
    if errors:
        return errors
    ids = set()
    duration = account['source']['durationSeconds']
    sync_sources, documents = {}, {}
    for source in account.get('syncSources', []):
        sid = source['id']
        if sid in sync_sources:
            errors.append(f'duplicate sync source: {sid}')
        sync_sources[sid] = source
        try:
            retrieved = datetime.fromisoformat(source['retrievedAt'].replace('Z', '+00:00'))
            if retrieved.tzinfo is None:
                raise ValueError('timezone required')
            if source['path'] != f'imports/hoyolab/{sid}.json':
                raise ValueError('source ID and path do not match')
            path = contained_path(root, source['path'])
            if check_files:
                if not path.is_file() or file_sha256(path) != source['sha256']:
                    raise ValueError('source missing or checksum mismatch')
                documents[sid] = read_json(path)
        except (ValueError, TypeError, KeyError, OSError) as error:
            errors.append(f'{sid}: invalid sync source: {error}')
    for character in account['characters']:
        cid = character['id']
        if cid in ids:
            errors.append(f'duplicate character: {cid}')
        ids.add(cid)
        if not set(character.get('statsEffective', {})) <= set(character.get('stats') or {}):
            errors.append(f'{cid}: effective stat label not in observed stats')
        if character.get('sync', {}).get('sourceId') is not None and character['sync']['sourceId'] not in sync_sources:
            errors.append(f'{cid}: unknown sync source')
        evidence_records = list(character['evidence'])
        legacy = character.get('legacyObservation')
        if legacy:
            if legacy['id'] != cid:
                errors.append(f'{cid}: legacy observation belongs to a different character')
            evidence_records.extend(legacy['evidence'])
            for disc in legacy.get('driveDiscs') or []:
                evidence_records.extend(disc['evidence'])
        disc_ids, slots = set(), set()
        for disc in character.get('driveDiscs') or []:
            if disc['id'] in disc_ids or disc['slot'] in slots:
                errors.append(f'{cid}: duplicate drive disc ID or slot')
            disc_ids.add(disc['id']); slots.add(disc['slot'])
            substats = disc['substats']
            names = [(s['name'], s['unit']) for s in substats if s['name'] is not None]
            if len(names) != len(set(names)):
                errors.append(f'{cid}: duplicate drive disc substat')
            has_rule = disc.get('assessment', {}).get('method') == 'role_rule' and bool(disc.get('assessment', {}).get('ruleId')) and isinstance(disc.get('effectiveKeys'), list)
            resolved = []
            for stat in substats:
                assessed = stat.get('assessedEffective')
                key = stat['name'] + '|' + stat['unit'] if stat['name'] is not None and stat['unit'] is not None else None
                if isinstance(assessed, bool) and (not has_rule or assessed != (key in disc['effectiveKeys'])):
                    errors.append(f'{cid}: assessed disc effectiveness requires a consistent named role rule')
                effective = stat['isEffective'] if isinstance(stat['isEffective'], bool) else assessed if has_rule else None
                resolved.append((effective, stat['enhancementCount']))
            unknown = not disc['substatsComplete'] or any(effective is None or (effective and count is None) for effective, count in resolved)
            expected = None if unknown else sum(1 + count for effective, count in resolved if effective)
            if disc['effectiveRollCount'] != expected:
                errors.append(f'{cid}: effective roll count is inconsistent with observations')
            evidence_records.extend(disc['evidence'])
        for evidence in evidence_records:
            if 'sourceId' in evidence:
                sid = evidence['sourceId']
                if sid not in sync_sources:
                    errors.append(f'{cid}: unknown HoYoLAB evidence source {sid}')
                elif check_files and sid in documents:
                    try:
                        if not isinstance(resolve_pointer(documents[sid], evidence['record']), dict):
                            raise ValueError('record must resolve to an object')
                    except (ValueError, TypeError, KeyError, IndexError):
                        errors.append(f'{cid}: invalid HoYoLAB evidence record')
                continue
            if evidence['timestampSec'] > duration:
                errors.append(f'{cid}: timestamp exceeds source duration')
            path = contained_path(root, evidence['framePath'])
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
