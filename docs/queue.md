# Queue

Technical work a session found and did not do. Every entry here is waiting for
a session of its own, and every entry here drains without the owner deciding
anything.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped. The
test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**And nowhere else.** Not the report, which scrolls away — the next session
clones `origin` and sees only files. Not a suggested background task either:
this file *is* the mechanism, and a chip is a popup the owner has to dismiss
that says nothing `bun run queue` does not already say to whoever asks it. A
finding written here is read by every session that comes after; a finding
offered as a chip is read once, by the one person the queue exists to spare.

**What does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — is a decision, and a decision drains only
through the owner. It goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* is not queued either: it is offered in `tools/versus/`, because the
only way to choose one is to see it. Mixing decisions into this file is exactly
what buried the last one under sixty-two entries nobody could face.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on.
`bun run queue next` *hands out* the first free one: it creates that item's
branch, writes a `Taken:` line into the entry on `main` and pushes it, then
prints a prompt naming the branch. The session checks that branch out in its own
worktree, does the item, removes the entry with `bun run queue done <n|title>`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

**Marking one ongoing without opening a lane.** A session already in a worktree
that picks an item up itself — draining several in one sitting, rather than
being handed one — says `bun run queue take <n|title>`. That makes the same
claim `next` would have made, branch and `Taken:` line both, and stops there: no
prompt, no worktree. `bun run queue done` drops the claim along with the entry,
so an item stops reading as ongoing at the moment it stops being in the file.

**Is anything still being worked on.** `bun run queue status` answers in one
word — `DONE` when nothing is left at all, `IDLE` when items are waiting and
nobody is on one, `BUSY` when somebody is, naming the items and the branches
holding them. It exists to be asked of a machine that is about to be turned
off: "is the queue finished" is a question about claims, not about whether the
last command printed something.

**A claim is written twice, because neither half reaches everybody.** The branch
is the gate: worktrees of one repository share their refs, so `claude/queue-…`
is visible to the next `bun run queue` with no commit and no push, and two
sessions cannot be handed the same item because the second `git branch` fails.
The `Taken:` line is the half a local ref cannot do — a session working in its
own clone sees only what `origin` carries, and on 3 September 2026 two sessions
did the same six items in parallel for exactly that reason. So the line is
committed straight to `main` and pushed, where it is the first thing anybody
reads. `next` then moves the branch onto that commit, so a lane starts from a
trunk that already carries its own mark and its `queue done` removes the whole
entry without a conflict.

The two things a claim cannot always do are said out loud rather than guessed
at: if no worktree has `main` checked out, or the trunk's copy of this file has
uncommitted changes in it, the branch is still made and a `⚑` line says the
entry went unmarked.

A claim carries no commits, so it points at `main` and reads as fully merged.
`bun run land` sweeps merged branches, and for one day it swept other lanes'
claims along with its own — both sessions running on 3 September 2026 lost every
claim they held and then did the same item twice. `partitionMerged` in
`tools/land/claims.ts` now leaves a claim standing unless it is the branch being
landed, which is the one case where deleting it is the release.

**The format**, one `##` per item, and both fields are required because the
session that picks it up has read nothing else:

```
## One line saying what to change

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What is wrong, what to do about it, and anything the code does not already
say. Written for somebody who was not there.
```

A third line, `- **Taken:** 2026-09-04, claude/queue-one-line-saying-what`, sits
between the two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.



## Move apps/server off the miniflare alpha when a stable 5 ships

- **Found:** 2026-09-03, claude/bun-queue-list-command-5a8695
- **Files:** `apps/server/package.json`, `apps/server/test/room.test.ts`, `bun.lock`

