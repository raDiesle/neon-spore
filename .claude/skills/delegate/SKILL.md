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

`CLAUDE.md` and `docs/INDEX.md` already reach the worker as read-only context
(`read:` in `.aider.conf.yml`), so repeat only the invariants this particular
task could plausibly break.

## 2. Run it

Name every file it may edit. That list is the blast radius *and* the token
budget — aider reads what you name and nothing else.

```bash
aider --message-file .claude/tmp/spec.md packages/content/src/creatures.ts
```

Add `--read <path>` for a file it must see but must not change.

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

If it came back wrong twice, stop and do the task here. A third attempt costs
more in review than it saves in worker tokens.

## 4. Commit

Per `CLAUDE.md`: stage by path, one commit per coherent change. Aider does not
commit — `auto-commits: false` is deliberate, not an oversight.

## When the worker cannot run

If `aider` is not on PATH or `OPENROUTER_API_KEY` is unset, say so once and do
the task in this session. Do not install anything and do not fall back silently.
