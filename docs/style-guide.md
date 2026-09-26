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

## Depth — bodies that look three-dimensional

**The graphics look 3D; the game does not move in 3D.** The owner named the
direction on 8 September 2026 — the graphics should look three-dimensional,
and a flying body should turn just enough that *what was behind it comes into
view* — and corrected how it had been read on 26 September 2026: *"i want to
allow 3d, just that the game does not move into 3d"*. The first note was
written down as "look three-dimensional while staying 2D" and taken as a ban
on drawing anything built in three dimensions, so the bosses got flat
outlines with shading painted on, and they looked flat. **That was a
misunderstanding, and it is withdrawn.**

- **What stays 2D is the play**: the field is a plane, the hull is fixed,
  nothing the players control travels (`CLAUDE.md`), and the simulation has
  no z. None of that is about how a body is drawn.
- **How a body is drawn is free.** A body modelled in three dimensions and
  projected every frame — the rig, **A boss seen from any side** below — is
  the preferred way for anything large that turns. Lit sprites, real
  perspective, a real z for ordering, and a small 3D library are all allowed.
- **The limits are the phone's, not the dimension's.** Battery and frame time
  matter to the owner more than any look. No full engine — PixiJS, Three.js,
  Rive, Lottie — the owner, 26 September 2026. Anything that runs per frame
  on the GPU or adds a library is tried as a candidate with its cost measured
  before it reaches the field.

**On a body still drawn as a flat outline**, the rest of this section up to
the rig is how it reads as solid: layering, a fixed light, and things coming
round a limb. Both halves of that are reachable by different machinery, and
mixing them up is what makes an attempt read as a coin flipping. A body that
has to turn further than a lean is better rebuilt as a rig than tuned here.

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

### Depth on a body that already ships

A body large enough for `key-light.ts`'s `litRound`/`litBox` or `instar-hide.ts`'s
`lightHide` (a boss, a card, a rock) gets its five zones from a `Form`'s
`x, y, r, ry, angle` — and `angle` is the one field of the four a drawer can
leave a bare constant, because the other three still size the gradient to the
plate even when it does not turn. A constant `angle` still shows rounding and a
shoulder, so it looks finished at a glance; by the pairing rule above it is a
still life anyway, because the lit half has nothing paired with it. THE
INSTAR's side skull (`instar-side-head.ts`) was this: `angle: -0.2`, never
touched again after the plate it lit was written.

**The fix is not a real turn.** The body is not rotating, and borrowing a
rotation for the lighting would run into the reason the whole-body sway stays
a displacement (`instar-sway.ts`): a turn taken for lighting must not reach the
silhouette or a mark's own coordinates. It is a small wobble folded only into
the `Form.angle` handed to `lightHide`/`drawScales`, own-motion and so on
wall-clock `time` like the rest of a boss's idle detail (a drip's stretch, a
lamp's pulse) rather than `world.beat` — nothing about *which way the light
sits on an otherwise-still plate* has to agree between two phones the way a
synced gesture does. Small enough that the pose still reads as still; the cue
is the wet shoulder sliding, not the skull visibly turning. A part that is
driven every frame for a real reason — a hinged jaw's swing, a limb whose
angle is an `atan2` recomputed off a point the input or the sim is actively
moving — keeps that angle bare; the wobble adds nothing where the angle is
already live. **An `atan2` off a point that only moves at a pose change is
constant in between**, which is the same still life with extra arithmetic:
THE INSTAR's long body once turned its `angle` from the neck to the tail,
both of which sit still for beats at a time between morphs, and needed a
wobble of its own; it is a tube now and rolls about its own length instead
(`instar-profile-life.ts`), on a period the skull's does not share. Its
actual tail (`instar-tail.ts`) once turned its `angle` from the rear to the
fork the same way, and is a tube now too, swinging on a breath of its own
(`SWING_PERIOD`).

