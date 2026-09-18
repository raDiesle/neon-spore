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

## THE MIRROR's reflect and hold have no picture: the look half of §6.2

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `packages/render/src/mirror.ts`, `packages/render/src/touch-ship.ts`, `packages/render/src/handles.ts`, `packages/render/src/simon-fx.ts`, `packages/render/src/effects-ingest-silent-boss-b.ts`, `packages/render/src/effects-spark-silent-boss-b.ts`, `tools/director/src/field-controls-page.ts`, `tools/director/src/poses-bosses-rounds.ts`, `tools/director/test/boss-states.test.ts`, `docs/spec/controls.md`, `docs/spec/bosses.md`

The simulation half of the queue item *THE MIRROR changes state more than
once, and asks for more than one gesture* landed: three gestures
(`MIRROR_GESTURES`), the last round given back on the mirror's own ship
through the `mirrorLobe` drag target (`id` 0 its cannon, 1 its shield, read
by seat the way `touch-ship.ts` reads the pair's own), the `hold` phase with
`holdThumbs` and `holdBeat`, the `mirrorGrip` event, the `panel` verdict and
the `CARRY · REPEAT` and `PIN` cues (`packages/sim/src/mirror-hand.ts`,
`config-mirror.ts`, `docs/spec/bosses.md` §11.3 *Three gestures*). Nothing
sends the command yet and nothing draws it, so the item stays taken until
this lands:

- hit-test the mirror's two lobes on both screens and send `mirrorLobe`
  with the lobe's `id`, press, move and lift, with `fromMilli` the carry —
  the pilot's and navigator's reading of the pair's own hull in
  `touch-ship.ts` (`pilot()`, `navigator()`) turned upside down at
  `mirrorHullY`, under `reflect` and `hold` only (`mirrorGesture`);
- the `FIELD_CONTROLS` entry "THE MIRROR'S LOBES" and the
  `docs/spec/controls.md` row, notes in short words of what player 1 and
  player 2 do (`tools/director/test/on-field-controls.test.ts` already
  carries the case);
- the rings on its lobes under `reflect`, the two thumbs and the count
  draining over `mirrorHoldBeats` under `hold`, the grip and the lift
  (`mirrorGrip`) — then take the event out of both silent lists;
- the `hold` pose in `poses-bosses-rounds.ts`, and it struck from
  `OWED.mirror` in `boss-states.test.ts`;
- `packages/render/test/mirror-frame.test.ts` or the existing frame test:
  every state on all three screens;
- `bun run queue done "THE MIRROR changes state more than once, and asks for more than one gesture"`.

A look with no shipped alternative — say so in the commit.
