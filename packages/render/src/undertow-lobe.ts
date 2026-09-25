import type { Point } from "@neon-spore/content";
import { type SimConfig, type UndertowState, undertowLastCol } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { splinePath } from "./spline.js";
import { paintBody, paintLobe } from "./undertow-flesh.js";
import { bodyHeight, bodyPass, lobeHeight, PLATE_HALF } from "./undertow-shape.js";

/**
 * THE UNDERTOW's lobes and, once, its body — the half of the boss that is
 * *above* the hull line.
 *
 * **Drawn with the field, under the ship.** Everything here comes up through
 * the plating, so its base is set half a tile below the skin and the hull
 * pass paints over it: a lobe is seen from the hull line up and nothing of
 * where it came from, which is the design's *nothing above the hull line,
 * most of the time* — and the reason this cannot be drawn with the things
 * stuck *on* the ship (`undertow-draw.ts`), where a lobe would stand on the
 * plating rather than through it.
 *
 * **Rock grey, and a colour only on the tall ones.** A lobe in a breach is
 * the one vulnerable thing in the fight and nothing can be fired at it — the
 * cannon shoots up the column and the lobe is in the column's floor
 * (`sim/undertow.ts`) — so it is `rock`, the honest grey for a thing no
 * trigger answers. What it is made of is `undertow-flesh.ts`. The tall one is the exception the design names: *the
 * ammunition colour only on the hard lobes that need the lance, so a colour
 * in the frame means "this one needs the beam" and nothing else.* Either
 * beam burns it, so it carries both, the way THE WISP does: cyan on its top
 * third and red on its bottom, which cannot be said as either.
 *
 * Nothing here is held between frames. The blow of a lobe taken is handed
 * in — how hard it still shows, and the sideways shake it puts through
 * everything of the boss still standing (`undertow-fx.ts`).
 */

/** Half a lobe's width, in tiles: a column's worth, and a little more for a tall one. */
const LOBE_HALF = 0.42;
const TALL_HALF = 0.5;
/** How far below the skin the base is set, so the hull hides where it comes from. */
const BURIED = 0.6;
/** How wide the body swells above the breach that is too narrow for it, in tiles. */
const BODY_HALF = 1.7;

export function drawUndertowLobes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  u: UndertowState,
  beat: number,
  beatPhase: number,
  time: number,
  skinY: SurfaceY,
  hurt = 0,
  shake = 0,
): void {
  for (const b of u.breaches) {
    const h = lobeHeight(cfg, u, b, beat, beatPhase);
    if (h <= 0) continue;
    const x = tileCX(l, b.col);
    drawLobe(ctx, l, x + shake, skinY(x), h, b.tall, time, b.col, hurt);
  }
  const pass = bodyPass(cfg, u, beat, beatPhase);
  if (pass < 0) return;
  // The sim clears the breaches at the swallow, so the hole the body is
  // squeezing through is the last lobe's own: a plate's width, dead centre.
  const x = tileCX(l, undertowLastCol(cfg));
  drawBody(ctx, l, x + shake, skinY(x), bodyHeight(pass), time, hurt);
}

/** One lobe: a blob standing on end, seeded per column so two are not one. */
function drawLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  skin: number,
  tiles: number,
  tall: boolean,
  time: number,
  seed: number,
  hurt: number,
): void {
  const hw = l.tile * (tall ? TALL_HALF : LOBE_HALF);
  const top = skin - tiles * l.tile;
  const base = skin + BURIED * l.tile;
  const mid = (top + base) / 2;
  const hh = (base - top) / 2;
  const pts: Point[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const m = 1 + 0.07 * Math.sin(a * 3 + seed) + 0.03 * Math.sin(time * 1.3 + a * 2 + seed);
    pts.push({ x: x + Math.cos(a) * hw * m, y: mid + Math.sin(a) * hh * m });
  }
  const path = splinePath(pts, true);
  paintLobe(ctx, path, { x, top, skin, hw, tile: l.tile }, tall);
  drawHurt(ctx, path, hurt);
}

/**
 * The body, passing through a breach narrower than it is.
 *
 * The whole boss, drawn for the first and only time: pinched to the breach's
 * width at the hull line, swelling to more than three tiles above it, and
 * rounded at the top. The pinch is the *deforming to fit* — the outline is
 * the breach's width where it crosses the skin and its own everywhere else,
 * and the spline between the two is the plating squeezing it. The ship's own
 * colour, which is the fiction: it is coming up out of whatever the ship is
 * standing on, and going back in.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  skin: number,
  tiles: number,
  time: number,
  hurt: number,
): void {
  if (tiles <= 0.05) return;
  const t = l.tile;
  const H = tiles * t;
  const pinch = PLATE_HALF * t;
  const swell = Math.min(BODY_HALF * t, H * 0.9);
  const sway = Math.sin(time * 0.9) * t * 0.04;
  const side = (s: number): Point[] => [
    { x: x + s * pinch, y: skin + BURIED * t },
    { x: x + s * pinch * 1.05, y: skin - H * 0.08 },
    { x: x + s * swell + sway, y: skin - H * 0.45 },
    { x: x + s * swell * 0.7 + sway, y: skin - H * 0.85 },
  ];
  const left = side(-1);
  const right = side(1).reverse();
  const path = splinePath([...left, { x: x + sway, y: skin - H }, ...right], true);
  paintBody(ctx, path, { x: x + sway, top: skin - H, skin, hw: swell, tile: t });
  drawHurt(ctx, path, hurt);
}
