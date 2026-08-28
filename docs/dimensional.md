# Depth, out of four numbers that have none

Eleven spare motions were written and every one of them happens in the picture
plane. This is what came of asking how far the Canvas2D and SVG stack can be
pushed toward an impression of three dimensions **without a second renderer**,
written after drawing four of them rather than before. `motions/depth.ts` holds
the drawings; this holds the ceiling.

## What a pose is

`{ dx, dy, rot, sx, sy }`, applied as `translate · rotate · scale` about the
body's own centre. There is no z anywhere in it. Two consequences, and both are
hard walls rather than difficulties:

- **A composite of one rotation and one scale has three degrees of freedom in
  its 2×2; a general affine has four.** The missing one is skew — which is
  exactly what a body rotating about an axis *tilted* off vertical projects to,
  because that needs `R(θ₁)·S·R(θ₂)` and the pose has one rotation, not two. So
  an upright axis and a level axis are reachable and nothing between them is.
- **One `sx` covers the whole body.** A wave running *along* a body is
  therefore impossible, not merely awkward, and that is why SLITHER's
  counterpart had to turn the worm to face the viewer instead of translating it.

Nothing here can occlude, either: a card is one contour, so no part of a body
can pass behind another part of it.

## The ceiling, measured

Take a body turning about an upright axis. `tools/director/src/skins/turn.ts`
does this properly — every surface feature is placed at `x = reach·cos(lat)
·sin(lon+θ)` every frame — and the pose cannot, so the two can be measured
against each other on the same body at the same 5° steps:

| | a mark at the facing meridian | a mark at the limb | ratio |
|---|---|---|---|
| the projection | 0.0872 | 0.0038 | **22.9 : 1** |
| the pose | 0.0283 | 0.0257 | **1.10 : 1** |

That is the whole of it. A real turn crosses the near half of a body twenty-odd
times faster than the far half, because what the eye is reading is a cosine
applied *per feature*. An affine transform scales the picture about one centre,
so every painted mark on the body moves at very nearly one rate — 1.10 : 1 is
not a weakened asymmetry, it is the absence of one. The 22.9 : 1 also matches
the 23 : 1 `turn.ts` measured on the running page, which is the cross-check
that says this arithmetic is about the same body.

The width law is not where the difference lives either. `√(cos²α + d²sin²α)`,
the exact shadow of an ellipse in plan, differs from a raised cosine of the
same range by at most **3.3%** of the body's width. So the silhouette curve is
worth getting right and is not what carries the read.

## The pairing, which is the finding

An `sx` cosine with no shading is a coin, or a body being squashed. The same
numbers under a light that stays put are a rotation. **Each half looks like a
failure on its own**, and that is the sentence worth keeping:

- **Width alone.** The body narrows and widens on a curve, with nothing to say
  why. A squash is the simpler explanation and the eye takes it.
- **Light alone.** `light.ts` builds a convincing ball — terminator, contact
  shadow, one specular, a rim — and a ball that does not move is a still life.
- **Together.** The light's `KEY` is a constant for the page, so the lit
  shoulder and the terminator hold their screen positions while the silhouette
  travels under them. A surface moving under a fixed light is the one reading
  that explains both, and the eye has nothing else to reach for.

This is why `KEY` is a constant and never a parameter, and why the two things
have to be looked at on one page: neither half can be judged alone, and a
session that tries will conclude that both of them fail.

Two cheap cues do survive in the pose, and both are worth having because they
are things a squash cannot fake:

- **Two periods.** TURN IN DEPTH's width repeats twice per revolution (9.14
  beats) and its sideways swing once (18.28), because the body's centre stands
  0.13 tiles off the axis it turns about. A squash has one period and no
  travel, so it cannot produce this at any amplitude.
- **An asymmetric cycle.** Foreshortening is a cosine of *angle plus lens*, so
  the two ends of a tip are not mirror images: PITCH loses 44.1% of its height
  going away and gains 14.3% coming toward. A lean is symmetric by
  construction — CANT's `rot` runs −0.260 to +0.260 and says nothing at all.

## The four, and what each costs

| | stands beside | the one number it turns on | what it costs |
|---|---|---|---|
| `TURN IN DEPTH` | TURN | longitude α, at TURN's own rate | drawn aspect ×1.82 |
| `APPROACH` | SWELL | distance z, scale = 1/z | drawn size ±19% |
| `PITCH` | CANT | tip + lens, on CANT's square wave | drawn aspect ×1.77 |
| `CRAWL` | SLITHER | the *speed* of a ratcheted reach | drawn aspect ×1.29 |

