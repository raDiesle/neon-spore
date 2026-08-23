#!/usr/bin/env bash
# Formatting is not a conversation. Biome rewrites the file that was just
# edited; Claude never spends a turn on whitespace.
set -uo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//; s/"$//')
# Windows arrives as C:\Users\... — normalise before matching.
path=$(printf '%s' "$path" | tr -s '\134' '/')

case "$path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css) ;;
  *) exit 0 ;;
esac

# Never block on a formatter. Worst case the file stays as written.
bunx biome check --write --no-errors-on-unmatched "$path" >/dev/null 2>&1
exit 0
