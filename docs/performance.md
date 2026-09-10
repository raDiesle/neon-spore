# What a frame costs

The mechanism, and the numbers it last agreed with. Read this before believing
anything about how this game behaves on a phone — including anything in an old
report, which is a snapshot and not a measurement you can repeat.

## The rule

**A performance run happens once a week, or when the owner asks for one.** He
settled it on 10 September 2026, after a lane that had taken five new looks
into the game listed a run on their five waves as the one thing left before
landing: *"perf i said we only need to run once in a week or manual."* So no
lane owes a run — not for a new shape, not for a new animation — and a report
that names one as a step still to do, an unverified item or a queue entry is
wrong. The rule this replaces, that a new shape or animation earned a run of
its own, cost a lane a run per look on an afternoon that added five.

**What a lane does measure** is the op-count budgets in
`packages/render/test/*-budget.test.ts`: exact counts of fills, strokes, clips,
saves and allocations on the dearest frames of the dearest waves. A legitimate
change that raises a row is remeasured (`MEASURE = true`, run the file, paste
the printed rows back) and the table's comment says what moved and why. That
is what catches a per-frame allocation the day it lands; the weekly run is
what says whether the whole game got slower.

**The weekly run is taken by hand**, not by a scheduler: it has to be the only
thing on the machine (below), which no scheduled job can promise, and a cloud
session cannot run it at all. `bun run perf` over every wave against the
checked-in baseline is the run; a wave that moved gets looked at, and
`--save` only after the move is understood.

```
bun run perf --wave "THE GRATE"   # the waves the new thing appears in
bun run perf --wave 46,47         # by number, or several at once
bun run perf                      # every wave — what a baseline is taken from
bun run perf --throttle 6         # at low-end-mobile speed instead of mid-tier
bun run perf --save               # write a full sweep back as the new baseline
bun run perf --wave 46 --save     # merge that one wave into the baseline
bun run perf --unmeasured         # give every unweighed wave a row, and measure nothing
```

**Not in a cloud session.** A narrow run that takes about 25 seconds on the
owner's machine was killed twice on a cloud runner — at 400 and at 580 seconds,
with nothing printed either time — and the owner settled it on 8 September
2026: a session started from the phone skips this, lands the shape unmeasured
and names `bun run perf` in its unverified list. The number that matters is the
one taken on a machine somebody is holding, and a number taken on a runner slow
enough to be killed by its own timeout is not that number
(`docs/cloud-session.md`).

## A wave nobody has weighed still gets a row

`tools/perf/test/baseline.test.ts` requires one row per wave the game ships,
and that rule is what stops the baseline comparing today against a game that no
longer exists. It collides with the paragraph above: a session that **adds** a
wave adds a row the test requires, and running perf to fill it is the one thing
a cloud session is told not to do.

The owner settled it on 9 September 2026 — **the test tolerates a row marked
unmeasured**, and the rule above is unchanged. So:

```
bun run perf --unmeasured
```

opens no browser and measures nothing. It gives every wave the baseline has no
row for a row saying exactly that, in play order and on today's numbers
(`renumber`, so an inserted wave does not leave the file one out). The session
commits it, `bun run check` passes, and the report names `bun run perf` in what
it could not verify.

Nothing then lets that row be forgotten. It counts towards no median — a zero
in the median would move the verdict on every wave that *was* weighed — and
every run prints `UNMEASURED` beside it with the command that fills it in,
until somebody takes the figure on a machine they are holding. The next full
`bun run perf --save` fills it and the marker goes.

Why a flag and not figures of `null`: a nullable number runs through six
arithmetic sites here and becomes `NaN` when one of them misses it, which has
already cost this tool a run that called all thirty-eight waves `same` and
reported that nothing had changed. `tools/perf/unmeasured.ts` carries the whole
argument.

**Measure the waves the new thing appears in, not the whole game.** That is the
owner's instruction and it is also the cheaper truth: a change to one creature
cannot make a wave that creature never enters slower. The full sweep exists for
one purpose, which is taking a baseline.

What each costs, measured on 6 September 2026 on the owner's Windows machine:

| | time |
|---|---|
| `bun run perf --wave X` — one wave and the five references | ~25 s |
| `bun run perf` — all 47 | ~194 s |
| `bun run check`, for scale | ~107 s |

About three seconds of any run is fixed — building the bundle, launching Chrome,
calibrating the machine — and each wave after that is roughly four. The number
that matters is not the clock but the *demand*: three and a quarter minutes of a
machine that has to be completely idle is a condition a session cannot reliably
meet, and it is why the baseline sat stale for a day while three separate
attempts to take one were spoiled by other sessions.