`apps/server/test/room.test.ts` pins `miniflare` at `5.20260831.0-alpha`, exactly
and on purpose. The last stable 4.x is `4.20260730.0`, whose workerd binary
refuses the `compatibility_date` in `wrangler.jsonc` ("newest date supported by
this server binary is 2026-08-06"), and the test reads that date from the
deploy's own config rather than carrying a second copy of it — so a stable 4
would mean testing on a date the deploy does not use.

When a non-alpha 5 is published, move to it and check the config shape the test
builds by hand (`workers[0].config` with `manifest.modules` and
`exports.Room.storage`) still holds — miniflare 5 changed it from 4's flat
`{ modules, script, durableObjects }`, and `convertV4MiniflareOptions` is the
shim that shows what the new shape wants if it changed again.


## THE STRAND is drawn by nothing in `packages/render/test/frame.test.ts`

- **Found:** 2026-09-05, claude/string-connected-enemy-0dae70
- **Files:** `packages/render/test/frame.test.ts`, `packages/render/src/strand.ts`,
  `packages/render/src/strand-bead.ts`, `packages/render/src/creature-body.ts`

Every other creature is drawn again through the stub canvas that refuses what
a real one refuses — that is what catches a value which is a perfectly good
`string` and not a colour. The strand's three new pictures are not: the thread
(`drawStrands`), the sealed bead player 2 sees in place of a body, and the
raisin a shrivelled one leaves behind. All three take a colour out of
`PALETTE`, go through `hazed`, and are only ever reached with a `strand` on the
field, which no existing frame test puts there.

Add a case beside the gyre's and the veer's: a world with one thread on it,
drawn at each of the three `ViewRole`s, with at least one bead shrivelled so
`drawRaisin` is reached, and once with the thread's last bead spent so the
sweep has run. `gyre-frame.test.ts` and `veer-frame.test.ts` are the shape to
copy.

## `packages/content/test/scenes.test.ts` is 435 lines

- **Found:** 2026-09-05, claude/throb-enemy-redesign-nyf0uo
- **Files:** `packages/content/test/scenes.test.ts`

Past the ~250-line limit by most of a file again, and it has the seam already:
the first two thirds are **invariants over every scene** — the panel a film may
press, page ordering, page length, caption length, shared pages, tempo, the
hull — walked with `for (const id of SCENE_IDS)`, and the last third is
**named films** checked one at a time, each with its own world and its own
question (the strip act's held press, and THE THROB's two shots).

Split on that: the sweep stays in `scenes.test.ts`, and the per-film checks go
to `scene-films.test.ts` beside it. The two halves fail for different reasons —
one when the scene format changes, the other when a creature's rule does — and
they will keep being added to at different rates, which is the whole argument
for the cut.

## CRLF on disk fails the lint while `git status` says the tree is clean

- **Found:** 2026-09-03, claude/scan-box-wisp-ghost-4f7c35
- **Files:** `tools/land/run.ts`, `package.json`, `tools/land/test/`

`bun run land` failed in this lane on a file the lane had never touched:
`.claude/launch.json` had CRLF endings on disk. Its blob in `HEAD` was LF and
`git status` was clean, so nothing said the working tree was the problem —
biome printed the whole file as a formatter diff and the landing stopped with
`script "lint" exited with code 1` and no cause an eye could pick out. The fix
was one line of `\r\n` → `\n`, and finding it took six commands.

It is newly reachable: biome only began checking `.json`, `.css` and `.js` in
"Move the director's 1 100 lines of CSS out of index.html", and a Windows tool
that rewrites a tracked file — `.claude/launch.json` is written by the harness
itself — puts CRLF back whatever `.gitattributes` says, because the attribute
governs checkout and commit rather than a third party's write. So every
worktree on that machine can go red on a file nobody edited, and the message
will name a formatter rather than a line ending.

Have the landing say it. Before `bun run check` runs, look for `\r\n` in the
tracked text files biome checks and stop with the list and the one command that
fixes it (`bun run format`), rather than letting a whole-file formatter diff
## A worm builds a path string per link per frame, and never caches one

- **Found:** 2026-09-05, claude/crawler-enemy-design-ba0a00
- **Files:** `packages/content/src/crawler-shape.ts`, `packages/render/src/crawler.ts`,
  `packages/render/test/crawler-budget.test.ts`

`drawCrawlerLink` builds its contour by calling `crawlerPath`, which formats a
28-point Catmull-Rom curve into an SVG path **string** and hands it to
`new Path2D(...)` to be parsed again. That is THE LID's arrangement and it is
cheap at one body; a worm is up to nine of them at once, every frame, and
`crawler-budget.test.ts` is the receipt — the `new Path2D` count is the one
number in that file that does *not* come down on the second frame, unlike the
panel's sheet beside it.

The shape only depends on the squeeze, which is one of a small number of
positions on a cycle the whole body shares. So the fix is `baked.ts`'s: a cache
keyed on the quantised squeeze and the tile size, the way `haloSprite` is keyed
on a colour and a radius. Quantising a time is a **visible** change by
`.claude/skills/render-perf`'s own rule, so this has to be proved with the
ordered log rather than the tally: if the diff is not empty, it is an
alternative for `tools/versus/` and not a landing.

`bun run check` proves the half that matters here — the budget rows in
`crawler-budget.test.ts` come down and `packages/render/test/crawler-frame.test.ts`
still draws.


## `bun install` run from a POSIX shell on Windows writes links `tsc` cannot follow

- **Found:** 2026-09-05, claude/crawler-enemy-design-ba0a00
- **Files:** `docs/working-with-claude.md`, `CLAUDE.md`

A fresh worktree on Windows had no `tools/maze/node_modules` at all, so
`bun run typecheck` failed with *Cannot find module `@neon-spore/sim`* from
`tools/maze/run.ts` — an error about the crawler's lane that had nothing to do
with it. Running `bun install` from the agent's Bash tool did not fix it: MSYS
writes the workspace symlink with a POSIX target (`/c/Users/…`), which Bun is
happy with and the Windows `tsc` cannot follow, so the same error came back
looking like a code fault. `bun install --force` from PowerShell wrote a real
junction and the typecheck went green.

Nothing in the repository says so. `CLAUDE.md` already tells a session that a
fresh worktree needs its own `bun install`; it should say *from a native shell
on Windows*, and `docs/working-with-claude.md` should carry the failure mode
under its "ask who answered" heading, because this is the same class of thing —
a number that came off the wrong tool and read as a fault in the code.

A fresh session can finish it: the change is two paragraphs, and
`bun run check` is what proves the tree is still green afterwards.


## `docs/shipped-looks.md` does not know THE CRAWLER exists

- **Found:** 2026-09-05, claude/crawler-enemy-design-ba0a00
- **Files:** `docs/shipped-looks.md`, `packages/render/src/crawler.ts`,
  `packages/render/src/crawler-fx.ts`, `packages/content/src/crawler-shape.ts`

That document is the answer to *what does the game actually draw today*, creature
by creature, with the numbers. THE CRAWLER has a contour family of its own
(`crawler-shape.ts`, the fifth in `packages/content`), three materials along one
body, a drawn neck, a contraction that runs from the head backwards, and two
pictures that outlive the body — none of which is in it.

Write the entry the way the neighbouring ones are written: the figures off
`CRAWLER`, the three inks off `crawler.ts`, and the two lives off
`crawler-fx.ts`. Nothing about the game changes and `bun run check` still
passes, which is the whole of the acceptance.

## The sweep's idle clock is reset by every git command, so nothing is ever swept

- **Found:** 2026-09-05, claude/git-flow-parallel-sessions-6f1b43
- **Files:** `tools/land/idle.ts`, `tools/land/test/idle.test.ts`

`idleDays` takes the newest mtime of everything under `.git/worktrees/<name>/`
and calls that "when somebody last worked here". Git rewrites files in that
directory on essentially any command aimed at the tree, including the sweep's
own `rev-parse` probe and any `git status` a passing session runs, so the clock
is reset by looking at it. Measured on 5 September 2026 across forty worktrees:
every one read 0.0 idle days, several of them last actually worked in two days
earlier, and `KEEP_DAYS = 5` was therefore unreachable. Forty checkouts had
accumulated, each with its own `node_modules`.

Measure something only real work writes. `logs/HEAD` is the candidate — it is
written when a ref moves in that tree (checkout, commit, rebase, reset) and by
nothing else. On the same forty trees at the same moment it spread them from
0.1 to 12.3 hours and separated the live sessions from the litter cleanly. The
safety against sweeping a tree somebody is using stays where it already is,
in `isDirty`; the clock only decides how long a spent tree keeps its
`node_modules`.

## `git worktree remove` deregisters and then fails, leaving an orphan every time

- **Found:** 2026-09-05, claude/git-flow-parallel-sessions-6f1b43
- **Files:** `tools/land/worktree.ts`, `tools/land/orphans.ts`

On Windows, `git worktree remove` drops the registry entry and then fails to
delete the directory — `Directory not empty`, a lagging handle inside
`node_modules`. Twenty-four removals on 5 September 2026 produced twenty-four
of these; every one had to be finished with `rm -rf`. `removeWorktree` already
has that fallback, so a landing survives it, but the window between the two is
exactly the orphan `orphans.ts` exists to report, and a sweep interrupted in it
leaves a directory nothing can find again.

Ask git to remove the directory only after the directory is gone: delete the
tree first, then `git worktree prune`, rather than the other way round. The
retry loop stays for the handle.

## Two lanes landing at once in a clone can silently discard one

- **Found:** 2026-09-05, claude/git-flow-parallel-sessions-6f1b43
- **Files:** `tools/land/run.ts`, `tools/land/land.ts`

A landing is rebase, then `bun run check`, then fast-forward, and the check is
minutes long. Nothing holds the trunk across that gap. In a tree that has `main`
checked out the fast-forward is `merge --ff-only`, which refuses if `main` moved
— the check is wasted and nothing is lost. In a clone where nothing holds the
trunk (`moveRef`, which is every cloud session) it is `git branch --force main
<head>`, and that moves `main` to a commit built on the trunk as it was before
the check started: whatever landed in between is dropped without a word.

Read `main`'s sha at the start of the landing and again before the ref move, and
refuse when the two differ, naming the sha that arrived. `plan()` cannot decide
this — it is a fact about the world at two different moments — so it belongs in
`run.ts` beside the `moveRef` branch, with a test that hands it two shas.

## `tools/frames` leaves its scratch worktrees in the temp directory

- **Found:** 2026-09-05, claude/git-flow-parallel-sessions-6f1b43
- **Files:** `tools/frames/run.ts`, `tools/frames/test/`

`%TEMP%` on this machine holds thousands of `neon-spore-frames-test-*`,
`neon-spore-frames-out-*` and `neon-spore-frames-opening-test-*` directories,
each a checkout of the repository. They are made by `bun run frames` and by the
frames tests, and nothing removes them; three of them were still registered
worktrees. Remove the scratch tree when the capture is done, in a `finally`, and
have the tests clean up after themselves.

## `packages/sim/src/config-creatures.ts` sits exactly on the 250-line limit

- **Found:** 2026-09-05, claude/throb-color-rotation-5dd05f
- **Files:** `packages/sim/src/config-creatures.ts`, `packages/sim/src/config.ts`

The file is 250 lines and `packages/sim/test/limits.test.ts` refuses 251, so a
field cannot be added and an existing comment cannot gain a line. This lane
wanted three sentences on why `throbSpinBeats` came down from four to three and
had to put them in `packages/sim/src/throb.ts` instead, which is the right file
for the argument but leaves the number documented somewhere the config does not
point at. Split it the way `config-gyre.ts` and `config-fleet.ts` were split —
the creature-by-creature clocks (`throbSpinBeats`, `throbFaceMilli`,
`veilMorphBeats`, `wispDwellBeats`, `claspBreakBeats`) are one group and the
score and damage numbers are another — and re-export both from `config.ts` so
no call site moves. `bun run check` proves it: nothing outside the file should
need an edit.
