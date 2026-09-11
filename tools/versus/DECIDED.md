# What VERSUS has decided

Every slot that has been opened on this page and how it left it — taken into
the game, cut, rehoused, or taken and changed. It is the record of the owner's
own answers, and it is here rather than in `candidates/index.ts`'s doc comment
because that comment had grown into a changelog and pushed the file past its
250-line ceiling. Next door is what is **open**; this is what is settled.

Read it before opening a slot. Two of the entries below are questions that were
asked and then asked again in a better shape, and one is a look that was taken
and immediately changed — none of which is visible from the candidates that are
still standing.

## The slots that have left, and how

`ship:hull-skin` / `warm` left this list by being *answered*, which is the
only way anything is meant to. The answer was not "violet" or "amber" but
both: the amber hull is player two's ship and the violet one is player one's,
so the pair can tell whose screen they are looking at without reading a word
(`packages/render/src/seat-skin.ts`). A question with a shipped answer is not
a question, so the directory went with the entry.

`grip:ring-pause` left without a vote, because the question it asked had
already been answered somewhere else on the same frame. It asked how the
field should say that a body just carried a column cannot be carried again
for a beat, and its premise was that nothing said so. Something does: the
two white carry arrows beside the body are drawn only while
`carryIsReady` (`grip-arrows.ts`), so they go out for the length of the
pause and come back with it.

`creature:strand` left with its slot decided rather than closed, and `mute`
**won and shipped**: the reel rolls at six swaps a second in one violet,
which is what `strand-bead.ts` and `strand-reel.ts` now draw.

`panel:action-face` left by being *chosen*. The owner looked at SHIELD and
SUCK beside the two emblems and picked the pictures, so the membrane that
swells into the ward and dips into the throat is what
`packages/render/src/action-face.ts` draws on every action button now.

`crawler:pulse` left the same way, and by the answer a vote is *most* worth
having: the owner looked at the pair and could not tell which side was
stepped. The cheaper of the two candidates shipped — sixteen positions, and
a contour a renderer bakes once instead of nine times a frame
(`packages/content/src/crawler-shape.ts`).

## Seven at once, on 8 September 2026

The owner read the whole page and emptied most of it in one sitting, which
is the throughput this arrangement was built for. Six were **taken into the
game**, and each is now the only answer there is: `creature:magnet` / `coil`
(`packages/render/src/magnet-coil.ts`), `creature:skin` / `lit`
(`living-skin.ts`), `creature:slick` / `pinch` and `creature:bulb` / `six`
(`packages/content/src/silhouettes.ts`), and `creature:dart` / `torch`
(`dart-torch.ts`). The seventh, `cannon:shot` / `streak`, was **cut** — no
vote, no shipped half, the owner simply did not want the question open.

Two of that seven were not decided so much as **rehoused**, and they are the
first candidates to leave by moving rather than by winning or losing.
`creature:dart` / `wake` and the dart plume `torch` displaced are both on
the SHAPES tab's TAIL axis now (`tools/director/src/tails/`), where a mark
left behind a falling body sits beside the five others of its kind instead
of beside one creature; and `creature:throb` / `crown` is a draft in the
shape catalogue (`tools/shape-sheet/src/drafts/creatures.ts`), where a
contour is measured against the bodies it could be mistaken for. VERSUS
asks *which of these two*, and a look nobody is ready to choose between is
better kept where it can be browsed than kept as a question nobody answers.

## Ten answered in one sitting, on 9 September 2026

The owner read the page and emptied all but two of it, which is the largest
clearance this arrangement has had. Nine were **taken into the game** and are
now the only answer there is, and every one of them was written to the
direction he named on 8 September: **the graphics should look
three-dimensional while staying 2D, and a flying body should turn just enough
that what was behind it comes into view.** Each takes a body the game already
drew well and argues that what was missing was not more paint but a *placed*
surface — a mark at a longitude and a latitude, carried round by a turn,
under a light that does not move (`docs/style-guide.md`'s Depth section,
`packages/content/src/surface.ts`).

`crawler:skin` / `pearl` is `crawler-skin.ts`'s `drawSlime`: every ring a
ball with eight pores rolling backwards along the way the worm is going.
`creature:throb` / `globe` is `throb.ts`: the seam as a meridian on a ball
rather than a diameter on a coin. `creature:choir` / `orbs` is
`choir-skin.ts`: two turning bubbles drawn in added light only, which hides
less than the wash it replaced. `creature:wisp` / `ring` is
`wisp-tentacles.ts`: eight streamers round the hem, half of them behind the
bell. `creature:gyre` / `yolk` is `gyre-core.ts`: the organelle shaded in a
frame the turn has been taken out of. `creature:veil` / `anvil` is
`veil-mass.ts`: nine lit heaps inside the shipped outline. `warden:plates` /
`bevel` is `warden-plates.ts`: each plate a slab with a wall and a lit edge.