### The reference waves

A verdict is a wave's share of its own run's median, so a run of one wave has no
median to speak of — it *is* that wave, and dividing by it cancels the change the
run was taken to see. So a narrow run carries five waves it was not asked about:
FIRST STEP, THE WALL, THE DART, THE WISP and THE ECHO, spanning the range from
the cheapest wave with a field to one carrying nineteen bodies. They are named by
**id** in `tools/perf/waves.ts`, because a wave inserted in act one shifts every
number after it and a rename is a thing the owner does by eye.

THE GAUGE is deliberately not among them. Its round draws neither hull nor field
and costs a fifth of any other wave, so a median of five containing it would sit
where no real frame does.

They earn their seconds twice over. The second time is this: **nothing a lane
does can reach a reference wave**, so a verdict on one of them is not a finding,
it is the measurement moving under itself. The tool says so and tells you to run
it again idle, which is the check no single-wave run could ever make of itself.

Save a new baseline only when the change is one you meant — a shape that landed,
a saving that landed. Never to make a regression stop being reported.

**A narrow `--save` merges; it does not replace.** The baseline is what every
later run is read against, and `tools/perf/test/compare.test.ts` will not have
one that is missing a wave, because a wave with no row is a wave nothing can
notice getting slower — so a narrow run may not *become* the baseline. What it
may do is put its own rows into one, which is how the advice below is taken. The
rest of the file is left alone, which matters: a full sweep taken to fix a single
stale row silently re-baselines the other forty-six off whatever the machine was
doing that afternoon.

**The merged row is converted onto the baseline's footing first**, and that is
what makes the stitching sound rather than merely convenient. Every verdict is a
wave's share of its run's median, so a row left in the milliseconds of a
five-wave afternoon is read against a median of a different population from the
forty-seven the rest of the file was — and the next full sweep calls that wave a
regression nobody caused. The reference waves the narrow run carried are the
answer: no lane touches one, so the median ratio between their old figures and
today's is the machine and the weather, and the row is multiplied by it before it
goes in. The row records the factor, the day and the commit in `mergedFrom`, so a
stitched baseline says so in the file.

**And every row is put back on today's numbers as it is written.** A row is
matched on its id, which is what stops a wave that moved being written twice —
but matching renumbers nothing, so a merged row carried today's `wave` and the
rows beside it kept whatever number the file was written with. That converged by
itself whenever the waves that moved were the waves being re-measured, and never
for a wave that merely *shifted*: identical arrivals, nothing asking for it, and
`baseline.test.ts` failing on play order with no advice but the three-minute
sweep this whole merge exists to spare. `renumber` in `tools/perf/renumber.ts`
reads the number and the name off the game rather than off the file, and a row
whose id the game no longer answers to is dropped and named on the way out.

## What it measures, and why that and not something else

`packages/render/test/frame-budget.test.ts` counts canvas **operations**. That is
the right regression guard for a draw path and it is not a time: an op is not a
millisecond, and no op count says whether a phone keeps up. This tool answers the
other question, and the two are not substitutes for one another.

- **One paint of the real bundle.** `bun run preview` builds and serves what
  ships; the tool drives it through `window.neonSpore` (`apps/game/src/handle.ts`),
  the same handle `tools/frames` uses.
- **At phone size.** 390x844 at device pixel ratio 2 — which is what
  `apps/game/src/viewport.ts` caps a phone at, so a dpr-3 screen draws no more
  pixels than this.
- **With the CPU genuinely slowed.** `Emulation.setCPUThrottlingRate` over the
  DevTools Protocol, which is the mechanism behind DevTools' own presets: **4x is
  mid-tier mobile, 6x is low-end**. It is a real slowdown of the JavaScript, not
  a multiplier applied to a desktop figure afterwards.
- **At each wave's busiest moment.** Every wave is entered properly — the
  introduction and the guide cleared through `tools/frames/opening.ts` — then
  searched for the tick it carries the most creatures, restarted, and replayed to
  exactly that tick. This is the part that is easy to get wrong: a wave measured
  on its first frame, or after it has cleared, reports a number about an empty
  field.
