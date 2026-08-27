# Bosses

> **Status: three built.** The Bulb Queen, THE MIRROR and The Warden are in the
> game. Of the remaining eight names none are. Two of them are worked out on
> this page and neither is buildable today: The Vessel waits on a second device
> and The Mother on destruction tracking.

Order, following [the act structure](wave-design.md#84-the-ten-pillars-as-an-act-structure--not-built):

Bulb Queen (10) · Strand Nest (20) · The Conductor (30) · The Choir (40) ·
The Warden (50) · The Heart (60) · The Mother (70) · The Codex (80) ·
The Echoes (90) · The Kernel (100) · The Vessel (finale) · The Mirror (built).

THE MIRROR is a twelfth, outside that order. It was built because it was asked
for, and it holds no slot in the act structure yet — 11.3 says where it would
fit if one is ever given to it.

Only three of the eleven are worked out. The rest are names holding a slot in
the act structure.

The three that exist ask three different questions. The Queen is about **what
you know**, THE MIRROR about **what you remember**, and The Warden about **what
your hands are free to do** — which is why none of them is a re-skin of another
and why the fourth one built should be asked the same question before it is
started.

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

## 11.4 The Warden — the eye that takes a hand off you

> The one where it holds one of your controls and only the other one of you can
> get it back.

A third boss for a third question. The Queen is about **what you know** and THE
MIRROR about **what you remember**; the Warden is about **what your hands are
free to do**. It splits no information at all — both screens show everything it
does — because the Queen already owns that coupling and a second boss built on
it would be a re-skin.

**A ring with a hole in it.** Five columns wide, at `wardenRow`, dead centre,
and it never walks: it is a fixture, not an arrival. What moves is the **pupil**
— the hole slides a column a beat, back and forth inside the ring, so the column
that matters changes while the body does not. Through the hole you see the
field, the grid pulse and the stars behind it: the only object in the game you
can see past.

**The tether.** Every `wardenCycleBeats`, on beat 0, a line comes out of the rim
and takes hold of one control — cannon, shield, cannon, strictly alternating, so
the pair always knows whose turn it is to be helpless. A held control is
**frozen**: a clamped cannon takes no `cannonCol`, a clamped shield no
`shieldCol`, and those commands are *dropped rather than queued*, so the release
cannot teleport the control to wherever a thumb wandered. The trigger and the
maw keep working; it is the sliding that stops.

It takes the control **where it stands**, and the line then runs straight down
that column — so the column the pair will be stuck in, and the column the scar
lands in if the rescue fails, is one they chose a cycle earlier. There is no
homing and nothing to outrun: a control cannot be walked out from under a
tether, only pulled free of one.

**Only the player it is not holding may pull it.** That is the fight in one
line. You get no leverage on your own tether, so the rescue falls to the other
one every cycle and costs them their hand — a thumb on the line is a thumb off
the strip below it. For those beats one of you is clamped and the other is
holding, and between you there is one working control.

`wardenPullBeats` of hold tears it out of the rim, and the hold **accumulates**
rather than having to be unbroken: a slip on a phone should not cost a cycle.
The line is its own progress bar, going white and thin from the rim down.

**The clock never moves — only your choice of when to start.** The tether falls
at `meteorMedium`'s speed, reaching the hull from `wardenRow` on cycle beat 6,
and a hand slows it by `gripSlowPermille`, the same number every grip uses. So a
late pull is a real trade rather than a mistake: the slowing still saves the
hull, but the tear lands after beat 6 and the cycle opens nothing.

| Cycle beat | What happens |
|---|---|
| 0 | the tether attaches, that control freezes, the rim takes the cycle's colour |
| 0–6 | it draws straight down that column. Not shootable, not wardable |
| 6–8 | **only if torn by 6:** the pupil snaps wide and the core stands in it |
| 8 | the pupil shuts and **vents one rock** from its column, torn or not |
| 12 | the next cycle, the other control |

**One hit per opened eye**, in the pupil's column, in the colour the rim has
carried all cycle — and the colour follows the clamp: a cannon cycle is red, a
shield cycle cyan. One alternating parameter runs the whole fight. A second shot
inside the same window does nothing; a spray must not be allowed to skip a
plate.

**A tether that reaches the hull costs `damageWarden` and a scar** at its
column, then lets go. Nothing compounds — losing hull and losing the plate you
would have taken is punishment enough without a spiral.

**The vent is what keeps the shield honest.** A plain meteor takes twelve beats
from `wardenRow` to the hull, exactly one cycle, so every rock the eye exhales
arrives on beat 8 of the *following* cycle — during the next clamp, which on
half the cycles is the shield's. The shield has to be parked in the vent's
column before it is taken, and that is planned out loud a cycle ahead: "it's in
six, put it there now, it comes for you next." Fixed and learnable from the
first cycle, as 11.1 demands of The Mother.

**Phases follow the plates and nothing else.** The ring wears `wardenPlates`
and drops one per hit, leaving a gap that never fills, so the silhouette says
how far in you are without a bar. Only how hard the pupil is to name and reach
tightens; the timing never does.

| Phase | Plates left | Pupil drift | Vent |
|---|---|---|---|
| WATCH | 5–4 | a column a beat | meteor |
| NARROW | 3–2 | two a beat | meteor |
| GLARE | 1 | two a beat | meteorMedium |

**Nothing about it is random.** Like THE MIRROR it never draws from the rng —
alternation, drift, colour and vent all follow from the cycle count.

**The tether is the first `special` creature.** The bestiary reserves that
category for something answered by neither cannon nor shield and says to leave
it empty until one is designed ([bestiary](bestiary.md#categories)); a thing you
can only put a hand on is exactly that. It carries no control group, so the band
still shows `aim` and `guard` from the Warden itself, whose radar owner is
`"p2"` and never fires — it is installed by a wave, not announced as an arrival.
The vented rocks are ordinary meteors on P1's strip like every other rock.

**Neither boss may be gripped, and that has to be one rule.** `setGrip` excludes
the queen by naming her kind; a second name beside it is a second copy, and the
next fixture makes it three. It becomes `isGrippable(kind)` in `types.ts`,
called and not re-derived. What is clamped stays derived too — `cycle % 2`,
never a stored field.

**How it is drawn — and this part is built.** The body is two lobed contours
under different seeds, cut with an even-odd fill, the trick `circleSubpath`
already plays for the hull's fire opening; nothing had to be invented and
nothing has to be wound a particular way. The pupil sits off-centre and slides,
bunching the material on one side and thinning it on the other: an eye looking
sideways. The two loops deliberately disagree — eight shallow lobes and almost
no wobble on the body, five deeper ones with three times the wobble on the
pupil, so the edge you look *through* is the one that moves. It is tuned in
`tools/shape-sheet/src/catalogue.ts` and shows in the director's SHAPES tab.

**The pupil cannot keep growing, and that is a measurement.** `ringClearance`
scans the narrowest the body ever gets between its two loops across the whole
wobble window, and past about 0.66 of the radius the pupil breaches the rim: the
shape stops being a ring and becomes a crescent, at some moment three seconds
into a wobble rather than at rest, which is why an eye alone cannot catch it.
`tools/shape-sheet/test/ring.test.ts` holds the floor at 12% of the radius.

That settles what GLARE looks like. It is **not** a wider opening — there is no
room for one. It is the open pupil *at rest*: by the last phase the eye is
permanently as wide as it used to get for two beats, which is the hollowing-out
this section already asks for, drawn as a silhouette instead of a bar. Anything
that wants to dilate further has to thin the body from the outside.

The tether is the game's first **open** contour, `openSmoothPath`, taut, a slow
wave travelling down it — and a hand on it **bows the line toward the finger**,
stops the wave into a shiver, thins and brightens the stretch under tension, and
snaps back with an overshoot when the hand lifts. The tear parts it at the rim;
it whips down, lies limp across the field for a beat, goes out. The ring's
recoil is what opens the pupil. The vented rock is drawn full size behind the
closing iris and emerges as the aperture crosses it, so it reads as squeezed out
rather than spawned.

Everything held between frames — bow, tension, whip, dilation — lives in
`Effects` and is cleared in `Effects.reset()`: `world.beat` is not monotonic
across a restart, and `restart.test.ts` fails on a field that is not.

**Where it lives.** `WardenState` in the `BossState` union, a `warden` kind
with `colSpan` 5 and a `tether` kind beside it, and two files: the cycle's
arithmetic in `packages/sim/src/warden-cycle.ts` — which control this cycle
clamps, which colour the rim carries, which phase the plates put it in, all
*derived* and none of it stored — and the choreography that moves state in
`packages/sim/src/warden.ts`, dispatched from `stepBoss`. Every number above is
a named field of `BossConfig`.

Two things did not survive contact with the code exactly as written above, and
both are worth saying because the page they contradict is this one.

**The hold is measured in ticks, not beats, and so it has its own call in
`step`.** Everything else a boss does happens on a beat; a hold that
accumulates cannot, or a thumb that slipped for a third of a beat would lose
the whole beat. `pullTether` runs once a tick, after `dropLostGrips`.

**The pupil keeps drifting through the opening.** The two beats the core is
exposed are too few to *find* a column in across the voice delay, so the aim
has to be a prediction the pair agreed on beforehand — which is what the drift
is for. Freezing it for the window would have made the drift decorative.

Its wave is `THE WARDEN` and its sentence is the epigraph. What has *not* been
looked at by a human is how the ring reads at phone size: the hole is genuinely
cut (the field and the grid pulse show through it, which nothing else in the
game does), but whether a body in `rockDark` reads as solid enough against the
field for that to land is a question a still cannot answer and a test cannot
either.
