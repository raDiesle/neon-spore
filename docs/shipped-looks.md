# What the game actually draws

Every glow and every tail `packages/render` puts on screen today, creature by
creature, with the numbers.

It exists because the SHAPES page had grown three axes of *proposals* — GLOW,
HIT and TAIL — and nobody could say what the shipped answer was without reading
the renderer. That is the exact shape of the mistake CLAUDE.md's *a look is
offered, never replaced* guards against: an alternative judged against a memory
of the current look wins every time, because the memory is always vaguer than
the picture beside it.

Two of the values on the TAIL axis are transcribed from this file's contents
and are marked **IN THE GAME** on the page, for the same reason.

**This is a description, not a specification.** If it disagrees with
`packages/render`, the renderer is right and this file is stale — say so in the
commit that fixes it.

## The one rule underneath all of it

**Glow is state, not decoration.** It is the same finding
`docs/tower-defence.md` reads off Neon Pulsefire, and this project arrived at
it independently: a creature shot in the wrong colour drops its glow, its
trail and its halo, and is drawn as a **grey outline only**
(`living-draw.ts`, the `blocked > 0` branch in `drawLiving`). Nothing else
about the drawing changes — same contour, same size, same position. The light going out *is* the
message that the shot was spent.

Anything added to the field has to keep that true. A glow that stayed on
through a blocked hit would take away the one signal the pair reads without
looking at a number.

## Slick and bulb

`packages/render/src/living-draw.ts`, `drawLiving`. In draw order:

| Pass | What | Numbers |
|---|---|---|
| **skin** | `LIVING_SKIN.paint` (`living-skin.ts`) — flesh, a bevel inside the contour, the key light over both, a sheen | fill is `mixHex(dark, hex, 0.42)`; bevel is `rim` at alpha `0.32`, width `0.15` of the contour's reach, stroked **before** the light; `litRound` at the shipped `KEY` with the transform's rotation undone; sheen is `haloSprite(hex, 0.8·reach)` at alpha `0.2`, `lighter`, `0.34·reach` above centre |
| **glow** | `strokeGlow` — the same path stroked repeatedly, widest and faintest first, additively | 3 passes (`STROKE.glowPasses`), spread 5 (`STROKE.glowSpread`), alpha `0.1 / i`, composite `lighter`, then the crisp outline at `max(1, r * 0.1)` |
| detail | `drawDetails` — see below | inner drawing thinner than the outline |
| **tail** | `drawMotionTrail` — three halo sprites strung *upward*, widening and fading | at `(0.55 + 0.3k)r` wide by `(0.5 + 0.22k)r` tall for k = 1, 2, 3, `0.6k/3` tiles apart, alpha `(1 - k/4) * 0.22`, `lighter`, slid sideways by `sin(t*0.9 - 0.6k) * 0.3kr` |
| **glow** | one halo around the whole body | `1.9r`, alpha `0.16` |

`strokeGlow` exists to avoid `ctx.shadowBlur`, which `glow.ts` names as the
single biggest frame-rate cost on mobile GPUs — it forces a full-surface blur
per draw. Everything here is either repeated strokes or one cached radial
sprite (`haloSprite`), and the cache is keyed on colour and radius, so both
have to come from a small fixed set or it grows a canvas per frame.

**The difference between a slick and a bulb is `drawDetails` and nothing
else.** A slick gets two dots at `(±0.12rx, 0.2ry)`, radius `0.07ry`. A bulb
gets one core dot at `(0, 0.3ry)`, radius `0.09ry`, and nothing else. Same
glow, same halo, same trail.

**Two of these changed on 8 September 2026**, and both came off a page that
had been arguing about them. The skin was a flat fill of the body's own deep —
`#190F2C` against a `#07060F` field, so a creature was materially a hole in
space with a neon line round it — and `creature:skin` / `lit` won that slot on
VERSUS. The tail was two halos strung a quarter tile apart, which is less than
one body-height of trail and is made of the same sprite the body already
wears, so it said *this thing glows* a second time rather than *this thing is
moving*; SMOKE on the SHAPES tab's TAIL axis is the plume that replaced it, and
HALOES is still on that axis as a proposal, which is where a look that is taken
out is kept.

The one thing neither change spends is a gradient. Both want a soft radial
falloff and both take it from `haloSprite`'s cache, because this code runs once
per body per frame and THE ECHO puts nineteen bodies on one field.

## Throb

