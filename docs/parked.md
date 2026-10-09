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

## THE BLISTER, lane 5: SWIPE, half built

- **Found:** 2026-10-08, claude/task-queue-work-e99d1a
- **Taken:** 2026-10-09, claude/queue-tasks-d82b1f (claim: claude/queue-the-blister-lane-5-swipe-half-built)
- **Files:** `packages/sim/src/blister-swipe.ts`, `packages/render/src/blister-help.ts`, `tools/director/src/entry-fields-blister.ts`, `tools/director/test/on-field-controls.test.ts`

The simulation and the hand are in; the owner archived the session before the
rest. Built: `gesture: "swipe"` and `way` (left, right, up, down; absent right)
on `BlisterSpawn`, now the one shape `SpawnEntry` and `WaveEntry` extend; the
`blisterSwipe` drag target with `id` the body (`drag-targets-e.ts`, the net's
`DRAG_TARGETS`); `blister-swipe.ts` judging the lift — `blisterSwipeMilli`
along the way and more along than across — with a sink voiding open strokes
(`blisterStrokes`, `blisterAlongMilli`, both hashed); the press in
`render/blister-tap.ts`, the lift's carry in `touch.ts`; the help, THE
INSTAR's track turned to the way, in `blister-help.ts`.

Left, in order:
- The replay test (`packages/sim/test/`, beside `blister-hold.test.ts`): a
  right stroke knocks one blow off, a short one and a wrong-way one do not, a
  stroke open across a sink counts nothing, the wrong seat counts nothing.
- A frame test beside `blister-hold-frame.test.ts`, and a `touch` test that a
  press on a SWIPE blister is a `blisterSwipe` drag whose lift carries dx/dy.
- The director: `swipe` in `BLISTER_GESTURES`, `blisterWaysOf("swipe")` the
  four ways with arrow labels, a real `setBlisterWay` (the WAY row's onPick
  sets nothing today), `way` in `serialize-entry.ts`, and a test.
- `blisterSwipe` from `"unbuilt"` to `"field"` in `on-field-controls.test.ts`,
  with a FIELD_CONTROLS row (`field-controls-gum.ts`' shape) and a pose in a
  file of its own (`poses-field-controls-dark.ts`' shape).
- Look at it with `bun run frames . --wave "THE BLISTER" --entry 0:gesture=swipe`
  on the tapping seat; `docs/spec/blister.md`'s status and *The look, as
  built* say SWIPE; a time-log row.
