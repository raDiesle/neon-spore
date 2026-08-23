#!/usr/bin/env bash
# Determinism is the one thing a reviewer cannot see by looking. So it is not a
# rule in CLAUDE.md — it is a hook. Every edit inside packages/sim re-runs it.
set -uo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//; s/"$//')

case "$path" in
  *packages/sim/*) ;;
  *) exit 0 ;;
esac

if ! output=$(bun test packages/sim 2>&1); then
  echo "Determinism check failed after editing $path:" >&2
  echo "$output" | tail -30 >&2
  exit 2   # exit code 2 feeds the message back to Claude
fi
exit 0
