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

## 11.0 The Bulb Queen — armoured until she opens

> The one where she opens for two beats, and every miss comes back as a rock.

A huge bulb that **never descends**. She holds her row and paces the top of the
field, one column per beat, turning at the edges. While she is closed she is
armoured: a shot into her column bounces off.

**A bloom has two halves, and the roles already split them.** Two beats before
she opens she announces a column and a colour, and stops walking — so the
column she names is the one she is still standing in when she opens. The column
is the pilot's, who moves the cannon; the colour is the navigator's, who fires.
Neither half answers a bloom alone, and the announcement is only worth
something said out loud. That is the whole reason she is a boss and not a large
creature.

**A miss is answered.** A bloom that closes with her petal still on is answered
by a meteor spat into the column she opened in, so a pair that cannot hit her
drowns in its own misses. Nothing about her reads *how well* the pair is
playing — the choreography is fixed and learnable, exactly as 11.1 demands of
The Mother. What changes across the fight is which of two colours is wanted,
never how hard she is.

Nine petals, three phases, each ended by the petal that leaves it:

| Phase | While petals are above | A bloom every | Tell | Open | She also |
|---|---|---|---|---|---|
| CROWN | 7 | 6 beats | 2 beats | 2 beats | — |
| BROOD | 4 | 5 beats | 2 beats | 2 beats | releases a runt of the opposite colour |
| SCREAM | 0 | 4 beats | 1 beat | 2 beats | releases a runt **and** spits a rock, hit or not |

The runt carries the colour she is *not* open in, so the navigator cannot park
on one colour. The rock in the last phase is the guard load: it arrives in the
same breath as a bloom, so the pilot has to trigger while the navigator holds
the shield column and still answers the colour.

**Where she lives.** Her choreography is one module per variant,
`packages/sim/src/boss-a.ts` and `packages/sim/src/boss-b.ts` — the same design
implemented twice so the two can be played side by side, carried by the waves
`BULB QUEEN A` and `BULB QUEEN B`. Everything else about her is shared: the
creature, the petals, the rule that a shot matching her open colour takes one,
and the picture.

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
[information split](systems.md#52-information-split--not-built): the boss does
not work at all on one shared screen.
