# The visual system

The top of the tree. What this game looks like, why, and which of those
decisions are settled.

**Nothing is decided here for the first time.** Every rule below is read off
the code or off the document named beside it, and where the two disagree the
code is right and this file is stale — say so in the commit that fixes it. The
one thing this file does that no other file does is put the whole language on
one screen, so a session can spend two hundred lines instead of the two and a
half thousand spread across `alive.md`, `glow.md`, `parts.md`, `skins.md`,
`shipped-looks.md`, `dimensional.md`, `raster.md` and `spec/graphics.md`.

The picture that goes with it is `docs/reference/style-guide.svg`, written by
`bun run style-guide` out of `PALETTE`, `STROKE` and `silhouettes.ts`, so it
cannot drift from what the game draws. The director's DOCUMENTATION sheet has
the same specimens on its STYLE tab, built live at open time out of the same
values — the one to open when you want a hex rather than a printable page,
since a swatch there is clicked and copied.

## The identity

**Organic, graceful, neon.** Living bodies drawn as glowing outlines in dark
space: closed contours with lobes, a dark interior at 10–20% opacity, and the
light carried by a soft aura around the line rather than by the line's weight.
Nothing is filled, nothing is shaded flat, and nothing is drawn twice the same
way — a body sways, breathes and flinches on a clock both phones share.

The emotional register is **fragile, not heroic**. The fiction that survived
the move from ocean to space is the part that matters: colour is a property of
a creature that a matching shot resonates with, the rock is immune because it
does not live, and you are the delicate thing rather than the warrior. The hull
is a soft violet body with a cannon and a shield grown out of its own contour
as bumps — not a ship with parts bolted on.

The register is **playful before it is menacing**. A clown rides a rock; a
creature spits a nice green poison; a boss shows its hand. What keeps that from
going slack is that the pair is always losing information, never health.

**What it must not look like.** Pixel art or anything retro — decided in
`spec/graphics.md` and never revisited. A bloom-soaked screen: glow here is a
signal and a screen where everything glows says nothing. Solid-filled bodies. A
hard-edged mechanical sprite sheet. Detail that dies at 26 px. Twelve bodies
each lit from a different angle. Anything that makes a silhouette harder to
name.

## The two laws

Everything else bends. These two do not.

**1. A silhouette must mean the same word every time.** Two people describe
shapes out loud across a two-second delay, so a body that is more alive and
less nameable is a net loss. This is the constraint that outranks beauty, and
it has already killed good ideas — `docs/alive.md` records which and why.
`tools/shape-sheet/src/nameability.ts` measures the separation; the axes a
kind can be told apart on are lobe count, aspect and drawn size, and a new body
landing on a neighbour's values is a body the pair says the wrong word for.

**2. Glow is state, not decoration.** A creature shot in the wrong colour drops
its glow, its trail and its halo and is drawn as a **grey outline only** — same
contour, same size, same place. The light going out *is* the message that the
shot was spent (`living-draw.ts`, the `blocked > 0` branch). Anything added to
the field has to keep that true, which means brightness is a budget: a creature
is the brightest thing on screen, and every new glow spends against that.
`docs/shipped-looks.md` has the current draw, glow by glow.

## Shape language

**Blobs and slimes.** A body is a closed Catmull-Rom contour through points
whose radius is modulated by a lobe count, a depth and a wobble in time
(`blobRadiusMul`, `blobPath` in `packages/content/src/shapes.ts`). The hull is
the same construction — the cannon and the shield are bumps on one contour via
`hullRadiusMul` and `bumpAdd`, never separate objects sitting on top.

- **Organic beats geometric**, and the exceptions are the dead things. Rock and
  crystal get `crystalRadiusMul` and faceted edges; everything alive is round.
- **Symmetry is radial, not bilateral.** A lobe pattern repeats about the
  centre. Where a body needs a front — the dart's nose — the asymmetry is put
  in the **seed**, because the apex sits where `lobes · a + seed` is zero, so
  the seed *is* where the point is and is not a free number.
- **Proportion is one of three separating axes**, and only the slick is flat
  (aspect 2.0 at 68 × 34). Three of the round kinds sit near 1.0, which is why
  lobe count is doing so much work and why a sixth round body is expensive.