`packages/render/src/living-draw.ts` and `packages/render/src/throb.ts`. Every
pass of *Slick and bulb* above, plus two things nothing else on the field has.

| Pass | What | Numbers |
|---|---|---|
| **turn** | the whole body is rotated before it is drawn | `throbTurnMilli(cfg, beats) / 1000 · 2π`, clockwise, one turn every `throbSpinBeats` — the same expression `throbStruck` resolves a shot against |
| contour | six clubs on a small core, walked rather than sampled by angle | `THROB.clubs` — 6 clubs, reach `0.26`, cap `0.36`, neck `0.46`, vary `0.16`, over a 3-lobe core at depth `0.06`, the whole thing at `0.7×` so the widest club lands inside a bulb's footprint |
| **far half** | the half above the seam filled, rimmed and detailed in the *other* ammunition colour, over the interior rather than under it | that colour's `colorTrio` — `dark` filled, `hex` through `strokeGlow` on the contour, `rim` on `drawDetails` mirrored across the seam; the seam itself in the two rims mixed half and half, at `1.4×` the outline weight |

The far half used to be green plating, and green means one thing in this game
— a body up the field a shot does nothing to — which is exactly what that half
stopped being when both sides went live. It is drawn as an ordinary body now,
in the colour that kills it, because half a body in red or cyan says *load this
trigger* and this creature is asking that question twice a turn.

The clubs are the turn. A round contour cannot show that it is rotating, and
the whole creature is which half is pointing at the cannon — see
`packages/content/src/silhouettes.ts` on why the core is nearly smooth under
them.

## Torch

`packages/render/src/torch.ts`. The only creature with a real tail.

| Pass | What | Numbers |
|---|---|---|
| **tail** | `drawTorchTail` — a tapering gradient wedge | from the **top of the field** down to the rock; `rgba(255,122,47,·)` at 0 → 0.1 (at 75%) → 0.3 (at the body); half-width `0.12r` at the far end, `0.9r` at the body |
| body | ember ring, then the crystal contour and stone-grey fill | shared with every rock kind via `drawTorchRock` |
| pits | dark discs with a pale lip | `0.16r`, lip `rgba(199,203,214,.5)` |
| **glow** | two halos, two colours | `1.6r` in `PALETTE.rock` at `0.1`, then `2r` in `PALETTE.ember` at `0.08` |

Three things in there are decisions rather than settings.

**The tail runs the whole height of the field**, not a body-length or two. That
is why a torch reads as having *come from somewhere* rather than as having
appeared, and it is the strongest thing in this file.

**It is wider at the body than behind it.** A wedge that swells toward the
object reads as something being dragged; one that swells away reads as
something being sprayed. The game chose the first, and it is worth knowing that
was a choice rather than the only option.

**It only draws once the rock has travelled** — `c.row !== c.fromRow`. The beat
a torch breaks off the queen it stands still in the socket it grew in, and a
streak running off the top of the field behind it would read as a fall that has
not started.

## Meteor

`packages/render/src/meteor.ts`. **No tail at all.**

| Pass | What | Numbers |
|---|---|---|
| body | stone-grey fill, then `litRound` clipped to the contour, then the outline | base `#8A8F9C`, `STROKE.outline` |
| pits | dark discs with a lit lip, placed on a fixed spiral | `0.16r`, gradients from the key light |
| **glow** | one halo | `1.6r` in `PALETTE.rock` at `0.1` |

Worth stating plainly because it is the gap the owner named: **the thing this
project calls a meteor does not have a meteor tail.** It has a lit, pitted rock
and a faint grey halo. The rock's light comes from the key light and `turn` is
handed back to it, so the bright side stays put while the stone rolls under it
— a highlight glued to a spinning rock is the defect that fix exists for.

## The veer's rider

`packages/render/src/veer-clown.ts`, from figures in
`packages/content/src/veer-clown-shape.ts`. Every rock above is drawn by
`drawMeteor`; THE VEER is that rock with a figure laid over the top of it,
outside the frame the stone spins in. The numbers below moved into content on
6 September 2026, when the director's palette began drawing the same rider as
a contour: one description, two things drawing it.

