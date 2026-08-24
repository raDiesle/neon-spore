---
name: delegate
description: Hand an implementation task to the cheap worker (aider + an open-weights model via OpenRouter) instead of typing it in this session. Use when a task is mechanical, its blast radius is a known list of files, and `bun run check` can decide whether the result is right.
---

# Delegating implementation

The orchestrator decides *what* and *where*; the worker types. The saving is
not the typing — it is the retries. Aider re-prompts the worker with the failure
output of `bun run check` until it is green, and none of that traffic reaches
this session.

## Delegate only when all three hold

1. **The blast radius is known.** You can name the files before starting.
2. **`bun run check` decides it.** If a green tree would not convince you the
   work is right, the worker has nothing to aim at.
3. **It is mechanical.** A creature entry, a wave, a parameter sweep, a rename,
   splitting a file that grew past 250 lines, a test that mirrors an existing one.

Do it here instead when the shape of the answer is the hard part: the
sim/render boundary, a new coupling, anything in `docs/spec/`, and anything
whose criterion is whether it feels right.

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