- **TURN IN DEPTH** — `sx` 0.550 to 1.000, `rot` untouched. Beside TURN, which
  is `rot` and nothing else, the pair is the clearest statement on the page of
  what a spin in the plane is not.
- **APPROACH** — 0.862 to 1.190 against SWELL's symmetric ±16%: the same swing
  in depth grows a body more than it shrinks it, because scale is `1/z`. `dy`
  is not a second wave; it is the same scale times how far the body sits below
  the lens, which is the difference the variant exists for — **an inflating
  body keeps its footing and an approaching one does not.**
- **PITCH** — `sy` 0.559 to 1.143 and `dy` up to 0.141 tiles, out of one angle:
  the centre stands above the point it pivots on, so it sinks as it goes over.
  Its cosine foreshortens and its *sine* is how far the body has gone, which
  buys a small uniform 0.928–1.108 as well — a body pivoting on its base swings
  away from the lens, and that term is what stops a tip reading as a body being
  stood on. Answers CANT rather than TOLL because CANT holds its state.
- **CRAWL** — the lunge takes 32% of the cycle and the slide back 68%, so the
  reach runs 2.13× faster than the recovery, and the *rate* of the reach — not
  its extent — drives a stretch into depth. Both phases are eased at both ends:
  a linear return would step the rate at the top of the reach, and a rate that
  steps is a body that visibly jumps.

## Which of the eleven have no dimensional reading

Saying so is half the result, because the alternative is a page of fifteen
motions where four are claims and seven are noise.

- **SHIVER, TWITCH** — both are small and both are fast, and foreshortening
  needs a sustained angle to read as anything. A shiver's 0.02 tiles is under a
  pixel of scale at 26 px; a twitch in depth is one frame of scale, which is
  what a hit flash already is.
- **DRIFT** — this one *could* be done, and deliberately is not. Two slow
  incommensurate angles would tumble a body on two axes, and a body tumbling on
  two axes with no surface detail is a coin — it doubles down on the exact
  failure the light exists to prevent, with no second cue to hold it.
- **TOLL** — a pendulum swinging in depth is a pendulum whose whole travel is
  foreshortened, which is a pendulum drawn smaller. Its pitch counterpart is
  PITCH, written against CANT.
- **LURCH** — travel with a destination. In depth its destination is the
  viewer, and that is APPROACH with a trapezoid instead of a sine: the same
  sentence said twice, which is what the eleven were written to avoid.
- **HEAVE, SAG** — weight, and the vertical is the one axis a flat screen
  already shows honestly. `dy` in depth is `dy`.

## These are card motions

The nameability gate that landed as `fa0fc2a` measures drawn aspect across a
beat as its first axis, and the round three of the bestiary already sit within
a whisker of each other on it. TURN IN DEPTH moves a body's drawn aspect by a
factor of **1.82** on its own and PITCH by **1.77** — far more than the kinds
differ by — so either would swallow the axis whole if a creature carried it.

They are fine on a catalogue card at 92 px and **unproven on a creature at 26
px whose kind has to stay one word.** Anything reaching for one has to clear
the gate first, and the gate is what decides, not this page.

APPROACH is the exception worth naming: uniform scale leaves aspect at ×1.00
and spends itself on the *size* axis instead, ±19%. That is a different trade,
not a free pass — "the little one" is a thing the pair says out loud.

## Where to stand

The two halves are not currently on one surface, and knowing that saves an
evening.

- **The motions** are `MOTIONS`, rendered as one card each in the *Spare
  motions* section of the standalone page: `bun run shapes:page`, then open
  `tools/director/dist/shapes.html`. Each variant sits immediately after the
  motion it answers, on one clock. Those cards are **unlit strokes** — the
  page has no skin switcher, so this is the light-off half of the comparison.
- **The light** is on the director's SHAPES tab, `DIRECTOR_HOST=127.0.0.1 bun
  run dev`: the skin bar picks a skin and the `LIT` toggle beside it takes the
  key light off any of them, which is the light-on/light-off pair this page
  argues about. That tab draws `CATALOGUE` entries, and several of them already
  carry the TURN motion, so TURN under a fixed key light can be seen there
  today, lit and unlit.

Putting `TURN IN DEPTH` beside it under the same light is one line — a draft
entry in `tools/shape-sheet/src/drafts/` naming the new motion, or a *Spare
motions* section on the SHAPES tab itself. Until one of those exists, the
lit half of the question can be asked about TURN and not about its counterpart,
which is the one thing this page cannot answer on its own.