| Pass | What | Numbers |
|---|---|---|
| ruff | five discs along the rock's shoulder | `0.36` head radii, `PALETTE.rock` on `rockDark` |
| head | one disc | `0.46r`, `PALETTE.rock` on `rockDark` |
| hat | a cone with a pompom on the tip, leaning into the pull | `2.1` head radii tall, `rockDark` filled, `STROKE.outline` |
| face | two eyes and a grin, in the background's own dark | `0.15` and `0.64` head radii |
| **nose** | one disc and a halo under it | `0.24` head radii in `PALETTE.clownNose`, halo `0.6` at `0.35` |
| brace | the whole figure sinks and the hat whips over, for the beat it steps | `0.3r` down, `0.5` rad, plus a `0.28` halo |

Two things here are decisions rather than drawing. The figure **does not turn
with the stone**, for the reason stated above about highlights: a face that
rolled with the rock would be a face carved into it. And the nose is the one
coloured thing on any rock in the game — the whole clown was built grey on the
argument that a red nose reads as *shoot me*, and the owner spent a hue on it
anyway, which is why `PALETTE.clownNose` is a fuchsia and not a red.

## The crawler

`packages/render/src/crawler.ts`, `crawler-skin.ts`, `crawler-fx.ts`; the
contour is `packages/content/src/crawler-shape.ts`, the fifth family of shapes
in that package and the only one that is not a body but a **segment**.

A worm is one drawing rather than a run of bodies. `drawCrawlers` takes every
`crawler` link out of `drawCreatures`' ordinary pass — THE GYRE's arrangement —
and paints them back to front along the body, `linkOrder` descending, so each
leading dome lies over the tucked tail of the one behind it. That overlap is
the picture: the owner's instruction was *the segments are attached together as
they belong together — no space in between*, and `OVERLAP` is `0.16` of a tile.
Rings standing in a column the field does not have are not drawn at all
(`linkOnField`), because a worm feeds itself onto the ship a link at a time and
a body the pilot can see but can never put the cannon under is a lie.

One ring, in draw order:

| Pass | What | Numbers |
|---|---|---|
| body | the egg, squeezed | `CRAWLER` `rx 95`, `ry 42`, `taper 0.22`, `pulse 0.14`, in hundredths of a tile |
| wet | `CRAWLER_LOOK.slime` — GUT since 10 September 2026: a dark organ seen through the skin, pushed to the tail by the squeeze and swinging back a beat behind, under a rim of light where the skin is thinnest | `crawler-gut.ts`; it replaced the placed pores of 9 September, which replaced the belly, sheen and sliding catchlight this table used to list |
| rim | glow if the ring is lit, a flat stroke if it is a plate | `strokeGlow` or `STROKE.outline` |
| face | head only: one eye, a catchlight, a mouth that gapes on the beat | eye `0.16rx`, spark `0.06rx` at `0.85`, gape `ry·(0.16 + (squeeze + 1)·0.07)` |

**Three materials along one animal, and none of them is a new colour.** A ring
the cannon owes is `PALETTE.red` or `PALETTE.cyan`, lit and glowing; every ring
the shield owes is `PLATE` and `PLATE_RIM`, the same dead grey a shell and a
lid already wear, imported rather than picked again. The two ends are plates
too, and they say which end they are by **shape** rather than by ink — the head
is `0.66 × 1.34` of a ring with almost none of its taper (`0.05`), the tail is
`0.86 × 0.78` and fully tucked. Material says which control; the silhouette
says which way the animal faces.

The contraction runs **from the head backwards**, `crawlerSqueeze` at `0.22` of
a cycle per link, and it is the one thing on screen that says which end is the
front before anybody has looked at the mouth. It lives in `content` rather than
here because the shape sheet has to draw the same body the field does.

**Two pictures outlive the body**, in `Effects` rather than in the renderer
(`crawler-fx.ts`), because by the frame after the event there is nothing left
to hang them on:

| | what | numbers |
|---|---|---|
| splash | a crown of droplets in the ring's own colour and a wet patch under it, over the ordinary spark burst | `22` drops, `0.62` s |
| beam | a lane of the ship's light up the column the last ring stood in | `1.1` s — the longest transient in the game short of a boss |
| mound | two banks of grey plating thrown up either side of a burrow | `0.6` s |

The splash is the owner's, and its argument is the one this file keeps: a
matched shot into a sac of the colour the pair have just said out loud should
not put it out like a lamp. The beam is deliberately the longest thing here —
taking a worm apart costs both controls, turn about, for most of a wave, and it
is the only moment the ship says so.

## The chute

