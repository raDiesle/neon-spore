# Where a lane's minutes actually go

`docs/time-log.md` is the raw ledger — one entry per lane, five rows, written
in the commit that lands it. This file is the reading of it: **296 lanes,
10–16 September 2026, 14 320 logged minutes (238.7 hours)**, and what the
distribution says about making a lane shorter. The owner asked for the reading
on 16 September 2026: *"tasks take quite long time to finish, can we speed up."*

Re-read it by running the parse again when the ledger has grown — every figure
here is a sum over `## ` entries and their five-row tables, nothing is typed by
hand.

## The distribution

| row | minutes | share | mean/lane | median/lane |
|---|---|---|---|---|
| reading | 3 095 | 21.6% | 10.5 | 10 |
| writing | 5 560 | 38.8% | 18.8 | 10 |
| landing | 2 080 | 14.5% | 7.0 | 5 |
| looking | 1 855 | 13.0% | 6.3 | 5 |
| friction | 1 730 | 12.1% | 5.8 | 5 |

Mean lane **48 minutes**, median **35** — the mean is dragged by a tail, and
the tail is the whole story: **42 lanes of 296 (14%) carry 38% of all the
minutes**, while the 113 lanes at 25 minutes or under carry 15% between them.
Nothing is evenly slow. A few sittings are long.

The named bottleneck at the foot of each entry agrees: writing 61, reading 51,
looking 42, friction 39, landing 19, none 18, and 59 that name something
specific rather than a row — a tool that hid why it stopped, a diagnosis, a
type-set collision, the documents rather than the code.

## These minutes are effort, not calendar time

Read on 16 September 2026, after the rest of this file was written, and it
qualifies every figure above. The ledger's rows are estimates a session writes
about itself; the trunk keeps the other account, and the two do not agree:

| day | logged in the ledger | span of the trunk's own commits | ratio |
|---|---|---|---|
| 2026-09-14 | 2 395 min | 969 min | 2.5x |
| 2026-09-15 | 3 385 min | 860 min | 3.9x |
| 2026-09-16 | 1 790 min | 634 min | 2.8x |

**Most of it is not parallel sessions, and some of it may be.** Work lands as
soon as it is done — six of the 204 landings since 13 September landed more
than ten minutes after they were written — and the author dates on `main` run
forward with two inversions a day at most, so the trunk is mostly one lane at a
time. But two sessions were on it at once on 16 September, one of them
recording three parallel test runs in its own friction row, and a second
session's minutes are real minutes that no span of the trunk can show. **The
ledger cannot tell the two apart, which is the argument for the stamp**: a
measured elapsed per lane separates a day that held two sessions from a day
that was estimated generously, and no amount of reading the rows will.

**The stamp is built.** `bun run land` writes a `*Measured:` line under the
entry the session just wrote, from the lane's first commit to the trunk moving
(`tools/land/stamp.ts`). It is a floor and says so in its own words — nothing
before the first commit, and every minute the lane spent waiting — and the five
rows stay beside it untouched. Every figure above this section is estimate-only
and stays that way: a re-reading that can use both accounts wants ten or twenty
stamped lanes first, and the earliest of them is 16 September 2026.

What the trunk does say on its own is that the ordinary pace is **a landing
every seven minutes** (median; mean 14), and that the longest lanes in the
ledger are long in calendar time too, but by less than the rows claim — THE
MOULT is 74 minutes between landings against 245 logged, THE MINE 70 against
220.

So the **shares** above are the useful part of the ledger and the **absolute
minutes are not**: a row that says 245 is an account of attention, not of the
clock on the wall. Nothing in the distribution changes — the tail is still the
tail, friction is still a ninth of it — but any figure quoted in minutes should
come from the trunk, and a lane's own minutes from the stamp
`docs/queue.md`'s entry asks `bun run land` to write.

## The trend is lane size, not slowness

| day | lanes | minutes | per lane | writing share |
|---|---|---|---|---|
| 2026-09-11 | 42 | 2 100 | 50.0 | 39.8% |
| 2026-09-12 | 44 | 1 575 | 35.8 | 39.0% |
| 2026-09-13 | 54 | 2 355 | 43.6 | 38.0% |
| 2026-09-14 | 78 | 2 395 | 30.7 | 34.4% |
| 2026-09-15 | 45 | 3 385 | 75.2 | 39.6% |
| 2026-09-16 | 17 | 1 790 | 105.3 | 43.9% |

