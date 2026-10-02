import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { mimicHang } from "./mimic-pose.js";
import { MANTLE } from "./mimic-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE MIMIC's own blow at the hull** (`boss-strike-look.ts`). The third
 * arm in one movement has reached (`mimic-step.ts`'s `reach`), and by then
 * it is already at the hull — each reach hung it a third of the way down the
 * field, in sight. So the blow is the slap: the arm's tip lifts off the
 * plating, comes down hard on the column, and is drawn back up under the
 * mantle, leaving a ring of sucker prints on the plating in the hull's red.
 *
 * The blow leaves from under the mantle, where the reaching arm roots — the
 * arm is already as long as the reach, so the reach is the slap's time and
 * not a distance.
 */

/** How far under the mantle's middle the arm roots, in mantle radii. */
const ROOT_AT = 0.7;
/** The arm's width at its root and its tip, in mantle radii, and how high the slap lifts it, in tiles. */
const ROOT = 0.34;
const TIP = 0.09;
const LIFT = 1.4;
/** The sucker prints left on the plating: how many, how far out, and their size, in tiles. */
const PRINTS = 6;
const PRINT_OUT = 0.55;
const PRINT = 0.12;

/** Where the blow leaves the body: under the mantle, where the reaching arm roots. */
export function mimicBlowFrom(l: Layout, cfg: SimConfig, _col: number): Point {
  const at = mimicHang(l, cfg);
  return { x: at.x, y: at.y + ROOT_AT * MANTLE * l.tile };
}

/** The arm from `from` to `tip`, thinning as it goes and bending a little to the side it lands on. */
function arm(from: Point, tip: Point, r: number): Path2D {
  const left: Point[] = [];
  const right: Point[] = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const bow = Math.sin(u * Math.PI) * 0.12 * (tip.y - from.y);
    const x = from.x + (tip.x - from.x) * u + bow * 0.2;
    const y = from.y + (tip.y - from.y) * u;
    const half = r * (ROOT + (TIP - ROOT) * u);
    left.push({ x: x - half, y });
    right.push({ x: x + half, y });
  }
  return splinePath([...left, ...right.reverse()], true);
}

export function mimicBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const r = MANTLE * tile;
  // Lifted off the plating at the start, slammed down at the reach, then
  // drawn back up under the mantle as it fades.
  const lift = Math.sin(Math.min(1, f.reach) * Math.PI) * LIFT * tile;
  const back = f.after * f.after;
  const tip = { x: to.x, y: to.y - lift - (to.y - from.y) * back };
  ctx.save();
  if (tip.y - from.y > 1) {
    const path = arm(from, tip, r);
    ctx.save();
    ctx.globalAlpha *= fade;
    ctx.fillStyle = PALETTE.mimicSkin;
    ctx.fill(path);
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.mimicSkinDark;
    ctx.stroke(path);
    ctx.restore();
  }
  if (f.after > 0) {
    // The suckers' prints where the slap landed, bleeding the hull's red as they fade.
    for (let i = 0; i < PRINTS; i++) {
      const a = (i / PRINTS) * Math.PI * 2;
      const x = to.x + Math.cos(a) * PRINT_OUT * tile;
      const y = to.y + Math.sin(a) * PRINT_OUT * tile * 0.35;
      ctx.fillStyle = rgba(PALETTE.red, 0.7 * fade);
      ctx.beginPath();
      ctx.ellipse(x, y, PRINT * tile * 1.5, PRINT * tile, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
