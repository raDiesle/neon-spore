---
name: autonomous
description: Run Neon Spore unattended for hours — pick the work, run two or three lanes in parallel worktrees, land each on main linearly, and resume from cold after a token window runs out. Use when the user says to spend remaining budget, work on their own judgement, keep going without them, or asks to continue an autonomous run.
---

# Running unattended

`docs/autonomous.md` is the reasoning. This is the loop.

You are the **orchestrator**. You pick work, spawn lanes, land them and pick
again. You do not write feature code yourself — a session that starts editing
`world.ts` stops being able to land anything, because it is now a lane that
owns the file every other lane needs.

## 0. Take the board before anything else

```bash
bun run burn
```

Empty queue → this is a fresh run, go to 1. Lanes on it → this is a **resumed**
run: something in flight is a branch with commits and a worktree still
standing. Finish those before opening anything new. `bun run burn --next`
prints the brief of the first unopened lane.

Never plan from memory. The board is derived from git and cannot be stale.

## 1. Fill the queue

```bash
bun run burn --candidates
```

Everything the design has agreed to and the game has not got, parsed out of
`docs/spec/` — creatures, mechanics, controls, bosses, interludes, parked.
Pick against what the user asked the run to buy, then write `docs/queue.md`:

```markdown
## THE BRIEFING BEFORE A WAVE
_claude/burn-briefings-a1 · packages/sim/src/briefing.ts packages/content/src/briefings.ts_

What it is, in two or three sentences. What finished looks like, concretely
enough that a session which has read only this and the spec can tell.
Which spec file to read first.
```

Ordered: the first thing in the file is the next thing done. Six to ten lanes
is a queue; thirty is a wish. Commit it before spawning anything — a plan that
exists only in the transcript is not a plan.

**Ownership is the whole safety mechanism.** Two lanes may not own the same
path, and `bun run burn` says so if they do. The files everything wants —
`config.ts`, `world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by
nobody: a lane may add to one in a single contiguous region and will replay
over somebody else's addition. A lane that would *restructure* one runs alone,
between batches.

## 2. Run a batch

Two or three lanes, never more. The limit is the landing, not the machine:
`main` is linear, so lane four rebases over the three before it.

Each lane is one `Agent` call with `isolation: "worktree"`, spawned in the
background, all of a batch in **one message** so they run at once. The prompt
must carry, every time:

- the brief, verbatim from the queue;
- the paths it owns, and that it may touch nothing else;
- **`bun install` first** — a fresh worktree has no `node_modules`, and the
  main tree's must never be copied or linked in (its workspace links point at
  the main tree by absolute path, so a test there runs against someone else's
  code);
- read `CLAUDE.md` and the one or two spec files the brief names;
- `bun run check` green, then commit, staging **only its own paths**;
- a `Check:` trailer for anything only an eye can settle — a wave at tempo, a
  silhouette at 26 px, a colour against the field;
- anything noticed and not done goes to `docs/parked.md` in the same commit;
- **do not land, do not push, do not touch `main`** — the orchestrator lands;
- if it is blocked on a design decision, stop and say so rather than guess.

## 3. Land them, one at a time, in queue order

In the lane's worktree:

```bash
bun run land
```

Replay onto `main`, `bun run check` on the result, fast-forward. It refuses
rather than merging. A rebase conflict comes back as a refusal with the files
named — send the lane's agent back to resolve it (`SendMessage`), do not
resolve it yourself in a worktree you do not own.

Then delete the entry from `docs/queue.md` and commit that. The tick is the
deletion; there is no other one.

A lane whose `Check:` list is the interesting part gets said out loud in the
final report, not buried.

## 4. Go back to 0

Until the queue is empty or the budget is gone. Refill from `--candidates`
when it empties; keep a `/loop`-style wakeup only if the user asked for one.

## Choosing a model and a thinking depth

Decide per lane, and say in the report which you chose. The default is Sonnet;
Opus is for work where the *shape* is the hard part, not the typing.

| The work | Model | Told to think |
|---|---|---|
| Designing a mechanic, a coupling, a boss's choreography — where the answer is a judgement | `opus` | "think hard about the shape before writing anything" |
| A new creature or wave from a pattern that already exists in `content/` | `sonnet` | "think about the one-sentence test first" |
| Render work against a written reference — a card, a background, a glyph | `sonnet` | "think about how it reads at 26 px" |
| A long mechanical file whose shape is decided; a uniform sweep | `haiku`, or `bun run delegate` | nothing |
| Tests against a module that already exists | `sonnet` | nothing |
| Reviewing a landed lane, or judging whether two shapes read differently | `opus` | "think hard" |

The orchestrator is Opus. Effort is not a parameter on `Agent`, so the depth
is carried in the prompt — say what to think about, not "think harder".

## When the tokens run out

Expected, and nothing is lost: the queue is on `main` and every lane's state
is its branch. If the window ends mid-batch, the lanes' worktrees stay where
they are and the next session's `bun run burn` shows them in flight.

To come back automatically rather than waiting for the user, schedule a
wakeup at the reset (`ScheduleWakeup`, or a scheduled task for a longer gap)
whose prompt is `/autonomous`. A wakeup that fires while still over the limit
costs nothing and the next one picks up. Do **not** poll every minute.

## What this mode may not do

- **Decide that something was looked at.** No session can watch a wave at
  tempo. That is a `Check:` trailer, every time.
- **Go quiet on a question.** A blocked lane stops and says so; the run moves
  on to the next one rather than building on a guess.
- **Land red.** `bun run land` runs `bun run check` after the replay for
  exactly this reason. Never talk it out of a refusal.
- **Push.** Not on this machine, not without being asked.

## The closing report

`bun run handoff` for the four-line block, then, above it and short:

- what landed, one line each;
- what is still in flight and where its worktree is;
- **what to open first** — the checks worth a person's eye, named, in order;
- any question a lane stopped on.
