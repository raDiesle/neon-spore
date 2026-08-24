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

`z-ai/glm-5.2` through OpenRouter. Chosen on hit rate rather than on token
price, and the arithmetic is why. One delegated task costs the orchestrating
session roughly eight cents to specify, review and commit. The entire spread
between the cheapest worker on the market and this one is about the same eight
cents. So the second attempt is the expensive event, not the model: anything
that raises the chance of landing it first time pays for itself several times
over, and picking a worker to save a cent per task optimises the wrong term.

`qwen/qwen3-coder-next` sits commented above it for a task trivial enough that
the swap is worth the keystroke. It is roughly seven times cheaper per edit and
measurably competent at small surgical ones.

The rankings underneath this move every few months and any claim about which
model is *better* is stale before it is committed. What does not move is the
method — the slot is one line, so two candidates can be run against the same
spec and judged on the diff that comes back. Prefer that over anyone's
benchmark, this file included.

Not a reasoning-only model asked to type. Reserve those for a hard algorithmic
question asked once. GLM reasons and edits in the same turn, which is a
different thing, and its thinking tokens are billed as output — the reason its
per-task cost sits above what its input rate suggests.

Never an Anthropic model through OpenRouter, and this one is enforced by
`.claude/hooks/worker-model-guard.sh` because it already happened: a session
whose worker had missed put `--model openrouter/anthropic/claude-sonnet-4.5` on
the command line and escalated that way twenty-five times. A command-line
`--model` overrides the config file and every provider rule in it, so prose
could not have stopped it and neither could the model settings. Those are paid for on a separate
account that the Claude app is configured against, and routing them through
here would bill the same work twice over on the wrong ledger. The worker slot
is for open weights only, and `provider.ignore` in the model settings holds
that line even if the model line is changed carelessly.

OpenRouter rather than an account per provider, because the point of a one-line
model slot is defeated if changing it means a new key and a new prepaid
balance. The credit fee buys the A/B above, plus fallback when a provider is
down mid-loop.

`edit-format: diff` is pinned. Aider negotiates the format per model and will
choose `whole` for some of them, which regenerates entire files — against the
house rule, and it prices output by the length of the file instead of by the
size of the change.

## The failure that costs money

The first real delegation failed, and it is worth writing down because the
shape of it is not obvious. The worker did not produce wrong code. It produced
*nothing*: it got stuck deliberating one ambiguous sentence in the spec, began
repeating the same clause, and kept going until it hit the model's context
limit — 65,000 output tokens spent on a file that stayed empty, at several
times what the task would have cost to type.

Two things came out of it, both in the config now.

A **cap on one reply** (`max_tokens` in `.aider.model.settings.yml`). A loop
that would have run to the context ceiling now dies in seconds and costs cents.
The cap does not prevent the loop; it makes the loop cheap and visible, which
is all a guard has to do.

And a rule about specs: **anywhere the worker has to decide what you meant, it
may instead decide nothing at all.** The sentence that hung it was a rule about
when an entry should be removed from a table, written as prose alongside an
instruction not to add extra checks — the two could be read as contradicting
each other. Rewritten as three numbered assertions with "do not add a fourth",
there was nothing left to deliberate. Prefer enumeration over description
wherever a spec touches behaviour.

## Three more, and what was tried

The guards for these live in the delegate skill and in `tools/delegate/`, so
what is worth recording here is the part a guard cannot carry: what was tried
and did not work. A failure with no record of its dead ends gets its dead ends
retried.

The run that reports success and changes nothing. Aider scans the message and
the files already in the chat for anything that looks like a repository path,
and offers to add each one. `yes-always: true` accepts, and the reply that
should have carried the edit is spent on that exchange instead. The worker then
reports the work done and `git diff` is empty. Tried and useless, all three:
rewording the spec, because the mentions come out of the files rather than the
message, so a document citing three source paths re-triggers it on every
attempt; `--no-detect-urls`, which is about URLs and not files; and escalating
the model, because it is not a model mistake and the better model fails in
exactly the same way. What works is leaving it nothing to ask for, which is
what `bun run delegate` does by handing every mentioned path over read-only
before it starts.

A spec that asserts something false about the repository. Not a worker failure.
A spec claimed Biome wraps an array of object literals once the line passes a
width. The real rule is that it wraps once the array has more than one element.
The worker spent an entire reply deriving the true rule empirically against the
stated false one, and hit its output ceiling without finishing. The lesson is
about what a spec asserts rather than how long it is. A claim about this
repository that the worker can check, it will check, and it will spend the
reply doing so. State only what is known; where a rule is uncertain, name a
file that demonstrates it and let the worker read it instead.

The worker fixing another session's failures. `bun run check` is the right
default for `test-cmd` and the wrong one when another session has uncommitted
work in the tree. The worker sees their lint failures, takes them for its own,
and edits files outside its whitelist to fix them. Pass a scoped test command
instead, naming only the package the task touches — for a task under
`tools/director`, a typecheck plus Biome and the tests for that directory
alone.

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