**A `Form` that never sets `angle` at all is the same still life with the
constant left out**, since `lightHide` reads a missing `angle` as a bare `0`
(`instar-hide.ts`, `form.angle ?? 0`) — indistinguishable from the skull's
`angle: -0.2` except that the number was never written down. THE INSTAR's
face-on jaw and brow (`instar-head.ts`) and its face-on body segments
(`instar-front.ts`) were all like this, and all get the same wobble folded in
as their first `angle`, each on its own period
(`JAW_WOBBLE`/`JAW_WOBBLE_PERIOD`, `BROW_WOBBLE`/`BROW_WOBBLE_PERIOD`,
`SEGMENT_WOBBLE`/`SEGMENT_WOBBLE_PERIOD` — the segments phase-offset per
segment the way their lamps' pulse already is, so five plates do not turn in
step either).

**The still life is not only a body's own `Form.angle`** — anywhere a lit
surface's bearing is read off a value that only a shared, near-frozen drift
touches, the same failure is there under a different name. THE WARDEN's
armour (`warden-plates.ts`) shades each plate by calling `litAt` on that
plate's own face bearing, and that bearing moves only by the ring's shared
0.01-radian drift — the one thing that gives each plate its own presence,
the breath in its `lift`, never reached the shading at all, so every plate's
lit edge and seam sat still while the slab under it visibly breathed. The fix
is the same wobble, folded into the angle `litAt` is called with rather than
into the plate's geometry, on its own period so it does not come back into
step with the ring's drift or the breath (`LIT_WOBBLE`/`LIT_WOBBLE_RATE`).

**Nor is it only a bearing** — the same failure is there wherever a lit
surface's *position* is read off a value that never moves at all. THE
SINEW's muscle mass (`sinew-flesh.ts`) shades itself with a radial gradient
centred a fixed `rx * 0.3, ry * 0.5` off the mass's own centre, and that
offset never moved a hair — while the mass's own silhouette breathes on its
own terms, wobbling by the blob path's `time * 0.4`. Beautifully lit and
still a still life. The fix is the same wobble, folded into the gradient's
offset rather than into the plate's geometry or a bearing, on its own period
so it does not come back into step with the blob's own drift, the fibres'
sway or their wave (`MASS_LIT_WOBBLE`/`MASS_LIT_WOBBLE_RATE`).

**A fold through the body's own equator is still a position, and still goes
stale.** THE SURGE's sac (`surge-flesh.ts`) shades itself with a radial
gradient offset a fixed share of its own `rx`/`ry` toward the light, while the
sac's silhouette breathes under it on the swell and the pressure and, past the
half of an eversion, folds through its own middle. None of that reached the
gradient's own offset. The fix is the same wobble, folded into the offset on
its own rate, distinct from the swell's breath and the fold's own turn
(`SAC_LIT_WOBBLE`/`SAC_LIT_WOBBLE_RATE`).

**One boss can hide several still lifes, one per shaded part.** THE SPLICE's
spore ball (`splice-ball.ts`) has two — the membrane's fill and the nucleus's
core — each a radial gradient offset a fixed share of its own radius while the
membrane wobbles on `b*0.5` and the nucleus on `b*0.8`. Fixing one and leaving
the other is still a still life, just a smaller one. The fix is a separate
wobble term for each, on its own rate so neither locks into step with the
other or with the part it lights (`MEMBRANE_LIT_WOBBLE`/
`MEMBRANE_LIT_WOBBLE_RATE`, `NUCLEUS_LIT_WOBBLE`/`NUCLEUS_LIT_WOBBLE_RATE`).
The eater's head (`splice-eater-head.ts`) is the same failure once more, its
"flesh" gradient offset fixed while the cranium wobbles on `b*0.4` and the jaw
on `b*0.5` (`HEAD_LIT_WOBBLE`/`HEAD_LIT_WOBBLE_RATE`).

