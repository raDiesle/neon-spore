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

## 2026-09-14 — queue-items — the board file joins the save token it was said to be in

Found while reading the save for the item before: `waves-acts.ts` said the
pinball board file was "read into the token and written on a save exactly
like an act", commit e14019fe's message said the same, and `wavesToken`
hashed the acts and nothing else — a board edited on disk under an open page
went under that page's next save. The board file is hashed now, both
comments say what is true, and a case in `wave-save.test.ts` changes the
copy's board file after the token is taken and expects the 409. The case
was run once against the old token to see it fail. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | read with the item before |
| writing | 5 | one line in the hash, two comments, one case |
| looking | 0 | — |
| friction | 5 | a `git checkout --` meant for a probe took the real edit with it |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was my own probe: reverting a file to prove the case bites
reverted the change under test as well, and it had to be made twice.

## 2026-09-14 — queue-items — the save test writes a copy of the act files, not the tree

Found by a red shard: `waves-memo.test.ts`'s "unchanged act files are read
once" failed under `check:fast` and passed alone, three runs out of four.
`wave-save.test.ts` was saving into the checked-in act files, and a shard
beside it hashed them between two of the writes. `shard.ts`'s premise — every
writer takes a `mkdtemp` of its own — now holds: `wavesToken`, `writeWaves`
and `saveWaves` take the set of files they work on, with the real tree as
the default, and the test copies the acts and the board file into a temp
tree with the repository's `biome.json`. Biome is spawned by path from the
repository's `node_modules` — `bun x biome` in a tree without one downloads
the package, ten seconds. A last case holds the real files' mtimes still
across a save. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the memo, the save, `shard.ts`'s premise, the token's history |
| writing | 10 | `WaveFiles`, the threading, the copied tree, seven cases |
| looking | 0 | — |
| friction | 5 | `bun x biome` from a temp tree downloading the package |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was reading: whether the race was the memo's or the save's
took the history of both files to settle.

## 2026-09-14 — queue-items — `next` and `take` refuse the entry the format test would

The fourth item this sitting queued for itself. `bun run queue` had listed an
87-character title under *Entries a cold session could not act on* and then
`take` claimed it without a word; the first `check:fast` after that failed on
the test that parses `docs/queue.md`, and the entry could not be retitled —
`done` and the `Taken:` line match by title. The per-entry checks are now
`problemsWith`, in a `problems.ts` of their own because `queue.ts` went past
250 lines carrying them, and `refuseUnlessWhole` says every problem before a
branch is made; `problemsIn` keeps only the duplicate-title check, which is
between two entries. Three cases beside the old ones. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | the lane's own finding |
| writing | 5 | `problemsWith`, the refusal, three cases, the split |
| looking | 0 | — |
| friction | 5 | the shell tool eating backslashes out of a heredoc, twice; the file-size test |
| landing | 5 | `check:fast` three times, `index`, the commit, `land` |

The bottleneck was the shell tool: a heredoc with an escaped newline in it
arrives with a real one, and the file has to be repaired with an editor.

## 2026-09-14 — queue-items — the port reader gets a test, and the test finds two holes

The lane before this one made `bun run frames` print the build's stderr when
`preview:once` died without a port, and nothing tested it: the loop lived
inside the function that spawns the real server. Lifted into `previewUrlFrom`,
given two streams, and tested with streams made from strings. The second case
written — a URL split across chunks — failed at once: the pattern took
`http://127.0.0.1:4` as the whole address when the pipe handed over a chunk
ending there, so the address now has to be followed by the ` — pid` the
server prints after it. And the thirty-second deadline was checked only
between reads, so a build printing nothing held `read()` open for as long
as it liked; the read is raced against the clock now, and the sixth case
holds it. One real frame taken through the changed reader. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `serve.ts`, `preview.ts`'s own line, `page-said.test.ts` for the idiom |
| writing | 10 | the lift, the race, the pattern, six cases |
| looking | 5 | one `frames` run against the real server |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was nothing in particular; the test paid for itself on its
second case.

## 2026-09-14 — queue-items — `isMount` is called where it was written out

The second item the dead-export scan queued: `gyre.ts` exported `isMount`
with a paragraph on why the kind is the whole of the test, and both places
that needed it — the beat's fall loop and `wornKind` — tested `c.kind` by
hand instead. Both call it now, and `COPIES` has the row, so a third copy
fails `copies.test.ts`. The row's first pattern caught `kinds.ts`'s per-kind
fall table, which tests a bare `kind` beside `"gyre"` and `"wisp"` and is the
table describing every kind rather than this rule again; the pattern is a
body's `c.kind` now, which is the shape both copies had. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | found in the item before |
| writing | 5 | two calls, one import, one row and its comment |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 5 | the edit hook's own run of the table, `check:fast`, the commit, `land` |

The bottleneck was the table's pattern, which had to say which of the two
shapes of the same words is the rule.

## 2026-09-14 — queue-items — a second `PANEL_PLAN` and three dead exports gone

The queue was empty, so the tree was scanned for exports referenced from no
other file — a short script over every `.ts` under `packages`, `apps` and
`tools`, tests included — and the five hits that were used nowhere at all
were read in place. Three were plain dead code (`crawlerHead`,
`wispNextIndex`, `pulseLaneTint`); one was a second copy of the panel's
arrangement in `ship-gland.ts`, left from the day GLAND was taken in by hand
and drawn by nothing; the fifth, `isMount`, turned out to have two
hand-written twins and became its own queue item. Both were queued in this
tree and the first was drained. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the scan, `git grep` for each name, `f1104684` for where the copy came from |
| writing | 5 | four deletions and one comment |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was the reading: telling a dead export from one exported on
purpose for its type takes a look at each, and there were three hundred of
the second kind for five of the first.

## 2026-09-14 — queue-items — HANDOVER · HULL watched over one exchange

The second unverified entry: whether the two lobes trading height on the hull
read as the ship handing the panels over, or as one signal too many over a
band that has already changed colour. Eight real frames of THE HANDOVER on
the navigator's seat, thirty-eight ticks apart from the first beat of the
hold — one turn of the four-beat exchange — and the hull band of four of them
magnified; one frame of the pilot's seat at the same beat for the skin. The
right lobe stands, the two meet at one height a beat later, the left stands a
beat after that, and the whole thing is under a tile high beside the
countdown plate: it reads as the ship breathing the trade rather than as a
fourth voice, and on the pilot's phone it is amber with the rest of that ship.
Nothing changed in code. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `handover-hull.ts`, THE HANDOVER's `at` and `beats`, the frames tool's `--fault` and `--stride` |
| writing | 0 | nothing |
| looking | 10 | two `frames` runs, five crops |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was the looking, which is what the entry was.

## 2026-09-14 — queue-items — THE LEAK watched, and the picture it needed

The first of the two unverified entries a cloud session left: whether a pair
can cross the field on THE LEAK and take three bodies at the far wall before
they land, with no lance. Answered two ways. A probe (`tools/probe/scratch`,
not kept) played the wave with a scripted pair whose pilot arrives late and
whose navigator taps slowly: a body falls a row a beat over fifteen rows, so
the far column has about fourteen beats from its first body to its landing,
and a pilot six beats late with a navigator tapping every two beats still
takes all sixteen. Then a real strip of frames at the second figure, the three
red standing in column eight with the cannon still at column three — the
crossing the entry asked about. The frame-cost half of the entry is not owed:
a lane never runs `perf`, and the baseline tolerates a row it has never seen.
The one thing fixed: `bun run frames` in a worktree without its `bun install`
died with "preview:once exited before printing its port" and nothing else,
and the build's own "Could not resolve @firebase/app" was on a stderr nobody
read; `startPreview` now puts that stderr's tail in the error. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `act-9.ts`, the fault's row, `commands.ts` for what a cannon move costs (nothing — the column is a jump), the probe rig |
| writing | 10 | two probes, the stderr line in `tools/frames/serve.ts` |
| looking | 10 | the frames strip at beat 12, the p1 seat |
| friction | 5 | `frames` failed twice before `bun install` in this worktree explained it |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was the tool hiding the reason it stopped: the answer to the
entry took a ten-line probe, and the picture took three runs.

## 2026-09-14 — queue-tasks — the stale mark stops firing on the trunk's ledgers

Found while confirming the queue held nothing a cloud session could work: both
remaining entries were marked stale against a commit of this session's own that
had touched none of their code. `staleness` asked git for the newest commit on
*every* file an entry names, and both name `docs/queue.md`, `docs/time-log.md`
and `docs/INDEX.md` — files every landing writes by rule, a time-log row being
required of each lane and a queue claim of each. So an entry naming one was
stale from the next landing onward, permanently. `BOOKKEEPING` now takes those
out before the log is asked, unless they are all an entry has, in which case
they are what it is judged on. The marks on the two live entries did not go
away — both are genuinely stale — but they now name the commit that touched the
wave and the handover rather than one that wrote a release note. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `stale.ts`, the two entries' `Files:` lines, and the git log that proved the flagged commit touched none of their subject |
| writing | 15 | `BOOKKEEPING`, `substantive`, four fixture entries, a ledger-only commit in the fixture repo, four tests |
| looking | 0 | nothing drawn |
| friction | 5 | the fixture's new commit moved `main`'s head, so an existing assertion comparing against `rev-parse main` had to name the code commit instead; biome reflowed an import |
| landing | 5 | the two new tests run against a reverted `stale.ts` to prove they fail, `check:fast`, the commit, `land` |

The bottleneck was proof rather than code: the fix is two small functions, and
the work was showing the tests go red without it and that the marks left on the
real queue are true ones.

## 2026-09-14 — queue-tasks — the blanking pass leaves `perf`

The queue item this lane's own predecessor wrote, and the owner left the choice
of the three ways out to the lane. Picked the second: `fillUnmeasured`'s writing
half moved from `bun run perf --unmeasured` to `bun run baseline:blank`
(`tools/perf/blank.ts`), because the rule that closed it to cloud sessions is
about a measuring run that never finishes honestly on a runner, and this
operation opens no browser, takes no reading, and can only blank a row whose
figures already describe a wave that does not exist. The flag is gone rather
than kept beside it — leaving it reachable under a name spelled `perf` is what
made the item — and typing the old thing now prints where it went before any
browser starts. The director's `MARK_ARGS` moved with it, under a new test that
the script it names is a file that exists. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the item's three options, `perf/run.ts`'s flag branch, `waves-baseline.ts`'s spawn, every live mention of the old flag |
| writing | 20 | `blank.ts`, the redirect stub, the script entry, the existence guard, and six documents |
| looking | 0 | nothing drawn |
| friction | 5 | biome caught an `import type` and a long line the first check:fast; `bun run index` wanted a line written for the new file by hand |
| landing | 10 | `check:fast` twice, `bun run index`, the commit, `land` |

The bottleneck was the documents, not the code: the move itself is one file and
one script entry, and six places across `docs/` and `CLAUDE.md` asserted the old
command — three of which had been written earlier the same day by the lane
before this one.

## 2026-09-14 — queue-tasks — the baseline tolerates a wave it has never seen

Queue item that asked the owner a question, so the turn began by putting it to
him: should `bun run land` write the unmeasured rows, or should the baseline
test stop requiring a row for a wave it has never seen? He picked the second.
`baseline.test.ts` now matches rows to waves by `id` rather than by their place
in the array — which is what lets the file be missing one without every row
after the gap reading as the wrong wave — and three new tests say the gap is
tolerated, reported as `new`, and moves nobody else's verdict. The prose that
asserted the old rule was in six places. Found on the way: the *stale row* case
is still closed to a cloud session, and is queued. About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `baseline.test.ts`, `unmeasured.ts`, `shape.ts`, `compare.ts`, `land/run.ts`, the new-wave skill |
| writing | 20 | the id lookup, three tests, and six sites of prose — `performance.md`, `cloud-session.md`, `CLAUDE.md`, two code comments, the new queue entry |
| looking | 0 | nothing drawn |
| friction | 5 | the first gap test dropped the baseline's last row, which is THE LEAK's unmeasured one, so it read `unmeasured` before it could read the absence |
| landing | 5 | `bun test tools/perf tools/director`, the typecheck, `check:fast` |

The bottleneck was reading: the decision itself was one sentence, but knowing
which of the two options was honest meant tracing how `land` orders its check
against its writes, and that is what turned up the wrinkle the queue entry had
wrong.

## 2026-09-12 — relay-dev-kill — stopping `dev.ts` stops the wrangler under it

Queue item from the lane before: killing `apps/server/dev.ts` left wrangler
and two `workerd` running. `dev.ts` now spawns wrangler's own `cli.js` under
`node` as a direct child, no `npx` and no shell between, and forwards a stop;
a test starts the relay on a free port, kills the tree and finds the port
silent. Along the way the other half of the orphan turned out to be Git
Bash's `$!` being an MSYS pid, which a `taskkill /T` cannot walk — written
into the net-change skill. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `dev.ts`, wrangler's bin shim, `test/relay.ts`, the existing server tests |
| writing | 5 | the spawn, two exported helpers, the test, the skill paragraph |
| looking | 0 | a probe script's own lines |
| friction | 5 | one URL segment wrong in the `cli.js` path; a tree kill on an MSYS pid that left `workerd` up again |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: friction — finding out which pid a tree kill needs on Windows.

## 2026-09-12 — relay-verified — the reconnect, against a real Durable Object

Queue item: the two scheduler tests' reconnect was unverified against a real
relay. A wrangler was started on this tree's port and all four
`relay:check`s run against it — plain, `--split`, `--full`, `--rejoin` — in
one foreground script that killed the wrangler at the end. All four held:
in step, the split caught at tick 300, the third device told the room is full,
and the dropped seat came back in step. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the net-change skill, `apps/server/dev.ts` |
| writing | 0 | nothing — a verification |
| looking | 0 | the checks' own lines |
| friction | 5 | the tree kill left wrangler's node and two `workerd` alive; found and killed by pid, queued |
| landing | 0 | one commit of two documents, `bun run land --keep` |

Bottleneck: friction — stopping wrangler cleanly took longer than running the
four checks.

## 2026-09-12 — director-here — a worktree's director from a session opened in the main checkout

Queue item: `preview_start` started the main checkout's director from a
worktree. A probe launched through `.claude/launch.json` showed the harness
starts an entry in the directory the *session* opened in — right for a
session opened in its worktree, wrong for one that made the worktree after
opening in `main`. So: `bun run here` writes the tree to serve into the git
directory every checkout shares, `supervise.ts --here` binds to it, and
`director-here` is the launch entry. Checked live: its log's `editing` line
named this worktree. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `supervise.ts`, `tree-moves.ts`, the lane skill, what the harness passes a launched process |
| writing | 5 | `here.ts`, the flag, two scripts, the entry, seven tests, the skill and commands docs |
| looking | 0 | the server's own log line, not a picture |
| friction | 0 | one lint warning for a comma operator |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — one probe launch answered the question the queue item
guessed at (where the harness starts a process), and the design followed from
the answer.

## 2026-09-12 — copies-sweep — seven rules the simulation owned were written out again elsewhere

Queue item: nothing had swept for a re-derived rule since the copies table
reached 46 rows. One grep per config field that a second package reads found
seven — the tempo as seconds (fifteen copies across four packages), the tempo
as ticks, the fault's firing beat, SNAKE's trigger rest, the pinball lane's
floor, THE GAUGE's clock and the countdown's slots. Each got the function in
`sim`, its callers, and a row in `copies-table.ts`; the table is 53 rows.
About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the config fields render, content, audio and the director read; which barrel exports each module |
| writing | 5 | seven helpers, thirty-six files converted by one script, seven rows |
| looking | 0 | nothing drawn changed |
| friction | 0 | a heredoc turned a regex's backslash-n into a newline — one retry |
| landing | 5 | the copies test, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — finding which of five barrels a new sim export has to
be threaded through takes longer than writing the export.

## 2026-09-12 — path-text-sweep — the rest of render's contours reach the canvas as numbers

Queue item: fifty-six render call sites still built a `Path2D` from spline
text. Forty-five went mechanically to `splinePath` (a balanced-paren rewrite,
one script), the odd ones by hand — the warden's two loops on one path, the
shell's sealed piece, the queen's mark outline returning a path and its
points — and a test now refuses a new text caller outside a one-file allow
list. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the fifty-six sites, which are regular and which are not, the mark outline's test |
| writing | 10 | the rewrite script, six hand cases, `path-text.test.ts`, three stale comments, `docs/performance.md` |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 5 | render, shape-sheet and director tests, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: none worth the name — the sweep was mechanical once the first
round had settled the forms.

## 2026-09-12 — bosses-page-summary — the NOT BUILT YET boss page, cut to what fits

Owner's ask: drastically summarise the boss page's ideas — no names or shapes
talk, nothing that duplicates a built thing, nothing counted on the beat, the
gestures and control splits kept. `ideas.md`'s Bosses went from five entries to
four (THE VANE is built) and Rounds from fifteen to seven, each a few lines
with what each seat's screen shows; the two director tests that join a drawn
shape to an idea now read the act order too, so a built boss's bullet can go.
About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two sections, the director's parser, which names the drafts and scenes are joined to |
| writing | 5 | the two sections rewritten; `party-games.md`'s promotion paragraph |
| looking | 0 | — |
| friction | 5 | THE VANE's cut broke the shape join twice — the act order hides a built row — until the join read the roster |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: the bold names are load-bearing — the director parses them and
five drafts point at them — so the summary keeps them as handles where the
owner asked for none.

## 2026-09-12 — render-test-time — two fifths of a drawn frame was text

Queue item: `packages/render` was seventy per cent of the suite's cost, and
its top four cases were `briefing.test.ts`'s walks, already thinned to every
tick once. A CPU profile of one walk found four seconds of ten in `toFixed`
and `curveText` — the band and the maw building SVG path strings that
`new Path2D` parsed straight back. Those callers now write their contours
into a `Path2D` as numbers through `spline.ts`; a drawn frame went from
1.14 ms to 0.63 ms, `briefing.test.ts` from 53.8 s to 29.5 s, the suite from
273 s to 222 s of cost. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `test:profile` twice, the walk under `--cpu-prof`, the eight hot callers and `spline.ts` |
| writing | 5 | `splineSealedInto`, `tubeInto`, `blobPoints`, twelve call sites, `docs/performance.md`, the queue item for the fifty-six left |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 10 | render and content tests, `test:profile` after, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: the profile — three runs of the whole suite at four minutes each,
before, after, and once more for the header the first `--top` cut off.

## 2026-09-12 — wave-boundary — two devices cross a wave boundary in step

Queue item: the two-device wave test stopped on the `needWave` that ends
FIRST STEP, exactly where the host takes over. It now answers the event the
way `waves.ts` does — the same calls into `content`, on the tick it arrived,
on both devices — plays CYAN through on presses counted from the tick the
wave opened, and keeps the fingerprints crossing over the seam. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `waves.ts`'s `open` and `handle`, the test's loop, CYAN as `buildQueue` maps it |
| writing | 5 | the test: `openNext`, presses by wave, the boundary branch, the assertions |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was none: the test passed on the first run.

## 2026-09-12 — opening-lockstep — a wave's opening put through the scheduler

Queue item: `briefings` is off in `DEFAULT_CONFIG`, so no two-device test had
ever sent an opening over the wire. `two-devices-opening.test.ts` plays three
— the introduction and its two acks, a stepped guide paged at each seat's own
speed with a lifted thumb emptying a circle, and a prose guide through the
gate and then the introduction — with a different delay in each hand, and
asserts both devices leave each state on the same tick, after the slower
hand's word, with the fingerprints equal on every tick between. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `briefing.ts`, `ready-gate.ts`, `guide-steps.ts`, `step.ts`'s opening branch, the two sibling tests' loops |
| writing | 5 | the test file, `relay.ts`'s note |
| looking | 0 | nothing drawn |
| friction | 0 | one run too short for the first body at 120 Hz — lengthened, not a workaround |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was reading three files to learn what a `brief` press does on
each of the three states before the first press could be scripted.

## 2026-09-12 — lockstep-transport — the scheduler says what it rests on

Queue item: the one assumption delayed lockstep cannot check — that a frame is
never lost while the `confirm` behind it arrives — was written only on a test's
wire. It is a paragraph in `lockstep.ts`'s header now and the fifth rule of the
`net-change` skill, and the header's growth pushed the file over 250 lines, so
`LockstepOptions` and the ahead limit moved to `lockstep-options.ts`. About
10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the header, `receive` and `pump`, the test's comment on the lost frame, the skill's rules |
| writing | 5 | the paragraph, the rule, the split, the INDEX row |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the line limit: a documentation paragraph cost a file split.

## 2026-09-12 — tunables-doc — every field of SimConfig named in a sheet

