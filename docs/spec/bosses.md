# Bosses

> **Status: five built.** The Bulb Queen, THE MIRROR, The Warden, THE VANE and
> THE FLEET are in the game — THE VANE holding The Conductor's slot, and THE
> FLEET holding none of them. Of the remaining seven names none are. Two of
> them are worked out on this page and neither is buildable today: The Vessel
> waits on a second device and The Mother on destruction tracking.

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

The five that exist ask five different questions. The Queen is about **what you
know**, THE MIRROR about **what you remember**, The Warden about **what your
hands are free to do**, THE VANE about **what you can still say when the words
no longer line up**, and THE FLEET about **giving directions** — which is why
none of them is a re-skin of another, and why the sixth one built should be
asked the same question before it is started.

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
| armoured | the creature that is coming, a target lock inside it | a target lock |
| which of the two marks is real | nothing | a pulsing ring |
| open, the real mark | revealed, no question left | revealed |
| open, the other one | a small armoured ball | a small armoured ball |

The two frames are the same statement from opposite sides. Player 1's sits
*inside* a creature they can already name — the shape is what is coming, the
frame is the half they are not being told. Player 2's stands *in place of*
one, empty: they know exactly which mark and nothing about what comes out of
it.

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

**Which wing is player 2's to call, and it is a clock rather than a ring.**
The flank the next torch comes off wears NEXT TO FALL on player 2's screen and
on nobody else's: the same target lock every picked-out body in the game wears,
the words under it, and a bar that fills as the eight beats run out. It used to
be the pulsing ring the real mark wears, and the two were one picture doing two
jobs — a mark is a *column* to name and a drop is a *clock* to watch, and a ring
pulsing on its own tempo could never say how much of the warning was left.
`packages/render/src/queen-drop.ts`.

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

**A horseshoe standing over a hole.** Five columns wide, at `wardenRow`, dead
centre, and it never walks: it is a fixture, not an arrival. What moves is the
**pupil** — the hole slides a column a beat, back and forth inside the body, so
the column that matters changes while the body does not. Through the hole you
see the field, the grid pulse and the stars behind it: the only object in the
game you can see past.

**It is open underneath.** Two walls run down from the pupil's widest points and
out through the rim, and the material between them is gone, plates and all
(`wardenOpening` in content, `render/src/warden.ts`). The shot that counts goes
into the open eye, and a body closed all the way round put a band of its own
rock between the cannon and the one thing on it worth hitting — the rule said
the shot lands and the picture said it could not, and of the two a player
believes the picture. The way in widens as the eye does, because its width is
the pupil's.

**The rope.** Every `wardenCycleBeats`, on beat 0, a line is lowered out of the
**middle** of the rim, with a handle on the end of it, and it hangs there. It
does not fall, it cannot be shot, it cannot be warded, and it cannot cost the
hull anything: `fallTilesPerBeat("tether")` is zero and `resolveHull` has
nothing to say about it. The middle is deliberate — that is the column the hatch
is behind, so the rope starts standing in the shot lane and the pull that opens
the hatch is the same movement that clears it.

**Player 1 pulls; player 2 fires; neither can reach the other's half.** The
pilot takes the handle and carries it away — any direction will do — and the
**hatch in the middle of the ring, with the eyelids behind it, opens by degrees
in proportion to the tension**. The navigator fires the rim's colour into the pupil's column while it
is open. A hit takes a plate, shuts eye and hatch together, and snaps the rope
back. Repeat until the plates are gone.

That is the game's central shape appearing in a boss, and it is why this one
exists. The seat holding the rope cannot fire. The seat firing cannot feel the
pull — how far the hatch has come open is their whole readout of a hand they
cannot see. The talking is not decoration on the mechanic, it **is** the
mechanic.

**How far is far enough** is `wardenTautMilli`, thousandths of a tile of hand
travel, and the pull is a **distance rather than a duration**. What counts is
its **length**, in whatever direction the hand went: a gate on a block and
tackle does not care which way you lean, and the handle is one-to-one with the
finger, so the rope is drawn running wherever it was carried.