**A part built to be handed a `time` it never receives has no wobble to
fold in.** THE THROAT's everted ring (`throat-flesh-lip.ts`) shades its "wet"
sheen with a gradient centred on the ring's own coordinates, fixed, while the
ring it lights already wobbles by `time * 2.1` (`throat-evert.ts`'s
`insidePoints`). `paintTurned` had no `time` parameter to read one from — the
fix is the same wobble as anywhere else, but it first meant threading `time`
through the one call site that paints a turned ring
(`WET_LIT_WOBBLE`/`WET_LIT_WOBBLE_RATE`).

**A body drawn once per beat rather than once per turn gets it too.**
THE GUM's drop (`gum.ts`) shades its sac with a linear gradient run straight
down `-GUM.ry` to `GUM.ry` — a bare axis, never touched — and sets its wet
gloss at a fixed `-rx * 0.3, -ry * 0.45`, while the sac's own silhouette
breathes on `contourClock` feeding `blobRadiusMul`'s wobble terms every
frame it falls or flies. Beautifully lit and still a still life, on a body
with no boss-sized rig at all — the same failure reaches a creature this
small once its shading is a gradient and not a flat fill. The fix is the
same wobble, folded into the gradient's axis and the gloss's offset
together, on its own rate distinct from the trail's and the blob's own
wobble terms (`SAC_LIT_WOBBLE`/`SAC_LIT_WOBBLE_RATE`).

**A shared paint file can be lit correctly and still miss it on one caller.**
THE UNDERTOW's lobes (`undertow-lobe.ts`) each trace a rim that already
wobbles per frame — `0.03 * sin(time * 1.3 + a * 2 + seed)` — but the `Mass`
handed to `undertow-flesh.ts`'s gradient, underlight and film sat on a bare
`x`, `top`, `skin`, `hw` with no time term at all, while the body drawn two
functions down in the same file (`drawBody`) already folds its own sway into
the `Mass` it hands the same paint code. Beautifully lit by design — the
paint file itself is correct — and still a still life on the one caller that
never passed its own motion in. The fix is the same wobble, folded into the
lit `Mass`'s `x` rather than the paint code, on its own rate distinct from
the rim's own (1.3) and the body's sway (0.9)
(`LOBE_LIT_WOBBLE`/`LOBE_LIT_WOBBLE_RATE`).

**A glow inside the body is a different cue from a lit surface**, and the
owner asked for it by name alongside gradients and fills on 26 September
2026. `lightHide`'s zones all read the hide as an opaque shell with light
falling on the outside; a soft colour breathing up *through* it — behind the
plates rather than across them — reads as something alive underneath. THE
INSTAR's chest (`instar-profile.ts`) blits `glow.ts`'s `halo()` in the ember
the mouth's fire already uses, sized to the body and pulsing on its own
wall-clock period, under the plate rather than clipped to it: cheap (one
cached sprite), and it needs no new zone in `lightHide` because it is not a
light falling on the surface at all.

**A spike's light runs across its width, not along its length.** THE
INSTAR's horns (`instar-side-head.ts`) were shaded with a gradient run
base-to-tip along the horn's own long axis, fading alpha over a dark fill —
nearly invisible, reading as a flat grey triangle, because a cone's roundness
is a cross-section, not a length. The fix is a gradient perpendicular to the
horn's own axis instead — key-lit edge bright, far edge dark again — plus a
small contact-shadow ellipse where it roots in the skull, so it reads as
round and as planted rather than pasted on, from whatever angle it is drawn
at. The same swap applies to any spike, thorn or claw shaded the first,
length-wise way.

