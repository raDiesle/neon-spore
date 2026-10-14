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
 * is laid down twice, each half clipped and squeezed. The first half's clip
 * runs a pixel past the middle and the second stops on it, so the seam pixel
 * is the second half's edge over the first half's body — one picture over
 * itself, which a layer of one has nothing to show through.
 *
 * The layer is drawn with the screen's alpha and blend, and laid down with
 * the blend at full alpha, so a part drawn adding light (THE MAZE's heart)
 * still adds it and a part drawn faded still fades. The far half's dark is
 * paint whatever the blend. One scratch canvas serves every part, since parts
 * are drawn one after another; it is cleared before each and holds nothing a
 * frame needs from the last.
 */

/** How far past the middle the first half's clip runs, pixels. */
const SEAM = 1;

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
const SCRATCH = bakedCache<"layer", HTMLCanvasElement>();

/** The scratch canvas, at least `w` by `h`. */
function layerOf(w: number, h: number): HTMLCanvasElement {
  let scratch = SCRATCH.get("layer");
  if (scratch === undefined) {
    scratch = document.createElement("canvas");
    SCRATCH.set("layer", scratch);
  }
  if (scratch.width < w) scratch.width = w;
  if (scratch.height < h) scratch.height = h;
  return scratch;
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
  const { x, y, r, swing } = f;
  const reach = (shade.reach ?? 4) * r;
  const m = ctx.getTransform();
  const box = screenBox(ctx, m, f, reach);
  if (box.w <= 0 || box.h <= 0) return;
  const alpha = ctx.globalAlpha;
  const layer = layerOf(box.w, box.h);
  const g = layer.getContext("2d");
  if (g === null) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, box.w, box.h);
  g.globalAlpha = ctx.globalAlpha;
  g.globalCompositeOperation = ctx.globalCompositeOperation;
  g.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox, m.f - box.oy);
  const paths = draw(g);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";

  const back = times(inverse(m), { a: 1, b: 0, c: 0, d: 1, e: box.ox, f: box.oy });
  const far = swing > 0 ? 1 : -1;
  const dark = shade.dark * Math.min(1, Math.abs(swing) / (shade.full * r));
  for (const s of [-1, 1] as const) {
    const k = glanceSqueeze(f, s);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(f.roll);
    ctx.translate(-x, -y);
    ctx.transform(k, 0, 0, 1, x + middleShift(f) - k * x, 0);
    ctx.beginPath();
    const under = s < 0 ? SEAM / k : 0;
    ctx.rect(s < 0 ? x - reach : x, y - reach, reach + under, 2 * reach);
    ctx.clip();
    const t = ctx.getTransform();
    const n = times(t, back);
    ctx.setTransform(n.a, n.b, n.c, n.d, n.e, n.f);
    ctx.globalAlpha = 1;
    ctx.drawImage(layer, 0, 0, box.w, box.h, 0, 0, box.w, box.h);
    if (s === far && dark > 0) {
      ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(x, 0, x + s * (shade.span ?? 1) * r, 0);
      grad.addColorStop(0, rgba(SHADOW, 0));
      grad.addColorStop(1, rgba(SHADOW, dark));
      ctx.fillStyle = grad;
      for (const p of paths) ctx.fill(p);
    }
    ctx.restore();
  }
}
