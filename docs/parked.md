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
it is not parked work.

**It is not the backlog, and it must never grow into one.** What the game could
have and does not — a creature, a mechanic, a control, a weapon, a boss, a round
— belongs in `docs/spec/`, which is what the director's `◇ NOT BUILT YET` sheet
reads. That page is the owner's own working surface: he picks from it by hand,
in a session he opens, and nothing on it is waiting for an answer. An idea filed
here instead is filed away from the built things it would sit beside, on a page
nobody opens — which is what happened last time and why sixty-two entries had to
be deleted by hand.

The test, if an entry is borderline: **would a session need this to finish
something already started?** Yes, it belongs here. No — it is a thing the game
could be rather than a thing half-done — it belongs in the spec. A technical
improvement nobody has started belongs in `docs/queue.md`, which drains the
same way.

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

## The perf baseline covers 38 of the 45 waves the game ships

- **Found:** 2026-09-05, claude/game-performance-mobile-analysis-cd4207
- **Files:** `tools/perf/baseline.json`, `tools/perf/test/compare.test.ts`

The lane that built `bun run perf` was written when the game shipped 38 waves.
Seven have landed since — THE GYRE through THE STRAND — so
`compare.test.ts` fails on the count and the branch cannot land. It is rebased
onto `main` and green apart from this; `CLAUDE.md`'s new section is already
trimmed under its ceiling.

Re-measuring is one command, `bun run perf --save`, and it was tried three times
on 5 September 2026 with other sessions on the machine. Every run was refused by
the baseline's own test — no wave at or over three quarters of a frame when it
was taken — and **a different wave failed each time**: THE GHOST at 12.33 ms,
then THE MIRROR at 13.85, then THE GHOST again at 14.50. Nothing about the game
changed between them. The medians moved with the load too (THE GHOST 12.33 →
8.58 ms an hour apart), so on a loaded machine the 90th percentile is measuring
the other sessions rather than the frame.

The refusal is right — a baseline is a claim about the game, not about the
afternoon — but it means this cannot be finished opportunistically. Run
`bun run perf --save` with nothing else running at all, confirm
`tools/perf/test/compare.test.ts` is green on the result, and land the branch.
If a genuinely idle machine still trips it, the finding is about the rule rather
than the game: a p90 taken over a handful of frames may be too noisy a statistic
to gate a checked-in baseline on, and the test should say so in terms of the
median it also measures.

The branch is rebased onto `main` at `7ee0e68f` and clean; everything but this
one test is green, and `CLAUDE.md`'s new section is already trimmed under its
ceiling.

## Three lanes from 3–4 September no longer replay onto main

- **Found:** 2026-09-05, claude/git-flow-parallel-sessions-6f1b43
- **Files:** the three branches named below

Each carries one piece of finished work and six hundred commits of drift, and
each conflicts deeply enough that a rebase is a rewrite rather than a
resolution. The branches are kept; their worktrees are gone.

- `claude/awaiting-task-b79c6f` — sub-tick interpolation behind `?interpolate=1`.
  Conflicts in `apps/game/src/loop.ts`, `main.ts` and `test/loop.test.ts`.
- `claude/wisp-jump-preview` — the wisp says where it is going and jumps there.
  Conflicts across thirteen files in `sim` and `render`, THE WISP having been
  rewritten under it.
- `claude/control-button-visuals-suck-120e5e` — the panel says what it is for in
  pictures. Conflicts in six `render` files, the control panel having been
  redrawn since.

The two visual ones are looks, so what they carry is a decision the owner makes
by seeing it — the work is to rebuild each against current `main` and offer it
in `tools/versus/`, not to force the old diff through. The interpolation one is
ordinary work and can simply be redone.
