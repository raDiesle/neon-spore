import type { Point } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { halterBend, halterCentre, halterSize, halterSpan } from "./halter-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE HALTER's own blow at the hull** (`boss-strike-look.ts`). A fire step
 * ran out with the bared centre unshot (`halter-step.ts`'s `miss`), so the
 * plating does what it does to anything that comes near: it sheds. One of
 * the centre's hanging plates snaps off and is flung down the middle column
 * turning end over end, slow off the body and hard at the end, and bites
 * into the skin edge-first at `reach = 1`. It stands there a moment, sunk,
 * with the plating cracked either side of it, and then it crumbles away.
 */

/** Turns the plate makes on its way down; a whole number and a half lands it edge-first. */
const TURNS = 1.5;
/** How far the plate sinks into the skin as it bites, as a share of its height. */
const SINK = 0.35;
/** Cracks run out either side of the bite, and how far, in tiles. */
const CRACKS = 3;
const CRACK_RUN = 0.9;

/** Where the blow leaves the body: under the centre segment, at the foot of its hanging plates. */
export function halterBlowFrom(l: Layout, cfg: SimConfig): Point {
  const c = halterCentre(l, cfg);
  const { ry, drop } = halterSize(l);
  return { x: c.x, y: c.y + halterBend(l, 0) + ry + drop };
}

/** One of the centre's hanging plates, its width and height, in pixels. */
function plateSize(l: Layout): { w: number; h: number } {
  const { x0, x1 } = halterSpan(l, 1);
  const { ry, drop } = halterSize(l);
  return { w: ((x1 - x0) / 2) * 0.62, h: ry * 0.8 + drop };
}

export function halterBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const { w, h } = plateSize(l);
  // Thrown: slow off the body and hard at the end, on the skin at 1.
  const t = f.reach ** 2;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t + (f.after > 0 ? h * SINK : 0);
  const turn = (1 - f.reach) * TURNS * Math.PI * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(turn);
  // The plate: its biting edge down, crumbling from the top as it fades.
  const left = h * (1 - 0.7 * f.after);
  const plate = new Path2D();
  plate.moveTo(-w / 2, -left);
  plate.lineTo(w / 2, -left);
  plate.lineTo(w / 2, 0);
  plate.lineTo(0, h * 0.12);
  plate.lineTo(-w / 2, 0);
  plate.closePath();
  ctx.fillStyle = rgba(PALETTE.halterPlate, fade);
  ctx.fill(plate);
  ctx.strokeStyle = rgba(PALETTE.halterPlateDark, 0.95 * fade);
  ctx.lineWidth = tile * 0.05;
  ctx.stroke(plate);
  ctx.restore();
  if (f.after <= 0) return;
  // The bite: the skin cracked out either side of where the plate went in.
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.halterPlateDark, 0.85 * fade);
  ctx.lineWidth = tile * 0.05;
  const run = CRACK_RUN * tile * Math.min(1, f.after * 4);
  for (const side of [-1, 1]) {
    for (let i = 0; i < CRACKS; i++) {
      const a = (0.12 + 0.22 * i) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x + side * Math.cos(a) * run, to.y - Math.sin(a) * run * 0.35);
      ctx.stroke();
    }
  }
  // And the grit off the crumbling plate, falling.
  ctx.fillStyle = rgba(PALETTE.halterPlate, fade);
  for (let i = 0; i < 5; i++) {
    const gx = to.x + (i - 2) * w * 0.3;
    const gy = to.y - h * (1 - f.after) + 1.5 * tile * f.after * f.after * (1 + (i % 2) * 0.4);
    ctx.fillRect(gx, gy, tile * 0.08, tile * 0.08);
  }
  ctx.restore();
}
