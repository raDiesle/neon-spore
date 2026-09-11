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

## The ghost slot: SWARM into the game, clearer eyes, the rest to the SHAPES page

- **Found:** 2026-09-10, hit-looks
- **Files:** `tools/versus/candidates/creature-ghost/`, `packages/render/src/ghost-look.ts`, `tools/director/src/{skins,glows,fillings}/`, `tools/versus/DECIDED.md`

The second of three tasks the owner handed one lane on 10 September 2026,
after the five creature slots that landed with it. His words: *"CREATURE:GHOST
· SWARM" use in the game. make the eyes of ghost more visible and clear for
player to see. the other "CREATURE:GHOST" alternatives you can add to "shapes"
page.* So: `bun run versus adopt creature:ghost swarm "…"` (by hand if its
field is inline), then the eyes — read `ghost-look.ts` and the swarm's paint
for what an eye is, and make it larger or brighter until it reads at 26 px,
which is a fix he asked for by name and lands straight on the field — then
the other ghost candidates re-authored on the SHAPES page in whichever axis
each one's claim belongs to (the five-slot landing's `DECIDED.md` entries say
how that was decided for a tail, a skin and a hit). Not started.

## The gyre slot: ORBIT into the game, the current interior and the rest to SHAPES

- **Found:** 2026-09-10, hit-looks
- **Files:** `tools/versus/candidates/creature-gyre/`, `packages/render/src/gyre-look.ts`, `tools/director/src/fillings/`, `tools/versus/DECIDED.md`

The third task of the same prompt. His words: *i like all versus of
"CREATURE:GYRE" and current in game. i suggest to use "CREATURE:GYRE · ORBIT"
in game, and keep current and alternatives in "shapes" page to create new
upcoming enemies with this inside effect.* So: adopt `orbit`, and put the
shipped gyre interior **and** every other gyre candidate on the SHAPES page —
he names them as an *inside* effect, which is the FILLING axis
(`tools/director/src/fillings/`, one pick, `shipped` on the one the game
draws), and says what they are for: interiors to build new creatures from.
Not started; comes after the ghost.
