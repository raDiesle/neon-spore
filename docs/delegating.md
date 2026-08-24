# Handing implementation to a cheaper model

`docs/token-budget.md` says: plan with a large model, execute with a fast one.
This is the machinery for the second half. A large model orchestrates in
Claude Code; a second process — `aider` driving an open-weights model — does the editing and
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

`qwen/qwen3-coder-next` by default, `z-ai/glm-5.2` when the default has missed
twice. Cheap-first with an escalation, rather than one middling model for
everything: the input price between the two differs by about eightfold, and
most delegable work here is mechanical enough that the cheap one finishes it.
Arguing with a model that has already missed twice costs more in review than
the escalation costs in tokens.

The rankings underneath this move every few months and any claim about which
model is *better* is stale before it is committed. What does not move is the
method — both are one line in `.aider.conf.yml`, so the two of them can be run
against the same spec and judged on the diff that comes back. Prefer that over
anyone's benchmark, this file included.

Not a reasoning model. They emit long thinking traces, are slow, and are
comparatively weak at a many-turn edit loop. Ask one a hard algorithmic
question once; do not put one behind the typing.

OpenRouter rather than an account per provider, because the point of a one-line
model slot is defeated if changing it means a new key and a new prepaid
balance. The credit fee buys the A/B above, plus fallback when a provider is
down mid-loop.

`edit-format: diff` is pinned. Aider negotiates the format per model and will
choose `whole` for some of them, which regenerates entire files — against the
house rule, and it prices output by the length of the file instead of by the
size of the change.

## What is set up

| File | Does |
|---|---|
| `.aider.conf.yml` | worker model, the `bun run check` retry loop, committing off |
| `.claude/skills/delegate` | the procedure: spec, file list, review, commit |

Requires `aider` on PATH and `OPENROUTER_API_KEY` in the environment. Without
either, the skill says so and the session does the work itself.

## The habit that actually saves tokens

Delegate the loop, not the keystrokes. A task handed over as "here is the file
list, here is the goal, `bun run check` is the judge" moves every failed
attempt onto the cheap model. A task handed over one edit at a time, reviewed
after each, costs more than doing it directly — the orchestrator pays twice,
once to explain and once to read.