- **And a boss round is measured halfway through its own song**, because a round
  puts nothing on the field at all — its whole picture is in `world.boss` — so a
  body count never improves on tick 0 and every round in the sweep used to be
  photographed during its count-in. Halfway is one number rather than a reader
  per kind, which would go stale the next time a round is invented
  (`BOSS_SONG_FRACTION`). It is why THE PULSE's row moved from 0.70 ms to 2.55
  on the baseline of 9 September 2026, along with PINBALL's, SNAKE's, THE
  MAZE's, THE MIRROR's and THE GAUGE's: none of those is a regression, they are
  the first honest measurements those rounds have had.
- **A wave that needs a thumb gets one.** The sweep plays arrivals and presses
  nothing, so anything a player has to hold was drawn zero times in it — THE
  LANCE's beam, its ribbon and the wash it leaves were all outside the row that
  was supposed to measure them. A wave named in `tools/perf/held.ts` has its
  commands sent at its busiest tick, through the same door a finger goes
  through, and is measured half a second later. A wave not named there sends
  nothing and its row is comparable straight across that change.
- **Paced.** Paints are timed eight at a time with a pause between batches, so
  the GPU queue drains. One long tight loop measures Chrome's back-pressure
  instead and reports a 99th percentile around 200 ms, which is a fact about the
  harness. Eight at a time rather than singly because `performance.now()` is
  clamped to a tenth of a millisecond, and the cheapest waves paint in about
  that.

One thing it does **not** measure: the network and the two-device link, which
have their own check in `bun run relay:check`.

## On the phone itself

`bun run perf` never runs on a phone — the throttle is a good proxy and not the
thing itself. **`?perf=1` is the other half.** Open the game on the device with
that flag and it runs the same sweep in the page — every wave, each stepped to
its busiest tick, sixty paced paints — and draws the table over the screen with
the median large enough to photograph. The sampling numbers and the arithmetic
are one module both callers import (`tools/perf/sweep-timing.ts`), so a phone
row and a desktop row are the same measurement taken on different machines.

### The menu's own frame, at `?menuidle=<hz>`

The main menu draws *over* the running field rather than replacing it, and the
`menu` hold stops the world ticking without stopping the drawing — so while the
menu is up the device paints a complete field frame sixty times a second and
then blurs it, to show at most 7% of it in the top third. A menu-idle paint
costs what wave one's does, which is 0.78 ms unthrottled in headless Chrome on
this desk and about 3.5 ms at the four-times throttle; the `backdrop-filter` on
top of it is a compositor cost this harness cannot separate at all, and what
would measure it is a Chrome trace taken on the phone.

`?menuidle=10` repaints ten times a second behind the menu instead of sixty,
and `?menuidle=0` stops after the first frame. **Both are offered, not
shipped:** unset, the game paints every frame exactly as it always has. The
world is held but the picture is not still — the water's shimmer and the hull's
breathing run off the wall clock — so thinning the repaint changes what a player
sees, however faintly, and that is the owner's to judge by opening the game
twice on the phone. It is not a `tools/versus` slot because the pair there
draws one world twice inside a single frame, and the question here is how often
a frame happens at all (`apps/game/src/menu-idle.ts`).

**A phone run is compared against other phone runs, never against a throttled
desktop one.** There is no throttle on a phone to be comparable to, so the page
records none and says so at the top of the readout; `tools/perf/baseline.json`
is a desktop file and nothing from the phone goes into it. What a phone run is
for is the shape of the table — which waves are dear relative to each other on
the hardware that matters, and whether the worst of them fits in a frame.

## Comparing two runs

`tools/perf/baseline.json` is the last run somebody meant to keep. A later run
prints the delta against it, worst first.

Every row also records **what the wave sent when it was measured** — a count and
a digest of the spawn queue its entries translate into (`arrivalsOf`). The name
already caught a wave renamed or one inserted ahead of it; this catches the far
commoner thing, a wave whose arrivals changed under a name that still matched.
THE FENCE gained two figures and kept the timings that went with the old two,
and every comparison after that was against a wave that no longer existed.
`tools/perf/test/baseline.test.ts` fails those rows by name and asks for *those*
waves to be re-measured rather than the whole game — and prints the command that
does it, `bun run perf --wave "NAME" --save`, which merges the one row back in.

Timing a browser is noisy, and five separate defences are stacked against it —
each one added because the version without it reported a regression in code
nobody had touched:

- **The median batch, not the mean and not the minimum.** A mean carries
  whatever else the machine was doing. A minimum looked better until it turned
  out to pick the cheapest *animation phase* rather than the cheapest frame.
