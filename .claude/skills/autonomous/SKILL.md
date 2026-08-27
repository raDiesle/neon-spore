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

**Ownership is most of the safety mechanism, and it is not all of it.** Two
lanes may not own the same path, and `bun run burn` refuses to be quiet about
two that do. But disjoint ownership was never the same claim as disjoint work:
three lanes with perfectly separate files, all inside `packages/sim`, all add
a line to `config.ts`, `types.ts` and `hashWorld` — the files owned by nobody
precisely because everybody needs them. That is a rebase apiece, and the third
lane pays for the two before it. `bun run burn` warns about it as *crowded*,
which is a warning and not a refusal: two lanes in one package is often right
and the replay is cheap. Three is where it stops being cheap. Prefer a batch
that spans packages — one in `sim`, one in `render`, one in `tools` — over
three good lanes that happen to live together. The files everything wants —
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
- **after any amend, re-read the message and confirm the trailers are still
  in it** (`git log -1 --format=%B`). A lane reported two, amended during a
  rebase, and the trailers went with the amendment — the obligations vanished
  and were repeated to the user as though they were on the list;
- **a report of at most 250 words.** Everything else goes in the commit
  message, which is where a cold session will look for it anyway. A long
  report is read once by an orchestrator whose context is the scarcest thing
  in the run, and then it is gone; a commit message is in the clone forever;
- anything noticed and not done comes back in its **report**, not in
  `docs/parked.md` — that file is shared, and three lanes appending to the end
  of it is three rebase conflicts in the one file whose content nobody would
  think to check. The orchestrator files them, in one commit, after landing;
- **do not land, do not push, do not touch `main`** — the orchestrator lands;
- if it is blocked on a design decision, stop and say so rather than guess.

## 3. Land them, one at a time, in queue order

In the lane's worktree:

```bash
bun run land
```

If the check goes red on a file the lane never touched, with `Cannot find
module '@neon-spore/…'`, the workspace graph moved under it — a landed lane
added a dependency between packages. `bun install` in that worktree, then land
again. It reads like a rebase disaster and is thirteen milliseconds of work.

Replay onto `main`, `bun run check` on the result, fast-forward. It refuses
rather than merging. A rebase conflict comes back as a refusal with the files
named — send the lane's agent back to resolve it (`SendMessage`), do not
resolve it yourself in a worktree you do not own.

`bun run land` deletes the entry from `docs/queue.md` itself and commits that,
because the tick is the deletion and leaving it to whoever ran the landing
failed twice in one afternoon — the same way both times, and invisibly: a
landed branch stops sitting on the trunk's tip the moment anything else lands,
so it falls back to reading exactly like a branch nobody has started.

A lane whose `Check:` list is the interesting part gets said out loud in the
final report, not buried.

## 4. Go back to 0

Until the queue is empty or the budget is gone. Refill from `--candidates`
when it empties; keep a `/loop`-style wakeup only if the user asked for one.

## Choosing a model and an effort

Two dials, and they are not the same dial. **Model** is how good the writing
is. **Effort** is how long it thinks before writing. A cheap model thinking
hard and an expensive one answering off the top are different mistakes, and
the second is the one an unattended run makes, because nothing stops it.

**Neither dial is the main thing a lane costs.** That was measured, on the
first run this skill drove, and the numbers are in `docs/autonomous.md`: the
cheapest model ran the most expensive lane, because it touched twenty files
across three packages and then had to replay. Scope dominates tier, and a
crowded batch — two lanes sent back to rebase — cost more than every model
choice in the run put together. So the first question is never which model.
It is whether the lane is one thing.

The default is `sonnet` with a named subject to think about. `opus` is bought,
not defaulted to, and the thing it is bought with is the test below.

Effort is not a parameter on `Agent`. It is set by the words in the prompt —
`think`, `think hard`, `think harder`, `ultrathink` — which is a real ladder
and not a figure of speech. So every lane prompt carries a rung **and** a
subject: the rung buys the thinking, the subject decides whether it is spent
on the thing that is actually hard. "Think hard" alone buys depth on whatever
the model happened to find interesting.

| The work | Model | Effort | Spent on |
|---|---|---|---|
| A mechanic, a coupling, a boss's choreography — the answer is a judgement and the code is the easy half | `opus` | `ultrathink` | the shape, before a line is written |
| A system that restructures the loop — a round that is not the field, a new mode | `opus` | `think harder` | what it does to the world's idea of a round |
| A new creature or wave from a pattern `content/` already has | `sonnet` | `think hard` | the communication test, or the one-sentence test |
| Render against a written reference — a card, a background, a glyph | `sonnet` | `think` | how it reads at 26 px on a phone |
| Tests against a module that already exists | `sonnet` | none | — |
| A long mechanical file whose shape is decided; a uniform sweep | `haiku`, or `bun run delegate` | none | — |
| Reviewing a landed lane; judging whether two shapes read differently | `opus` | `think hard` | the case *against* the thing, first |

Three rules that override the table.

**The unpick test decides `opus`, and nothing else does.** Not how important
the lane feels. Ask what it costs to be wrong: a landing is cheap to redo, a
contour is cheap to redraw, and both are `sonnet` however much they matter. A
premise baked into `world.ts`, the hash, the protocol or the shape of a round
is expensive to unpick months later by somebody who no longer remembers it was
a choice. That is what the tier is for.

**Raise the effort before the model.** A rung of thinking is a fraction of the
price of a tier, and for the failure that actually happens — the hard part
went by without being looked at — it is the dial that works. `sonnet` told
what to think about beats `opus` told nothing.

**Drop both when the lane is transcription.** A spec that reads as long as its
code is a spec that should have been the code. That is the `delegate` case,
and `docs/delegation-cost.md` has the arithmetic on why it is rarely worth it.

The orchestrator is Opus, and thinks hard at exactly two moments: choosing
what goes in the queue, and deciding whether a returned lane is finished or
merely green. Everything between those is bookkeeping and wants no thinking
at all.

## When your own context fills

It will, and the answer is not to be careful. An orchestrator running a long
batch accumulates a lane report, a set of prompts and a diff review per lane,
and the first thing to go is not reasoning but *bookkeeping* — the small
mechanical step at the end of a landing. That is exactly what happened here
twice, and both times the board caught it rather than the session.

So: push the mechanical steps into the tools, keep the reports short, and
treat starting a fresh session as routine rather than as a failure. Nothing in
this arrangement lives in a transcript. `bun run burn` reconstructs the run
from `docs/queue.md` and git, `bun run checks` reconstructs what is owed, and
`docs/parked.md` holds what was noticed. A new session picks all three up
knowing nothing, which is the property the whole design is arranged around —
so the cheapest fix for a full context is to spend it and start again.

**Do not run two orchestrators at once.** Lanes parallelise; landing does not.
Two sessions landing onto one linear trunk is the one shape that turns a
rebase into a race.

## When the tokens run out

Expected, and nothing is lost. This has now happened for real, mid-batch, with
two lanes live: one had committed and was rebasing, the other had four
uncommitted files and was about to run its check. Both were resumable — the
board named the first as in flight with its worktree path, and `git status` in
the second's worktree found its work exactly where it left it.

The resume is `bun run burn`, and then a message to each live lane telling it
what moved while it was gone. Say `bun install` in that message: a lane coming
back after a long gap is the most likely thing in this arrangement to meet a
changed workspace graph, and the error it gets names a file it has never
opened.

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
