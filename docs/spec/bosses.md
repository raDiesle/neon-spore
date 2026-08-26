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

> The one where she opens for two beats, and drops a torch on a clock of its
> own.

A huge, armoured, low-slung body of her own shape. She paces the top of the
field, one column per beat, turning at the edges — and, one tile per petal
lost, sinks nearer the hull for as long as she has any left, closing the
distance for the whole fight rather than levelling off partway through. She
carries a torch on each wing tip, always — the same rock a torch anywhere
else in the game is — and two marks cradled under her middle, one tile
either side of her own column with a one-tile gap where nothing stands. The
rest of her is decoration a shot cannot reach.

**A bloom has two halves, and each screen holds exactly one of them.**

| | player 1 | player 2 |
|---|---|---|
| armoured | the creature that is coming, a question mark inside it | a question mark |
| which of the two marks is real | nothing | a pulsing ring |
| open, the real mark | revealed, no question left | revealed |
| open, the other one | a small armoured ball | a small armoured ball |

The two question marks are the same statement from opposite sides. Player
1's sits *inside* a creature they can already name — the shape is what is
coming, the glyph is the half they are not being told. Player 2's stands *in
place of* one: they know exactly which mark and nothing about what comes out
of it.

Player 1 holds the cannon and the ammunition, so they are told *what*, and
their two marks are drawn identically so the side never leaks. Player 2
holds the shield and is told *where*, and never sees an ammunition colour at
all. Neither half answers a bloom alone; the only way through is to say it
out loud. Both marks stay armoured until the bloom opens, and only the real
one ever loses its armour — the other shrinks to a small ball in the colour
of armour, then grows back out of it into the next creature once the bloom
has closed. That reveal is also the moment the split stops mattering, and
far too late to start talking. `queen-split.test.ts` in render/ holds both
halves shut. A miss just closes the bloom — there is no punishment for it;
her torches are a separate thing entirely.

**The armour is the shape that is coming, not a lid over it.** What the next
bloom will be is chosen the moment the last one closed, so her body is never
showing nothing, and player 1's mark carries the real silhouette in rock
grey the whole time. Consecutive blooms always alternate colour, so every
change is a slick↔bulb one, and the mark *morphs* between them — both
contours sampled through `blobRadiusMul` and blended vertex by vertex, so it
genuinely rounds up or flattens out rather than one picture dissolving over
another.

**The bloom always opens exactly halfway between one torch release and the
next**, never on top of one. A pair is never asked to defend the hull and
take the mark in the same beat — that would not be a harder fight, it would
be two fights at once. Only how much warning the bloom gives (`tell`) tightens
with her phase; the timing itself never moves:

| Phase | While petals are above | Tell | Open |
|---|---|---|---|
| CROWN | 7 | 2 beats | 2 beats |
| BROOD | 4 | 2 beats | 2 beats |
| SCREAM | 0 | 1 beat | 2 beats |

**Her torches are on their own clock, not tied to the bloom or her health.**
Every 8 beats, from her first beat to her last, the torch riding one of her
wings — the side drawn 2 beats ahead of the drop, so there is time to see it
coming — is pushed out of its socket and stands still for the beat, which is
the beat the picture hands over from the egg to the creature. From the next
beat it falls at the torch's own speed, the fastest thing in the field, the
whole way down: nothing of her reaches below a wing tip, so there is nothing
to slide clear of first. Nothing about the cadence reads *how well* the pair
is playing — it is fixed and learnable from the very start, exactly as 11.1
demands of The Mother.

**Where she lives.** Her choreography is `packages/sim/src/boss.ts` and
`packages/sim/src/queen-mark.ts`, carried by the wave `BULB QUEEN`. Everything
else about her is shared with the rest of the sim: the creature, the petals,
the rule that a shot matching her open colour on the real mark takes one, and
the picture.

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