The two about the ship were taken **together**, and that is the point of
them: `ship:hull-shape` / `ridge` is fourteen shallow lobes on `HULL`
(`packages/content/src/ship-silhouettes.ts`) and `ship:light` / `barrel` is
the cosine that lights them (`packages/render/src/hull-barrel.ts`). The owner
had rejected the light and then said it might integrate with the shape; it
does, and a ripple with a straight ramp across it is a pattern rather than a
surface. Two candidates written for the same object turned out to be one
answer.

`creature:torch` / `kiln` was taken **and changed**, which is the one way out
of this list nothing had used before. The owner wanted its fire *much bigger,
more like a big fireball*, with the rock still a dark core inside it — so
KILN's eighteen rolling tongues are the skin of `torch-fire.ts` and the ball
around them is new: a heat halo, two shells turning against each other and
nine plumes on a mass of their own, all of it behind the stone.

## Two that stayed

`creature:meteor` / `forge` and `creature:skin` / `veil` are what is left of
that page, and they are open because he did not answer them rather than
because he answered them slowly. VEIL did not stay long: see the clearance
below, where it left by moving.

## And one slot opened by an answer, the same day

`panel:ship-join` is the first slot on this page the owner *asked for*, and
the first with three candidates in it rather than two. He wanted the control
panel to look like part of the hull — *ship must more follow visual of
control panel, or/and the way around* — and when the three ways of doing that
were put to him he chose all three, as cards, so he could see them beside
each other rather than be handed one.

`roof` makes the panel's ceiling the hull's own ripple, read off the same
radius function at the same x. `organs` grows every control out of the
membrane as a trunk with a shoulder, a waist and a flare, where the shipped
panel hangs a thread to it. `both` is the two at once, and it is a card of its
own rather than a summary because the open question about them is whether
they add up or fight in a strip the pair reads eleven columns of ammunition
against.

It needed a seam first, and the seam is `packages/render/src/band-join.ts`
— the ninth of `magnet-look.ts`'s kind and the first about two objects
rather than one. Two fields, because there are two halves of one question:
what shape the ship's underside is, and what stands between it and a button.
The shipped paint went through both with not one pixel moved.

## Two about damage, on 9 September 2026

`creature:break` / `shatter` and `ship:crater` / `spall` are the first
candidates on this page whose subject is what happens **to** something rather
than what it is made of, and they are the two halves of one engine:
`packages/render/src/shatter.ts` cuts a closed contour into pieces that tile
it exactly, and the two slots spend that the two ways there are. The break
throws the pieces and lets them land; the crater keeps them where they are
and pulls them into the hole. If a cut contour reads as damage both moving
and standing still, the engine is worth more than either look.

The break's seam is the only one on this page whose **shipped value is
nothing**. `BREAK_LOOK.wedges` is 0 and `Debris` therefore draws no pieces at
all, which is not an empty stub but the game's real answer: a body destroyed
has always thrown a dozen squares and stopped being drawn. So the left-hand
side of that pair is the field exactly as it is, and the question the slot
asks is whether a kill should leave anything behind — a question the owner
had already half-answered before either candidate was written, by saying that
if it does, it falls and lands rather than hanging in the lane.


## One about armour, on 9 September 2026

`shell:plate` / `slab` is `warden:plates` / `bevel`'s question asked again on
a smaller body. The boss's ring of armour was one arc stroked in grey at one
brightness the whole way round until the owner took BEVEL into the game; THE
SHELL's plating is the same picture on a body a tenth the size, and it is the
one hard surface left in the game with no highlight, no bevel and no
thickness at all — sitting directly over a body that has both.

What is different, and what makes it worth asking twice rather than copying
the answer across, is that a shell's plate is *shaped to a contour* instead
of swept round a rim. So the light cannot come from where a plate is on a
ring; it comes from which half of a body the plate is on, which means an
intact shell is two different greys rather than one shape with a seam down
it. That is the change the vote is really about.

It needed a seam first, `packages/render/src/shell-look.ts`, and it is the
first on this page with two fields that must move **together**: the grey edge
a chipped half keeps is the same material as the plate beside it, and a look
that moved one and not the other would put a body on the field wearing two
answers.


## And one on two bodies at once, the same day

`eye:iris` / `turn` is the first slot on this page whose subject is drawn on
**two** creatures. `lid.ts` and `warden-eye.ts` both call `drawEyeLens`, so
one record paints the roundest thing in the game on the small body whose
whole picture is an eye and on the biggest fixture the game ever draws. That
is why the slot is not named after either of them: a look that improved a lid
and spoiled a warden is a vote nobody can cast, and a slot called
`creature:lid` would have hidden the question. The pose is the lid, where the
difference is largest; `WARDEN · ARMOURED` is the second picture and belongs
open beside it.

