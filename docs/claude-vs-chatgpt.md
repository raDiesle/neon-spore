# Claude or ChatGPT, for this repository

A comparison written to answer one question and not a general one: **if the
subscription that pays for the agent on this project changed from Anthropic's
to OpenAI's, which of the things actually done here would get better, which
would get worse, and which would not notice.**

It is deliberately not a benchmark. Every leaderboard compares *models on other
people's tasks*, and the tasks here are peculiar — a wave whose timing has to be
watched, a contour nudged by a thousandth, a commit message that runs to a
paragraph because the next session reads it cold. A model that wins on a
public benchmark can still lose on a Tuesday here, and the reverse.

Two honesty notes before the tables, because they decide how much weight any of
this can carry.

**Nothing below was measured on this repository.** `docs/delegation-cost.md`
was: one boss built twice, the arithmetic written down, and the conclusion
reversed a rule that had been the default. This document has no such run behind
it. Where a claim is about how a tool is *built*, it is checkable and stated
flatly. Where it is about which model writes better prose or better geometry,
it is an opinion and says so.

**The vendor facts move monthly.** Tiers, caps and which surfaces exist were
read in September 2026 and will be stale. The parts that age slowly are the
*shapes* — asynchronous-cloud-and-diff against local-interactive-loop — and
those are what the verdict rests on.

## What the question is really about

It is not "which model is smarter". Both houses ship a frontier coding model,
both are good enough to add a creature to `packages/content`, and on the work
this repository does most — small, test-covered, deterministic edits behind
`bun run check` — the difference between them is smaller than the difference
between a well-scoped task and a badly scoped one. `docs/choosing-a-model.md`
already measured that: the cheapest model ran the most expensive lane of the
day, because it had the widest scope.

The question is about the **harness**, and this repository is an unusually
harness-heavy one. Read what is in the tree: `CLAUDE.md` is a constitution, not
a README; there are four project skills under `.claude/skills/`; a hook runs the
determinism test after every edit inside `packages/sim`; `bun run land` rebases,
checks, fast-forwards, writes a release note and sweeps the worktrees that are
spent, all in one command. None of that is model work. All of it is harness work, and a subscription swap is a harness swap.

## Task by task

The tasks are the real ones — every row is something that happened here in the
last fortnight.

| Task | What it needs | Under Codex | Verdict |
|---|---|---|---|
| Add a creature to `packages/content` | one entry, a state machine, a replay test; `bun test` says whether it is right | the same; the loop is run-tests-fix-repeat and both do it well | **even** |
| Add or change a wave | the one-sentence test, column mapping, then an eye on the tempo | the sentence test lives in a skill; skills are portable now, and the eye is not portable either way | **even** |
| Shape work — nudge a `blobPath` parameter | `bun run shapes:report` first, then an SVG sheet and a human look | numbers are numbers; the look is the owner's either way | **even** |
| Render work — a glow, a tail, a hit | draw it, then *send the picture* | Codex's cloud can screenshot a browser and attach it; the CLI's story for handing a PNG into the chat is weaker | **slightly worse** |
| Director tool work | plain TS, no framework, files under 250 lines, long comments | both fine; the ceiling is enforced by review, not by tooling | **even** |
| Long prose — commits, docs, release notes | paragraphs in a fixed voice, argued rather than summarised | the clearest subjective gap in Claude's favour; GPT-class models write terser and flatter by default, and this repo's history is essays | **worse** |
| One session at a time, landed by hand | `bun run land`: rebase, check, fast-forward, note, sweep | a local script reading git, so it ports; the sweep is Windows-specific | **even** |
| A session started from the phone | clone `origin`, work, rebase, land `main`, report | Codex's strongest surface — cloud tasks dispatched from the ChatGPT app are the shape it was designed for | **better** |
| `bun run delegate` (aider + GLM) | an OpenRouter key and a spec | untouched — the worker is a third party to both | **even** |
| Relay and determinism | `bun test`, `bun run relay:check`, wrangler | untouched | **even** |
| Concept art for a NOT BUILT YET card | a reference picture nobody has drawn | ChatGPT's subscription includes image generation; there is no equivalent in the Claude subscription today | **better** |

## What ChatGPT is genuinely better at, here

**The phone.** `CLAUDE.md` has a whole section on cloud sessions, and every
line of it is a workaround for the same thing: a surface designed around a
local interactive loop, stretched to reach a machine that is not this one. The
push-so-the-clone-can-see-it rule, the landing rule, the derived closing block
— all of it exists because the phone is a second-class seat. Codex's cloud task
is a first-class seat: dispatch from the app, come back to a diff. If half the
sessions on this project start from a sofa, that is not a small thing.

**Pictures the game does not compute.** The owner collects looks rather than
adopting them — VERSUS candidates, NOT BUILT YET cards,
`docs/asset-catalogue.md`. Some of those cards have a frame with a question
mark in it, meaning nobody has drawn anything at that name. An image model in
the same subscription is a direct answer to that particular empty frame, and it
is not something Claude's plan supplies.

**Parallel-and-review as the default shape.** This repo runs lanes one at a
time on purpose — the owner said "we have time" — but the landing is the
bottleneck rather than the writing, and a surface that assumes you will
dispatch several and review diffs later fits the *queue* better than it fits
the way lanes are run today.

