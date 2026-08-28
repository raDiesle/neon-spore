---
name: autonomous
description: Run Neon Spore unattended for hours — pick the work, run two or three lanes in parallel worktrees, land each on main linearly, and resume from cold after a token window runs out. Use when the user says to spend remaining budget, work on their own judgement, keep going without them, or asks to continue an autonomous run.
---

# Running unattended

`docs/autonomous.md` is the reasoning. This is the loop.

You are the **orchestrator**. You pick work, spawn lanes, land them and pick
again. You do not write feature code yourself — a session that starts editing
`world.ts` stops being able to land anything, because it is now a lane that
owns the file every other lane needs.

## 0. Take the board before anything else

```bash
bun run burn
```

Empty queue → this is a fresh run, go to 1. Lanes on it → this is a **resumed**
run: something in flight is a branch with commits and a worktree still
standing. Finish those before opening anything new. `bun run burn --next`
prints the brief of the first unopened lane.

Never plan from memory. The board is derived from git and cannot be stale.

## 1. The queue is given to you

**This skill does not decide what is worth doing.** `docs/queue.md` is the
owner's file. You read it top to bottom and work it in order; you do not add to
it because a spec file is ahead of the code, because a lane noticed something
adjacent, or because the interesting work is further down.

That used to be step 1 of this skill and it is now
`.claude/skills/fill-queue`, invoked **only** when the owner says so — *find me
candidates*, *fill the queue*. The split is not bureaucracy. Designing is
cheaper and more enjoyable than fixing, so a run that may do both does more of
the first than it means to: the first run this skill drove ended an evening
with more than twenty lanes decided and two being worked. The owner fills the
queue as a matter of course now, and the run's job is to empty it.

**Three things are still yours to write into it, and only these three.**

- **What the owner said this session.** A bug they report, a feature they ask
  for, a change of mind about something queued — that is transcription, not
  invention, and it happens in the same turn they say it. Label it *Asked for
  by the owner.* and put it in their half of the file.
- **The half a landing could not reach.** A lane that fixes a symptom and
  reports that the rest of the cause lives in a file it did not own leaves work
  behind. Queue it, against the lane that will do it, in the landing commit.
- **A follow-up the owner's own verdict creates.** A `FAIL` on a check is an
  owner ask by definition — they looked and said no.

Everything else a lane noticed comes back in its report and goes to
`docs/parked.md` in one commit after landing, which is where an idea nobody has
decided on belongs.

**An empty queue ends the run.** Say so, say what landed, and stop. Do not
refill it.

## 1a. Order

The file is ordered and the order is the plan: the first entry is the next
thing done. Two keys, in this order.

**Who asked for it.** Every entry carries *Asked for by the owner.* or
*Proposed by the run.* on its own line. Every owner ask is worked before
anything the run proposed, however much better the proposal looks. That is
exactly why the label exists.

**Then the file's own order**, which the owner may rearrange at any time
without telling you. Re-read it rather than remembering it.

## 2. Run a batch

Two or three lanes, never more. The limit is the landing, not the machine:
`main` is linear, so lane four rebases over the three before it.

Each lane is one `Agent` call with `isolation: "worktree"`, spawned in the
background, all of a batch in **one message** so they run at once. The prompt
must carry, every time:

- the brief, verbatim from the queue;
- the paths it owns, and that it may touch nothing else;
- **`bun install` first** — a fresh worktree has no `node_modules`, and the
  main tree's must never be copied or linked in (its workspace links point at
  the main tree by absolute path, so a test there runs against someone else's
  code);
- read `CLAUDE.md` and the one or two spec files the brief names;
- `bun run check` green, then commit, staging **only its own paths**;
- a `Check:` trailer for anything only an eye can settle — a wave at tempo, a
  silhouette at 26 px, a colour against the field — written to the shape
  below, because a check is read cold, weeks later, by somebody who was not
  there. One trailer per landing, not one per thing the lane touched —
  `docs/verification.md` has the procedure for finding the wider subject;
- **after any amend, re-read the message and confirm the trailers are still
  in it** (`git log -1 --format=%B`). A lane reported two, amended during a
  rebase, and the trailers went with the amendment — the obligations vanished
  and were repeated to the user as though they were on the list;
- **a report of at most 250 words.** Everything else goes in the commit
  message, which is where a cold session will look for it anyway. A long
  report is read once by an orchestrator whose context is the scarcest thing
  in the run, and then it is gone; a commit message is in the clone forever;
