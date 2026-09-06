# Queue

Technical work a session found and did not do. Every entry here is waiting for
a session of its own, and every entry here drains without the owner deciding
anything.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped, and
**a command that failed and was worked around** — retried, slept past, run
twice. Working around one is what keeps it, and every later session pays the
same tax in minutes and in tokens. The test is one question: **could a fresh session finish this alone and prove it
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
