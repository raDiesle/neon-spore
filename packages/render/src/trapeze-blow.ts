import type { SimConfig } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type Point, trapezeAlienAt, trapezeBodyPath, trapezeBodyR } from "./trapeze-shape.js";

/**
 * **THE TRAPEZE's own blow at the hull** (`boss-strike-look.ts`): a level run
 * out with its gong unkicked (`trapeze-step.ts`'s `trapezeMiss`), and the
 * alien leaps off the plank at the hull — a hop up and over, a body the size
 * of its torso falling down the middle column, squashing flat on the skin and
 * fading as it climbs back to its swing.
 */

/** How high the leap rises before it falls, in tiles. */
const HOP = 1.2;

/** Where the blow leaves the body: the alien on the plank at rest. */
export function trapezeBlowFrom(l: Layout, cfg: SimConfig): Point {
  return trapezeAlienAt(l, cfg, 0, 0).torso;
}

export function trapezeBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Up first, then falling faster and faster onto the skin at 1.
  const t = f.reach ** 1.8;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t - HOP * tile * 4 * f.reach * (1 - f.reach);
  const flat = Math.min(1, f.after * 6);
  const r = trapezeBodyR(f.l).torso;
  ctx.save();
  ctx.translate(x, y);
  ctx.translate(0, -r * (1 - 0.5 * flat));
  ctx.scale(1 + 0.5 * flat, 1 - 0.5 * flat);
  const body = trapezeBodyPath({ x: 0, y: 0 }, r, f.time, 2.3);
  ctx.fillStyle = rgba(PALETTE.trapezeAlien, fade);
  ctx.fill(body);
  ctx.lineWidth = tile * 0.05;
  ctx.strokeStyle = rgba(PALETTE.trapezeAlienDark, 0.95 * fade);
  ctx.stroke(body);
  ctx.restore();
}