The shipped eye is the roundest thing in the game with no depth on it at all:
the iris is concentric with the socket and every mark sits at a fixed screen
offset, so an eye *looking somewhere* would be an eye whose whole picture had
been slid sideways — which is why it never looks anywhere. TURN pins the iris
at a longitude and carries it round on a slow sweep, foreshortened by the
tangent plane's own map and losing the light as it goes, under a catchlight
drawn outside that transform where the light is. A mark that moves against a
mark that does not is the cheapest solid-looking thing there is, and this
spends it on two of the biggest bodies in the game at once.

The seam it needed is `packages/render/src/eye-look.ts`, and it took the
pupil with it: it used to be drawn by `eye-lens.ts` after the ring and the
spokes, which was fine while every mark was concentric and is not the moment
a look places the iris somewhere — the hole would have stayed behind. What
stayed next door is the lens itself, the aperture the lids open, because that
is the **readout** the seat without the cord reads a number off and no look
may touch it.


## And a surface coming apart on a plane, the same day

`ghost:tears` / `latitude` is the third of these and the one whose subject is
most plainly a surface: THE GHOST's whole picture is a body coming apart, and
it comes apart on a flat plane. `slabs` hands back seven horizontal bands
with a `shift`, and each is filled as a rectangle straight across the body,
so every mark on this creature is decided by how far down the picture it is.

LATITUDE makes a band's throw a **longitude**: a badly torn one goes past the
limb and comes back at the other side, the patch is foreshortened toward the
edge, and the pieces over the far side are drawn dim rather than clipped
away. It calls `slabs` rather than rewriting it, so how many bands there are
and how far the temper throws them are unchanged and the vote is about one
thing: what a `shift` means.

The trap it was written around is worth naming, because the next candidate on
a body with a temper will meet it. `ghostRage` already drives the throw, so a
turn read off the same number would be one input dressed as two cues — a pair
watching a single thing get worse while believing they were reading two. The
turn is its own slow clock and does not change with the temper.

`bun run breaks` is the bench both were tuned on: every tuning of the engine
on one sheet, seven moments across, which is the one thing a running preview
cannot show for an effect that is over in a second.

## `shell:plate` / `slab` — taken by hand, 2026-09-09

SLAB into `packages/render/src/shell-plate.ts`. The owner took the slab and
rejected WORN, with two changes made on the way in.

**Nothing on a plate glows.** The split and the crack still carry the body's
own colour — on an intact shell they are the only way the pair can tell red
from cyan — but they carry it as flat lines rather than through `strokeGlow`.

**The body's own light does not come through armour at all.**
`living-draw.ts` finishes every creature with a halo and a motion trail in its
colour, and neither knew a shell was plated, so a red plume stood in the air
above a piece of dead armour. `plateLightShift` in `shell-draw.ts` is the
answer: nothing at all while both plates are on, pushed onto the opened half
while one is, and back in the middle once the body is bare — which makes the
last plate coming off the moment the light gets out.

The look rejected beside it was `worn`; both directories went with the slot.

## The whole page read in one sitting, on 9 September 2026

The largest clearance this arrangement has had, and the first in which the
answer *move it* was used more than the answer *take it*. `shell:plate`
directly above was decided the same day by a different lane and is not one of
these seven. Seven slots left,
in four different ways, and the four are worth naming because they are the
whole vocabulary this page has.

**Taken, and both halves of the pair.** `maze:walls` was two candidates
written as deliberate opposites — WELL darkens the space between the sheet's
lines and leaves every stroke alone, RAIL leaves the space alone and gives the
radial walls a thickness — and each said in its own card that the two could
not both be right about where a pair's eye should go on a turning drum. The
owner took both. A floor with nothing standing on it is a stack of discs and a
post with no floor under it is a mark floating on the field; together they are
a room (`packages/render/src/maze-relief.ts`). `eye:iris` went the same way for
the same reason: GLAZE was a ball made of light with the pupil held dead
centre, TURN was an iris travelling on a surface with no wash under it, and
each card argued the other's weakness honestly. They are the two halves of a
surface rather than two answers to one question (`eye-ball.ts`).

**Taken, one of a set.** `creature:break` / `shatter` — a killed body now comes
apart into eighteen pieces of its own outline, where `BREAK_LOOK.wedges` was 0
and the shipped answer was a dozen squares and nothing else. `creature:bulb` /
`spores` and `creature:slick` / `bloom` — the two bodies on more waves than
anything else in the game had three dots between them, and now have eleven
spheres packed three shells deep and a nucleus with nine veins running out of
it (`body-spores.ts`, `body-bloom.ts`).

