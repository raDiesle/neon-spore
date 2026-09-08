---
name: depth
description: Make a flat asset read as solid in Neon Spore — the pose-versus-place rule, the projection to call rather than re-derive, the two cues a squash cannot fake, and how to add shading that costs no frames. Use when asked to make something look three-dimensional, rounder, more solid or less flat; when writing a light, a shadow, a highlight or a turn; when a body should reveal what was behind it; or when adding any shading to packages/render.
---

# A flat asset that reads as solid

The direction is the owner's, named on 8 September 2026: the graphics should
look three-dimensional while staying 2D, and a flying body should turn just
enough that *what was behind it comes into view*. `docs/style-guide.md`'s
**Depth** section is the rule and `docs/dimensional.md` is the measurement.
This is how it is carried out.

## The one rule

> **A body's silhouette is posed; its surface is placed.**

The contour may be squashed and leaned by an affine — `{ dx, dy, rot, sx, sy }`.
Anything *on* the surface — a pore, a vein, a crater, a mark, a lit seam — is
positioned by longitude and latitude, so a slow turn carries the far ones round
into view and the near ones away.

**The two halves are reachable by different machinery, and mixing them up is
the whole failure.** An `sx` cosine with no shading is a coin being flipped or a
body being squeezed; a beautifully lit ball that does not move is a still life.
Each half looks like a failure on its own, which is why `KEY` is a constant and
never a parameter, and why the two are judged on one page.

**No pose can ever bring anything out from behind.** An affine scales the
picture about one centre, so every painted mark moves at nearly one rate — 1.10
: 1 measured, against 22.9 : 1 for a real turn. That is the absence of an
asymmetry, not a weak one, and no amount of tuning a pose produces a reveal.

## Call the projection, never write one

`packages/content/src/surface.ts` is the arithmetic, and it is in `content`
because the director's skins and the game's renderer both read it and may not
reach each other.

| You want | Call |
|---|---|
| a feature at a longitude and latitude | `pin(lon, lat, reach)` once, then `facet(pin, theta)` per frame |
| how much light it takes | `surfaceLit(cosLat, sinLat, sinA, cosA)` |
| its floor in full shadow | `surfaceDim(dim, lit)` |
| an outline spanning more than one tangent plane | `limbX(k, sinA, cosA)` — folds a far vertex onto the limb |
| how near a pole a mark may sit | `LAT_LIMIT` |

`facet` gives you `x`, `y`, `sx`, `sy`, `near` and `lit`. **Draw the feature
about its own origin and let `scale(sx, sy)` foreshorten it** — that is the
tangent plane's own map, so it is right for a feature of any shape and not only
for a dot. Lay features out in picture coordinates and squash the picture
instead and you get half of it, which reads as a sticker shrinking.

On SVG, `tools/director/src/skins/mounted.ts` hangs elements on this with no
allocation per frame (`mount`/`spin`, and `mountPlate`/`spinPlates` for an
outline too large for one plane). On canvas, `packages/render/src/key-light.ts`
is the shipped light and `hull-light.ts` is the seam a second one goes through.

## Numbers before pictures

`.claude/skills/svg-look` says it for stills and it is the same here: the cheap
checks come first, and most of what goes wrong is visible in them.

```bash
bun run shapes:report   # geometry as text — extents, lobes, where a contour sits
bun run shapes:cues     # motion as text — aspect, periods, asymmetry, reveal
```

`shapes:cues` prints the three cues that decide whether something reads as depth
or as a coin, and its last row is the same eight marks *placed* rather than
posed — the reference every row above it is read against.

- **Two periods.** A body turning about an axis it does not stand on repeats its
  width twice per revolution and its sideways swing once. A squash has one
  period and no travel and cannot produce this at any setting.
- **An asymmetric cycle.** Foreshortening is a cosine of angle *plus lens*, so
  going away and coming toward are not mirror images. A lean is symmetric by
  construction and says nothing.
- **A reveal.** 0 for every pose there can ever be. It is the one cue that is a
  difference in kind rather than of degree.

`tools/shape-sheet/test/depth-cues.test.ts` holds the documents to these
figures, so a motion that stops turning fails a test rather than a review.

## Where depth is proven, and where it is dangerous

**On a card at 92 px it reads.** The four dimensional motions — `TURN IN
DEPTH`, `APPROACH`, `PITCH`, `CRAWL` — were drawn, measured and kept.

**On a 26 px creature it is unproven.** The nameability gate's first axis is
drawn aspect across a beat, and the round kinds already sit within a whisker of
each other on it. TURN IN DEPTH moves drawn aspect by ×1.82 and PITCH by ×1.77,
either of which swallows the axis whole. `APPROACH` is the one exception worth
naming — uniform scale leaves aspect at ×1.00 and spends itself on size, ±19% —
and that is a different trade rather than a free pass, because *the little one*
is a thing the pair says out loud.

**The big bodies are where this is cheap and safe**: the hull, a boss, a rock,
anything drawn large enough that a foreshortened mark is more than a pixel.

## Depth that costs no frames

The reason a session under-draws shading is a fear of the frame cost, and here
that fear is usually misplaced: **compute the expensive thing once into a
sprite or a gradient, key it on values you have quantised, and blit it.** The
pattern is already everywhere — `glow.ts` keys a halo on `${colour}@${radius}`,
`key-light.ts` rounds a radius to four pixels and a spin to a twenty-fourth,
`sheen.ts` rounds its bloom radius, `depth.ts` quantises its haze into six
steps. Register the map with `bakedCache()` so a test can empty it.

**The one way it goes wrong is a key that moves.** A radius that is not
rounded, a spin that is not stepped, a colour mixed continuously with a
distance: the cache never hits, bakes a canvas every frame *and keeps all of
them*. `frame-budget.test.ts` cannot see it, because a cache that misses costs
exactly what no cache costs — `packages/render/test/baked-growth.test.ts` is
what watches it, by counting what is held after four hundred frames.

Never `shadowBlur`: it costs frames on a mobile GPU and heats the phone. Glow is
layered strokes plus a pre-rendered additive halo.

## A shadow is cool, and a body has five zones

`tools/director/src/skins/light.ts` has them under their own names —
`terminatorPass`, `contactPass`, `specularPass`, `rimLightPass`, and the
reflected light as the last stop inside the terminator's gradient. `litPass` is
all five in the order that works. **Compose them and say in the file which one
you left out and why.** Six stops, not three, with
`color-interpolation="linearRGB"`. A shadow is `#0B1024` and never black.
Nothing casts a shadow onto anything else — that was built, looked at and taken
out, and `spec/graphics.md` says why.

## The house rule still holds

A rounder version of something already drawn is an **alternative**, not a
replacement: `tools/versus/candidates/`, beside the shipped look, and the owner
decides by looking. `ship:light` / `barrel` is the worked example — a record for
the seam, a candidate for the answer, and the shipped pass untouched. The three
exemptions in `CLAUDE.md` apply unchanged.