`packages/render/src/chute.ts`, drawing through the record in `chute-look.ts`;
the canopy is `chute-vane.ts` over the outline in `chute-canopy.ts`. The body
underneath is not in any of them: `wornKind` answers slick or bulb, so
`drawLiving` has already put an ordinary body down in its ordinary colour,
and this is what is hung on it — a plume while it climbs, a canopy once
`chuteIsOpen`. Everything is measured in the body's drawn radius `r`, and the
sway, the breath and the gutter are read off the wall clock with an offset
from the body's id (`sinHash(c.id) · 6.3`), so two chutes are never one
drawing twice.

| Pass | What | Numbers |
|---|---|---|
| **plume** | `column` — a tapering wedge of ember under the body, and a white-hot core inside it, while the body is still going up | base `1.1r` wide at `0.4r` under the centre, `2.4r` long, guttering `±12%` at `22` rad/s; ember → clear, alpha `0.75`; core `0.44r` wide reaching `0.66` of the length, `rgba(255,240,214,.75)`; halo `1.2r` at `0.6r` below, `PALETTE.ember` at `0.18` |
| **canopy** | VANE since 10 September 2026: the shipped dome, lit as a shell and turning about its own vertical axis, with eight pores coming round it | `canopyPath` — hem `1.5r` either side, crown `1.9r` above the body, bellied `±6%` at `1.6` rad/s; the whole rig leans `±0.16` rad at `0.7` rad/s |
| shell | a linear gradient from the key's shoulder to the far hem | `mixHex(glow, #F4F1EA, 0.3)` at `0.5` → glow at `0.28` → the shadowed colour at `0.45`, the dark being `mixHex(glow, #0B1024, 0.7)` |
| pores | eight marks on a ring at latitude `0.5`, projected by `facet` and clipped to the dome; the far ones are not drawn | one turn in `7` s plus `2.5 ×` the sway as twist; radius `0.16r`, foreshortened by the pore's own tangent plane (`sx` floored at `0.05`); fill `mixHex(dark, rim, lit)` at `0.85`, lit floor `0.35`; a pale lip at `0.8 × STROKE.inner`, alpha `0.6` |
| outline | the dome's rim | `STROKE.outline` in the body's rim colour |
| shrouds | four lines from the hem to a point above the body | from `t = −1, −⅓, ⅓, 1` along the hem to `0.45r` above centre, `PALETTE.dim` hazed, `STROKE.inner` |
| halo | one, over the whole canopy | `1.4r` at `0.95r` above, the body colour at `0.1` |

**The plume points down and the canopy turns.** The flame is what is putting
the thing up the screen, so it can only be drawn under it; a flame pointing
anywhere else describes a body that is falling. And the canopy is the one
answer on the slot that changed nothing about the outline — a dome is the same
silhouette from every bearing, which is why a yaw is the reveal to reach for:
the pores arrive thin at one limb, cross the front full and lit, and thin
away at the other, and if at field size they read as dots sliding *over* the
dome rather than *with* it, the look has lost (`chute-vane.ts`). The membrane
dome VANE replaced was deleted with the slot; `tools/versus/DECIDED.md` has it,
and BELL, GORES and RIBS went with it.

## The coil

`packages/render/src/coil.ts`, drawing through `coil-look.ts`; the chain is
`coil-prongs.ts`. A coil is a rock inside a dome, and neither is its own:
`drawMeteorBody` draws the stone and `drawClaspShield` the dome, on the
owner's instruction. What a coil draws that nothing else does is the **chain**
— the marks on the rim a charge leaves by and lands on, and the bolt crossing
the field between two domes — and that is the whole of the record, `studs`
and `charge`, each on its own frame.

| Pass | What | Numbers |
|---|---|---|
| dome | THE CLASP's shield, lit when the ship's plate reaches it or a charge is coming | `drawClaspShield`, `r = tile · CLASP_RADIUS_MUL`; `lit = max(coilWardReaches, charge)` |
| **studs** | PRONGS since 10 September 2026: three spikes standing off the rim, a bead on each tip, each with a lit face and a shaded one | turning at `0.35` rad/s, the other way for odd ids, offset by the id; reach `0.24` tiles past the rim, base `0.12` tiles, bead `0.05` tiles (`+0.04 ×` charge); the away face `#0B1024` at `0.55`; alpha `0.8 + 0.2 ×` charge; `PALETTE.claspShieldRim` at rest, `PALETTE.shieldRim` once a charge is on its way |
| flare | a halo on each tip, only while charged | `0.2` tiles, the hot colour at `0.45 ×` charge |
| crackle | short bolts leaping off every tip, only while charged | `2` a tip, up to `0.3` tiles, redrawn `10` times a second, alpha `0.9 ×` charge |
| **charge** | `spray` — the bolt from the failed dome to the next, and sparks fanning off its head | two `drawBolt` passes, alpha `0.9` and `0.55`, width `1.4`; `3` sparks ahead of the head within `±1.1` rad, up to `0.45` tiles, redrawn at `60` Hz off the age; a halo on the head growing `0.5`→`1.4` tiles and `0.3`→`0.75` alpha across the flight, `PALETTE.shieldRim` |

