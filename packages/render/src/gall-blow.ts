import { blobRadiusMul, type Point } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { gallMidAt } from "./gall-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE GALL's own blow at the hull** (`boss-strike-look.ts`). A step ran
 * out with nobody answering it (`gall-step.ts`'s `miss`), and the creature
 * seeds. A seed of it — NOTCH 2's lobes at a third of the size, soft and
 * dull — is torn off the seam's underside on a strand of its flesh, drops to
 * the hull under the column it sat over, the strand stretching and snapping
 * halfway, and splats on the skin at `reach = 1`. There it takes root: three
 * tendrils creep into the plating, and then the whole of it withers away.
 */

/** The seed's half-width, in tiles, and its lobes: fewer than the nodule's, it is a piece of one. */
const SEED = 0.3;
const LOBES = 3;
/** How far down the strand holds before it snaps, as a share of the drop. */
const SNAP = 0.55;
/** How flat the seed goes as it splats, and how far its tendrils run into the skin, in tiles. */
const SPLAT = 0.55;
const TENDRIL = 0.8;
/** Samples round the seed. */
const N = 24;

/** Where the blow leaves the body: the seam's underside over the middle column. */
export function gallBlowFrom(l: Layout, cfg: SimConfig): Point {
  const mid = gallMidAt(l, cfg);
  return { x: mid.x, y: mid.y + SEED * l.tile };
}

export function gallBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Dropped: slow off the seam and hard at the end, on the skin at 1.
  const t = f.reach ** 2;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const r = SEED * tile;
  // Stretched along the fall while it drops, squashed flat on the skin once it lands.
  const splat = Math.min(1, f.after * 5);
  const sx = 1 + SPLAT * splat;
  const sy = (1 + 0.25 * t * (1 - splat)) * (1 - SPLAT * splat);
  ctx.save();
  ctx.translate(x, y);
  const seed = seedPath(r * sx, r * sy, f.time);
  ctx.fillStyle = rgba(PALETTE.gallFlesh, fade);
  ctx.fill(seed);
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.95 * fade);
  ctx.lineWidth = tile * 0.05;
  ctx.stroke(seed);
  ctx.restore();
  drawStrand(ctx, f, { x, y: y - r * sy });
  if (f.after <= 0) return;
  // It takes root: three tendrils creep into the skin from under the splat.
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.9 * fade);
  ctx.lineWidth = tile * 0.06;
  ctx.lineCap = "round";
  const run = TENDRIL * tile * Math.min(1, f.after * 3);
  for (const a of [-0.6, 0, 0.6]) {
    ctx.beginPath();
    ctx.moveTo(to.x + Math.sin(a) * r * 0.6, to.y);
    ctx.quadraticCurveTo(
      to.x + Math.sin(a) * run * 0.8,
      to.y + run * 0.45,
      to.x + Math.sin(a) * run * 0.6,
      to.y + run,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The strand of flesh the seed is torn off on: whole from the seam to the
 * seed's top until `SNAP` of the drop, then two ends curling back — one up
 * into the seam, one after the seed — gone as it lands.
 */
function drawStrand(ctx: CanvasRenderingContext2D, f: StrikeFrame, top: Point): void {
  if (f.after > 0) return;
  const { from, tile } = f;
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.85);
  ctx.lineCap = "round";
  if (f.reach < SNAP) {
    ctx.lineWidth = tile * 0.07 * (1 - 0.6 * (f.reach / SNAP));
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    ctx.restore();
    return;
  }
  // Snapped: each end pulls back toward what it is still on.
  const back = 1 - (f.reach - SNAP) / (1 - SNAP);
  const len = (top.y - from.y) * 0.3 * back;
  ctx.lineWidth = tile * 0.03;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(from.x + len * 0.3, from.y + len * 0.6, from.x - len * 0.1, from.y + len);
  ctx.moveTo(top.x, top.y);
  ctx.quadraticCurveTo(top.x - len * 0.3, top.y - len * 0.6, top.x + len * 0.1, top.y - len);
  ctx.stroke();
  ctx.restore();
}

/** The seed round its own middle: a blob of `LOBES` lobes breathing on `time`, `rx` by `ry`. */
function seedPath(rx: number, ry: number, time: number): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, LOBES, 0.16, 0.05, time, 5.2);
    pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
  }
  return splinePath(pts, true);
}