**Settled without a vote, because nobody could see the difference.**
`ghost:tears` — he looked at LATITUDE and SLIDE and said he could not tell them
apart, which is a real answer and not a failure to give one. The slot was
decided on the two things that separate the pair where an eye could not:
LATITUDE keeps the hard edge a torn signal is made of, and it costs exactly
what the shipped look cost, where SLIDE built seven gradients a frame
(`ghost-latitude.ts`).

**Moved rather than decided, which is the answer this page learned to give.**
Three slots left this way in one sitting, against one in the whole history
before it. `bulb:shape`'s five outlines are entries in
`tools/shape-sheet/src/drafts/offered.ts` — *keep the current bulb, but move
the alternatives somewhere available on the shapes page* — and they are worth
reading together because between them they cover the whole axis a round body
has. `creature:skin` / `veil` is a value on the SHAPES tab's SKIN axis, where a
claim about the wall of *every* body belongs rather than beside one creature.
And the eight interiors that were not taken are a **new axis of their own**:
he asked for it in those words — *maybe new category like filling* — and
`tools/director/src/fillings/` is it, with the two that shipped standing on the
row as controls.

The lesson the page should keep from this is the one the moves teach. VERSUS
asks *which of these two, this week*. A look nobody is ready to choose between,
and a look whose claim is really about every body rather than one, are both
better filed where they can be browsed — and the answer *move it* costs the
owner one sentence where a vote costs him a decision he does not want to make.

## And a general note about the page itself, the same day

He said the animation was often too short, and then said what he meant: the
loop before a repeat has to keep longer, so a falling body is seen travelling
further before it starts again — **not slowed down to fill the window it has**.
`EVENT_CADENCE_SECONDS` went from two to six and no rate, life or duration in
any look on the page moved. `TORCH · THE FALL` was worse than the constant: it
replayed on exactly the length of its own fall, and a torch crosses the whole
field in three quarters of a second, so the rock left the top, hit the hull and
was immediately back at the top with no gap anywhere in it. It sends three a
beat apart now, and waits a fall's worth of empty field after the last lands.

## `ship:crater` / `spall`, taken and repaired, on 9 September 2026

The owner watched four rocks go through the hull on `BREACH · ROCKS COMING
THROUGH` and said to build it into the game. It is `crater-spall.ts` and
`crater-pit.ts` now: the membrane around a hole is cut into eleven plates whose
inner edges are the hole's own rim, each pulled a little toward the pit and
turned a degree or two out of true, so a hole in the skin is seen to have taken
the skin with it.

Two things were wrong with it and neither was a matter of taste, which is why
they were repaired on the way in rather than offered as a second question.

**It drew material above the ship.** The plates were clipped to a flat
rectangle at the skin line over the hole's own middle, and the membrane is a
curve — so wherever the surface fell away to one side, plates stood in the sky
beside the ship. Every crater is clipped to the hull's own filled contour now
(`hull.ts`), which puts the rule where it belongs: a look may paint as far up
as it likes and the ship decides where it stops. Nothing a later crater
candidate does can bring the defect back.

**It was violet on both seats.** Player two's ship is amber and THE MIRROR's is
blood, and the paint was written against `PALETTE.hull`. The hole's colours are
read off the `HullSkin` the hull was drawn with now, so each of the three ships
wears holes of its own. The one thing left alone is the hot hairline along the
cut: that is the *rock's* heat and not the ship's, and it is the same on every
screen for the reason ammunition is.

The slot stays open, because the owner asked in the same breath whether the
hole could be more detailed — smaller stone pieces still crumbling off the top
of it. What is above is the shipped side of that question now.

## `panel:ship-join` — nothing taken, 2026-09-10

Closed with nothing adopted, on the owner's word on 10 September 2026: a ship
that is fluent from crest to buttons has to own its join, so the slot's
findings — a grown thing starts above the membrane and the clip welds it, the
chamber lit by the hull's own light and grain, a roof that sags over the
controls — moved to tools/versus/join.ts as the baseline every ship:body card
patches. The four attachment ideas (welded trunks, a vascular tree, a draped
caul, bladders) stay in history at 386988aa as material for the ships.

The other answers offered were `both`, `caul`, `fused`, `organs`, `roof`,
`sac` and `vessel`; they went with the slot.

## `slick:motion` — nothing taken, 2026-09-10

taken by hand — BANK applied to the game: the owner answered in chat on 9
September 2026 that the slick floats in all directions but some more according
to flying position, which BANK reads as attitude off the drift's own velocity.
Taken by hand because the candidate patches a function (poseAt) and adopt
refuses one: BANK is packages/content/src/motion-bank.ts and
livingMotion("slick") hands it back, SWALLOW moved to motions-retired.ts and
onto the SHAPES tab's motion axis. GLIDE and FLOAT were neither adopted nor
thrown away: they are kept as pictures on the slick's own outline, in
tools/shape-sheet/src/motions/offered.ts and OFFERED_DRAFTS.

