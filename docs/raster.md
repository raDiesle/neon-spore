# Baked pictures: sprite atlases, APNG and animated WebP

> **Short answer: yes, and one of the three is not what it looks like.**
> A baked frame-by-frame animation is worth having in this game, and the
> machinery for making one now exists. But of the three ways to ship one, only
> the **sprite atlas** may touch the field. APNG and animated WebP are played
> by the browser against a clock the frame loop cannot see, and this game is
> two phones that have to agree. They earn their place on pages, not on the
> field.

## What was asked, and what the question was standing on

The framework this started from was written for a game whose primary visual
language is **SVG + CSS**, and it is a good framework for that game. It is not
this one. Neon Spore's field is a single `<canvas>` drawn by
`packages/render`, top to bottom, every frame: no DOM nodes per creature, no
CSS animation, no SVG anywhere the player can see. SVG in this repository is a
*tool* format — the shape sheets, the director's figures — and it stops at the
edge of the game.

That changes two of the framework's answers and leaves the rest standing.

- **"SVG + CSS versus Canvas" is not a live question here.** It was decided
  before this file existed. Everything organic, every lobe, every blob and
  every glow is already procedural Canvas 2D, which is the row the framework
  would have recommended anyway for a field with dozens of moving things on a
  phone.
- **The interesting boundary is elsewhere**: between *procedural* — code that
  computes a picture every frame — and *baked* — pixels an artist or a
  generator settled once, that the game only blits. That is the boundary this
  document is about, and it is the one thing the game genuinely did not have.

Everything else in the framework survives contact with this repo, and most of
it is repeated below in the terms that actually apply.

## The one rule that decides everything

> **A baked animation may be played by a clock only when nothing has to agree
> with it.**

Neon Spore is two devices in lockstep. `CLAUDE.md`'s rules 2 and 3 exist for
one reason: two phones must never disagree about what happened. The simulation
is driven by a tick counter and nothing else.

Rendering is looser — `packages/render` may hold transient state and step it by
real `dt`, and the sparks have always done exactly that. A spark that is two
frames further along on one phone than the other is nothing, because no player
can point at it and no rule reads it back.

But there is a difference between *loose* and *out of our hands*:

| | who chooses the frame |
|---|---|
| Sprite atlas (`<img>`/`ImageBitmap` + `drawImage`) | **we do** — `frame = floor(age / frameMs)`, from the same `dt` every other effect gets |
| APNG in an `<img>` | the browser, from the wall clock, whether or not the tab is drawing |
| Animated WebP in an `<img>` | the browser, same |
| APNG/WebP via `ImageDecoder` (WebCodecs) | we do — but only where WebCodecs exists, and only in a secure context |

So the field uses an atlas. It is not a compromise: it is strictly more
control for strictly fewer bytes, and it composites like anything else the
renderer draws — `globalCompositeOperation = "lighter"`, a size in field
pixels, a position that comes from `Layout`. An `<img>` playing an APNG can do
none of that without being drawn into the canvas anyway, at which point it is
an atlas with a worse decoder in front of it.

**Where APNG and animated WebP do win** is everywhere the game is not: the
director's pages, a briefing screen, a menu, a card in a sheet, anything sat
in the DOM where "the browser plays it" is the feature rather than the
problem. One `<img src>` and it animates, with no loop, no `dt`, no code.

## What now exists

| | |
|---|---|
| `tools/raster/src/png.ts` | PNG chunk reading and writing, and the CRC |
| `tools/raster/src/apng.ts` | `encodeApng` — an APNG assembled from still PNGs |
| `tools/raster/src/webp.ts` | `encodeAnimatedWebp` — the same for RIFF/WebP |
| `tools/raster/src/burst-art.ts` | the burst itself, drawn once, offline |
| `tools/raster/src/render.ts` | draws the frames in a headless Chromium |
| `bun run raster` | regenerates everything under `assets/raster/` |
| `bun run raster:verify` | opens the results in Chromium and checks they decode |
| `packages/render/src/sprite-burst.ts` | `SpriteBursts` — the tick-driven atlas player |
| `packages/render/src/raster-caps.ts` | what the browser in front of us can do |
| `packages/render/src/raster-load.ts` | `loadAtlas`, preferring `createImageBitmap` |

**No dependency was added.** Both encoders are container arithmetic: an APNG
is a PNG with three more chunk types, an animated WebP is a RIFF file with an
`ANIM` and a stack of `ANMF`. The pixels are compressed by a browser that
already ships both codecs, which is also the browser the game draws in — so
the encoder is never answering a question about some other rasteriser.

### What it costs, measured

The burst is 16 frames of 96 px, generated on 31 August 2026:

| file | bytes | what it is for |
|---|---|---|
| `burst-strip.webp` | 94 kB | the atlas the game draws — 16 frames side by side |
| `burst.webp` | 98 kB | the same frames, animated, for an `<img>` |
| `burst.apng` | 230 kB | the same again, lossless — the master, and the widest support |