**One subscription instead of two.** If ChatGPT is already being paid for as a
general assistant, the marginal cost of the coding agent is zero, and the
marginal cost of keeping Claude beside it is a hundred or two hundred a month.

## What would get worse

**Prose is the sharpest loss and the easiest one to underrate.** Look at what
this repository *is*: `CLAUDE.md` argues with its own earlier rules and says
which one was wrong; commit subjects are sentences; an idea worth keeping is
written as paragraphs because a title alone does not say whether it is worth
a session. Every one of those is a writing task with a house voice, and the house
voice was learned from a model that writes long by nature. A model that writes
tersely by nature can be prompted into it and will drift out of it, session
after session, because nothing checks prose. `bun run check` has no opinion
about a paragraph.

**The harness has to be rebuilt, and the parts that fail are the parts that
matter.** An inventory of what a switch touches:

- `CLAUDE.md` → `AGENTS.md`. Cheap: rename, or point one at the other. Codex's
  format is the cross-tool one, so this is arguably an improvement in
  portability.
- Six project skills. Portable in principle — SKILL.md has spread well beyond
  Anthropic's own tools — but "portable" means the file is read, not that the
  surrounding behaviour matches.
- `.claude/hooks/`. Codex has lifecycle hooks now, so this is no longer the
  wall it would have been a year ago; it is a port rather than a rewrite. The
  determinism hook is the one that must survive, and `CLAUDE.md` says why in
  its own words: *a rule in CLAUDE.md is a hint; a hook is binding.*
- `.claude/launch.json`, the worktree tooling, `bun run land`. Local scripts
  reading git — provider-neutral, except where they name a directory with
  `.claude` in it.
- The picture rule. *Send the picture. Do not describe it.* That is a chat
  affordance, and a chat affordance does not port by editing a file.

**Windows is the quiet one.** This machine is Windows 11 and the owner also
works on macOS, so nothing may assume one OS. Codex on Windows is real and
first-party now — a native installer, PowerShell, an OS-level sandbox — and it
was still labelled experimental in the spring. The worktree sweep here already
fails quietly on Windows for reasons `CLAUDE.md` documents at length; putting a
second experimental layer under it is exactly where one quiet failure becomes
two.

**Interruptibility.** The strongest single argument for the current
arrangement is that a lane here is *watched*: the owner reads a plan, stops it,
redirects it, asks for a picture. The asynchronous-diff shape is worse at that
by construction — it is the trade it makes on purpose. Whether that matters
depends on whether the next month of work is queue-shaped or argument-shaped,
and on this project it has mostly been argument-shaped.

## What would not change at all

Worth saying plainly, because a migration feels total and this one is not.
`bun test`, the purity test, the determinism test, `bun run check`, the ports
arrangement, the preview server's `__preview` identity probe, the relay check,
and `bun run delegate` are scripts in this repository
that read git and run Bun. They do not know which model called them and they
would not notice. That is roughly the whole verification story, and it is the
reason a switch is a real option rather than a fantasy: **what keeps this
project honest is not the agent, it is the check the agent has to pass.**

## The verdict, and it is conditional

**Keep both for a month before deciding anything.** The one move that is
clearly wrong is cancelling on the strength of a comparison document —
including this one.

If the next month is more of the same — waves argued into shape, contours
nudged, commits that are essays, one lane at a time with the owner reading each
one — **stay.** The prose gap and the interruptibility gap both land squarely
on that work, and the harness is already built.

If the next month is queue-shaped — ten pieces of work dispatched and reviewed
later, most of them started from a phone — **the case for switching is real**,
and the phone surface alone might pay for it. That is a real reversal of how
the work is done today, not a drift: the queue file and the machinery that
walked it were removed in September 2026, and the owner drives one manual
session at a time.

If concept art becomes a bottleneck rather than a curiosity, that is the one
argument that does not depend on how the coding goes at all, and the cheapest
answer to it is the cheap tier of the other subscription rather than a swap.

**And it can be measured, the way delegation was.** The precedent is in the
tree: `docs/delegation-cost.md` reversed a standing default by building one
boss twice and writing down the arithmetic. The equivalent here is one piece of
work, built twice — once each side — with three numbers recorded:
wall-clock to a green `bun run check`, how many turns the owner had to
intervene in, and whether the commit message needed rewriting by hand. That
last one is the prose claim above, turned into something falsifiable.

## Where the vendor facts came from

Read in September 2026, and expected to age within weeks. Only the shapes were
load-bearing; the details are here so a future reader can tell how stale this
page has gone.

- Codex CLI on Windows: native installer and an OS-level sandbox as of spring
  2026, still labelled experimental at that point; WSL2 the alternative.
- Codex has lifecycle hooks and subagents; skills in the SKILL.md sense are
  read by a broad set of tools now, Codex among them.
- Both houses top out around $200 a month at the consumer tier, with OpenAI
  running more tiers and a message-count style cap, and Anthropic running a
  rolling five-hour budget with a weekly ceiling over it.
- Codex's cloud task is dispatchable from the ChatGPT app, Slack and GitHub,
  and its review integration is PR-shaped — worth noting twice, since this
  repository has no pull requests by rule.
