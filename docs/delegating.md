# Handing implementation to a cheaper model

`docs/token-budget.md` says: plan with a large model, execute with a fast one.
This is the machinery for the second half. A large model orchestrates in
Claude Code; a second process — `aider` driving DeepSeek — does the editing and
absorbs the failed attempts.

## Why two processes and not a proxy

There are routers that make Claude Code itself speak to another provider. Two
reasons this repo does not use one. A proxy sees every prompt and every line of
the code. And the translation between the Anthropic tool format and everyone
else's is where agents break quietly: the model keeps talking and stops editing
files, which is the one failure mode that looks like success.

Two processes have neither problem. The orchestrator stays on the API it was
built for; the worker is a normal CLI invoked from a normal shell command, and
its output is a diff that either passes `bun run check` or does not.

## Why it works here at all

Delegation needs a contract the worker can check itself against, and this repo
has one command that is the whole contract: `bun run check` — typecheck, Biome,
the purity scan, the determinism replay. The same property that makes the
project testable by an agent at all (`docs/working-with-claude.md`) is what
makes it delegable.

Where the contract runs out, delegation runs out with it. Nobody hands "make
the bubble read as a blob" to a cheap model. But `bun run shapes:report` prints
geometry as numbers, so even shape work has a checkable channel: the
orchestrator picks the target numbers, the worker moves parameters until the
report matches, and a person looks only at the cases where the numbers agree
and it still looks wrong.

## The worker model

`deepseek-chat` (V3), not `deepseek-reasoner` (R1). R1 is a reasoner: long
thinking traces, slow, and comparatively weak at the many-turn edit loop this
is. Keep R1 for a single hard algorithmic question asked once, not for typing.

The slot is one line in `.aider.conf.yml`, so Qwen3-Coder, GLM or Kimi via
OpenRouter are a config change and not a migration.

## What is set up

| File | Does |
|---|---|
| `.aider.conf.yml` | worker model, the `bun run check` retry loop, committing off |
| `.claude/skills/delegate` | the procedure: spec, file list, review, commit |

Requires `aider` on PATH and `DEEPSEEK_API_KEY` in the environment. Without
either, the skill says so and the session does the work itself.

## The habit that actually saves tokens

Delegate the loop, not the keystrokes. A task handed over as "here is the file
list, here is the goal, `bun run check` is the judge" moves every failed
attempt onto the cheap model. A task handed over one edit at a time, reviewed
after each, costs more than doing it directly — the orchestrator pays twice,
once to explain and once to read.
