import { bakedCache } from "./baked.js";
import { type GlanceFrame, glanceSqueeze, middleShift, turnOf } from "./glance.js";
import { halfRect, inverse, type Reach, screenBox, times } from "./glance-layer-box.js";
import { rgba } from "./hex.js";
import { SHADOW } from "./solid-tube-light.js";

/**
 * **A glancing part laid down as one layer** (`glance.ts` has the turn).
 *
 * A part drawn once for each half, each under its own clip, as the turn was
 * first drawn, leaves a hairline where the two clips' soft edges meet at the
 * middle: a part drawn in layers — an opaque under-fill, a translucent flesh
 * over it, a stroke — composites each at the seam pixel's partial cover, so
 * the under-fill shows through it. Running one clip past the other only turns
 * the line from dark to pale (`docs/queue.md`, 13 October 2026).
 *
 * So here the part is drawn **once**, into an offscreen layer at the screen's
 * own resolution and under the screen's own transform, and that one picture
 * is put together from its two halves, each clipped and squeezed, on a second
 * layer, and laid on the screen once.
 *
 * **The halves are added at half strength, then the sum doubled.** Their
 * clips are one line seen from either side, and the canvas gives a soft edge
 * complementary covers — measured, 95 and 160 of 255 for an edge 0.37 into a
 * pixel — so added, `lighter`, the seam pixel is the picture once whatever
 * its alpha. But `lighter` clamps before it weighs by the cover: an opaque
 * seam pixel came out 196 of 255. At half strength no sum reaches the clamp,
 * and the halved layer added to itself is the picture again, to within one
 * step of 255 (the halving rounds). Laid straight onto the screen, each over
 * what was there, the halves were not the picture once: two half covers left
 * a dark hairline, and a first clip run a pixel past the middle doubled the
 * picture there instead — a pale tick wherever it was translucent, THE
 * SPLICE head's rim (`docs/queue.md`, 13 October 2026). `copy`, and cutting
 * the seam out before adding, both lost to the same clamp.
 *
 * The layer is drawn with the screen's alpha and blend, and laid down with
 * the blend at full alpha, so a part drawn adding light (THE MAZE's heart)
 * still adds it and a part drawn faded still fades. The far half's dark is
 * paint whatever the blend. One pair of scratch canvases serves every part, since parts
 * are drawn one after another; it is cleared before each and holds nothing a
 * frame needs from the last.
 */

/**
 * The one scratch canvas, held as baked work so whatever empties the sprite
 * caches empties it too: a test that swaps the stub canvas for Skia's
 * (`pixel-harness.ts`) must not be handed a stub's layer to blit, which is
 * what THE INSTAR's pixel test was handed once its head was laid down here.
 */
const SCRATCH = bakedCache<"part" | "halves", HTMLCanvasElement>();

/** A scratch canvas, at least `w` by `h`: the part drawn, or its two halves put together. */
function layerOf(which: "part" | "halves", w: number, h: number): HTMLCanvasElement {
  let scratch = SCRATCH.get(which);
  if (scratch === undefined) {
    scratch = document.createElement("canvas");
    // Drawn into every frame, so a frame's cost is in it: the test stub counts
    // a `layer:` canvas's ops as the screen's (`test/canvas-stub-layer.ts`).
    scratch.id = `layer:glance-${which}`;
    SCRATCH.set(which, scratch);
  }
  if (scratch.width < w) scratch.width = w;
  if (scratch.height < h) scratch.height = h;
  return scratch;
}

/**
 * Half `s`'s turn and clip on `c`, over whatever transform `c` already has;
 * saved first. A part that nods is turned seen along its turn (`turnOf`): its
 * halves are split square to it and squeezed along it, then seen back, so
 * `c` is left in the part's own frame either way.
 */
function enterHalf(c: CanvasRenderingContext2D, f: GlanceFrame, s: -1 | 1, reach: Reach): void {
  const { x, y } = f;
  const { angle, along } = turnOf(f);
  const k = glanceSqueeze(along, s);
  c.save();
  c.translate(x, y);
  c.rotate(f.roll + angle);
  c.translate(-x, -y);
  c.transform(k, 0, 0, 1, x + middleShift(along) - k * x, 0);
  c.beginPath();
  c.rect(...halfRect(f, s, reach));
  c.clip();
  if (angle === 0) return;
  // Seen back: the transform `squeeze ∘ rotate(-angle)` the content is drawn under.
  c.translate(x, y);
  c.rotate(-angle);
  c.translate(-x, -y);
}

/**
 * The far half's dark on `c`, under the turn and clip `enterHalf` gives it, in
 * the blend `blend` sets, over what `paint` fills.
 */