The other answers offered were `bank`, `float` and `glide`; they went with the
slot.

## `slick:shape` — nothing taken, 2026-09-10

The owner read the five on 9 September 2026 and took none: the shipped
two-sacs-at-a-waist slick stands. RAY (one flat sheet with seven shallow
scallops — at 26 px close to a bar), FRILL (nine shallow lobes along a long
body — the wobble eats a fringe that size) and CHAIN (four sacs along the axis
— four waists is three places a body can look severed) are rejected and go
with the slot. COMMA and REVERB are kept as pictures: on the SHAPES tab as
OFFERED_DRAFTS (tools/shape-sheet/src/drafts/offered.ts), on the slick's own
motion, each with its how-it-can-lose.

The other answers offered were `chain`, `comma`, `frill`, `ray` and `reverb`;
they went with the slot.

## `bulb:hit` / `pop` — taken, 2026-09-10

The owner chose it in chat on 10 September 2026 — a bulb is a bubble and a
bubble pops: the film tears open at the bottom where the bolt met it and runs
round both ways with a bright bead at each end, swelling outward as it goes, a
puff of cyan mist rising out of it, four flecks of film falling to the ship and
lying there wet.

Written into `packages/render/src/body-hit.ts`, `BULB_HIT`: `life` and
`strike`, which is `pop`, moved from
`tools/versus/candidates/bulb-hit/pop/paint.ts` to
`packages/render/src/body-hit-pop.ts`.

The other answers offered were `scatter` and `shock`, and neither was lost:
he liked every hit look on the page and asked for all of them in the game, so
`scatter` is THE WISP's strike (`WISP_HIT`, `body-hit-scatter.ts` — a light
that rises and blinks out, and nothing of a wisp ever falls) and `shock` is
THE THROB's (`THROB_HIT`, `body-hit-shock.ts` — half of it is plating, so a
shot on it is a blow). The distribution was the session's, not his.

## `slick:hit` — nothing taken, 2026-09-10

The owner kept the shipped kill for the slick — squares and wedges, no strike
— in chat on 10 September 2026, and took the three candidates for other
bodies rather than dropping them: `afterglow` is THE DART's strike
(`DART_HIT`, `packages/render/src/body-hit-afterglow.ts` — a body that moves
in leaps leaves an afterimage), `rupture` is THE RIND's last layer's
(`RIND_HIT`, `body-hit-rupture.ts` — a rind is skin, and it peels back in
petals) and `splash` is THE ECHO's (`ECHO_HIT`, `body-hit-splash.ts` — one
small body into a dozen drops). The rind and the echo die wearing a slick's
or a bulb's contour, so `destroy` gained an `of` field naming what they were
(`packages/sim/src/events.ts`) and `hitFor` asks it first. The distribution
was the session's; the bodies are named in `body-hit.ts` with the reason each
one reads on its body.

The answers offered were `afterglow`, `rupture` and `splash`; they went with
the slot.

## `creature:carom` / `capsule` — taken by hand, 2026-09-10

The owner picked FACET from the four on the slot on 10 September 2026 and
asked for it taken further — *more like a space rescue capsule*: the cut
outline kept, the nose along its heading, seams and rivets, a band of hazard
chevrons, a beacon on the beat and a scorched shield on the side it travels
toward. GRIT, KEEL and PITS went with that answer. FACET's faces became
`packages/render/src/carom-facet.ts` and the four markings
`carom-marks.ts`, three capsules were offered on them, and he took CAPSULE in
chat: the restrained one — the stripe on the outer ring of the four rear
faces, dark, white, white, dark; a rivet at every ridge vertex; the nose and
half of each shoulder scorched with an ember lip; a small beacon on the tail
flashing the body's colour on the beat.

Taken by hand because `adopt` refuses a slot whose `travel` is the shipped
`wedge` rather than a sibling file: the paint is
`packages/render/src/carom-capsule.ts`, `CAROM_LOOK.shell` points at it, and
the rolling stone it replaced is deleted from `carom-look.ts`. `CrustDraw`
gained `beat` for the beacon.

The other answers offered were `lifeboat` (every rear face a band from
silhouette to glass, a beacon that throws a flash) and `pod` (plain riveted
plate, the stripe as a hatch ring on the bevel, the beacon on a mast); they
went with the slot.

## `creature:coil` / `prongs` — taken, 2026-09-10

the dome says about to fail from both ends — the prongs flare and crackle
round the rim while the charge is on its way, and the bolt sprays; the owner
picked it on the page and saw no difference in SOCKETS

the studs as three two-faced prongs off the rim with a bead on each tip, lit
on their key side — flaring and crackling from prong to prong round the rim
while a charge is on its way — and the bolt with a spray of three short sparks
fanning off its head

