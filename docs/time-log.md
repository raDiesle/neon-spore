# Where a session's time goes

Rough statistics, kept over days, so the bottlenecks in ordinary work become
visible. The owner asked for this on 10 September 2026: *"tasks take a lot of
time, I like to know the bottlenecks."*

**One `##` entry per lane**, written in the commit that lands it, with the
minutes read off commit timestamps, file modification times and the tools'
own durations — never instrumented, and rounded to five. The point is the
shape of the distribution across sessions, not precision. The rows are the
same every time so they can be compared:

- **reading** — finding the seam: the queue entry, the files it names, the
  pattern the last lane used, the docs.
- **writing** — code, tests, comments, candidates.
- **looking** — seeing the result: `versus:shot`, `bun run frames`, the
  browser pane, and the correcting that follows a picture.
- **friction** — commands that failed, hung or answered the wrong thing and
  had to be worked around or fixed before the work could go on.
- **landing** — `check:fast`, the commit, `bun run land`, and every rebase
  conflict or red full check between the first attempt and the trunk moving.

End each entry with the one bottleneck, in a sentence.

## 2026-09-10 · hit-looks — five creature slots answered

Five VERSUS slots taken into the game from one chat message, the looks he
wanted kept re-authored on the SHAPES page (three tails, two skins, one hit),
two op-count budgets remeasured. About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/versus.md`, the five slots' candidates, the tails/skins/hits registries |
| writing | 15 | four adoptions by tool and one by hand, six SHAPES entries, the record clean-ups |
| looking | 10 | `shapes:still` grew `tail:`, `tails`, `hit:` so the six could be seen; three rounds each |
| friction | 5 | `queue take` cannot claim an entry only in the lane's tree; a heredoc that swallowed three files |
| landing | 10 | two budget tables moved, `check:fast`, `land` |

Bottleneck: the SHAPES page had no terminal path to a tail or a hit, so half
the looking time went into building one before anything could be looked at.

## 2026-09-10 · claude/band-slot-after-ship-body

One question put to the owner and his answer written into the band's queue
entry, which now waits on `ship:body` instead of asking. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | the entry, re-filed as a task |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 0 | folded into the next landing's check |

Bottleneck: none worth naming.

## 2026-09-10 · claude/compaction-window-and-hook

The auto-compaction window set to 300k in `.claude/settings.json`, compact
instructions at the end of `CLAUDE.md`, and a `SessionStart(compact)` hook
that restates branch, queue and parked into the fresh context. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the Claude Code docs for the setting's real name, the existing hooks and their wiring test, the queue parser |
| writing | 10 | the hook, its test, the settings, the instructions, two docs |
| looking | 0 | nothing visible moved |
| friction | 5 | one combined command hung for two minutes and was re-run as separate steps |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — a setting's name has to come from the docs, not
from memory, before it can be written into a file every session reads.

## 2026-09-10 · claude/next-and-stop-in-chat

The convention for handing a session several independent tasks — a numbered
list worked in order, `NEXT:` to queue a task mid-turn, `STOP` to interrupt —
written into `CLAUDE.md` and `docs/working-with-claude.md`. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | one bullet, one section |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475 (second landing)

`docs/choosing-a-model.md` removed with its three pointers, and
`docs/token-budget.md` rewritten for the way the work is actually done: one
session on Opus 5, tasks in sequence, compaction at about 300k. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three files that pointed at the doc, the sessions memory |
| writing | 5 | the doc, three pointers, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** to speak of — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475

`CLAUDE.md` cut from 21.3 KB to 13.3 KB, a paragraph's headroom from its
ceiling, after the owner asked how to spend fewer tokens: the justifications
went back to the docs that already held them, the rarely-run scripts to a new
`docs/commands.md`, and the ceiling came down to 16 KB. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `CLAUDE.md` whole, `claude-md.test.ts`, the time log, `token-budget.md`, and each receiving doc to be sure it held what was being cut |
| writing | 10 | the file rewritten, `docs/commands.md`, two tests, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — checking that every sentence removed already lived
somewhere else, which is the only thing that makes removing it safe.

## 2026-09-10 · claude/queue-what-a-hit-on-a-slick-or-a-bulb-looks-like-is-sh

A hit record per kind, the transient that draws it, two poses, and six
candidates — three strikes for the slick and three for the bulb. About
50 min from the claim to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `body-interior.ts`, `debris.ts`, `effects-break.ts`, `effects-spark.ts`, the recoil lane's candidate shape, the break pose |
| writing | 15 | `body-hit.ts`, `body-strike.ts`, the debris and sparks routed through it, a test, `poses-struck.ts`, six paints and six cards |
| looking | 20 | twenty `versus:shot` runs at eight seconds each, and what each picture asked for — petals too small, a drip drawn as a disc, spores lost in the wedges, a wave four columns wide |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking**, again — but a shot is eight seconds now rather than
two minutes, so the cost was the number of corrections rather than the wait
for each, which is the right cost to be paying.

## 2026-09-10 · claude/queue-the-players-ship-has-had-one-hull-since-the-game

Two queue entries checked against what `main` already carries: the hull
entry was answered by `ship:body`, and the band entry cannot open while that
slot holds its fields. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue, `docs/versus.md`, `DECIDED.md`, `bun run versus`'s field lists, the five `ship:body` commit messages |
| writing | 5 | one entry removed, one re-filed with an `Asks:` line |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entries were written before `ship:body`
existed, so most of the lane was establishing that it is the answer to one
of them and the block on the other.

## 2026-09-10 · claude/queue-the-rind-and-the-lid-have-one-look-each-and-no-r

Three sheds and three bodies for THE RIND, three armours for THE LID, a hand
on the pose, and a pair that dropped half its events. About 2 h 35 min from
the first command to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue, `docs/versus.md`, the throb/crawler lane's shape, `rind-shed.ts`, `lid.ts`, the pose kit |
| writing | 50 | two look records and their shipped paint, `Pose.hand` and two poses, six candidates, then the `rind:body` seam and three more at the owner's asking |
| looking | 55 | fourteen `versus:shot` runs at two to three minutes each, reading each picture, and the tuning it asked for — POD's swing, IRIS's seam, FLAKES' colour, FACET's depth |
| friction | 20 | `--at` came back as prose (a wrong rectangle, read as a bug); the browser pane's screenshots timed out on the pair; no way to magnify a PNG already taken, so a throwaway script |
| landing | 15 | `check:fast` red on a file one line over; first `land` refused on four conflicts with thirteen commits landed meanwhile; second red on `docs/INDEX.md` rows; third landed |

Bottleneck: **looking**. A picture of one candidate costs two to three minutes
of director start-up and browser, and a candidate needs two or three pictures
before it is right — more than a third of the lane was waiting for
screenshots. The pair's own frame rate is not the cost; the start-up is.

## 2026-09-10 · claude/queue-bun-run-check-is-red-on-main-a-claim-the-shapes

A test that was green on Windows and red on Linux by the last digit of a
float, settled by saying what the sheet actually does. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `candidates.test.ts`, `drawn-size.ts`, `shape-fit.ts`, `drawn-size.test.ts`'s premise, the git log around dce50590 |
| writing | 5 | the two cases in `candidates.test.ts` and a paragraph in `drawn-size.ts` |
| looking | 0 | nothing visible moved |
| friction | 5 | the failure would not reproduce here — a scratch script at the root could not import `@neon-spore/content` and had to move inside the package |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entry named a red test that is green on this
machine, so most of the lane went into proving the diagnosis before the
three-line fix could be trusted.

## 2026-09-10 · claude/queue-bun-run-queue-take-cannot-write-its-taken-line-i

A claim written onto `main` in a clone that has nothing checked out on it.
About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `claim.ts`, `repo.ts`, `run.ts`, how `land` writes a note in a clone (`note-commit.ts`) and how it merges `docs/queue.md` (`queue-merge.ts`) |
| writing | 15 | `commitOnRef` through git plumbing, its clone-shaped test, two paragraphs of docs |
| looking | 0 | nothing visible moved |
| friction | 5 | a regex written through `sed` lost its backslashes twice; the third time it went through Python |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — deciding between the entry's two options took
finding that the landing already resolves the conflict the first one would
cause, which was in a file the entry did not name.

## 2026-09-10 · claude/queue-versus-pose-ts-is-at-the-line-ceiling-and-every

`SLOT_POSE` cut down to rows, each slot's reason moved onto the pose it names,
and a test that keeps the paragraphs from growing back. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `versus-pose.ts`, every `poses-*.ts` docstring the map pointed at, `limits.test.ts`, the scaffold's step four |
| writing | 10 | the rows-only map, one sentence on each of twenty poses, the test, the scaffold's wording |
| looking | 0 | nothing visible moved |
| friction | 5 | a heredoc that would not close on a quote inside the prose, moved to a script file; two escaped newlines the test file lost on the way in |
| landing | 5 | the director and versus tests, `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — twenty pose docstrings had to be read to know which
already argued for their slot and which did not, before a sentence could be
put on the ones that did not.

