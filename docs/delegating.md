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

`z-ai/glm-4.6` through OpenRouter. Second choice when it comes back wrong:
`qwen/qwen3-coder`. Qwen is the stronger one-shot generator, GLM the stronger
agent — better at holding a constraint across many turns and at correcting
itself from test output without drifting. This loop is not one-shot generation,
so the agentic half is what is being bought.

Not a reasoning model. R1 and its kind emit long thinking traces, are slow, and
are comparatively weak at a many-turn edit loop. Ask one a hard algorithmic
question once; do not put one behind the typing.

OpenRouter rather than an account per provider, because the point of a
one-line model slot is defeated if changing it means a new key and a new
prepaid balance. The 5% credit fee buys the ability to A/B two workers on the
same spec for pennies, plus fallback when a provider is down mid-loop.

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
