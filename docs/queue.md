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



## The build-stamp test walks `.claude/worktrees` and fails in the main checkout

- **Found:** 2026-09-05, claude/eye-eyelid-shape-194988
- **Taken:** 2026-09-05, claude/queue-the-build-stamp-test-walks-claude-worktrees-and
- **Files:** `tools/test/build-stamp.test.ts`

Its `sources()` walks the tree from the repository root with
`SKIP = node_modules, dist, .git, legacy, assets`, and `.claude` is not in that
list. The owner's main checkout keeps every open lane's worktree under
`.claude/worktrees/`, so the scan descends into each of them and reports their
`apps/game/build.ts`, `tools/build-stamp.ts` and `tools/director/build.ts` as
offenders — the same four allowed files over and over, from a path the `ALLOWED`
set cannot match because it is relative to the outer root. On this machine the
test fails with about a hundred entries; in a fresh clone with no worktrees it
passes, which is why it landed green.

Add `.claude` to `SKIP`. Then check the other tree-walking tests for the same
hole — anything that starts at the repository root and filters by directory
name rather than by a package glob has it, and a worktree is a full copy of the
repository sitting inside the repository.

## THE FLEET's lattice costs 132 `fillRect` a frame for its crossings

- **Found:** 2026-09-05, claude/fleet-boss-animations-ui-d7adb9
- **Files:** `packages/render/src/fleet-chart.ts`, `packages/render/test/fleet-budget.test.ts`

`drawFleetChart` marks every crossing of the chart with a small square, in a
nested loop over `cols + 1` by `rows + 1` — twelve by eleven on the shipped
field, so 132 `fillRect` calls every frame, for the whole length of the fight.
The new budget beside it measures 192 in total on a frame of this boss, which
makes the crossings roughly seventy per cent of every rectangle the game draws
during it. Nothing else in the game draws a lattice this way; `field.ts` holds
its own behind `SHOW_TILE_GRID` and has never been switched on.

Draw them in one call instead. The crossings differ only in position, and the
two things that change between frames are the shared alpha and the shared size
— so one `Path2D` of rects, rebuilt only when the tile size or the pulse step
changes, or a single baked sprite blitted once and stretched, both give the
identical picture for one call. `packages/render/src/baked.ts` already has the
cache a bake would live in, and `gradient-slot.ts` is the pattern for keying it
to the layout.

**The picture may not change.** This is a speed fix, not a look: the same
squares, the same colour, the same pulse. `fleet-budget.test.ts` is the proof —
lower its `fillRect` rows to whatever the change actually measures, in the same
commit, and `packages/render/test/fleet-frame.test.ts` still has to pass.

## Split `frame-passes.ts`: it sits exactly on the 250-line limit

- **Found:** 2026-09-05, claude/lock-wave-and-guide
- **Files:** `packages/render/src/frame-passes.ts`

THE LOCK's dotted line needed one parameter and four lines of comment on
`drawBodies`, and paying for them cost two rounds of shaving sentences out of
that comment — which is the warning `packages/sim/test/limits.test.ts` exists
to give, and the same one `act-3b.ts` records having ignored once. The file is
now at exactly 250, so the next pass added to a frame breaks the build before
it draws anything.

Cut it where it already reads as separate: `drawFieldBack`, `drawBodies`,
`drawShip` and `drawOverlays` are four passes with nothing shared but their
arguments, and the seam `effects-*.ts` uses is the obvious one — take the two
that are about the field away from the two that are about the ship. Keep
`frame-passes.ts` as the barrel the way `waves.ts` and `types.ts` are, so
nothing reaching for a pass through it has to move.

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

## A landing can put back a queue entry another lane took out

- **Found:** 2026-09-05, claude/queue-items-bj85ja
- **Files:** `tools/land/land.ts`, `tools/land/run.ts`, `tools/land/test/`

