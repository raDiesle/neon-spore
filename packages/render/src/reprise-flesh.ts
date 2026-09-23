import type { Point } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splineSealed } from "./spline.js";

/**
 * **What THE REPRISE's tear is made of** (`new-boss-more` §6.3): a wound in
 * the field's top edge rather than a line with a grey shape under it.
 *
 * The torn edge is a lip with body, thick where it was torn least and thinned
 * to nothing at the flared tips, and ragged along its underside where it gave.
 * The mass it holds open has depth: dark as the space behind the field where
 * it comes through, the mechanism's own grey only where it bulges out below,
 * and a film of gloss on the lower curve where a light from the upper left
 * finds it. The count hangs from the lip as fangs, each one a tapered tooth
 * with a lit side and a shaded one.
 *
 * **Everything `reprise-draw.ts` says about colour and column still holds.**
 * Nothing here is a body's colour — the violet is only the dark of the
 * throat, the one the whole field is drawn on — nothing moves sideways, and
 * nothing is a mark an eye could count beside the teeth: the rag on the lip is
 * under a quarter of a tile and keeps to its outer thirds. **Every width is
 * off the tile.**
 */

/** How thick the lip is where it is thickest, in tiles. */
const LIP = 0.18;

/** The lip under the tear's own stroke: a band from `tear` down, tapered to
 * the tips and ragged on its underside. */
export function drawTearLip(
  ctx: CanvasRenderingContext2D,
  tear: readonly Point[],
  px: number,
  tile: number,
  open: boolean,
): void {
  const first = tear[0];
  const last = tear[tear.length - 1];
  if (!first || !last) return;
  const span = last.x - px;
  const thick = tile * LIP * (open ? 1 : 0.6);
  const under: Point[] = [];
  const N = 14;
  for (let i = N - 1; i >= 1; i--) {
    const x = first.x + ((last.x - first.x) * i) / N;
    const from = Math.abs(x - px) / span;
    // Ragged only out past the teeth, so the rag is never a mark among them.
    const rag = from > 0.45 ? 1 + 0.5 * Math.sin(i * 2.9) : 1;
    under.push({ x, y: topAt(tear, x) + thick * (1 - from * from) * rag });
  }
  const lip = splineSealed([...tear, ...under]);
  const g = ctx.createLinearGradient(0, first.y, 0, topAt(tear, px) + thick);
  g.addColorStop(0, rgba(PALETTE.rock, 0.55));
  g.addColorStop(1, rgba(PALETTE.rockDark, 0.95));
  ctx.fillStyle = g;
  ctx.fill(lip);
}

/** The tear's y at `x`, straight between its points: close enough to the
 * spline through them for the underside of a band a tenth of a tile thick. */
function topAt(tear: readonly Point[], x: number): number {
  for (let i = 1; i < tear.length; i++) {
    const a = tear[i - 1];
    const b = tear[i];
    if (!a || !b || x > b.x) continue;
    const f = b.x === a.x ? 0 : (x - a.x) / (b.x - a.x);
    return a.y + (b.y - a.y) * f;
  }
  return tear[tear.length - 1]?.y ?? 0;
}

/** The mass in the opening: the mechanism's grey, sunk to the field's dark
 * where it comes through the tear, and glossed along its lower curve. */
export function drawTearMass(
  ctx: CanvasRenderingContext2D,
  mouth: Path2D,
  px: number,
  y0: number,
  w: number,
  deep: number,
): void {
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(mouth);
  const throat = ctx.createLinearGradient(0, y0, 0, y0 + deep);
  throat.addColorStop(0, rgba(PALETTE.sheenDeep, 1));
  throat.addColorStop(0.45, rgba(PALETTE.sheenDeep, 0.75));
  throat.addColorStop(1, rgba(PALETTE.sheenDeep, 0));
  ctx.fillStyle = throat;
  ctx.fill(mouth);
  ctx.clip(mouth);
  // The film: soft bands along the lower-left of the curve, brightest at
  // their middle, the way `well-flesh.ts` lays its film on the far wall.
  ctx.lineCap = "round";
  for (const [from, to, alpha, width] of [
    [0.52, 0.82, 0.06, 0.26],
    [0.58, 0.76, 0.1, 0.12],
  ] as const) {
    ctx.strokeStyle = rgba(PALETTE.sheenRim, alpha);
    ctx.lineWidth = Math.max(1, deep * width);
    ctx.beginPath();
    ctx.ellipse(px, y0, w * 0.8, deep * 0.78, 0, Math.PI * from, Math.PI * to);
    ctx.stroke();
  }
  ctx.restore();
}

/** One tooth of the count: wide at its root in the lip, pointed at `tipY`, lit
 * down its left side and shaded down its right. `a` dims it on its way out. */
export function drawFang(
  ctx: CanvasRenderingContext2D,
  x: number,
  rootY: number,
  tipY: number,
  half: number,
  a: number,
): void {
  const fang = new Path2D();
  fang.moveTo(x - half, rootY);
  fang.quadraticCurveTo(x - half * 0.7, (rootY + tipY) / 2, x, tipY);
  fang.quadraticCurveTo(x + half * 0.7, (rootY + tipY) / 2, x + half, rootY);
  fang.closePath();
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = PALETTE.rock;
  ctx.fill(fang);
  const shade = new Path2D();
  shade.moveTo(x + half * 0.15, rootY);
  shade.quadraticCurveTo(x + half * 0.2, (rootY + tipY) / 2, x, tipY);
  shade.quadraticCurveTo(x + half * 0.7, (rootY + tipY) / 2, x + half, rootY);
  shade.closePath();
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.55);
  ctx.fill(shade);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.7);
  ctx.lineWidth = Math.max(0.6, half * 0.22);
  ctx.beginPath();
  ctx.moveTo(x - half * 0.55, rootY + (tipY - rootY) * 0.1);
  ctx.quadraticCurveTo(
    x - half * 0.45,
    (rootY + tipY) / 2,
    x - half * 0.08,
    tipY - (tipY - rootY) * 0.12,
  );
  ctx.stroke();
  ctx.restore();
}