- **Each wave against its own run's median.** An ambient slowdown moves the
  whole run together and cancels. Without this, one busy afternoon made all 38
  waves read 15% to 41% "better".

  This is also why a **narrow run gets no verdict**. Its median is taken over
  the handful of waves it measured, so with one wave the median *is* that wave
  and dividing by it cancels exactly the change the run was taken to see — every
  verdict would come out `same` however far the wave moved. Under
  `DRIFT_MIN_WAVES` the tool prints the milliseconds, says why there is no
  verdict, and stops. Read them against the baseline's own figures with your own
  eyes; that is what a narrow run is for. Above the floor, a subset is compared
  against the *same subset* of the baseline rather than against the whole game,
  or the two shares would be shares of different things — THE GAUGE alone, at a
  fifth of any other wave, moves a full sweep's median somewhere a three-wave
  run's can never be.
- **The game's clock held still.** `paint` is handed `performance.now()`, so
  every wobble and eased pose is a function of the wall clock. During a
  measurement it is replaced by a counter stepped exactly one frame per paint,
  so two runs draw the identical sequence of pictures.
- **The sample spread over real time.** Thirty readings taken back to back land
  inside a fifth of a second, so one transient elsewhere on the machine is not
  an outlier the median discards — it is the condition every reading was taken
  under. A pause between them stretches the sample to about two seconds. This
  one alone took the number of falsely flagged waves from ten to two.

- **A floor of the wave's own, not one number for all of them.** 20% is the
  flat minimum, and it was still not enough: six full sweeps of one commit on
  6 September 2026, on an idle desk with nothing else running, named two waves
  apiece that nobody had touched. On top of it each wave has to clear one and a
  half times its **own** unsteadiness — `jitter`, the interquartile spread of
  the thirty batches it was timed over, which every run now records. That takes
  282 wave-pairs of identical code from six wrongly named waves to none, and it
  leaves 23 of the 47 waves on the flat 20%, so the tool is no blunter where it
  was already right. It is a floor and not a cure: two later sweeps of the same
  commit each still named two waves, and never the same two — so a lone `WORSE`
  on a wave a lane never went near is worth one more run before it is worth an
  afternoon. A wave whose sample spread
  past half its own median gets no verdict at all and is printed as `NOISY`:
  PINBALL's floor would come out at 2400%, and reporting `same` about a wave
  nothing could move past is the quiet version of the same lie.

**Two things that sound right and are not**, both measured the same day and
written down here so nobody spends the afternoon again. **A floor that scales
with how cheap a wave is** scales on the wrong axis — the two cheapest waves in
the game held still, and the swings landed on ordinary 4 ms waves. **An absolute
millisecond gate** says nothing a share does not: every run's median is about
4 ms, so "more than 20% of its share" and "more than 0.8 ms" are the same
sentence twice. And **a flat floor high enough to silence the swings is 35%**,
which is more than a whole new creature costs — THE CRAWLER is about 25% over a
bare wave — so the tool would have gone quiet about the one thing it exists to
catch.

**What is left is a floor between 20% and about 50% depending on the wave, and
that is the honest limit of this tool.** It catches a shape that costs
substantially more — which is what a new creature or a new animation does, and
what it exists to be run for. It will not catch a 15% drift, and should not be
read as if it could; `packages/render/test/frame-budget.test.ts` is the exact
guard, because an op count has no variance at all.
`tools/perf/test/two-quiet-runs.json` holds the two sweeps those numbers came
off, so the floor cannot be lowered again without the evidence coming back.

The milliseconds are still printed, because a reader wants them. They are just
not what `worse` and `better` are decided on, and a run whose median moved says
so in a line of its own.

Every run also records a calibration figure — one fixed arithmetic loop,
unthrottled — because the owner alternates between a Windows box and a Mac. A run
more than 25% away from the baseline's machine, or taken at a different throttle
or size, says its milliseconds are for reading rather than comparing. The shares
still compare, which is the point of using them.

## The statistics, as of 6 September 2026

Measured at 4x on the owner's Windows machine; `tools/perf/baseline.json` names
the exact commit and carries every wave's row. One 60 Hz frame is 16.7 ms.

| | ms per paint |
|---|---|
| Median wave | 3.89 |
| Cheapest — THE GAUGE, whose round has no field and no hull | 0.23 |
| Dearest — THE GHOST | 8.35 |
| Worst 90th percentile — THE GHOST | 9.63 |

