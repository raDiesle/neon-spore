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

The 250-line row is the same shape of problem with no fix yet, and it has not
moved at all. The ceiling is enforced by `packages/sim/test/limits.test.ts`,
which means it is discovered **when the check goes red**, with the change
already written across the file. One lane on 16 September spent 55 minutes of
friction, and five files over the ceiling in turn is most of it.

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
saving is **a fifth to a third of the wall clock**, not a halving, and it is
worth having: at 09-16's rate that is roughly 20 to 35 minutes off a
105-minute lane. It does not touch the tail that matters most, which is lane
size, and it cannot be claimed without measuring.

**So measure it.** The ledger is already the instrument. Add one line to each
`docs/time-log.md` entry — `Fast: yes` or `Fast: no` — run a week of lanes with
it on, and compare per-lane medians within a kind of lane (a creature lane
against a creature lane). Ten lanes each way settles it; arguing about it
settles nothing.

## What would take the minutes off, in order of the minutes

1. **Split a creature lane in two** — simulation half, look half, landed
   separately. Worth more than everything below it put together: the top 14%
   of lanes hold 38% of the time, and they are all of this kind.
2. **Meet the 250-line ceiling before the edit, not at the red check** — 375
   minutes of pure friction, flat across the whole week. `docs/queue.md` has
   the entry.
3. **Ask the open questions in one batch before the code**, which
   `docs/token-budget.md` already argues for cost and which buys wall clock
   for the same reason: each question is a round trip on a long conversation.
4. **One new fact, one table.** 165 minutes went on finding out one red test at
   a time that a creature's name lives in four places.
5. **Fast mode**, once 1–4 are true, for a further fifth to a third.

The first four shorten the lane whatever model is serving it; the fifth is a
multiplier on what is left. In that order they compound; in the other order the
multiplier is applied to work that should not have been there.