A lane on 16 September costs **three and a half times** one on 14 September,
and the four longest in the whole ledger are all on the last two days: THE
MOULT (245), THE SPLICE (225), THE MINE (220), the malfunction map (210). They
are not badly run — each carries a creature's simulation, its look, its tests,
its director note, its wave and its spec page in one sitting. **The work got
bigger; the minutes followed.** That is the first lever and it is free: THE
LEECH and THE LIMPET were deliberately split into a simulation half and a look
half, and the simulation half landed at 125 minutes instead of a 250-minute
sitting that compacts in the middle.

## How a task is split, before it is started

`CLAUDE.md` carries the rule; the figures above are why, and this is the cut.
The owner asked for it on 16 September 2026 — *"maybe Claude should
automatically do better splitting of tasks I gave"* — and the point is that the
splitting is the session's job, decided in the first minutes, not a question
put to him and not a discovery made at minute 180.

**The size test is one question: would this land green on its own?** A half
that cannot be checked by itself is not a half, it is a torn diff. So the cut
always follows a seam the tree already has:

| a task of this shape | lands as |
|---|---|
| a creature | its simulation and tests, then its look, its film and its director note |
| a wave | its rules and timing, then its tutorial |
| a look with no shipped alternative | the VERSUS candidate, then the adoption |
| a sweep across packages | one lane per package, `sim` first |
| a rule plus the picture of it | the rule, then the picture — the rule is provable, the picture is looked at |

**What is not split**: a rename or a type change that is red in halves by
construction, and anything under about forty minutes, where a second landing
costs more than it saves.

**How the halves are carried.** They are named in the report of the first one
and worked in order, each landed before the next starts — the same rule a
prompt carrying several tasks already has. A half that turns out to need the
owner's decision goes to `docs/parked.md` with the question and the next half
starts; a half that is decided but not started is a `docs/queue.md` entry like
any other. A `NEXT:` from the owner is appended after all of them, because it
arrived after the list was made.

**Why it is worth the second landing.** A lane that lands is a lane that
survives a compaction whole (`docs/token-budget.md`), its rebase is small, and
its friction stops at its own edges: the 55-minute friction record in this
ledger is one sitting that took five files over the line ceiling at once, which
two sittings would have met as two and a half files each, with a clean diff
under both.

## Friction, by cause

Friction is only 12.1% of the total, but it is the part that buys nothing, and
**11 lanes hold 21% of it**. The ledger names the same causes again and again:

| cause | lanes | friction minutes | before 14 Sept | since |
|---|---|---|---|---|
| a file hits the 250-line ceiling mid-change | 27 | 375 | 1.25 min/lane | 1.29 min/lane |
| a heredoc or shell quoting mangles a file | 33 | 275 | 1.15 min/lane | 0.64 min/lane |
| one new fact wanted three or four tables | 6 | 165 | | |
| a picture taken of the wrong thing | 11 | 95 | | |
| a shard or `check:fast` red on a clean diff | 7 | 80 | | |
| a rebase against append-only docs | 4 | 65 | | |

The heredoc row is what a fix looks like: `tools/hooks/heredoc.ts` landed on
14 September and refuses a body whose backslashes the Bash tool would halve,
and the per-lane tax fell by nearly half. What is left of that row is the other
shell hazards — an apostrophe, CRLF out of Python, a Python edit that re-read a
file it had already written.

The 250-line row was the same shape of problem and had not moved at all: the
ceiling is enforced by `packages/sim/test/limits.test.ts`, so it was discovered
**when the check went red**, with the change already written across the file.
One lane on 16 September spent 55 minutes of friction, and five files over the
ceiling in turn is most of it. It has the same answer as the heredoc row now —
`tools/hooks/after-edit-size.ts` prints one line naming the file, its count and
the ceiling the moment an edit takes it within 88% of the limit, so the seam is
chosen while the diff is still about the file it is in. The rule is unchanged
and still the test's; only the moment moved. Whether that row falls the way the
heredoc row did is a reading for the next week of the ledger.

The append-only row is the smallest of the six and the one with the least to
decide, so it went the same way on 16 September. `bun run land` already
replayed through two conflicts nobody authored — `docs/queue.md`, where one
tool wrote both sides, and `docs/INDEX.md`, which is generated — and
`docs/time-log.md` was not among them, though **every lane appends to it in
the landing commit**, which makes two lanes landing the same hour a conflict on
the same last lines every time. `tools/land/ledger-merge.ts` settles it as a
record rather than as a list: trunk order first, the lane's own entry after it,
and nothing dropped by either side. The session that wrote this paragraph had
resolved that conflict by hand twice in the hour before it.

