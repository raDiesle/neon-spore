#!/usr/bin/env bash
# Determinism is the one thing a reviewer cannot see by looking. So it is not
# only prose in CLAUDE.md — it is a hook. Every edit inside packages/sim or
# packages/content re-runs the sim suite, purity.test.ts included.
set -uo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//; s/"$//')
# Windows arrives as C:\Users\... - normalise the separators before matching.
path=$(printf '%s' "$path" | tr -s '\134' '/')

case "$path" in
  *packages/sim/*|*packages/content/*) ;;
  *) exit 0 ;;
esac

if ! output=$(bun test packages/sim 2>&1); then
  echo "Determinism check failed after editing $path:" >&2
  echo "$output" | tail -30 >&2
  exit 2   # exit code 2 feeds the message back to Claude
fi
exit 0