Queue item, claimed with `bun run queue take 1`, answered by the owner with
*only the feel numbers*: the 105 fields still on the doc-drift allowlist each
get one sentence in the sheet that describes the thing they are a dial for —
the bosses' in `bosses.md` (with a short section for THE MAZE, which had
none), the rounds' in `interludes.md`, the creatures' in `bestiary.md` under a
new heading, the shot box and the pod's in `systems.md`, depth in
`graphics.md`. The allowlist is empty and deleted, and the test now simply
fails on any `SimConfig` field no document names. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the allowlist, the doc comment of each of the 105 fields across 25 `config-*.ts` files, and where each sheet's sections end |
| writing | 10 | 279 lines of prose across five sheets, from one script; the test's header and second `it` |
| looking | 0 | nothing drawn |
| friction | 5 | the script's anchors and backslashes: three reruns for a `---` that was my own separator, a `
` that the patch turned into a real newline, and a `\b` that came out single |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was patching the patch script rather than writing the prose:
each of the three reruns cost a round trip that a first look at the anchor
lines would have saved.

## 2026-09-12 — rounds-verdict — the rounds' own second try comes out

Queue item, claimed with `bun run queue take 1`: since a hit fails the wave
and the host opens it again from the top, THE MAZE's rebuilt stage, SNAKE's
attempt started over after a pause, and THE MIRROR's same-round-again all ran
after their hit and so never ran in the game — the tests reached them only by
holding the hull. A lost stage is now the round's verdict and nothing after
it: the snake's crash is a verdict like its clock, the body stays where it
stopped and the picture keeps the bump but not the return, `repeats`, the
stun and its number are gone, and a lost maze or mirror comes off the world
once its verdict has stood, which is what a held hull sees. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three rounds' verdict paths, `wave-fail.ts` and `step.ts` for where the hold cuts in, and every reader of the snake's crash state in render |
| writing | 20 | `snake-move.ts`, `snake.ts`, `snake-open.ts`, `snake-arena.ts`, `snake-hash.ts`, `config-snake.ts`, `maze-verdict.ts`, `mirror-round.ts`; render's `snake-crash.ts`, `snake-round.ts`, `snake-panel.ts`; the three test files rewritten to say the verdict and the retry |
| looking | 0 | nothing visible moved that a still frame would show: the snake's bump is the same bump, one frame of a held field |
| friction | 5 | one tick off in a new test's expectation |
| landing | 5 | `check:fast`, the queue's done, the commit, `bun run land` |

Bottleneck: the render side — the queue item named sim files only, but the
snake's stun number and its ghost body were read by three drawing files, and
the return-to-start picture was the second try drawn, so it had to go too.

## 2026-09-12 · choke-fault — THE CHOKE becomes the steer fault

The owner's mid-turn ask: *"Choke" enemy should be same kind of control set
modifier, I guess, no brush.* Two forks asked first — the whole wave with no
tap-off, and the emitter and beam only, no strand — then the body came out:
the kind off the roster (argued in the roster comment and decision #31), its
three events, crawl, strand, silhouette, drag target, brush, field-control
row, pose, sounds and eight tests, and a third `Malfunction` kind `steer`
went in with a stateless triangle walk, a beam end on the strip's node, the
loops kept on the swelling and the node, a wave rewritten with targets timed
against the walk, and the tap-off parked on the NOT BUILT YET page. About
60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | every file with `choke` in it — fifty-odd across six packages and three tools — and where the faults' beam, dead-button and picker logic live |
| writing | 30 | `sim/malfunction.ts`'s `steer` branch; `render/choke-hull.ts`, `fault-beam-ends.ts` and the strip; content's tables and the wave; the director's picker, groups and notes; the docs and the decision |
| looking | 5 | two frames, one per seat — the second showed the beam missing on player 2's screen, which was wrong, since both seats see the cannon on the hull |
| friction | 10 | three scripts that stopped on their own assertions after half their edits had applied and had to be resumed by hand; a sound the clingers played that no listed wiring file read |
| landing | 5 | `check:fast`, the index rows, the commit, `bun run land` |

Bottleneck: the removal, not the addition — a body that landed yesterday had
already been named in fifty files, and every one of them had to be read to
know which mentioned a thing that still exists.

## 2026-09-12 · malfunction B — THE LIMPET and THE LEECH

The second piece of the malfunction task: a body that falls to the shield
and cannot be evaded, and its twin on the cannon. Each takes hold of its
control and runs a fuse while the control stands still — five beats and a
heavy hit on the hull, or eight moves and it lets go — and only the seat
without the control is shown the fuse, so *move* has to be said. Two waves
with guides, six tables, a replay test for both, a frame test on every
seat, the director's brush notes, sheet paragraphs and a pose sheet. About
45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE CHOKE's route through sim, render, content, audio and the director; who moves which control |
| writing | 20 | `sim/cling.ts` and its config, events, state and hash; `render/cling.ts` and `cling-fuse.ts`; the waves; the tests; the director sheets |
| looking | 10 | two frames — the first lost the wave to a rock, because a wave's columns are authored on seven lanes and land on eleven |
| friction | 5 | the group-name union, three golden counts and two file ceilings, each found by a different test |
| landing | 5 | the suites, the index, the commit, `land --keep` |

Bottleneck: **writing** — six tables and four packages is what a creature
costs here, and the skill says so; the only surprise was the authoring
column map, found by a probe rather than by reading.

## 2026-09-12 · malfunction A — a fault has a visible cause

The first piece of the owner's rule *whenever there is a malfunction there
must be an indication and a visible cause*: THE JAM and THE COIL get an
emitter hanging from the top of the field from the first frame, and a beam
from it to what the fault has taken on each screen — steady on the held
trigger, flashing in the next shot's colour on the runaway gun. The guides
and the mechanic rows name it; the cannon row also stops describing the
brake that came out on 6 September. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two passes, where the band's circles come from, which seat holds GUARD and which the colours, the LANTERN recipe |
| writing | 5 | `fault-emitter.ts`, the two call sites, the guides, the mechanic rows, the bestiary |
| looking | 5 | four frames — the beam too thin at first, both colour lobes equally bright, the emitter under the test view's header |
| friction | 0 | — |
| landing | 5 | render and content tests, the index row, the commit, `land --keep` |

Bottleneck: **looking** — a beam that read as a wire at phone size, widened
twice, and the unloaded colour's beam made a thread so the next shot can be
read off it.

## 2026-09-12 · iris-in — THE COUNT wears IRIS; DIAL and FUSE to the SHAPES page

The owner's decision on `creature:countdown`. `bun run versus adopt` took
both function fields in one go; DIAL and FUSE were copied into render first
so the slot's removal did not take them, and the LIBRARY got a stage that
makes the field's three calls with a look handed in, and four cards: IRIS,
NOTCHES, DIAL, FUSE, counting down together. The count's words — guide,
blurb, mechanic, bestiary — say blades and an eye now, and the wave where
they said the hull. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | how a slot is adopted, how the volley's kept looks reached the LIBRARY, what the field's countdown row does |
| writing | 5 | two kept files, the adopt, the stage and the assets, the exports, the text sweep |
| looking | 0 | one frame of THE COUNT on the pilot's screen, sent |
| friction | 0 | `adopt` handled two fields from one file first time |
| landing | 5 | render tests, the index rows, the commit, `land --keep` |

Bottleneck: **reading** — finding that the LIBRARY, not the shape sheet's
drafts, is where a kept canvas look goes.

## 2026-09-12 · score-out — there is no point score; a run is its clock and its retries

The last piece of the owner's rule. `World.score`, the fifty-one places that
paid it and the `score*` prices come out; the balance sheet leads with the
clock, then the retries and the waves; the intro says `TRY n` on a retry;
the room and the menu remember a run as *wave · time · retries*
(`RunMark`, protocol 2, the tally taken whole). About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | who paid the score (51 sites, 8 config files), what the room's tally did field by field and why whole is right once the clock travels with the wave |
| writing | 5 | four scripts across sim, render, net, server, game, director and the tests; the NOT BUILT YET note and §7.2 |
| looking | 0 | the sheet's headline and clock are the owner's asked-for look; not drawn for an eye this lane |
| friction | 5 | a script asserted on an `import` where the file had `import type`; `RunMark` not exported from the package; three test files rewritten by hand for the three-field mark |
| landing | 5 | `check:fast`, the index rows, the commit, `land --keep` |

Bottleneck: **reading** — deciding the tally's order (wave, then retries,
then time) and what an old-wire room should still be able to say.

## 2026-09-12 · hull-out — the hull has no points, and a pod is taken or the wave is lost

The second piece of the owner's rule. `World.hullMilli`, the bar, the
regeneration, the twenty-three `damage*` fields and the mend pod come out;
a breach carries a **weight** (heavy or light, `impact.ts`) that picks the
sound and nothing else. On the owner's two answers a pod not taken in fails
the wave and a pod still hanging holds it open, and every pod names its
cargo — PURGE or WARD — so eight waves and scenes that sent a plain pod now
send one of those. Eleven guide captions were retargeted from the bar to the
retries line. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | who read `hullMilli` and `damage*` (166 files), how the mirror's own hull dims the rim, what a director brush knows about a pod |
| writing | 15 | five scripts across sim, render, content, audio, director and eighty test files; the NOT BUILT YET note and four spec sections |
| looking | 0 | the bar is gone from the corner and the run line stands where it was; nothing new drawn |
| friction | 5 | `hull.ts` landed one line over the limit after the rim's alpha came back for THE MIRROR; a `mend → ward` sweep turned the *without a ward* test into one with a ward |
| landing | 10 | `check:fast`, the index rows, the audio doc's counts, the commit, `land --keep` |

Bottleneck: **writing** — the number of places that named a hull point, more
than the difficulty of any of them.

## 2026-09-12 · wave-fail — a hit fails the wave, and the run is a clock and a count

The owner's rule, put in as a mechanic: every hull damage fails the wave, the
field holds where it was struck for `waveFailBeats`, and the same wave is
asked for again (`needWave` with `retry`). The run keeps `playTicks` and
`retries` (both in the hash), the HUD's corner reads `3:42 · 2 RETRIES`
where the points were, and the run ends after the last authored wave — the
seeded filler waves past it are gone. `applyHullDamage` no longer drains a
point; the hull's figure, bar, regeneration, mend pod and score come out in
the next lane. Fifty-six sim tests read the hull's points as their tell for a
hit and now read `retries`; the ones about what a round does *after* a hit
hold the hull with `hullInvulnerable`. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | every path into `applyHullDamage`, how the opening hold shapes `step`, who hosts `needWave` (game, replay, director), what a rehearsal does with a hit |
| writing | 35 | `wave-fail.ts` and `config-run.ts`, the step hold, the host's retry and finish line, the HUD line, the sound, and the test rewrite across 30 files |
| looking | 0 | nothing visible moved that a frame would show — the corner's text, and the field standing still |
| friction | 15 | the mechanical `hullMilli → retries` pass hit THE MIRROR's own hull; five round tests froze at their hit and had to be read one by one to see which were about the price and which about what comes after |
| landing | 10 | `check:fast`, the index rows, the spec note, the queue item, the commit, `land --keep` |

Bottleneck: **writing** — a fact fifty-six tests read off one number, and
each had to be reread to say whether it asserted the price or the play that
followed it.

## 2026-09-12 · guide-layout — no caption over the rail, a band two tiles shorter, a lower tutorial bar

Three things the owner asked for by name. The strip's caption
(`PLAYER 2 · SHIELD`) is gone from `gland-fluid.ts` — the cord's colour says
which control it is, and a band names nothing of the game's construction.
The solo band is two tiles shorter at phone size (`bandSoloPct` 27 → 19):
the buttons and the rail are capped by the width there and keep their size,
so what went was the flesh above and below the rail. The tutorial's bar is
86 px instead of 118 (`guide-nav.ts`), buttons 46 tall, the dots closer to
its rim. Three tests read the caption as their tell for which strips a
screen drew; they read the strip's draw now (`stripsDrawn` in the harness).
About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | where the caption is painted, how the band's height reaches the rows and radii, what the nav bar's geometry is and who hit-tests it, the three tests that read the caption |
| writing | 10 | the caption out, the share, the bar, the harness helper and the three tests on it |
| looking | 5 | the guide page rendered before and after |
| friction | 5 | the bake-count rows moved by one on each seat — at the harness's stage the shorter band turns a height-limited field into a width-limited one and a halo loses a size of its own — found by running the old share against the new |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the caption had become the tell in three tests for
which panel a screen drew, and a replacement tell had to be one every strip
goes through.

## 2026-09-12 · trim-guides — a guided wave carries its lesson and nothing else

The owner's rule for the wave the pair plays: only the enemies the lesson
needs and no other kind — rocks and every special kind that are not the
lesson go, plain slicks stay only where the lesson needs a target, at the
fewest. Thirty-two guided waves trimmed, 90 entries out; a stray rock was on
most of them. `guided-entries.test.ts` holds it: a kind on a guided wave is
the one it introduces or one a table says the lesson keeps, with the reason
(THE VANE's rocks, THE JAM's lures, the fence waves' wire). The perf
baseline's rows for those waves were figures for waves that no longer exist;
`bun run perf --unmeasured` now blanks such a row instead of asking a lane
for the run it never owes. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | every guided wave's entries by kind and its guide, to say for each which bodies the lesson needs |
| writing | 15 | the trim as one script over the act files, the test and its table; `--unmeasured` blanking a row whose wave changed |
| looking | 0 | — |
| friction | 5 | the director's save test round-trips the act files on disk and went red once against a hand-trimmed single-entry list it then wrote canonical |
| landing | 10 | `check:fast`, the commit, a red `land` on twenty-eight stale baseline rows, the second commit, `land --keep` |

Bottleneck: **reading** — whether a slick is a target the lesson needs or
padding is a sentence per wave, and there were thirty-two.

## 2026-09-12 · room-tests — the room tests wait for what they read, and `check:fast` reaches them

Two landings went red on `apps/server/test/room.test.ts` for lanes that had
not touched it. Why it races under a full shard run and not alone: eight
`bun test` processes on a CPU capped at half starve workerd and the test
process both, so a 60 ms quiet interval is no longer a round trip, a
count-based wait is satisfied by the `ready` a join sends before the one the
press sends, and a 150 ms silence window is crossed by the wall clock between
two lines of a test. Every bare `settle()` before a read is gone — a wait on
the message itself (`settle("welcome", (w) => w.startMs > 0)`), or a ping
fenced by its pong where the assertion is that nothing came; the shortened
windows are one 600 ms figure and the arrivals ask whether it has passed.
`tools/hooks/scope.ts` names `apps/server` for a change to `packages/net`,
`apps/server`, the game's `link*.ts` or `relay.ts`. Five green
`shard.ts room` runs in a row. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `room.test.ts`, the three commits that had widened it, `room.ts`, `seat.ts`, `start-gate.ts` for what a join and a press actually send; `scope.ts`, `fast-scope.ts` |
| writing | 15 | the `settle` predicate and the `caughtUp` fence, twenty waits named or fenced, `arriveUntil` for the two window tests, the two scope rows and their tests |
| looking | 0 | — |
| friction | 5 | a quoted heredoc the shell would not close — the script went through the editor tool instead |
| landing | 5 | `shard.ts room` five times, `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a join to a full room sends a `welcome` *and* a
`ready`, and every count-based wait had to be re-read against that.

## 2026-09-12 · queue-stale — `bun run queue` says when an entry has gone stale

The owner, reading this log: the most frequent bottleneck is reading, and
half of it is an entry the tree moved out from under. The listing now marks
an entry `stale` when a file its `Files:` line names was changed on `main`
after the entry's date — with the commit's sha and subject — or is not on
`main` at all; the prompt from `queue next` opens with the same line. About
10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | `queue.ts`, `run.ts`, `repo.ts`, the ref-commit test's fixture |
| writing | 5 | `stale.ts`, its test against a fixture repository, two lines in the listing and the prompt, the preamble sentence |
| looking | 0 | `bun run queue` on the empty queue |
| friction | 5 | backslashes halved on the way into the shell, twice — the glob became a matcher without any |
| landing | 0 | `check:fast` once, green |

The bottleneck was friction: a regular expression with escapes in it does
not survive the tool's shell, and the fix was to write the glob match
without one.

## 2026-09-12 · hit-looks — a page about a body holds with it in the middle of the field

The owner: *when tutorials stop, the explained enemy should be around the
middle of the screen, not the top.* Every film's first page turned four
beats in with its body on row two or three. Now a body page holds with the
body no higher than row six (`scene-pages.test.ts`), which retimed
twenty-eight films — the body page lengthened, every later press kept a
beat and a half after its page opens where the fall left room, kills kept
before the hull, second arrivals moved after the first body's hold. THE
ECHO became one long first page, THE WISP holds after its first hop, THE
LANCE's cannon page moved in front of its body page, THE CROSSING's second
rock crosses on row six. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | every film's steps and acts, the sim's rules for the gyre, the wisp, the echo, the coil |
| writing | 30 | twenty-eight scene files, the test, the hit pop's floor |
| looking | 5 | `film.ts` per film after each edit, one real frame of FIRST STEP |
| friction | 5 | four last pages a tick short of 1.5 s, a NaN in the hit pop when a body is taken below the ship's skin |
| landing | 5 | `check:fast` twice — THE CROSSING's last page was the second red |

The bottleneck was writing: each film has its own clock, and the ones with a
route of their own — the gyre's walk, the wisp's hops, the echo's divisions,
the lance's three-beat fill — needed a probe run before a tick could be
chosen.

## 2026-09-12 · hit-looks — THE VOLLEY's gap is a cutaway planet

The owner: *make the volley look inside like a full solid planet with a
core in colour, so 3D — right now it is flat, like you cut a quarter of a
planet.* A look asked for by name, so it went straight onto the field:
`volley-cut.ts` paints the strata and the two cut faces in the sector a
ward has taken, and the LIBRARY card now draws the game's own core instead
of the living slick. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `volley.ts`, `volley-core.ts`, `volley-stone.ts`, EMBER, the library stage |
| writing | 5 | `volley-cut.ts`, `volleyGap`, the card's switch to `drawVolleyCore` |
| looking | 10 | the EMBER card at three plate counts and the film's warded ball, twice — the mantle was too dark and the lit face too grey the first time |
| friction | 5 | the director's idle exit twice between shots, and a first read of the card that mistook three plates off for two |
| landing | 0 | `check:fast` once, green |

The bottleneck was looking: the card walks four states on its own clock,
so each shot is a guess at the wait and a pixel read to know which state it
caught.

## 2026-09-12 · hit-looks — the Mine: a wisp that stands still and is tapped, designed and drawn at, not built

