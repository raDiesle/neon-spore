# A cloud-legal performance audit — September 2026

This session ran in a cloud container, where `bun run perf` (the browser
frame-cost tool) is forbidden in any form (`docs/cloud-session.md`). So this
is not a frame-time measurement on real hardware — it is what the rules do
allow: static reading of the render and sim hot paths, the numbers already
checked into the op-count budget tests, and a headless `bun run probe`
benchmark of `packages/sim`'s `step()` alone. Anything below marked
**measured** came from a command that actually ran; anything marked
**read** is a claim about the code, not a timing.

## CPU — the render side (read)

Per rendered frame: `Canvas2DRenderer.draw()` (`packages/render/src/canvas2d.ts:67`)
runs six passes (`packages/render/src/frame-passes.ts`), and the field pass
alone fans out to ~28 `draw*` calls (`packages/render/src/frame-field.ts:90-250`),
each of which walks `world.creatures`/`world.bullets`/`world.pods` again. Two
spots redo work every frame regardless of what is on screen:

- **`byDepth()`** (`packages/render/src/depth.ts:148`) copies and sorts the
  whole creature array every frame, for every wave, whether or not depth
  order actually changed.
  **Measured afterwards, and left as it is** (26 September 2026): a bun
  loop timing `byDepth` alone takes 0.7 µs a frame at 20 bodies, 2.6 µs at
  60 and 9 µs at 150. That is well under a thousandth of a 16.7 ms frame at
  any population the game reaches. A cache kept between frames would have to
  live in `Effects` and be cleared on a restart. It would also have to know
  when the glide reorders two bodies mid-beat (`drawnRow` reads `beatPhase`).
  Checking that is the same pass over the field the sort already makes. So
  the queue item was closed without a cache.
- **`gyres(world)`** was fixed on the same day: the wheels are asked for once
  a frame and the carried bodies are sorted into them in one pass
  (`gyreCarried`, `gyre.ts`). The description below is how it stood.
- **`gyres(world)`** (`packages/render/src/gyre.ts:47`) filters
  `world.creatures` for gyre wheels, and is called twice per frame from two
  different draw functions (`gyre-wind.ts:76`, `gyre.ts:69`) — the same
  filter run twice. `drawGyres` then filters creatures again *per wheel*
  (`gyre.ts:75`), so a wave with several gyres rescans the whole creature
  list once per wheel.

Everything else render allocates (`strandThreads()`, the ghost-trail store,
the fault-beam bands) is gated behind "this creature kind is on the field",
so it costs nothing on a wave that doesn't use it.

## CPU — the sim side (read)

The per-tick entry point is `step()` (`packages/sim/src/step.ts:25`), called
0–N times per rendered frame depending on catch-up (`apps/game/src/loop.ts`,
capped at 250ms). The one clearly super-linear cost in it: `advanceBullets()`
(`packages/sim/src/bullets.ts:110`) calls `sweep()` once per live bullet, and
each `sweep` does a full linear scan of `world.creatures`
(`packages/sim/src/shot-reach.ts:45`) and of `world.pods`
(`packages/sim/src/pods.ts:134`) — O(bullets × creatures) + O(bullets × pods)
per tick, no column-first culling. In practice the field is 11×15 tiles
(`packages/sim/src/config.ts:224`), which bounds this to a few dozen times a
few dozen even on the busiest boss wave, but it is the one shape worth
watching if a future profile ever shows the sim step itself hot.
`advanceBullets` also rebuilds a fresh `alive: Bullet[]` array every tick
regardless of whether a bullet died.

**Measured afterwards, and left as it is** (26 September 2026). A bun loop
timed `firstAlong` and `firstPodAlong` once for every shot, which is the whole
scan a tick makes. Figures per tick:

| bodies | 10 shots | 30 shots |
|---|---|---|
| 20 | 3.6 µs | 9 µs |
| 60 | 9 µs | 26 µs |
| 150 | 26 µs | 60 µs |

