#!/usr/bin/env bash
# The first thing a session on this machine should know: whether anything is
# waiting to be looked at. A cloud session cannot open a shape sheet or watch a
# wave at tempo, so it names what it left in a `Check:` trailer — and a list
# nobody is told about is a list nobody reads.
#
# Says nothing when there is nothing. See docs/verification.md.
set -uo pipefail

command -v bun >/dev/null 2>&1 || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

out=$(bun run tools/checks/run.ts --brief 2>/dev/null) || exit 0
[ -z "$out" ] && exit 0

printf 'Waiting on this machine (bun run checks, or ⚑ TO CHECK in the director):\n%s\n' "$out"
exit 0