**A gradient sized to a plate's length starves its width.** `lightHide`'s
radial body pass (`instar-hide.ts`) sizes itself off a `Form`'s `r` — right
for the skull and the jaw, whose `r` and `ry` sit close together, so the
gradient's falloff has plenty left to spend crossing the plate as well as
running down it. THE INSTAR's long body (`instar-profile.ts`) has an `r`
(half its neck-to-tail length) several times its `ry`, so the same gradient
spends nearly all of itself reaching the ends and has almost nothing left
for top-to-bottom contrast — beautifully lit at the skull, nearly flat three
plates down the same hide. The fix is not a change to `lightHide`, which is
still right for the round plates it already shades. The body is now a tube of
the rig instead (`solid-tube.ts`, `drawTube`): one ring per sample of the
spine, each lit across its own width as the cylinder it is, so the contrast is
sized to the section and not to the length. Any body whose length far exceeds
its width is a tube, not a plate with a tweak to the shared radial pass.

**On a tube, what sits on the surface is placed round the rings.** THE
INSTAR's scales, lamps and back ridge (`instar-profile-surface.ts`) stand at an
angle from the back round each ring, the angle read with a slow roll added
(`instar-profile-life.ts`), so the rows walk round under a light that stays put:
the near ones crowd toward the limb and go, the far ones come over the back.
The rig's frames start from "up", and a spine that leaves its first sample
running backward has its back underneath — `bodyOf` checks which way the first
frame faces against the outline's own top and turns the angle round, or every
spine lands on the belly.

**A flat fill on a rounded body is a silhouette wearing a colour, not a body.**
THE GIMBAL's sealed drum (`gimbal-draw.ts`) drew each hatch leaf as one solid
`fillStyle` under a stroke — a dome that read as a lid, because nothing in it
answered where the light was. `key-light.ts`'s `litRound` already exists for
exactly this — a rock, an ore vein, a meteor all clip to their own path and
call it, cached by radius and spin so it costs nothing per frame — and a leaf
sealed shut is round the same way those are: clip to the leaf's own path, then
`litRound` over it before the ribs and outline draw on top. A body with no pose
to turn it still needs *some* motion for the light to sit on, or a beautifully
shaded dome is a still life the instant the pose stops moving (`instar-profile-life.ts`'s
roll, `instar-side-head.ts`'s `CROWN_WOBBLE`) — the drum's own
`DRUM_WOBBLE` feeds a slow idle turn into `litRound`'s own `spin` argument
rather than inventing a second wobble mechanism, with the two leaves a turn out
of phase so their shoulders do not slide together. Any other sealed, rounded
body drawn as a flat fill — a pod, a shell, a drum, a tank — gets the same
`litRound`-plus-idle-spin pair rather than a bespoke gradient.

**A creature's `litRound` half has no lift, so its base fill needs room to
darken into.** `LIGHT_HALF.creature` is `"value"` — `docs/alive.md`'s hue-lock,
no brightening, ever, only `shadeAt`'s darkening. THE FILAMENT's heart
(`filament-draw.ts`) clipped to `litRound` exactly like the drum, over its old
flat fill (`PALETTE.sheenDeep`, already close to black) — and came out reading
just as flat as before, because a ramp that can only darken has nothing to show
against a floor it is already standing on. The fix is not a different half; the
rule about hue is the reason the effect exists. It is a brighter base
(`HEART_LIT`, `sheenDeep` mixed toward `sheenWarm`) so the same darkening-only
ramp has a range to move through. Any other creature body this dark before
`litRound` is added needs the same check: does the flat fill sit far enough
above the ramp's floor for `shade` alone to read?

**A boss can hide more than one flat-fill body, and each gets its own read.**
THE HASP had three: the sealed clasp shell, the navigator's wheel disc and the
pilot's cap (`hasp-draw.ts`, `hasp-parts.ts`), all rock and metal so all three
take `LIGHT_HALF.rock`, and each answers the "what moves the light" question
differently. The shell has no pose of its own between swings, so it gets an
idle wobble exactly like the drum's, phase-offset per clasp index so a row of
three doesn't breathe together. The wheel already computes a real turn to draw
its spokes by — **when a part has its own genuine rotation, feed that straight
into `litRound`'s `spin` rather than inventing a second, idle one**: a seized
wheel's shading then stops exactly when its spokes stop, the same tell the
knurl already gives, instead of two motions disagreeing about whether the hub
is turning. The cap is the one piece on this boss with an explicit rule against
moving at all — the pilot is never shown whether the wheel behind it turns —
so it takes `litRound` with `spin` fixed at a literal `0`: depth without
motion, because the motion itself would leak the one thing the design keeps
from that seat.

**A flat body that isn't round takes `litBox`, not a bent `litRound`.**
THE RATCHET's seven rack plates (`ratchet-shape.ts`'s `ratchetPlatePath`) are
straight-sided quads, tapering head to tail, and none of them read as a
segment of a circle — clipping one to `litRound` would centre a radial
gradient inside a shape it was never shaped for. `litBox` already exists for
exactly this, the same ramp walked corner to corner across a rectangle rather
than out from a centre (`magnet-coil.ts`'s `slab`), so each plate gets its own
bounding box (`ratchetPlateBox`) and is lit as the flat slab it is rather than
forced round. A spent plate, already drawn fainter to read as slack, is left
unlit: the same call HASP's swung-open clasps make, since a body already
reading as "gone" needs no light to prove it.

**A boss can need both primitives on different parts of the same body.** THE
SPOOL's two flanges (`spool-shape.ts`'s `spoolFlangePath`) are ellipses, so
they take `litRound` clipped to the path, with an idle wobble like the drum's
and the shell's — the flange has no rotation of its own to feed, and the two
ends are phase-offset by `end` so they don't breathe together. The barrel
between them (`spoolBarrelPath`) is a literal rectangle, so it takes `litBox`
across its own bounding box, the same call RATCHET's plates make. The four
ribs proud of the barrel were left unlit: too small and too mechanical to read
a gradient at their width, the same call that ruled out RATCHET's pawl and
lock pieces.

