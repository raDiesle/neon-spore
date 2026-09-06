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
| fill | flat dark body | the creature's `dark` |
| **glow** | `strokeGlow` — the same path stroked repeatedly, widest and faintest first, additively | 3 passes (`STROKE.glowPasses`), spread 5 (`STROKE.glowSpread`), alpha `0.1 / i`, composite `lighter`, then the crisp outline at `max(1, r * 0.1)` |
| detail | `drawDetails` — see below | inner drawing thinner than the outline |
| **tail** | `drawMotionTrail` — two halos strung *upward* | at `0.73r` and `0.61r` (`r * (0.85 - k * 0.12)` for k = 1, 2), a quarter tile apart, alpha `(1 - k/5) * 0.4 * 0.5`, slid sideways by `sin(t*3 + k) * tile * 0.05 * k` |
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

The tail is worth a second look while it is written down: **two steps of a
quarter tile is less than one body-height of trail**, and it is made of the
same halo sprite the body already wears. So it says *this thing glows* a second
time rather than *this thing is moving*. That is the honest reading of the
shipped look, and it is why the TAIL axis has five proposals standing against
it.

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

`packages/render/src/veer-clown.ts`. Every rock above is drawn by
`drawMeteor`; THE VEER is that rock with a figure laid over the top of it,
outside the frame the stone spins in.

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
| belly | a dark band under it, so it sits on the hull | `PALETTE.background` at `0.34`, `1.1rx × 0.75ry`, dropped `0.95ry` |
| sheen | a specular along the top, `lighter` | `PALETTE.text` at `0.16`, `0.62rx × 0.3ry` |
| wet | one catchlight that **slides with the contraction** | `PALETTE.text` at `0.4`, `0.2rx × 0.16ry`, offset `rx·(0.1 + squeeze·0.12)` |
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

## The grate

`packages/render/src/grate.ts` and `grate-gate.ts`. The only body in the game
drawn as a **line** rather than as a thing standing on a tile, and the only one
whose two screens differ in where it *stops*.

| Pass | What | Numbers |
|---|---|---|
| filament | a jagged polyline across the row, glow-stroked | `4` points a tile, `±0.09` tiles of stray, `PALETTE.arc` at `STROKE.outline`, glow intensity `1.4` |
| core | the same path again, thin, over the glow | `STROKE.inner`, `PALETTE.arcRim` |
| terminals | a bead at each end of every unbroken run | `0.055` tiles, pulsed `0.75`–`1.0` on the crackle clock |
| **gate** | two uprights framing an open column — pilot's screen only | `±0.22` tiles, `PALETTE.arc` at `0.5`–`0.62` alpha, `STROKE.inner` |

The crackle runs at `11` Hz and is a function of the column, the row and the
wall clock — **and of nothing else**. That is the decision in this file rather
than a drawing choice: no term in the wobble knows where a gap is, so a
navigator watching the line hard cannot read the answer out of how it shakes.
It is `ghost-row.ts`'s rule about a column-blind sweep, said about a filament.

The filament is **pinned at both ends of every run**, tapering the stray to
zero at the wall and at the lip of a gap: a line that jittered where it meets
something reads as one that has come loose, and this is a thing anchored at
both ends and humming.

`PALETTE.arc` is a hard electric blue at 225°, chosen to be near neither
ammunition colour — pale electric cyan is what lightning actually looks like
and is exactly `cyanRim`, which would put *load cyan* across every column of
the field on the one arrival nothing can be fired at.

## Bullets

`packages/render/src/bullets.ts`. Two looks, one shape.

| | shot | lance |
|---|---|---|
| tail width | 2 | 5 |
| tail alpha | 0.35 | 0.6 |
| tail length | `frac` — how far through the tile the head is | `frac` |

A straight line from the head back up the column, then a halo and the head
itself. The reason given in the file is the whole of it: *a tail behind the
head, so the direction is legible even at twelve tiles a beat*. A lance is half
the speed, so the same tail is twice the object.

This is the only tail in the game that is a plain hard line, which is why
`STREAK` is on the TAIL axis — the question it asks is whether the thing that
works for a point works for a body.

## Where this is decided from now on

The director's SHAPES tab, under `◇ NOT BUILT YET`:

- **GLOW** — nine ways a body throws light, with the two shipped ones among
  them (`BLOOM` is `strokeGlow`, `HALO` is `halo`).
- **HIT** — seven ways a body reacts to being struck. **Nothing in this file
  corresponds to any of them**: the game has no impact effect at all today
  beyond the blocked-shot grey-out, so every value there is a proposal.
- **TAIL** — six things a falling body can leave, two of them marked IN THE
  GAME.

`docs/glow.md` is how those are written. Nothing in the director touches
`packages/render`; adopting any of it is a separate decision made by looking.