`COIL_LOOK.studs` is `prongs`, moved from
`tools/versus/candidates/creature-coil/prongs/paint.ts` to
`packages/render/src/coil-prongs.ts`.

`COIL_LOOK.charge` is `spray`, moved from
`tools/versus/candidates/creature-coil/prongs/paint.ts` to
`packages/render/src/coil-prongs.ts`.

The other answers offered were `leap` and `sockets`. SOCKETS went with the
slot — he could see no difference in it. LEAP he wanted kept, in a new
category if it needed one; it is on the SHAPES tab's HIT axis as LEAP
(`tools/director/src/hits/leap.ts`), in the *before* phase beside TELEGRAPH,
because a charge arriving at a body is the window before an impact and that
axis already has the trigger. The discs and two bolts it replaced were
deleted from `coil-look.ts` with it.

## `creature:crawler` / `gut` — taken, 2026-09-10

a bag with something alive in it — the owner picked it on the page; SETAE and
WRINKLE go to the SHAPES page's SKIN axis rather than being lost

a dark organ seen through translucent skin, pushed to the tail by the squeeze
and swinging back a beat behind, under a rim of light where the skin is
thinnest — a bag with something alive in it

`CRAWLER_LOOK.slime` is `gut`, moved from
`tools/versus/candidates/creature-crawler/gut/paint.ts` to
`packages/render/src/crawler-gut.ts`.

The other answers offered were `setae` and `wrinkle`, and he suggested the
ones not chosen go to the SHAPES page: they are on the SKIN axis as SETAE and
WRINKLE (`tools/director/src/skins/`), placed on the turning ball with the
mounted four, since a surface tried on one worm is a surface that can be
tried on any body. The placed pores they and GUT replaced were deleted from
`crawler-skin.ts`, which now holds only the face.

## `creature:echo` / `buds` — taken, 2026-09-10

two lit cores drawn apart under one skin, so the parting is seen coming from
inside — the owner picked it on the page and dropped CLEFT and WAIST

two lit cores under one skin — one on top of the other at first and drawn
apart along the axis as the parting comes, with the shipped furrow deepening
between them

`ECHO_LOOK.seam` is `buds`, moved from
`tools/versus/candidates/creature-echo/buds/paint.ts` to
`packages/render/src/echo-buds.ts`.

The other answers offered were `cleft` and `waist`; they went with the slot,
and so did the bare furrow BUDS replaced — BUDS still cuts it between its
cores, from its own copy of the three numbers.

## `creature:chute` / `vane` — taken, 2026-09-10

the one answer that turns the canopy rather than reshaping it — the owner
picked it on the page over BELL, GORES and RIBS

the shipped dome turning slowly about its own axis as it comes down, with a
twist from the sway — eight pores placed on it by longitude and latitude
arrive thin at one limb, cross the front lit and full, and thin away at the
other — over a shell lit from the key; the shipped shrouds, and the shipped
plume on the climb

`CHUTE_LOOK.canopy` is `vane`, moved from
`tools/versus/candidates/creature-chute/vane/paint.ts` to
`packages/render/src/chute-vane.ts`.

The other answers offered were `bell`, `gores` and `ribs`; they went with the
slot. VANE's plume was the shipped `column`, so the candidate's patch was cut
to `canopy` alone before `adopt` would take it; the membrane dome it replaced
was deleted from `chute-look.ts`.

## `creature:dart` / `shock` — taken by hand, 2026-09-10

The owner picked SHOCK in chat on 10 September 2026 — three bright knots
strung down the flame, each breathing on its own clock, an exhaust with
something happening inside it — and asked for the others *and the current*
to go to the SHAPES page.

Taken by hand because its `jet` was written inline in the candidate's
`index.ts`, which `adopt` refuses: the knots are
`packages/render/src/dart-shock.ts`, `DART_LOOK.jet` points at `shockJet`,
and `dart-torch.ts` exports `BODY` and `jetReach` so the knots ride the same
length as the flame they are strung down rather than a second copy of it.

The other answers offered were `braid` and `wake`, and neither was lost: with
the flame they were judged against, they are on the SHAPES tab's TAIL axis
(`tools/director/src/tails/`) as BRAID, CINDERS — WAKE was already the name
of an earlier dart candidate there, the rungs — and FLAME, which carries
`shipped` because `torchJet` still burns under SHOCK's knots.

## `creature:ghost` / `swarm` — taken, 2026-09-11

The owner took SWARM on 10 September 2026: the nebula is a crowd of motes
streaming round the inside of the dome, alive where a gradient is still.
HOLLOW and LANTERN go to the SHAPES page as fillings, at his asking.

