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

## Living bosses — THE INSTAR's one head, modelled once, as a VERSUS candidate

- **Found:** 2026-09-27, claude/queue-living-bosses-the-instars-one-head-modelled-once
- **Where:** local
- **Files:** `packages/render/src/instar-rig-head.ts`, `packages/render/src/instar-rig-head-draw.ts`, `packages/render/src/instar-front.ts`, `packages/render/src/instar-profile.ts`, `tools/versus/candidates/registry.ts`, `packages/render/test/instar-budget.test.ts`

Half **(A)** has landed: the model (`instar-rig-head.ts`, the parts;
`instar-rig-head-draw.ts`, the eyes, nostrils and throat as `mark` parts of
the rig, drawn in its painter's order), `bun run solid --instar` for its
sheet at five yaws beside the shipped face-on head, jaw shut and open, and
`packages/render/test/instar-rig-head.test.ts` — face-on its eyes and both
lips are within 2 px of the shipped head's at 390 wide, side-on it shows one
full eye, a blunt muzzle and horns swept back. The sheet went to the owner.

Half **(B)** is what is left: a patchable record the draw path reads the
head through — VERSUS patches records, and today `drawFrontHead`
(`instar-front.ts`, through `drawTurnedHead`) and `drawSideHead`
(`instar-profile.ts`) are called directly — so the candidate can swap both
for `drawRigHead` at the yaw the turn is at (`FRONT` face-on, `SIDE` in
profile, `instarTurn(f.side)` between); the candidate in
`tools/versus/candidates/`, never on the field; and a row in
`instar-budget.test.ts` holding the candidate's op count within 10% of the
shipped head's. The rig head draws no hide scales, drips or sinews yet; a
look lane may add them once the owner has seen it on VERSUS.
