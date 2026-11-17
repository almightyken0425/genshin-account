"""Private local draft: normalized game data and explicit equipment selections."""
import hashlib
import json
import os
from pathlib import Path
import re
from .engine import ROOT, assert_sanitized
from .publisher import encoded

PATH=ROOT/'.hoyolab-sync'/'preview.json'


def valid_selections(resolutions,revision):
    if not isinstance(resolutions,dict) or len(resolutions)>500:
        raise ValueError('Invalid local equipment selections')
    if revision is not None and not re.fullmatch(r'[0-9a-f]{40}',revision):
        raise ValueError('Invalid local base revision')
    for key,value in resolutions.items():
        if not isinstance(key,str) or not re.fullmatch(r'genshin:[0-9]+:(weapon|flower|plume|sands|goblet|circlet)',key):
            raise ValueError('Invalid local equipment selection')
        if not isinstance(value,str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,199}',value):
            raise ValueError('Invalid local equipment selection')
    if resolutions and revision is None:
        raise ValueError('Equipment selections require their reviewed base revision')


def save(snapshot,retrieved_at,path=PATH,*,resolutions=None,base_revision=None):
    assert_sanitized(snapshot)
    resolutions=resolutions or {}
    valid_selections(resolutions,base_revision)
    document={'version':2,'snapshot':snapshot,'retrieved_at':retrieved_at,'resolutions':resolutions,'base_revision':base_revision,
              'sha256':hashlib.sha256(encoded(snapshot)).hexdigest()}
    path.parent.mkdir(mode=0o700,parents=True,exist_ok=True)
    path.parent.chmod(0o700)
    temporary=path.with_suffix('.pending')
    descriptor=os.open(temporary,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
    with os.fdopen(descriptor,'wb') as stream:stream.write(encoded(document))
    os.replace(temporary,path)
    path.chmod(0o600)


def load(path=PATH):
    if not path.is_file():return None
    if path.stat().st_size>6200000:raise ValueError('Invalid local draft')
    document=json.loads(path.read_bytes())
    legacy={'snapshot','retrieved_at','sha256'}
    current=legacy|{'version','resolutions','base_revision'}
    if set(document)==legacy:
        document.update(version=2,resolutions={},base_revision=None)
    elif set(document)!=current or document.get('version')!=2:
        raise ValueError('Invalid local draft')
    assert_sanitized(document['snapshot'])
    valid_selections(document['resolutions'],document['base_revision'])
    if hashlib.sha256(encoded(document['snapshot'])).hexdigest()!=document['sha256']:raise ValueError('Invalid local draft')
    return document


def clear(path=PATH):
    path.unlink(missing_ok=True)