- **Edges are soft and continuous.** No corners on a living thing, no hard
  stroke joins — `stroke-linejoin="round"` everywhere.
- **Negative space is the field.** Bodies do not touch, do not overlap and
  cannot occlude each other: a card is one contour, so no part of a body passes
  behind another part of it (`docs/dimensional.md`).
- **Secondary forms attach to a rim**, in their own frame, at their own phase —
  a tentacle, a spore, a crystal, a fin. Sixty of them exist; build a body out
  of parts rather than writing a new radius function (`docs/parts.md`).

## Materials

Six, and they are the ones the code already draws. Adding a seventh is a
decision, not a convenience.

| Material | What it says | Where it is drawn |
|---|---|---|
| **membrane** | the default living surface — dark interior, glowing rim, aura | `skins/membrane.ts`, `glow.ts` |
| **carapace** | plated and hard-shelled; a living thing with armour | `skins/carapace.ts`, `skins/scale.ts` |
| **glass / nacre** | translucent, refractive, six-stop ramps in `linearRGB` | `skins/glass.ts`, `skins/nacre.ts` |
| **flesh** | sub-skin structure — veins, pores, cilia — breathing on offset phases | `skins/vein.ts`, `pore.ts`, `cilia.ts` |
| **stone** | dead matter: cold grey, faceted, craters, and **no glow at all** | `skins/crater.ts`, `PALETTE.rock` |
| **current** | pure emission with no body — an arc, a filament, a fence | `PALETTE.arc`, `fence-wire.ts` |

The load-bearing distinction is **stone against everything else**. The rock is
immune because it does not live, and the way a player knows that without being
told is that it is the one thing on the field throwing no light.

## Colour

The values are in `packages/render/src/palette.ts`, each with the argument that
put it there. These are the rules those arguments keep re-deriving, stated once.

- **A hue ships as a triad**: the body colour, a near-white `Rim` at the same
  hue, and a `Dark`/`Deep` fill at the same hue. Body hues measure S 81–100 and
  L 51–68; rims L 77–93; deeps L 10–26. A colour that does not come with all
  three is a colour something will have to invent at a `fillStyle`.
- **A fill never reaches the background.** A gradient that fades to `background`
  opens a hole in the silhouette, and half a silhouette is a different word.
  That is why deeps are named swatches and not alpha.
- **Two accent colours carry the ammunition** — `red` at 345° and `cyan` at
  186° — and everything else on the field must be unmistakable for either. A
  new hue is placed *by angle*, in a gap between two existing ones and touching
  neither: `clownNose` 313°, `wisp` 261°, `arc` 224°.
- **Green is reserved** for a Simon round answered in full (`good`, 150°) —
  the one thing in the game that goes right. Three exceptions have been granted
  by name, and each is held apart by hue *and* by where it appears, never by
  the rule: `claspShield` 128° round a body up the field, `eyeFluid` 120° pooled
  under an eye, `venom` 83° only inside SNAKE's arena. Nothing draws two at once.
- **The neutrals are one desaturated violet**, 247°–252° at S 18–49 —
  `background`, `grid`, `gridBeat`, `dim`, `sparkDim` — so the whole picture
  sits inside the hull's own hue. `rock` and `rockDark` are the deliberate
  break: colder and bluer at 224°, because dead matter is not made of the same
  stuff as the dark.
- **A neutral says "nothing to report."** Nothing a player must describe out
  loud may be drawn in one, which is why THE WISP is drawn through *both*
  ammunition colours rather than in grey.
- **Colour is decided in `palette.ts`, never next to a `fillStyle`.** A colour
  chosen in a component is a colour nobody can find.

**One measured exception, unresolved.** `redDark` sits at 261° — a violet-black
— while every other deep is within 10° of its own body hue (`cyanDark` 195 vs
185, `podDark` 35 vs 40, `venomDeep` 91 vs 83). It is used as red's fill
everywhere. Whether that is the reason red bodies sit into the violet ground
better than cyan ones, or drift nobody has looked at, is an eye's question and
is in the report rather than changed here.

## Light and glow

