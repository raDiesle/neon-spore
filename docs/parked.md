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

## Four of the six hooks are still bash

- **Found:** 2026-09-03, claude/task-queue-work-e618bf
- **Files:** `.claude/hooks/format-edited.sh`, `.claude/hooks/after-sim-edit.sh`, `.claude/hooks/check-on-stop.sh`, `.claude/hooks/auto-land.sh`, `.claude/settings.json`, `tools/hooks/`

The two `PreToolUse` guards moved to `tools/hooks/guard.ts` and are now a table
of rules over arguments, with a test that spawns `bun` rather than `bash`. The
other four did not move: `settings.json` still invokes each as
`bash .claude/hooks/x.sh`, so a session whose shell has no `bash` on PATH
silently gets no formatting after an edit, no typecheck on stop and no automatic
landing. The failure is that nothing happens, which is the hardest kind to
notice, and it is the same PowerShell gap the guards were moved to close.

`format-edited.sh` and `after-sim-edit.sh` are a few lines each and are the
place to start; `check-on-stop.sh` and `auto-land.sh` are longer and both shell
out to `bun run` anyway. The pattern to follow is `guard.ts`: payload in on
stdin, parsed once with `JSON.parse`, the decision a pure exported function the
test calls directly, and only a thin `import.meta.main` block touching the
process. Point `settings.json` at `bun tools/hooks/<name>.ts` as each one moves.

