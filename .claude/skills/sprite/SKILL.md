---
name: sprite
description: Author a sprite baked at load in Neon Spore — detail painted once by our own code onto an offscreen canvas and blitted after, so it ships no picture and a frame pays one drawImage. The two grey layers, the size key, frames versus transforms, when a shipped WebP is the answer instead, and the `bun run sprite` loop that shows the sheet and prints its bytes and draw cost. Use when asked for more detail on a body, a sprite, a texture, an atlas, or a picture that would be too costly to draw every frame.
---

# A sprite baked at load

The owner's constraints, 26 September 2026: detail may be richer, but **our
own code draws it** (no graphics library, no engine), and **battery, frame
cost and bundle bytes all count**. So detail that would be an image is
**baked, not shipped**: painted once at load by a function, cached, blitted.
The helper is `packages/render/src/sprite-bake.ts`; the examples are THE
INSTAR's egg (`instar-egg-baked.ts`) and nests (`instar-nest-baked.ts`).

## The shape of one

A `SpriteSpec` is a name, a frame count, an aspect, and two painters, each
called once per frame into a `w × h` box at the origin:

- **`body`** in greys — white takes the base colour fully, black is ink. It
  is *multiplied* by the base colour.
- **`light`** in white with alpha as strength — glow, rim, specular, dew. It is
  *added* in the glow colour.

`tintedSprite(spec, px, base, glow)` composes the pair once per colour pair.
One painting serves every colour (`docs/raster.md` rule 7). Nothing reads
pixels back; the tint is composite operations the test stub can count.

## Rules

1. **The key is `spritePx(cssHeight, dpr)`, nothing else.** It rounds device
   pixels up to 8, so a body growing through its flight-in does not bake every
   size it passes (`baked-growth.test.ts`). Never key on time, threat or fade.
2. **Frames are poses; motion is the transform.** A few frames — a stir, a
   crack, a turn — chosen by state. Shiver, tilt, tumble, fade are
   `blitFrame`'s `rot` and `alpha`. Never a frame per tick.
3. **What moves with time stays procedural on top** — a crack that opens, a
   flicker — drawn after the blit (`drawEggCrack` over the baked egg).
4. **Scatter comes from `spriteRng(seed)`**, so the same sprite paints the same
   every load and the sheet is comparable run to run.
5. **Glow is layered strokes, never `shadowBlur`** — in the bake too, because
   the bake happens on the player's phone.
6. **Two colours in one picture is two sprites, or one procedural part** —
   the nest's slime stays an ellipse because it is venom and the silk is text.
7. **Front and back are two frames** when something sits inside the sprite:
   the nest blits frame 0, draws its eggs, blits frame 1.
8. **A baked sprite is a look.** It is offered beside the shipped drawing,
   never swapped in unattended (`CLAUDE.md`, *A look is offered*). Put it to
   the owner with the sheet.

## When to ship a picture instead

Only when no painter can make it — a photographed texture, a hand-drawn
frame. Then a few frames in one lossy WebP loaded with its wave, grey and
tinted the same way (`docs/raster.md`). `bun run sprite` prints what each
baked sprite would weigh as PNG and WebP, which is the bytes painting saves.

## The loop

```
bun run sprite                  # every sprite: strips, shipped vs baked, ×zoom, costs
bun run sprite instar-egg       # one
```

A new sprite is one entry in `tools/raster/src/sprite-demos.ts` (spec, colours,
play height, states, box, a shipped and a baked draw) and one row in
`tools/raster/sprite.ts`'s `BYTES` (the modules and exports to weigh). It
prints, per sprite: **code** added to the bundle, minified and gzipped;
**bake** ms once; **as picture** PNG and WebP; **per draw** canvas calls and
µs, shipped and baked. The µs come from headless Chromium's software canvas —
read the ratio, not the figure; the calls are exact.

Every part baked so far, with its bytes and calls shipped against baked, is in
`baked-parts.md` beside this file; add a row there for a new one.

Then: draw it in a test through the stub (`packages/render/test/sprite-bake.test.ts`),
and send the owner the sheet as PNG.