**The dome says *about to fail* from both ends.** The pilot has three beats to
call a charge, and before PRONGS the only thing saying one was coming was the
bolt itself; now the dome it is going to flares and crackles round its rim
while the bolt is in the air. The way it loses is written in the file: three
spikes on a bubble are a mine, so it is judged uncharged first, on a dome
nobody is doing anything to. SOCKETS went with the slot — the owner saw no
difference in it — and LEAP is on the SHAPES tab's HIT axis, in the *before*
phase beside TELEGRAPH; the three discs and two bare bolts they replaced were
deleted from `coil-look.ts`.

## The dart

`packages/render/src/dart.ts` holds the lean, the flip, the heat and the
navigator's arrow; the thrust goes through `dart-look.ts`, and since
10 September 2026 that is `dart-shock.ts` over `dart-torch.ts`. Drawn before
the body, in field pixels, back up the diagonal the body is running down
(`−dir · √½, −√½` — a direction, not a distance). The heat is `dartThrust`'s,
the direction `dartHeading`'s, and every length is the body radius
`r = tile · 0.4`.

| Pass | What | Numbers |
|---|---|---|
| **reach** | how far the flame goes, shared by every layer through `jetReach` | `r · (0.9 + 2.1 · heat)`, breathing `±7%` at `37` rad/beat off the body's id |
| flame | `torchJet` — three passes of one shape, `lighter`: a dim wide envelope, the body colour, a hot narrow core | width scales `1.7`, `1`, `0.42` of `r`; alphas `0.28`, `0.8`, `0.9 ×` heat; each leaves the tail at `0.16` of its width, bellies to `0.46` at `0.34` of the reach, frays out at `0.54` on a gradient to nothing |
| root | one tight near-white halo where the flame leaves the body | `0.3r · heat` at `0.22r` back, `PALETTE.sparkDim` at `0.95 ×` heat |
| **knots** | SHOCK — three bright marks strung down the axis, each breathing on its own clock | at `0.22`, `0.46`, `0.72` of the reach; `0.34r`, `0.24r`, `0.15r`; pulsing `±26%` at `23`, `31`, `41` rad/beat; each is the body colour at `0.55 ×` heat with `PALETTE.sparkDim` at `0.5 ×` heat over its inner `0.4` |

**The flame leaves the tail narrow and frays out, and that was the argument.**
What the game drew first was a filled triangle with its base against the body
and its apex a tile away — the profile of a beam, which is what a lance and
every aimed thing here looks like, and a dart is not shooting; it is being
thrown. `torchJet` turned the two ends round on 8 September, and SHOCK put a
repeating mark inside it, because the one thing an exhaust has that a smear
does not is structure — three rates that are not multiples of each other, so
the knots never pulse together. Where it can lose: three round marks in a line
is a chain of bubbles, and THE STRAND's whole creature is bodies on a line. The
triangle is PLUME on the SHAPES tab's TAIL axis; BRAID, CINDERS and the bare
FLAME (marked shipped, since it still burns under the knots) are there beside
it.

## The echo

`packages/render/src/echo.ts`, drawing the seam through `echo-look.ts`; the
seam is `echo-buds.ts`. An echo is a slick or a bulb at six tenths pulling
itself in two: the strain is `STRAIN 0.34` along the axis at the instant it
divides and a neck of `0.55` across, squared in phase so nearly all of the
pulling happens in the beat before it goes (`echo-strain.test.ts` asserts the
curve). None of that is in the record. What the record holds is the one mark
that says *this one is about to come apart, and this way*, drawn in the body's
own scaled frame alongside `drawDetails`, and only while `echoAxis` says there
is a parting to come.

