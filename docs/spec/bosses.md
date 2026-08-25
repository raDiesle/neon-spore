# Bosses

> **Status: one of eleven built.** The Bulb Queen is in the game. The rest are
> not, and the two worked-out ones depend on systems that are also unbuilt — the
> second device for The Vessel, and destruction tracking for The Mother.

Order, following [the act structure](wave-design.md#84-the-ten-pillars-as-an-act-structure--not-built):

Bulb Queen (10) · Strand Nest (20) · The Conductor (30) · The Choir (40) ·
The Warden (50) · The Heart (60) · The Mother (70) · The Codex (80) ·
The Echoes (90) · The Kernel (100) · The Vessel (finale).

Only two of the eleven are worked out. The rest are names holding a slot in the
act structure.

## 11.0 The Bulb Queen — armoured everywhere but the mark

> The one where she opens for two beats, and a rock falls fast on a clock of
> its own.

A huge, armoured body of her own shape. She paces the top of the field, one
column per beat, turning at the edges — and, one tile per petal lost, sinks
nearer the hull for as long as she has any left, closing the distance for the
whole fight rather than levelling off partway through. Only the mark
embedded in her front is ever hittable; the rest of her is decoration a shot
cannot reach, sized and drawn like an ordinary creature so the one column that
matters is never in doubt.

**A bloom has two halves, and the roles already split them.** Two beats before
she opens she announces a column and a colour, and stops walking — so the
column she names is the one she is still standing in when she opens. The column
is the pilot's, who moves the cannon; the colour is the navigator's, who fires.
Neither half answers a bloom alone, and the announcement is only worth
something said out loud. That is the whole reason she is a boss and not a large
creature. A miss just closes the bloom — there is no punishment for it; her
rocks are a separate thing entirely.

**Her rocks are on their own clock, not tied to the bloom or her health.**
Every 8 beats, from her first beat to her last, a rock grows visibly out of a
bulge on one side of her body — the side drawn 2 beats ahead of the drop, so
there is time to see it coming — breaks off, and lands one column further
toward that side. It falls three times as fast as an ordinary meteor. Nothing
about the cadence reads *how well* the pair is playing — it is fixed and
learnable from the very start, exactly as 11.1 demands of The Mother.

Nine petals, three phases, each ended by the petal that leaves it — these
tighten only the bloom's own cadence, not her rocks:

| Phase | While petals are above | A bloom every | Tell | Open |
|---|---|---|---|---|
| CROWN | 7 | 6 beats | 2 beats | 2 beats |
| BROOD | 4 | 5 beats | 2 beats | 2 beats |
| SCREAM | 0 | 4 beats | 1 beat | 2 beats |

**Where she lives.** Her choreography is `packages/sim/src/boss.ts`, carried by
the wave `BULB QUEEN`. Everything else about her is shared with the rest of the
sim: the creature, the petals, the rule that a shot matching her open colour
takes one, and the picture.

*She was briefly built twice*, as `boss-a.ts` and `boss-b.ts`, to measure
whether delegating implementation actually saves tokens — see
`docs/delegation-cost.md`. Variant A was removed once the comparison was done;
`boss.ts` is what was variant B.

## 11.1 The Mother — reactive, but announced

She reacts to what the pair destroyed in the previous act, and brings it back.
So that this does not become a hidden difficulty adjustment, three conditions:

1. The reaction refers to **what was destroyed, not to performance**. She
   reacts to *what* the pair did, never to *how well*.
2. The mapping is fixed and learnable: meteor → warding pressure, slick → colour
   pressure, spared runts → stronger growth. A pair should be able to predict
   its next encounter.
3. Overall difficulty stays the same. What shifts is **which** control group is
   loaded, not **how heavily**.

The choreography therefore stays fixed — it simply has several written-out
versions, between which the pair's behaviour visibly chooses.

## 11.2 The Vessel

The navigator sees the target combination, the pilot only the individual
current states. That makes it no longer an arithmetic puzzle under time
pressure, but an announcement under time pressure.

This is the clearest single argument for the
[information split](systems.md#52-information-split--partly-built): the boss does
not work at all on one shared screen.