- anything noticed and not done comes back in its **report**, not in
  `docs/parked.md` — that file is shared, and three lanes appending to the end
  of it is three rebase conflicts in the one file whose content nobody would
  think to check. The orchestrator files them, in one commit, after landing;
- **do not land, do not push, do not touch `main`** — the orchestrator lands;
- if it is blocked on a design decision, stop and say so rather than guess.

## 3. Land them, one at a time, in queue order

In the lane's worktree:

```bash
bun run land
```

If the check goes red on a file the lane never touched, with `Cannot find
module '@neon-spore/…'`, the workspace graph moved under it — a landed lane
added a dependency between packages. `bun install` in that worktree, then land
again. It reads like a rebase disaster and is thirteen milliseconds of work.

Replay onto `main`, `bun run check` on the result, fast-forward. It refuses
rather than merging. A rebase conflict comes back as a refusal with the files
named — send the lane's agent back to resolve it (`SendMessage`), do not
resolve it yourself in a worktree you do not own.

`bun run land` deletes the entry from `docs/queue.md` itself and commits that,
because the tick is the deletion and leaving it to whoever ran the landing
failed twice in one afternoon — the same way both times, and invisibly: a
landed branch stops sitting on the trunk's tip the moment anything else lands,
so it falls back to reading exactly like a branch nobody has started.

A lane whose `Check:` list is the interesting part gets said out loud in the
final report, not buried.

Then sweep, from your own worktree — never from the lane's, which you are
standing in when you land it:

```bash
bun run checks --clean
```

A landed branch and its worktree go **without being asked**. A lane still
working is protected by the one thing that distinguishes it: uncommitted files
in its tree. Git cannot tell the two apart on its own, because a lane that has
not committed yet points at whatever `main` was when it started, which is an
ancestor of `main`, which reads as landed.

**Sweep only when no lane is live, because that protection has a hole at the
start of every lane's life.** "Uncommitted files" is a good signal from a
lane's first write onward, and it says nothing at all before it. A lane that
has run `bun install`, renamed its branch and spent ten minutes reading has
written nothing: its tree is clean, its branch is an ancestor of `main`, and
it is byte-for-byte indistinguishable from a lane that landed an hour ago.
`--clean` deletes it, and the agent survives with no filesystem — every tool
refusing, correctly, to fall back to the shared checkout.

That is not hypothetical and it is not the tool's fault. It happened to an
`ultrathink` lane whose thinking window is exactly the vulnerable one, run by
an orchestrator that had already listed the lane as live and swept anyway. So
the rule is the orchestrator's, not the tool's: **`--clean` waits until the
board shows nothing in flight.** Worktrees are cheap to leave standing for
another twenty minutes; a lane is not cheap to run twice.

## What a `Check:` has to contain

How many trailers a landing gets is answered in `docs/verification.md`
("One check per landing"), not here — find the wider subject before writing
anything. What follows is the shape of the one sentence once you have it.

The person reading it has not seen the code, does not remember the lane, and
is deciding in the two minutes before they close the laptop. A trailer that
assumes any of that back is a trailer that stays on the list forever.

**One sentence. A question, with a yes and a no.** That is the whole trailer.

    Check: does the wash stay under the creatures, or does it compete with them?

Not two sentences, not a paragraph, and **never the reasoning** — a lane that
has just spent an hour on a thing wants to explain it, and the list is not
where that goes. The commit message is. Trailers written this year have run to
a thousand characters and been read by nobody; the ones that get ticked are the
ones a person can answer while standing up.

**A check whose failure is not imaginable cannot be failed**, so it never gets
ticked either. "Check the backdrop" is not a check. If you cannot phrase the
"no", there is nothing to look at.

**Write it for somebody who only plays the game.** The reader is not the
author's colleague and does not have the code open — treat them as QA: they
know the game well and the repository not at all. So the check is in the
vocabulary of *looking at the thing*, never in the vocabulary of changing it.
No identifiers, no file paths, no parameters. `BULB.depth moved from 0.1 to
0.13` is a diff, not a check; *the bulb's bumps are deeper than they were* is
the same fact in the only language that can be checked by looking.

A measurement is fine when it is about what you see — *at 26 px on a phone* is
where to stand, not jargon. The file and the number still matter to whoever
later fixes it, and they belong in the commit message, which is where that
person will be.

**And this is a test, not a style note.** If the change cannot be described to
somebody who only plays the game, **it is not a check** — it is a refactor, a
hashed field, a split file, and the right number of trailers for it is zero. A
list is only worth reading if every row on it is a thing a person can go and
see.

