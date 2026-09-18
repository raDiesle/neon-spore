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

## The BOSSES category owes the field and clock states a hand brings on

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Taken:** 2026-09-18, claude/queue-the-bosses-category-owes-the-field-and-clock-sta
- **Files:** `tools/director/src/poses-bosses-kit.ts`, `tools/director/src/boss-hands-field.ts`, `tools/director/src/boss-hands-clocks.ts`, `tools/director/test/boss-states.test.ts`

The STATES sheet's BOSSES category (the owner, 18 September 2026: every
boss's states, documented, kept in step with the bosses) landed with every
state that arrives on its own, then the states a shot or a beat earns on THE
WARDEN, THE VANE, THE ORRERY, THE CANDLE, THE DIASTOLE, THE BATON and THE
THROAT, then — this entry's second part — the field and clock bosses' with a
cannon, a thumb and one grip: THE FLEET, THE GORGE, THE CURTAIN, THE
SCUTTLE, THE HIVE's spill, THE TASTER, THE LEDGER and THE LEAD, each a
`Hand` — a function of the world called every tick, its presses sent on that
tick (`poses-bosses-kit.ts` `runHand`) — in `boss-hands-field.ts` and
`boss-hands-clocks.ts`, posed in `poses-bosses-hands-field.ts` and
`poses-bosses-hands-clocks.ts`. What is left, and `OWED` in
`test/boss-states.test.ts` is the exact list: the drag and hold bosses —
cairn leaving and settled, splice passed and verdict, reprise echoing and
held, undertow taken, sinew held/swinging/falling/out, surge
band/sealing/everting/out, antiphon still and down, instar land and down —
and THE HIVE's `down`, which no hand can bring on until the queue's HIVE
item is answered (a breach that has spilled once cannot be sealed). Each of
the rest is one `bossPose(kind, state, note, { hand, want, budgetBeats })` in
a new `poses-bosses-hands-*.ts`, its hand in a new `boss-hands-*.ts` — the
drags and holds the boss's own `sim/test/<boss>.test.ts` sends are the
script to read — and the state struck from `OWED` in the same commit; the
test refuses an allowance a pose already spends. What the hands so far
learned: a hand is called with the world *before* the step, so a press
answering a beat's move goes the tick after the beat, once the cannon has
stepped (`leadHand`); a step of the cannon spills a fill, so the cannon goes
to its column before the thumb goes down; a state the straight fight ends
before it shows is posed by a hand that plays it late or leaves something
alone (`leadHandLate`, `curtainHandWith(false)`).

## The BOSSES category owes the rounds' played states

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `tools/director/src/poses-bosses-rounds.ts`, `tools/director/test/boss-states.test.ts`

The other half of the same allowance, the rounds: THE MAZE's `travel` (the
route drawn and the pair moving along it) and THE GAUGE's `verdict` and
`spent` (a needle answered), which never arrive unattended — the round waits
for the pair. Same shape as the entry above: one `bossPose` each with the
round's commands (`sim/test/maze-round.test.ts` and `gauge.test.ts` send them), struck
from `OWED` in the same commit.
