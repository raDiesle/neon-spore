import { type SimConfig, type SinewState, sinewDecaying, sinewGone } from "@neon-spore/sim";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { paintCord, paintSheath } from "./sinew-flesh.js";
import type { Point } from "./sinew-shape.js";
import { sinewSum01 } from "./sinew-shape.js";
import { splinePath } from "./spline.js";

/**
 * **The tendon**: a bundle of fibres from the root to the mass, inside a
 * translucent sheath, and its health is its silhouette — a fibre that parts
 * is drawn as two curling stubs, one hanging off the root and one off the
 * mass, and never drawn whole again.
 *
 * The bundle parts **from the outside in**: the first fibre to go is the
 * leftmost, the second the rightmost, and so on toward the middle, so what
 * is left always reads as one thinner cord down the centre rather than as a
 * comb with gaps in it. The order is this file's and nothing in the
 * simulation cares which fibre is which — it counts them (`sim/sinew.ts`).
 *
 * The strain is on the line itself: slack, each fibre carries a slow wave;
 * as the sum climbs the wave flattens, the fibres straighten, thin and
 * brighten toward the rim colour, and the sheath pales. That is the only
 * gauge of the pull both seats are shown, and it is continuous because a
 * player reads tension off the picture and never off a number.
 */

/** How far the fibres fan out at the mass, as a share of its half-width, and
 * how much of that fan survives at the root. */
const FAN = 0.7;
const ROOT_FAN = 0.25;
/** The slack wave: its height in tiles and its speed. */
const WAVE = 0.12;
const WAVE_HZ = 1.8;
/** A stub: how far it hangs, in tiles, and how far it curls sideways. */
const STUB = 0.55;
const CURL = 0.3;
/** The sheath's half-width at the root and at the mass, in tiles, with every fibre whole. */
const SHEATH_ROOT = 0.3;
const SHEATH_MASS = 0.55;
const SEGMENTS = 8;
/** A cord's width in tiles, slack; it thins by up to 0.6 of that under strain. */
const CORD = 0.05;

/** Which fibre goes `k`th: the outermost, alternating sides, toward the middle. */
function partOrder(n: number): number[] {
  const order: number[] = [];
  for (let i = 0; i < n; i++) order.push(i % 2 === 0 ? i / 2 : n - 1 - (i - 1) / 2);
  return order;
}

/** Whether fibre `i` of `n` is still whole with `gone` parted. */
export function fibreWhole(i: number, n: number, gone: number): boolean {
  return partOrder(n).indexOf(i) >= gone;
}

/** The sideways offset of fibre `i` at the mass, in pixels. */
function fan(i: number, n: number, rx: number): number {
  if (n <= 1) return 0;
  return ((i - (n - 1) / 2) / ((n - 1) / 2)) * rx * FAN;
}

function whole(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  root: Point,
  mass: Point,
  off: number,
  i: number,
  strain: number,
  time: number,
  hex: string,
): void {
  const pts: Point[] = [];
  const amp = (1 - strain) * WAVE * l.tile;
  for (let k = 0; k <= SEGMENTS; k++) {
    const t = k / SEGMENTS;
    const belly = Math.sin(t * Math.PI);
    const wave = Math.sin(time * WAVE_HZ * Math.PI * 2 + t * Math.PI * 2 + i * 1.3) * amp * belly;
    pts.push({
      x: root.x + (mass.x + off - root.x) * t + off * (ROOT_FAN - 1) * (1 - t) + wave,
      y: root.y + (mass.y - root.y) * t,
    });
  }
  paintCord(ctx, splinePath(pts, false), hex, l.tile * CORD * (1.4 - 0.6 * strain), l.tile);
}

/** Two stubs where a fibre was: one off the root, curling out, one off the mass. */
function parted(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  root: Point,
  mass: Point,
  off: number,
  time: number,
): void {
  const side = off === 0 ? 1 : Math.sign(off);
  const sway = Math.sin(time * 1.1 + off) * 0.08 * l.tile;
  const top = splinePath(
    [
      { x: root.x + off * ROOT_FAN, y: root.y },
      { x: root.x + off * ROOT_FAN + sway, y: root.y + STUB * 0.6 * l.tile },
      { x: root.x + off * ROOT_FAN + side * CURL * l.tile, y: root.y + STUB * l.tile },
    ],
    false,
  );
  const bottom = splinePath(
    [
      { x: mass.x + off, y: mass.y },
      { x: mass.x + off - sway, y: mass.y - STUB * 0.6 * l.tile },
      { x: mass.x + off + side * CURL * l.tile, y: mass.y - STUB * l.tile },
    ],
    false,
  );
  paintCord(ctx, top, PALETTE.dim, l.tile * CORD, l.tile);
  paintCord(ctx, bottom, PALETTE.dim, l.tile * CORD, l.tile);
}

/** The sheath: a band from the root to the mass, as wide as the fibres left in it. */
function sheath(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  root: Point,
  mass: Point,
  share: number,
  strain: number,
): void {
  const wr = SHEATH_ROOT * l.tile * share;
  const wm = SHEATH_MASS * l.tile * share;
  const path = new Path2D();
  path.moveTo(root.x - wr, root.y);
  path.lineTo(root.x + wr, root.y);
  path.lineTo(mass.x + wm, mass.y);
  path.lineTo(mass.x - wm, mass.y);
  path.closePath();
  const tint = mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.5);
  const left = Math.min(root.x - wr, mass.x - wm);
  const right = Math.max(root.x + wr, mass.x + wm);
  paintSheath(ctx, path, left, right, tint, 0.1 + 0.12 * strain);
}

export function drawSinewFibres(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  root: Point,
  mass: Point,
  rx: number,
  time: number,
): void {
  const n = Math.max(1, cfg.sinewFibres);
  const gone = sinewGone(s, cfg);
  const strain = sinewSum01(s, cfg);
  // A tendon going slack under a hand is drawn greying: the pull is leaking.
  const hex = sinewDecaying(s, cfg)
    ? mixHex(PALETTE.hull, PALETTE.dim, 0.4)
    : mixHex(PALETTE.hull, PALETTE.hullRim, strain * 0.8);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (s.fibres > 0) sheath(ctx, l, root, mass, s.fibres / n, strain);
  for (let i = 0; i < n; i++) {
    const off = fan(i, n, rx);
    if (fibreWhole(i, n, gone)) whole(ctx, l, root, mass, off, i, strain, time, hex);
    else parted(ctx, l, root, mass, off, time);
  }
  ctx.restore();
}