The owner: *a new enemy like the wisp but stationary; after some time it
damages the ship and disappears; one player cannot see it and the other
must tap its exact position; a tap on a neighbouring tile also damages the
hull — show me some idea of nice visuals.* Three forks were put to him first
(who sees and who taps, what a wrong tap costs, what the blind seat gets)
and the answers went into one idea-store entry; three shapes were drawn at
it on the SHAPES page. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/wisp.ts`, the split tables, THE BEATBOX's tap, the draft files and the forms |
| writing | 10 | the entry in `ideas.md`, three cards in `drafts/mine.ts`, the three ledgers that count cards |
| looking | 5 | the three shapes at three moments each, twice — REACHER's arms and SINKER's roots were tuned once |
| friction | 0 | — |
| landing | 5 | `check:fast` twice — the first run caught the drafts file over 250 lines and two card counts |

The bottleneck was the ledgers: four tests count the catalogue's cards
by hand, and every new draft is four sentences to write before it is green.

## 2026-09-12 · hit-looks — the tutorial's film is phone-shaped on any stage, and its plate is compact

The owner: *TEST, P1 and P2 in briefing mode should be the game's own screen
width; the ship's skin is cut vertically at top-left and top-right.* The film
was laid out across the whole stage while its columns were bound by the
height, so the hull stopped short of the band on both sides; it now stands
in the rectangle the game itself would take (`render/guide-film.ts`). The
narrower film put the corner plate over the siren's seat chip, so the plate
became a third smaller — the first item of the owner's later tutorial task,
brought forward. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `guide-scene.ts`, `layout.ts`, `canvas2d-takeover.ts`, the plate in `guide-switch.ts` |
| writing | 10 | the film rectangle, the plate's sizes, two files split off the length ceiling |
| looking | 10 | the director stage in TEST, P1 and P2 through `shot` and the pane's canvas, phone frames of two guides |
| friction | 5 | `dev:once` idled out mid-look and was restarted on a new port; `crop` takes only whole zooms |
| landing | 5 | `check:fast` twice — the first run caught the two files over 250 lines |

The bottleneck was looking: the director's stage has no `--role` flag for
`shot`, so P1 and P2 were read out of the pane's canvas by hand.

## 2026-09-12 · hit-looks — three counts for THE COUNT, offered in VERSUS

The owner: *improve the "Countdown" enemy visuals.* The shipped count is
four notches in the rim; a look is offered, not replaced, so THE COUNT's
draw became a record (`render/countdown-look.ts`) and three candidates
patch it under `creature:countdown` — DIAL, IRIS and FUSE — judged on a new
pose with three marks left. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `countdown.ts`, the body table, how a throb candidate was written, the pair and the seat probe |
| writing | 15 | the look record, the disc helper, three paints and their cards, the pose, the pose row |
| looking | 10 | seven frames of the shipped count beat by beat, then the three candidates at true size beside it |
| friction | 0 | — |
| landing | 0 | `bun run land --keep` |

Bottleneck: the first five frames I took were all on the two open beats, so the shipped notches looked missing until a frame per beat showed them.

## 2026-09-12 · hit-looks — the band keeps its skin and grows POLYP's threads; the beads walk the cords

The owner, from the VERSUS page: *keep current in game, but add the tiny
polyp hanging down from the skin; make the lightning pulse movement inside
the veins fluent — right now it has a stuck, jumping movement.* POLYP's
filaments moved into `render/band-filaments.ts` and are drawn over the
shipped pendants; the beads on the cords interpolate between the sixteen
points instead of standing on the nearest. `versus drop` closed the last open
slot, which left the generated registry and pose map in a form Biome
rejects and two director tests with no rows to read. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the POLYP candidate, `slime-look.ts`, `gland-cord.ts`, the registry and pose-row generators |
| writing | 10 | the filaments file, the slime record, the bead interpolation, the empty forms in both generators and the two tests, four budget tables remeasured |
| looking | 5 | the POLYP shot beside the band crop; the beads on a cord over four frames |
| friction | 5 | the last slot closed left `[\n]` and `{\n}` behind, which lint refused and the pose test could not read — both generators now print the one-line form |
| landing | 0 | `bun run land --keep` |

Bottleneck: the first tree with no open VERSUS slot — the generators had never printed an empty list.

## 2026-09-12 · hit-looks — THE THROB wears PORES and is two tiles by two

The owner, from the VERSUS page: *adopt 'CREATURE:THROB · PORES', remove
the other THROB candidates; make Throb big, of 2x2 tiles.* Asked whether
2×2 meant two lanes, he took the torch's rule. `versus adopt` moved the
paint into `render/throb-pores.ts` and closed the slot; GLOBE's paint went
with it. `colSpan("throb")` is two and `THROB_BODY_MUL` doubles the drawn
and grabbed body. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the PORES candidate, `throb.ts` and `throb-look.ts`, how a wide body is placed and sized (`span.ts`, `creature-place.ts`) |
| writing | 5 | the adopt, GLOBE removed, the span and the multiplier, the bestiary line, the versus-pose test's empty-creature-slot guard |
| looking | 5 | four frames of THE THROB on player 1's screen — two lanes lit, the body between them |
| friction | 0 | — |
| landing | 0 | `bun run land --keep` |

**Bottleneck:** `creature-place.ts` at its line limit — the size constant's
comment was trimmed twice before the file fit.

## 2026-09-12 · hit-looks — TWIST is THE WARDEN's rope; all four ropes kept and shown as real examples; a picture on every ON THE FIELD row

The owner, from the VERSUS page: *I like all 'CREATURE:TETHER' alternatives;
I will need them for special pull mechanics later on — document it all to be
used later on, as real examples, on Documentation → Controls → On the Field;
default TWIST; images for every On the Field control.* So the three
candidates moved into render/ as `tether-{cord,sinew,twist}.ts`, the shipped
stroke became `STROKE_LOOK`, and `tether-looks.ts` holds all four with
`useTetherLook` as the switch — TWIST live. The ON THE FIELD tab names a
gallery pose per row and draws it; five poses the gallery lacked were made
(rope taut, both balloon hands, gum stuck, choke on the cannon, ready
circles); under THE WARDEN'S TETHER the same taut frame is drawn four times,
once per look. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three candidates, `tether-look.ts`, the field-controls files, pose kit, the balloon/gum/choke/briefing sims for the states a pose needs |
| writing | 15 | four render files, the looks table, `poses-field-controls.ts`, the rows and tether files, the def's `pose` field, the test, the warden budget rows |
| looking | 5 | the page in this tree's director; the four ropes at field width were hairlines, so the examples were cut close under the eye |
| friction | 5 | `bun run versus drop` loads candidates whose files had moved — imports pointed at render first; the frame-budget rows remeasured for the two-strand rope |
| landing | 0 | `bun run land --keep` |

**Bottleneck:** the four examples at a card's field width all read as one
line — the picture had to be cut to the eye's underside before the four
roots and ropes were tellable apart.

## 2026-09-12 · hit-looks — The rocks burn: BLAZE built in, COMET and SMOULDER worn by any rock, FORGE rejected

The owner, from the VERSUS page: *build into game 'CREATURE:METEOR · BLAZE';
I would like to configure also COMET to be alternative visuals for any
meteor; SMOULDER also; reject FORGE.* Asked how a rock should pick an
alternative, he chose *by the rock itself* — so the three looks are
`MeteorLook` records in `meteor-looks.ts` and each rock wears one by its own
id, two to one to one, blaze first; the grey stone stays as `STONE_LOOK` for
THE VOLLEY's ball and PINBALL's obstacles. The slot was taken by hand (the
candidates' draws were written inline) and closed with `versus drop`. About
35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four candidates, `meteor-look.ts`, `meteor.ts`, `drawRockBody`'s two other callers, `docs/versus.md` on adopting a function field |
| writing | 15 | six files moved into render/ with their imports rewritten, `meteor-looks.ts`, the pick in `drawRockBody`, the pinball exception, the pose test built by name |
| looking | 5 | one film of THE HAND: three rocks, three fires |
| friction | 5 | `versus drop` could not load a registry whose candidates imported files already moved — their imports were pointed at the new modules for the one run that deleted them |
| landing | 5 | `check:fast` (THE WISP's budget rows remeasured for one burning rock), the commit, `land --keep` |

Bottleneck: **an inline draw** — a candidate whose `body` is written in its
`index.ts` cannot be adopted by the command, so the four steps `adopt` does
were done by hand, and the drop then tripped over the files the hand had
already moved.

## 2026-09-12 · hit-looks — THE VOLLEY is a round ball with a smaller ball inside, and breaks into pieces of itself

The owner: *it should look like a basketball, such as rounded; improve the
graphics of the broken pieces; maybe change what is inside to a smaller red
or cyan only enemy so it looks harmonic with the same shape of the
basketball.* The shell is a true circle now rather than the `METEOR`
contour; what shows through a break is `volley-core.ts`, a glossy sphere of
the body's colour at half the shell's radius wearing the shell's own four
seams, breathing; and `volley-shards.ts` replaces the spray of squares with
curved fragments cut from the sector a ward took — rind and stone, some with
a burning length of seam — thrown up and out off the shield and falling on
the skin, and at the hatch a ring of the core's own skin. The simulation is
untouched: the core is a picture over the slick or bulb it will fall as, and
the hatch's burst covers the swap. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `volley.ts`, `volley-look.ts`, `volley-stone.ts`, `shatter.ts` for why its cutter does not fit a sector, `effects.ts` for where a transient is registered |
| writing | 20 | the circle, `volleyBallRadius`, `volley-core.ts`, `volley-shards.ts`, the `Effects` wiring, the spark counts, the body-draw row and its test |
| looking | 20 | four films: the first pieces landed on the shield before they were seen (lift up, pull down); the hatch strip showed no shell was left to break, so the hatch throws the core's skin instead |
| friction | 5 | `crop` refuses a fractional zoom; the frames tool's effect clock runs behind the simulation, so the pieces' flight was judged by shape and not by timing |
| landing | 5 | `check:fast` (two index rows, one body-draw assertion moved), the commit, `land --keep` |

Bottleneck: **what is there to break** — the pieces were designed for a shell
that the third ward has already taken whole, and only the film of the hatch
said so.

## 2026-09-12 · hit-looks — THE CRYSTAL is a craft with an electric field, opened by a shield anywhere under it

The owner: *it should react on the shield when in the same vertical as the
whole ship, to make it easier; add some visual before which indicates an
electrical shield around all — when shielded correctly below it the electric
shield is interrupted and the shot can hit the middle; let it fly slower;
make it look more cool, like a space ship; when hit wrong it shouldn't fall
faster, just nothing; replace the bulb and slick in the ship with anything
you like, red and cyan.* `crystalHeld` now answers for any lane of the span,
the crossing is one lane a beat, a wrong shot is caught and nothing else
happens (`crystalCatch`; the dive went to NOT BUILT YET → Mechanics), and
the body is a saucer cut from the retired `SHELL` contour with red and cyan
engine pods and a canopy in the join's colour, an electric field crawling
round the whole of it that opens across the underside while the shield
stands armed there. Found on the way: the shot was tested against the
middle of the lane the body was *going to* while it was found against the
lane it was *drawn* in, so a bolt up the visible join in the first half of a
beat was caught — `crystalMiddleLane` and `crystalUnder` read the drawn lane
now. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `sim/crystal.ts` and its config, events and consumers, `render/crystal.ts`, `silhouettes-spare.ts` for a free contour, the shape drafts, `mid-beat.ts` and `bullets.ts` for how a shot finds a body |
| writing | 25 | the sim rule and its tests, the event rename through audio, render, director and their tests, `crystal-craft.ts`, `crystal-field.ts`, the guide, the tables, the bestiary and the NOT BUILT YET card |
| looking | 10 | three films: the pods hidden under the wing, then a shot up the middle that was caught — which was the lane defect, not the picture |
| friction | 5 | `--press` refuses a press after `--ticks`, so the whole sequence was filmed as two runs |
| landing | 5 | `check:fast` (two index rows), the commit, `land --keep` |

Bottleneck: **the drawn lane** — a body that changes lanes is found by a bolt
where it is drawn, and every rule that then asks "which column of it" has to
ask the same question; the crystal's did not, and the film is what said so.

## 2026-09-12 · hit-looks — THE COIL's rock is thrown from the dome's tile to the far wall

The owner: *the first hit by shield must have a torch falling, immediately;
the torches must release from the exact position the coil was removing its
shield, then fly in a diagonal to the farthest border; when it has a shield
it is already looking like a torch inside; text "Do not shield!".* The freed
rock used to appear at the far wall on the dome's row and fall a beat later.
`popCoil` now leaves `fromCol`/`fromRow` on the dome's tile and puts the
rock on the far wall's hull row, so the glide is the diagonal and it is
resolved on the next beat line; a transient measures the throw from the
frame the dome went (a late ward is a fast one), runs the tail from the dome
and keeps the line lit a moment after the hit, and the impact's own vertical
tail is off for it. The coil is drawn as the burning torch inside its dome.
"Do not shield!" opens player 2's half of THE COIL's guide. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/coil.ts`, `beat.ts`'s order, `hull.ts`'s arrival rule, `recoil-leap.ts`, `creatures.ts`, `torch.ts`, `rock-impact.ts` |
| writing | 10 | `popCoil`, two sim tests, `coil-flight.ts`, the tail from anywhere, `creature-body-rock.ts` (the rock bodies moved out of a full file), the wiring, four render tests, the guide line |
| looking | 5 | one film of a mid-beat ward — right first time |
| friction | 5 | the probe's `waveWorld` started a wave without its fault, so the stuck shield never armed; fixed in the tool (`tools/probe/world.ts`) |
| landing | 5 | `check:fast` twice (a guide half over 220 characters, a file at 251 lines, two index rows), the commit, `land --keep` |

Bottleneck: **deciding the timing** — a dome opened late in a beat leaves the
rock a fraction of a beat to fly, and every way of giving it a whole beat
needed either a new field on the body or a picture that ended after the
simulation had resolved it; the fast flight with a lit line behind it won.

## 2026-09-12 · hit-looks — THE CHOKE crawls along the hull to the cannon before it takes it

The owner: *when the choke hits the ship, it fast crawls to the cannon
first.* The grip was a cut — strand in its lane one frame, loops on the
cannon the next. Now the `chokeGrip` event names the body, and a transient
held with the hull-level ones draws the sac lying on the plating and surging
toward the cannon in the beat the simulation already leaves before it walks
anything, hooks reaching, with a flash as the loops go on. The landing burst
moved to the lane it fell in. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/choke.ts`, `render/choke.ts`, `render-state.ts`, `canvas2d.ts`, the handed burst table |
| writing | 10 | `id` on the event, `choke-crawl.ts`, `choke-strand.ts` (the paint moved out of `choke.ts`, the crawler beside it), the wiring, four tests |
| looking | 5 | one film, cropped to the hull — right first time |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the simulation had already left the
beat the crawl needed.

## 2026-09-11 · hit-looks — THE STRAND's thread burns away like a fuse

The owner: *when all bulb and slick are destroyed there must be a nice
animation how the string is destroyed — like a fuse in the air, a bigger
effect.* The `strandBroke` event now carries every bead on the thread, and a
new body transient rebuilds the line from them, lights it at both ends and
burns it inward — sparking fronts, each raisin popping off as a front reaches
it — to a blast where the two meet, on the tile the old grey puff stood on.
About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `strand.ts`, `strand-bead.ts`, `effects-body.ts`, the burst table and both silent lists |
| writing | 10 | the event's `beads`, `drawRaisinAt`, `strand-fuse.ts` and `strand-fuse-draw.ts`, the wiring, five tests |
| looking | 5 | three films — the first too small, the second's blast too big |
| friction | 5 | the probe that planned the presses: two threads under the one I wanted rejected the shots, and the cooldown; `sinHash` re-derived once |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **getting every bead shrivelled on film** — the lit end is the
seeded rng's and hops after every shot, so the presses had to be planned by
running the wave headless first (`tools/probe`).

## 2026-09-11 · hit-looks — THE LID's cord hangs beside the eye and rides down with it

The owner: *the pull must be left or right of the enemy, then it should
glide as the lid glides.* The handle hangs a tile beside the eye on the side
toward the middle of the field (`lidSide`), and held or loose it goes down
with the body, the cord keeping its length; the tension is still the hand's
travel. The frozen anchor a September lane added is gone, and the per-beat
re-clamp it removed is back. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `lid.ts`, `handle-pull.ts`, `lid-string.ts`, `handle-place.ts`, the commit that froze the anchor and why |
| writing | 10 | `lidSide`, the rest and handle rules, `stepLidPulls` back, the two anchor fields out of the state and the hash, the render's `lidHandlePoint`, the sag's belly hanging down, three tests |
| looking | 5 | two films — one with the handle pulled off the crop, one loose then held |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the one decision was which side, and
the side with the room answered it.

## 2026-09-11 · hit-looks — THE RECOIL is thrown, not jumped

The owner: *jumping when hit is sometimes not natural and fluent — it's like
jumping.* A bounce was written mid-tick and glided over whatever was left of
the beat, so the frame of the hit jumped and a late hit crossed two rows in a
tenth of a beat. Now a struck recoil is on a throw of its own for one beat:
a parabola from where it was drawn, ending on the simulation's own place at
the fall's own speed, the colour turning along it. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `recoil.ts`'s bounce, `drawnRow`/`drawnCol`, the beat's `from` reset, where `Effects` reaches `drawCreatures` |
| writing | 15 | `recoil-leap.ts`, `Body.turn`, the placement in `creatures.ts`, the wake's end, four tests |
| looking | 10 | three films — the first two on the authored column rather than the mapped one, the bullet flying up an empty lane |
| friction | 0 | — |
| landing | 5 | `creature-place.ts` one line over its limit, `check:fast`, the commit, `land --keep` |

Bottleneck: **the column.** A wave's column is not the field's (`mapCol`),
and `press.ts` says so in its own header — two films were spent before it
was read.

## 2026-09-11 · hit-looks — What is inside a body stays inside it

The owner saw the red rind's inner animation reach past its body: a rind
wearing BURR (three lobes and knobs) drew the slick's bloom, whose veins are
sized to the slick's own ellipse, and they crossed the knobbed rim. Now every
living body's interior is clipped to the body drawn a sixth smaller
(`body-inset.ts`), so nothing inside touches the edge. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `living-draw.ts`'s order of clips, where `drawDetails` gets its radii, the BURR contour against the bloom's reach |
| writing | 10 | `body-inset.ts`, the wrap in `living-draw.ts`, a test that counts the clips per living body |
| looking | 5 | two 6-frame strips of THE RIND at zoom 3 — inset 0.9 still touched, 0.84 left a clear gap |
| friction | 5 | ten budget rows moved by one `clip` and one `save` each — remeasured with MEASURE on, every other figure checked unchanged |
| landing | 5 | `check:fast`, the two dated notes, the commit, `land --keep` |

Bottleneck: **the budget rows** — one extra clip per living body touches
every row in two budget tests, and each had to be remeasured rather than
padded.

## 2026-09-11 · hit-looks — The BESTIARY tab comes off

The owner asked whether the page was gone; it was not — an earlier lane had
only retired its idea rows. Now it is: the tab and its sheet leave the
director, the creature ideas read on MECHANICS in a group of their own, each
beside the draft drawn for it, which was already on GRAPHICS. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | what the tab still held (two empty groups, ten ideas, one prose section), every `bestiary` in the director, the concept-art join |
| writing | 5 | `index.html`, `backlog.ts` and `backlog-page.ts`, three comments, the README, the backlog tests |
| looking | 5 | two shots of the page against this tree's own director — the tab row, then the CREATURE IDEAS group with its shapes |
| friction | 0 | — |
| landing | 5 | lint red once on a line the formatter wanted folded, `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the shapes were on GRAPHICS already
through each draft's `suggests`, so the work was taking a page away without
breaking the join that page had carried.

## 2026-09-11 · hit-looks — A rock lands in the hole it makes

The owner's report: the meteor went into the ship and vanished, then jumped
up with the crater under it. The hull row's centre is under the membrane, so
the last glide ended behind the skin; and the hole stayed shut under the
stuck rock until it lifted off. Now the glide ends half-sunk in the plating,
the replay picks it up standing there, and the hole, the sparks and the
crack all show that frame. About 50 min, a compaction in the middle.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the layout numbers at 390×844, `rock-impact.ts`, `creatures.ts`'s placement, `sim/hull.ts`'s landing beat, `frame-ship.ts`'s gate, the two samplers in `hull-frame.ts`, the tests |
| writing | 15 | `rock-landing.ts` and its test, the `y0` clamp and the gate in `rock-impact.ts`, `skinSampler`, the parameter through `drawBodies` and `drawCreatures`, three doc comments |
| looking | 10 | two eight-frame strips of THE ROCK, the first with the cannon standing on the rock's column — which is what turned the surface sampler into the skin one |
| friction | 5 | no PNG joiner on the machine: a throwaway strip script against `tools/frames`'s own codec, written twice because the encoder lives in `picture.ts` and the decoder in `pixels.ts` |
| landing | 5 | `check:fast` red once on the file index, `bun run index`, the commit, `land --keep` |

Bottleneck: **reading** — the defect is three files agreeing on a height,
and finding which of the two membranes each one was asking took longer than
making them agree.

## 2026-09-11 · hit-looks — The act order names only what is built

The owner cleared THE ACT ORDER group of the NOT BUILT YET page: seven
placeholder names and THE TELL out of `bosses.md`'s order, 11.10 "In plain
words" gone with them, THE MOTHER and THE VESSEL drafts set free, a decision,
and the page's empty line saying where a built boss went. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `roster.ts`'s order parser and `isBuilt`, the drafts that suggest the names, every file naming a slot |
| writing | 15 | `bosses.md`'s head and the cut, `decisions.md` #30, four director tests, two drafts, the catalogue, `backlog.ts`'s `builtWhere`, the tab preamble |
| looking | 5 | three shots of the tab — the first against the main checkout's director on 4174, which showed yesterday's page |
| friction | 5 | The Conductor stood as unbuilt under its own name (now written as THE VANE); a draft must be offered to something, so two became free; the once-director idles out in three minutes |
| landing | 0 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a draft cannot point at nothing and a test cannot
count nothing, so removing eight names is also deciding what the two
pictures drawn for them are now.

## 2026-09-11 · hit-looks — THE COUNT

The Countdown creature out of `ideas.md` and into act 3 as THE COUNT: a disc
whose count only the pilot is drawn, open for two beats at nought, a shot off
zero costing the hull. `sim/countdown.ts`, the render's marks, the wave and
its guide, the six tables, the director's brush and ship groups, a decision,
and sixteen tests that counted things moved by one. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the ideas entry, the lure's price and the throb's colour arrangement, `bullet-hit.ts`, `spawn.ts`, the split family in `creatures-split.ts`, the COUNTDOWN draft, `nameability.ts` |
| writing | 25 | `countdown.ts` in sim and render, the silhouette, the wave, the tables, the test, `decisions.md` #29, the bestiary row, fifteen knock-on tests |
| looking | 5 | two close-ups and a seven-beat strip of the pilot's screen, one close-up of the navigator's |
| friction | 10 | a one-lobe disc has no lobe count under the nameability gate (fixed with seven shallow lobes); the draft's card name collided with the new living card; five files at 251–254 lines trimmed back to 250 |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a new kind is a name in six tables and a number in
sixteen tests, and every one of those tests wanted a sentence saying why it
moved.

## 2026-09-11 · hit-looks — Ten creature ideas leave the bestiary

The owner retired the Choke, the Glyph and the nine idea rows of bestiary 10.2
from the NOT BUILT YET page. Rows, paragraphs and the whole of 10.5 out of the
spec, a decision written, six documents that pointed at them re-pointed, the
director's tests turned round, and the page's empty-group line made one
sentence. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | how the director builds the bestiary groups (`backlog.ts`, `roster.ts`, `plain-words.ts`), every file naming the ten, the page's empty-group text |
| writing | 15 | `bestiary.md`, `decisions.md` #28, five other documents, two director tests, `backlog-page.ts` |
| looking | 5 | three shots of the tab: the two notes said "nothing here" and then "12 more", then "all 1 are" |
| friction | 5 | a Python heredoc bash refused to parse, rewritten as a file; one wrong assertion length |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — ten names were in eleven places, and each place
needed a sentence that still reads once they are gone.

## 2026-09-11 · hit-looks — `bun run shot` says what the page said

The queue's `versus:shot` item: a page that throws while loading used to
photograph as *no element matches — is the tab right?*, and with `--freeze`
as a ten-minute wait. `shot.ts` now listens to the page from the moment it
opens and prints what it said above that line, and a throw cuts the wait to
five seconds. A browser test with a page that throws. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `shot.ts`, `versus-shot.ts`, `shot-state.ts`, `page.ts`'s own listener, how `opening.test.ts` shares a browser |
| writing | 10 | `page-said.ts`, the wiring in `shot.ts` under its line limit, `page-said.test.ts` |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 10 | `queue done` by title, `check:fast`, the commit, `land --keep` twice |

Bottleneck: **landing** — half the time went on landing a 10-minute change.
The first `bun run land` ran its full check for four minutes and then went
red on one thing: the new file had no row in `docs/INDEX.md`. Writing the row
took a minute; the second full check took another four. `check:fast` had
passed a moment earlier because the index test was not among the tests it
runs for every change. Fixed in the next landing: the index test is now one
of `check:fast`'s sweeps, so a missing row is red before the commit.

## 2026-09-11 · hit-looks — THE CHOKE

A body that takes the cannon: the strip goes dead, the cannon walks wall to
wall, player 1 taps it off. Rules, six tables, a wave in act 7, the look on
the field and on the strip, its sounds, the director's rows, the bestiary
card retired. About 160 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `gum.ts` both sides, `malfunction.ts`, the strip look, the spine, `touch.ts`, the band's draw order, the frames tool's flags, nine pinned-count tests |
| writing | 75 | `sim/choke.ts` and its config and events, the codec, the six tables, `act-7a.ts`, `render/choke.ts`, `choke-coil.ts`, `choke-strip.ts`, `bind-choke.ts`, the replay and frame tests, the director rows, the bestiary |
| looking | 15 | four `bun run frames` pictures: the loops merged into a block at the first stack height, the hooks tangled once |
| friction | 30 | Python's text mode wrote CRLF into 45 files and biome refused them; a commit message in a `$(cat <<EOF)` hung bash and was written to a file; six files at the 250-line ceiling (`bind.ts`, `effects-spark.ts`, `act-7b.ts`, `events-creature.ts`, three tables), each split or trimmed; `--hold` had no lift, so the frames tool learnt `choke=up` |
| landing | 15 | `check:fast` four times over the pinned counts, the commit, `land --keep` |

Bottleneck: **friction** — a new creature touches every table the game has,
and five of them were already standing on the 250-line ceiling.

## 2026-09-11 · hit-looks — panel:band-skin opened with POLYP, VESICLE and SUCKER

Three candidates for the bed, gloss, life and slime round a button on GLAND's panel; a module cycle band-join / gland-join / band-seam that kept the VERSUS page from opening at all is broken by a leaf seam-line.ts.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 45 | writing |
| looking | 20 | looking |
| friction | 20 | friction |
| landing | 10 | landing |