**Every field is one line, and one line means one line.** The owner, reading
the list this morning: *have much shorter explanations in the "to check" list.*
Two entries on it had run to a paragraph apiece in `changed` and another
paragraph in `decide` — every sentence of it true, every sentence of it written
by somebody who had just spent an hour on the thing and wanted to explain. That
is what the commit message is for. **A hard cap, and it is not a style note:
`changed` and `decide` are at most 25 words each, `subject` at most 15, and
`before`, `after` and `where` are phrases rather than sentences.** A field that
needs more is a field carrying the reasoning, and the reasoning does not go
here — the reader is standing up, deciding, in two minutes, and a wall of text
is a row that gets skipped forever rather than a row that gets answered.

**And one badge, first, on its own: `concept` or `implementation`.** The owner
asked for it by name. `implementation` is the ordinary case — something the
game or the tool now does differently, and looking at it means looking at the
thing. `concept` is a check on a proposal that nothing ships yet: a card, a
candidate, a draft shape offered beside the built ones. The two are answered in
completely different frames of mind — one asks *is this better than what we
had*, the other asks *is this worth building at all* — and a list that mixes
them without saying which is a list where every row is read twice before it is
understood.

**The detail goes in the restatement, in fields, not in prose.** Six of them,
each one line, each answering exactly one thing:

- **badge** — `concept` or `implementation`, one word, nothing else.
- **subject** — the thing, named the way a player would name it. *The bulb —
  the round one with many small bumps.* Not a symbol, not a path.
- **changed** — what was different before, in what a player would notice. A
  clause, not a history and not a parameter.
- **decide** — the same question as the trailer, in the reader's terms.
- **before / after** — *what to put beside what.* This is the field that
  actually gets a check answered, and it is the one lanes leave out: a look
  judged alone is judged against memory, and memory prefers whatever it saw
  last. Name the control by the button that selects it — `before: SCALE`,
  `after: MOUNTED SCALE` — or say `before: nothing, this is new` when there
  genuinely is no other side. The page can now show two skins at once, two
  motions on one clock and a candidate beside the shipped look, so "there is
  no way to compare" is no longer true anywhere.
- **where** — the command and the tab, in backticks. `DIRECTOR_HOST=127.0.0.1
  bun run dev`, SHAPES, then the button by name. Not a sentence about where; a
  path a thumb can follow. If a repository command settles it outright, put it
  in backticks in the **trailer** and `bun run checks --run` will run it
  without a person at all.

**And a picture, when the change is visual and one is cheap.** A lane driving a
headless preview can capture a frame; capturing the same frame before the
change costs one `git stash` and a second capture. Commit both under
`docs/checks/` and name them in the restatement's `before` and `after`. A still
that shows the difference converts a check from a task into a glance, and the
ones that have sat longest on the list are all ones where the reader would have
had to build the comparison themselves. Do not fake it with a diagram — the
value is that it is the real frame.

**The restatement is a second commit, and it gets its own file.** Write
`docs/checks/<sha>.md`, where the sha is the commit carrying the trailer —
which does not exist until that commit is made, so "in the same commit" is a
paradox and a lane said so rather than fudging a key. Commit the work, read
the sha, commit the restatement.

**One file per commit, never a shared one.** It was a single document for
about an hour and three lanes collided in it, every one of them appending at
the same end — the identical failure `docs/parked.md` was diagnosed with and
fixed by taking the writing away from lanes. That cure is not available here,
because only the session that changed something knows what changed. So the
shared append point goes instead.

**Quote the trailer word for word.** The join is on the sentence, not the sha,
because a lane that lands behind another is replayed and its sha stops
existing — six entries orphaned that way in one night, one of them after its
lane had already hand-corrected the key. Wrapping is forgiven now, in the
quote and in the trailer both; a truncated quote is not.

**And a picture, when the change is visual and one is cheap.** A lane driving
a headless preview can already capture a frame; capturing the same frame
before the change costs one `git stash` and a second capture. Commit both
under `docs/checks/` and name them in the trailer. A still that shows the
difference converts a check from a task into a glance, and the ones that have
sat longest on this list are all ones where the reader would have had to build
the comparison themselves. Do not do this for a change with no visual half,
and do not fake it with a diagram — the value is that it is the real frame.

