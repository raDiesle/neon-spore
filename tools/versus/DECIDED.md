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
