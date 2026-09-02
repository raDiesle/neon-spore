#!/usr/bin/env bash
# A handful of Bash commands are wrong in this repo specifically, and wrong
# in a way that only shows up once something else is already broken: a
# stage-everything that scoops up another lane's half-finished edit, a push
# to main that bypasses `bun run land`'s check-then-fast-forward order, a hot
# server that steals the human's port, a worktree-remove that deletes the
# ground a session is standing on. Each one is cheap to block before it runs
# and expensive to unwind after.
set -uo pipefail

payload=$(cat)
# worker-model-guard.sh's regex extraction never handles a JSON-escaped
# backslash, which is exactly what a Windows path is made of — this repo
# runs on Windows (CLAUDE.md, cross-platform.md), and a worktree path is the
# one argument this hook actually has to read. Parsing the JSON properly
# with bun (already a repo dependency, already invoked by every other hook)
# costs one process and is correct for any command text, quotes included.
command=$(printf '%s' "$payload" | bun -e '
  let d = "";
  process.stdin.on("data", (c) => { d += c; });
  process.stdin.on("end", () => {
    try {
      const parsed = JSON.parse(d);
      process.stdout.write(parsed?.tool_input?.command ?? "");
    } catch {}
  });
')

refuse() {
  echo "Blocked: $1" >&2
  echo "$2" >&2
  exit 2
}

# git add -A / -A / . / --all, and git commit -a / --all / --am — the tree
# may hold another lane's half-finished edit; staging here is always by path.
# `.` is matched as a whole argument, not as a prefix. A glob of `git add .`
# also matches `git add .claude/hooks/x`, which is staging by path — the very
# thing this rule is telling you to do. It refused exactly that on the commit
# that introduced it, which is as good a demonstration as the rule could ask
# for and still a bug.
if printf '%s ' "$command" | grep -qE 'git add ([^|;&]* )?(-A|--all|\.)([ ;&|]|$)'; then
  refuse "staging everything (git add -A/./--all) can pick up another lane's unfinished work in this tree." \
    "Stage the specific files this task touched, by path."
fi
case "$command" in
  *"git commit -a"*|*"git commit --all"*|*"git commit -am"*|*"git commit --am"*)
    refuse "committing with -a/--all/-am/--am stages whatever is dirty, including another lane's work." \
      "Stage the specific files this task touched, then commit."
    ;;
esac

# A push naming main directly skips the rebase-then-check order `bun run
# land` exists to enforce, force or not. Matched with grep, not a glob, so
# "main2" or "main-fix" (a real branch name containing the word) is not
# mistaken for the ref "main".
case "$command" in
  *"git push"*)
    if printf '%s ' "$command" | grep -qE '(^|[ /:])main([ :]|$)'; then
      refuse "pushing to main directly bypasses the rebase-then-check order that keeps main's history linear." \
        "Land it with 'bun run land', which rebases, checks, and fast-forwards in that order."
    fi
    ;;
esac

# A hot dev server belongs to the human at their own port; an agent verifies
# against the preview build instead. Matched as a whole token so
# "bun run dev:once" — the human's own second server, not an agent's — is
# left alone; only "bun run dev" and "bun run dev:game" are blocked.
if printf '%s ' "$command" | grep -qE '(^|[ ;&|])bun run dev(:game)?([ ;&|]|$)'; then
  refuse "hot dev servers (bun run dev, dev:game, bun --hot) belong to the human's own session." \
    "Verify with 'bun run preview' / 'preview:once', or launch the director by absolute path inside this worktree."
fi
case "$command" in
  *"bun --hot"*)
    refuse "hot dev servers (bun run dev, dev:game, bun --hot) belong to the human's own session." \
      "Verify with 'bun run preview' / 'preview:once', or launch the director by absolute path inside this worktree."
    ;;
esac

# git worktree remove of the tree this session is standing in destroys its
# own working directory mid-command.
case "$command" in
  *"git worktree remove"*)
    arg=$(printf '%s' "$command" | sed -n 's/.*git worktree remove[[:space:]]\+\(-f[[:space:]]\+\|--force[[:space:]]\+\)*//p' | awk '{print $1}')
    if [ -n "$arg" ]; then
      resolved=$(cd "$arg" 2>/dev/null && pwd -P)
      here=$(pwd -P)
      if [ -n "$resolved" ] && [ "$resolved" = "$here" ]; then
        refuse "this would remove the worktree the current session is standing in." \
          "Remove it from another session or after switching out, never from inside itself."
      fi
    fi
    ;;
esac

exit 0
