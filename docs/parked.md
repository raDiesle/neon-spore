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

## THE GAUGE's two thumbs: the look half

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-18, claude/queue-the-gauges-two-thumbs-the-look-half
- **Files:** `packages/render/src/gauge.ts`, `packages/render/src/gauge-round.ts`, `packages/render/src/touch.ts`, `packages/render/src/touch-hold.ts`, `packages/render/test/gauge-frame.test.ts`, `tools/director/src/`, `tools/director/test/on-field-controls.test.ts`, `docs/spec/controls.md`

The simulation half of the queue item "THE GAUGE changes state more than once,
and asks for more than one gesture" landed: the jam (`jamBeat`, the pilot's
`drag` at `gaugeNeedle` read as a bearing, `gaugeSettleBeats` of settle) and
the bind (`boundBeat`, the navigator's `drag` at `gaugeBand` holding the wound
band open and stopping its walk), in `sim/src/gauge-hand.ts` and
`gauge-band.ts`, with `sim/test/gauge-hand.test.ts` and the two cue arms
(`render/src/boss-cue-read-e.ts`). The band already draws at `gaugeSpanNow`,
so the narrowing is visible; nothing else on the picture hands the sim either
thumb.

The look half, on the model of THE MIRROR's (`render/src/mirror-grip.ts`,
`9820b180`) and THE MAZE's parked entry above, in a render/src/gauge-grip.ts
and its test plus a tools/director/src/field-controls-gauge.ts:
`gaugeNeedleUnder` on the needle's own stem (`gaugeNeedleTip`, `gaugeDial`) for
seat 1 while `gaugeJammed` only, a `drag` hold at `gaugeNeedle` whose moves
report a bearing about the dial's centre; `gaugeBandUnder` on the band's arc
(`gaugeBandMid`) for seat 2 while `gaugeBound` only, a plain on/off `drag` at
`gaugeBand`; the dead valve shown as a dead valve on his slab and the wound
band shown as wound on her dial; the director's two on-field entries and the
two `docs/spec/controls.md` rows that `documentedDragTarget`'s `gaugeNeedle`
and `gaugeBand` cases are waiting on; then `bun run queue done` on the item.
A look with no shipped alternative.