A lossless PNG atlas was 383 kB at 128 px and is not committed: at this size
PNG is four times the bytes of WebP for a soft glow nobody can tell apart, and
the APNG built from the same frames is already the lossless master. Dropping
the frame from 128 px to 96 px halved everything again.

For scale: the whole game bundle is smaller than the APNG. **One baked effect
is not free, and four of them are a download.** That is the real budget
question, and it is why the rules below spend the format on the things that
cannot be computed rather than on the things that merely could be drawn.

### Two things that cost an hour, written down so they cost nobody else one

**`ImageDecoder` needs a secure context.** WebCodecs is not exposed on
`about:blank`, so a headless check that loads a page with `setContent` reports
"this browser has no ImageDecoder" about a browser that has had it for years.
`bun run raster:verify` serves the assets over `127.0.0.1` for that reason —
localhost is a secure context — and gets the frame count out of the real
decoder, which is what proves an APNG's sequence numbers are right.

**A capability is tested by decoding, never by a user-agent string.** The two
probes in `packages/render/src/raster-probe.ts` are generated by the same
encoder as the real assets and are under 400 bytes together. The APNG one is
1×2 pixels: opaque in both as a still, transparent in the lower one as an
animation, so one alpha value separates a decoder that animates from one that
does not. WebP has no still fallback inside the file at all, so for that one,
loading *is* the test.

## The rules

1. **If the effect is geometry and transforms, it stays procedural.** A ring
   that expands, a body that breathes, a shape that swells — these are three
   lines of Canvas 2D, recolour for free, scale to any screen and cost nothing
   to change. Baking one is a loss on every axis.
2. **If the effect is hundreds of independent small things, it stays
   procedural.** Sparks are already this, and a sprite per spark would be
   worse: the atlas draw is one blit per *effect*, not per particle.
3. **If every frame contains intentionally different painted pixels, bake
   it.** That is the actual test for "painterly", below.
4. **If the identity of the animation is in its timing and its silhouette
   changing frame to frame, bake it.** Twenty-six spikes at irregular angles,
   each with its own length and its own fade, is a picture; the code that
   generates it is not more editable than the picture, it is only longer.
5. **A baked effect that the simulation triggers is an atlas.** Always. The
   frame number has to be ours.
6. **A baked effect that nothing has to agree with may be an APNG or an
   animated WebP** — a page, a card, a menu, a briefing.
7. **Recolouring is the axis that decides more than size does.** A procedural
   effect takes a hex and is a different colour. A baked one is the colour it
   was painted, and a red version of a violet burst is a second file — or a
   `globalCompositeOperation` trick that only works on some of them. Anything
   that must follow the red/cyan colour rule of this game stays procedural
   unless somebody is prepared to ship both.
8. **Anything baked is a *look*, so it is offered and never swapped in.**
   `CLAUDE.md`'s *A look is offered, never replaced*. The burst is behind
   `?raster=1` in the game and on the director's RASTER page for exactly this
   reason.

### What "very organic, painterly" actually means

It is not a synonym for "pretty" and it is not decided by taste. An effect is
painterly, in the sense that makes baking the right answer, when **the
information in it is in the pixels rather than in the parameters**:

- its edges are irregular in a way no single distance function describes —
  soft here, hard three pixels along, feathered on one side only;
- its interior carries value that does not fall off from a centre — hot
  pockets, dark veins, a bloom that is off-axis because it looks better that
  way;
- it has *grain*: texture that reads as material rather than as a gradient;
- and its frames are not the same picture at different sizes.

In this game the honest candidates are: an ink-like bloom when something
biological ruptures; a plasma dissolve as a lure goes out; hand-painted smoke
off a rock that landed; a translucent fluid sheeting off THE MIRROR; the
grotesque half-second where a queen's petal tears rather than detaches; a
boss's first appearance, once, drawn as a picture instead of assembled from
lobes; a bioluminescent flare with a genuinely painted falloff. That is
roughly the whole list, and it is short on purpose.

Everything else in this game is **not** painterly, however organic it looks: a
lobed contour is a parameterised curve, a halo is three passes of the same
gradient, a shockwave is a stroked circle with a width. Those read as organic
because the *shapes* are organic — which is a property of `blobPath`, not of
any pixel.

### What "complex hand-drawn frame-by-frame" means

An animation qualifies when the frames are not derivable from one another: the
silhouette changes deliberately rather than by transform, there are smears
that exist only to sell speed, the timing is uneven because a hand chose the
holds, and a frame carries detail that is in no other frame. A creature
bursting apart qualifies. A creature *pulsing* does not, however many
gradients are in it.

## The table

`P` = procedural Canvas 2D (what the game does today) · `A` = sprite atlas ·
`D` = APNG or animated WebP in the DOM · `C` = canvas particles.

