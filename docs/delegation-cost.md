# What delegation cost, measured

`docs/delegating.md` argues that handing implementation to a cheap model moves
the retries onto cheap tokens. On 25 August 2026 that argument was measured
instead of assumed: one boss, designed once, implemented twice from the same
written spec — once delegated, once written in the orchestrating session.

Both implementations ship. They are the waves `BULB QUEEN A` and
`BULB QUEEN B`, and over forty beats in the built game they behave identically.

## The result

| | Run A — delegated | Run B — written in session |
|---|---|---|
| Total cost | **$10.98** | **$1.61** |
| — orchestrator (Opus 5) | $10.04 | $1.61 |
| — worker (GLM 5.2 / Kimi via OpenRouter) | $0.94 | — |
| Claude API requests | 47 | 8 |
| Active minutes | 18.6 | 3.9 |
| Output tokens on Claude | 28,784 | 8,993 |
| Lines delivered | 314 | 323 |

**Delegating cost 6.8 times as much for the same deliverable**, and the extra
was not the worker — it was the orchestrator. The worker's whole share of the
delegated run was 8.5%.

## Why: cost is round trips, not tokens written

Cost per Claude request was effectively identical in both runs — **$0.214
delegated against $0.202 in session**. Nothing about delegation made a request
cheaper. It needed 5.9 times as many of them.

The reason a request costs what it does is cached input, not output. Every
request re-reads the whole conversation: cached input read was 64% of Run A's
bill — 12.89M tokens at $0.50/M — against $0.72 of actual output. So

    cost ≈ (number of round trips) × (how long the conversation has got)

and a delegated task is structurally at least three round trips — write the
spec, run it and read the result, review the diff — where writing the code is
one. When a run fails, it is five or six.

The retries did move onto cheap tokens, exactly as intended. **The retries were
never the expensive part.** Specifying and reviewing were, and neither can
move: the session is the only party holding the decisions.

Even a flawless delegate loses on a task this size. Four clean delegations at
three round trips each is twelve requests against Run B's eight — roughly
1.6 times the cost with nothing going wrong. That is an estimate, unlike every
other figure here.

## What did not go wrong: context

The failures in this exercise were reply-length failures, never context
failures, and the distinction matters because they are fixed differently.

Across 32 delegated runs with token data, the **largest input sent to the
worker was 26,000 tokens**, mean 12,900, against a context window of 262,144
(Kimi) or 1,048,576 (GLM). Peak use was 2.5% of the smaller window. Retries
stayed inside four turns, because aider stops at three reflections.

What stopped ten runs mid-edit was `max_tokens: 8192` in
`.aider.model.settings.yml` — this repo's own guard against a doom loop. GLM
bills its reasoning as output, so on a task needing real deliberation it spends
seven or eight thousand tokens thinking before the first edit block and the
reply ends mid-sentence. Aider then prints `Output tokens: ~8,220 of
1,048,576`, which reads like a context error and is not: it shows the context
window rather than the cap that actually stopped it.

Anything proposing to fix "the context problem" here is answering a question
the numbers do not ask.

## The other outcomes

Of 42 delegated runs across the whole exercise:

| Outcome | Runs | Share |
|---|---|---|
| Landed the change | 29 | 69.0% |
| Reply cut off by the 8,192-token cap | 10 | 23.8% |
| Reported success, changed nothing | 12 | 28.6% |
| Ran past the wall-clock ceiling | 1 | 2.4% |
| Needed the escalated worker | 15 | 35.7% |
| **Failed outright** | **13** | **31.0%** |

Two runs edited files outside their whitelist to keep `bun run check` green,
including one that duplicated an interface into a second file. The whitelist is
a token budget and an instruction; it is not a sandbox.

One no-op was caused by the spec itself: a line reading *"do not touch
queue.ts"* made aider offer to add that file, and `yes-always` spent the reply
accepting instead of editing. **Naming a file in a prohibition is as dangerous
as naming it in an instruction.**

## Read the 6.8× with these in hand

1. **Run B went second and inherited what Run A paid to find** — two holes in
   the design (a bloom that is hit moves its own close beat into the past; the
   queen must be installed with no phase entered) plus the `window` →
   `openBeats` rename and three rounds of repair to shared tests. A fair rematch
   puts the in-session build first.
2. **Run A is not a pure delegation.** One sub-task missed twice at the
   escalated worker and was taken back into the session, as the delegate skill
   prescribes. Run A's figure therefore flatters delegation slightly.
3. **The shared scaffold is in neither column** — $9.92 and 66 requests of
   groundwork, delegated in fifteen tasks. For the cost of delegating a whole
   feature rather than one module of it, add that.
4. **The context tax ran against Run B.** It came later, so its conversation was
   longer and each of its requests read *more* cache than Run A's — 310k per
   request against 274k. The ordering handicapped the cheaper run.
5. **The dollar figures are list-price arithmetic**, applied to the usage
   recorded per request in the session transcript. The worker figures come from
   the OpenRouter credit balance before and after each phase, and are exact.

## What follows

Nothing here says the machinery is broken; it says the arithmetic behind
"delegate by default" does not hold at this task size. Three things carry
forward:

- **A delegation that lands in one run is competitive. One that takes four is
  not.** 31% of runs failed at least once.
- **Delegate whole changes, never fragments.** Every task split to fit the reply
  budget doubled its round trips on the expensive side. The escalation slot in
  `.aider.model.settings.yml` exists so tasks need not be shrunk to fit.
- **The spec is the deliverable.** Two independent implementations of one spec
  came out behaviourally identical; where the spec had a hole, both carried the
  same bug. Time spent on the spec is worth more than the choice of who types.

The raw per-phase figures, the delegate logs and the tracking script are not in
the repository — they were session scratch. What is reproducible is the method:
mark phase boundaries, sum usage per request out of the session transcript, and
read the OpenRouter credit balance either side of each phase.