| Pass | What | Numbers |
|---|---|---|
| **cores** | BUDS since 10 September 2026: two balls of the body's own colour under the skin, on top of each other at first and drawn apart along the axis as the strain gathers | radius `0.62 ×` the smaller half-extent, each travelling `0.5 ×` that at full strain; strength `0.3` → `0.9` with the phase |
| light | each core is lit from `KEY`, with the pose's lean and the axis taken back out so the light stays in the field's corner | a radial gradient from `0.4` core radii toward the key: rim at full strength → colour at `0.8` (at `0.35`) → dark at `0.6` (at `0.8`) → clear, over `1.1` core radii |
| **furrow** | the shipped seam, cut across the axis between the cores | the body's dark, alpha `0.22` → `0.85` with the phase, width `0.16 ×` the smaller half-extent doubling to full strain, `1.05 ×` the larger half-extent long, round caps |

**The picture cannot point one way while the bodies go another.** A core moves
along `echoAxis`, the same field axis the two halves will step along, and the
furrow is scored across it — a body dividing sideways is scored down the
middle, one dividing up and down across it — and both screens have it. BUDS
added what the furrow alone never said, *what* is parting: over three beats one
heart becomes two. Where it can lose: two bright discs on a small round body is
a face, and this game already has a creature whose two bright discs are one.
CLEFT and WAIST went with the slot, and so did the bare furrow — BUDS still
cuts it, from its own copy of the three numbers.

## The fence

`packages/render/src/fence.ts`, and the files around it: `fence-wire.ts` (the
material), `fence-gate.ts` (a way through, built or broken), `fence-sweep.ts`
(what the other seat gets instead), `fence-arc.ts` (the meeting with the dome),
`fence-shards.ts` (the pieces a bolt knocks out), and `fence-strike.ts` with
`shield-outage.ts` and `hull-shock.ts` (what a wall costs the ship). The only
body in the game drawn as a **line** rather than as a thing standing on a tile,
and the only one whose two screens differ in where it *stops*.

| Pass | What | Numbers |
|---|---|---|
| rail | the band between the two wires, filled | `0.34` tiles of gauge, `PALETTE.arc` at `0.16` alpha |
| wires | two jagged polylines, glow-stroked, one either side of the row | `4` points a tile, `±0.055` tiles of stray, `PALETTE.arc` at `max(2.2px, 0.055` tiles`)`, glow intensity `1.8` |
| cores | each wire again, thinner, over its own glow | `45%` of the wire's width, `PALETTE.arcRim` |
| terminals | a bead at each end of each wire | `0.085` tiles, pulsed `0.75`–`1.0` on the crackle clock |
| **gate** | two posts framing an open column | `±0.26` tiles, `PALETTE.arc` at `0.5`–`0.62` alpha, `max(STROKE.inner, 0.035` tiles`)` |
| **drape** | the line clamped onto the ship's own surface | never below `surface(x) − 0.37` tiles (`GAUGE/2 + 0.2`) |
| **sweep** | a reading head crossing the wire, p2 only | `2.4` s a crossing, `2.2` tiles of trail, two ticks at `±0.34` tiles, gone over the last `1.4` rows |
| **arcs** | bolts both ways between the wire and the dome | the whole drop, `0.28`→`1` with nearness, `4`–`12` bolts (squared), `5`–`13` kinks, struck at `22` Hz, fan `2.2` tiles at the wire and `0.7` at the dome |
| **break** | a column the cannon cut | torn ends reaching `0.3` tiles back and curling `0.34`, a `#150632` scorch across the tile, `3` rags swinging at `2.2` Hz |
| **shards** | the pieces the cut throws | `14`, `0.1`–`0.26` tiles long, `5.2`/`2.6` tiles a second out and up, `7` of pull, `0.62` s |
| **outage** | the shield's line, dead in places | `5` stretches of `0.1`–`0.24` tiles, `#150632` at `0.15` tiles wide, `PALETTE.arc` at the raw ends, `2.2` s |
| **shock** | the whole ship conducting | `7` crawlers over `0.16`–`0.42` of the width lifting `0.22` tiles, `5` hops of `0.5`, `0.75` s |

**The wall comes to rest on the ship.** It used to be drawn at its row's own
centre and taken off the field the moment the dome was standing in one of its
gaps — a whole tile short of the hull — so the last picture of a wall was of
one vanishing in mid-air. The owner reported exactly that. `fenceLineY` refuses
to take the wire below the membrane, so the last beat of a fence is a line
draped along the ship's outline with the dome and the cannon holding it up; the
simulation's half of the same repair is `resolveFence`, which now gives both
answers on the beat the wall is drawn resting on the ship.