### A boss seen from any side

The owner, 26 September 2026: the bosses should be shown *from different
angles and perspective … but to look correct and 3d*. A pose cannot do it (the
one rule above), so a body that has to be seen from more than one side is
**modelled in three dimensions and projected** — a **rig**: parts in three dimensions, turned and projected every
frame. `bun run solid` draws the test rig from the side, the three-quarter and
the front, at eye level and looked down on, and across time. Change a part,
run it, look at the PNG — that is the loop.

- **The convention.** `packages/content/src/solid.ts`. A rig is authored
  side-on in pixels: x along the body with the head negative, y down, z toward
  the player. `view(yaw, pitch, lens)` — `SIDE` is 0, `FRONT` brings the head
  toward the player, `THREE_QUARTER` is half way, positive pitch looks down on
  the back. `lens` is a perspective distance, so the near end swells; `Infinity`
  is orthographic.
- **The light does not turn.** Normals are turned into the view and lit by
  `keyLit`, the same `KEY` `surfaceLit` uses. A body lit in its own frame
  carries its highlight round with it, which is the still-life failure in
  three dimensions.
- **Two part kinds.** A *tube* is rings along a spine (`solid-tube.ts`, with a
  rotation-minimising frame so a ridge does not slide round a bent body); a
  *ball* is a centre and a radius. Anything a boss has is one or the other, or
  several of them.
- **The painter orders parts, not triangles.** `farFirst` sorts by mean depth.
  A part long enough to be both in front of and behind another is split in
  two where it crosses — the demo's tail is two tubes for that reason.