**A handle may not be carried off the field.** The circle stays wholly on the
screen and slides along the edge it reaches rather than stopping dead
(`packages/sim/src/handle-pull.ts`), and it stops a tile short of the very top,
which is the app's own chrome. That bound and `wardenTautMilli` between them
decide which directions can open the gate at all: this rope hangs with 7.2 tiles
of field below it and 6.2 above once the chrome is off, so a downward pull
reaches taut and an upward one cannot. The hand has somewhere to go rather than
a sign to get right, and the boundary is what teaches it.

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
is solving it separately; do not invent a clock or a hazard to fill the gap.
The retired concepts are written up below, as designs somebody could pick up.

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
the hole and no more, so the body keeps the one thing it says about itself.
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

### Retired designs from this fight

Three designs were tried against this boss and set aside; they are recorded
here, against the fight they belong to, which is the only place a reader
looking at THE WARDEN would think to check.

**The clamp — a control taken, and nothing shown taking it.** THE WARDEN used
to clamp a control outright: every cycle a line came out of the rim and froze
one of the pair's two sliding controls — a clamped cannon took no `cannonCol`,
a clamped shield no `shieldCol`, commands dropped rather than queued so a
release could not teleport the control to wherever a thumb had wandered. Only
the player it was not holding could pull it free, at the cost of their own
hand, alternating strictly cannon then shield. The owner's own diagnosis of
why it failed is worth keeping over the mechanic itself:

> das alte konzept, was du beschreibst, gefällt mir nicht und war nicht klar
> verständlich - es gab dazu kein visual, damit das klar wird, und das klemmen
> war nicht lange genug.

*There was no visual to make it clear, and the clamping did not hold long
enough.* The rule was correct on paper and invisible in play — a player whose
strip stopped answering had no way to learn why, and by the time they worked
it out it was over. A second attempt owes it two visuals rather than a
different rule: something visibly reaching from the object to the ship (a
bolt of lightning, a grabbing arm), and the harm shown at the panel itself, a
red edge on the side of the taken control. Start with the two visuals, not
with the rule — the rule was never the thing that was wrong.

**The falling line — a hand holds something back, or it costs the ship.** The
concept behind `grip.ts`, off the field for now: something descends at its own
speed, either player can put a finger on it and it falls slower for as long as
the finger stays, and letting it through breaks the hull. The cost is the
hand — a thumb on the field is a thumb off the strip below it, so holding
something for your partner means not moving your own control, which is what
makes it an assist rather than a brake on the whole game, and why it can
apply to any creature or rock. THE WARDEN's line was the sharpest version of
it, answered by neither cannon nor shield, and the owner took it off the boss
and off every other wave:

> keine bedrohung mehr. aber behalte das konzept von: etwas fällt und muss
> gehalten werden, sonst beschädigt es das schiff.

*No more threat — but keep the concept.* `grippedFallTiles` and
`gripSlowPermille` still work on anything that falls; what is gone is a wave
that asks for it. Picking this up is a creature or a boss that makes holding
the interesting choice, not new machinery.

**Hold-to-tear — a window closed by succeeding rather than by giving up.**
Before the pull above settled on the tension it now has, the control tried was
hold-and-only-hold: a thumb on the line accumulated `wardenPullBeats` of hold
across ticks rather than needing it unbroken — a slip on a phone lost only
that moment — and when the total was reached the line tore out of the rim.
The argument for it: a gate held open purely by tension is unbounded, nothing
ends the window except letting go, so tearing after enough tension puts a
ceiling back on it and ends the window by succeeding rather than by giving up.
The owner chose the block-and-tackle instead —

> nicht das loslassen, und auch nicht das reißen, sondern das bloße halten
> gespannt (wie ein tor mit flaschenzug)

— and kept the tear to be tried elsewhere, probably on another wave or boss.
The two go together: hold-to-tear is the control, and the ceiling it puts on
the window is the reason to reach for it.

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

## 11.6 THE FLEET — one of you has the map, the other has the sights

> The one where the only one who can see the ships is the one who cannot move
> the sights.

A fifth boss for a fifth question, and it is the plainest split this game has
ever drawn. Every other coupling hands each seat **half of one action**: she
places the shield and he triggers it, he holds the rope and she fires through
the gate. This one hands one seat **the whole map** and the other **the whole
vehicle**, and then asks them to hit a square.