Worth saying what the three resolvers have in common, because it is the shape
of any fix that belongs here: each one **refuses** when the sides genuinely
disagree. A merge that guessed would turn 65 minutes of friction into a record
with a row missing, which nobody would find.

## What the machines actually cost

Measured on the cloud image on 16 September 2026, at `origin/main` 3e322c18:

| command | wall clock |
|---|---|
| `bun run check` (10 208 tests, 483 files, 13 shards) | **102 s** |
| `bun run check:fast`, empty diff | 6 s |
| `bun test packages/sim` — what the post-edit determinism hook runs | 2.4 s |
| `bunx tsc --noEmit` | 2 s |

So the tooling is not the bottleneck and has not been since the suite was
sharded. Landing averages **7.0 minutes** a lane against about two minutes of
commands inside it: the rest of landing is composition — the release note, the
time-log entry, the queue entry, the docs a change touches. The same is true
of reading and writing. **A lane's clock is mostly the session composing text,
not a machine running.** That is what makes the next section answerable.

## Would fast mode help, and by how much

Fast mode runs the same model — Opus, not a smaller one — with faster output.
It shortens exactly one term: the session emitting tokens, thinking included.
It changes nothing about the number of round trips, a test suite's 102
seconds, a browser capture, a red test, or a refactor that had to happen.

The five rows do not separate model time from machine time, so the honest form
of the answer is the arithmetic rather than a number. If *g* is the share of a
lane that is the session generating, and fast mode makes generation *k* times
faster, the lane takes `(1 − g) + g/k` of what it takes now:

| | k = 1.5× | k = 2× | k = 3× |
|---|---|---|---|
| g = 50% | −17% | −25% | −33% |
| g = 65% | −22% | −33% | −43% |
| g = 80% | −27% | −40% | −53% |

The evidence above puts *g* high — between about 55% and 70% — because the
commands a lane runs are seconds and its rows are minutes. So the expected
saving is **a fifth to a third of the wall clock**, not a halving. In calendar
terms, read off the trunk rather than off the rows: roughly **15 to 25 minutes
off a creature lane's 70 to 75**, and two or three off a median lane's seven.
It is worth having, and it is not the lever the tail is: it cannot touch lane
size, and it cannot be claimed without measuring.

**The owner decided on 16 September 2026 to leave it off**, and
`docs/decisions.md` #32 says why: the tail is worth more than the multiplier,
and the ledger it would have been measured with is not a clock. The arithmetic
above stands for whenever that is revisited. What follows was the plan for
measuring it and is kept because the shape of the test is the part worth
reusing.

**How it would be measured.** Add one line to each
`docs/time-log.md` entry — `Fast: yes` or `Fast: no` — run a week of lanes with
it on, and compare per-lane medians within a kind of lane (a creature lane
against a creature lane). Ten lanes each way settles it; arguing about it
settles nothing.

## What would take the minutes off, in order of the minutes

1. **Split a creature lane in two** — simulation half, look half, landed
   separately. Worth more than everything below it put together: the top 14%
   of lanes hold 38% of the time, and they are all of this kind.
2. **Meet the 250-line ceiling before the edit, not at the red check** — 375
   minutes of pure friction, flat across the whole week. Built:
   `tools/hooks/after-edit-size.ts`.
3. **Ask the open questions in one batch before the code**, which
   `docs/token-budget.md` already argues for cost and which buys wall clock
   for the same reason: each question is a round trip on a long conversation.
4. **One new fact, one table.** 165 minutes went on finding out one red test at
   a time that a creature's name lives in four places.
5. **Fast mode** was the fifth and is not on the list any more: the owner left
   it off on 16 September 2026 (`docs/decisions.md` #32). Its place is taken by
   **measuring the lane at all** — the elapsed stamp in `docs/queue.md` — which
   is what tells you whether 1 to 4 worked.

The first four shorten the lane whatever model is serving it, and the fifth is
how you find out that they did. A multiplier on the output would have been
worth a fifth of what is left; it was never worth as much as the work that
should not have been there in the first place.

The first is now a rule in `CLAUDE.md` with its cuts in the section above. The
rest are entries in `docs/queue.md`, written on 16 September 2026: the
line-ceiling hook, which is built and wired; the size paragraph in the prompt
`queue next` hands over; the four tables one fact has to enter; and the elapsed
stamp `bun run land` owes each entry. A fifth asked whether to measure fast
mode; it was answered the day it was written and is off the list.