- **Depth reads through three cues at once**: the far part is hazed toward the
  background in six steps (`solid-haze.ts`'s `hazeSkin`), a ball that sits on
  a tube lays a cool contact shadow clipped to that tube (`drawContact`, the
  one shadow allowed because it is on the body it touches, not cast across the
  field), and the near end of a tube gets a lit dome for a cap.
- **A tube is shaded in opaque stops, densified.** `solid-tube-draw.ts` fills
  the outline, clips to it, and lays a linear gradient across each slice —
  shadow, lit shoulder, sheen, bounce — as *opaque* mixes of the skin, with
  rings inserted every 6 px. Translucent stops stack where the quads overlap
  and band; quads that only meet leave a seam. They overlap by a little and
  are pushed out past the outline so the clip makes the edge.
- **A ball is a baked sprite** (`solid-ball.ts`), keyed on skin and a radius
  rounded to 4 px, so a breathing head bakes twice, not once a frame.
- **Motion is a function of time, and it follows through.** `solid-motion.ts`:
  `noise1` is a hashed value noise, `breath` a period that wanders by it,
  `chainAt(root, t, i, lag)` is link `i` doing what the root did `lag·i`
  earlier. A tail is a chain; nothing is simulated, so nothing outlives a frame.
- **A part hangs off an anchor** (`solid-anchor.ts`). A jaw, a wing, an eye is
  authored about its own hinge, and its `Anchor` says where the hinge sits on
  its parent and how far it is turned there — `roll` about the body's length
  lifts a wing, `pitch` in the side plane drops a jaw, `yaw` turns a head —
  with an optional `parent`, so the skull turns and the jaw goes with it.
  `drawRig` poses each anchor once per call and carries the part into rig
  space before it is seen, so the painter still sorts where the part really
  is. Animate a hinge by turning its anchor, never by moving every ring.
- **A sheet is skin between bones** (`solid-sheet.ts`): one polygon in rig
  space — a wing's membrane, a fin — lit by its own Newell normal, turned to
  face the viewer first since a membrane takes the key on either side. Three
  fills: the skin nearly opaque, its lit colour by how square it is to the
  key, and a *glow* gradient between two of its points for light coming
  through it, sheen at the bones going to `#0B1024` at the hem. Its outline
  gets the tube's rim.
- **THE INSTAR's wings are the worked example** (`instar-wings.ts`). Each is
  authored once, flat about its shoulder, and hung on an anchor; the figure's
  `side` blends two carriages — face-on spread and hanging, side-on raised off
  the back — so one wing serves both views. The beat is on the roll, so the
  membrane turns its face to the key and away and brightens and darkens with
  nothing animated but the hinge. The arm is a tube of the rig, and the far
  wing is the same wing mirrored across z (negate roll and yaw, keep pitch)
  and hazed.
- **A body seen end-on is a tube whose spine runs into depth**
  (`instar-front-body.ts`). The rings go along the rig's `x`, which the front
  view turns away from the player; each is placed where the flat picture had
  it, the lens divided back out, so the body keeps its footprint and gains its
  roundness. Pinch the girth at every seam — a smooth tube seen end-on reads
  as a horn, a pinched one as plates going away.
- **A tail is a tube that swings in depth as well as across**
  (`instar-tail.ts`). Its follow-through is `chainAt` on a `breath`: each
  ring does what the root did a moment earlier and a little more, so a wave
  runs to the tip. Swing it across the picture pinned at both ends, so what
  the tip is aimed at stays under it, and swing it toward the player and
  away with the lens divided out of the centre: nothing moves on the screen,
  but the rings turn in the light and the near end swells. Where it curls
  tighter than it is thick, split it into two tubes at the top of the curl
  and draw the root first — one tube there folds its outline through itself.
  Sample it densely enough that a tight bend is not a row of elbows, and deal
  a chain's lag and growth out per ring from a whole-tail figure, so the
  motion does not change when the ring count does.
- **A horn is a cone that leans in depth and turns with its skull**
  (`instar-horn.ts`). Taper a tube from the root to nearly nothing, so the
  light runs across it at any angle; ring it with a groove bowed toward the
  root, lit just above. Give its point a `lean` toward the player or away:
  the lens draws a swept-back point smaller and the stepped haze takes it
  toward the field, which is what makes the face-on horns go *back* off the
  brow. Turn it about its root by the skull's own idle turn, so the horns and
  the light on the skull move together, and root it a little inside the
  skull, so the tube's round end is under the plate. A hinged part breathes
  on its hinge — the side-on jaw opens by a `breath` over its pose's opening
  — never by moving its points.
- **A row of lobes bows in depth and turns, and never leaves its columns**
  (`gorge-depth.ts`). A body whose parts stand over columns the rules read
  gets depth only *in place*: give each part a `z` on a bow (the middle
  nearest) plus a slow `breath` turn that brings one end forward as the other
  goes back, then scale each by the lens, `lens / (lens - z)`, haze the far
  ones a stepped share toward the field, and paint far to near so the nearer
  is over the further where they meet. Its centre never moves. Things *inside*
  a translucent part swim round it in depth — the half behind is drawn before
  the skin and veiled by it, the half in front after — which is the reveal a
  lens alone never gives. The rim is on the edge turned from the key and
  slides with the turn; a rim all the way round is an outline.
- **A long body that cannot bow its outline bows in its light**
  (`antiphon-depth.ts`). When the outline and everything hung on it are
  read by the rules — THE ANTIPHON's pits, perches and rail — the depth goes
  into paint over the flat skin: each lobe of the hem lit as its own pouch
  and gone deep at its sides, both ends hazed toward the field with the one
  the `breath` turn takes back hazed more, the film streak sliding with the
  turn, a rim on the far end only, and a contact shadow round the root of
  whatever grows out of it. A body that goes still stops turning, so its
  stillness is seen in the light as well as in the breath.
- **A cord that carries the count swings in depth and nowhere else**
  (`baton-tube.ts`). THE BATON's arm is a tube of the rig sampled off the
  same spline the stroke used, lit round its back, its rim in the cold light,
  and a contact shadow on it where it goes into each knuckle so the knuckle
  is threaded on the cord. A `breath` at the root runs down it by `chainAt`
  toward the player and away; the lens is divided back out, so every joint
  stays where the fight puts it and only the cord's girth and light change.
  What reads as health — the knuckles and how many are lit — takes no lens.
  A cord thinned to a hair is a stroke again: at that width a tube is all rim.
- **A long band across the field is a ledge seen from above** (`lead-depth.ts`).
  THE LEAD's ridge takes a top plane — hazed at its back edge, lit at its
  front — a dark crease where the top turns down into the face, and its two
  ends hazed as they go away at the sides of the screen. What stands on it
  sits in a contact shadow squashed flat onto that plane, never a disc. A
  cord too thin to light as a tube (a few pixels) gets its back from one dark
  stroke offset from the key and a contact where it goes under each bead;
  each bead and the mound take a cold rim on the edge turned from the key.
  Every mark is laid on things in place: the angle, the bead count and the
  bead sizes are the readout and are never touched.

**Zdog was tried beside the rig and not taken.** `bun run solid --zdog` draws
the same body both ways (`tools/raster/src/zdog-page.ts`; zdog is a devDependency
of `tools/raster` for that sheet only, never of the game). Zdog turns and
orders one body correctly, but every part is one flat colour: no key light, no
haze, no contact, so a turn reads as a paper cut-out rotating. Adding a light
to it means writing what `solid-tube-draw.ts` already does, on top of 7 KB
gzipped of a library last released in 2019 with no types. What was worth
borrowing is its way of authoring — a part hangs off an anchor and inherits
its turn — and the rig has it now, without the library.

**A GPU pass is a candidate, never the default.** A WebGL glow over the 2D
canvas uploads the whole frame to the GPU every frame and runs a shader over
it, which is battery on a phone. If it is tried, it is bloom on the bright
layer only, at half or quarter resolution, behind a switch, in
`tools/versus/candidates/`, and it is judged on what it costs a real phone as
much as on how it looks.

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
