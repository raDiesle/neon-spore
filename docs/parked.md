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

## THE HIVE has its simulation and no look yet

- **Found:** 2026-09-17, claude/shared-list-bosses-f7ff91
- **Files:** `packages/render/src/view-role-clocks-b.ts`, `packages/render/src/effects-boss.ts`, `packages/render/src/boss-draw-clocks.ts`, `packages/render/src/effects-ingest-silent-boss-b.ts`, `packages/render/src/effects-spark-silent-boss.ts`, `docs/spec/bosses.md`, `docs/spec/bosses-choreographed.md`

Lane one landed as `58e1e0b9` (THE HIVE, `docs/spec/bosses.md` §11.14,
wave 82 in `act-7e.ts`); the ledger row on `bosses-choreographed.md` says
**taken** with both lanes named. The session stopped before a line of the
look was written, so the second lane starts from `.claude/skills/new-boss`
step 5 — three new files in `packages/render/src`, a draw, a shape and an
fx page named for the hive, and one frame test beside them — with THE
SCUTTLE's files as the pattern (`scuttle-draw.ts`,
`scuttle-shape.ts`, `scuttle-fx.ts`, `scuttle-frame.test.ts`). What the sim
gives it: `HiveState` (`cols`, `colors`, `sealed`, `opened`, `openBeat`,
`spillBeat`, `downBeat`), `hiveBoss`, `hiveOpen`, `hiveNext`, `hiveTwins`,
`hiveNextBeat`, `hiveSwelling`, `hiveDown` and the nine `hive*` events, all
from `@neon-spore/sim`. The picture, decided: a mass over row 0 nearly the
width of the field with a site at `tileCX(l, col)` for every column in
`s.cols`, shut, open or sealed on both screens; an open breach in its colour
only where `showsHiveColor(role)` — the pilot, `role !== "p2"` — and grey
elsewhere; the swell on the next site, and on the one after it too once
`hiveTwins`, only where `showsHiveSwell(role)` — the navigator,
`role !== "p1"` — since the split is the encounter; the fade over
`hiveOutBeats` from `downBeat`. `HiveFx` is a field of `BossTransients`
walked by its four verbs; the hive rows leave the two silent lists' *reason*.
Then §11.14 gets *The look* and loses *What is not built*, one PNG goes to
the owner (`bun run frames . --wave "THE HIVE" --seat p1`), the commit says
"a look with no shipped alternative", `bun run land --keep`, and the ledger
row is marked **built** on `main` with the shas and what of the design is
not built.

## bosses.md is reordered; the other two boss pages and the director are not

- **Found:** 2026-09-17, claude/boss-docs-pages-3710e1
- **Taken:** 2026-09-17, claude/queue-bosses-md-is-reordered-the-other-two-boss-pages
- **Files:** `docs/spec/bosses.md`, `docs/spec/bosses-choreographed.md`,
  `docs/spec/transfers-bosses.md`, `docs/spec/README.md`, `docs/INDEX.md`,
  `docs/spec/transfers.md`, `tools/director/src/backlog.ts`,
  `tools/director/src/backlog-api.ts`, `tools/director/src/backlog-tabs.ts`,
  `tools/director/index.html`, `tools/director/test/backlog.test.ts`

The owner asked, on 17 September 2026, for three things at once, and the first
of them landed alone. **What is done:** `bosses.md` is cut and reordered — The
Mother (11.1) and The Vessel (11.2) are gone as boss ideas older than three
days; what was worth keeping out of them is the new `## Fixed and learnable`
section, which four files in `sim` and two in `docs/spec` now cite by name
instead of by number. The page carries a `## Contents` jump menu and three
groups — *Still to build*, *Built*, *Retired* — and the `11.n` numbers are
deliberately out of sequence down the page, on the owner's ruling, so that
every citation elsewhere in the tree still resolves. *Still to build* is empty:
THE HIVE landed while this lane ran, so every design on the page is now built
or retired, and what is left undone is inside the built sections.

**What is not done, in the order it should be picked up.**

1. **`bosses-choreographed.md` gets the same treatment**: a `## Contents` jump
   menu at the top, and its fifteen concepts ordered by state rather than by
   the number they were written at — §12 THE ANTIPHON and anything still
   *taken* first, the built ones after. Its `§n` numbers are cited by
   `tools/director/src/ship-notes-choreo.ts` and must not be renumbered, for
   the same reason `bosses.md`'s were not.
2. **`transfers-bosses.md` is deleted whole**, on the owner's answer of the
   same day: it is boss ideas from 27 August 2026, and two of its four
   concepts shipped as something else. Every link into it has to move first —
   `docs/INDEX.md`, `docs/spec/README.md`, `docs/spec/transfers.md`,
   `docs/spec/bosses.md` (THE DIASTOLE's paragraph), `docs/spec/bosses-
   choreographed.md` (four), `docs/decisions.md`, and eight comments in
   `packages/sim/src` and `packages/sim/test` that cite it as THE VANE's and
   THE CAIRN's design. THE VANE's and THE CAIRN's designs are the two worth
   rehoming rather than dropping: both are shipped bosses whose §11 section
   points at that page for the argument. `tools/shape-sheet` names it in three
   places too, and `tools/shape-sheet/test/collected.test.ts` holds the claims
   its drafts make about it.
3. **The director gets a BOSSES page on the `◇ NOT BUILT YET` sheet**, read off
   `bosses.md` and `bosses-choreographed.md` the way MECHANICS is read off
   `systems.md` and `ideas.md`. The tab came *off* the sheet on 16 September
   2026 and the comment saying so is in `tools/director/src/backlog.ts` — that
   comment is the thing to rewrite, not to work around. Three groups are worth
   drawing and the third is the one with the content: the unbuilt designs
   (THE HIVE alone, today); the choreographed concepts not yet taken; and
   **what is left on each built boss**, which is every §11 section's own
   *What is not built* paragraph, extracted the way `unbuiltRemainder` in
   `backlog.ts` already extracts `systems.md`'s. `backlog-api.ts` reads two
   spec files today and would read four. `isBuilt` in `backlog-api.ts` already
   answers the built question off `BOSS_KINDS`, which is the only honest
   source for it — do not keep a list.
