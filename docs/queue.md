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



## Three tables the next creature cannot be added to without splitting them first

- **Found:** 2026-09-06, claude/electric-barrier-enemy-e6fi1d
- **Files:** `packages/sim/src/creature-state.ts`, `packages/content/src/creatures-table.ts`, `packages/content/src/mechanics-table.ts`

All three are total over `CreatureKind` or `MechanicId`, so a new creature costs
each of them a row — and all three now stand at exactly 250 lines, which is the
limit `packages/sim/test/limits.test.ts` enforces. THE GRATE fitted only because
its rows were written short and one comment in `creatures-table.ts` was trimmed
by two lines to make room; the next one will not fit at all, and the lane that
hits this will be a lane that came to add a creature, not to choose a seam.

Each has a seam its own header already names. `creature-state.ts` says it: the
fields that "only mean anything against each other" go next door, the way
`creature-state-held.ts`, `-strand.ts`, `-crawler.ts` and `-veer.ts` already
have — THE GYRE's four and THE LID's five are each such a group.
`creatures-table.ts` and `mechanics-table.ts` are split by family already
(`creatures-guarded.ts`, `creatures-worn.ts`, `creatures-bare.ts`,
`mechanics-rocks.ts`, `mechanics-run.ts`), and the families to cut next are the
same in both: the bodies one seat cannot see whole — `lure`, `veil`, `wisp`,
`ghost`, `dart` — which is a group the bestiary and `render/comms.ts` both
already read as one.

Do all three in one lane: they fail the same way, on the same day, for the same
reason, and a lane that splits one of them learns the argument for the other two
for free.


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

## Every organic shape is rebuilt as an SVG path *string* on every frame

- **Found:** 2026-09-03, claude/game-performance-mobile-analysis-cd4207
- **Files:** `packages/content/src/shapes.ts`, `packages/render/src/hull.ts`, `packages/render/src/creatures.ts`, `packages/render/src/shield.ts`, `packages/render/src/maw.ts`, `packages/render/test/frame-budget.test.ts`

`openSmoothPath` and `blobPath` both return a **string**, built with
`toFixed(2)` on every coordinate, and every caller in `render/` hands that
string straight to `new Path2D(...)`, which parses the decimal text back into
the numbers it was made from. The round trip runs once per shape per frame.

Measured on this machine (Bun, null canvas, 375x812 dpr2, wave 12):

| what | us per frame |
|---|---|
| `drawShip` (the whole pass) | 118 |
| — of which `drawHull` | 117 |
| — — of which `openSmoothPath(141 pts)` | 54 |
| — — of which 141 x `surface()` | 21 |
| `drawBodies`, 2 creatures | 28 |
| `drawFieldBack` | 2 |
| `drawOverlays` | 2 |

`drawHull` alone is 78% of a quiet frame and it is paid on **every** frame of
**every** wave, because the hull is always there. Its contour is
`pointsAcross(f, l, 140)` — 141 points — and `openSmoothPath` then makes 840
`toFixed(2)` calls and one 5 085-character string out of them. `blobPath` does
the same at `N = 40` for each creature body, which is where the ~14us per
creature goes.

The work: add a sibling of each that writes into a `Path2D` with `moveTo` /
`bezierCurveTo` instead of building text, and use it at the sites in `render/`
that only ever wanted the `Path2D`. The SVG-string form stays for
`tools/shape-sheet`, which really does want text. Dropping `toFixed(2)` moves
a coordinate by less than 0.005 px, which `.claude/skills/render-perf` calls
*imperceptible* and lands, but say so in the commit message in those terms and
prove it with the ordered call log the skill describes. Lower the rows in
`frame-budget.test.ts` in the same commit.

## The op-count budget weighs one quiet wave; the five expensive ones have none

- **Found:** 2026-09-03, claude/game-performance-mobile-analysis-cd4207
- **Files:** `packages/render/test/frame-budget.test.ts`, `packages/render/test/frame-harness.ts`

`frame-budget.test.ts` pins wave 3 on both seats and two open eyes. Wave 3 is
one of the *cheapest* pictures in the game. Measured over all 38 waves, each
stepped to the tick where it carries the most bodies, in Chrome at 390x844
dpr2 with the CPU throttled 4x (DevTools' mid-tier-mobile preset), the five
dearest frames are:

| wave | | ms per paint at 4x |
|---|---|---|
| 32 | THE GHOST | 7.06 |
| 31 | THE WISP | 6.80 |
| 15 | BULB QUEEN | 6.47 |
| 34 | THE ECHO | 6.41 |
| 37 | THE GYRE | 6.38 |

— against a floor of 3.5 ms on wave 1 and 0.76 ms on THE GAUGE, whose round
has no field and no hull. None of the five has a budget row, so any of them can
get slower without a test noticing.

Add a row per wave for those five, both seats, built the way the existing rows
are: step to the wave's peak population (the harness needs a helper for that —
step in small increments and keep the tick with the most `world.creatures`),
measure `ctx.tally`, and write down the exact number. Do not pad.

## THE GHOST is the dearest frame in the game, and it is dearer on one seat

- **Found:** 2026-09-03, claude/game-performance-mobile-analysis-cd4207
- **Files:** `packages/render/src/ghost-trail.ts`, `packages/render/src/ghost-row.ts`, `packages/render/src/ghost-eyes.ts`, `packages/render/src/ghost.ts`, `packages/render/src/ghost-glitch.ts`, `packages/render/src/ghost-release.ts`

