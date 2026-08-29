# Bosses

> **Status: four built.** The Bulb Queen, THE MIRROR, The Warden and THE VANE
> are in the game — the last of them holding The Conductor's slot. Of the
> remaining seven names none are. Two of them are worked out on this page and
> neither is buildable today: The Vessel waits on a second device and The
> Mother on destruction tracking.

Order, following [the act structure](wave-design.md#84-the-ten-pillars-as-an-act-structure--not-built):

Bulb Queen (10) · Strand Nest (20) · The Conductor (30, **THE VANE**) ·
The Choir (40) ·
The Warden (50) · The Heart (60) · The Mother (70) · The Codex (80) ·
The Echoes (90) · The Kernel (100) · The Vessel (finale) · The Mirror (built).

THE MIRROR is a twelfth, outside that order. It was built because it was asked
for, and it holds no slot in the act structure yet — 11.3 says where it would
fit if one is ever given to it.

Only four of the eleven are worked out. The rest are names holding a slot in
the act structure.

The four that exist ask four different questions. The Queen is about **what you
know**, THE MIRROR about **what you remember**, The Warden about **what your
hands are free to do**, and THE VANE about **what you can still say when the
words no longer line up** — which is why none of them is a re-skin of another
and why the fifth one built should be asked the same question before it is
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

## 11.4 The Warden — the gate one of you holds open

> The one where he holds the door open and she has to be quick enough to shoot
> through it.

A third boss for a third question. The Queen is about **what you know** and THE
MIRROR about **what you remember**; the Warden is about **what your two hands
can do between them**. It splits no information at all — both screens show
everything it does — because the Queen already owns that coupling and a second
boss built on it would be a re-skin.

**A ring with a hole in it.** Five columns wide, at `wardenRow`, dead centre,
and it never walks: it is a fixture, not an arrival. What moves is the **pupil**
— the hole slides a column a beat, back and forth inside the ring, so the column
that matters changes while the body does not. Through the hole you see the
field, the grid pulse and the stars behind it: the only object in the game you
can see past.

**The rope.** Every `wardenCycleBeats`, on beat 0, a line is lowered out of the
**middle** of the rim, with a handle on the end of it, and it hangs there. It
does not fall, it cannot be shot, it cannot be warded, and it cannot cost the
hull anything: `fallTilesPerBeat("tether")` is zero and `resolveHull` has
nothing to say about it. The middle is deliberate — that is the column the hatch
is behind, so the rope starts standing in the shot lane and the pull that opens
the hatch is the same movement that clears it.

**Player 1 pulls; player 2 fires; neither can reach the other's half.** The
pilot takes the handle and carries it aside, and the **hatch in the middle of
the ring, with the eyelids behind it, opens by degrees in proportion to the
tension**. The navigator fires the rim's colour into the pupil's column while it
is open. A hit takes a plate, shuts eye and hatch together, and snaps the rope
back. Repeat until the plates are gone.

That is the game's central shape appearing in a boss, and it is why this one
exists. The seat holding the rope cannot fire. The seat firing cannot feel the
pull — how far the hatch has come open is their whole readout of a hand they
cannot see. The talking is not decoration on the mechanic, it **is** the
mechanic.

**How far is far enough** is `wardenTautMilli`, thousandths of a tile of hand
travel, and the pull is a **distance rather than a duration**. Sideways, because
the handle is one-to-one with the finger and the rope swinging aside is the
picture. The **sign** is kept so the rope can be drawn going the way the hand
went; the **rule** takes the magnitude, because a gate on a block and tackle
does not care which way you lean.

**Nothing but the tension holds it open.** There is no tear and no clock. Keep
pulling and it stays open; slacken and it shuts; land a shot and the rope is
taken away. A hand held perfectly still sends no messages at all, which is why
the tension is *stored* on `WardenState` rather than recomputed from the last
command — a gate that shut every time somebody stopped moving would be
unplayable.

**One rope per cycle, hit or not**, and the rim's colour alternates with the
cycle: red, cyan, red. The colour used to follow which control was clamped; with
the clamp gone it is the cycle's own parity, and it had to survive because it is
the only reason player 2 reaches for both buttons rather than resting a thumb on
one. A cycle that was scored has no second rope — the pair gets the rest of it
to say the next colour out loud. A cycle that was not gets its rope replaced
under whatever hand is on it, and that hand has to pull again from where it now
stands (`pulling` goes false at every attach).

**One hit per rope**, in the pupil's column, in the rim's colour. A second shot
inside the same opening does nothing; a spray must not be allowed to skip a
plate. The plate is the whole cost of a hit and nothing else changed to make
room for the new gesture.

**The pupil keeps drifting while the hatch is open**, on purpose. A gate the
pair can hold open for as long as they like would otherwise ask nothing of
player 2 at all; with the eye still walking, the shot is a column the two of
them have to name to each other across a voice delay while one of them holds the
rope.

**Phases follow the plates and nothing else.** The ring wears `wardenPlates` and
drops one per hit, leaving a gap that never fills, so the silhouette says how far
in you are without a bar. Only how hard the pupil is to name and reach tightens;
the rope, the pull and the hatch never do.

| Phase | Plates left | Pupil drift |
|---|---|---|
| WATCH | 5–4 | a column a beat |
| NARROW | 3–2 | two a beat |
| GLARE | 1 | two a beat |

**Nothing about it is random.** Like THE MIRROR it never draws from the rng —
colour and phase both follow from counters both devices already agree about.

**Nothing in this fight can hurt the pair, and that is known.** The clamped
control, the falling line and the vented rock all came off together, and with
them went every way the Warden could cost the hull. The owner has seen that and
is solving it separately; do not invent a clock or a hazard to fill the gap. The
two retired concepts are written up in `docs/parked.md` as designs somebody
could pick up.

**The rope is the first `special` creature.** The bestiary reserves that category
for something answered by neither cannon nor shield and says to leave it empty
until one is designed ([bestiary](bestiary.md#categories)); a thing you can only
put a hand on is exactly that. It carries no control group, so the band still
shows `aim` and `guard` from the Warden itself.

**It is dragged, not gripped, and that is a different verb.** The grip is only
ever a brake on a fall (`grip.ts`), so a hand on a rope that does not fall would
drag at nothing while showing every sign of working — the queen's own reason for
being excluded. `isGrippable` refuses the tether for it, and the rope is answered
instead by the circle its handle is drawn in: `tetherHandleCircle` in
`render/src/tether.ts`, beside the code that draws it, and asked from
`render/src/handles.ts` along with THE MAZE's string. The resting circle, never
the swung one — by the time it has swung the pointer is captured.

**How it is drawn — and this part is built.** The body is two lobed contours
under different seeds, cut with an even-odd fill, the trick `circleSubpath`
already plays for the hull's fire opening. The pupil sits off-centre and slides,
bunching the material on one side and thinning it on the other: an eye looking
sideways. The two loops deliberately disagree — eight shallow lobes and almost no
wobble on the body, five deeper ones with three times the wobble on the pupil, so
the edge you look *through* is the one that moves.

Inside the hole, at `HATCH` of its radius, sits the **trapdoor**: two plates that
meet when the rope is slack and part as it comes taut. It covers two thirds of
the hole and no more, so the ring keeps the one thing it says about itself.
Behind the door the **eye** opens on the same number — a lens whose lids come
apart, an iris in the rim's colour, and a pupil that goes from a slit to a disc.
Both are one quantity, so there are not two things to keep in step.

**The four things that have to be legible, in order, with nobody told
anything**, which the owner asked for by name: the handle reads as something to
take hold of; the moment it is held is visible; pulling builds tension and more
pulling builds more, **continuously**; and the hatch opens further and further
with it. The fourth one carries the mechanic, and nothing between the rule and
the picture may be eased — an openness that lagged the tension would lie at
exactly the moment somebody is deciding to fire.

Everything held between frames lives in `Effects` and is cleared in
`Effects.reset()`. There is one thing: the **snap-back** after a hit, because the
rope stops existing in the same tick the plate comes off and the world has
nothing left to derive it from. It is not decoration — the pulling seat cannot
see the plate go, and the rope leaping back up into the rim is how they learn
their partner scored.

**Where it lives.** `WardenState` in the `BossState` union, a `warden` kind with
`colSpan` 5 and a `tether` kind beside it, and two files: the arithmetic in
`packages/sim/src/warden-cycle.ts` — the colour and the phase, both *derived* —
and the rope and the clock in `packages/sim/src/warden.ts`. Every number above
is a named field of `BossConfig`.

**The rope answers on the tick, not the beat**, and so it has its own call in
`step` beside THE MAZE's string. A gate that only opened on the beat would feel
like a queue rather than a hand on something. `stepWardenTether` runs in the same
tick, straight after `advanceBullets`, so the snap-back is in the same breath as
the hit.

Its wave is `THE WARDEN` and its sentence is the epigraph. What has *not* been
looked at by a human is whether the hatch reads as a proportion at phone size —
whether a partner watching it can tell "nearly there" from "there" without being
told a number, which is the whole of player 2's half of this fight and is a
question no test can answer.

## 11.5 THE VANE — the arm that decides where you are hit

> The one where the column you were told is never the column it lands in.

A fourth boss for a fourth question. The Queen is about **what you know**, THE
MIRROR about **what you remember**, The Warden about **what your hands are free
to do**; THE VANE is about **what you can still say when the words no longer
line up**. It splits no information and takes no control — both screens show
everything it does and both thumbs work all fight. What it takes is the
*meaning* of a number.

**An arm on a bearing, hung off the top edge.** It is the only thing in the
game that is not on the grid: the bearing hangs above row 0 and the arm sweeps
across the row every arrival comes in on. Nothing of it is a creature, so
nothing of it falls, can be warded, or can be gripped — and nothing of it can
reach the hull. It is the first boss that attacks you not at all. That is not a
softening: a wave under it is as dangerous as the wave its author wrote, and
what the arm decides is only *where*.

**The rule, and it is one sentence.** Something crossing the arm three columns
to its left comes out three columns to its right. The field is folded about the
column the tip is standing in, `2 x tip - col`, held to the grid so a body
thrown past the edge is pinned against it rather than lost.

**It touches an arrival once and never again.** The fold happens on the beat a
body comes in, at row 0, and everything already standing on the field keeps its
column for the whole of its fall. That line is the whole difference between a
rule the pair can state and a radar they cannot believe, and it is the one
thing about this boss that may never be relaxed.

**Why that is a fight.** The radar is split by kind: the pilot is shown rocks
and holds no shield, the navigator is shown the living and holds no cannon
([systems](systems.md#52-information-split--partly-built) 5.2). So the one who
reads a column is never the one who acts on it, and the number on the strip is
no longer the number that will be true. Two ways through, and both cost
something. Wait two beats and read the field, and the head start the radar
exists to give is gone for the whole fight. Or fold it before saying it, which
means predicting where a moving arm will be on a beat that has not happened
yet. The beat solved this problem for *time* — you say "on the three", not
"now", and it survives a two-second delay ([latency](latency.md)). The arm asks
for the same trick in space, and the only phrasing that works is one counted
**against the arm** instead of against the grid, because a fold turns "three
left of it" into "three right of it" and leaves the three alone. That sentence
is not written anywhere in the game; the pair has to arrive at it.

**The 4-second rule is untouched.** The fold is at row 0, so a body is standing
in its true column for all fourteen beats of its fall — 8.75 s at the defaults.
What the arm spends is the radar's lead, which is surplus on top of the floor,
never the floor itself.

**The cycle is fixed and learnable, and it is written once.** Held at one end,
across, held at the other, back — the same lengths in every phase, so a pair
that learned it on its first turn has learned it for the fight, exactly as 11.1
demands of The Mother. It is `VANE_CYCLE` in `packages/sim/src/vane-cycle.ts`,
and the director's boss panel renders that array. It is deliberately **not**
repeated here: the Warden's table above is already written twice, and a third
copy is how a spec starts lying. What is worth saying in prose is the one thing
a table would not make obvious — the arm reaches the end of its travel one beat
**before** the housing splits, and that beat is the tell. A window with nothing
in front of it cannot be called across a voice delay.

**The bearing, and how a shot gets to it.** The pivot is the only part that can
be hit, and it is reachable only while the arm is held at an end. It hangs
above the field, so a shot answers it by *leaving* the field: the pilot stands
in the split column and the navigator fires the split's colour, and the shot
has to climb a clear lane, because anything in the way stops it. The arm
therefore defends its own bearing with whatever it has just thrown, which is
the one place its two halves meet. One hit per opening; a spray may not skip a
pin. The housing splits on the side away from the load — arm hard right, split
one column left of the bearing — so which column to stand in is the fold's own
direction in miniature, twice a cycle, taught by a column instead of a card.

**Its health is its reach.** Every pin taken out of the bearing lets the arm
slip a phase further out, so the boss answers damage by folding *more* of the
field. SWING reaches two columns, VEER four, SEIZE the whole width; the phases
are `VANE_PHASES` beside the cycle. It is the Queen's bargain — she sinks a
tile per petal — read sideways, and it means the silhouette says how far in the
pair are without a bar anywhere. It also means the fight gets harder to *talk
about* while getting easier to *shoot*, which is the shape this boss should
have: by the last phase the arm is throwing across the whole field, and the
pair either have a vocabulary by then or they never will.

**Nothing about it is random.** Like THE MIRROR and The Warden it never draws
from the rng: the sweep, the openings, the colours and the fold all follow from
the wave's beat and the pins. `vane.test.ts` holds the seed to that.

**Where it lives.** `VaneState` in the `BossState` union — four integers, two of
them only so render/ can draw the last throw — with the arithmetic in
`packages/sim/src/vane-cycle.ts` and the choreography in
`packages/sim/src/vane.ts`. Its wave is `THE VANE` and its sentence is the
epigraph. It is the one boss whose wave *must* carry creatures, so the
director's guard against a creature brush on a boss wave asks `bossFillsWave`
rather than whether a boss is there at all.

What has **not** been looked at by a human is whether the arm reads as a
mechanism sweeping the top of the field or as a weapon hanging over it. That is
the question the whole picture rests on — a vane is a thing that turns when
something pushes it — and neither a still nor a test can answer it, because it
is a question about motion at tempo.