**Glow is an aura around the line, never a thicker line.** Three passes at
spread 5 around a 1.6 px outline (`STROKE` in `palette.ts`), drawn as layered
strokes plus one pre-rendered additive halo sprite — **never `shadowBlur`**,
which costs frames on a mobile GPU and heats the phone.

**A lit body has five zones and none of them is written by hand.**
`skins/light.ts` has them under their own names: `terminatorPass` is the ramp
from lit through half-tone to form shadow, `contactPass` the dark edge on the
*lit* side that makes a body solid, `specularPass` the one highlight, offset
from the focus and never on it, `rimLightPass` the cool bright edge on the away
side, and the reflected light is the last stop inside the terminator's gradient.
`litPass` is all five in the order that works. **The direction is `KEY`, a
constant shared with the game, and it is not a parameter** — six skins each
inventing an angle is twelve bodies on one page lit twelve ways. Compose the
passes and say in the file which one you left out and why.

**A shadow is cool and never black.** `#0B1024`. Black is a hole in the card.

**Six stops, not three.** Three make a ramp and a ramp reads as a gradient; six
with the colour moving across them read as a substance. Put
`color-interpolation="linearRGB"` on it — sRGB muddies the midtone between two
saturated hues, which is exactly the middle of a six-stop ramp.

**Nothing casts a shadow onto anything else.** Both cast and contact shadows
were built, looked at, and taken out: a shadow needs a lit surface to fall on,
and this is a glowing hull in dark space, so it read as a smudge. Do not build
them again — `spec/graphics.md` has the whole reasoning so the gap is not
mistaken for an oversight.

## Depth — flat assets that read as solid

**This is a direction the owner named, on 8 September 2026:** the graphics
should look three-dimensional while staying 2D, and a flying body should turn
just enough that *what was behind it comes into view*. Both halves are
reachable, they are reachable by different machinery, and mixing them up is
what makes an attempt read as a coin flipping.

**Depth is never a z axis.** It is layering, a fixed light, and things coming
round a limb.

**The pairing is the whole effect.** An `sx` cosine with no shading is a coin
or a body being squashed; `light.ts` builds a convincing ball and a ball that
does not move is a still life. Together — a surface travelling under a light
whose `KEY` holds its screen position — the eye has one reading available and
takes it. **Each half looks like a failure on its own**, which is why `KEY` is
a constant and never a parameter, and why the two must be judged on one page.

**A pose cannot make anything come out from behind.** `{ dx, dy, rot, sx, sy }`
about the body's centre has three degrees of freedom where a general affine has
four; the missing one is skew, so an upright axis and a level axis are reachable
and nothing between them is. Worse for this particular ask, an affine scales the
picture about one centre, so every painted mark moves at nearly one rate — the
measurement is **1.10 : 1** between a mark at the facing meridian and one at the
limb, against **22.9 : 1** for a real turn. That is not a weakened asymmetry, it
is the absence of one, and no amount of tuning a pose will produce a reveal.

**The reveal needs per-feature placement, and that already exists.**
`packages/content/src/surface.ts` puts every surface feature at
`x = reach · cos(lat) · sin(lon + θ)` every frame, which is what gets 22.9 : 1
and what makes a mark at the edge slow, crowd against the limb and go. It is in
`content` so the director's skins and the renderer both reach it: `pin` once,
`facet` per frame, `surfaceLit` for the shading, and **never a copy** — four of
those accumulated before it had a home. So the rule is:

> **A body's silhouette is posed; its surface is placed.** The contour may be
> squashed and leaned by an affine. Anything *on* the surface — a pore, a vein,
> a club, a mark, a lit seam — is positioned by longitude and latitude, so a
> slow turn carries the far ones round into view and the near ones away.

That distinction is also what keeps the reveal legal: a card is one contour, so
no *part of a body* may pass behind another part of it, and lobes may not
occlude lobes. A **feature on a surface** going round the back is a different
thing, and it is the one form of occlusion this stack has.

**Two cues a squash cannot fake**, worth having wherever depth is claimed:
**two periods** — width repeats twice per revolution and the sideways swing
once, when the centre stands off the axis it turns about — and an **asymmetric
cycle**, because foreshortening is a cosine of angle *plus lens*, so going away
and coming toward are not mirror images. A lean is symmetric by construction and
says nothing.

