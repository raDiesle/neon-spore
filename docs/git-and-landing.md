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
result about it. `--keep` is the exception, and the section on being asked
below says when it is the right answer: the trunk takes the work and nothing is
cleaned up, because the lane is not over.

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

Say what was committed. Pushing is a separate question, and the section below
answers it.


## Pushing the trunk, and how often

`main` has to reach `origin`, and the argument is only about when. Not pushing
at all was tried on this machine, on the reasoning that it cost nothing because
the work was already where the human was. It cost something the first day
anybody worked at volume: forty-seven commits sat on a local `main` that
`origin` had never seen, which is exactly the trap the cloud section below
describes — a session started from a phone clones `origin` and is briefed on
code that is not there.

The fix at the time was to push on every landing, which fixed the trap and
overshot. Landing had by then stopped being an event a person schedules — the
`Stop` hook took it at the end of any turn that finished something — so a push
per landing was a push per turn, most of them carrying one commit onto a remote
nobody was reading yet.

**So the push rides on the sweep instead.** `origin/main` goes when the landing
actually cleared a lane away: a worktree removed, or a branch deleted that was
not the one being landed. That is roughly once per lane rather than once per
turn, and it is the moment the work is finished in the sense that matters — the
tree it was done in is gone.

The lane's own branch is deliberately not counted. Every landing there has ever
been deletes it, so counting it would make "after a cleanup" mean "every time",
which is the frequency the rule exists to get away from.

Two things push anyway:

- **`bun run land --push`**, and **`bun run push`** from anywhere, which is the
  owner saying so. `push` fetches `origin/main` before counting, because a
  count against a stale remote-tracking ref reports work as unpushed that
  somebody already sent — a number wrong in the reassuring direction is worse
  than no number.
- **A clone with no worktree on the trunk.** There is nothing there to sweep,
  so waiting for a cleanup would mean waiting forever, and it is the one place
  where the push is the entire output: a cloud session's work exists only where
  `origin` can see it.

`--no-push` still outranks all of it, and so does having no `origin`.

The cost of the new rule is that a local `main` can now run several landings
ahead of `origin`. Every landing that does not push says so, with the count and
the command, so the number is never a thing anybody has to go and look up.


## Landing is offered, not taken

The commit rule above has a gap at the end of it. A lane could be finished,
green and committed, and still sit on a branch until somebody remembered to
type `bun run land` — which, in a repository whose history is linear on
purpose, is the one step where forgetting is expensive: the trunk moves under
the branch, the rebase gets larger every day, and the twenty-seventh idle
worktree is the same failure in a different shape.

The first answer was to take the step by machine: the `Stop` hook landed the
lane itself, without being asked. It closed the gap and overshot it. Landing is
where a lane's life ends — the trunk moves, the worktree is swept, the remote is
written — and the owner wanted that moment to be a question rather than a
notification after the fact. Especially because a turn ending is not the same as
a lane being finished: often the next prompt for it is already coming.

So `tools/hooks/lane-finished.ts` runs on `Stop`, asks the three questions git
can answer without trusting anybody's account of the work —

- is this a worktree, on a branch of its own that is not `main`?
- is the tree clean?
- is the branch ahead of `main`?

— and, when all three say yes, blocks the stop and sends the session back with
one question to put to the owner, in four answers:

- **a) Finished** — `bun run land --push`. The lane ends: the trunk takes it, the
  sweep clears the branch and any idle tree away, and `main` goes to `origin`.
- **b) More to come** — nothing lands. The lane stays a branch and the next
  prompt continues it.
- **c) Land and stay** — `bun run land --keep`. The *local* trunk takes the work
  and nothing else happens: no sweep, no push, the branch and the worktree
  exactly where they were. This is the answer that keeps a long lane's rebase
  small without ending it.
- **d) Land and send** — `bun run land --keep --push`. The same, and `origin`
  gets `main` too.

**And when a lane that stayed is finally over, `bun run land --sweep` is the
cleanup (c) deferred.** The lane's work is on the trunk by then, so every
ordinary landing refuses it — it carries nothing `main` has not got — and for a
while that left "land and clean up" with no command at all behind it and a
`git worktree remove` typed by hand as the only way out, which is the one thing
this tool exists to stop. `--sweep` skips the replay, the check and the
fast-forward, because the trunk already has all three, and runs everything that
comes after them: the branch goes, spent worktrees past their idle window go,
this one is left on `main`'s tip detached, and the push rides on the sweep the
way it always does.

Two axes cross in those four: is the lane over, and does the remote get the
trunk. (c) and (d) differ in nothing but the second, and that is the point —
reaching `origin` is a decision of its own rather than a consequence of the
lane ending. It is the same argument as the section above: the push is not a
step of landing, it is a thing somebody decides.

The clean-tree question is the load-bearing one: mid-task work is never asked
about, by construction, because mid-task work is uncommitted. Everything else —
is the code good, does it replay, does it check — is `bun run land`'s to refuse,
and it refuses on its own terms, before the trunk has moved.

It shares the `Stop` event with `check-on-stop.ts`, and they never do the same
work twice: that one returns immediately when the tree is clean, this one
returns immediately when it is not. `stop_hook_active` guards the second round,
so the question is asked once per turn and a lane the owner said (b) about is
not nagged again in the same breath.

**After its own landing a session is standing on a detached `HEAD`.** The
landing deleted the branch — the branch is spent, its tip is an ancestor of
`main`, and a fix found afterwards belongs on a fresh one off the current trunk
— and it left the worktree on `main`'s tip rather than removing it, because
removing the ground a session is standing on is worse. So `git rev-parse
--abbrev-ref HEAD` says `HEAD` from then on, and the tree's content is `main`'s.

Nothing has to be done about that. Carry on committing; the next `Stop` opens a
branch over the commits — the worktree's own name under `claude/`, which is
usually the name the landing just deleted — and asks about them the ordinary
way, saying so on stderr before it does. `git switch -c <name>` by hand does the
same thing earlier and is what `bun run land` prints as it leaves.

This mattered because it used to be silent. The hook read `HEAD`, decided this
was "not on a lane's own branch", and exited without a word, so a session that
kept working after its first landing committed into detachment and never landed
again. It happened in the session that found it: batch two landed itself, the
next commit went nowhere, and only a `git rev-parse` noticed.

**The badge is the whole report.** It is read from a phone, so a landing has to
fit a line: the branch, the sha it went to and how many commits moved. It used
to be printed by the hook, over `systemMessage`, which was the hook's one
channel into the chat. `bun run land` prints it now, so the same line comes back
however the landing started.

`NO_LANE_PROMPT=1` turns the hook off for a session that decides for itself.