**The arcs run the full height of the field and go out when the dome finds a
way through.** From the beat the wall arrives, bolts jump between the wire and
the dome in both directions at once — the wall's `arc` blue going down, the
shield's `shieldRim` coming up, each with a white head walking the way its own
current runs — thickening as the two close, with the wire over the dome burning
brighter and the membrane lit where it is earthing. A gap is a hole in a
circuit, so once the dome has stood in one for `fenceSettleTicks` — half a tile
of this wall's own fall — the current stops, and that is the pair's own
confirmation before the wall lands. The settle is what keeps a shield sliding
across the field from strobing the arc a column at a time; the cost is that the
navigator can probe for an opening by standing in columns, which the owner
asked for knowingly.

**A cut is drawn as a break, and a wall is only ever cut at a crack.** A crack
is a column *and* an ammunition colour, drawn on the pilot's screen alone — the
two wires bowed apart into a lens of that colour with a jagged split across the
band between them — and a bolt arriving on one in its own colour is the only
shot in the game that opens a wire (`fence-crack.ts`). That is the wave
author's lever: a cannon that could open a hole anywhere would make every fence
the same fence, and a crack makes the shot a sentence with two halves in it,
because the seat that can see the crack holds neither trigger. A bolt anywhere
else is spent and rejected. A bolt on the crack tears the column open — torn
ends curling out of it, a scorch across the tile, rags of wire still hanging in
it, and fourteen pieces of the line itself thrown out of the cut and tumbling.
Three markings on one screen are therefore never the same picture: posts mean
the wave built this way through, a crack means the cannon may make one here,
and a break means it has.

**What it costs is drawn on the shield and on the whole ship, not in the skin.**
A wall that finds the dome in its way earths through it, so there is no crack:
`breachUnscarred` leaves no `Scar` behind the event, and `shield-outage.ts`
bites five dead stretches out of the lit rim instead, each with the wall's own
blue still fizzing at the two raw ends. They ride `rimSpan`, so sliding the dome
afterwards takes the outage with it — what was put out is the shield, and the
shield travels. And for three quarters of a second the ship *conducts*: arcs run
along its own membrane from wall to wall, crossing the lobes, with short hops
jumping clear of the skin and back (`hull-shock.ts`). One clock drives both
(`fence-strike.ts`), because one thing happened.

**And the navigator gets a sweep where the pilot gets the doorways.** A screen
shown an unbroken wire had nothing on it and no reason written into the picture
to open its mouth, so a reading head runs the width of the field, over and over,
one way only. Every term in it is the clock and the field: it does not know
where a gap is, whether there is one, or how many, and it is the same sweep over
a solid wall as over one open in four places.

**Two wires and not one, and the owner asked for it by name.** At a single
hairline the thing coming down read as a scratch on the grid; what it has to
read as is a barrier the ship is threaded through, so it has a gauge — a top
edge, a bottom edge and a charged rail between them — and the posts of a gate
stand taller than the gauge so an opening is visibly a way *past* rather than a
mark laid over an unbroken line.

The crackle runs at `11` Hz and is a function of the column, the row, which of
the two wires it is, and the wall clock — **and of nothing else**. That is the
decision in this file rather than a drawing choice: no term in the wobble knows
where a gap is, so a navigator watching the line hard cannot read the answer
out of how it shakes. It is `ghost-row.ts`'s rule about a column-blind sweep,
said about a wire.

Each wire is **pinned at both ends of every run**, tapering the stray to zero
at the field's edge and at the lip of a gap: a line that jittered where it
meets something reads as one that has come loose, and this is a thing anchored
at both ends and humming.

**Which gaps a screen draws is the simulation's call, not this file's.**
`fenceGapSeen` decides it: an authored gap is on the pilot's screen only, and
one the cannon *cut* is on both, because the bolt went up in front of the two
of them. `showsFenceGaps` is the seat predicate and it answers only the first
half of that question.

`PALETTE.arc` is a hard electric blue at 225°, chosen to be near neither
ammunition colour — pale electric cyan is what lightning actually looks like
and is exactly `cyanRim`, which would put *load cyan* across every column of
the field on an arrival the cannon answers by cutting rather than by killing.

## The balloon

`packages/render/src/balloon.ts`, and its two handles in
`packages/render/src/balloon-handles.ts`. The one body in the game whose
**shape is changed by a control** while the pair is playing it.

