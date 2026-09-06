# What a frame costs

The mechanism, and the numbers it last agreed with. Read this before believing
anything about how this game behaves on a phone — including anything in an old
report, which is a snapshot and not a measurement you can repeat.

## The rule

**A new shape or a new animation gets a performance run. An ordinary change does
not.** Tuning a number, moving a control, fixing a bug, renaming something —
none of those can add per-frame cost nobody has weighed. A creature, a boss, a
round, or a new animated behaviour on a body that already exists can, and it is
the only kind of change that can arrive on the field without anybody knowing
what it costs.

```
bun run perf --wave "THE GRATE"   # the waves the new thing appears in
bun run perf --wave 46,47         # by number, or several at once
bun run perf                      # every wave — what a baseline is taken from
bun run perf --throttle 6         # at low-end-mobile speed instead of mid-tier
bun run perf --save               # write a full sweep back as the new baseline
```

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
a saving that landed. Never to make a regression stop being reported. `--save`
refuses a narrow run outright: the baseline is what every later run is read
against, and `tools/perf/test/compare.test.ts` will not have one that is missing
a wave, because a wave with no row is a wave nothing can notice getting slower.

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
- **Paced.** Paints are timed eight at a time with a pause between batches, so
  the GPU queue drains. One long tight loop measures Chrome's back-pressure
  instead and reports a 99th percentile around 200 ms, which is a fact about the
  harness. Eight at a time rather than singly because `performance.now()` is
  clamped to a tenth of a millisecond, and the cheapest waves paint in about
  that.

Two things it does **not** measure. It never runs on a real phone — the throttle
is a good proxy and not the thing itself. And it says nothing about the network
or the two-device link, which have their own check in `bun run relay:check`.

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
waves to be re-measured rather than the whole game.

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