the nebula is a crowd — fourteen motes of the body's own light streaming round
a ball inside the dome, lit toward the key, drifting on their own meridians,
each going round the back and coming out the other side

`GHOST_LOOK.interior` is `swarm`, moved from
`tools/versus/candidates/creature-ghost/swarm/paint.ts` to
`packages/render/src/ghost-swarm.ts`.

The other answers offered were `hollow` and `lantern`. Both are interiors —
what a body has *in* it — so both went to the SHAPES page's FILLING axis
(`tools/director/src/fillings/hollow.ts`, `lantern.ts`), re-authored in SVG
with the same projection: the glass bell lit on its far inner wall, and the
solid ball lit toward the key, the heart of each going round on the ghost's
own turn. They sit last on the row, together, because the pair is one
question — bright away from the light or bright toward it.

The eyes went with it, at the owner's asking — *make the eyes of ghost more
visible and clear for player to see* — a fix to something wrong, landed
straight on the field: the socket a little wider, the pupil most of it, the
core half the pupil, and the flicker shallow enough that the lamp never dims
past four fifths (`packages/render/src/ghost-eyes.ts`).

## `creature:gyre` / `orbit` — taken, 2026-09-11

The owner liked every gyre answer and the current one, and took ORBIT into the
game on 10 September 2026: one band of light girdling the ball at a tilt, the
far half seen through the mass and the near half over the nucleus, swapping
once a turn. The granules it replaces, HELIX and VORTEX all go to the SHAPES
page as fillings, at his asking — interiors to build new creatures from.

one band of light girdles the ball at a tilt — the far half seen dimly through
the mass, the near half drawn over the nucleus, swapping once a turn

`GYRE_LOOK.core` is `orbit`, moved from
`tools/versus/candidates/creature-gyre/orbit/paint.ts` to
`packages/render/src/gyre-orbit.ts`.

The other answers offered were `helix` and `vortex`, and the owner wanted
them kept, together with the granules ORBIT replaced — *to create new
upcoming enemies with this inside effect*. An inside effect is the FILLING
axis, so all four are there (`tools/director/src/fillings/orbit.ts`, `yolk.ts`,
`helix.ts`, `vortex.ts`), ORBIT carrying `shipped` as the control and YOLK
being the organelle the game drew from 9 to 11 September. The nine granules
and their constants are gone from `gyre-core.ts`, which keeps the membrane,
the lit mass and the specular every answer shares.

## `torch:veil` — nothing taken, 2026-09-11

the owner keeps the torch as shipped — the veil stays as it is, no alternative
wanted

The other answers offered were `bloom` and `fifth`; they went with the slot.

## `creature:torch` — nothing taken, 2026-09-11

the owner keeps the torch as shipped — no alternative body wanted

The other answers offered were `crown`, `hollow` and `kiln`; they went with
the slot.

## `ship:body` — three cards replaced, slot still open, 2026-09-11

the owner judged the six ships and named what he wanted from three of them
rather than one of them: EMBEDDED's arrangement without its sand-like light
and gradient, MEDUSA's slime going down but not its thin lines converging in
the middle of the bell — *start them from the very top of the hull* — and
PLASM's big bottom bubbles and the strings running up from the buttons, with
every button grown together with the body like a heart or an organ, veins
and a little plasma coming out

`embedded`, `medusa` and `plasm` went, and `gland`, `heart` and `lymph` stand
in their place beside `chitin`, `gullet` and `reef`; the three new cards share
`tools/versus/wet.ts`, `organ.ts` and `fluid.ts`, which hold his brief.

## `ship:crater` — nothing taken, 2026-09-11

the owner keeps the crater as shipped — no alternative wanted

The other answers offered were `grit` and `shards`; they went with the slot.

## `rind:body` / `burr` — taken, 2026-09-11

the owner picked BURR — a rind is a body with something on it, and the knobs
go with the layers

the rind wears a rim of fat knobs — seven standing well off the body with both
layers on, four shorter with one, none when bare — the shapes page's studded
form asked for a different rim per layer, so the knobs are seen to go with the
skin

`RIND_LOOK.body` is `burr`, moved from
`tools/versus/candidates/rind-body/burr/paint.ts` to
`packages/render/src/rind-burr.ts`.

The other answers offered were `facet` and `toothed`; they went with the slot.

## `field:backdrop` — nothing taken, 2026-09-11

the owner keeps the shipped back — the sea stays; one soft nebula light joins
it in the corner, asked for by name, and BARE and LANES go

The other answers offered were `bare`, `lanes` and `nebula`; they went with
the slot.

## `creature:wisp` — nothing taken, 2026-09-11

taken by hand — ARMS into the game (render/wisp-arms.ts); the threads it
replaced, COMB and SKIRT kept on the SHAPES page's LIBRARY, drawn on the
game's own wisp, because the owner wants more bodies like a jellyfish with
arms floating under it

