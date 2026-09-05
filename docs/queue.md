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

## THE VOLLEY's guide has no rehearsal, so its wave is read rather than watched

- **Found:** 2026-09-04, claude/meteor-enemy-shield-reflect-0d82f2
- **Taken:** 2026-09-05, claude/queue-the-volleys-guide-has-no-rehearsal-so-its-wave-i
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/scenes/`,
  `packages/content/src/waves/act-5.ts`

THE VOLLEY shipped with a three-line prose guide and no `scene`, exactly as THE
CAROM did two entries up and for the same reason: what the pair has to learn is
a *shape* — a ward that sends the body back up the field rather than off it —
and a shape does not read off a line of text. It is the worse of the two to
describe, because the thing being taught is that a control they already know
does something it has never done before.

Write one under `packages/content/src/scenes/the-volley.ts` on the pattern
`the-recoil.ts` sets, register it in `scenes.ts`, and put `scene: "theVolley"`
on the `theVolley` wave's guide. Three steps: the diagonal coming down and the
shield answering it, the body climbing away with one plate fewer, and the shell
bursting in mid-air over a body the cannon then takes. The rehearsal walk in
`packages/content/test/` picks it up on its own once it is named.

## `tools/frames`' browser tests fail intermittently under a full `bun run check`

- **Found:** 2026-09-04, claude/air-above-the-ship-seat-tint
- **Files:** `tools/frames/test/opening.test.ts`, `tools/frames/capture.ts`, `tools/frames/serve.ts`

Twice in five runs of `bun run check` a single test in `tools/frames/test/`
failed, and once in isolation it passed immediately. The one run that named it
was "captureFrames past a wave's opening > stands on the guide, and a strip of
it counts painted frames", failing inside `captureFrames` at `capture.ts:193`.
Every other test in the repository is a pure function or a stub canvas; these
are the only ones that start a real preview server and drive a real browser,
and `bun test` runs files in parallel, so under the full suite they are
competing for a port and for CPU with two hundred other files.

A green check that is only green four times in five is not a gate. Find the
race — the likeliest candidates are the timeout `capture.ts` waits for a
painted frame under, and whether `serve.ts` can be handed a port another test
file's server has just taken — and make it deterministic. Running the file
alone repeatedly is the reproduction to beat: it has to fail there before a fix
means anything, so drive the load up rather than lowering the timeout and
calling it fixed.

**What has already been tried, on 5 September 2026, without reproducing it.**
Seven full runs of the suite: four on their own, and three with two more copies
of `bun test` running beside them, which is about as starved as this machine
gets. Every one of the four browser tests passed. Timed on an idle machine each
capture costs about two seconds against a thirty-second budget, so whatever
goes wrong is not the happy path being slow — it is fifteen times over. Two
things came out of the attempt and are worth having before the next one starts.
`bun run check` runs its three parts in sequence, so it is exactly `bun test`
for contention and there is nothing to be gained by driving the whole command.
And the file launches **four separate headless Chrome instances**, one per
`captureFrames`, inside a 272-file parallel run — that is the part of the cost
which is neither measured nor bounded, and sharing one browser across the file
is the change to reach for once the failure can be produced on demand.

## `bun run frames` cannot photograph a burst: sparks move only when it paints

- **Found:** 2026-09-05, claude/explosion-color-matching-464ec1
- **Files:** `tools/frames/run.ts`, `tools/frames/launch.ts`, `apps/game/src/handle.ts`

`handle.ts`'s `advance(ticks)` steps the simulation without painting, and
`paint()` advances every render effect by exactly one sixtieth of a second. So
the two clocks come apart: a strip that walks a wave at `--stride 3` moves the
world three ticks and the sparks one frame, and anything that lives in *painted*
seconds — a spark's 0.4 s, the last-step fall replay in `rock-impact.ts` — is
still on screen thousands of ticks later, or has not started yet.

The practical consequence is that a burst at the hull is uncapturable. Four
captures were spent on the colour change that found this — a bulb's cyan burst
and a rock's impact — and none of the frames contained a single spark: the rock
hung a few pixels above the skin for sixty painted frames because its replay had
only advanced one second's worth of sixtieths.

What to add is a paint-only mode: something like `--settle <n>`, which paints
`n` frames without stepping the world at all, so a caller can advance to the
tick the event fires on and then let the picture catch up. The tool's own tests
in `tools/frames/test/` are where it is proved; `opening.ts` already counts
painted frames rather than ticks for a rehearsal and is the shape to copy.
f91f97a5 (Queue: bun run frames cannot photograph a spark burst)

## Row 8 of `docs/spec/briefings.md` §1 names a range, and the range is wrong

- **Found:** 2026-09-05, claude/queue-items-bj85ja
- **Files:** `docs/spec/briefings.md`, `packages/content/test/waves.test.ts`

The right-hand column of that table now names its waves as `N · NAME` cells
and `packages/content/test/waves.test.ts` holds every one of them against
`WAVES`. Row 8, "the rest of the bestiary", is the one cell it skips, because
it still reads `22–27` — a range, which the test says out loud that it cannot
check.

The range is not merely uncheckable, it is untrue, and the subject list beside
it has drifted further than the numbers. **The runt was retired for THE LURE**
(`packages/content/src/index.ts` says so where the spare contour is kept), so
the first subject names a creature the game has not got. **The pods and the
rock speed tiers are taught on THE PURGE (30) and THE WARD (31)**, both
outside `22–27` — the merge note four paragraphs below the table already says
"THE WARD carries the pod and all three rock speed tiers".

Read the guides on waves 22 to 31 and give the row its waves by name, the way
row 7 now has them. That is a reading rather than an arithmetic fix, which is
why it was not done by the lane that wrote the test: the question is which
wave teaches which subject, and the guides are the only place that answers it.
The test needs no change — a cell that names waves is checked the moment it
names them — but its paragraph about the skipped row should go once nothing is
skipped.
