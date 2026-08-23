# Architecture

## One direction only

```
content ──▶ sim ──▶ render
              │
              └──▶ net (phase 2)
```

`content` is data. `sim` turns data plus commands into a world. `render` reads
a world and produces pixels. Nothing points back.

This is not tidiness. It is the condition under which the simulation can run
headless, and therefore the condition under which an agent can check its own
work instead of waiting for a human to notice.

## The tick

The simulation only ever hears "one tick has passed". Wall-clock time exists in
exactly one file: `apps/game/src/loop.ts`.

`tickHz` and `bpm` must give a whole number of ticks per beat —
`ticksPerBeat()` throws otherwise. At the defaults: 120 Hz, 96 BPM, 75 ticks
per beat. A fractional value would let the beat drift apart on two devices,
which is the one thing lockstep cannot survive.

Creatures move exactly one tile per beat and are only ever on tile centres.
Everything between beats is interpolation in `render`, computed from
`beatPhase`. The simulation never sees it.

## Integers

The world stores integers. Sub-tile values — bullet position, hull integrity —
are kept in thousandths. Two devices can then never disagree about a rounding
step, and `hashWorld` is an exact equality test rather than an approximate one.

Any new field on a creature or bullet must be added to `hashWorld`. A field
outside the hash is a field that can desync two devices silently.

## Randomness

One seeded xorshift32, seeded by the wave index. The same wave always plays out
the same way.

The rule from the spec: **random is only what one player knows and the other
does not.** Positions, timings, order and normally visible colours are fixed.
The colour inside a thundercloud is not.

## Replays are the test format

A replay is a seed, a config, a spawn queue, a list of timestamped commands and
an expected fingerprint. Three kinds of test are built from it:

- **Replay test** — the same inputs must produce the same end state.
- **Determinism test** — run the same replay twice, compare fingerprints. This
  is the most important test in the project; a hook runs it after every edit
  inside `packages/sim`.
- **Wave test** — play a wave headless and check that every creature needing an
  announcement has its 4 seconds.

The Director Mode recording format is the replay format. What you play by hand
becomes a test case.

## Network (phase 2)

Delayed lockstep, not a server-authoritative model. Two cooperating players
with no competitive incentive do not need one. Both devices exchange inputs
only and run the same deterministic simulation.

**The timestamp is taken when the screen is touched**, not when the packet
arrives. Otherwise the player with the worse connection is punished and the one
who presses early is rewarded — fatal for a game whose core is a shared beat.

Clock sync: four timestamps per measurement, take the median of several, adjust
the offset *gently* and never in a jump. The device clock is never touched,
only game time.

Server: one Cloudflare Durable Object per room, WebSocket, hibernation. It
relays inputs, distributes the beat zero point and answers clock syncs. Nothing
else.

## When PixiJS becomes due

Only when one of these is true: Canvas 2D drops below stable 60 fps on target
devices despite pre-rendered sprites; substantially more than ~52 simultaneous
objects; additive blending becomes awkward or slow in Canvas; runtime
deformation is needed instead of pre-rendered stages.

Because the logic is separate, that change touches `packages/render` only.