At 120 ticks a second, even the heavy 60-and-30 case is about 50 µs of a
16.7 ms frame, which is 0.3%. A column bucket would not be free either. A body
part-way through a move stands in the lane `creatureLane` gives it for that
tick, a wide body stands in several lanes, and the queen stands in two lanes
that are not a span. So the bucket would have to be rebuilt every tick, and
that rebuild is the same pass over `world.creatures` that the scan already
makes, with a second copy of the lane rule. The `alive` array is one small
allocation a tick. The queue item was closed with no change to the sim.

No creature-vs-creature nested scan exists in `step.ts`'s own call list;
collision-shaped cost is concentrated in the shot/pod sweep above.

## Frame cost — what's already measured (measured, checked-in)

`packages/render/test/*-budget.test.ts` assert exact canvas-call counts
(fills, strokes, clips, saves, `drawImage`, `Path2D`) on named worst frames —
a ceiling, not a timing, but the only numbers here that came from an
assertion actually running. The single worst already-measured frame across
all four budget files:

**`wave-budget.test.ts:490`, "THE GYRE" wave, player 2, second frame** — 190
strokes, 117 fills, 94 saves, 25 clips, 90 `drawImage` calls. Runner-up:
`frame-budget.test.ts:433` (busy-field scene) at 144 strokes / 79 fills / 48
saves.

## Memory / allocation — `packages/sim` step() (measured, headless, this run)

`tools/probe/scratch/bench.ts` (git-ignored, not committed) ran `step(world,
[])` for 3600 ticks (30s at this config's 120 ticks/s, `tickHz: 120` /
`bpm: 96`) against six waves with no player commands, so nothing shields the
hull and every creature that reaches it is removed on arrival — this
measures continuous spawn/advance/collide/remove churn, not a wave held at
its peak standing population, and undershoots a real "many creatures alive
at once" boss fight:

```
theCoil    creatures   0-> 2   1.2 us/tick   heap +0.68 MB retained after GC
theFleet   creatures   0-> 0   0.8 us/tick   heap +0.23 MB retained after GC
theWarden  creatures   1-> 2   0.9 us/tick   heap +0.09 MB retained after GC
theInstar  creatures   0-> 0   0.2 us/tick   heap +0.07 MB retained after GC
theSurge   creatures   0-> 2   0.4 us/tick   heap +0.04 MB retained after GC
theSpool   creatures   0-> 2   0.7 us/tick   heap +0.03 MB retained after GC
```

Nothing here retains unbounded memory — heap growth after a forced GC is
under a megabyte for every wave over 30 simulated seconds — so there is no
sign of a leak in the sim step itself. The standing creature counts are too
low to say anything about peak-population cost.

**Measured afterwards, with the hull defended** (26 September 2026).
`tools/probe/world.ts` gained `played`, which steps a wave with AUTO's hand on
both seats. A scratch bench ran every wave for 12,000 ticks (160 beats) that
way at seed 1. The busiest were:

```
theStrand   peak 8 bodies   mean 5.8   0.6 us/tick
theGyre     peak 7          mean 0.2   1.8 us/tick
oneLastChance, theWard, theCrawler   peak 5
```

Every other wave peaked at 4 or fewer. After warm-up, no wave's step cost more
than 5 µs a tick on average. A defended wave does not stand at twenty bodies:
the pair answers them as fast as they come. So peak population is not where
the sim's time goes, at any population the game reaches.

## What this doesn't answer

Real frame time and real GC pause length on a device — the thing `bun run
perf` measures weekly against a baseline — needs a browser and a machine,
neither of which this session has. Of the `read` findings above, `byDepth`
and the shot sweep have since been timed headlessly and are negligible, and
`gyres` is fixed. Whether THE GYRE's frame (the worst measured one above) shows
anything else still needs `bun run perf --wave "THE GYRE"` on real hardware.