**Where it is proven and where it is not.** The four dimensional motions —
`TURN IN DEPTH`, `APPROACH`, `PITCH`, `CRAWL` — read on a catalogue card at
92 px. On a **26 px creature they are unproven and dangerous**: TURN IN DEPTH
moves drawn aspect by ×1.82 and PITCH by ×1.77, where the round kinds are
already within a whisker of each other on that axis, so either would swallow the
nameability gate whole. `APPROACH` is the one exception worth naming — uniform
scale leaves aspect at ×1.00 and spends itself on size, ±19% — and that is a
different trade rather than a free pass, because *the little one* is a thing the
pair says out loud.

So the order of work this direction implies: put the reveal on a card first,
under the light, beside the motion it answers; clear the nameability gate; and
only then ask it of anything at 26 px. `docs/dimensional.md` has the
measurements and says where to stand to look at both halves.

**None of this is judged by eye.** `bun run shapes:cues` prints the three cues
as text — the two periods, the asymmetry, and whether anything is revealed —
with a placed surface as the last row for every posed one to be read against;
`tools/shape-sheet/test/depth-cues.test.ts` holds this page's own figures, so a
motion that stops turning fails a test rather than a review. The procedure, and
what is dangerous where, is `.claude/skills/depth`.

## Motion

**Motion is where liveliness comes from at 26 px, not detail.** A damped spring
with overshoot, volume preserved (wider is shorter), a short hit-stop, and a
reaction proportional to its cause.

- **The clock is `world.beat`, never `performance.now`.** Two phones must sway
  the same creature the same way.
- **Unison on the beat, offset everywhere else.** Every creature moves one row
  on the same instant, so the landing squash and the pre-beat gather are in
  unison — pretending otherwise would lie about the game's only rule. The sway,
  the drift and the light are offset per body by a continuous integer hash, so
  the field is in time without being in step.
- **Phase offset is the cheapest detail available.** Two parts breathing
  together are one flat object; the same two a fifth of a cycle apart are a
  near thing and a far thing with material between them.
- **A blocked shot is a 60 ms hit-stop at the canonical silhouette, then a
  recoil.** Holding the shape dead still is the one item anywhere that
  *increases* legibility rather than merely not harming it.
- **Reactions come off state render already holds** — the row against the hull
  row, a grip, a block, a destroy — never off a new field.

## Complexity, by drawn size

| Size | What survives | What to spend on |
|---|---|---|
| **≤ 11 px** | nothing of a figure | do not draw a figure here |
| **20–26 px** — a creature in a wave | contour, lobe count, colour, motion | silhouette and own-motion only; interior detail is wasted |
| **~40 px** — a turning body | a rim's bearing, a countable number of parts | parts on a rim, not surface texture |
| **card / boss size** | interior structure, light passes, veins | the five light zones, a second border cut from the body's own outline |
| **UI icon** | one stroke and one shape | outline only, no fill, no gradient |

The 20–26 px row is a disagreement the project has not settled: `spec/graphics.md`
says detail does not survive and `docs/alive.md` sends it to a vote as
`creature:interior`. Until that vote happens, the spec is the default.

## The formats

**SVG is an authoring and inspection format here. It is not the drawing path,
and it never reaches the player.** The field is one `<canvas>` drawn by
`packages/render` top to bottom every frame: no DOM node per creature, no CSS
animation, no SVG anywhere in the game. This has been asked twice now from
outside frameworks written for SVG-and-CSS games, and the answer both times was
the same one — `docs/raster.md` has it at length, including why a baked APNG
may not touch the field (the browser plays it against a clock the frame loop
cannot see, and this game is two phones that have to agree).

So the honest architecture is:

| Layer | Format | Truth |
|---|---|---|
| a contour | a function in `packages/content/src/shapes.ts` | one copy, called by canvas *and* by every SVG sheet |
| a creature | a data entry in `packages/content/src/creatures.ts` | never a file |
| the field | Canvas 2D, procedural, per frame | `packages/render` |
| a shape sheet, a card, concept art | SVG, generated | `tools/shape-sheet`, `tools/director` |
| a home-screen icon | SVG, hand-drawn, rasterised | `apps/game/icon.svg` → `bun run icons` |
| a baked animation | sprite atlas only, behind `?raster=1` | parked — `docs/raster.md` |