**A chart, and it is the field's own lattice.** Eleven squares across —
`cfg.cols`, the same columns the pair have been naming all evening — by
`cfg.fleetRows` down, counted from the top edge, with open water and the ship
below it. It is lettered A to K across and numbered 1 to 10 down, and those
letters are the whole reason it is drawn: every announcement this game has ever
asked for is a column counted from the edge, and a fight over a hundred squares
needs a name that survives being said once across a voice delay.

**This is the tile grid, switched back on.** `field.ts` has carried the lattice
[systems](systems.md) 5.8 asks for since the beginning, held off behind
`SHOW_TILE_GRID` with a note saying to flip it on "when a mechanic needs a
player to call out a square". This is that mechanic. It is drawn per boss
rather than by turning the flag on for everything, because the chart covers
only the rows the ships are in and carries an axis the ordinary field has no
use for.

**Player 1 sees every hull and holds the only trigger. Player 2 sees water and
is the only one who can move the sights.** That is the fight in two sentences,
and neither of them can do a single thing about the other's half. The pilot
spends the whole encounter saying a square out loud; the navigator spends it
counting one, one press at a time.

**The sights step, they never jump**, and that line carries the whole design.
An absolute control — a strip, or a finger on the chart — would name a square,
and a seat that could name a square would not need to be told which one. A step
can only be counted, and counting is the thing two people do out loud. So
player 2's half of the panel is four arrows and nothing else, and a long walk
across the chart costs real presses, which is exactly what makes naming the
square worth doing rather than sweeping for it.

**What both of them see is the record.** Every square already fired at is
marked on both screens — a struck cross where a hull was found, a dashed ripple
where there was nothing. That is not a softening of the split: a pair who could
not remember what they had already spent would be playing a longer fight, not a
harder one. What stays hidden is only ever *where the ships are*.

**A ship going down is on both screens too, and it is the navigator's
receipt.** They have spent the whole fight firing at squares somebody else
named; the one moment they get to see what they were shooting at is the moment
it rolls over and goes under. The sinking is derived from `sunkBeat` and the
beat phase — no render state outlives a frame, so a restart draws a clear
chart.

**The clock is the whole of the danger.** Nothing THE FLEET does can reach the
hull; what costs the hull is *not finishing*. `fleetRoundBeats` runs from the
wave's first beat and a bar under the chart drains with it, red for its last
eighth. Running out breaks the hull by `damageFleet` in the middle column — the
same call THE GAUGE, THE MIRROR and THE MAZE make when a boss with no body has
to cost the ship something — and the scar is still there when the next wave
opens. A miss costs time and nothing else, which is the right currency: a wrong
square is a sentence the pair got wrong, and the price of it should be having
to say another one.

**A salvo has a rest on it**, `fleetSalvoRestBeats`, so a thumb held on the
button is slower than a pair who talk. That is THE GAUGE's call rule, and both
exist for the same reason: a round whose fastest strategy is hammering one
control is a round with nothing said in it.

**A square already fired at answers nothing at all** — a `reject`, no rest
spent and no mark changed. It is not a miss, it is a press that meant nothing,
and the ear should be able to tell the two apart.

**Nothing about it is random.** The placement is authored, the clock is the
wave's own beat, and a salvo is arithmetic over a list of integers. Like THE
MIRROR, The Warden and THE VANE it never draws from the rng: what one player
knows and the other does not is a fact about which screen is drawing, never
about a seed ([structure](structure.md) 7.3).

**The placement is authored in the real field's squares**, and it is the one
exception to "waves are authored for seven columns and remapped". `mapCol`
rounds, and a rounded run of squares is not a run — a five-long hull put
through it comes out with gaps in it, which is a ship the pair can shoot
straight through the middle of. So a fleet says exactly where it stands on the
chart it is played on, and `bossFromWave` hands it through untouched.

**It is the one boss the director actually edits rather than documents.** Every
other boss panel is a form with a number on it or a rendered table; this one is
a map, because where the ships are *is* the fight and none of that is legible
as five rows of `col`/`row`/`len`/`dir`. Two gestures and no modes: press a
hull to take it, press water to move it there, ROTATE turns it about its own
head. `fleetFault` says what is wrong with a placement — off the chart, two
hulls in one square, a length outside two to five, more than five ships — and
the panel says so under the map rather than letting something that is not a
fleet be saved quietly.

