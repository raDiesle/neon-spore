# Git, worktrees and landing

The rules are in `CLAUDE.md`; this is why each of them is what it is. It was
part of that file until 2026-09-02, when the Git and cloud sections between
them were 47% of a document loaded into every session — an argument you have
already accepted costs the same as one you have not, every turn, for ever.

Read it when a landing surprises you, when you are about to change how
`bun run land` behaves, or when you want to argue with one of the rules.


The history on `main` is linear. No pull requests, no merge commits, no
long-lived branches — one person works on this repo, so a review branch is a
detour with no reviewer at the end of it.

Worktrees are allowed, and are purely a working tool: a session running
alongside another one, or preparing a rebuild it might throw away, may create
one. The branch that comes with it is temporary. Before the task counts as
finished it is fast-forwarded or rebased onto `main`, then deleted along with
the worktree. A temporary branch is never pushed — a cloud session's branch is
the one exception, and the section after this one says why.

**The rebase onto `main` happens before verification, not after.** A branch
that has been sitting in its own worktree can fall behind `main` while it
works, so landing it is two steps and they run in this order: first
`git fetch` / rebase the branch onto the current `main` — never a merge
commit, since history stays linear — which is also where a conflict with
whatever landed elsewhere surfaces, on the branch, where there is still time
to resolve it. Only then does `bun run check` run, on the rebased tree. A
green result after that point is a result about the code as it will actually
sit on `main`; a green result taken before the rebase is a result about a
tree that no longer exists once `main` moves. The landing itself — fast-
forwarding `main` to the branch tip — is the mechanical last step once that
check is green, not a separate verification of its own.

**Landing is one command, and it cleans up after itself.** `bun run land`,
from inside the lane's worktree: it replays the lane onto `main`, runs
`bun run check` on the result, fast-forwards, writes the release note, deletes
the branch and sweeps whatever worktrees are spent. None of that is a step
somebody remembers — a cleanup that has to be remembered is a cleanup that
leaves twenty-seven full checkouts on disk, which is what happened the first
day anybody worked at volume. Each one is a copy of the repository at an
earlier state of the trunk, down a path that looks exactly like a path into the
repository, and a session that follows one reads superseded code and reports a
result about it.

**The branch and the worktree do not go at the same moment, and that is
deliberate.** A branch whose tip is an ancestor of `main` is spent by
construction, so it goes immediately: `git branch -d` cannot lose anything, and
it is never argued with when it refuses. A worktree is a workspace rather than
a unit of history, and deleting the one a session is standing in destroys that
session's working directory — every tool call after it fails, and the session
burns whole context windows working out why. So the tree the landing ran in is
**kept**, moved onto `main`'s tip and detached, which also means it is not a
stale checkout anybody can wander into: its content is the trunk's. Carrying on
there is `git switch -c <name>`.

Every *other* merged worktree is swept once nothing has happened in it for five
days — idle, not old, so a tree somebody worked in yesterday is never taken.
`LAND_KEEP_DAYS` moves the window. What the delay buys is `node_modules`: the
code in a landed tree is worth nothing, since all of it is on `main`, but its
install is worth the minute a fresh worktree spends redoing it, and the review
that finds something to adjust usually happens a day or two after the landing.

**A defect found after landing is new work, and new work gets a new branch from
`main`.** The lane that built the thing is over: its branch is on the trunk and
the trunk has moved on. Do not reopen it, do not check it out again, and do not
push a fix onto it. The alternative is tempting and wrong twice over — a
revived branch is missing every landing since, so its `bun run check` is
answering a question nobody asked, and the fix arrives as a second commit on a
branch whose first commit is already on the trunk. The rebase that follows is
pure cost, incurred for the convenience of not typing a branch name.

**On Windows a worktree removal often fails and the failure is quiet.** `git
worktree remove` refuses while anything holds a handle inside the tree —
`node_modules` after a `bun install` is the usual culprit — and moves on. The
directory survives with no entry in `git worktree list`, which is the worst of
both: git thinks it is gone and the filesystem disagrees. So `tools/land`
verifies rather than trusts, retries a stuck handle rather than fighting it,
and reports by path anything still standing. It also removes the litter left by
removals that failed this way before it existed.

A fresh worktree needs `bun install`. `node_modules` must **not** be linked or
copied from the main tree: the workspace links inside it point at the main
tree's `packages/*` by absolute path, so a test there would run against
someone else's code.

That `bun install` does **not** put `@neon-spore/*` in a root `node_modules` —
the workspace links land under each package's own. So a scratch script written
at the repository root cannot `import "@neon-spore/shape-sheet"` and has to
use a relative path. `bun test` and the packages themselves are unaffected;
this only bites the throwaway measuring script, which is exactly the thing a
lane writes when it is about to prove something with a number.

**Commit when the work is done, without being asked.** Finishing a task
includes committing it. Do not ask permission, and do not leave finished work
sitting in the working tree.

Four conditions, all of them:

1. `bun run check` passes. Never commit a red tree.
2. The work is actually finished. Mid-task, or blocked on a question, means no
   commit — say what is outstanding instead.
3. Stage **only the files this task touched**, by path. Never `git add -A`:
   another session or an editor may have unrelated work in the tree.
4. One commit per coherent change. Unrelated work that was already lying in the
   tree gets its own commit, or none.

Say what was committed, and **push `main` when it has landed something**. That
rule used to be the other way round on this machine, on the reasoning that not
pushing cost nothing because the work was already where the human was. It cost
something the first day anybody worked at volume: forty-seven commits sat on a
local `main` that `origin` had never seen, which is exactly the trap the cloud
section below describes — a session started from a phone clones `origin` and
is briefed on code that is not there. The saving was never real and the trap
always was.


## Landing without being asked

The commit rule above has a gap at the end of it. A lane could be finished,
green and committed, and still sit on a branch until somebody remembered to
type `bun run land` — which, in a repository whose history is linear on
purpose, is the one step where forgetting is expensive: the trunk moves under
the branch, the rebase gets larger every day, and the twenty-seventh idle
worktree is the same failure in a different shape.

So the last step is taken by the machine. `.claude/hooks/auto-land.sh` runs on
`Stop`, when the turn is already over, and asks three questions git can answer
without trusting anybody's account of the work:

- is this a worktree, on a branch of its own that is not `main`?
- is the tree clean?
- is the branch ahead of `main`?

Only all three together mean *finished*. The clean-tree question is the load
bearing one: mid-task work cannot land, by construction, because mid-task work
is uncommitted. Everything else — is the code good, does it replay, does it
check — is `bun run land`'s to refuse, and it already refuses on its own terms,
before the trunk has moved.

It shares the `Stop` event with `check-on-stop.sh`, and they never do the same
work twice: that one returns immediately when the tree is clean, this one
returns immediately when it is not.

**A landing that fails blocks the turn.** The session gets the last twenty-five
lines of the failure back and goes to work on it, once — `stop_hook_active`
guards the second round, so a lane that cannot land stops being nagged and
stays a branch.

**The badge is the whole report.** A hook's one channel into the chat is
`systemMessage`, and it is read from a phone, so the landing has to fit a line:
the branch, the sha it went to and how many commits moved.

`NO_AUTO_LAND=1` turns it off for a session that wants to land by hand.