**The rule that follows from it**: a shape is never drawn twice. If a sheet and
the canvas disagree about where a lobe is, one of them is reimplementing
`blobRadiusMul` and that is the bug.

## An asset a physics round can use

The arcade-shooter vocabulary — thrust, strafe, dodge, a ship that travels —
is deliberately absent from **the field**, where nothing the players control
moves (`docs/decisions.md` #21). It lives in the **interludes**, which have
their own rules and their own picture, and that is where an asset meets a
collision engine: PINBALL has a real one, and THE CAROM and THE COIL bounce
things off each other.

**So an asset has three layers, not one.**

| Layer | What it is | Where it lives |
|---|---|---|
| the picture | fills, aura, light, the drawn wobble | `packages/render` |
| the contour | the closed loops the shape *is* — for the sheet, the parts, destruction | `blobRadiusMul`, `livingPoints`, `loopsAt` |
| the collision body | a **peg** (circle) or a **block** (axis-aligned box), centre and half-extents in thousandths of a tile | `PinPiece` in `packages/sim/src/pinball-contact.ts` |

**The collision body is a primitive and never the drawn contour.** That is the
load-bearing rule and it is not a simplification anybody was lazy about: the
sim stores integers, the ball is stepped in thousandths, and `Math.sqrt` is
replaced by `isqrt` because IEEE-754 does not require it to be correctly
rounded — a last-bit difference between V8 on Android and JavaScriptCore on iOS
lands on either side of a `.5`, and the two phones play different tables from
the third bounce on. A Catmull-Rom lobed contour cannot be collided against in
integers on those terms. Every off-the-shelf 2D physics engine integrates in
floats, which is why there is a two-hundred-line one here instead.

**What that asks of the picture**, and this is the whole of the art direction
in a physics round:

- **The silhouette must promise the primitive.** A round thing is a peg and a
  boxy thing is a block. A body drawn with a spike the ball passes straight
  through is a lie the player only finds out about by losing, and the lobe
  amplitude on a blob — ±13% of a radius — is smaller than the ball anyway.
- **A drawn animation may not move the bounce.** The picture breathes, flashes
  and reacts; `xMilli`, `yMilli`, `wMilli`, `hMilli` do not, unless the sim
  moved them. A wobble that changed where a ball came off would be render
  reaching into the simulation, which rule 1 forbids outright.
- **Nothing may be drawn thinner than it collides.** `PIN_THIN_MILLI` is the
  floor a piece may be authored at — the speed cap is held below the ball's
  radius plus that half-thickness, so one tick can never carry the centre past
  the far side of anything. A picture that reads thinner than its own body
  invites a shot the physics will refuse.
- **A hit is drawn, not simulated.** Sparks, a flash, a piece going out: all of
  it is `Effects`, cleared on restart, and none of it is state either device
  has to agree about.
- **Scenery still bounces.** Peggle's orange rule — a handful of pieces are
  targets and the rest are scenery that still deflects — so the picture has to
  say *which*, and that is a job for colour and glow, not for shape.

**And the same three layers are what makes an asset reusable.** A body whose
contour is a function and whose collision is a primitive can be spent in a
round nobody had thought of when it was drawn — which is what `claiming` a
shape out of `docs/asset-catalogue.md` means. A body that is a picture with a
hand-drawn hitbox beside it can only ever be itself.

## How an asset gets made

Six steps, and the first three cost no picture at all.

**1. Concept — one sentence.** If you cannot write it, the asset is padding.
Check `docs/asset-catalogue.md` and `bun run shapes:parts` before inventing:
three dozen contours and sixty secondary forms are already drawn and waiting
for an idea.

**2. Silhouette — numbers before pictures.** `bun run shapes:report` prints
extents, rim count and where a contour sits in its box. Name the neighbour it
has to be told apart from and the axis that does it. Most first-pass mistakes
are visible here for a couple of hundred tokens instead of the fifteen hundred
an image costs.

**3. Specimen — one still, rasterised and actually read.** `bun run png` works
on any SVG. Then correct it and look once more. Two or three rounds, stopping
when two consecutive looks find the same thing at different strengths — that is
tuning, and tuning is the owner's. `.claude/skills/svg-look` has the loop.

**4. Offer it — and a candidate is static by default.** The owner's rule, 8
September 2026: a candidate is a **still picture or an SVG in a fixed state**,
and it animates only when motion is the thing being judged. Timing, phase
offset, overshoot, whether a body still reads at tempo — those need the animated
pair `docs/versus.md` was built for, and nothing else does. A colour, a contour,
a material, an interior treatment or an icon is settled from a still, which is
cheaper to make, cheaper to look at, and can be judged on a phone with no game
running. **What is never done either way is judging a still against something
that moves** — that is the defect `docs/versus.md` rejected a whole proposal
over, which is why this is stated as a test and not a preference.

**5. The vote.** `tools/versus/candidates/` beside the shipped look, or a NOT
BUILT YET card when it is not yet that concrete. Pressing a button writes
nothing: it emits a prompt naming every `old -> new` value, and the next session
applies it.

**6. Adopt.** The winner's numbers move into `packages/content` when what was
drawn is a body, or into `packages/render` when it is a mechanism; the loser is
removed; `bun run shapes` and `bun run style-guide` are regenerated in the same
commit, because a committed picture that no longer matches the values is read as
evidence.

## How an asset gets made

Six steps, and the first three cost no picture at all.

**1. Concept — one sentence.** If you cannot write it, the asset is padding.
Check `docs/asset-catalogue.md` and `bun run shapes:parts` before inventing:
three dozen contours and sixty secondary forms are already drawn and waiting
for an idea.

**2. Silhouette — numbers before pictures.** `bun run shapes:report` prints
extents, rim count and where a contour sits in its box. Name the neighbour it
has to be told apart from and the axis that does it. Most first-pass mistakes
are visible here for a couple of hundred tokens instead of the fifteen hundred
an image costs.

**3. Specimen — one still, rasterised and actually read.** `bun run png` on any
SVG. Then correct it and look once more. Two or three rounds, stopping when two
consecutive looks find the same thing at different strengths — that is tuning,
and tuning is the owner's. `.claude/skills/svg-look` has the loop.

**4. Offer it — and a candidate is static by default.** The owner's rule, 8
September 2026: a candidate is a **still picture or an SVG in a fixed state**,
and it only animates when motion is the thing being judged. Timing, phase
offset, overshoot, whether a body still reads at tempo — those need the
animated pair `docs/versus.md` was built for, and nothing else does. A colour,
a contour, a material, an interior treatment or an icon is settled from a still,
which is cheaper to make, cheaper to look at, and can be judged on a phone
without a running game. **Judging a still against something that moves is the
one thing never to do** — that is the mistake `docs/versus.md` rejected a whole
proposal over, and it is why the exception is stated as a test rather than a
preference.

**5. The vote.** `tools/versus/candidates/` beside the shipped look, or a NOT
BUILT YET card when it is not yet that concrete. Pressing a button writes
nothing: it emits a prompt naming every `old -> new` value, which the next
session applies.

**6. Adopt.** The winner's numbers move into `packages/content` when what was
drawn is a body, or into `packages/render` when it is a mechanism; the loser is
removed; `bun run shapes` and `bun run style-guide` are regenerated in the same
commit, because a committed picture that no longer matches the values is read
as evidence.

## Adding to this language

**A look is offered, never replaced** (`CLAUDE.md`, `docs/looks.md`). If a
change would show up in a frame of the running game it goes to
`tools/versus/candidates/` or to a NOT BUILT YET card, never straight onto the
field. Three exemptions, and the commit says which: a look asked for by name, a
look with nothing shipped in its place, and a repair to something *wrong*
rather than unlovely.

**A picture is built by looking at it** — `.claude/skills/svg-look` has the
loop: `bun run shapes:report` first, then one PNG actually read, then a
correction. SVG written blind comes out thin every time.

**Before proposing an asset, run `docs/art-review.md`.** It is the checklist
this file's rules turn into, and it is what catches an asset that is beautiful
and belongs to a different game.

**When a new asset settles a rule this file does not have, add it here** — in
the section it belongs to, replacing whatever it contradicts rather than
sitting beside it. A style guide that only ever grows is a list, not a language.