**Never append to `docs/checks/restated.md`. The per-commit file is the whole
mechanism.** That shared file was the original home and it is now legacy: it
still parses, so an entry written into it is a *second* copy of a restatement
that `bun run checks` already found in `docs/checks/<sha>.md`, and two lanes
appending to its end is a rebase conflict in the one file nobody thinks to
check. This was proved by a landing that wrote no entry there at all and whose
restatement rendered correctly anyway. Say it in every lane prompt, because a
lane that has read an old commit will copy what it sees.

The quote inside `docs/checks/<sha>.md` is the trailer's text and **not** the
`Check: ` that introduces it. A lane read "word for word" the other way, quoted
the whole line, and its restatement came back from `bun run checks` as an entry
matching nothing — which is the one failure mode this file cannot afford,
because an orphaned restatement looks exactly like a check nobody has restated.
The join is on that sentence rather than on the sha, because a lane that lands
behind another is replayed and its sha stops existing.



```markdown
## `d5df018` — the swallow

> the wider mouth still reads as swallowing rather than as a flash, not merely smaller

- **subject** the cannon's fire opening while it takes a pod in
- **changed** the opening used to stretch downwards, past the edge of the
  field; it now widens sideways and rounds out inside
- **decide** does the wider shape still read as *effort*, or does it read as
  a flash that happens to be bigger?
- **where** `bun run preview`, any wave with a pod
```

If the trailer's own wording changes after this is written — a later edit, a
rebase that reworded it — the quote and the trailer drift apart and
`bun run checks` says so once, by name, rather than silently losing the
restatement. Keep them matching instead: copy the trailer's text in, do not
paraphrase it.

## 4. Drain before deciding anything else

**Designing is cheaper than building, so a run does more of it than it means
to.** Every plan feels like progress, and none of it is on the trunk. The
first run this skill drove ended an evening with more than twenty lanes
decided and two being worked — which is not a plan, it is a debt with a table
of contents.

`bun run burn` says so when the ratio goes wrong: eight or more waiting behind
fewer than two in flight. The ratio is the tell, not the length — ten behind
three is a healthy pipe.

When it fires, the rule is simple and it overrides the interesting work:
**open no new design pass, and start a lane instead.** A design pass is
justified when a thing genuinely cannot be specified without one. It is not
justified because it is the more enjoyable half.

## 5. Go back to 0

Until the queue is empty or the budget is gone. Refill from `--candidates`
when it empties; keep a `/loop`-style wakeup only if the user asked for one.

## Choosing a model and an effort

Two dials, and they are not the same dial. **Model** is how good the writing
is. **Effort** is how long it thinks before writing. A cheap model thinking
hard and an expensive one answering off the top are different mistakes, and
the second is the one an unattended run makes, because nothing stops it.

**Neither dial is the main thing a lane costs.** That was measured, on the
first run this skill drove, and the numbers are in `docs/autonomous.md`: the
cheapest model ran the most expensive lane, because it touched twenty files
across three packages and then had to replay. Scope dominates tier, and a
crowded batch — two lanes sent back to rebase — cost more than every model
choice in the run put together. So the first question is never which model.
It is whether the lane is one thing.

The default is `sonnet` with a named subject to think about. `opus` is bought,
not defaulted to, and the thing it is bought with is the test below.

Effort is not a parameter on `Agent`. It is set by the words in the prompt —
`think`, `think hard`, `think harder`, `ultrathink` — which is a real ladder
and not a figure of speech. So every lane prompt carries a rung **and** a
subject: the rung buys the thinking, the subject decides whether it is spent
on the thing that is actually hard. "Think hard" alone buys depth on whatever
the model happened to find interesting.

| The work | Model | Effort | Spent on |
|---|---|---|---|
| A mechanic, a coupling, a boss's choreography — the answer is a judgement and the code is the easy half | `opus` | `ultrathink` | the shape, before a line is written |
| A system that restructures the loop — a round that is not the field, a new mode | `opus` | `think harder` | what it does to the world's idea of a round |
| A new creature or wave from a pattern `content/` already has | `sonnet` | `think hard` | the communication test, or the one-sentence test |
| Render against a written reference — a card, a background, a glyph | `sonnet` | `think` | how it reads at 26 px on a phone |
| Tests against a module that already exists | `sonnet` | none | — |
| A long mechanical file whose shape is decided; a uniform sweep | `haiku`, or `bun run delegate` | none | — |
| Reviewing a landed lane; judging whether two shapes read differently | `opus` | `think hard` | the case *against* the thing, first |

Three rules that override the table.

