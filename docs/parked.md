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

## The boss spec pages are ordered by state; the director has no page reading them

- **Found:** 2026-09-17, claude/boss-pages-next
- **Files:** `tools/director/src/backlog.ts`, `tools/director/src/backlog-api.ts`,
  `tools/director/src/backlog-ideas.ts`, `tools/director/index.html`,
  `tools/director/test/backlog.test.ts`, `docs/spec/bosses.md`,
  `docs/spec/bosses-choreographed.md`

The owner asked on 17 September 2026 for a page of the two boss spec files on
the director's `◇ NOT BUILT YET` sheet, with a jump menu and the unimplemented
entries first. **Both spec files are done** — each opens with a `## Contents`
menu and is ordered *still in hand*, *built*, *retired*, with the `§` numbers
deliberately out of sequence so the thirty-odd citations elsewhere still
resolve. The third thing he asked for is not: **the director has no BOSSES
page**.

The tab came *off* the sheet on 16 September 2026 and the comment saying so is
in `tools/director/src/backlog.ts` — that comment is the thing to rewrite, not
to work around, because what it says is true of what the tab held then (an act
order and a list of boss ideas) and not of what this one would hold.

Three groups, and the third is the one with the content.

1. **Still in hand** — a boss whose simulation landed and whose look is not
   written. One today, THE HIVE, and it is not derivable from prose: the
   honest test is that the sim has the kind and `render/` draws nothing for
   it but the silent-event lists.
2. **Choreographed, not taken** — the rows of the ledger table at the top of
   `bosses-choreographed.md` that are neither built nor taken. None today.
3. **What is left on a built boss** — every `**What is not built**` paragraph
   inside a `## 11.n` section, which is where all the unbuilt work on both
   pages now lives. `unbuiltRemainder` in `backlog.ts` already extracts exactly
   this shape from `systems.md` and should be called rather than copied.

`backlog-api.ts` reads two spec files today and would read three. `isBuilt` in
`backlog-api.ts` answers the built question off `BOSS_KINDS`, which is the only
honest source for it — do not keep a list of names.