Nothing is close to a full frame; the worst wave in the game spends about 58% of
one. The floor matters more than the ceiling: wave 1, with a single body on the
field, still costs 3.18 ms because the hull is always there, and the dearest
wave is only about twice that. **Adding enemies barely moves the number; the
ship does not go away.**

At 6x, the four heaviest waves begin missing frames. THE GHOST measured 12.45 ms
there — 75% of a 60 Hz frame with nothing spare, and a phone that is warm is
already slower than the one that was measured.

## Where the time goes

The simulation is free. All 120 ticks of one second together cost about
**0.05 ms** — three thousandths of one frame. Nothing in `packages/sim` is worth
optimising for speed.

Everything else is the renderer, and inside it, one pass dominates. Measured
through a null canvas on wave 12, so the figures are JavaScript rather than
pixels:

| pass | us per frame |
|---|---|
| `drawShip` — the player's own hull | 118 |
| `drawBodies` — every creature on the field | 28 |
| `drawFieldBack` — background, radar, grid | 2 |
| `drawOverlays` — HUD, band, alarms | 2 |

`drawHull` is 117 of that 118, and it is paid on every frame of every wave. Of
those 117, **54 are `openSmoothPath`** — the hull's contour is 141 points turned
into a 5 085-character SVG path string with 840 `toFixed(2)` calls, which
`new Path2D` then parses back into the numbers it was made from. `blobPath` does
the same for every creature body at 40 points each, which is where the ~14 us per
creature comes from.

Between 66% and 90% of a frame is JavaScript rather than pixel fill, which is why
CPU speed is what matters here and resolution mostly is not.

Also checked and not a problem: 135 KB gzipped bundle, about 5 MB of heap, no
measurable allocation per frame, and no `shadowBlur` anywhere (`render/glow.ts`
says why that one is worth staying away from).

## Where to look next

`docs/queue.md` carries what this turned up and nobody has done yet — the path
string round trip first, because it is the largest single win and it is a
mechanical change rather than a decision about how the game looks.

## What the test suite costs

The same discipline, one level up. `bun run check` is the test suite plus a
few seconds of typecheck and lint, and `bun test` prints one total; until
10 September 2026 the only figure anybody had for it was "four and a half
minutes", and the guess about where they went — the render frame tests,
because there are dozens — was a guess.

**`bun run test:profile`** takes the reading. It runs the suite once through
bun's JUnit reporter, which is the same process and the same order as the
check, and prints the slowest files with their share of the run, the slowest
cases, and a sum per package. Paths narrow it the way they narrow `bun test`.
Read the *cases* before the files: a file of fourteen tests is not slow, four
of its tests are.

The first profile, on this machine, was **292 s across 383 files**, and it
said the guess was wrong in the useful way:

| file | before | after | what it was |
|---|---|---|---|
| `packages/render/test/briefing.test.ts` | 88.6 s | 24.1 s | four walks through every rehearsal, a frame drawn per tick; now one tick in four, each walk taking a different one, so every tick is still drawn once |
| `tools/frames/test/opening.test.ts` | 31.7 s | 31.9 s | a real build served to a real Chrome, twelve captures at two seconds each; the one case that launched a browser of its own now borrows the file's |
| `packages/sim/test/copies.test.ts` | 19.8 s | 0.6 s | seventy thousand cases, each reading and stripping its file again; now one case per rule over files read once |
| `packages/render/test/tell-frame.test.ts` | 6.6 s | 4.6 s | a fourth play of the same seeded game, asked what the third had already seen |
| the whole suite | 292 s | 214 s | |

Everything under those is honest work: a frame test costs about 0.8 ms per
frame drawn, and that is the renderer, not the stub — its per-call tally was
measured at under a tenth of it. So the rest of the list was a play at a
time, each with a reason in its file for the beats it runs and the tick it
samples, and the second lane went through them file by file. Three cuts
account for nearly all of it, and each is a rule a new frame test can call:

- **Three seats share one play** (`thirdOf` in `frame-harness.ts`). A roles
  loop drew one seeded world three times over, once per seat; each seat now
  draws a third of the ticks — every `3 × every`, at its own phase — so the
  play is still drawn once between them. It is the trade `briefing.test.ts`
  made for the rehearsals, in one line.
- **A play is remembered** (`remembered`). The case under a roles loop that
  compares two seats' counts, or reads the events the run produced, used to
  play the world again to ask; it reads the loop's play instead.
- **A play stops when its picture is over.** The strand's chase had the thread
  swept by beat five and ran thirty; the lure's shot was fired on beat three
  and watched for six more where the blast lives a beat and a half. Each is
  cut to what its own comment argues for, and the comment now says so.