**The unpick test decides `opus`, and nothing else does.** Not how important
the lane feels. Ask what it costs to be wrong: a landing is cheap to redo, a
contour is cheap to redraw, and both are `sonnet` however much they matter. A
premise baked into `world.ts`, the hash, the protocol or the shape of a round
is expensive to unpick months later by somebody who no longer remembers it was
a choice. That is what the tier is for.

**Raise the effort before the model.** A rung of thinking is a fraction of the
price of a tier, and for the failure that actually happens — the hard part
went by without being looked at — it is the dial that works. `sonnet` told
what to think about beats `opus` told nothing.

**Drop both when the lane is transcription.** A spec that reads as long as its
code is a spec that should have been the code. That is the `delegate` case,
and `docs/delegation-cost.md` has the arithmetic on why it is rarely worth it.

The orchestrator is Opus, and thinks hard at exactly two moments: choosing
what goes in the queue, and deciding whether a returned lane is finished or
merely green. Everything between those is bookkeeping and wants no thinking
at all.

## When your own context fills

It will, and the answer is not to be careful. An orchestrator running a long
batch accumulates a lane report, a set of prompts and a diff review per lane,
and the first thing to go is not reasoning but *bookkeeping* — the small
mechanical step at the end of a landing. That is exactly what happened here
twice, and both times the board caught it rather than the session.

So: push the mechanical steps into the tools, keep the reports short, and
treat starting a fresh session as routine rather than as a failure. Nothing in
this arrangement lives in a transcript. `bun run burn` reconstructs the run
from `docs/queue.md` and git, `bun run checks` reconstructs what is owed, and
`docs/parked.md` holds what was noticed. A new session picks all three up
knowing nothing, which is the property the whole design is arranged around —
so the cheapest fix for a full context is to spend it and start again.

**Do not run two orchestrators at once.** Lanes parallelise; landing does not.
Two sessions landing onto one linear trunk is the one shape that turns a
rebase into a race.

## When the tokens run out

Expected, and nothing is lost. This has now happened for real, mid-batch, with
two lanes live: one had committed and was rebasing, the other had four
uncommitted files and was about to run its check. Both were resumable — the
board named the first as in flight with its worktree path, and `git status` in
the second's worktree found its work exactly where it left it.

The resume is `bun run burn`, and then a message to each live lane telling it
what moved while it was gone. Say `bun install` in that message: a lane coming
back after a long gap is the most likely thing in this arrangement to meet a
changed workspace graph, and the error it gets names a file it has never
opened.

To come back automatically rather than waiting for the user, schedule a
wakeup at the reset (`ScheduleWakeup`, or a scheduled task for a longer gap)
whose prompt is `/autonomous`. A wakeup that fires while still over the limit
costs nothing and the next one picks up. Do **not** poll every minute.

## What this arrangement has already got wrong

Every item here cost a landing or a browser. None of it is theoretical.

**A landing refuses under load, and the refusal is right.** `bun run land` runs
`bun run check` after the replay. With two lanes compiling on the same machine
the suite takes twice as long and tests near a per-test timeout start failing —
one file went from 63 s to 127 s and three CAIRN tests blew a 5000 ms limit that
they clear in 6 s when run alone. **Retry when the machine is quiet. Never
raise a timeout to get past it, and never force the landing.** If it still fails
quiet, it is not load, and that is a real finding to report rather than route
around.

**Never rewrite a file the owner writes by hand.** `docs/verified.md` is
appended to, never round-tripped through a script: one that rewrote the whole
file matched nothing afterwards and took the outstanding list from twelve to a
hundred and twenty-eight. Append, then `git diff --numstat` and check the
deletions column reads zero before committing. Duplicate rows are a defect in
whatever wrote them — fix that, do not tidy the file.

**It fails silently in two ways, and neither of them errors.** `bun run checks`
joins a decision to a check on **sha and text together** (`sameCommit` and
`d.text === check.text` in `checks.ts`), so a row that does not parse, or whose
text is off by one character, is not a warning — it is a check that simply
stays open, in a file whose whole job is closing them.

- **The text runs to the end of the line, so nothing may follow it.** A note
  appended after the check's own words makes the text unequal and the decision
  matches nothing. Notes go on their own indented `  - ` line underneath, which
  is what `ledger.ts` documents and what the `FAIL` example there shows.
- **The file is LF.** `a9f4755` added `.gitattributes` with `eol=lf`, so this
  is no longer the CRLF file older guidance describes — and writing a CRLF row
  now breaks it, because `ledger.ts`'s `(.*)$` cannot reach the end of a line
  ending in a carriage return: in JavaScript `.` does not match ``. The row
  parses as nothing at all.

