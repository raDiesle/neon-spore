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

# Which test directories a change can possibly have touched — see
# tools/hooks/scope.ts for the table and the argument for each row. A scope
# failure (the scoper itself broken, or bun unable to run it) must never read
# as "nothing to test": fall back to the full suite rather than skip it.
scope=""
if scope=$(bun run tools/hooks/scope.ts 2>/dev/null); then
  :
else
  scope=""
fi

if [ -n "$scope" ]; then
  echo "check-on-stop: scoped run — $scope" >&2
else
  echo "check-on-stop: full run" >&2
fi

if ! output=$(bun test $scope 2>&1); then
  echo "bun test fails — fix before finishing:" >&2
  printf '%s\n' "$output" | tail -40 >&2
  exit 2
fi
exit 0