## 2026-09-10 · claude/queue-the-volley-and-the-veer-have-one-look-each-and-n

A look record each for THE VOLLEY's shell and THE VEER's rider, a pose each,
and three candidates apiece. About 1 h 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `volley.ts` and its seams and cracks, `veer-clown.ts` and the clown figure, `throb-look.ts` for the record shape, the depth skill, `versus/README.md`, the pose kit's hand |
| writing | 45 | two records and the shipped paint moved behind them, `VolleyShell.kept`, two poses and the volley's hand, six candidates, the ward test |
| looking | 15 | eight `versus:shot` runs at twelve seconds each; the pits made larger and more, the jester's horns widened into a V, the ember's scorch clipped to stone |
| friction | 10 | a heredoc that would not close, three times, on prose with quotes in it — moved to script files and to the Write tool; a `rm -rf` of the wrong glob that took six freshly written files with it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — six paints is six small programs, and each was
written against a picture of the shipped body taken first rather than blind,
which is what kept the looking short.
## 2026-09-10 · claude/queue-the-coil-and-the-tether-have-one-look-each-and-n

Two look records cut, three candidates each for THE COIL's chain and THE
WARDEN's rope, and a pose file for both. About 95 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `coil.ts`, `coil-jump.ts`, `tether.ts`, `clasp.ts`, `handle-draw.ts`, the sim's coil and rope rules, `carom-look.ts` as the pattern, the pose kit and three pose files, the depth skill |
| writing | 40 | `coil-look.ts`, `tether-look.ts`, the two call sites, six candidates with their paints, `poses-link.ts`, the rows |
| looking | 25 | nine `versus:shot` pictures with crops; the first coil pose collapsed its chain, the first bead answer put a dark blob on the rock and was replaced, the prongs read as Vs, the sinew's sheath filled as a chord |
| friction | 5 | no Python on this machine for a multi-file edit; a probe script at the root could not import `@neon-spore/sim` and moved inside the director |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — none of the four defects the pictures caught was
visible to `bun run check`, and each cost a shot, a crop and a re-shot; the
pose's chain in particular could only be timed by watching the beats print.

