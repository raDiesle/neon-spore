import type { Point } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { capstanCentre, capstanPivot, capstanRingPath } from "./capstan-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE CAPSTAN's own blow at the hull** (`boss-strike-look.ts`). A step ran
 * out unanswered (`capstan-step.ts`'s `miss`), and the drum does what a rusted
 * winch does when it is let run: it throws a tooth. A small cog, the BEARING
 * RING of its end faces at a quarter of the size (`capstan-shape.ts`), is
 * shaken loose off the cradle's foot and spins down the middle column, slow
 * off the drum and hard at the end, and bites the skin at `reach = 1`. It
 * stands there a moment, sunk, with its teeth's gouges either side, and then
 * it rusts away to grit.
 */

/** Turns the cog makes on its way down. */
const TURNS = 2.5;
/** The cog's radius, and how far it sinks into the skin as it bites, as a share of it. */
const COG = 0.32;
const SINK = 0.4;
/** Gouges its teeth cut either side of the bite, and how far they run, in tiles. */
const GOUGES = 3;
const GOUGE_RUN = 0.7;

/** Where the blow leaves the body: the cradle's foot, under the drum's middle. */
export function capstanBlowFrom(l: Layout, cfg: SimConfig): Point {
  const c = capstanCentre(l, cfg);
  return { x: c.x, y: c.y + capstanPivot(l) };
}

export function capstanBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const r = COG * tile * (1 - 0.35 * f.after);
  // Thrown: slow off the drum and hard at the end, on the skin at 1.
  const t = f.reach ** 2;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t + (f.after > 0 ? r * SINK : 0);
  ctx.save();
  ctx.translate(x, y);
  const cog = capstanRingPath(r, r, f.reach * TURNS * Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.capstanRust, fade);
  ctx.fill(cog);
  ctx.strokeStyle = rgba(PALETTE.capstanRustDark, 0.95 * fade);
  ctx.lineWidth = tile * 0.05;
  ctx.stroke(cog);
  // Its axle hole, so it reads as a wheel and not as a rock.
  const hub = new Path2D();
  hub.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.capstanRustDark, fade);
  ctx.fill(hub);
  ctx.restore();
  if (f.after <= 0) return;
  // The bite: the teeth's gouges run out either side of where the cog went in.
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.capstanRustDark, 0.85 * fade);
  ctx.lineWidth = tile * 0.06;
  ctx.lineCap = "round";
  const run = GOUGE_RUN * tile * Math.min(1, f.after * 4);
  for (const side of [-1, 1]) {
    for (let i = 0; i < GOUGES; i++) {
      const gx = to.x + side * (0.25 + 0.22 * i) * tile;
      ctx.beginPath();
      ctx.moveTo(gx, to.y);
      ctx.lineTo(gx + side * run * 0.3, to.y + run * (0.4 - 0.1 * i));
      ctx.stroke();
    }
  }
  // And the rust off it, falling.
  ctx.fillStyle = rgba(PALETTE.capstanRust, fade);
  for (let i = 0; i < 6; i++) {
    const gx = to.x + (i - 2.5) * r * 0.45;
    const gy = to.y - r * (1 - f.after) + 1.4 * tile * f.after * f.after * (1 + (i % 3) * 0.3);
    ctx.fillRect(gx, gy, tile * 0.07, tile * 0.07);
  }
  ctx.restore();
}
