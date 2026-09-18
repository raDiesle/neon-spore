# Parked

Work a session set aside. Not ideas — **work**, in a state somebody would have
to pick back up.

This file is for one thing: a session that was in the middle of something and
stopped. A refactor started and abandoned when it grew, a test left skipped with
a reason, a migration done in three files out of five, a failure diagnosed and
not fixed. The next session opens the clone knowing only what `origin` and the
commit messages tell it, and none of those say "the other half of this is still
undone" — that is the sentence this file exists to carry.

**It is the front of the queue, not a shelf.** `bun run queue` lists what is
here before anything in `docs/queue.md`, because half-done work is the only
kind that gets harder while it waits; `bun run queue next` hands it to a fresh
session as a prompt, and that session removes the entry in the commit that
finishes it. Nothing here waits for the owner to decide anything — if it does,
it is not parked work, and `docs/queue.md`'s `Asks:` line is where it goes.

**It is not the backlog, and it must never grow into one.** What the game could
have and does not — a creature, a mechanic, a control, a weapon, a boss, a round
— belongs in `docs/spec/`, which is what the director's `◇ NOT BUILT YET` sheet
reads. That page is the owner's own working surface: he picks from it by hand,
in a session he opens. An idea filed here instead is filed away from the built
things it would sit beside, on a page nobody opens — which is what happened last
time and why sixty-two entries had to be deleted by hand.

The test, if an entry is borderline: **would a session need this to finish
something already started?** Yes, it belongs here. No — it is a thing the game
could be rather than a thing half-done — it belongs in the spec. A technical
improvement nobody has started belongs in `docs/queue.md`, which drains the
same way.

**Work waiting on an answer is not parked work.** This file used to say nothing
here waits for the owner to decide anything, and that is still true of *this*
file — but it is no longer a thing with nowhere to go. `docs/queue.md` takes an
entry whose first step is a question, on an `Asks:` line; park something here
only when a session actually started it and stopped.

**One `##` per parked item**, in the same shape a queue item takes, because the
same tool reads both and the same session picks either one up cold:

```
## One line saying what is half-done

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What was started, how far it got, and what the next session has to know that
the code does not already say.
```

Delete the entry when the work lands or is abandoned for good; the history
keeps it either way. Nothing here is ticked, and nothing here is counted — a
count is a way of saying something is owed, and nothing here is.
`tools/queue/test/queue.test.ts` fails on an entry a cold session could not act
on.

## THE FLEET's flood, rake and wreck: the look half

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `packages/render/src/fleet-marks.ts`, `packages/render/src/fleet-fx.ts`, `packages/render/src/fleet-hulls.ts`, `packages/render/src/touch-field.ts`, `packages/render/src/touch-hold.ts`, `packages/render/src/effects-spark-silent-boss-b.ts`, `packages/render/src/effects-ingest-silent-boss-b.ts`, `packages/render/test/fleet-frame.test.ts`, `tools/director/src/field-controls-page.ts`, `tools/director/test/on-field-controls.test.ts`, `docs/spec/controls.md`, `docs/spec/bosses.md`

The simulation half of the queue item "THE FLEET changes state more than
once, and asks for more than one gesture" landed: `hunt` → `flood` on a hit
(the navigator's `drag` at `fleetBreach` held on the plume, the pilot's at
`fleetRake` carried along the hull in whole tiles from the hole, a square
struck every `fleetRakeBeats` with both thumbs down, `fleetFloodBeats` to do
it in) → `wreck` when the hull is struck end to end (her `drag` at
`fleetWreck` pulled down `fleetWreckPullMilli` while his thumb stays,
`fleetWreckBeats`), either window closing plugging the hull whole again —
`sim/src/fleet-state.ts`, `fleet-flood.ts`, `fleet-hand.ts`, with
`sim/test/fleet-gestures.test.ts`, the cue's two arms in
`render/src/boss-cue-read-g.ts`, the director's hand in
`tools/director/src/boss-hand-fleet.ts` and its three cards on the STATES
sheet. Nothing on the picture hands the sim any of the three thumbs, and
the five events are on both silent lists.

The look half, on the model of THE MIRROR's grip (`render/src/mirror-grip.ts`)
and THE GAUGE's parked entry above, in a render/src/fleet-grip.ts and its
test: a plume standing on `holeCol`/`holeRow` on both screens while `phase`
is not `hunt`, with the window draining under it (the clock's own bar,
narrowed); `fleetBreachUnder` on the plume for seat 2, a plain on/off `drag`
at `fleetBreach`; `fleetRakeUnder` on the holed hull for seat 1 while
`flood`, a `drag` at `fleetRake` whose moves report `fromMilli`/`fromYMilli`
from the grab in thousandths of a chart tile; the wreck lying on the water
with `fleetWreckUnder` for seat 2 while `wreck`, a `drag` at `fleetWreck`
reporting the pull down; the five events taken off the two silent lists and
thrown from a fleet-grip-fx.ts — the plume up, the thumb on it, each square
raked, the sea healing, the wreck going under; the three on-field entries and
the three `docs/spec/controls.md` rows that `documentedDragTarget`'s cases
are waiting on; §11.6 gets *The look* and loses *What is not built*. A look
with no shipped alternative.