**Where it lives.** `FleetState` in the `BossState` union, with the chart's
arithmetic in `packages/sim/src/fleet-board.ts` and the choreography in
`packages/sim/src/fleet.ts`; its numbers are `packages/sim/src/config-fleet.ts`
and its panel is the `fleet` control set. The picture is three files —
`fleet-chart.ts`, `fleet-hulls.ts`, `fleet-marks.ts` — split along the line the
fight itself is split along: the lattice both seats read, the hulls only one of
them does, and the record they share. Its wave is `THE FLEET` and its sentence
is the epigraph.

What has **not** been looked at by a human is the shape of player 2's half of
the panel. Four arrows in a row is what the band's existing lobe layout gives
for free; a cross would read better under a thumb and would need a new panel
form to place it. That is a question about a hand on glass, and no test can
answer it.

## 11.7 PINBALL — the thing you fire from is the thing you catch it with

> The one where the bucket is both the gun and the glove.

A sixth boss, and the first body in this game under an **acceleration**. Every
other thing that has ever moved here steps: a creature falls a row on the beat,
the cannon slides a column a press, THE VANE's arm sweeps a fixed arc. A ball
on a table does none of that — it is a position and a velocity, integrated
every tick, and where it goes next is arithmetic nobody authored. That is the
whole reason to build it, and it is also the whole risk.

**One ball, out of the bucket and back into it.** The ship folds into a bucket
at the floor of a tall table. A shot is fired upward out of that bucket, falls
back down through a field of pegs and blocks, and the *same bucket* has to be
under it when it lands or the hull pays `damagePinballDrop`. Peggle has a
catcher and a separate cannon; here they are one object, and the doubling is
the design: **where you fire from is where you must not be a second later**.
The seat holding the bucket spends every shot undoing the position they took to
aim it.

**Two presses, alternating seats, in one order.** A needle walks across the arc
from the moment a shot resets and player 1 stops it with SET; the power bar
starts on that same press, and player 2 fires on it with FIRE. One seat owns
*where from* and *which way*, the other owns *when* and *how hard*, and neither
half is a shot.

**There were three, and the first one was cut.** Player 2 used to have to open
the sweep before player 1 was allowed to latch it, held by a
`PinballState.armed` flag. The order it bought was real and the press was not:
the needle was already walking when it arrived, so the only thing on either
screen that changed was the colour of a line — and the seat that pressed it then
pressed the same button again to fire. Removed on the owner's call. The
alternation survives, carried now by the two presses that each do the thing
their screen is showing.

**The arc is ±48°, and it was ±75°.** The wide one spent most of its sweep
pointing at a side wall a tile away, so its two ends were the same shot twice
and neither was worth a sentence. `pinballNeedleMilli` came down with it, from
190 to 122, so the sweep still takes the same six and a half seconds to cross:
what got smaller is the fan of answers, not the time to talk about them.

**The sweep takes six and a half seconds, and that number is the round.** THE
GAUGE's needle crosses in 2.8 s and is meant to be fought with a thumb. A
spoken exchange in this game runs 2.1–3.6 s ([latency](latency.md)) and the
lockstep adds a fixed 100 ms between thumb and needle (`inputDelayTicks`), so a
needle at Peggle's speed would be decided by reaction time and nothing else — a
reflex round, which is the thing the beat exists to prevent
([interludes](interludes.md)). At `pinballNeedleMilli` the call lands while the
needle is still short of where it was called, and "further… further… now" is a
sentence rather than a race.

**The pair are shown where the ball will actually go.** Not a hint and not a
drawing of one: the preview is `pinLaunchVelocity` stepped by `stepBall`
against the pieces really standing, cut at the first thing it touches, so there
is no second copy of the gravity or the bounce anywhere in `packages/render`.
During the sweep it is two arcs — the weakest and the strongest that angle can
throw, which is the fan it reaches — and on the bar it collapses to the one
live arc. What it never shows is the cascade after first contact, which is the
part the pair are there to argue about. Asked for by the owner, against the
line this file used to carry saying a trajectory would answer the round's own
question; the fan is the shape that answers *where*, and leaves *what happens
then* alone.

**Both seats see the same table, and it is the one round where that is true.**
That was the owner's decision, made against the recommendation, and it is
recorded here rather than smoothed over: the coupling is in the verbs alone.
`showsPinPieces` in `packages/render/src/pinball-round.ts` is written as a role
predicate anyway, so the seam is one line — if the aim turns out to be too easy
to agree on, the seat holding the bucket keeps the board and the seat opening
the sweep is talked onto it, which is THE FLEET's split exactly.