The other answers offered were `arms`, `comb` and `skirt`; they went with the
slot.

## `creature:warden` — nothing taken, 2026-09-11

taken by hand — the shipped surface stays; MANTLE, ROLL and WHORL kept on the
SHAPES page's LIBRARY

The other answers offered were `mantle`, `roll` and `whorl`; they went with
the slot.

## `creature:volley` — nothing taken, 2026-09-11

taken by hand — EMBER into the game; PITTED kept on the SHAPES page's LIBRARY
(the owner: maybe for the meteors); GROOVE goes

The other answers offered were `ember`, `groove` and `pitted`; they went with
the slot.

## `creature:veil` — nothing taken, 2026-09-11

taken by hand — ANVIL stays, thinned over the body on the screen that sees in;
FOAM, STRATA and VORTEX kept on the SHAPES page's LIBRARY

The other answers offered were `foam`, `strata` and `vortex`; they went with
the slot.

## `creature:veer` — nothing taken, 2026-09-11

decided — the shipped rider stays; the collar it grips the rock with no longer
sinks on the brace (the owner: the hands stay on top, holding the meteor).
HUNCHED, JESTER and SOLID go

The other answers offered were `hunched`, `jester` and `solid`; they went with
the slot.

## `creature:lid` / `iris` — taken, 2026-09-11

The owner: apply from 'versus' the 'CREATURE:LID · IRIS' to the game. BEVEL is
kept on the GRAPHICS page's LIBRARY for upcoming creatures; ROLL goes.

six overlapping armour leaves closing to a point at the middle of the eye and
turning outward as the cord is pulled — a diaphragm opening on the rule's own
gap, each leaf lit by where it sits under the key light, with a dark cut where
it rides over the next

`LID_LOOK.plates` is `iris`, moved from
`tools/versus/candidates/creature-lid/iris/paint.ts` to
`packages/render/src/lid-iris.ts`.

The other answers offered were `bevel` and `roll`; they went with the slot.

## `creature:magnet` / `ore` — taken, 2026-09-11

The owner: apply to game 'CREATURE:MAGNET · ORE' and remove other related
'CREATURE:MAGNET' alternatives. ROD and YAW go.

the horseshoe as dug-up stone — pitted, the plate split into strata, and the
colour a vein running into each arm with a bead of light flowing down it to
the tip

`MAGNET_LOOK.body` is `ore`, moved from
`tools/versus/candidates/creature-magnet/ore/paint.ts` to
`packages/render/src/magnet-ore.ts`.

The other answers offered were `rod` and `yaw`; they went with the slot.

## `creature:mount` — nothing taken, 2026-09-11

taken by hand — the owner: apply to game 'CREATURE:MOUNT · TAPROOT'; move to
'shapes' page 'CREATURE:MOUNT · RASP'. TAPROOT is MOUNT_LOOK.shape
(packages/render/src/mount-taproot.ts, its rim rootedContour in
packages/content); RASP is drawn on the GRAPHICS page's LIBRARY
(mount-rasp.ts); PENDANT goes. Both reached tools/shape-sheet, which a package
cannot import, so adopt could not move them.

The other answers offered were `pendant`, `rasp` and `taproot`; they went with
the slot.

## `creature:queen` / `scutes` — taken, 2026-09-11

The owner: apply from 'versus' to game 'CREATURE:QUEEN · SCUTES'. CARAPACE (a
roller enemy or obstacle) and FACET (a metal enemy or obstacle) are kept on
the GRAPHICS page's LIBRARY.

the shell as seven plates lapped from the wings in — each cut from her own
contour and filled as a ridge under the key, the lapping edges throwing
shadows and wearing bevels, breathing apart and back with a tilt running wing
to wing

`QUEEN_LOOK.shell` is `scutes`, moved from
`tools/versus/candidates/creature-queen/scutes/paint.ts` to
`packages/render/src/queen-scutes.ts`.

The other answers offered were `carapace` and `facet`; they went with the
slot.

## `creature:recoil` / `globe` — taken, 2026-09-11

The owner: apply to game 'CREATURE:RECOIL · GLOBE'. MOONS, FOAM and CALYX are
kept on the GRAPHICS page's LIBRARY for an upcoming enemy; SPRUNG and TUBE go.

the cage as a wire ball — each rib a whole meridian through the poles with its
near half lit over the body and its far half dim behind, the hoop a tilted
equator, the ball turning slowly so every rib swings from a line at the limb
to a curve at the front and back

`RECOIL_LOOK.cage` is `globe`, moved from
`tools/versus/candidates/creature-recoil/globe/paint.ts` to
`packages/render/src/recoil-globe.ts`.

The other answers offered were `calyx`, `foam`, `moons`, `sprung` and `tube`;
they went with the slot.
