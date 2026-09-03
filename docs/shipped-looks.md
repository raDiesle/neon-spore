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
