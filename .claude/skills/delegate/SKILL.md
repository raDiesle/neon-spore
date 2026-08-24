---
name: delegate
description: Hand implementation to the worker model (aider + GLM via OpenRouter) instead of typing it in this session. Implementation is delegated by default, so reach for this whenever code is about to be written — not only when the task looks mechanical. It carries the spec format, the file whitelist, the review pass and the commit rules.
---

# Delegating implementation

The orchestrator decides *what* and *where*; the worker types. The saving is
not the typing — it is the retries. Aider re-prompts the worker with the failure
output of `bun run check` until it is green, and none of that traffic reaches
this session.

## Everything that gets written, gets delegated

Not "is this mechanical enough" — that question invites an exception every
time, and an exception is what it always gets. The line is simpler: **the
session decides, the worker writes.**

Deciding is not a lesser job, and it does not go anywhere. The interface, the
constraint, the shape of the answer, which of two variants reads better, what
is worth building at all — that is the work, and no spec can carry it. But none
of it is code. The moment something is to be *written*, it goes over, however
small.

### Not reasons to keep it

- **"It needed a constraint kept in mind."** A constraint you can write down is
  not judgement, it is a line in the spec. Write it there.
- **"It touches a coupling."** Naming the coupling in the spec is cheaper than
  implementing around it.
- **"It is only a few lines."** Then the spec is only a few lines too.
- **"Its criterion is whether it feels right."** Judging the result is yours.
  Typing the parameter that produces it is not. Name the values, have the
  variants produced, then look.
- **"Faster to do myself."** Measured against your own tokens, rarely true;
  measured against the retry loop, never.

### The two that are real

- **The worker cannot run** — `aider` not on PATH, or `OPENROUTER_API_KEY`
  unset. Say so once and do the task here. Do not install anything.
- **It has missed twice on this task.** Escalate the model once; if that misses
  too, take it back. A third attempt costs more in review than it saves.

Neither is assumed. Say in the final report whether the work was delegated, and
if it was not, which of these two applied.

### Which invariants the gate actually holds

`bun run check` enforces purity and determinism **in `sim` and `content` only**
— `packages/sim/test/purity.test.ts` scans those two. Work in `apps/game`,
`packages/render` or `tools/` is not covered by it, so a wall-clock call or a
stray `Math.random` there comes back green. That is not a reason to withhold
the task; it is a reason to put the constraint in the spec **and** to look for
it by name in the diff.

## 0. Cut the task to one change

The failure that shows up in every report on these agents is the same: a task
big enough that the model pushes deep into its own context, loses the decisions
it made early, and returns something partial but confident. It does not
announce itself — the diff looks finished.

So one delegation is **one coherent change**. Two distinct behaviours, or more
than about three files, is two delegations run in sequence, each reviewed
before the next is written. The worker is cheap; a second pass costs almost
nothing next to reviewing a tangle.

Then check the ground before handing over:

```bash
git status --short <every file in your whitelist>
```

A file another session has already modified makes the returned diff unreadable
— you cannot tell the worker's work from theirs. Reorder: delegate a part that
touches clean files first, and come back to the rest. Neither this check nor
the one-change rule is a reason to keep work; both are about **sequencing** the
handover, never about cancelling it. Splitting a task means two delegations,
not one delegation and one thing you typed yourself.

## 1. Write the spec

`.claude/tmp/spec.md`. Keep it short — it is read by a model with less patience
than you have.

```markdown
# Goal
One sentence. What the finished thing does.

# Files you may edit
- packages/content/src/creatures.ts

# Invariants
- packages/sim never imports packages/render
- no Math.random, Date.now, performance.now, window or document in sim or content
- the sim stores integers; sub-tile values in thousandths
- tunable numbers are named fields in SimConfig, never literals
- files stay under ~250 lines

# Done when
`bun run check` passes and <the specific observable thing>.

# Do not
Touch any file not listed above. Do not commit.
```

**Give it a test to aim at wherever one is possible.** The scoped, test-backed
change is the case these agents demonstrably handle — a refactor, a targeted
migration, a small interface change, each with a focused test. Prose acceptance
("the cannon should slide") leaves the worker guessing what done means;
"`bun test packages/sim` passes, including a new case asserting X" does not. In
`sim` and `content` a test is nearly always possible, and writing it is part of
the delegated work, not preparation for it.

`CONVENTIONS.md` already reaches the worker as read-only context
(`read:` in `.aider.conf.yml`), so repeat only the invariants this particular
task could plausibly break.

## 2. Run it

Name every file it may edit. That list is the blast radius *and* the token
budget — aider reads what you name and nothing else.

```bash
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 aider --message-file .claude/tmp/spec.md packages/content/src/creatures.ts
```

The two env vars are a no-op on macOS and Linux, which default to UTF-8
already, and load-bearing on Windows: aider's console there defaults to
cp1252, and a spec containing a character outside it — an em dash, an
arrow, `⏸` — crashes the run *after* the edit has already been applied,
and has been seen silently flattening such characters in the code it writes
instead of erroring. Always pass them; do not make it conditional on the
platform this session happens to be running on.

Add `--read <path>` for a file it must see but must not change — an existing
file in the same style is worth more than a paragraph describing the style.

Give the call a wall-clock ceiling and expect minutes, not seconds: a reasoning
worker plus `bun run check` after every edit runs long, and aider buffers its
output, so a run in progress looks identical to a hung one. Name the target
file in the command even when it does not exist yet — aider creates it empty at
the start, which is the earliest sign the run is alive.

## 3. Take it back

```bash
bun run check
git diff --stat
```

Then review `git diff` — the diff, not the reopened files. You are looking for
what a test cannot see: an invented synonym for hull, lobe, beat or guard; a
literal that belongs in `SimConfig`; a file pushed past 250 lines; a comment
addressed to a reader who does not exist; a wave that fails the one-sentence
test.

The edit hooks in `.claude/hooks/` do **not** fire for the worker's writes —
they are bound to this session's `Edit`/`Write`. What replaces them lives in
`.aider.conf.yml`: `lint-cmd` runs Biome over each edited file and `test-cmd`
runs `bun run check` after every edit. Re-run the check yourself anyway — the
worker's last edit can land after its final test.

**Read the three report lines before the diff.** *Changed* tells you where to
look. *Not done* is the one that matters — an agent that signals completion
with items outstanding is the second failure mode these tools are known for,
and the line exists to make it say so out loud. *Unsure* points at the guesses
a green test does not catch: a name, a magic number, a convention it could not
tell how to apply.

Then walk the spec's Goal against the diff, bullet by bullet. Something absent
from both the diff and the *Not done* line is the case to look for hardest.

If it came back wrong twice, stop. Escalate the model once by swapping the
line in `.aider.conf.yml`; if that misses too, do the task here. And if the
worker reports the same test failing over and over, do not re-run the same
spec — that is a doom loop, and it will spend the whole budget repeating
itself. Change what the spec asks for, or take it back.

## 4. Commit

Per `CLAUDE.md`: stage by path, one commit per coherent change. Aider does not
commit — `auto-commits: false` is deliberate, not an oversight.

## When the worker cannot run

If `aider` is not on PATH or `OPENROUTER_API_KEY` is unset, say so once and do
the task in this session. Do not install anything and do not fall back silently.