**Only the lit pieces have to go.** Peggle's orange rule. A board is a picture
of pegs and blocks, a handful of them marked, and the rest is scenery that
still bounces and still vanishes. Without it the round runs until the last peg
in a corner happens to be struck, which is a length nobody authored.

**A struck piece lights now and goes when the shot ends**, which is a physics
decision before it is a scoring one. A piece that vanished under the ball would
let it fly through the space it had just bounced off, so a cluster would
collapse instead of cascading — and the cascade is the reason to have pegs at
all.

### The ball is written, not imported, and here is what that cost

Every physics engine in reach integrates in floating point, and `packages/sim`
rounds what it computes into stored integers: a last-bit difference between V8
on Android and JavaScriptCore on iOS lands on either side of a `.5`, and two
phones then play different tables from the third bounce onwards. `Math.sqrt`,
`sin` and `cos` are already banned in `sim` for that reason
(`test/purity.test.ts`). So the ball is stepped in thousandths of a tile, every
division truncates the same way on both, `isqrt` replaces the square root a
contact normal needs, and the launch angle's sine comes off `mazeSinMilli` —
the table THE MAZE already carries, **called rather than copied**.

It came to about two hundred lines across `pinball-contact.ts` and
`pinball-physics.ts`, which is smaller than the smallest engine that would have
done instead, and it is the only version that could be lockstepped at all.

**One step a tick, and no substepping.** Cutting a tick into pieces in integers
either loses a remainder or carries one, and both are state. Instead the ball
is capped: `pinballSpeedCapMilli` is held below the ball's radius plus the
thinnest half-thickness a piece may have (`PIN_THIN_MILLI`), so one tick's
motion can never carry the centre past the far side of anything. `pinballFault`
enforces the piece half of that invariant on every authored board and
`test/pinball-physics.test.ts` enforces the config half — a tunnelled ball is
not a defect anybody would find by playing, it happens once, at speed, and
looks like a miss.

**One bounce a tick, and it is the deepest.** A ball wedged between two pegs
overlaps both, and reflecting off each in turn reverses the velocity twice and
leaves it buried and travelling as before. So the deepest overlap is the one
resolved and every overlap is reported, which is also the right answer for the
round.

### What it costs the pair, and where it lives

Nothing PINBALL does can reach the hull except the pair's own two failures. A
ball that misses the bucket takes `damagePinballDrop` off it **in the column it
fell past** — the table is the field's own width, so the scar is still on that
side when the field comes back, which is the one thing this round says in the
field's vocabulary. Running out of `beats` takes `damagePinball` in the middle
column, which is the call THE GAUGE, SNAKE, THE MAZE and THE FLEET all make. A
ball that came to rest on top of a block costs nothing at all: it times out
after `pinballFlightBeats` and is given back, because a stuck ball is not a
ball anybody dropped.

`PinballState` is in the `BossState` union. The table's arithmetic is
`packages/sim/src/pinball-board.ts`, the contact geometry
`pinball-contact.ts`, the integration `pinball-physics.ts`, the state
`pinball.ts`, the clock `pinball-round.ts` and the three verbs
`pinball-controls.ts`; its numbers are `config-pinball.ts` and its panel is the
`pinball` control set. The picture is two files — `pinball-table.ts` for the
case and everything standing in it, `pinball-round.ts` for the stage. Its
boards are `packages/content/src/pinball-rounds.ts`, **drawn as pictures**
rather than listed as coordinates, because forty rows of `{ kind, xMilli,
yMilli }` is a board nobody can see. Its wave is `PINBALL` and its sentence is
the epigraph.

**The frame is thick and that is deliberate.** This is the one boss where the
pair spend ninety seconds watching something bounce off the edges, so the table
is a machined case with a real bezel rather than a hairline border — a wall the
eye can see instead of one it has to infer from the ball's behaviour. The floor
is drawn broken, because it is the one edge that is not a wall.

What has **not** been looked at by a human is the feel: whether
`pinballBouncePermille` at 880 is a lively table or a dead one, whether six and
a half seconds of sweep is patient or tedious, and whether pegs or blocks are
the better board. All three are questions about an eye and a hand, and no test
can answer any of them.
