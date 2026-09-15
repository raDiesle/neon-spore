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

## THE LEECH and THE LIMPET are malfunctions in the simulation and nowhere else

- **Found:** 2026-09-15, claude/queued-tasks-51d8f9
- **Files:** `packages/sim/src/harpoon.ts`, `packages/sim/src/cling.ts`, `packages/content/src/creatures-cling.ts`, `packages/content/src/waves/act-9.ts`, `packages/render/src/cling.ts`, `packages/render/src/cling-fuse.ts`, `packages/render/src/duty.ts`, `packages/render/src/radar-blip.ts`, `packages/render/src/codex.ts`, `packages/render/src/hull-mood.ts`, `packages/render/src/fault-emitter.ts`, `tools/director/src/brushes.ts`, `docs/spec/bestiary.md`

The queue's two entries for these creatures, half done. **The simulation half
has landed and is proved** (`harpoon.ts`, `test/harpoon.test.ts`): both are
`MalfunctionKind`s placed on the map, the fault fires the body onto its control
already stuck, watches the control every *tick* against
`cfg.harpoonStillBeats` (1.5, one field for both, the owner's own
instruction), loses the round when it stands still, and reels the body in when
the placement runs out. A placement is one harpoon and stays spent once it has
gone off. The same two bodies still arrive as creatures too, and the two
steppers ignore each other by id.

**What is left is the picture.** Points 1, 2, 4 and 6 of the owner's list, one
of them now landed:

- the harpoon **fired** from the emitter and the **reel** back to it when the
  placement ends (`fault-emitter.ts`; the events `clingGrip` and `clingFreed`
  are already pushed at both moments);
- ~~**MOVE CANNON!** / **MOVE SHIELD!** under the siren, on the seat *without*
  the control~~ — **done, 15 September 2026** (`render/duty-harpoon.ts`). The
  branch reads `faultOn` rather than the field, and it *replaces* the table's
  general word on the away seat rather than adding to it: the seat holding the
  control still reads KEEP MOVING, which is all it can do about it;
- the **code above the body** the way a codex is written (`codex.ts`) and the
  **radar square** round it (`radar-blip.ts`), with the word above the square;
- the **timer** above it, which is the placement's own remaining beats;
- ~~the control's **glow growing toward a dangerous colour**, off
  `harpoonDangerMilli`, restarting on every move~~ — **done, 15 September 2026**
  (`render/harpoon-danger.ts`). A halo over the lobe, the ramp read straight off
  the world and not eased, the colour the seat's own `rim` carried to its own
  `edge` so neither seat borrows the other's warning, and the pulse quickening
  from one a second to four. The dome gets a light per bump rather than one over
  the middle of its span.

**And two decisions nobody has taken.** First, whether the creature half goes
at all: the entries say the body *moves* under the malfunction brush, which
would mean `installed: true` on both kinds, no palette brush, waves 57 and 58
placing the fault, and the fall and `limpetShakeMoves` written up under NOT
BUILT YET. Nothing here has done that, and the game still plays both waves the
old way — so the two arrivals coexist, which is a coherent state to stop in but
not the one the entry asks for.

~~Second, the entry's point 4 has no implementation as written.~~ **Answered,
and by another queue entry rather than by the owner.** *A shot never goes
through a body* landed on 15 September 2026 and both bodies bounce a bolt with
the magnet plate's own ricochet (`sim/bullet-refused.ts`), which is point 4
word for word. The confusion was geometry: a body **on the hull** cannot be
shot at, but a body **falling down its lane** can, and that is where a pair
tries it. Nothing is left to ask and nothing is left to build for that point.
