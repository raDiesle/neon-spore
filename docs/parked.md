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

## THE FLEET's flood, rake and wreck: the sparks half

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `packages/render/src/effects-spark-silent-boss-b.ts`, `packages/render/src/effects-ingest-silent-boss-b.ts`, `packages/render/src/effects-boss.ts`, `packages/render/src/fleet-grip.ts`, `packages/render/src/fleet-grip-draw.ts`, `docs/spec/bosses.md`

**The look landed; the sparks did not.** The wound is drawn and answers all
three thumbs — `packages/render/src/fleet-grip.ts` has the geometry and the
hit tests, `fleet-grip-draw.ts` the plume, the state's own window and this
seat's ring with its word on it, `fleetGripUnder` is last in `handleUnder`,
the three on-field entries and the three `docs/spec/controls.md` rows are
written, and §11.6 has *The look*. `packages/render/test/fleet-grip.test.ts`
and two cases in `fleet-frame.test.ts` hold it. This entry is what the look
half was split off from, not a thing nobody has started: the halves were
named when the work began and the first landed on its own.

**What is left is the five events.** They are still on both silent lists —
`effects-spark-silent-boss-b.ts` and `effects-ingest-silent-boss-b.ts` — and
nothing throws them: the plume up, the thumb on it, each square raked, the
sea healing, the wreck going under. Take each off its list and throw it from
a new packages/render/src/fleet-grip-fx.ts hung off `effects-boss.ts`, on
the model of the boss beside it; read the moment off `phase`, `holeCol`,
`rakeCol` and `wreckPullMilli` the way the drawing does, and keep nothing
that outlives a frame outside `Effects` (`restart.test.ts` checks). §11.6's
*What is not built* paragraph goes when they land.

When it is green: `bun run check`, commit, land. Remove this entry from
`docs/parked.md` in the same commit — `bun run queue done "THE FLEET's flood,
rake and wreck: the sparks half"`.