Bottleneck: bun run versus:shot failed with no picture and no message for twenty minutes before the in-app browser showed the cycle; the shot tool should print the page's console errors when the stage is missing.

## 2026-09-11 · hit-looks — The slime on the band is a record

drawBand called drawDrips by name; BAND_SLIME in slime-look.ts now wraps it so panel:band-skin can patch what hangs over the buttons.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 0 | friction |
| landing | 5 | landing |

Bottleneck: Nothing worth naming: one import, one call, one new file.

## 2026-09-11 · hit-looks — GLAND's paths are held between frames

The spine's cord, stations and node and each organ's bed are cached per layout and per button, the stations are one fill instead of ten, the budget rows fell back and the frame is byte-identical.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 0 | friction |
| landing | 5 | landing |

Bottleneck: Remeasuring five budget tables is a run and a paste, but still the longest part of a small change.

## 2026-09-11 · hit-looks — GLAND is the ship

The owner picked GLAND out of ship:body; adopt refused the function fields so the six shared tool modules moved into packages/render by hand, the seven records point at them, the displaced looks are deleted, five budget tables and the baked-entry count were remeasured, and the slot closed.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 5 | looking |
| friction | 15 | friction |
| landing | 10 | landing |

Bottleneck: Closing the slot by hand: drop needs the candidates and their shared modules present to list them, so the moved files had to be restored, dropped, and removed again.

## 2026-09-11 · hit-looks — The lane question is retired

The owner said a landed lane must no longer ask whether to push, sweep or deploy; the rule, the hook message, its test, the reasoning doc and the lane skill now say: land with --keep, report, stop.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: A python heredoc with apostrophes in it broke under the Bash tool again, so the edit script went through a file.

## 2026-09-11 · hit-looks — Three burning meteors offered in VERSUS