And one that is not a play: `drawnSize` scanned every contour five times for
five cases, and now remembers the scan per entry.

| file | before | after | plays |
|---|---|---|---|
| `packages/render/test/strand-frame.test.ts` | 11.2 s | 3.6 s | seats a third each; the chase 8 beats not 30; the walls 12 |
| `tools/shape-sheet/test/drawn-size.test.ts` | 9.8 s | 2.1 s | one scan per entry, not one per case |
| `packages/render/test/lure-frame.test.ts` | 6.7 s | 3.2 s | seats a third each on the shot; the shot on beat one; two repeats read |
| `packages/render/test/veer-frame.test.ts` | 5.6 s | 3.6 s | two repeats read |
| `packages/render/test/ghost-frame.test.ts` | 5.6 s | 2.5 s | seats a third each on the crossing; four repeats read |
| `packages/render/test/fence-frame.test.ts` | 5.5 s | 2.9 s | four repeats read; six wall plays are two |
| `packages/render/test/crawler-frame.test.ts` | 5.4 s | 2.4 s | seats a third each; wall and length paired |
| `packages/render/test/tell-frame.test.ts` | 5.3 s | 1.9 s | seats a third each |
| `dart`, `pinball`, `living`, `fleet`, `gyre`, `veil`, `warden`, `mirror`, `vane`, `lock` | 21.4 s | 9.6 s | the same three rules |
| the whole suite | 212 s | 153 s | |

`packages/render` is 71 s of the 153 as a package, `tools/frames` 33,
`tools/director` 12, `tools/shape-sheet` 11. What is left at the top is not a
play: `opening.test.ts` is a real Chrome (29 s), `briefing.test.ts` draws
every page of every rehearsal exactly once (23 s), and `room.test.ts` waits
on workerd (7 s). The target the queue set — the whole suite under two
minutes with the same coverage — was not reachable a play at a time from
here. A new frame test is still read against this list before it lands — if
it would enter the first ten rows, say in the file why the frames it draws
are all needed, and reach for `thirdOf` and `remembered` before reaching for
a shorter play.

### The suite runs in eight processes

Where the target was reachable was the shape of the run: 384 files, one after
another, in one process, on a machine with sixteen cores. The files are
independent by construction — each installs its own canvas globals, every
test that writes takes a `mkdtemp` of its own — so `tools/check/shard.ts`
deals them across eight `bun test` processes and runs them together. It is
what `bun run check`, `bun run test`, `check:fast` and `test:profile` run;
bare `bun test` is still bun's, one process, for a human running one file.

| run | wall clock |
|---|---|
| one process, 10 September 2026 | 153 s |
| eight shards, files weighed by bytes | 46 s |
| eight shards, a file that draws weighed six times its bytes | 34.5 s |

The floor is `opening.test.ts` alone in its shard, 32 s of Chrome plus the
process start; nothing below it can bring the wall clock under that, and the
other seven finish between 16 and 31 s. The weighing is what moves a run
between the second row and the third: `shards.ts` puts the three files whose
cost is nothing like their size in a table, in seconds, and weighs the rest by
bytes at two rates — a frame test or a shape-sheet test runs at about 3 500
bytes a second, everything else at about 20 000, both read off one profile and
rounded. One rate filled the shard that had `briefing.test.ts` with eight
frame tests and it finished at 46 s while another finished at 10.

Two things were in the way and neither turned out to be. A test that starts a
server could collide with one in another shard on the port a tree derives
(`tools/ports.ts`) — but `opening.test.ts` starts its preview with
`PREVIEW_PORT=0` and `room.test.ts`'s Miniflare asks the OS as well; two
`room.test.ts` side by side both passed, which is how that was settled, and
`shard.ts` says what to do with a test that ever takes a derived port. And
the tree-wide sweeps — `purity.test.ts`, `hash-coverage.test.ts`,
`tools/test/*` — land in whichever shard the deal puts them, which is fine:
each reads the tree once, and two in two shards read it twice, a second or so
across the run.

**Reading the profile after this.** A file's seconds in `bun run test:profile`
are what it cost inside its process, and alongside seven others that is about
a fifth more than alone — 180 s of test inside a 35 s run — which is the same
for every file and changes no share. The total the report prints is the sum
of those, the suite's *cost*; the wall clock is on `shard.ts`'s own last
line, above the report. The table above is read in cost, the row for the
whole suite in wall clock.
