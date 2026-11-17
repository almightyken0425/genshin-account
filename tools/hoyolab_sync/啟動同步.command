#!/bin/zsh
set -e
cd "$(dirname "$0")/../.."
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
.venv/bin/python -m pip --disable-pip-version-check install -q -r tools/hoyolab_sync/requirements.txt
.venv/bin/python -m tools.hoyolab_sync.server
