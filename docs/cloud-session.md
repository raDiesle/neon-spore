# Working in a cloud session

A session started from the phone runs on a machine that clones `origin` and
never sees the desk's checkout. `CLAUDE.md` carries the four rules that follow
from that; this is the reasoning behind them, and the details a cloud session
needs once it is actually running.

**A cloud session should read this file first.** It is written for a machine
that has nothing but the clone.


A session started from the phone runs on a machine that clones `origin` and
never sees this checkout. Several things follow, and each one cuts against a
rule above.

**It reads the remote, not the tree.** Anything unpushed is invisible to it, so
the hand-off from here to there is a push, not a save. That is also how unpushed
work turns into a trap: a `main` sitting five commits ahead of `origin` gives
the cloud a task briefed on code that is not there.

**It must push its own branch.** "Do not push unless asked" is a
rule about this machine, where not pushing costs nothing because the work is
already where the human is. In the cloud the opposite holds — work that is not
pushed is work nobody can reach. So a cloud session pushes the branch it was
given, when it is done, without being asked. Never a pull request; `main` under
the next paragraph, which it does on its own.

**It lands `main` itself, every turn, without being asked.** The rule used to
be that it never could, and then that it could when asked; both were about
verification — a change the sandbox cannot fully check should not become the
trunk that the next cloud session clones. That worry survives, and the ordering
it implied does not. One person works on this repo, so a `main` that turns out
to need another pass costs that person one commit and nobody else anything —
while a branch parked until they get to a desk costs a day, and two parked
branches cost a rebase each. Asking first only moved the day-long wait to a
different question.

So: a cloud session finishes a turn by landing its branch on `main`. Two
conditions, and no third. The branch is **already rebased onto the current
`origin/main`**, so the landing is a fast-forward and the history stays linear —
never a merge commit, never a force-push to `main`. And `bun run check` is green
on that rebased branch. If either fails, the branch is pushed and the closing
block says so; the turn does not end quietly on unlanded work.

Mid-task is the one exception, and it is the same exception as everywhere else
in this file: work that is not finished is not committed, and what is not
committed cannot land. A turn that ends on a question ends with the question,
not with a landing.

What the sandbox could not check does not block the landing, but it does not
evaporate either: it moves *after* it, onto the machine that can look. The
report names it — the wave whose timing was never watched, the shape whose
motion was never seen, the relay never run — as a list of what to open, not as
a caveat. Landing without saying that is the one way this arrangement fails,
because it turns "not looked at" into "looked fine". If it turns out wrong,
`main` takes the fix as its own commit; the history is linear and stays that
way.

**It cannot verify everything, and has to say which parts — in the report.**
The sandbox has no wrangler, no `bun run delegate`, and no network access it
did not arrange. It does have a headless Chromium, so a page can be opened,
driven and screenshotted — what it cannot do is *look*, and those are
different things: a green screenshot check says the DOM is there, not that the
motion reads. `bun test` and the typecheck are the parts that hold unaided.
Anything that would have needed `bun run relay:check`, a human eye on a shape
sheet, or a wave watched at tempo is *unverified*, and the report says so in
that word rather than offering a green check that covered less than usual. A
wave whose timing was never watched is not finished, it is written — landed,
now, but still written.

**Say it once, in the report, and then let it go.** There used to be a second
half to this: a `Check:` trailer on the commit, an outstanding list derived
from those trailers, a ledger recording who had looked at what, and a sheet in
the director with a verdict button on every row. It was accurate and it asked
the owner for something on every visit, which is what finished it — a list you
owe answers to stops being read at about the length that one reached, and a
list nobody reads is worse than none, because it looks like coverage.

What replaced it asks for nothing. `bun run land` writes an entry into
`docs/release-notes.md` at the moment the trunk moves, derived from the commit's
own subject and first paragraph, and that file is read-only: nothing in it is
ticked, answered or deleted. The director shows the same thing under
`≡ RELEASE NOTES`, with no buttons and no count — a count is a way of saying
something is waiting, and nothing there is. Reading it is optional, which is the
only reason it will be read.

So do not write a `Check:` trailer, do not open a file under `docs/checks/`, and
do not ask the owner to confirm that something was tested. Write the commit
message well instead: it is the release note, and it is the only part of this
that anybody sees twice.