| Effect | Format | Alternative | Why |
|---|---|---|---|
| Creature body, lobes, contour | P | — | one `blobPath`, recolours, scales, is the game's whole vocabulary |
| Hull, cannon, fire opening | P | — | it deforms every frame against live state |
| Shield swell and rim | P | — | eased against `armed`, no two frames alike for reasons the sim owns |
| Breathing / idle pulse | P | — | a sine on a radius |
| Expanding shockwave ring | P | A | a stroked arc; bake only if the ring is painted rather than drawn |
| Spark burst on a hit | C | — | dozens of independent points, already there |
| Pod taken (sparks inward) | C | — | same, and the direction is the mechanic |
| Cannon shot / bullet | P | — | a moving shape, recoloured red or cyan by the rule |
| Muzzle flare | P | A | tiny, brief, and it must take the shot's colour |
| Creature destroyed — the burst | **A** | P | painted spikes and bloom, one blit, ours to time; **this is the one built** |
| Boss death | A | D | worth a painted one-off; the field means atlas |
| Rock impact crater dust | C | A | many particles, and it inherits the rock's grey |
| Deflection flash | P | — | must read instantly and must be shield-coloured |
| Lure folding to a point | P | A | a curve collapsing; bake if it becomes a painted dissolve |
| Queen losing a petal | P | A | the tear is a candidate for a painted half-second |
| Plasma dissolve | A | D | painterly by the test above |
| Ink-bloom rupture | A | D | painterly |
| Hand-painted smoke | A | D | painterly, and no parameters describe it |
| Powerup / pickup aura | A | P | soft, painted, and it repeats — a good first atlas |
| Powerup collection | A | C | short, showy, one blit |
| Backdrop stars, drift | P | — | procedural, seeded, effectively free |
| Light shafts, key light | P | — | already gradients; baking would fix the angle |
| Grid and beat lines | P | — | geometry |
| HUD gauge, dials | P | — | they display numbers |
| Banner text | P | — | text |
| Wave intro / briefing art | D | A | DOM, nothing to agree with, `<img src>` and done |
| Menu ornament | D | P | same |
| Director page demo | D | A | the browser playing it *is* the demo |
| Loading / connecting spinner | D | P | one tag, no loop |
| Bestiary card motion | D | A | a page, not a field |
| Transition wipe between waves | P | A | a shape moving; bake only if painted |
| Damage vignette | P | — | one gradient over the frame |
| Charge-up glow on the cannon | P | A | it has to track a live 0..1 |
| Alien mutation / transform | A | D | frame-by-frame by definition |
| Boss entrance, once per game | D | A | if it can be a full-screen DOM moment, it should be |

## How many at once

The number that matters is not the format, it is **what is per-thing**.

- **Procedural, per particle**: a spark costs a `fillRect`. Hundreds are fine;
  thousands are not, and the answer at that point is fewer particles rather
  than a different format.
- **Atlas, per effect**: one `drawImage` regardless of what is painted in the
  frame. Ten simultaneous bursts are ten blits — nothing, on any phone made
  this decade. This is the format's real advantage and it is not the file
  size.
- **DOM, per element**: an `<img>` playing an APNG is a compositor layer and a
  decode loop. One or two on a page is free. Fifty is a slideshow, and fifty
  on top of a running canvas is a dropped frame every time one of them ticks.
  This alone would settle the field question if determinism had not already.

Memory, though, does scale with the atlas: 16 frames of 96 px is 590 kB
decoded, whatever the file was. Four atlases is a phone's texture budget being
spent on one effect each, and the fix is fewer frames — a burst reads at 12 as
well as at 16 — not a smaller file.

## Using it

```bash
bun run raster          # regenerate assets/raster/ from the generator
bun run raster:verify   # open them in Chromium; check every frame decodes
```

In the game, `?raster=1` fetches and installs the atlas; without the flag
nothing is fetched at all. In the renderer:

```ts
renderer.sprites.install(await loadAtlas(url));   // the host decides
```

`Effects` hangs it on the `destroy` event — a cannon shot that killed what it
hit — beside the sparks that already shipped, not instead of them. Everything
transient is cleared by `Effects.reset()` on a wave restart, which
`packages/render/test/restart.test.ts` enforces.

The director's RASTER tab opens on **PLAY IT**: the shipping renderer against
a real `World`, at the real tick rate, answering a finger through the same
`touch.ts` the phone calls — a wave picker, a restart, and a switch that puts
the baked burst in and out live. That switch is the whole point of the
section. A burst on a 300 px card with nothing else moving always looks good;
the question is whether it reads at 26 px objects, over a hull, under a HUD,
at tempo, while a rock is falling. `docs/decisions.md` #24 asks for
alternatives that are comparable at once, and a toggle over a field that keeps
running is as close as one phone-shaped rectangle gets.

**What is still open** is the only thing a sandbox cannot answer: whether the
burst *reads*, and whether it is better than the sparks it sits on top of.
What the sandbox can say is that the chain works — a shot fired through that
panel's own handle killed a creature and the frame that followed carried the
burst, 821 near-white pixels against 181 with the switch off. What it cannot
say is that a violet burst belongs on a red creature. That is the owner's
call, on the RASTER tab or in the game at `?raster=1`.
