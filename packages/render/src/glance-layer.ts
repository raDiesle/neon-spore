import { bakedCache } from "./baked.js";
import { type GlanceFrame, glanceSqueeze, middleShift } from "./glance.js";
import { rgba } from "./hex.js";
import { SHADOW } from "./solid-tube-light.js";

/**
 * **A glancing part laid down as one layer** (`glance.ts` has the turn).
 *
 * `drawGlanced` draws the part once for each half, each under its own clip,
 * and where the two clips meet at the middle their soft edges leave a
 * hairline: a part drawn in layers — an opaque under-fill, a translucent flesh
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

interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

const times = (p: Matrix, q: Matrix): Matrix => ({
  a: p.a * q.a + p.c * q.b,
  b: p.b * q.a + p.d * q.b,
  c: p.a * q.c + p.c * q.d,
  d: p.b * q.c + p.d * q.d,
  e: p.a * q.e + p.c * q.f + p.e,
  f: p.b * q.e + p.d * q.f + p.f,
});

function inverse(m: Matrix): Matrix {
  const det = m.a * m.d - m.b * m.c;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
}

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
    SCRATCH.set(which, scratch);
  }
  if (scratch.width < w) scratch.width = w;
  if (scratch.height < h) scratch.height = h;
  return scratch;
}

/** Half `s`'s turn and clip on `c`, over whatever transform `c` already has; saved first. */
function enterHalf(c: CanvasRenderingContext2D, f: GlanceFrame, s: -1 | 1, reach: number): void {
  const { x, y } = f;
  const k = glanceSqueeze(f, s);
  c.save();
  c.translate(x, y);
  c.rotate(f.roll);
  c.translate(-x, -y);
  c.transform(k, 0, 0, 1, x + middleShift(f) - k * x, 0);
  c.beginPath();
  c.rect(s < 0 ? x - reach : x, y - reach, reach, 2 * reach);
  c.clip();
}

/** The screen rectangle, whole pixels, that the part's square `reach` round its centre covers under `m`. */
function screenBox(ctx: CanvasRenderingContext2D, m: Matrix, f: GlanceFrame, reach: number) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [px, py] of [
    [f.x - reach, f.y - reach],
    [f.x + reach, f.y - reach],
    [f.x - reach, f.y + reach],
    [f.x + reach, f.y + reach],
  ] as const) {
    xs.push(m.a * px + m.c * py + m.e);
    ys.push(m.b * px + m.d * py + m.f);
  }
  const ox = Math.max(0, Math.floor(Math.min(...xs)));
  const oy = Math.max(0, Math.floor(Math.min(...ys)));
  const ex = Math.ceil(Math.min(ctx.canvas?.width ?? Infinity, Math.max(...xs)));
  const ey = Math.ceil(Math.min(ctx.canvas?.height ?? Infinity, Math.max(...ys)));
  return { ox, oy, w: ex - ox, h: ey - oy };
}

/**
 * `drawGlanced`'s turn, with the part `draw` draws on the context it is handed
 * laid down as one layer. `draw` is called once, and answers with the paths
 * the far half's dark is laid over.
 */
export function drawGlancedLayer(
  ctx: CanvasRenderingContext2D,
  f: GlanceFrame,
  shade: { dark: number; full: number; span?: number; reach?: number },
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const { x, r, swing } = f;
  const reach = (shade.reach ?? 4) * r;
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

  // Laid on the screen once, in the screen's own blend.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, box.ox, box.oy);
  ctx.globalAlpha = 1;
  ctx.drawImage(layer, 0, 0, box.w, box.h, 0, 0, box.w, box.h);
  ctx.restore();

  // The far half's dark, paint over it whatever the blend.
  const far = swing > 0 ? 1 : -1;
  const dark = shade.dark * Math.min(1, Math.abs(swing) / (shade.full * r));
  if (dark <= 0) return;
  enterHalf(ctx, f, far, reach);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = alpha;
  const grad = ctx.createLinearGradient(x, 0, x + far * (shade.span ?? 1) * r, 0);
  grad.addColorStop(0, rgba(SHADOW, 0));
  grad.addColorStop(1, rgba(SHADOW, dark));
  ctx.fillStyle = grad;
  for (const p of paths) ctx.fill(p);
  ctx.restore();
}