Wave 32 costs 7.06 ms per paint at 4x CPU throttle and 12.45 ms at 6x
(DevTools' low-end-mobile preset) — 75% of a 60 Hz frame with the hull, the
field and everything else still to pay for. On a 75 Hz display at 6x it already
misses 38 frames in 186. It is also the one wave measured where the two seats
disagree by more than noise: 1.41 ms on player 2 against 1.04 ms on player 1,
unthrottled, at peak population.

Five of the six files above set `globalCompositeOperation = "lighter"`, and
`ghost-row.ts` draws a band across a whole row of the field on the seat that is
*not* shown the ghost — which is player 2, the dearer one. A `lighter` pass over
a large area is a blend the compositor cannot skip.

Find out which of the six costs what, the way this entry's numbers were found:
time each draw call separately through a null canvas (see the table in "Every
organic shape is rebuilt as an SVG path *string*"), then decide. A saving that
changes a pixel is a VERSUS candidate, not a landing.

## The game paints a full field frame behind the main menu, under a blur

- **Found:** 2026-09-03, claude/game-performance-mobile-analysis-cd4207
- **Files:** `apps/game/src/main.ts`, `apps/game/src/loop.ts`, `apps/game/src/menu.css`, `apps/game/src/run-state.ts`

`startLoop`'s `onFrame` calls `paint()` unconditionally. The `menu` hold stops
the *world* from ticking but nothing stops the *drawing*, so while the main menu
is up the device draws a complete field frame — hull, bodies, band, HUD — sixty
times a second. `#menu` is `position: fixed; inset: 0` over it, and
`#menu .sky` carries `backdrop-filter: blur(5px) saturate(1.35)` with a scrim
that runs from `rgba(7, 6, 15, 0.93)` at the top to fully opaque at the bottom.
So the phone pays for a frame, and then pays again to blur that frame, to show
at most 7% of it through the scrim at the very top.

This is the first screen a player sees and the one a phone sits on longest.

Measure it first — how much of a menu-idle frame is the paint and how much is
the blur — then choose. If the visible 7% carries no motion the world is not
running anyway, a lower repaint rate behind the menu is a straight win; if it
does, the reduced rate is a look and goes to `tools/versus/candidates/` for the
owner to judge. Say which in the commit.

## A frame can be measured on this desk but not on the phone it is for

- **Found:** 2026-09-03, claude/game-performance-mobile-analysis-cd4207
- **Files:** `apps/game/src/main.ts`, `apps/game/src/handle.ts`, `tools/perf/measure.ts`, `docs/performance.md`

`bun run perf` measures every wave at its busiest tick with Chrome's CPU
throttled to DevTools' mid-tier-mobile setting, and `docs/performance.md` says
what that is worth: a good proxy, and not a phone. The half that is still
missing is the one that needs no proxy at all — a page the owner can open on the
device the game is actually for.

Add `?perf=1`, beside `?play=1` and `?raster=1` (`apps/game/src/raster.ts` is
the pattern for reading a flag off the URL). It runs the same sweep
`tools/perf/measure.ts` runs — enter each wave, step to its peak population,
time sixty paced paints — and prints the table on screen rather than to a
console nobody on a phone can read. The measuring logic is already written and
already has a home; what this needs is a caller that runs it in the page and a
plain readout, with the totals big enough to photograph.

`window.neonSpore` is installed in every build (`handle.ts`), so the sweep has
everything it needs. Keep the same viewport-independent shape the tool records —
throttle is meaningless on a phone, so the page records `null` for it and
`docs/performance.md` gains a line saying a phone run is compared against other
phone runs, never against a throttled desktop one.

## `bun run perf`'s 20% noise floor still flags waves nobody touched

- **Found:** 2026-09-06, claude/queue-the-perf-baseline-covers-38-of-the-45-waves-the
- **Files:** `tools/perf/compare.ts`, `tools/perf/test/compare.test.ts`, `docs/performance.md`

`NOISE_PCT` is 20, and two runs taken twenty minutes apart on the same idle
machine — no other session, nothing else open — reported THE ROCK 31% worse and
THE WARDEN 30% worse, with FINALE 26% better in the same breath. Nothing in the
lane between them went near any of the three. The run-wide drift `compare.ts`
already divides out was doing its job; what is left is per-wave variance the
threshold does not cover.

That matters because of what the tool is for. A session that adds a shape runs
this and reads the verdict, and a verdict that names three waves it did not touch
teaches it to stop reading — which is the failure mode the whole comparison
exists to prevent.

Two things to find out before changing a number. Take three runs back to back on
an idle machine with no commits in between and print the per-wave spread: that
says what the floor actually is, and it may be a good deal higher than 20 for the
cheap waves, which are the ones that swung. Then decide whether the answer is a
higher floor, a floor that scales with how cheap the wave is (a 30% swing on a
2.8 ms wave is 0.8 ms and on a 7 ms wave is 2.1 ms — the second is worth hearing
about and the first is not), or an absolute millisecond gate under which nothing
is reported at all.

Whatever it becomes, say it in `docs/performance.md` in the terms the run prints,
and hold it in `compare.test.ts` with a fixture built from two runs that differ
only by noise.