| Pass | What | Numbers |
|---|---|---|
| skin | `balloonPath` — an egg fuller above the middle than below | height `0.44` of a tile full-size, `0.29` after a split; widest point lifted `0.12` of the height; wobble `0.05` on the height alone |
| swell | the whole body scaled by how far through its fill it is | `0.18 + 0.82 ×` `balloonSwellPhase` — never quite nothing, because the swell is the only announcement this creature gets |
| give | each half-width grown by the hand on that side | `+0.5 ×` the side's tension, and the height cut by `0.16 ×` the larger of the two |
| fill and rim | `PALETTE.rockDark` under `PALETTE.rock`, the rim going to `PALETTE.text` under tension | glow `0.5 + 1.2 ×` tension |
| knot | a three-point triangle under the skin, drawn open | `0.22` of the height wide, `0.3` deep |
| gloss | one ellipse up and to the left, travelling with the left half | `0.2 × rxLeft` by `0.26 × ry`, alpha `0.45` |
| halo | only once somebody is pulling | `2.4r`, `PALETTE.text` at `0.1 + 0.22 ×` tension |
| handles | `drawHandleRing` — the shared handle, with a tab back to the skin | `cfg.balloonHandleMilli` off the body's centre; yours in `PALETTE.rock`/`text`, the other seat's in `PALETTE.dim` |

Three things in there are decisions rather than settings.

**It is grey, and no hue was spent on it.** In this game a body carrying no
ammunition colour is a body no shot reaches — the choir's membrane, the shell's
plating, the lid's armour — and a balloon is exactly that, permanently. A
colour of its own would have said *load something*, which is the one thing
neither player should be doing about it.

**The two half-widths are separate, so the body is lopsided while one hand is
on it.** That is the whole readout: neither player can see the other's thumb,
and the shape of the skin is the only place the pair learns that a hand has
arrived. There is no easing anywhere between `balloonTension` and the picture,
for the reason `lidOpenMilli` gives about a gap between two plates.

**Both handles are drawn on both screens, and only your own is bright.** Every
other handle in the game is drawn where it can be used and dimmed where it
cannot; here each seat has to see the *other* one moving, because the instant
they are both taut is an instant neither of them can feel.

## Bullets

`packages/render/src/bullets.ts`. One look and one shape, since the lance grew
a picture of its own.

| | shot |
|---|---|
| tail width | 2 |
| tail alpha | 0.35 |
| tail length | `frac` — how far through the tile the head is |

A straight line from the head back up the column, then a halo and the head
itself. The reason given in the file is the whole of it: *a tail behind the
head, so the direction is legible even at twelve tiles a beat*.

This is the only tail in the game that is a plain hard line, which is why
`STREAK` is on the TAIL axis — the question it asks is whether the thing that
works for a point works for a body.

**A lance is not a bullet at all** (`packages/render/src/lance.ts`). It is one
shaft of light in the cannon's column, drawn in two states by one routine so
the thing that burns is visibly the thing the fill made: white at the core, the
ammunition colour at its edges, with a crackle down it seeded on the tick so it
shivers at the simulation's rate rather than the frame rate. Filling, it grows
out of the muzzle and widens — cubed, so almost all of the growth is in the
last beat. Burning, it stands at its widest for `lanceBeamBeats`, ending at
whatever stopped it.

The owner asked for the fill by name on 7 September 2026 — *improve the bar
indicator to show a small beam like in independence day, which grows bigger and
bigger, in white mixed with colour of cannon* — and then, watching it, for the
beam to *be* the weapon and stay a beat longer. `packages/render/src/lance-flash.ts`
washes the whole stage in the ammunition colour on the tick it lights, tuned
down from a whiteout that hid the field for most of a second.

The travelling ribbon that was the lance for one day is parked on NOT BUILT YET
→ MECHANICS, under WEAPON IDEAS.

## Where this is decided from now on

The director's GRAPHICS tab (SHAPES until 11 September 2026), under `◇ NOT BUILT YET`:

- **GLOW** — nine ways a body throws light, with the two shipped ones among
  them (`BLOOM` is `strokeGlow`, `HALO` is `halo`).
- **HIT** — seven ways a body reacts to being struck. **Nothing in this file
  corresponds to any of them**: the game has no impact effect at all today
  beyond the blocked-shot grey-out, so every value there is a proposal.
- **TAIL** — six things a falling body can leave, two of them marked IN THE
  GAME.

`docs/glow.md` is how those are written. Nothing in the director touches
`packages/render`; adopting any of it is a separate decision made by looking.
