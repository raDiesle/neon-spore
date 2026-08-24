---
name: delegate
description: Hand implementation to the worker model (aider + GLM via OpenRouter) instead of typing it in this session. Implementation is delegated by default, so reach for this whenever code is about to be written — not only when the task looks mechanical. It carries the spec format, the file whitelist, the review pass and the commit rules.
---

# Delegating implementation

The orchestrator decides *what* and *where*; the worker types. The saving is
not the typing — it is the retries. Aider re-prompts the worker with the failure
output of `bun run check` until it is green, and none of that traffic reaches
this session.

## Delegation is the default

Implementation is handed over unless there is a stated reason not to. The
question is never "is this mechanical enough" — almost nothing is purely
mechanical, and waiting for a task that is costs more than the setup saves.
The question is: **what has to be decided here, and what is typing once it is
decided?** Decide the first part, delegate the second.

That split is usually small and lopsided. "`bindControls` returns a `tick()`
the loop calls each tick, repeat after 24 ticks then every 8, drive it off the
tick counter and never off wall-clock time" is the judgement — two minutes.
The eighty lines that follow from it are typing, and typing is what the worker
is for.

### Not reasons to keep it

- **"It needed a constraint kept in mind."** A constraint you can write down is
  not judgement, it is a line in the spec. Write it there.
- **"It touches a coupling."** Naming the coupling in the spec is cheaper than
  implementing around it.
- **"It is only a few lines."** Then the spec is only a few lines too.
- **"Faster to do myself."** Measured against your own tokens, rarely true;
  measured against the retry loop, never.

### Actual reasons to keep it

- The criterion is whether it **feels right** — game feel, glow, timing as an
  experience, a silhouette. No spec can carry that.
- It **decides something** rather than implements it: a design rule, a change
  to `docs/spec/`, a new coupling, the shape of the sim/render boundary.
- You cannot name the files yet, because finding them *is* the task.
- The spec would have to be longer than the change. Rare, and it means you have
  not finished deciding.

### Which invariants the gate actually holds

`bun run check` enforces purity and determinism **in `sim` and `content` only**
— `packages/sim/test/purity.test.ts` scans those two. Work in `apps/game`,
`packages/render` or `tools/` is not covered by it, so a wall-clock call or a
stray `Math.random` there comes back green. That is not a reason to withhold
the task; it is a reason to put the constraint in the spec **and** to look for
it by name in the diff.

Say in the final report whether the work was delegated, and if it was not, why.

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
bun run format
bun run check
git diff --stat
```

Then review `git diff` — the diff, not the reopened files. You are looking for
what a test cannot see: an invented synonym for hull, lobe, beat or guard; a
literal that belongs in `SimConfig`; a file pushed past 250 lines; a comment
addressed to a reader who does not exist; a wave that fails the one-sentence
test.

The edit hooks in `.claude/hooks/` do **not** fire for the worker's writes —
they are bound to this session's `Edit`/`Write`. `bun run format` and
`bun run check` in step 3 are what replaces them. Do not skip them.

If it came back wrong twice, stop and do the task here. A third attempt costs
more in review than it saves in worker tokens.

## 4. Commit

Per `CLAUDE.md`: stage by path, one commit per coherent change. Aider does not
commit — `auto-commits: false` is deliberate, not an oversight.

## When the worker cannot run

If `aider` is not on PATH or `OPENROUTER_API_KEY` is unset, say so once and do
the task in this session. Do not install anything and do not fall back silently.
