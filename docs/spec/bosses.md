# Bosses

> **Status: two built.** The Bulb Queen and THE MIRROR are in the game. Of the
> remaining nine names none are, and the two worked-out ones depend on systems
> that are also unbuilt — the second device for The Vessel, and destruction
> tracking for The Mother.

Order, following [the act structure](wave-design.md#84-the-ten-pillars-as-an-act-structure--not-built):

Bulb Queen (10) · Strand Nest (20) · The Conductor (30) · The Choir (40) ·
The Warden (50) · The Heart (60) · The Mother (70) · The Codex (80) ·
The Echoes (90) · The Kernel (100) · The Vessel (finale) · The Mirror (built).

THE MIRROR is a twelfth, outside that order. It was built because it was asked
for, and it holds no slot in the act structure yet — 11.3 says where it would
fit if one is ever given to it.

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

## 11.3 THE MIRROR — your own ship, asking for your moves back

> The one where the boss is an exact copy of your ship, and Simon says.

An exact copy of the player's hull, upside down at the top of the field, in the
colours of something that went wrong: blood where the ship has violet, bone
where it has white. Not a lookalike — it is drawn by `drawHull`, the same
function, under a vertical flip (`packages/render/src/mirror.ts`), so the claim
"that is your ship" is one the picture cannot fail to make.

**The mechanic is Simon Says, played on the pair's own controls.** It performs a
sequence at its own ship — its cannon slides, its shield flashes, its maw opens,
its shots drop — one step every two beats, with the glyphs running along above
it. Then the glyphs go and it is the pair's turn: a sequence still on screen
while it is repeated is not a memory test, it is reading aloud. Only the count
of steps stays, filling in as they land.

**Neither of them can answer a sequence alone, and neither can answer one
silently.** The alphabet is six steps and it crosses the roles: FIRE RED and
FIRE CYAN are the navigator's, SHIELD and SUCK are the pilot's, LEFT and RIGHT
are the pilot's cannon. A round mixing the two halves has to be talked through
in order, under a clock, from memory. That is the whole reason it is a boss.

The shield's *position* is deliberately not in the alphabet. A lobe's column is
aiming, not a gesture — and one test key moves both lobes at once, which a
shield step would turn into two.

**A wrong step is thrown back.** The mirror answers it with a rock out of its
own body into whichever column the cannon is standing in: an ordinary hull
breach, crater, crack and all, and the whole picture tips upside down over
itself for half a second while it lands. Then it asks the same round again, at
the same cadence — the pair failed to remember it, not to keep up with it.

**A right answer is the same damage, turned around.** The round breaks the
mirror in the column the cannon was standing in, by one round's share of its
hull, so the last round written is the one that brings it down however many
there are. Its damage is a `hullMilli` and a list of `Scar`s, the two fields
the ship's own damage lives in, and it is drawn by the same code: the mirror
visibly cracks up exactly the way the ship does.

**A pod on this wave is bait.** Taking one in is a SUCK, and a SUCK the
sequence did not ask for is a wrong step. Nothing implements that — it falls
out of the alphabet, which is the argument for the alphabet being the controls
rather than a vocabulary of its own.

**Where it lives.** The rounds are authored in the director and carried by the
wave `THE MIRROR`; the choreography is `packages/sim/src/mirror.ts` and the
vocabulary `packages/sim/src/simon.ts`. Nothing about it is random — the fight
is the same fight on both devices without a single draw from the rng.

If the act structure ever wants it, its slot is The Echoes (90): a boss whose
whole subject is repetition is the one the ninth pillar is already reaching for.
