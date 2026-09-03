# Architecture

## One direction only

```
content ──▶ sim ──▶ render
              │
              └──▶ net
```

`content` is data. `sim` turns data plus commands into a world. `render` reads
a world and produces pixels. Nothing points back.

This is not tidiness. It is the condition under which the simulation can run
headless, and therefore the condition under which an agent can check its own
work instead of waiting for a human to notice.

## The tick

The simulation only ever hears "one tick has passed". The rule is not that a
clock is read in one place — `apps/game` reads one in `loop.ts`, `main.ts`,
`link.ts` and `testing.ts` — it is that **`sim` and `content` never read one at
all**, and that is enforced rather than remembered:
`packages/sim/test/purity.test.ts` scans every file in both for
`performance.now`, `Date.now`, `Math.random`, a DOM global or an import of
`render`. Time reaches a rule as the tick counter, and nothing else.

`tickHz` and `bpm` must give a whole number of ticks per beat —
`ticksPerBeat()` throws otherwise. At the defaults: 120 Hz, 96 BPM, 75 ticks
per beat. A fractional value would let the beat drift apart on two devices,
which is the one thing lockstep cannot survive.

Creatures are only ever on tile centres, and each kind has its own speed:
`fallTilesPerBeat` (`kinds.ts`) gives a meteor its tier in tiles per beat and a
torch eight above the fastest of those, while a wisp, a tether and both halves
of THE GYRE take zero and are moved by rules of their own. Everything between
beats is interpolation in `render`, computed from `beatPhase`. The simulation
never sees it.

## Integers

The world stores integers. Sub-tile values — bullet position, hull integrity —
are kept in thousandths. Two devices can then never disagree about a rounding
step, and `hashWorld` is an exact equality test rather than an approximate one.

Every field of `World` is in `hashWorld` unless it is one of the named
exceptions in `hash.ts` (decision 23), and that is a test rather than a habit:
`packages/sim/test/hash-coverage.test.ts` builds a world with something in every
field, for every boss, changes one leaf at a time and requires the fingerprint
to notice. A field added and left out fails there by its own path.

Any new field on a creature or bullet must be added to `hashWorld`. A field
outside the hash is a field that can desync two devices silently.

## Randomness

One seeded xorshift32, seeded **once per run**: `resetClock(world, 0)` at beat
zero puts the tick counter, the id counter and the rng back together, and
`startWave` never reseeds. So a wave does not play the same way from whichever
wave you jump into it — it plays the same way from the same beat zero, which is
what two devices in lockstep need and what a replay reproduces. A run is the
unit of reproducibility, not a wave.

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

## Network — built

Delayed lockstep, not a server-authoritative model. Two cooperating players
with no competitive incentive do not need one. Both devices exchange inputs
only and run the same deterministic simulation.

`packages/net` holds the protocol, the scheduler and the clock, and is imported
by both sides so the room and the browser cannot drift apart about what a field
means. `apps/server` is the relay; `apps/game/src/link.ts` is the client.

**The whole model rests on one promise each device makes to the other:** *I have
scheduled nothing before tick N.* A device may simulate tick T the moment both
promises reach T, and not a tick sooner. Its own promise is free — a press is
always scheduled `inputDelayTicks` into the future, so by the time tick T comes
up nothing can still be added to it. The peer's promise arrives over the wire as
a `confirm`.

**The timestamp is taken when the screen is touched**, not when the packet
arrives. Otherwise the player with the worse connection is punished and the one
who presses early is rewarded — fatal for a game whose core is a shared beat.

**The delay is measured, not configured, and each device holds its own**
(`packages/net/src/delay.ts`). `cfg.inputDelayTicks` is 12 ticks — a tenth of a
second, which is right for two phones on one wifi and short of the trip out to a
Durable Object and back down to a handset on mobile data. A delay shorter than
that trip does not feel quicker: every press misses the tick it was meant for
and the run lives in `stalled`. So the delay is taken from the measured round
trip, rising the moment the link asks and falling a tick a second when it
recovers, with the configured value as its floor and 400 ms as its ceiling.

It is never agreed with the peer, and that is the point: every command crosses
the wire stamped with the exact tick it lands on, and a device's `confirm`
horizon is derived from whatever its own delay is at the moment it is sent. Two
devices holding different numbers are still one game — the bad line costs feel
in the hand that owns it rather than in both. Which is also why it is not in
`SimConfig`: a number the two must agree on would have to be handed out by the
room and hashed, and this one does not. `packages/net/test/two-devices.test.ts`
plays nine hundred ticks with mismatched delays, and again with both being
retuned mid-run, comparing fingerprints on every tick.

A delay that falls needs one guard, and has it: a press is never scheduled at or
before a tick already confirmed empty (`Lockstep.scheduleFor`). The promise
outlives the number that produced it.

Clock sync: four timestamps per measurement, take the median of several, adjust
the offset *gently* and never in a jump. The device clock is never touched,
only game time. It is used for one thing: turning the room's beat zero into a
moment on this device's own clock.

**Beat zero puts the tick counter back to zero** (`resetClock`), on both devices,
before the scheduler is built. Lockstep numbers every command by the tick it
takes effect on, so two worlds that begin on different tick counts are not one
game played twice — they are two games. A device that has been playing solo while
it waits in a room is exactly that hazard, so a joined device holds still until
beat zero rather than playing on.

`hashWorld` is the desync detector it was always written to be: every four beats
each device sends its fingerprint, and the first tick where the two differ is the
tick the two worlds parted. It reports and does not repair — there is no
resynchronisation in this model, and a mismatch means a rule read the wall clock
or a field escaped the hash.

Server: one Cloudflare Durable Object per room, WebSocket, hibernation. It
relays inputs, distributes the beat zero point and answers clock syncs. Nothing
else — see `apps/server/README.md`.

**A socket that goes away is the ordinary case on a phone**, not the
exceptional one: a screen locks, a train enters a tunnel, wifi hands over to the
mobile network. The client reaches for the room again a few times before it
tells the player anything is wrong, and it keeps the clock offset while it does
— that offset is the same server's clock either way, and re-acquiring it would
spend two seconds inside the room's three-second countdown.

**A new beat zero ends the run that was on.** The room stamps one every time it
fills, so a phone rejoining hands both devices a timestamp that is not the one
they started on; both throw the run away and count down again. Resuming instead
would leave the two counting from different ticks, which is not lag — it is two
games with one fingerprint check between them.

**A third device is refused through the socket, not in front of it.** An HTTP
409 reaches the page as a socket that would not open, and that is
indistinguishable from a dead line. So the upgrade completes, the room says
`full` in the vocabulary the indicator reads (`status.ts`), and only then closes
— because telling somebody their connection died when the truth is that the room
is busy sends them to check a signal that is fine.

Order on the wire is load-bearing. A `confirm` overtaking the `input` it was sent
after is a device breaking its own promise, and the scheduler is right to refuse
the input rather than apply it out of step. A WebSocket keeps the order; anything
put in front of one must too.

## When PixiJS becomes due

Only when one of these is true: Canvas 2D drops below stable 60 fps on target
devices despite pre-rendered sprites; substantially more than ~52 simultaneous
objects; additive blending becomes awkward or slow in Canvas; runtime
deformation is needed instead of pre-rendered stages.

Because the logic is separate, that change touches `packages/render` only.