**A technical finding goes in `docs/queue.md`, not in the report.** A refactor
the session stepped around, a slow path, a missing test, a document that no
longer describes the code: one `##` section, in the same commit, and then it is
in the clone forever instead of four sessions up a transcript. Half-done work
goes in `docs/parked.md` the same way. An *idea for the game* goes in neither —
that is a decision, it belongs in `docs/spec/`, and the owner picks it up by
hand. The queue is deliberately not the release notes: a note records something
that already happened and is closed, a queue item is work nobody has started
and is open. Picking one up later is a fresh session — `bun run queue next`
prints the prompt — which removes the entry in the commit that finishes it.
`docs/queue.md` says the rest.

**Its Bun may be older than the lockfile, and three things fail in ways that
name something else.** A cloud session's image carries whatever Bun it was
built with — 1.3.11 on 4 September 2026, against a `bun.lock` written by a
newer one. Three symptoms, none of which mentions a version:

- `bun install` silently rewrites `lockfileVersion` from 2 to 1, so a lane that
  stages `bun.lock` commits a downgrade nobody asked for. Leave that file
  alone unless the change is a dependency you added.
- `bun install --frozen-lockfile` fails with *lockfile had changes, but
  lockfile is frozen*, which is the first thing `bun run land` does after the
  rebase. The landing then stops before the check has even run.
- `apps/server`'s suite fails outright: every websocket case times out, because
  Bun's `ws` shim has no `upgrade` event for miniflare to use. Twenty-five red
  tests that are green on the owner's machine, and a `bun run check` no lane
  can turn green.

The way out is one command, and the npm registry is one of the few hosts the
sandbox's proxy allows:

```
npm install bun@latest --prefix /tmp/bun
PATH=/tmp/bun/node_modules/.bin:$PATH bun run land
```

With a current Bun all three go away — the frozen install passes, the relay's
Durable Object tests pass in six seconds, and the check is green for real
rather than green apart from a suite that could not run. Do this before
concluding that a suite is broken, and before reporting a landing as blocked.

**And check which Bun it got against the one this project names.**
`.bun-version` is the version the repository is tested against; `package.json`
names it as its package manager, CI installs it from that file, and
`tools/test/bun-version.test.ts` holds the three in step. Nothing refuses to run
on a mismatch, so a session on a different Bun is not stopped — but it is a
session whose green check is a result about a different runtime, and after the
three failures above that is worth a line in the report rather than a shrug.
`bun --version` against the file is the whole check.

**Its servers need a host, and the error if you forget says the wrong thing.**
`preview.ts` and the director both bind `::`, which is right on a machine with
IPv6 and impossible on this one — and what Bun reports is `EADDRINUSE`, so the
first guess is always a stale server holding the port. It is not; nothing is
listening at all. Both already take the way out, so this costs one variable:

```
PREVIEW_HOST=127.0.0.1 bun run preview
DIRECTOR_HOST=127.0.0.1 bun run dev
```

With one of those up, a headless Chromium reaches further than "the DOM is
there". It can drive the real loop — `window.neonSpore.advance` and `paint`
past a gesture that unlocks audio — and a frame that throws is a frame that
never draws, so a run of a few thousand ticks with no page error is a real
result about the wiring. Still not about how any of it *reads*.

**Several at once is allowed, and is not the shape to reach for first.** Each
cloud session is its own VM with its own clone, so none of this needs a
worktree — the isolation already sits a level above the filesystem, and two
branches in flight are no problem in themselves. What does not parallelise is
the landing. Every branch still has to arrive on a **linear** `main`, one after
another, so three branches are three rebases onto a `main` that moved under all
of them — and the conflict surfaces where the work is expensive rather than
where it was cheap. A session landing its own branch does not change that; it
only moves who does the rebase. Two at once, on
different packages, each naming its branch in the prompt so no two sessions
reach for the same one. Prefer the work the sandbox can actually finish:
`sim`, `content` and `net` are covered by `bun test`, while a wave's timing or
anything in `render` comes back needing an eye here regardless, and running
four of those in parallel only builds a queue in front of the one machine that
can look.

Coming back the other way, `claude --teleport` carries the branch and the
conversation with it. Going out again carries neither: a new cloud session
starts cold, knowing only what `origin` and the commit messages tell it. One
more reason the commit messages here are sentences.

