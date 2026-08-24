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

### The file the diff format cannot edit

A file that *generates source as strings* — template literals, nested
backticks, `${}` inside quoted code — collides with the edit format, which
delimits its blocks with the same characters. The worker cannot produce a valid
edit block, retries, fails the same way, and runs until something stops it.
Both doom loops so far were this: `tools/director/src/serialize.ts`, and both
ended at about 65,000 output tokens.

Before delegating, look at the target for backticks. If it is dense with them,
pass `--edit-format whole` for that run and accept the extra output tokens, or
keep the task. Do not hand a backtick-heavy file to the diff format twice.

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

# Report
After the edit blocks, add three lines: Changed (each file, what happened to
it), Not done (anything above you could not satisfy), Unsure (anywhere you
guessed — a name, a number, a convention you could not tell how to apply).
```

The Report block belongs in **every** spec, not only in the conventions file.
Aider's own system prompt tells the model to reply with edit blocks and nothing
else; a standing instruction sitting in read-only context loses that argument,
and the first delegations came back with no report at all. Asked for in the
task message, it arrives.

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
bun run delegate .claude/tmp/spec.md packages/content/src/creatures.ts
```

Not `aider` directly. The wrapper is three lessons that each cost a session,
and it holds them so nobody has to remember them.

It reads the spec and the files it may edit, finds every repository path
mentioned in any of them, and hands each one over read-only before starting.
That is what stops the failure where the worker offers to add a mentioned file,
the standing yes accepts, and the reply that should have carried the edit is
spent on that exchange instead — a run that reports the work done and leaves
the tree untouched. It bites hardest on prose and markup, which cite paths in
their own text, and no amount of rewording the spec helps, because the mentions
come out of the *files*. What it worked out is printed before the run, so the
blast radius is visible without reading the command back.

It sets the console encoding on every platform. That is a no-op on macOS and
Linux, which are UTF-8 already, and load-bearing on Windows: aider's console
there is cp1252, and a spec containing a character outside it — an em dash, an
arrow, `⏸` — kills the run *after* the edit has been applied, and the worker
has been seen silently flattening such characters in the code it writes rather
than erroring. Worth knowing only because that failure looks like the worker's
fault and is not.

And it compares the files before and after, and **exits non-zero when nothing
changed**. So the report is no longer the thing you check.

Extra arguments for aider go after a `--`: escalating the model is one, a
narrower `--test-cmd` than the default is another, and so is `--read <path>`
for a file the worker must see but must not change, on the rare occasion the
scan does not already find it. An existing file in the same style is worth more
than a paragraph describing that style.

Some of the tree is out of the worker's reach on purpose — `.aiderignore` keeps
`.claude/` and `legacy/` out of it. Ask for one of those and the wrapper says
so and refuses before spending anything: that task is done here, and the final
report says so, the same as when the worker cannot run at all.

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

They are a signal and never evidence. The worker has reported *Not done:
Nothing, Unsure: Nothing* on a run that applied no edit at all, and on a diff
that spelled out a rule it should have imported. It is not lying; it cannot see
its own work from outside. Judge the diff.

### Verification does not go over

The reviewing stays here, for the same reason the deciding does: it is judged
against decisions the spec came from, and the session is the only party holding
them. A second opinion from the model that wrote the code is worth nothing —
it already believes the code is right, which is why it produced it.

What *should* leave this session is the part that was never judgement. The
checks already run on the worker's tokens, looped until green, and none of that
traffic arrives here. So when review catches something a machine could have
caught, the fix is not to review harder next time — it is to move that check
into the tests. `packages/sim/test/purity.test.ts` is where both kinds live:
the determinism bans, and a table of rules that must be **called and not
re-derived**, which exists because `mapCol` came back written out by hand twice
in one day and both times passed every check. Adding a row is how something
that got past review once is stopped from getting past it twice.

Then walk the spec's Goal against the diff, bullet by bullet. Something absent
from both the diff and the *Not done* line is the case to look for hardest.

**A guard has to be fired, not read.** Anything whose job is to stop, refuse or
abort is reviewed by triggering it — a tiny ceiling, a rejected argument, a
forced failure. The run ceiling in `tools/delegate` passed three readings and
was still wrong: it aborted correctly and then fell through to the wrapper's
no-op check, which overwrote the exit code and blamed an uncovered file
mention. Two guards, each right alone. Only running it showed that.

That cost four rounds where two would have done, and the fault was in the
specs, not the worker — each one described a fragment instead of the behaviour
from end to end. For a guard, write the whole path down once: what fires, what
it prints, what it returns, and what downstream code must now leave alone.

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
