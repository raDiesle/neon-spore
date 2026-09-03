#!/usr/bin/env bash
# The turn is over and the lane is finished: put it on the trunk without being
# asked, and say so in one line the owner can see from a phone.
#
# It lands only when the lane is *already* finished, which is three questions
# git can answer and none a session has to be trusted with:
#
#   - this is a worktree, on a branch of its own that is not the trunk;
#   - nothing is uncommitted — mid-task work cannot land, by construction;
#   - the branch is ahead of `main`, so there is something to move.
#
# Anything else and it exits silently, which is most turns. `bun run land` does
# the rest and refuses on its own terms too (it rebases, checks, and only then
# fast-forwards), so this file never decides whether the work is *good* — only
# whether the lane looks done.
#
# It does not collide with `check-on-stop.sh`, which shares this event and runs
# beside it: that one returns immediately when the tree is clean, and this one
# returns immediately when it is not.
#
# `NO_AUTO_LAND=1` turns it off for a session that wants to land by hand.
set -uo pipefail

payload=$(cat)

# A blocked stop already sent the session back to work; do not land underneath
# it, and never twice in a row.
case "$payload" in
  *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;;
esac

[ "${NO_AUTO_LAND:-}" = "1" ] && exit 0

# A worktree's own git dir sits under the shared one; the main checkout's is
# the shared one. Landing from the main checkout is not what this is for.
gitdir=$(git rev-parse --absolute-git-dir 2>/dev/null) || exit 0
common=$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0
[ "$gitdir" = "$common" ] && exit 0

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0
case "$branch" in main|HEAD|"") exit 0 ;; esac

# Uncommitted work is unfinished work.
[ -n "$(git status --porcelain 2>/dev/null)" ] && exit 0

ahead=$(git rev-list --count main..HEAD 2>/dev/null) || exit 0
[ "${ahead:-0}" -eq 0 ] && exit 0

if ! out=$(bun run land 2>&1); then
  echo "auto-land: $branch did not land — main was not moved:" >&2
  printf '%s\n' "$out" | tail -25 >&2
  exit 2
fi

sha=$(git rev-parse --short main 2>/dev/null)
count=$([ "$ahead" -eq 1 ] && echo "1 commit" || echo "$ahead commits")

# The badge. `systemMessage` is the one channel a Stop hook has to the chat
# itself, so the whole landing has to read at a glance in it.
badge="🟢 ╺━╸ L A N D E D ! ╺━╸ $branch → main @ $sha ($count)"
printf '%s\n' "$out" >&2
printf '%s' "$badge" |
  bun -e 'console.log(JSON.stringify({ systemMessage: await Bun.stdin.text(), suppressOutput: true }))'
exit 0