Three new creature:meteor candidates — BLAZE (a torch's fireball round a scorched, cratered stone), COMET (rusted iron under a long plume) and SMOULDER (a black stone burning on its underside, under a column of smoke) — each shedding small pieces with their own smoke up the wake, each keeping the shot marks; shared fire and smoke helpers in tools/versus/wake.ts and wake-fire.ts.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | reading |
| writing | 40 | writing |
| looking | 35 | looking |
| friction | 20 | friction |
| landing | 10 | landing |

Bottleneck: Radial gradients painted inside the clipped stone came out flat or blank in the shots, whatever their geometry; the hot underside is a linear gradient instead, and every other gradient in the three was made concentric on the way.

## 2026-09-11 · hit-looks — THE GUM: a body that sticks to the ship and is swiped off by the seat without the cannon

A new creature and wave 44: the gum falls straight, cannot be shot, sticks to the hull and shuts the cannon in its columns; player 1 parks the cannon under it and player 2 swipes it toward the nearer wall, the wrong way spreading it a lane. Sim, render (THE WEIGHT's sac in venom green), scene, audio, director, frames tool, tests.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the balloon's handle, drag and audio files as the pattern, the tests that enumerate every kind |
| writing | 95 | sim, render, content, scene, audio binding, director pages, the sim test |
| looking | 5 | one frame of a stuck gum mid-swipe |
| friction | 20 | two heredocs broken by apostrophes, the canvas stub without transform, a dozen enumerating tests found one by one |
| landing | 15 | format, check:fast, index, perf --unmeasured, the log |

Bottleneck: The tests that enumerate every creature kind — bestiary categories, mechanics, backlog counts, sheet card counts, audio wiring lists — each found by running the whole suite rather than from one checklist.

## 2026-09-11 · hit-looks — THE CRYSTAL

THE CRYSTAL built off the bestiary's Crystal: a red slick and a cyan bulb joined at a thin middle under one shell, crossing on the carom's diagonal, opened only by the shield under the middle and the guard armed on the beat the shot of the join's colour lands; a wave, a guide film, three sounds, the director's rows. About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the carom and clasp files end to end, the scene format, the audio binding tables, the file-limit list, the director's brush and ship tables |
| writing | 30 | config-crystal, crystal.ts in sim and render, events, the joined creatures file, the wave, the scene, the bindings, thirteen sim tests and a frame test, the bestiary |
| looking | 10 | six bun run frames pictures — the shell's waist too shallow at first, then the link drawn under the gliding body instead of in the shield's lane |
| friction | 5 | a heredoc turned an escaped newline into a real one and broke the edit script; two files landed on 251 lines and each lost a comment line |
| landing | 10 | two check:fast rounds fixing the twelve tests that name every kind, the commit, land --keep |

Bottleneck: writing — a creature touches forty files across four packages and the director before it can be drawn once, and every one of them is a row in a table a test reads

## 2026-09-11 · hit-looks — THE TELL removed

The boss round THE TELL and everything that hung off it — sim ladder and ring, render body and scenes, the reduced panel, the guide scene, wave 60, the director's rows, the perf baseline row — taken out; the design stays on the BOSSES page as a removed idea.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 20 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Finding every dependency of a round when 'tell' is also an ordinary English word and the Bulb Queen's own field name.

## 2026-09-11 · hit-looks — creature:rind kept, three sheds to the LIBRARY

The owner kept the shipped shed and asked for the VERSUS alternatives on the GRAPHICS page: FLAKES, POD and SLOUGH moved into packages/render beside their record, the slot dropped by hand, and a rind card built that replays the shed on the game's own burr.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Catching a half-second event on a card with a fixed-wait shot took five shots; the page clock does not start at the click.

## 2026-09-11 · hit-looks — creature:recoil — GLOBE into the game, three cages kept

Copied MOONS, FOAM and CALYX into render for the LIBRARY, adopted GLOBE with the tool, built a recoil card that spends its ribs, let two creatures share a label on the LIBRARY.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Two slots had spelled a look FOAM, and the LIBRARY test wanted labels unique across the whole page; a label is now unique under its creature.

## 2026-09-11 · hit-looks — creature:queen — SCUTES into the game, CARAPACE and FACET kept

Copied CARAPACE and FACET into render for the LIBRARY, adopted SCUTES with the tool, built a queen card that hands her contour straight to a look, remeasured the BULB QUEEN's op-count rows.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 10 | friction |
| landing | 5 | landing |

Bottleneck: A Bash heredoc holding three files failed to parse and had to be redone through the Write tool; then the op-count budget wanted the seven plates measured.

## 2026-09-11 · hit-looks — creature:mount — TAPROOT into the game, RASP kept

Moved the rooted rim into content so a package could draw it, took TAPROOT and RASP by hand, broke the record–look import cycle with mount-bearing.ts, built a mount card with a hub to face, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Both candidates imported tools/shape-sheet, which a package cannot; the rim had to move into content first and the adopt tool could not do the slot.

## 2026-09-11 · hit-looks — creature:magnet — ORE into the game, the rest gone

Adopted ORE with the tool, cut COIL's dead arch out of magnet-coil.ts and retitled it as the slab and poles ORE draws over, photographed THE MAGNET.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Cutting the dead horseshoe: the slab shares the bevel with the arch, and the first cut took it too.

## 2026-09-11 · hit-looks — creature:lid — IRIS into the game, BEVEL kept, SHAPES renamed GRAPHICS

Adopted IRIS with the tool after copying BEVEL and the old plates into render for the LIBRARY, built the lid stage that pulls the cord on a card, renamed the tab with SHAPES kept as a synonym for the shot tool, remeasured THE LID's op-count row.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: The op-count budget: six leaves cost more fills and gradients than two plates, and the row had to be remeasured in MEASURE mode and moved before check:fast went green.

## 2026-09-11 · hit-looks — creature:veer — the rider's collar stays on the rock

Read the rider's geometry, found the 'hands' are the ruff beads sinking with the crouch, pinned them to the rock's crown, photographed the brace before and after, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 5 | writing |
| looking | 15 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Catching the brace on a frame: the first two photographs were of a rock in a row that does not brace, and a probe had to say which tick to shoot.

## 2026-09-11 · hit-looks — creature:veil — ANVIL kept and thinned over the body, three clouds kept

Moved FOAM, STRATA and VORTEX into packages/render, thinned the see-through cloud until the slick reads, built a veil stage and four cards, photographed the field and the LIBRARY, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 0 | friction |
| landing | 10 | landing |

Bottleneck: Finding how much cloud to leave on player 1's screen took three frames: the near heaps are dark on dark and hardly show at game size, so the visible change is mostly the base fill going.

## 2026-09-11 · hit-looks — creature:volley — EMBER into the game, PITTED and the painted seams kept

Moved EMBER's seams into the record and PITTED beside it, built a volley stage that walks the plate count down on a card, photographed the LIBRARY and the field, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Dropping a decided slot also drops its versus-pose row, and one test reached the pose through that row — it now names the pose directly.

## 2026-09-11 · hit-looks — creature:warden — SURFACE stays, three kept on the LIBRARY

Read the three candidates and the warden record, moved their paints into packages/render beside the record, built a warden stage for the LIBRARY from the game's own body and state, photographed the cards, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Photographing the LIBRARY: the browser pane cannot save a PNG and `bun run shot` needed the right flags (`--tab` opens the sheet itself; `--click` takes a CSS selector, not a Playwright one) — found by three failed runs.

## 2026-09-11 · hit-looks — the wisp wears ARMS, and SHAPES gets a LIBRARY

The owner took ARMS into the game and asked for the threads it replaced, COMB and SKIRT, to be kept on the SHAPES page because he wants more jellyfish-like bodies. The page had no place for a whole canvas-drawn look, so it got one: a fourth view, LIBRARY, whose cards are the game's own drawing code run on the game's own wisp (`tools/director/src/library`). ARMS was inline in its candidate and went in by hand; THE WISP's op-count rows moved.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the candidate, `wisp-look.ts`, the SHAPES views, the holders panel's loop |
| writing | 25 | `wisp-arms.ts`, the library's types, stage, four assets, panel, VIEW button, test |
| looking | 10 | the LIBRARY in the director twice, one frame of THE WISP |
| friction | 5 | a canvas that is 300 wide by default hid a missing height; one heredoc too long for the shell |
| landing | 5 | check:fast, budget rows, commit, land |

Bottleneck: There was no place on the SHAPES page for a canvas-drawn look, and building one was most of the piece.

## 2026-09-11 · hit-looks — the back decided: the sea stays, one light in the corner, the beat's sweep off

The owner kept the shipped back and dropped `field:backdrop`; what he kept of NEBULA is one soft rounded light of the act's tint in the sky's bottom-right corner (`corner-light.ts`, additive like the shafts), and the beat's travelling band across the field is off for the moment, its function kept and exported with a note on how to put it back. Every op-count budget moved by the one `drawImage` a frame the light costs.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three candidates, `backdrop-look.ts`, `field.ts`'s sweep, the budget files |
| writing | 10 | `corner-light.ts`, the record's new order, the sweep's note |
| looking | 10 | three frames of THE RIND — the first two too faint to see over the violet ground |
| friction | 5 | twenty-two budget rows and the baked count moved by one |
| landing | 5 | check:fast, commit, land |

Bottleneck: A light of an act's tint laid over the ground is invisible until it is added instead, which took two pictures to see.

## 2026-09-11 · hit-looks — the rind decided: BURR

The owner picked BURR for `rind:body`. `bun run versus adopt` moved the candidate into render, but it imported the shape sheet's `studded` form by a relative path, which a package may not do; the arithmetic moved into `packages/content/src/studded.ts` and the sheet's form became a wrapper round it, the move `metaball.ts` and `body-path.ts` made before.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the adopt tool's output and the candidate's imports |
| writing | 10 | `content/studded.ts`, the sheet's wrapper, the render import |
| looking | 5 | one frame of THE RIND, cropped |
| friction | 5 | the moved file's relative import broke the typecheck; the crop tool's argument shape |
| landing | 5 | check:fast, commit, land |

Bottleneck: The adopt tool moves a file without rewriting a relative import into a tool, which cost a typecheck round.

## 2026-09-11 · hit-looks — the crater decided

The owner keeps the crater as shipped; the slot closed with nothing taken. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | nothing — the decision came in chat |
| writing | 0 | nothing |
| looking | 0 | nothing |
| friction | 0 | none |
| landing | 5 | `versus drop`, `check:fast`, the commit, `land --keep` |

Bottleneck: **landing** — there was nothing else.

## 2026-09-11 · hit-looks — the ship's body, three cards from the brief

The owner named what he wanted from three of the six ships rather than one of
them; those three went and three new cards stand in their place, built on a
wet grain-free skin, buttons grown as organs, and PLASM's bubbles and strings.
About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the three cards he judged, `join.ts`, `sheen.ts`, the band's draw order, the record types, the versus tests that hold a slot to one shape |
| writing | 35 | `wet.ts`, `organ.ts`, `cord.ts`, `fluid.ts`, three candidates, the DECIDED entry |
| looking | 10 | five `versus:shot` pictures: ribs beading at the rim, veins as a sea urchin twice before they read as vessels |
| friction | 5 | two long heredocs died in bash and were written through a script file; `organ.ts` over 250 lines, the cords moved to `cord.ts` |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a brief that takes one thing from each of three
cards is three shared modules before any card can be drawn.

## 2026-09-11 · hit-looks — DOCUMENTATION → WORDINGS

A new tab: two whole phones, the pilot's and the navigator's, each a real
frame with a line from every word to the thing it names, and the words with
no place to point at under them. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the sheet's tab wiring, `pose-art.ts`, `layout.ts`, the band, lobe, siren, HUD and radar files for what each thing is called and where it stands |
| writing | 30 | the world, the callouts, the page with its label stacking, the glossary, the CSS, the test, three render exports |
| looking | 15 | two `bun run shot` rounds: labels piling up at the top of one margin, both lobe leaders on one line, the blip under the torch's alarm |
| friction | 5 | a `cat` left waiting on stdin; `bun run dev` is refused to an agent, so the director was launched by absolute path on its own port |
| landing | 5 | `main.ts` over 250 lines after one more binding — the five room bindings moved to `documentation-rooms.ts` |

Bottleneck: **writing** — laying labels beside a picture without them
piling up took a measured two-pass stack rather than a guessed one.

## 2026-09-11 · hit-looks — the torch decided

The owner keeps the torch as shipped: both torch slots dropped, the stale
queue claim closed, the branch that only ever existed as a local ref deleted.
About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | where the claimed branch lived (a local ref in the main checkout, tip already on `main`, no worktree), the two torch slots |
| writing | 0 | — |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | `versus drop` twice, `queue done`, the tests, the commit, `land --keep` |

Bottleneck: **reading** — a `Taken:` line names a branch, not where the
branch lives, so the owner could not tell a finished claim from a lost one.

## 2026-09-11 · hit-looks — the queue: the pose map's stale rows

Nineteen rows for closed slots out of `versus-pose.ts`; `adopt` and `drop`
take a slot's row with it, and the director's test refuses a row whose slot
has no candidate. On the way, two room tests that raced under a full check.
About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `versus-pose.ts`, its test, `decide.ts`; then `room.test.ts`, `settle`, `occupiedSeats` and `pressStart` for the flakes |
| writing | 15 | `pose-row.ts` and its test, the row test, the cannon tests moved onto the pose by name, `docs/versus.md`; the two room tests |
| looking | 0 | — |
| friction | 5 | the Bash tool collapses a doubled backslash inside quoted heredocs and `node -e`, so a script that matched source text never matched — the edits went through the editor tool |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **friction** — two red `land` runs on room tests unrelated to
the lane, each a full `check` to find out.

## 2026-09-11 · hit-looks — the queue: a claim on the lane's own entry

`bun run queue take` marks an entry the trunk has not got in the working
copy instead of throwing, and a claim that fails to mark deletes the branch
it made; `repo.ts` split along its git seam into `git.ts`. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `claim.ts`, `repo.ts`, `run.ts`, `edit.ts`, the two existing tests |
| writing | 15 | `trunkHas`, the working-copy branch of `claim`, the rollback, `hasEntry`, a test repository shaped like the lane, the preamble paragraph |
| looking | 0 | — |
| friction | 0 | one assertion compared against an untrimmed `git status` line |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — the fix is ten lines and the test that proves it
in a real repository is a hundred.


## 2026-09-11 · hit-looks — the queue: shipped-looks caught up

Four sections written into `docs/shipped-looks.md` — the chute, the coil, the
dart and the echo — from the four `*-look.ts` records, the adopted paint and
`DECIDED.md`, in the file's own table form. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the file's 400 lines for its form, eight render files and four DECIDED entries for the numbers |
| writing | 10 | four tables and the paragraph under each |
| looking | 0 | nothing visible moved |
| friction | 0 | a long heredoc died in bash again — the sections were written with the tool and spliced in with awk |
| landing | 5 | `queue done`, the commit, `land --keep` |

Bottleneck: **reading** — every number in a table is in a different file
from the one that says why it is there.


## 2026-09-11 · hit-looks — the gyre slot answered

ORBIT into the game; the granules it replaced, HELIX and VORTEX all
re-authored as fillings on the SHAPES page, ORBIT beside them as the
control. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three gyre candidates and `gyre-core.ts` |
| writing | 15 | the adoption, the core stripped to its shared parts, four fillings and two helpers in `fillings/parts.ts` |
| looking | 5 | `versus:shot` before; one card each after, the helix opened up on the second look |
| friction | 0 | — |
| landing | 5 | the gyre budget rows remeasured, `check:fast` |

Bottleneck: none worth the name — the ghost lane an hour earlier had already
built the path, and this one walked it.

## 2026-09-11 · hit-looks — the ghost slot answered

SWARM into the game, the eyes made to read at the field's size, HOLLOW and
LANTERN re-authored as fillings on the SHAPES page. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three ghost candidates, `ghost-eyes.ts`, `ghost.ts`, the fillings axis and its helpers |
| writing | 10 | the adoption, the eye numbers, two fillings, the record clean-up |
| looking | 10 | `versus:shot` before, `frames . --wave` after at 8x; two rounds on each filling card |
| friction | 5 | `land` refused yesterday's lane over two parked titles a few characters past eighty |
| landing | 5 | the ghost budget rows remeasured, `check:fast` |

Bottleneck: once a slot is closed nothing shows the shipped look on its own —
`versus:shot` needs a candidate — so the eyes were checked by cropping a
wave frame, which is fine for the ghost and blind for a body that moves.

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

## 2026-09-12 · scheduler-tests — the failure modes `packages/net` survives, written down

Every behaviour the headers of `lockstep.ts`, `delay.ts`, `clock.ts` and
`desync.ts` claim, matched against the tests that prove it, and the eight with
nothing behind them written: a frame that arrives after its tick has been
simulated, a frame lost and sent again, the relay handing a device its own word
back, two presses from one seat on one tick, a phone that rebuilt its scheduler
while its partner kept playing, the same two rebuilding together, a pong that
overtakes one sent before it, the ahead-window measured in the caller's own
ticks, and the fingerprint ledger's depth from both sides of its boundary. The
link's failure modes have their own file now (`scheduler-faults.test.ts`), and
the ledger's tests moved out of `protocol.test.ts` into one. No defect: every
new test was checked by breaking the line it is about and watching it, and only
it, go red. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the four headers claim by claim, the 126 tests already there, `link-run.ts` and `link.ts` for what a rejoin is from each side, `start-gate.ts` for why the room throws beat zero away, `room.ts` for whether a relay can duplicate a frame |
| writing | 25 | `scheduler-faults.test.ts`, `desync.test.ts`, the two additions to `clock.test.ts` and `lockstep.test.ts`, the two queue entries |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 10 | eight mutations of `src` to prove each new test bites, `check:fast`, the commit, `land` |

Bottleneck: **reading** — a documented behaviour is a sentence in a header, and
deciding whether the suite already proves one means reading every test that
touches the same field rather than searching for a name.

## 2026-09-12 · two-devices-wave — content's first wave, played to its end by two devices

FIRST STEP as `waves.ts` lists it, built the four ways `apps/game` builds a wave
and played over a delayed link with a different delay in each hand. The run stops
when the wave does — the `needWave` its clear produces, ten beats of a body
falling and about 975 ticks — and the two worlds are not compared by reaching
into both: every sixteenth tick each device fingerprints its own world, sends it
over the same wire the inputs cross, and puts the peer's through `HashLedger`, so
what the test asserts is the verdict the game would draw its DESYNC screen on.
Sixty checkpoints, sixty agreements each way, and the two hashes equal at the
end. The relay both two-device files drive is one file now
(`test/relay.ts`, carrying `hash` beside `input` and `confirm`, which is exactly
what `room.ts` relays); `packages/net` takes `@neon-spore/content` as a
devDependency to reach the wave list. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `buildQueue`/`buildPods`/`buildBoss` and how `apps/game/src/waves.ts` calls them, `startWave` and what a wave's opening holds, `wave-end.ts` for what "over" is, `determinism.test.ts` for how a readable input script is written here |
| writing | 20 | the wave test, the shared relay, the press script, the queue entry |
| looking | 0 | nothing drawn |
| friction | 5 | `@neon-spore/content` resolves nowhere until it is declared and installed, and the error names the import rather than the missing edge; `buildBoss` takes a column count the first draft did not pass, which `bun test` could not see and `tsc` could |
| landing | 10 | a fingerprint perturbed on one side to watch the ledger catch it, `check:fast`, the commit, `land` |

Bottleneck: **writing** — the script had to play the wave rather than fidget
through it, which meant choosing the beat the red shot goes out on so the run
covers the body's fall instead of ending on the first beat.

## 2026-09-12 · doc-drift — a document that names a file it has not got fails a test

`tools/index/drift.ts`' argument, applied to the spec: prose is hand-written and
worth keeping hand-written, so nothing regenerates over it, and the cost is that
it goes quietly wrong. `tools/test/doc-drift.test.ts` settles the three claims a
document makes that the tree can answer without reading the argument — 2,211
backticked paths under `docs/`, every field of `SimConfig`, and the `Files:` line
of every queue and parked entry. It caught **seven stale paths in five
documents** and **one undocumented core config field**, all fixed here. The
deciding half is `doc-paths.ts`, because the interesting question was never "is
this a path in the tree": the docs say `sim/hash.ts` and `render/glow.ts` on
purpose, so a literal check reported 147 healthy sentences and nine real misses,
and a shorthand resolver — segments in order, last segment the file name — got it
to nine. The other 138 were the docs being written the way they should be.
About 100 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `tools/index/drift.ts`, whether `tools/queue`'s own tests already checked a `Files:` path (`problemsIn` checks the shape, `stale.ts` checks the trunk when somebody runs the listing, nothing tests it), and then each of the nine misses in its own paragraph to see whether it was a rename, a removal, a hypothetical or a notation |
| writing | 40 | the test, `doc-paths.ts`, the 158-name allowlist and its header, seven doc fixes, `damageCreature`'s sentence under the damage table it belongs to, the `Asks:` entry with its three options |
| looking | 0 | nothing drawn |
| friction | 20 | three passes over the resolver before the false-positive rate was honest — `git ls-files` misses a file the same commit adds, `.gitignore`'d build outputs are not drift, fenced blocks are examples, and `docs/queue.md` quoting a field name made six undocumented fields read as documented, including the six in this lane's own entry |
| landing | 15 | five mutations of the tree to prove each check bites, the split at 258 lines, `check:fast` — which caught the new walk under `tree-walk.test.ts`' rule that anything recursing into directories names `.claude`, whatever directory it starts in — the commit, `land` |

Bottleneck: **friction** — every rule the check needed was discovered by reading
a false positive, and each one cost a full re-run over 54 documents to find the
next.

## 2026-09-12 · status-words — what the indicator may say, and the one pair of sentences that must differ

`packages/net/src/status.ts` was the only one of `net-change`'s six files with no
test, and the three functions in `apps/game/src/join-words.ts` that carry the
actual sentences — `explain`, `roomLine`, `chipText` — had none either;
`readyLine`, `seatWord` and `startButton` already had `start-press.test.ts`.
Twenty-five tests now hold what both headers claim and nothing held: the list of
eleven states is closed and this test knows all of them, no two states share a
word or a sentence, a word fits the chip, `linkIsFault` names the socket closed,
the room full and the two worlds parted **and never a stall**, `SOLO_STATUS`
reports no round trip rather than a round trip of nothing, and — the open
question 10 rule, which is why `join-words.ts` is a file at all — a quiet phone
and a dead line read differently on all three surfaces. No defect: `src` is
untouched, and each assertion was checked by breaking the line it is about.
About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `status.ts` whole, `join-words.ts` whole, what `start-press.test.ts` already covers so the new file does not repeat it, and open question 10 in both headers to find what the load-bearing claim actually is |
| writing | 20 | `packages/net/test/status.test.ts`, `apps/game/test/join-words.test.ts`, the two queue entries |
| looking | 0 | nothing drawn |
| friction | 5 | a coverage scan by file name said 262 render sources were untested, which is false — `frame.test.ts` reaches them transitively — so the scan was thrown away and the gap found by reading the package tables instead |
| landing | 10 | six mutations of `src` to prove each assertion bites, `check:fast`, the commit, `land` |

Bottleneck: **reading** — the tests worth writing were the two claims the file
headers make in prose and nothing enforces, and those are found by reading the
prose, not by looking at which exports have no assertions.

## 2026-09-12 · drop-designs-tab — the DESIGNS tab goes, and what it still held moves to MECHANICS

The NOT BUILT YET sheet's DESIGNS tab read `docs/versus.md`, `teaching.md` and
`alive.md` section by section as backlog. VERSUS is built and its file is a
manual; THE CALL is one design rather than a list; `alive.md`'s numbers were
overtaken (the bulb's depth is 0.24, the runt is retired, the throb rebuilt).
The tab, `design-docs.ts` and its test are gone; THE CALL and the three still-open
questions of `alive.md` are two entries under MECHANIC IDEAS in `ideas.md`, and
`alive.md` opens with a note saying it is a record. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three documents against the shipped tree to see which of their claims still held |
| writing | 10 | the removal across five files, the two `ideas.md` entries, the `alive.md` preamble |
| looking | 0 | nothing drawn |
| friction | 5 | an edit script read the files in cp1252 and stopped on an em dash; rerun with `encoding="utf-8"` |
| landing | 5 | `check:fast`, the commit, `land` |

Bottleneck: **reading** — deciding what was stale meant checking each figure
in `alive.md` against `silhouettes.ts`, not just reading the file.

## 2026-09-12 · limpet-cycle — the director's dev server read `drawLimpetBody` as null

`creature-body.ts` builds its table of body draws at module load out of functions
it imports, and `cling.ts` and `creature-body-worn.ts` imported `drawLivingBody`
back from it — a cycle. The bundle entered from the table's side and never
noticed; `bun run dev` entered from `canvas2d.ts` through `cling.ts`, and the
table was built while `cling.ts` was still evaluating. `drawLivingBody` is its
own module now, and `body-table-cycle.test.ts` holds the table out of every
cycle. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the table, `cling.ts`'s imports, who reaches `creature-body.ts` |
| writing | 10 | `creature-body-living.ts`, the four import changes, the test |
| looking | 5 | the director from this tree on 4387, console clean, the stage drawn |
| friction | 10 | `preview_start director-once` served the main checkout, as the lane skill says it does; the tree's own server was run by absolute path under `timeout` instead. A scan script's import regex matched across two lines |
| landing | 5 | lint, the index row, `check:fast`, the commit, `land` |

Bottleneck: **friction** — starting a worktree's director for a look has no
supported route; `.claude/launch.json` starts the main tree every time.

## 2026-09-12 — test-view-band — the TEST view is the game's own dimensions

The owner: the director's TEST view had a taller ship and black at both
sides, and should be the same stage and the same ship as P1, P2 and the game,
always. One band share for every role (`bandSoloPct`); `bandPct` removed with
its slider rows. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `stage.ts`, `stage-point.ts`, `layout.ts`, `panel-plan.ts`, every `bandPct` reader |
| writing | 5 | `bandHeightFor`, the field and its two slider rows, the comments, the test's wider canvas |
| looking | 10 | `bun run shot` of the GAME column in TEST and P1, then SALVAGE in TEST for both seats' lobes in the shorter band |
| friction | 5 | the browser pane's screenshot timed out twice; `bun run shot` against the tree's own director instead |
| landing | 5 | `check:fast` (one test assumed the narrower stage), the commit, `land` |

Bottleneck: **looking** — a shot of `#stage` is clipped to the wrong box, so
the column had to be photographed instead, and a `--wave` for a wave with
buttons on both seats had to be found by listing the control sets.

## 2026-09-12 · the-weight — a body two thumbs crush, and neither thumb can see the other

THE WEIGHT off `docs/spec/transfers-bosses.md`, built as the owner asked for it:
an ordinary arrival rather than the five-state boss on that page. A sac sinks a
lane a beat, no bolt reaches it and the shield has nothing to say to it, and it
gives to a hand from **each** seat on the body itself held together for
`weightCrushMs`. The hand is the ordinary `grip` — `handMeans` gains `"press"`,
the third thing a hand can be and the first worth nothing without the other
seat's — so nothing new crosses the wire. The whole creature is in what each
screen does *not* draw: a thumb brightens the body on that seat's screen and on
nothing the other phone shows, so neither player can tell whether their partner
has arrived and the only thing that lands two thumbs on one body is one of them
counting out loud. THE BALLOON is the contrast and it is drawn as one: its two
pulls are on both screens, and what the pair says there is *which*; here it is
*when*. Wave 66 in act eight teaches it in three steps, the first of which is the
pair pressing separately and losing the wave to it. About 150 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 35 | the spec's five-state boss, `grip.ts`/`hand.ts`/`grippable.ts` for what a hand already means, `balloon-pull.ts` for the only other two-hand body, `shot-reach.ts` and `hull.ts` for what an arrival can refuse, and `ViewState.role` for how a seat-private picture is drawn |
| writing | 65 | `weight.ts` in sim and in render, `config-weight.ts`, the silhouette off the slumped draft, the six tables the skill names and nine more the compiler found, the wave and its guide, 23 tests across sim and render |
| looking | 0 | nothing looked at — a cloud session cannot, and it is named below |
| friction | 30 | `world.score` had gone from `World` on the origin/main this lane started from, so the creature's score field was deleted before it existed; `creature-kinds.ts`, `living-look.ts` and `ship-notes.ts` were all *exactly* at the 250-line wall, so one row each forced two file splits and a trim; and the shape's dent read as a third lobe on some frames, which `nameability.test.ts` caught and cost three measurements to settle |
| landing | 20 | ten table and count failures found by `check:fast` and fixed one at a time, `perf --unmeasured` for the wave's row, the commit, `land` |

Bottleneck: **friction** — three of the files a creature has to touch were at
the line limit to the row, so adding a body meant choosing two seams that had
nothing to do with the creature.

## 2026-09-13 · the-codex — a fault that takes nothing away and changes what everything means

THE CODEX off `docs/spec/ideas.md`, built as the owner asked for it: a **fault on
a wave** rather than the boss that page imagined. While its key is turned over a
bolt fired red kills what cyan kills, and nothing about the shot says so — the
bolt that leaves the muzzle is the colour the thumb pressed, it sounds like that
colour, and the lobe lights like that colour. What says the key is over is the air
across the field travelling in slow bands, on the **pilot's** screen and on
nothing the navigator sees, so the seat that can read the key cannot fire and the
seat that fires cannot read it. The key turns over every `codexHoldBeats` — four,
a bar — so it is a thing one of them keeps calling rather than a sentence said
once. Wave 67 in act eight is eight ordinary bodies in pairs that straddle the
turn, and it opens swapped. About 120 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `malfunction.ts` and the three faults already there, `fault-emitter.ts` and `fault-beam-ends.ts` for how a fault's cause is drawn, `view-role.ts` for the split, and every colour comparison in the simulation — twelve of them — to find out where a swap belongs |
| writing | 55 | `sim/codex.ts` and `render/codex.ts`, `Bullet.shown`, the swap at the muzzle, the fault's row and its wave, the spec note in the bestiary, 17 tests across sim and render |
| looking | 0 | nothing looked at — a cloud session cannot, and it is named below |
| friction | 25 | the swap wanted twelve edits and got one: `Bullet.shown` against `Bullet.color` moved it to the muzzle, where every comparison downstream is right by construction. Then taking THE CODEX off the ideas list broke five things that read the backlog off the spec — a shape-sheet draft offered to it, a field scene drawn at it, the catalogue's draft count, and two director tests — each of which had a precedent to follow (The Mother's `free`, THE CHOIR's cut bullet) and had to be found |
| landing | 25 | `midCol` re-derived and caught by `copies-table.ts`, a guide line 34 characters too long, `mechanics.ts` one line over its limit, `perf --unmeasured` — and then the full check found a real defect in `bun run land` itself: `filesLine` hung ", and 46 more" on the end of an unverified entry's `Files:` line, which `splitFiles` reads as a path, so every truncated entry it had ever written was marked **stale** in `bun run queue` from the moment it was written. The count is in the body now, and the entry already on the trunk is repaired |

Bottleneck: **friction** — the mechanic itself was one function; what cost the
afternoon was that an idea leaving `docs/spec/ideas.md` is read by the shape
sheet, the director's backlog and two test suites, and none of them says so where
the bullet is.

## 2026-09-13 · the-cairn — a boss taken apart by hand, into the rocks it is made of

THE CAIRN off `docs/spec/transfers-bosses.md`, built as the boss that page
argues for rather than as an arrival taken out of it: seven of the field's own
two-tile rocks in one outline five columns wide, standing still, and nothing
either control does reaches it — a bolt goes up one of its lanes and **past** it.
A grip carried sideways drags one unit out of the side the finger went and it
falls as a plain rock, so the boss comes apart into the game the pair already
knows and the whole fight is rate: every answer is a rock the navigator has to be
under. The page's one open question — what stops a pair pulling nothing and
waiting — is answered without the descending pile it feared: a stack that has
stood `cairnShedBeats` lets one go itself into a column the rng drew, announced
on **player 1's screen alone**, so a pull is *you choose an edge* and a wait is
*the pile chooses the middle*. Wave 68 in act eight. About 140 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the two design pages, `boss.ts`/`boss-state.ts`/`wave-start.ts` for how a boss is installed, `grip.ts`, `hand.ts` and `grip-push.ts` for the gesture that was already there, `span.ts` and `meteor.ts` for what size a rock actually is, and THE WEIGHT's whole diff as the pattern for a body two hands answer |
| writing | 70 | `sim/cairn.ts` and its state, the boss entry, the install, the shed clock, `render/cairn.ts` and `cairn-settle.ts`, the wave and its guide, rows in eleven tables the compiler named one at a time, 17 tests across sim and render, and the four spec pages |
| looking | 0 | nothing looked at — a cloud session cannot, and it is named below |
| friction | 20 | the design page asks for units at the size the game draws a rock **and** for a pile wider than the Warden, and the two do not both fit: seven two-tile rocks come to five tiles across, so the span came out at five and the courses at four, two and one. Finding that out cost three goes at the arithmetic before the rule that had to win was obvious. Then `isBossBody` turned out to answer two questions — *does not fall* and *takes no hand* — and this is the first body that is one and not the other |
| landing | 20 | `creature-kinds.ts`, `boss-state.ts` and `ship-notes.ts` each a row over the 250-line limit, two of them fixed by cuts `packages/content` had already drawn; a guide line seven characters too long; a bolt test whose window was so long the pile shed a rock in the middle of it |

Bottleneck: **writing** — the rules are one file and the fight is one sentence,
but a new `CreatureKind` is a row in eleven tables and a new boss is a row in
six more, and the compiler names them one at a time.

## 2026-09-13 — well-boss — THE WELL: the field turned inside out, on one phone

The owner asked for the idea on `docs/spec/ideas.md` by name, as a boss wave.
Both of the questions that page left open were answered by building it: it is a
boss rather than a modifier wave, and **one phone flips** — the pilot's, because
a well on both screens is a skin on the field with nothing for the pair to say.
Nothing in the simulation changes: `WellState` is a tag, there is no `stepWell`,
and a test plays the same wave twice from one seed, with and without the boss,
and compares the two worlds tick by tick. What changes is `packages/render`,
where five new files draw the columns as the hours of a clock, the rows as rings
closing on the ship, and the seam above it where the field's two walls meet.
Wave 69 in act eight. About 65 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the idea and the two pages that argue about it, `boss-entries.ts`/`boss-state.ts`/`wave-start.ts` for how a boss is installed, then the whole of the frame — `canvas2d.ts`, `frame-field.ts`, `frame-ship.ts`, `creature-place.ts`, `effects.ts` — because the question this boss asks is *where is a body drawn*, and the answer turned out to be `tileCX`/`tileCY` in 76 files |
| writing | 25 | `render/well.ts` and its three draw files, `sim/well.ts`, the wave and its guide, rows in nine tables the compiler named one at a time, 17 tests across sim and render, `bosses.md` 11.12, and five queue entries |
| looking | 5 | three `bun run frames` of the pilot's screen and one of the navigator's; the first said the lanes were invisible against the rings and the second that a body arriving sat on top of its own numeral |
| friction | 5 | `packages/sim` may not import `packages/content`, so the sim test authors its own queue; `effects.ts` and `ship-notes.ts` were both on the 250-line ceiling, and the second needed a cut (`ship-notes-boss.ts`) before a two-line note would fit |
| landing | 15 | the full check, the commit, and `bun run land` |

Bottleneck: **reading** — the projection itself is forty lines of trigonometry,
and finding out how much of the frame it could honestly replace meant reading
the whole field pass first. The thing that made it affordable was that a body
draw already takes an `x` and a `y` (`creature-body.ts`), so every silhouette in
the game came round the clock for nothing.

## 2026-09-13 · watch-cloud-waves — four waves the cloud landed, watched at tempo on a real machine

The cloud session that built THE WEIGHT, THE CODEX, THE CAIRN and THE WELL
could prove its tests and nothing about the frame, so it queued the four as
*unverified*. This lane opened each wave in the preview, drove it through the
testing handle, and photographed it with `bun run frames`. Two of the four
were wrong: a hand pressing THE WEIGHT was drawn on the partner's phone, giving
away the split the boss is built on; a hand pulling at THE CAIRN was drawn
under the pile and said AIM. Both fixed, both tested; THE CODEX and THE WELL
observed and left as they are. About 130 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | `briefing.ts` for the intro timer and READY? gate, `keys.ts` for why ArrowRight jumped waves, `grip.ts`/`frame-field.ts` for the draw order, `boss-draw.ts`/`cairn.ts` for where the pile is clipped |
| writing | 30 | the `press`/`pull` skips in `drawGrips`, `cairn-hand.ts` drawing the ring round the standing stones from the boss pass, the `grip-beam.ts` split that kept `grip.ts` under the line, three tests and two INDEX rows |
| looking | 45 | fourteen frames across the four waves, at both seats, before and after each fix; three `bun run perf` runs the machine flagged every time |
| friction | 15 | guide pages did not turn under `send` until `advance(2)`; a `--press` at tick 60 landed on an empty field; a probe test at the repo root could not resolve `@neon-spore/content`; the cairn commit went through with `grip.ts` at 264 lines because a `tail` hid the check's exit code |
| landing | 10 | `check:fast` twice, one amend, the queue and this entry, `bun run land` |

Bottleneck: **looking** — a wave the cloud built has to be *seen*, at each
seat, in the state where the defect would show, and the only way to that state
is to drive the game there frame by frame; the fixes themselves were an hour
of the four.

## 2026-09-13 · queue-lanes — an entry reserved for a cloud or a local session, and six of them written for the cloud

The owner wants to hand work to a cloud session from his phone and keep some
for a machine with a screen, so the queue learns a `Where:` line: `cloud` or
`local`, marked in the listing, passed over by `next` and refused by name to
`take` when the session is the other kind — known by `CLAUDE_CODE_REMOTE`,
the signal the web image already sets. Then six entries for the cloud, all
his: two phones that reconnect on different waves, the menu's front page
(PLAY, one CONTINUE, TESTING behind three presses on the spore), a readable
colour scheme and face, a sign-in in place of the recovery code, nicknames
where the game says Player 1 and 2, and a difficulty. About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `queue.ts`, `run.ts`, `claim.ts` for the shape a field takes; `session-start.ts` for how a cloud session is known; then `menu-entries.ts`, `menu-link.ts`, `nickname.ts`, `names.ts`, `desync.ts`, `protocol.ts` and `config.ts`, so that each entry names real files and the right knob (falling speed is `bpm`) |
| writing | 20 | `where.ts`, the field on `Item`, the three places in `run.ts`, seven tests, the queue's preamble and `cloud-session.md`, and the six entries |
| looking | 0 | nothing drawn |
| friction | 25 | a heredoc longer than the shell would take, twice; `queue.ts` two lines over the limit; two titles over 80 characters; then `main` red under the lane — the owner's director save of FIRST STEP had broken the perf baseline's row and the lockstep test's hand-written script, and both were fixed here so the lane could land (queued: the save should do the first itself, and the test should own its wave) |
| landing | 10 | `check:fast` twice, the commit, `bun run land` twice |

Bottleneck: **friction** — a trunk that went red under the lane by a
commit no check had seen; the tool change itself was twenty minutes and the
six entries another twenty.

## 2026-09-13 · director-repeat — a cleared wave on the stage stops and asks REPEAT WAVE?

The director's stage used to rebuild the wave the instant it cleared, so the
author never saw it clear. Now it pauses under a grey veil that says REPEAT
WAVE?, and a click anywhere on the screen — or P, which the PAUSED line under
the veil still names — runs it again from the top. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `stage.ts` for `needWave` and the transport, `stage-afterrun.ts` for the injected shape a stage helper takes and its test |
| writing | 10 | `stage-repeat.ts`, the veil in `index.html` and `director-field.css`, the wiring and two trims that kept `stage.ts` on its line, five tests |
| looking | 10 | the director launched by absolute path in this tree, the wave cleared by hand through `neonSporeDirector`, the veil seen up over the stage and answered by a click and by P |
| friction | 5 | `.claude/launch.json` started the *main* checkout's director, as `working-with-claude.md` says it will; `bun run dev` is refused to a session by the guard, so the server was `tools/director/server.ts` by absolute path |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **looking** — getting a director that serves *this* tree in front
of the browser pane took as long as writing the feature.

## 2026-09-13 · meteor-reflected — a deflected rock keeps the look it fell in

The bounce off the shield, and the replayed last step of a fall, drew a grey
stone from before the rocks had looks; the field had been drawing that same
rock as a blaze, a comet or a smoulder by its own id. The deflect and breach
events now carry the body's seed and pits, and both effects draw it with
`drawRockBody` — the torch alone keeps its grey stone and ember ring. About
20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `deflect.ts`, `rock-impact.ts` and `effects-breach.ts` for where the grey came from; `meteor-looks.ts` for how the field picks a look |
| writing | 10 | seed and holes on the two events and their three emitters, the two effects, the split of `deflect-stone.ts` and `rock-impact-state.ts` that kept both under 250 lines, four stale tests rewritten to prove the bounce's ops are `drawRockBody`'s |
| looking | 5 | THE ROCK photographed at three ticks with a guard press, the bounced rock seen orange and faceted under DEFLECTED |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — two files that were already on the line had to be
split before the fix would fit.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — THE HANDOVER, the fifth malfunction

The owner asked for a control-set malfunction that swaps the two players'
controls at a set beat and gives them back at a set beat. `docs/spec/ideas.md`
already held it as **Handover**, unbuilt over three questions, and all three are
answered by building it: the radar travels with the controls (it is the same
screen), a queued shield move survives (nothing in the simulation moves at all),
and whether it reads as exciting is still a question for a prototype. Nine beats
in, the two panels change screens; eight beats later they come home; both phones
are counted down to it and counted back out of it. The substitution is one
function called twice — the renderer seats a frame, the host seats the layout a
finger is tested against — and every per-seat fact in the game travels with it.
Wave 70 in act eight. About 90 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `malfunction.ts` and the four faults already there, `codex.ts` for the shape of a fault that takes nothing, then the whole input path — `touch.ts`, `input.ts`, `lockstep.ts` — to find out what "swap the controls" can honestly mean on a wire, which is where the line between a *panel* and an *identity* came from |
| writing | 35 | `sim/handover.ts`, `render/handover.ts` and `handover-look.ts`, the beam's own branch, three config numbers, the wave and its guide, rows in six tables the compiler named one at a time, 22 tests across sim and render, the bestiary's section, and four queue entries |
| looking | 10 | three `bun run frames` of the pilot's screen; the first said the beam was a bar down the middle column with the bodies behind it, so the fault lands on the band twice now, once for each seat's half |
| friction | 10 | four files sitting on the 250-line ceiling before the edit (`canvas2d.ts`, `mechanics.ts`, `stage.ts`, `act-8.ts`); `window` is a banned word in `packages/sim` and the window function had to be called something else; and a comment written beside the wave was deleted by the director's own serializer, which regenerates every act file below the array |
| landing | 15 | the full check, the commit, and `bun run land` |

Bottleneck: **reading** — the mechanic is thirty lines and finding out *where*
it was allowed to live took the whole input path. The thing that decided it:
`lockstep.press` refuses a press attributed to the peer, so the wire's two
identities cannot trade — only the panel can, and the simulation never learns
that anything happened.

## 2026-09-13 · queue-the-weights-guide — THE WEIGHT's rehearsal

Queue item: the wave that introduces THE WEIGHT carried three lines of prose
and no `scene`, for a lesson that is a negative. Four pages now: each seat's
thumb alone on the sac and nothing giving, both on one beat and the calipers
closing, and a second sac left alone reaching the hull. On the way, `bun run
frames --opening guide` turned out to run two film ticks per count — the
frozen `paint` wrapper dropped `dt` — which is fixed in its own commit. About
30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry, `new-tutorial`, THE BALLOON's and THE MAGNET's films, `weight.ts`, the page-position test |
| writing | 5 | `scenes/the-weight.ts`, the wiring in `scenes.ts` and `act-8.ts` |
| looking | 10 | a probe printing the film tick by tick to place the pages; the pilot's page and the crush photographed |
| friction | 10 | every guide capture came back past the moment asked for, until `freezeClocks` in `tools/frames/page.ts` was found dropping the frame's `dt` |
| landing | 5 | `check:fast`, `bun run index`, the commits, `bun run land --keep` |

Bottleneck: **friction** — a camera that photographed twice the tick it was
asked for cost as long as authoring the film.

## 2026-09-13 · queue-the-cairns-guide — THE CAIRN's rehearsal

Queue item: the wave that introduces THE CAIRN carried prose and no `scene`,
for a gesture the game had taught only on a falling rock. Five pages now: a
still thumb on the pile and nothing happening, the thumb carried right and a
rock falling, the pilot alone watching the lane the pile will drop into, the
navigator's dome under the pulled rock, and the rock nobody pulled reaching
the hull. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `cairn.ts`, `grip-push.ts`, THE HAND's film for a carry authored on a running hold, `dragSeat` |
| writing | 5 | `scenes/the-cairn.ts`, the wiring |
| looking | 5 | a probe of the film tick by tick — the first draft's carry was the navigator's and `dragSeat` sends every carry as the pilot's, so the hand became the pilot's; two pages photographed |
| friction | 0 | — |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **reading** — finding that a film's carry is always the pilot's
took the one probe run that showed the pile ignoring the hand.

## 2026-09-13 · queue-the-shape-sheets-cairn-card — the CAIRN card takes the field's stack

One stack table for THE CAIRN, in `content/cairn-shape.ts`, read by
`render/cairn.ts` and the shape sheet's `pile()` alike: four stones on the
ground, two, one. The barrel it was exported through was already at its
250-line limit, so the content barrel was split by subject like the sim's,
the shapes into `index-shapes.ts`. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `cairn.ts`'s courses, `pile.ts`'s own, `collected.ts`'s PULLED card |
| writing | 5 | `cairn-shape.ts`, the two callers, the PULLED unit pulled right |
| looking | 5 | `shapes:still all "THE CAIRN"`, rasterised and cropped — four, two, one |
| friction | 5 | `content/src/index.ts` one line over the limit; a long-axis count moved with the card |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **friction** — a barrel at its limit turned a one-line export
into a split by subject.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the menu's front page is four rows

Queue item, the owner's, six changes to the menu in one lane because each moves
a row the others move too. The front page is PLAY, HOW TO PLAY, SETTINGS and —
while there is a room — LEAVE ROOM. RESUME and CONTINUE are one row that means
all three things it can mean; CONTINUE is offered only while both phones are in
the room, and with nothing played yet it is the room's own START, so a press on
one phone cannot begin a wave on one of two. The seat cards and the room's code
moved onto the PLAY page, WHAT THIS IS moved to the top of HOW TO PLAY, and the
rig lost its row: three presses on the spore over the wordmark open it. About
55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the six menu files and the two that answer them (`shell.ts`, `link.ts`), and then `lockstep`'s ready handshake, because the honest question under item 2 is what a CONTINUE in a room is *allowed* to do |
| writing | 25 | the three lists and their keys, the PLAY page, the spore's counter, `paintLink`'s new rules, `menu-door.ts` to get `menu.ts` back under 250 lines, and 14 tests that drive the real lists rather than reading them |
| looking | 0 | none — a cloud session cannot see the page, which is what this item's own note says |
| friction | 5 | `menu.ts` was at 264 lines after the edit and had to be split before anything would build |
| landing | 10 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the six changes are one shape, so they land together or
not at all, and the keys are what hold the whole thing up: a row is addressed by
`setEntry` from a file that does not know which page it is drawn on, so moving a
row between pages is a rename everywhere or it is nothing.
## 2026-09-13 · queue-the-well-draws-none-of-the-fields-transients — the well draws what was placed

Every transient placed at a pixel when its event arrives — the burst table,
a breach's and a deflection's bursts, a kill's sprite, a pod's implosion —
now goes through one `put` (`wellFromFlat` on the well, identity on the
flat field) and the well's pass draws the sparks and the sprites. The half
that asks `creatureCenter` each frame is queued as its own lane. `effects.ts`
went over its limit again, so `ingest` moved to `effects-frame.ts` beside
the other three verbs. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `well-draw.ts`, `effects.ts`, `effects-ingest.ts`, `effects-breach.ts`, `effects-body.ts`, the well test |
| writing | 5 | `put` in `ingestAll` and `IngestOneCtx`, `spawnSprite`, the two draws, three tests |
| looking | 10 | strips of THE WELL around a kill and around the breach at tick 1200 — the authored columns are `mapCol`'d, so the cannon goes to column 5 for the first body |
| friction | 5 | `effects.ts` at 263 lines: `ingest` moved out as `ingestAll` |
| landing | 5 | `check:fast`, the queue entry for the other half, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **looking** — finding the tick the breach fires took a probe;
the frames tool cannot say when an event happened.

## 2026-09-13 · queue-a-crossing-rock-has-no-blip — the crossing rock's mark in the seam

A rock that will come over a side wall is now announced on the well: in the
seam, on the circle of the row it will hold, its head just past the wall on
its side and its tail back across the seam, pointing the way round it will
fly. `drawWellArrivals` moved to `well-arrivals.ts` with it, on
`well-draw.ts`'s line limit. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `radar-blip.ts`, the flat mark in `field.ts`, `rockEntryCol`, the well's polar helpers |
| writing | 10 | `well-arrivals.ts`, four tests |
| looking | 5 | THE WELL with two crossing rocks put in its queue for the picture only — the mark at one o'clock, the rock on the same circle at half past three, the second mark at eleven |
| friction | 0 | — |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **writing** — the arc's sense: canvas angles run the other way
from the clock's, and the tail was drawn the long way round once.

## 2026-09-13 · claude/queue-the-wells-screen-answers-no-finger-on-the-field — THE WELL's screen answers a finger on the ship and on a body

The well drew the hull as a ring and the bodies round it, and `touchDown`
answered every press against the flat field, so a thumb on the drawn cannon
took nothing and a thumb on empty space took a body. `touch-well.ts` asks the
same two questions of the circle: the cannon's grab circle at its hour on the
hull ring, a body at `wellPlace` with the well's glide, the column under a
finger as the hour under it, the seam at twelve as a wall. `touch.ts` and
`touch-ship.ts` both sat at the line limit, so `lobeUnder` went to
`touch-lobe.ts` and the lift rules to `touch-hand.ts`. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `touch.ts`, `touch-ship.ts`, `well-draw.ts`'s body placement, `well.ts` |
| writing | 25 | `touch-well.ts`, the `well` marks on the holds, twelve tests |
| looking | 0 | nothing visible moves in a still frame — the change is what a press answers |
| friction | 10 | two files over the limit at once, a CRLF write, a five-argument `touchMove` the tests ran but the typecheck refused |
| landing | 10 | `check:fast` twice, `bun run index`, the queue entry for the hand ring, the commit |

Bottleneck: **writing** — the file limit: the well's answers were a fourth
file's worth on top of two files already full, and both had to be split before
the new one fitted.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — two phones that parted start again together

Queue item, the owner's, from a two-device game where a phone dropped its
socket and came back and the two of them were afterwards on different waves
with nothing on either screen saying so. Now a parted run brings the menu up on
the PLAY page on both phones, CONTINUE stops meaning *back to the field* and
starts meaning *the room's START*, and two presses stamp a fresh beat zero — on
the wave the room says the pair reached, with that wave's guide if it has one.
About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `link.ts` and `link-run.ts` for where a parting is noticed, `room-start.ts` and `start-gate.ts` for what a press is worth, `desync.ts` for whether a reconnect can report a false one, and `waves.ts` for what already opens a guide |
| writing | 30 | the wave on `onStart`, the room's mark actually being kept, the restart in `pressStart`, the menu opening on the parting's edge, CONTINUE's three lines, `menu-bindings.ts` to get `menu.ts` back under 250, and six tests across the app and the real Durable Object |
| looking | 0 | none — a cloud session cannot open two phones, which is what this item's own note says |
| friction | 10 | a room code with a B in it is not a room code (the alphabet drops every lookalike), which read as a hung test and took the shared relay down with it; and a wait counted off one phone's message tally applied to the other's |
| landing | 10 | `check:fast`, the commit, `bun run land` |

Bottleneck: **reading** — the change is small in every file it touches and the
question underneath it is not: *what may one phone's press do to two worlds*.
The answer was already in the room — two presses and only two presses stamp a
beat zero — so the work was letting that rule run a second time rather than
writing a new one.

## 2026-09-13 · claude/queue-the-wells-guide-is-prose-and-the-picture-it-desc — THE WELL's rehearsal shows the fold

Four pages and one body: the navigator's flat field with a red body coming
down the fourth column, then the pilot's clock with the same body at four
o'clock — the seat switch is the fold, because the film lays each page out
for the seat it shows and the well is only drawn on the pilot's — then the
navigator's shot down the same lane, then the seam, the cannon carried from
one o'clock to eleven the long way round. The caption's `body` anchor placed
its ring from the flat field, so on the pilot's page it would have stood in
the empty middle; the well's body placement is now one call, `wellBodyAt`,
shared by the drawing, the finger and the caption. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the tutorial skill, THE CAIRN's film, `caption-anchor.ts`, `guide-film.ts`'s per-seat layout |
| writing | 15 | `the-well.ts`, `wellBodyAt`, the anchor's well branch, two tests |
| looking | 5 | page two through `bun run frames --opening guide --guide-page 1`: the ring on the body at four o'clock |
| friction | 10 | the fall rate (a row every two beats, not one), the hit-needs-a-page rule, a caption a character long, `startWave` taking an index |
| landing | 5 | `check:fast`, `bun run index`, the commit |

Bottleneck: **friction** — timing a film against the real fall: the page
boundaries were laid out for a row a beat and had to be doubled once the probe
showed where the body actually was.

## 2026-09-13 · claude/queue-should-the-wells-seam-cost-travel — the seam does not cost travel, decided

A question item, answered before the sitting began: the owner chose *leave
it* from the three the entry named, so THE WELL stays a pure projection and
no step limit goes into `config-boss.ts`. The item is closed and the spec's
sentence that pointed at it as an open question now records the answer. No
code. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | the sentence in `docs/spec/bosses.md` |
| looking | 0 | — |
| friction | 0 | — |
| landing | 0 | `queue done`, the commit |

Bottleneck: **none** — the answer was already in hand.

## 2026-09-13 · claude/queue-the-cairn-paints-at-two-and-a-half-times-the-run — a burning rock holds the gradients that never move

The render-perf lane on THE CAIRN. The pile was measured alone with the stub's
tally, which showed where the frame goes: seven full fires under one clip,
about 1,600 ops for the pile and a third of the run's gradients built fresh
each frame for arguments that never change. The identical half — gradients
whose every argument is `r` and a constant, held between frames — landed with
a `wave-budget.test.ts` row pinning it; the structural half is a look
question (the pile frozen per `units`) and went to the owner, and the exact
cull of clipped primitives is queued. Two log-comparison tests had to start
cold once a second draw at one radius logged fewer gradient builds than the
first. About 60 min across the break.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `cairn.ts`, the three looks, `rock-wake-fire.ts`, the render-perf skill |
| writing | 20 | `gradient-held.ts`, the four callers, the budget row, the queue entry |
| looking | 10 | the tally before and after, the ordered log diff |
| friction | 15 | a Python heredoc that ate its own backslashes; two tests comparing a warm draw to a cold one |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **friction** — the log-comparison tests were written before any
gradient outlived a frame, and finding why a warm second draw differed took
longer than the fix.

## 2026-09-13 · claude/queue-a-director-save-can-land-main-red-and-two-tests — a save marks the baseline, and the lockstep test owns its waves

Two halves. The save now runs `bun run perf --unmeasured` in a fresh `bun`
between the write and the commit — in-process it would read the `WAVES` the
director loaded at start-up, not the files just written — and offers
`tools/perf/baseline.json` to the commit, which takes it only if it moved;
`DIRECTOR_NO_COMMIT` turns both off together. The lockstep test stopped
reading `WAVES[0]` and `WAVES[1]`: it carries two small waves of its own
through `queueFromWave`, and its press script shrank from thirty-three presses
to thirteen with the wave it was actually about. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `waves-commit.ts`, `waves-api.ts`, `unmeasured.ts`, `run.ts`, the test |
| writing | 15 | `waves-baseline.ts` and its test, the wiring, the test's two waves, `performance.md` |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **writing** — the press script had to be cut back to the presses
that were about the one body, and the tick the boundary falls on found again.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the menu's colours, named and measured

Queue item, the owner's: the menu is hard to read on a phone. It was — a
tagline at 3.8:1 and a description at 2.2:1, purple on purple at ten pixels.
`menu.css` now opens with one block of named tokens, each with the job it does
and its ratio against the ground beside it, and every colour in the file is one
of them. The two the owner could not read are gone; nothing on the page is
under 8:1. The face is Space Grotesk from Google Fonts, swapped in over a real
stack, with the field's Courier left alone. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `menu.css`'s eighteen hexes and where each is used, `build.ts` for what the bundler does to a `<link href>`, and `game.css` for the line this must not cross |
| writing | 15 | the token block, the eighteen substitutions, the face and its two preconnects, and a test that measures every ink token out of the file |
| looking | 5 | `bun run build:game`, to see whether an absolute URL survives a bundler that hashes every link it can follow — it does, and the built page carries it |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the substitution is mechanical and the decision under
it is one line long: what a colour is *for*. Every token is named for a job, so
the next lane picks a value by asking what it is writing rather than by matching
a purple.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the two people's names, where P1 and P2 were

Queue item, the owner's: the game called the two seats P1 and P2 in the three
places a person reads one mid-wave, and he wanted the nicknames there. The
siren's chip says the name and grows to it, the word under a hand says it, and
a rehearsal's caption says it — by substitution on PLAYER 1 and PLAYER 2 rather
than by teaching two hundred content strings a template. The menu's seat cards
say who is sitting in each. A hyphen is a letter now, because Anne-Marie is a
name. Everywhere a name is missing, every one of them draws exactly what it
drew before. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `siren-seats.ts`'s fixed pill and the arithmetic the whole cluster hangs off it, `grip.ts`'s measured plate, `guide-caption.ts` for where a caption's words come from, and `seat-name.ts`, which had the mechanism already |
| writing | 30 | the pill sized to its label, the cluster laid out from two widths, the names threaded down four draw chains, `withNames`, the seat cards, the hyphen, and 17 tests over four pure functions |
| looking | 0 | none — a cloud session cannot see a chip, which is exactly what this one changes the size of |
| friction | 5 | `packages/render` may not import `@neon-spore/net`, so the test that measures a chip against the longest name writes the twelve out and says why |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the substitution is four lines and the geometry under
it is the work: a pill that was 34 pixels wide in six expressions, one of them
exported and read by the director.

## 2026-09-13 · claude/queue-the-map-editor-inserts-a-beat-row-and-removes-on — a beat row opened and a beat row taken out

The owner's two buttons on the map. `insertBeat` and `removeBeat` are the
edits, in `paint.ts` beside the others; the labels grew two glyphs on hover
and moved to `grid-rows.ts` when `grid.ts` went past the line limit with them
in it. A removal of a row with something on it asks in plain words first.
Checked in the browser against the worktree's own director: the glyphs show
on hover beside the number, an insert at beat 4 moved FIRST STEP's seven later
bodies down one, an empty row's remove brought them back, and the remove of a
full row asked and, refused, changed nothing. One deliberate departure from
the entry: beat 0 can be removed too, since an insert before it would
otherwise have no way back in an editor with no undo. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `paint.ts`, `grid.ts`, the map's css, the selection |
| writing | 15 | the two verbs, `grid-rows.ts`, the css, the tests |
| looking | 5 | the director in the browser, the PNG |
| friction | 0 | — |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **writing** — the label was a button, and a button may not hold
buttons, so the label and its verbs became a file of their own.

## 2026-09-13 · versus-cairn-pile — THE CAIRN's pile is a record, and two frozen piles stand beside it in VERSUS

The owner's answer to the pile question — VERSUS. `cairn.ts` split three
ways: the geometry (`cairn-units.ts`), the shipped picture (`cairn-pile.ts`)
and the record between them (`cairn-look.ts`, `CAIRN_LOOK.pile`); the tell and
the hand read the geometry file directly. Two candidates on `cairn:pile`:
STILL bakes the shipped seven fires once at one instant, BANKED bakes grey
stone once and keeps only the heat live, an ember glow inside the outline and
the seams breathing. A pose of the pile standing whole (`poses-cairn.ts`,
`CAIRN · THE PILE`, a tile crop seven wide on the middle stone) and its row.
BANKED's first shot had the glow washing every stone to white; it is a tenth
of that now and the seams carry the colour. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the candidate format from git history, the pose kit, the pose test, `baked.ts` |
| writing | 20 | the split, the two paints, the pose, the row |
| looking | 5 | the two versus shots |
| friction | 5 | a glow that made grey stone white, reshot once |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **writing** — two bakes that are nearly the same twenty lines,
kept apart because `adopt` moves a candidate's own siblings and nothing at the
slot's level.

## 2026-09-13 · claude/queue-creaturecenter-assumes-the-flat-field-so-the-wel — creatureCenter answers for the well

`creatureCenter` and `creatureRadius` take the world now and ask `wellShown`
before placing, so every mark drawn around a body — the hand's ring, the lock
corners and their line, a shell's clasp, a rind's shed, a coil's charge —
stands on the body where THE WELL draws it, at `WELL_BODY` of its flat size.
`wellBodyAt` moved to `well-body.ts` to break the import loop with
`well-draw.ts`; the touch layer keeps `flatCenter`/`flatRadius` by name
(`creatureAt` moved to `creature-under.ts`). `drawWellBodies` draws the grips,
the lock marks — radial on the well, from the cannon lobe straight to the body
(`wellLockLink`) — and `bodies.drawOnBodies` after the bodies. The proof is a
grip by p1 in a well world whose added arcs all sit at `wellBodyAt` and none at
the tile. Thirty-odd call sites threaded the world; `strand-bead.ts` went over
the limit and lost its raisin to `strand-raisin.ts`. About 90 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the two signatures' callers, `well-draw.ts`, `lock-mark.ts`, the frame harness |
| writing | 45 | the world threaded through thirty files, `well-body.ts`, `creature-under.ts`, the radial lock link, the proof |
| looking | 5 | one `bun run frames` of the pilot's hand at six o'clock |
| friction | 15 | an import loop, a file at 250 lines, a second at 255, an unused import |
| landing | 10 | format, check:fast twice, index, the commit |

Bottleneck: **writing** — a signature that thirty files call, each with a
`cfg` in hand and no world, so the world had to be carried down through the
callers first.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — three difficulties, and the one number they move

Queue item, the owner's, with his answer to its `Asks:` — the tempo alone, and
today's game is Medium. Easy is 80, Medium is 96 and Hard is 120, all three
whole numbers of ticks to the beat. The level is stored beside the device's
progress, chosen on a page behind PLAY's DIFFICULTY row, sent to the room and
handed back on every welcome so both phones take their beat from one answer,
and changing it takes the run back to the first wave behind the same question
LEAVE ROOM is behind. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `config.ts` for the tick rate the tempo has to divide, `progress.ts` for what a device already remembers, and the wire from `protocol.ts` through the room to `link.ts` for where a pair's one answer can live |
| writing | 35 | `sim/difficulty.ts`, the level on the wire and in the room, the level on the link's status and at beat zero, the page and its three rows behind two-steps, the row that says which is on, and 14 tests across the sim, the app and the real Durable Object |
| looking | 0 | none — a cloud session cannot see a menu page, which is what most of this is |
| friction | 10 | `apps/server` depends on `@neon-spore/net` and deliberately not on the rules, so the type came out through net; and a test that opened a third phone on one room hung, because a room refuses a third socket |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — three tempi is a one-line table and everything else is
the path a chosen level takes: storage, wire, room, status, beat zero, and the
one place it may be applied, which is a run that is starting anyway.

## 2026-09-13 · claude/queue-the-wells-cannon-can-be-held-now-but-the-hands-r — the hand's ring on THE WELL's cannon

`drawShipHand` takes a `PlaceHand` now — the grab circle and the turn its
swelling stands at — and the well's ship pass calls it with `wellHandPlace`
(`well-ship.ts`): `wellCannonGrab`/`wellShieldGrab` at the world's column,
turned to the lobe's hour, so the cup, the slide arrows and the maw all sit on
the lobe the way they sit on the flat hull. The turn is a rotation about the
ring's own centre rather than a draw at the origin, so the canvas log still
finds the cup at the grab and the proof reads it there: a `Path2D.arc` at
`wellCannonGrab` with `held: true`, none without a hand. The picture needed a
preview and a synthetic `pointerdown`, which is queued as the frames tool's
gap. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `ship-hand.ts`, `well-ship.ts`, `touch-well.ts`, the canvas stub's log |
| writing | 15 | `PlaceHand`, `wellHandPlace`, the well branch's call, the proof |
| looking | 15 | a preview of this tree, a synthetic press on the lobe, one Playwright shot |
| friction | 0 | — |
| landing | 5 | format, check:fast, the queue entry, the commit |

Bottleneck: **looking** — the frames tool has no flag for `view.hand`, so the
one picture the lane owed took a preview, a browser pane and a scratch script.

## 2026-09-13 · claude/queue-the-directors-stage-speaks-for-its-role-bar-whil — a round's slabs answer the seated role

`StageGauge` and `StageSnake` have no `role` of their own any more: the slabs
are placed with `layout().role`, and the layout `stage.ts` hands in is already
seated by `handedLayout`, so while THE HANDOVER has the panels traded a press
on the director's canvas is answered where the frame draws the button. The
briefing gate's `speaksFor` and `pointerSeat` stay on the role bar — those are
who is pressing, not which panel. One test stands a gauge round on a traded
handover wave and presses the call where the pilot's screen now draws it.
About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `render/handover.ts`'s line between panel and identity, the two listeners, the gauge test |
| writing | 10 | the two interfaces, `stage.ts`, the traded case in `stage-gauge.test.ts` |
| looking | 0 | none — a hit test is proved by the command it sends |
| friction | 5 | a two-line comment put `stage.ts` over the 250-line limit; the trunk had diverged from `origin/main` twice before the lane opened, once mid-turn |
| landing | 5 | format, check:fast, the queue entry, the commit |

Bottleneck: **friction** — the trunk, not the task: two rebases of `main` for
a ten-minute change.

## 2026-09-13 · claude/queue-the-handover-makes-no-sound — THE HANDOVER, heard

`mixer-handover.ts` hears the trade the way the cannon's column is heard: a
`handedOver` edge between two frames, out of `Memory`, so the simulation still
emits nothing for the fault. Two sounds already in the catalogue and written
for exactly this — `assist.handOver`, a tone crossing the stereo field, on the
beat the panels change screens; `assist.takeOver`, the same crossing back, at
six tenths, on the beat they return — go from spare to bound, and the SOUND
sheet, the wiring list and the spare count follow. `NO_SUBJECT` moved to
`sound-link-none.ts` when the two reasons put `sound-link.ts` over its length.
About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/spec/audio.md`, `mixer.ts`, `mixer-pulse.ts`, the spare half of the catalogue for a sound already written for a control changing hands |
| writing | 10 | the mixer file, the memory field, the two catalogue entries, four mixer tests, the document's three figures |
| looking | 0 | none — a sound is proved by the id the mixer reached for, and nobody here has speakers |
| friction | 5 | a shell heredoc that would not run; the two excuses put `sound-link.ts` over 250 lines, so the list moved out |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **reading** — finding that the catalogue already held the sound
took longer than binding it, and was worth it: nothing new was written.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — THE HANDOVER's window, authored on the wave

The owner's answer to the `Asks:` this lane filed yesterday: both shapes, and
defined for one wave over a period of beat rows. The fault's arm carries three
optional numbers now — the beat it trades on, how long it holds, and the period
after which it does it again — and a wave that names none of them plays the
game's own figures once. THE HANDOVER names nine and eight, which is what its
guide says out loud. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `handover.ts`'s own `bounds`, and `serialize.ts`, because a field the editor cannot write is a field it deletes the first time somebody saves a wave |
| writing | 20 | the three fields on the arm, `bounds` answering the window a beat is in or next to, the serializer, the director's three boxes, five tests and the bestiary's paragraph |
| looking | 0 | none |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the arithmetic is six lines and the care is in what a
blank box means: an empty field is the wave saying nothing and not a zero, which
is the difference between the game's own numbers and a trade that never ends.

## 2026-09-13 · claude/queue-bun-run-frames-cannot-photograph-a-hand-on-the-s — `--hand` on the frames tool

About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `tools/frames/{capture,flags,spec}.ts`, `apps/game/src/{handle,field-input,viewport}.ts`, `render/stage-point.ts`, the lane that stubbed `setPointerCapture` by hand |
| writing | 20 | `clientOfStage` and `Geometry.toClient`, `FieldInput.shipGrab`, the handle's `shipGrab`, `tools/frames/hand.ts`, the flag and the spec, six tests |
| looking | 5 | one real `bun run frames . --wave 1 --seat p1 --hand cannon`, which showed the ring and the slide arrows on the lobe |
| friction | 10 | `main.ts` at the 250-line ceiling; two tests that pin source text (`intro.test.ts`'s destructuring line, `pointer-conversion.test.ts`'s `clientX -` rule) caught the wiring |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **writing** — the handle had to answer where the grab circle is in
screen pixels, which meant an inverse of `pointOnStage` that did not exist.

## 2026-09-13 · claude/queue-the-cairns-pile-draws-the-whole-of-each-stones-f — the pile's fire asks the clip first

About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `cairn-pile.ts`, the three looks, `rock-wake.ts` and `rock-wake-fire.ts`, the render-perf skill, `blobRadiusMul` for the flame's bound |
| writing | 15 | `rock-window.ts`, a `Window` last on every mark and through the three looks, `drawRockBody` and the pile; the proof test; the four budget rows |
| looking | 5 | the ordered log before and after, 36,782 lines to 26,648, checked as a subsequence and for every kept draw's context state |
| friction | 5 | a scratch test outside `packages/` could not resolve the workspace; the boundary case in the window test |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **writing** — a trailing parameter on five marks is small, but it
had to reach every call site in three looks without one being missed, and the
log diff is what says none was.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — THE HANDOVER's guide is a rehearsal

The fault changes the picture, so the guide had to be one: four pages, the pair's
own hands on the first two and the traded panels on the last two, with the lip of
the band counting down through the middle of it. The line that made it drawable
is that a film's page is a **device** and not a panel — `handedSeat` — so the
other seat's half arrives under a corner plate that goes on saying whose phone
this is. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `.claude/skills/new-tutorial` whole, `guide-scene.ts`, `guide-film.ts`, `caption-anchor.ts`, and the four scene tests that decide what a film may be |
| writing | 15 | the seam, the film, the wave's `scene:` line, six tests, the bestiary's paragraph |
| looking | 0 | none — a cloud session cannot watch a film, and it is queued unverified |
| friction | 10 | a caption anchored at a control the traded panel has not got would land on nothing, which set where the window opens and closes; the band draws no words, so the first test read glyphs that are not there and had to ask `bandLobes` instead |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **friction** — both halves of it were the same thing: a traded page
is the other seat's screen all the way down, and anything written against the
page's own seat is written against a panel that is not there.

## 2026-09-13 · claude/queue-hull-traded-answers-the-handover-a-second-way-an — HULL · TRADED goes to VERSUS

Queue item: the shape-sheet's `HULL · TRADED` was drawn for THE HANDOVER
before it was built and never carried to VERSUS. `handover:notice` / `hull`
puts two exchanging lobes on the real hull for the length of the window,
under the shipped plate; the announcement became a patchable record and the
pose opens the pilot's phone a beat before the warning. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `handover-look.ts`, the cairn candidate's shape, `hull.ts`'s gradient and rim, the draft's `traded` |
| writing | 5 | `HANDOVER_LOOK`, `paint.ts`, `index.ts`, the pose, the `SLOT_POSE` row |
| looking | 5 | three shots: the first lobes covered the cannon's rim and read as a plate, so each lobe became its own path in the hull's own gradient |
| friction | 0 | — |
| landing | 5 | format, index, check:fast, the commit |

Bottleneck: **looking** — the draft's flat-topped bump is right on a sheet and
wrong on the hull, and only a shot said so.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the briefings spec counts its own rehearsals

`docs/spec/briefings.md` still said *one rehearsal exists* and *FIRST STEP has
the only one* with fifty-six films in the tree. The status block and §3.2 say
what is true — all but five guided waves open on a film — and the numbers in
them are held by `scenes-prose.test.ts` rather than by a sentence nobody has a
reason to open, which is the rule this repository already plays by for a copy of
anything. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the status block, §1 and §3.2, and a count of guided waves against `SCENES` |
| writing | 10 | the two rewritten passages and four tests, one per figure the document states |
| looking | 0 | none — a document |
| friction | 0 | — |
| landing | 5 | format, check:fast, the queue entry, the commit |

Bottleneck: **writing** — the rewrite was five minutes and the test was the
point: the five waves still on prose are named in one place now, and a film
written for one of them fails here rather than leaving the sentence wrong.
## 2026-09-13 · claude/queue-unverified-at-c988cd97-nothing-drawn-changed-the — §3.2 of the briefings spec, read

Unverified item: the rewritten rehearsals section of `docs/spec/briefings.md`
read by an eye. It reads — the status block, §1's count and §3.2 agree with
each other and with the five waves the test names — so the entry comes out.
The lane also takes the finished `HULL · TRADED` entry out of the queue a
second time: another session's rebase had resolved `docs/queue.md` by keeping
its own copy, which put the item back. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the diff of `c988cd97` on `briefings.md`, the counts against each other |
| writing | 0 | — |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | the two queue removals, the commit |

Bottleneck: **landing** — two queue removals and a commit for five minutes of
reading, and one of the removals is a landing somebody else's rebase undid.

## 2026-09-13 · claude/queue-unverified-at-b5356072-the-difficulty-page-seen — three menu pages seen on a phone

Three unverified items at once: the front page, the palette and face, and
the difficulty page, each "seen on a phone". The preview served this tree,
the browser pane at 375×812 and a playwright page at 390×844 with the intro
already seen: three rows on the front door, three behind PLAY with the SURE?
question under HARD, Space Grotesk on the wordmark and monospace on the rows,
all on one screen with room under them. The pictures went to the owner; the
entries come out. The names item was released rather than closed — the chip
only carries a name once a room knows two, which is two devices. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four entries, `menu-entries.ts` for when the fourth row shows, where names come from (`status.names`) |
| writing | 5 | a scratch playwright script that sets the intro seen and walks the three pages |
| looking | 5 | the pane at phone size, then the three PNGs |
| friction | 5 | `bun run crop` refused its arguments; the pane's zoom returns the whole frame; a coordinate tap on HARD did not land and a ref tap did |
| landing | 5 | the three removals, one release, the commit |

Bottleneck: **friction** — getting a phone-sized PNG of a page behind the
intro took a script, because `bun run shot` cannot mark the intro as seen.

## 2026-09-13 · claude/queue-a-player-signs-in-with-google-or-by-an-email-lin — a player logs in with Google or an email link

The owner asked which sign-in routes were easy and recommended, chose Firebase
Auth (Google and an email link, Apple later) and anonymous-first through the
question tool, and the queue item went from cloud-only to done here. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue item, `names.ts`, `nickname.ts`, `join-name.ts`, `menu-settings.ts`, the miniflare harness, the menu's CSS |
| writing | 35 | `sign-in.ts` on both ends, the registry around a subject, the settings row, the PLAY line, the forged-token test helper |
| looking | 10 | PLAY and SETTINGS at phone size, once with a dummy project to see the row |
| friction | 5 | miniflare's `Response` is not `tsc`'s; `[hidden]` lost to `display: grid` on a settings row |
| landing | 10 | the build, `check:fast`, the index, the commit |

Bottleneck: **writing** — two ends and a menu page for one feature; nothing
waited on anything.

## 2026-09-13 · claude/sign-in-live — the game signs in against the owner's Firebase project

The owner pasted the web config into `sign-in-config.ts`; the Worker got the
matching project id and the row was watched come alive. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | `wrangler.jsonc`, the config file's comment, the pasted block to Biome's shape |
| looking | 5 | PLAY and SETTINGS at phone size; a press on LOG IN WITH GOOGLE reaching `neon-spore.firebaseapp.com` |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

Bottleneck: **looking** — the popup opens only from a person's click, so the
round trip stops at the chooser for me.

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — the row verbs on the row, and the map following the beat

Four asks from the owner in one prompt: the map should follow the beat that is
playing with the rows after it still on screen, BRUSH should stay put while the
map scrolls under it, a row should offer a line between rows to insert at and a
trash to remove it on hover, and a tile clicked open should keep both. About
35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `grid.ts`, `grid-rows.ts`, `grid-gestures.ts`, `selection.ts`, the map and brush stylesheets, `columns.ts` |
| writing | 10 | `grid-follow.ts`, `grid-row-acts.ts`, `grid-metrics.ts`, the ring pass in `grid.ts`, two tests, the CSS |
| looking | 5 | three headless runs over the real director — the hover, the selected row, the sticky palette, the follow at tempo |
| friction | 5 | a rail with an `auto` grid-row end stretched to the bottom of the map and its lower line drew under the last beat; the map column's 560px minimum then clipped the new trash strip |
| landing | 5 | `bun run index`, `check:fast`, the commit |

Bottleneck: **looking** — every one of the four asks is a thing you have to see,
and none of them can be read off a unit test.

## 2026-09-13 · claude/lost-wave-screen — a lost wave stops on a friendly screen, RETRY WAVE or QUIT

Queue item 1. The owner decided the forks through the question tool — either
phone's press answers for both, QUIT ends the run and the room stays, the
menu says who — and the screen was built over the held field, with the
guide bar's own buttons. About 80 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `wave-fail.ts`, `wave-opening.ts`, `nav-button.ts`, `briefing.ts`, `menu-link.ts`, the director's opening stage |
| writing | 35 | the two commands and the `quit` event, `lost-screen.ts`, `lost.ts`, `quit.ts`, the director's press, the spec paragraph |
| looking | 20 | the screen at phone size in the preview; QUIT to the menu's line and RETRY back into the wave, each through a real click |
| friction | 10 | `stage.ts` over 250 lines; `ui.menuBack` with no picture; the baked-growth rows; `?play=1` binds no menu, so the QUIT check had to start from wave 01's button; the intro sheet over a fresh profile |
| landing | 5 | `check:fast`, the index, the commit |

Bottleneck: **looking** — driving the world by hand stalls the live loop, so
every look at the screen was a scripted browser with its clocks frozen.

## 2026-09-13 · claude/handover-watched — THE HANDOVER watched at phone size

The unverified entry from the cloud session, opened on a machine with a
screen: the warning, the trade and the window photographed from both seats
with `bun run frames .`. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `waves/act-8.ts`, `sim/handover.ts`, the frames tool's flags |
| writing | 0 | — |
| looking | 10 | strips at ticks 500–1450 for P1, the trade instant for P2: the lip counts 2, 1, the band flips to the other seat's colours and controls, the other seat's reads come with it |
| friction | 0 | — |
| landing | 5 | the queue, the commit |

Bottleneck: **looking** — the panels coming home cannot be photographed
headless, because a wave nobody answers is lost before the window closes.

## 2026-09-13 · claude/parting-verified — two phones part and find their way back, on a wrangler and in two browsers

The cloud session's unverified entry, run for real: the four relay checks
against a local wrangler, then two browser contexts in one room, one of them
reaching into its own world. The parting found a defect the fingerprints could
not — the room screen stood over the menu's CONTINUE — fixed here. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `.claude/skills/net-change`, `dev.ts`, `link.ts`, `join.ts`, `shell.ts`, the menu's entries and the room screen's ids |
| writing | 5 | the two-phone script; `join.ts` no longer opening on a parting, `shell.ts` closing it, `join-words.ts` naming CONTINUE, the test |
| looking | 5 | `relay:check` plain, `--split`, `--full`, `--rejoin`, all in step; then the parting on two phones: menu on PLAY, one press waiting, the second press putting both on WAVE 4 at tick 0 |
| friction | 0 | — |
| landing | 5 | `check:fast`, the queue, the commit |

Bottleneck: **looking** — the first two phones through a parting could not
press CONTINUE at all, which no unit test and no relay check could have seen.

## 2026-09-13 · claude/names-on-a-phone — two twelve-character names on the siren, seen on two phones

Queue item 091f7df2, the look a cloud session could not take: two phones called
ANNE-MARIE K and JEAN-LUC PIC in one room, put on THE VEIL by a parting and a
CONTINUE, a veil on the field and the siren up. The right chip's last letters
and its ear were under the ☰, and a long name's last letter touched its glyph —
both fixed here. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the names commit, `siren.ts`, `siren-seats.ts`, `comms.ts`, `key-hint.ts`, `menu.css` for the ☰'s box |
| writing | 5 | the two-phone script for names; `SIREN_PAD` clear of the corner button, `GLYPH_ROOM`, the test that reads the button's box off `menu.css` |
| looking | 10 | three runs of the two phones: the key hint over the top row (a mouse, not the game), the chip under the ☰, then the fixed cluster |
| friction | 5 | stopping the wrangler by command line matched too widely and killed other windows; Python heredocs wrote CRLF and the formatter refused it |
| landing | 5 | `check:fast`, the queue, the commit |

Bottleneck: **looking** — the defect was a DOM button over a canvas instrument,
which nothing in either package's tests could see; the two-phone run is the
only thing that draws both.

## 2026-09-13 · claude/ready-faster — the ready gate says READY under a thumb sooner

The owner's `NEXT:` mid-turn: the circle at the end of a guide must switch to
READY much faster when pressed. `readyHoldMs` 420 → 150; the header, the spec
and the one test that counted in ticks follow. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `ready-gate.ts`, `briefing.ts`'s hold binding, `ready-circles.ts`, the config's history for the number |
| writing | 5 | the number, its two paragraphs, `ready.test.ts` counting in `FULL` rather than 20 |
| looking | 0 | — nothing a still frame shows; the sim test counts the ticks |
| friction | 0 | — |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **reading** — finding that the header already argued for a fifth of
a second while the number said 420 took longer than changing either.

## 2026-09-13 · claude/handover-window — THE HANDOVER's window and a cycle of it, looked at

The queued unverified item from a3703115: THE HANDOVER's own window (nine in,
eight long) photographed around the trade with `bun run frames`, and a wave
that keeps trading stood up with a scratch script that set the fault's
numbers on the page, six beats a cycle with a three-beat hold. The arithmetic
holds on both; whether the cycle reads as a fault and whether the plate can be
permanent furniture are the owner's, asked. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `sim/handover.ts`'s `bounds`, `handover-look.ts`, `frames`'s `openStage` and `makeDriver` to drive a page by hand |
| writing | 5 | the scratch script, a Python stacker for six band crops, two queue entries |
| looking | 15 | thirteen frames of THE HANDOVER, sixteen of the cycle, the strip of six beats |
| friction | 5 | no wave in the tree repeats and the tool cannot be told to — queued as a `--fault` flag |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **looking** — a cycle is a thing seen across beats, and each beat
was a frame opened on its own until the crops were stacked.

## 2026-09-13 · claude/handover-guide — THE HANDOVER's rehearsal, all four pages watched

The queued unverified item from 47007bd2: the film photographed page by page
with `--guide-page`, the second across the trade at thirty-tick strides. The
band changes colour under the same corner plate, the lip counts down and then
counts out, the third page's thumb is on a button it never had. Whether that
reads as panels changing screens, and whether four pages are enough, are the
owner's, asked. One thing wrong found: the fourth page's caption sits on the
plate. Queued. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `scenes/the-handover.ts`, `turnGuide` and `heldPageNote` to learn a page holds until turned |
| writing | 5 | one queue entry, this |
| looking | 10 | seventeen frames of a held first page, eight across the trade, one of each later page |
| friction | 5 | the first strip was seventeen pictures of one frame — a page holds, and `--guide-page` is the way past it |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **looking** — the first strip had to be thrown away before the
right flag was read.

## 2026-09-13 · claude/column-tracks-test — the director's four open tracks held equal in code and stylesheet

The queued test: `OPEN_TRACKS` in `columns.ts` and `main { grid-template-columns }`
in `director-columns.css` are the same four tracks in two files, and nothing
failed when they drifted. Now `columns.test.ts` reads the stylesheet, splits
the tracks outside `minmax(…)`, and holds them equal to the code's in the
markup's own DOM order; the constant is exported for it. Tried against a
stylesheet put back to 560: fails. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two copies, `columns.test.ts`'s markup block, `map-width.test.ts` for the shape |
| writing | 5 | the export, the test, the comment that named index.html for a rule that lives in the stylesheet |
| looking | 0 | — a test, nothing drawn |
| friction | 0 | — |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **reading** — finding where the rule actually lives (the comment
said index.html; it is `director-columns.css`).

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — THE LEAK, the fault that takes the hold

The owner asked for a modifier on the standard control set where holding a
cannon button fires no beam, introduced by a guide and a wave of its own, and
asked whether the game already had one. It did not: five faults, and every one
of them takes a *control*. THE LEAK is the sixth and the first to take a
**gesture** — the lobe fills nothing all wave, every tap still fires — with a
wave in a new act nine written on the figure THE LANCE was taught on. About
70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `lance.ts`, `malfunction.ts`, `commands.ts`, `control-fault.ts`, the mechanics tables, `fault-beam-ends.ts`, the new-wave and new-tutorial skills |
| writing | 25 | the kind, the two lines in `lance.ts` that are the whole mechanic, the wave and its argument, the mechanic row, the director's picker, the beam ends, six tests, the bestiary and briefings sections |
| looking | 0 | nothing drawn that a picture would settle — the fault's whole face is a beam that already exists, aimed at two lobes that already exist |
| friction | 15 | `malfunction.ts` went over 250 lines and had to be split twice over (`choke.ts`, `fault-clock.ts`) before anything could land; the browser tests then sat on their whole budget because the built page cannot reach Google from here, which cost two dead `check:fast` runs before it was understood and is queued |
| landing | 10 | the index, the spec counts, `check`, the commit |

Bottleneck: **friction** — none of it was about the mechanic. Half was a file
that was already full, and half was a sandbox that cannot reach the fonts the
sign-in brought in.

## 2026-09-13 · claude/map-on-a-phone — the director's map tapped on a phone-sized viewport

The unverified item from caaf6cac: on a 375-px viewport with touch, the
tapped row alone wears the insert lines and the trash, and the palette is
`position: static`. Both held. What did not: the MAP view keeps the desktop
two-column frame, so the map is ~110 px wide beside the 250-px palette and
its panel and trash sit off the right edge — queued with the fix named.
About 25 min, most of it getting one script to tap the right cell.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `mobile-menu.ts`, `director-phone.css`, `director-brush.css` for the frame |
| writing | 5 | the queue entry |
| looking | 5 | two screenshots of the map view |
| friction | 10 | the script: a `tail` that ate the error, a wait on a hidden cell, a menu tapped shut, a cell off the right edge |
| landing | 0 | the commit, folded into writing |

Bottleneck: **friction** — four reruns of a scratch script before one tap
landed on a cell that was on the screen.

## 2026-09-13 · claude/siren-centre — the siren and both names sit top centre; the beat dots are gone

The owner asked for it by name: "show the siren with names top centered.
the beat dots helper left top we can remove anyway". `sirenCentre` now
returns the middle of the screen at the round header's height, the two seat
chips hang off it either side, and the four beat dots leave the HUD's top
left — the beat is still on the shield ring, the wisp grid and in the audio.
A test holds the cluster's reach inside `SIREN_PAD` with the longest names.
About 45 min, a third of it getting a picture with real names on it.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `siren.ts`, `siren-seats.ts`, `hud.ts`, `round-header.ts`, the net-change skill for the relay |
| writing | 15 | the move, the widened `headerTop`, the test, the four documents |
| looking | 15 | a two-phone run over a local relay, stopped by its PID, for the frame with names |
| friction | 5 | `headerTop` wanting a whole `ViewState`; Biome's import order |
| landing | 0 | check:fast and the commit, folded into writing |

Bottleneck: **looking** — names only exist over a relay, so one frame cost a
wrangler start, two headless phones and a room.

## 2026-09-13 · claude/retry-count — a retry is counted when it is taken, not on the hit

Queue item: the lost screen read `0:09 · 1 RETRY` beside a QUIT button, and
a pair that quit was recorded with a retry never taken. The count moves from
`failWave` to `startWave`, on the tick a failed wave opens again, beside the
try it becomes; the `waveFailed` event loses a number that had not changed,
and the lost screen's line index follows. Thirty-one sim tests read
`retries === 1` as "the wave was lost" and now ask `failHolds`. About 30 min,
most of it the sweep.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `wave-fail.ts`, `wave-start.ts`, `lost-screen.ts`, `waves.ts`, `opening-fx.ts` for every reader of the count |
| writing | 15 | the move, the pinning test, and a script over 31 test files |
| looking | 5 | one frame of FIRST STEP lost |
| friction | 0 | nothing failed |
| landing | 5 | two trunk rebases before the siren lane could land (origin had THE LEAK) |

Bottleneck: **writing** — a number thirty-one tests used as a flag, swept
with one script rather than by hand.

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — the two VERSUS slots the owner had already decided

Queue item, written for a cloud session: the owner's answers from the VERSUS
page on 13 September 2026 — `handover:notice` takes `hull`, `cairn:pile` takes
nothing. Both applied with `bun run versus`, never by hand, so the record and
the registry moved with the code. The hull's two lobes are on the real ship
now, under the shipped plate, for the length of the window. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the two candidates' own arguments, `DECIDED.md`'s shape |
| writing | 5 | two `versus` commands, and the adopted file's closing paragraph rewritten from a question into the answer it now is |
| looking | 5 | `bun run frames` at tick 825 of THE HANDOVER, the pilot's screen, cropped to the hull |
| friction | 0 | — |
| landing | 5 | the render, versus and director tests, `queue done`, the commit |

Bottleneck: none worth the name — the tool did the work, which is the whole
argument for having it.

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — no perf in the cloud, and the entry that broke the trunk

Two small pieces after the VERSUS lane. The owner said *do never run perf tests
in Claude cloud*, which closes a door a cloud session was told to use nine days
ago — so the rule is written the way he said it and the collision it re-opens
is queued as a question with both ways out named. And the VERSUS landing's own
`--unverified` entry had named a file that landing deleted, which turns the
trunk red on the next check; that is fixed at the source with a test. About
20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `docs/performance.md`'s two sections, `note-commit.ts`, the notes-repo harness |
| writing | 10 | the CLAUDE.md clause, the doc's amendment, the queued question, `--diff-filter=d` and its test |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | the land, queue and doc tests, two commits |

Bottleneck: **writing** — most of it was the queued question, which has to name
both options well enough that the answer is one word.

## 2026-09-14 · claude/queue-tasks-kkqozz — `bun run frames --fault`, a fault at numbers no wave names

Queue item: THE HANDOVER's cycle could only be photographed by a scratch
script that wrote `world.malfunction` on the page by hand. `--fault` is now a
flag — `handover:<at>,<beats>,<every>` the director's three boxes in order,
`cannon:<colour>[,<every>]` and `shield[:<every>]` naming the fault clock a
wave leaves to the config, and the other three kinds bare — parsed in
`fault.ts` and written where `startWave` leaves a wave's own, straight after
`jumpToWave`. Checked against the built game: at tick 420 of THE HANDOVER the
plain frame is untraded and `--fault handover:4,3,6` reads THEIR PANEL — BACK
IN 3. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `flags.ts`, `spec.ts`, `page.ts`, `malfunction.ts`, `handover.ts`, `config-malfunction.ts` |
| writing | 5 | `fault.ts`, the wiring through four files, six test cases, the usage block |
| looking | 5 | three real captures — the cycle, the plain frame beside it, and the trade read off the plate |
| friction | 0 | none; `queue done 1` refusing a position rather than a title is the tool working |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the fault is a union with a different grammar per arm,
and each arm's numbers had to be found in the file that clamps them.

## 2026-09-14 · claude/queue-tasks-kkqozz — THE HANDOVER's caption goes under its ring, not over the plate

Queue item: the rehearsal's fourth page drew PLAYER 2 MOVES THE CANNON over
THEIR PANEL — BACK IN 3, covering all of it but the first two letters, because
a caption anchored on a strip stands four pixels above its ring and on this
wave that is the lip the plate sits on. `handover-look.ts` now exports the
rectangle `drawHandoverNotice` fills — and fills that one rather than a second
copy — and `guide-caption.ts` treats a box that would cover it the way it
already treats one that would cross the banner: under the ring instead. The
new case in `guide-plate-room.test.ts` names the caption and the page when the
rule is taken out. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `guide-caption.ts`, `caption-anchor.ts`, `handover-look.ts`, `guide-scene.ts`, the canvas stub's text boxes |
| writing | 5 | `plateBoxAround`, the second floor, the test's two cases |
| looking | 5 | the page photographed before and after — both texts legible in the second |
| friction | 0 | none |
| landing | 5 | the render suite, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the plate's rectangle had to become reachable from a
test that cannot hold the rehearsal's own world, which is what turned one
exported box into two functions.

## 2026-09-14 · claude/queue-tasks-kkqozz — MAP is one column on a phone

Queue item: below 700px the BRUSH/MAP section is the whole screen and it kept
the desktop's two tracks, so on a 375px viewport the palette took its fixed
250px and the map got the ~110px left — the cell panel, the note and the row's
trash all sat off the right edge. Two rules inside the phone block: one track
for the body, `width: auto` for the palette. Measured with playwright at 375px
either side of the change: `250px 302px` with the panel running to x=574, and
one `354px` track with it ending at 312. `phone-map.test.ts` reads both rules
out of the phone block and holds the desktop's own two alongside. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `director-phone.css`, `director-brush.css`, `stylesheet-order.test.ts` |
| writing | 5 | the two rules and their paragraph, three test cases |
| looking | 10 | a probe that starts the director and drives a 375px page; measured before and after, and the shot |
| friction | 0 | none; two probe runs went to the menu overlay before the view was set directly |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: looking — the change is two CSS lines and the only way to know it
was the right two was a browser at the width, which cost a throwaway harness.

## 2026-09-14 · claude/queue-tasks-kkqozz — a capture reaches the preview and nobody else

Queue item, and it carried an open question: whether the built game's refused
connections to Google were any of `test/opening.test.ts`'s four minutes forty,
or whether the file simply costs that here. Measured, three times on this
machine: **280 s** as it stood, **55 s** with `offline.ts` refusing every host
but the preview's at the browser, **31 s** with the menu's face out of the
bundle as well. So it was nearly all of it, and the two preconnects were worth
as much again as the stylesheet they were for.

Space Grotesk is a variable font, so Google's three weights are one 22 kB
woff2; under `src/fonts/` the bundler inlines it and the page makes no second
request at all. `captureFrames` carries out the list of what asked, and the new
case in `opening.test.ts` is that the list is empty. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `capture.ts`, `page.ts`, `browser.ts`, `index.html`, `menu.css`, `build.ts` |
| writing | 10 | `offline.ts`, the result field, the new case, the `@font-face`, the turned-over face tests |
| looking | 25 | three timed runs of the file at five minutes, one minute and half of one, plus a probe printing what a capture asks off-origin |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: looking — the answer the entry asked for was a number, and the
only way to it was running the five-minute file again on each side.

## 2026-09-14 · claude/queue-tasks-kkqozz — THE LEAK gets a rehearsal, and it is asserted

Queue item: the wave shipped with the three strings, and what it has to show is
two pictures a sentence turns into one — a ring that does not close under a
thumb that is not moving, then that same thumb lifting with an ordinary bolt
going out. `scenes/the-leak.ts` quotes THE LANCE's film: the same three cyan in
column two, the same slide under them, the same first page in the same words.
The hold runs five beats where `lancePrimeBeats` is three, so the page stands
past the moment a lance would have come and nothing happens. The new case in
`scene-films.test.ts` holds both halves — the fill never leaves nought under
the hold, a body is taken after the lift and before the taps, and all three go
by the end; with the fault taken off the film it reads 994 instead of 0.
§3.2's two counts and `STILL_PROSE` move with it. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the new-tutorial skill, `the-lance.ts`, `the-jam.ts`, `scene-types.ts`, `scene-script.ts`, `lance.ts`, the four scene tests |
| writing | 10 | the film, the registration, the wave's `scene`, the assertion, the two counts |
| looking | 15 | three pages photographed on both seats, and a strip across the lift |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — a film is forty lines and the rules it has to satisfy are
in six files, and the one that decided the timing (a lift fires the shot the
press owes) is a paragraph in `lance.ts` rather than anything a test says.

## 2026-09-14 · claude/queue-tasks-kkqozz — a red run says what failed, under the counts

The entry this lane wrote two commits earlier, drained in the same sitting. A
run of `bun run check:fast` ended `1668 pass, 1 fail … 1 shard red` with
nothing under it: the failing case's name was inside its shard's own block,
hundreds of lines above the last thing printed, and the block still on screen
was the green shard saying `0 failed`. `firstFailure` reads the case out of the
merged junit report — file, line, and the `describe` over it — and `shard.ts`
prints it under the counts. Proved on a deliberately red shard: `first failure:
tools/check/test/zz-scratch.test.ts:4 — a group > fails on purpose`. About
20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `shard.ts`'s summary, `shards.ts`'s tally and merge, a junit report with a real failure in it |
| writing | 10 | `firstFailure`, the printed line, two fixtures and four cases |
| looking | 5 | a scratch failing test dropped into a shard and the closing lines read |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: writing — the shape of the report had to be got from a real one
rather than guessed, and the regex has to find the case a `<failure>` hangs
under without parsing the document.

## 2026-09-14 · claude/queue-items-8b11f4 — `waves-api.ts` stops being a binary file to git

Found after the previous landing, when `git diff --stat` listed the file as
`Bin 7520 -> 8075 bytes`. `wavesToken` separates length from text with a NUL,
and the NUL was in the source as the byte itself since 2 September — so git
classed the file as binary, every diff of it printed no hunk and `grep`
skipped it. The two bytes are the escape now, the hash is the same, and
`limits.test.ts` scans every `.ts` under the three code trees and every `.md`
under `docs/` for a control byte other than tab, LF and CR; a probe file
with a NUL in it turned the case red before it was removed. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the file's history to date the byte, `limits.test.ts` for a walker to reuse |
| writing | 5 | the queue entry, the two-byte replacement, one `describe` with one case |
| looking | 0 | none |
| friction | 0 | a heredoc turned the escape back into the byte once; written through Python's `chr(92)` |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — finding *when* the byte arrived took a Python one-liner
per revision, because the shell's own `grep` cannot be handed a NUL to look
for.

## 2026-09-14 · claude/queue-items-8b11f4 — `opening.test.ts` stops reading the port its own way

Found by `bun run test:profile`, opened to see why the file was the slowest
in the suite: its `beforeAll` spawned `preview:once` and read the port off
stdout with the loop `serve.ts` had replaced that same morning — the regex
that matches an address cut short, the deadline checked between reads, no
stderr on an early exit. The block is `startPreview(root)` now, and `stop`
is the returned one, which waits for the port to go quiet rather than
returning on `kill()`. The file's own fourteen cases, against a real build,
prove it. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the profile, `opening.test.ts`'s setup, `serve.ts` and `exec.ts` for what to call |
| writing | 5 | the queue entry, eight lines in place of twenty-two |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` with the browser file in it, the commit, `bun run land --keep` |

Bottleneck: landing — `check:fast` reaches the one file in the repository
that builds the game and drives a browser, so it took thirty-four seconds
where the previous lane's took seven.

## 2026-09-14 · claude/queue-items-8b11f4 — the guard refuses a heredoc body the Bash tool would rewrite

Found by reading eight of this file's own entries: the same forty minutes,
paid a session at a time, on a doubled backslash in a heredoc body reaching
the shell as one. The queue item was written from a probe with the tool
itself, and the rule is `tools/hooks/heredoc.ts` — the bodies read with
`shell-words.ts`'s own `heredocDelimiter` and `heredocEnd`, now exported, a
refusal that names the Write or Edit tool and Python's `chr(92)`, wired into
`refusalFor` for bash only. Proved twice: nine test cases, and the hook
itself blocking a `cat <<'EOF'` carrying two backslashes while letting one
through — and then blocking this very entry, whose friction row quotes two.
About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `guard.ts`, `shell-words.ts`, the test helpers |
| writing | 10 | `heredoc.ts`, its test file, the case in `guard.test.ts`, the INDEX row |
| looking | 0 | none |
| friction | 20 | the rule's own subject: `"\\"` in the source was one backslash in JavaScript, so the first version refused every single one — and refused the Python heredoc meant to fix it; a payload dump through `guard.ts` and the Edit tool found it |
| landing | 5 | `check:fast` twice, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: friction — counting backslashes across four layers (the tool,
the shell, the JavaScript string and the test's own template) is exactly
what the rule exists to stop, and it cost this lane the same twenty minutes
it charges everyone else.

## 2026-09-14 · claude/queue-spawn-ts-sits-on-the-line-and-the-next-creature — `spawn.ts` sits on the line and the next creature cannot enter

The file stood at exactly 250 lines with a header saying it grows a spread
line per creature. The per-kind spread (`dartOnSpawn` … `balloonOnSpawn`) is
`kindFieldsOnSpawn` in `spawn-fields.ts`, in the same order — the five rolls
come off `world.rng` where they always did — and the three arrivals that are
more than one body are `companionsOnSpawn` in `spawn-companions.ts`. The
rock-cross comment that had come away from its spread is back on it.
`spawn.ts` is 123 lines. Proved by a fingerprint of all 71 shipped waves at
60 beats before and after, identical, and `bun test packages/sim`. About 25
min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `spawn.ts`, `creature-types.ts`, `shell.ts`, the fingerprint probe |
| writing | 10 | the two new files, the header and imports of `spawn.ts`, the two INDEX rows |
| looking | 0 | none |
| friction | 5 | `across` typed `number` where `rock-cross.ts` wants `CrossDir`; one tsc round |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — a mechanical carve, and the only cost was moving the
comments with the lines they explain so neither file reads as a fragment.

## 2026-09-14 · claude/queue-creatures-table-ts-is-one-creature-from-its-limi — `creatures-table.ts` is one creature from its limit, and the next cut is named

The table was at 249 with eight landings in its history, each a row, and
`creatures-handed.ts`'s header had already said where the next cut was: THE
LID and THE MAGNET, "each needing a hand *and* a trigger". Those two and THE
CHOIR are `creatures-held.ts` now, named in the table where they stood so the
key order — the director's brush strip — is byte-identical, checked by
printing `Object.keys(CREATURES)` before and after. The handed header's
sentence describes a file that exists; the one comment in `render/` that named
the magnet's row follows it. The table is 184 lines. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the table, `creatures-handed.ts`, `creatures-cling.ts`, the tests that walk the keys |
| writing | 10 | `creatures-held.ts` and its header, the three named rows, the two comment fixes, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` (the full content shard is 40 s), `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the header, which has to say what the family *is* in
the game's words so the next creature answered by a hand and a trigger knows
it belongs here.

## 2026-09-14 · claude/queue-canvas2d-ts-is-on-the-line-and-grows-a-call-per — `canvas2d.ts` is on the line and grows a call per body that sticks to the ship

The renderer's `draw` was at 250 and its last four landings had each added
one call to the same run over the finished ship — the fence's burn, the
gums, the choke's coils, the clingers. That run is `drawOnShip` in
`frame-on-ship.ts` now, the fifth pass, through the `frame-passes.ts`
barrel. Proved with the stub canvas's ordered call log: every wave carrying
a gum, a choke, a limpet, a leech or a fence, both seats, 480 ticks — five
waves, ten logs of 260–334 thousand calls, hashed identical before and
after. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `canvas2d.ts`, `frame-passes.ts`, `frame-ship.ts`, `frame-harness.ts`, `canvas-stub.ts` |
| writing | 10 | `frame-on-ship.ts`, the renderer's call and imports, the barrel's header, the op-log probe, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` (the render shard is 40 s), `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: landing — two check runs of forty seconds each, which is the
render suite's own cost and not this lane's.

## 2026-09-14 · claude/queue-boss-entries-ts-is-one-boss-from-its-limit-the-t — `boss-entries.ts` is one boss from its limit; the two questions are not shapes

The file was at 249 with a header saying every boss still to come is one
more interface in it. The fifty lines that are not interfaces —
`bossFillsWave` and `BOSS_KINDS`, the wire value with its own rule about
order — are `boss-kinds.ts` now, re-exported through `entries.ts` beside the
shapes, which is the one door everything already used. The re-export's
comment said "eleven shapes"; there are twelve. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `boss-entries.ts`, the re-export block in `entries.ts`, who imports what |
| writing | 5 | `boss-kinds.ts`, the two headers, the re-export, the INDEX row |
| looking | 0 | none |
| friction | 5 | `queue take` refused the title at 81 characters; shortened and retaken |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: friction — the title limit is the right rule, and a session
should count before it writes.

## 2026-09-14 · claude/queue-living-look-ts-is-on-the-line-and-nine-of-its-rows — `living-look.ts` is on the line, and nine of its rows are one family

The table was at 250 for the second time — it grows a row per creature —
and nine of its `null` rows were saying the same sentence: a shape one
radius cannot describe, drawn by a path of its own and routed away before
the living pass. Those nine, with their comments, are `living-look-stroked.ts`
now, spread into the table where the ghost's row stood. Every one is `null`,
so `livingBodyKinds()` printed before and after is the same ten names. The
table is 196 lines. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the table, `living-look-handed.ts`, the shape sheet's use of `livingBodyKinds` |
| writing | 5 | `living-look-stroked.ts` and its header, the spread and its comment, three ordinals in moved comments, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the header, which has to say the one reason all nine
share without repeating the nine reasons each row keeps.

## 2026-09-14 · claude/queue-effects-spark-ts-is-on-the-line-and-eight-of-its — `effects-spark.ts` is on the line, and eight of its cases are one family

`burstFor` was at 250, an exhaustive switch that grows a case per event, and
eight of its cases argued their colour against each other: a covering coming
off a body that is still there. Those eight and their comments are
`effects-spark-worn.ts` now, cut the way `effects-spark-handed.ts` was —
the labels stay in `burstFor` so `assertNever` still names every event. The
proof was `burstFor` itself, called on the eight events in both colours before
and after: byte-identical. The switch is 213 lines. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the switch, `effects-spark-handed.ts`, the eight events' shapes |
| writing | 5 | the cut, the new file's header, one comment sent next door, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the header's one sentence for why these eight are a
family, which the eight comments already said between them.

## 2026-09-14 · claude/queue-body-path-ts-is-on-the-line-and-the-clubbed-walk — `body-path.ts` is on the line, and the clubbed walk is four fifths of it

The router for a living body's contour was at 250, and two hundred of the
lines were one walk — the clubbed rim, its four sample constants and its
jitter. The walk is `body-path-clubbed.ts` now, the router is 65 lines and
says a walk is a file of its own, and the two importers, the sheet's card and
`docs/asset-catalogue.md` point at the new file. The one surprise was
`copies.test.ts`: the walk reads the body's radius under each club, which
was allowed inside the owner and had to become an `also` with its sentence.
The proof was `livingPoints` of the ten own-bodied kinds at four times, plus
one `clubbedPoints` on a rim the sheet might draw, hashed before and after:
identical. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the router, the walk, `index-shapes.ts`, who names `body-path.ts` |
| writing | 10 | the cut, two headers, three re-pointed mentions, the copies row and its reflowed comment, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` twice, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the copies-table comment, which had to say why the walk
is an `also` and not an exemption, in the paragraph's own register.

## 2026-09-14 · claude/queue-scene-types-ts-is-on-the-line-again-and-sceneact — `scene-types.ts` is on the line again, and `SceneAct` is where it grows

The file's own closing comment said how it was cut the first time, and the
act had grown a gesture at a time since. `SceneAct` and its comment are
`scene-act-types.ts` now, re-exported beside the step so the six films kept
their import; the two files that read the act alone read it from its file.
Types only — `tsc` and the scenes test are the whole proof. The file is 87
lines. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two interfaces, the step's header, who imports the file |
| writing | 5 | the cut, two headers, the closing comment, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: landing — the fast check and the land are longer than the cut.