Twice on 5 September 2026 a landing re-added `##` entries to `docs/queue.md`
that another lane had already removed along with the work. The trunk carried
`tools/land/refusal.ts` and `--settle` and `STARVED_MS`, all landed, and the
queue went on listing all three as waiting. A session that believed the file —
which is the whole point of the file — would have done them a second time,
which is the failure the preamble above already describes happening on 3
September.

The mechanism is a rebase resolving `docs/queue.md` in the lane's favour. A
lane branched before the removals holds a copy of the file that still has the
entries in it; the conflict is in a document rather than in code, so it reads
as prose to be kept rather than as a deletion to be honoured, and taking
"ours" puts every one of them back in one move. Nothing fails: the file is
still valid, the format test still passes, and the only sign is a queue that
has grown.

`bun run land` is where to catch it, because it is the one command that sees
the lane and the trunk at once. Before the fast-forward, compare the `##`
titles in the lane's `docs/queue.md` against the trunk's: an entry the trunk
has *removed* since the merge base and the lane is putting back is a resolution
nobody chose, and the landing should stop and name the titles. Removing an
entry is ordinary and adding a new one is ordinary; only *re-adding* one is the
mistake, and the merge base is what tells the three apart. The comparison is a
pure function over two strings and a base, so `tools/land/test/` can hold every
case without a repository.

## Two captures of one commit are not the same picture

- **Found:** 2026-09-05, claude/queue-items-bj85ja
- **Files:** `tools/frames/capture.ts`, `tools/frames/page.ts`, `tools/frames/test/opening.test.ts`

`run.ts` refuses to write a before-and-after pair whose frames are the same,
on the argument that a picture of an unchanged field teaches nothing. The
comparison is now a digest of the whole frame (`sameFrames`), and while
writing the test for it, **two captures of the same build at the same wave,
tick and zoom came back with different digests** — measured, not suspected:
`d821342…` against `749b881…` for `{ wave: 0, ticks: 60, zoom: 2 }` twice in a
row against one preview server. So the guard cannot fire, and a lane that
photographed a wave its change does not touch is handed two useless pictures
and no warning.

The clock is the likely cause and it is the one thing a capture does not
already control. `advance` and `paint` are frozen and so is rAF, but
`clearOpening` *polls* — it paints until the opening lets go, and how many
frames that takes depends on the machine. Every one of those paints advances
the render clock, and everything drawn on `time` (the wobble, the sway, every
own-motion in `content/own-motion.ts`) is at a different phase on the second
run.

Freeze the page's clock the way rAF is already frozen — a monotonic stub for
`performance.now` and `Date.now` installed before the bundle runs, advancing
only by the sixtieths `paint` spends — and then hold it: two `captureFrames`
of one build at one spec must come back byte-identical, which is a test
`tools/frames/test/opening.test.ts` can run against the preview it already
starts. Until that holds, the `identical:` line in `run.ts` is a comment.

## There is no way to photograph the working tree on its own

- **Found:** 2026-09-05, claude/queue-items-bj85ja
- **Files:** `tools/frames/run.ts`, `tools/frames/serve.ts`, `tools/frames/test/`

`bun run frames <sha>` always takes a **pair**: it checks out the commit and
its parent, builds both, and refuses to write anything if the two frames are
the same. That is right for a change to a look, and it is the wrong shape for
every change whose parent cannot produce the picture at all. `--boss-round`
was the case that found it — the flag calls a handle the parent has not got,
so the "before" side throws by design, and the only way to see THE MAZE's
fourth sheet was a throwaway script that started `preview:once` and called
`captureFrames` itself. That is the friction `shot.ts` exists to stop being
paid again, and this lane paid it.

`--only` (or `bun run frames . --wave N`) should capture **this tree** once,
with no worktree, no parent and no `identical:` guard, straight against the
preview `captureAt` already knows how to start: everything below the worktree
is there, and `tools/frames/test/opening.test.ts` drives exactly this path
already. The pair stays the default, because a picture with nothing to compare
it to is the weaker report and should be the thing somebody asks for by name.