function farDark(
  c: CanvasRenderingContext2D,
  f: GlanceFrame,
  far: -1 | 1,
  reach: Reach,
  ramp: { dark: number; span: number },
  blend: (c: CanvasRenderingContext2D) => void,
  paint: (c: CanvasRenderingContext2D) => void,
): void {
  enterHalf(c, f, far, reach);
  blend(c);
  // Along the turn: across, for a part that does not nod, exactly as it always was.
  const { angle } = turnOf(f);
  const run = far * ramp.span * f.r;
  const grad =
    angle === 0
      ? c.createLinearGradient(f.x, 0, f.x + run, 0)
      : c.createLinearGradient(f.x, f.y, f.x + run * Math.cos(angle), f.y + run * Math.sin(angle));
  grad.addColorStop(0, rgba(SHADOW, 0));
  grad.addColorStop(1, rgba(SHADOW, ramp.dark));
  c.fillStyle = grad;
  paint(c);
  c.restore();
}

/**
 * A rectangle the far half's clip lies within in the part's own frame: the
 * half itself, or, seen back from along a nod, the whole turned square.
 */
function wholeRect(f: GlanceFrame, reach: Reach, angle: number) {
  if (angle === 0) return halfRect(f, f.swing > 0 ? 1 : -1, reach);
  const w = Math.SQRT2 * reach.side;
  return [f.x - w, f.y - w, 2 * w, 2 * w] as const;
}

/**
 * The turn `glance.ts` describes, with the part `draw` draws on the context it is handed
 * laid down as one layer. `draw` is called once, and answers with the paths
 * the far half's dark is laid over. **`atop`** is for a part with no such
 * path — a living body, drawn by a dozen calls — and lays the dark on the
 * layer itself, `source-atop`, so it falls only where the part was drawn and
 * never as a disc past a blob's edge (`creature-glance.ts`). **`reach`** is how
 * far the part is drawn from its centre, in radii, and **`up`** how far above
 * it, where that is further: a living body's plume (`creature-detail.ts`).
 */
export function drawGlancedLayer(
  ctx: CanvasRenderingContext2D,
  f: GlanceFrame,
  shade: { dark: number; full: number; span?: number; reach?: number; up?: number; atop?: boolean },
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const { r } = f;
  const { angle, along } = turnOf(f);
  const far = along.swing > 0 ? 1 : -1;
  const dark = shade.dark * Math.min(1, Math.abs(along.swing) / (shade.full * r));
  const ramp = { dark, span: shade.span ?? 1 };
  const side = (shade.reach ?? 4) * r;
  const up = Math.max(side, (shade.up ?? 0) * r);
  // Seen along a nod, the halves' clip is square to the turn, so it reaches as far every way.
  const reach: Reach = angle === 0 ? { side, up, down: side } : { side: up, up, down: up };
  const m = ctx.getTransform();
  const box = screenBox(ctx, m, f, reach);
  if (box.w <= 0 || box.h <= 0) return;
  const alpha = ctx.globalAlpha;
  const layer = layerOf("part", box.w, box.h);
  const halves = layerOf("halves", box.w, box.h);
  const g = layer.getContext("2d");
  const h = halves.getContext("2d");
  if (g === null || h === null) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, box.w, box.h);
  g.globalAlpha = ctx.globalAlpha;
  g.globalCompositeOperation = ctx.globalCompositeOperation;
  g.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox, m.f - box.oy);
  const paths = draw(g);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";

  // The two halves, put together on their own layer in the same box.
  const back = times(inverse(m), { a: 1, b: 0, c: 0, d: 1, e: box.ox, f: box.oy });
  h.setTransform(1, 0, 0, 1, 0, 0);
  h.clearRect(0, 0, box.w, box.h);
  h.globalAlpha = 0.5;
  h.globalCompositeOperation = "lighter";
  for (const s of [-1, 1] as const) {
    h.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox, m.f - box.oy);
    enterHalf(h, f, s, reach);
    const n = times(h.getTransform(), back);
    h.setTransform(n.a, n.b, n.c, n.d, n.e, n.f);
    h.drawImage(layer, 0, 0, box.w, box.h, 0, 0, box.w, box.h);
    h.restore();
  }
  h.globalAlpha = 1;
  h.globalCompositeOperation = "source-over";

  // Doubled back to full strength on the first layer, which is done with.
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, box.w, box.h);
  g.globalCompositeOperation = "lighter";
  g.drawImage(halves, 0, 0, box.w, box.h, 0, 0, box.w, box.h);
  g.drawImage(halves, 0, 0, box.w, box.h, 0, 0, box.w, box.h);
  g.globalCompositeOperation = "source-over";
  if (shade.atop === true && dark > 0) {
    g.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox, m.f - box.oy);
    const atop = (c: CanvasRenderingContext2D) => {
      c.globalCompositeOperation = "source-atop";
    };
    farDark(g, f, far, reach, ramp, atop, (c) => c.fillRect(...wholeRect(f, reach, angle)));
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Laid on the screen once, in the screen's own blend.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, box.ox, box.oy);
  ctx.globalAlpha = 1;
  ctx.drawImage(layer, 0, 0, box.w, box.h, 0, 0, box.w, box.h);
  ctx.restore();

  // The far half's dark, paint over it whatever the blend.
  if (dark <= 0 || shade.atop === true) return;
  const over = (c: CanvasRenderingContext2D) => {
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = alpha;
  };
  farDark(ctx, f, far, reach, ramp, over, (c) => {
    for (const p of paths) c.fill(p);
  });
}