## 2026-09-10 · hit-looks

Every hit look on the VERSUS page put into the game, one body each, and both
slots closed. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the six candidates, `body-hit.ts`, `body-strike.ts`, which kills carry which kind (`wornKind`), the adopt tool |
| writing | 10 | the five moves, the seven records and `hitFor`, `of` on the kill event, the test, DECIDED |
| looking | 5 | four `bun run frames` strips to find the tick a bolt meets a bulb on wave 2; two perf runs |
| friction | 0 | no Python on this machine for the sim edit — sed did it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — photographing a kill means guessing the tick the
bolt lands on, and it took three strips of the wrong tick before one of the
right one.

## 2026-09-10 · hit-looks (second piece: the carom capsule)

FACET taken on as a space rescue capsule: three offered on its faces, one
picked in chat and shipped, the slot closed. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four carom candidates, `carom-look.ts`, `carom.ts`, the window, the adopt and by-hand tools |
| writing | 20 | `carom-facet.ts` and `carom-marks.ts`, three paints and their indexes, the by-hand take, DECIDED, INDEX |
| looking | 10 | three `versus:shot` pictures twice over with a strip tool written in the scratchpad, one game frame, one perf run |
| friction | 5 | a heredoc with a long file died in bash and was written with the tool instead; `adopt` refuses a slot whose travel is the shipped wedge, and `drop` needs the directories still there — the DECIDED entry was written by hand |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — three candidates that all wear four markings is
one base and two helper files before any of the three can be drawn.