Both were hit for real on 28 August 2026, in that order, on one row.

**A speed claim is a distribution, never a mean.** A lane measured a frame's
work at 940 ms → 84 ms on a synthetic harness, landed, and the owner's browser
crashed. The real page's median frame was 3.3 seconds; the fix was 1.5× and the
page was worse. Require the longest frame, the 95th percentile, and the share
of frames over 16 ms, **measured on the real page**. And require the guess to
be proved: that lane's successor found the true cost was 0.58 ms per
`getPointAtLength` call, not the garbage collector everybody assumed.

**Reverting is cheap and is the right first move.** When something landed makes
the owner's tool unusable, revert it on `main` immediately and queue the work
again. They cannot use the page while a fix is being written, and a revert is
one commit.

**A lane's ownership is a guess about where the fault is.** Twice in one run it
was wrong: one lane found the break in a file it happened to own, another could
not reach the file the fault was in and landed half a fix. Tell every diagnosis
lane to **stop and report** if the cause is outside its paths rather than
reaching for it, and queue the remainder against the lane that owns it, in the
landing commit.

**The owner's `FAIL` is the most valuable thing in the run**, and its wording is
evidence. *Still every wave has the lance* **control** turned out to mean the
button was gone and its hit region was not: an invisible control that still
answered a press. Read a failed check literally before deciding what it means.

**Do not sweep worktrees while any lane is live.** `--clean` cannot distinguish
a lane that landed an hour ago from a lane that has spent ten minutes reading
and written nothing — both have a clean tree and a branch that is an ancestor
of `main`. Sweep the specific worktree you just landed, by path, and leave the
rest standing.

## What this mode may not do

- **Decide that something was looked at.** No session can watch a wave at
  tempo. That is a `Check:` trailer, every time.
- **Go quiet on a question.** A blocked lane stops and says so; the run moves
  on to the next one rather than building on a guess.
- **Fill the queue.** That is `.claude/skills/fill-queue`, and only when the
  owner asks for it by name. Transcribing what they said this session is not
  filling it.
- **Change a look.** CLAUDE.md's *A look is offered, never replaced* binds
  every lane: an alternative goes beside the shipped thing on the NOT BUILT YET
  pages and the owner decides by looking. The three exemptions are named there.
- **Land red.** `bun run land` runs `bun run check` after the replay for
  exactly this reason. Never talk it out of a refusal.
- **Leave `main` unpushed.** Push it when it has landed something. An
  unpushed trunk briefs the next clone on code that is not there.

## The closing report

`bun run handoff` for the four-line block, then, above it and short:

- what landed, one line each;
- what is still in flight and where its worktree is;
- any question a lane stopped on.

**PNG, never SVG.** The owner reads these on an Android phone, where an SVG
attachment is a file to open rather than a picture to glance at, and a picture
that has to be opened is not a glance. `bun run frames` already writes PNG. A
shape sheet does not — it writes SVG, which is right for the tool and wrong for
the chat — so rasterise it before sending: load the file in the headless Chrome
`tools/frames` already depends on and screenshot the `<svg>` element. Twenty
lines, no new dependency.

**Send pictures instead.** The owner asked for them: *you can send me
screenshots of some results and I could optional already review and give
feedback.* That is the opposite of the list — a list asks them to go and look,
a picture is already looked at by the time they read the line under it. So when
a landing changed something visible and a frame can be captured, attach it to
the report and say in one sentence what to look at. Optional for them, never a
question they have to answer.

Two rules keep it useful rather than noisy. **One picture per landing at most**,
and none at all when nothing visible moved — a refactor with a screenshot of an
unchanged field teaches nothing and trains the eye to skip them. And **it is the
real frame**, never a diagram or a mock: the whole value is that it is what the
game actually drew.

**Do not raise the outstanding checks.** Not as a list, not as a closing line,
not as a suggestion that four of them could be settled in one pass. The owner
said so: *don't remind me or block you about missing checks any longer.* They
know the list exists, they know where it is, and a run that ends every report
by pointing at it is nagging a person who has already decided when they will
look.

Nothing else changes. Trailers are still written on every landing, restatements
are still filed, and `bun run checks` still derives the list — the record is
the point and it stays. What stops is the reminding.

And nothing waits on a check. A check has never blocked a landing and must not
start: the queue is worked in order, and an entry is never held back because
something earlier is unlooked at.
