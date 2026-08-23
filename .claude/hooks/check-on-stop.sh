#!/usr/bin/env bash
# The last thing before Claude hands the turn back: does the repo still
# typecheck and pass? Only when something was actually changed, and never
# twice in a row — stop_hook_active guards the loop.
set -uo pipefail

payload=$(cat)

case "$payload" in
  *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;;
esac

# Nothing edited this turn means nothing to verify.
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

if ! output=$(bun run typecheck 2>&1); then
  echo "typecheck fails — fix before finishing:" >&2
  printf '%s\n' "$output" | tail -30 >&2
  exit 2
fi

if ! output=$(bun test 2>&1); then
  echo "bun test fails — fix before finishing:" >&2
  printf '%s\n' "$output" | tail -40 >&2
  exit 2
fi
exit 0
