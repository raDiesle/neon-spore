import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { slingCentre, slingCupRadius } from "./sling-shape.js";

/**
 * **THE SLING's own blow at the hull** (`boss-strike-look.ts`). A fire step
 * ran out with the yoke unshot (`sling-step.ts`'s `miss`), and the cup that
 * was lit for the shot tips and lets go of what it held: a steel ball in the
 * fork's own grey, trailing a streak of the cords' pale tan, is flung out of
 * the cup's underside and down the middle column, fast off the fork and
 * still quick at the skin, which it strikes at `reach = 1`. It dents the
 * plating — a dark pit and a ring going out from it — and bounces once,
 * smaller, before it is gone.
 */

/** The ball's radius, in tiles, and how long its streak runs behind it at its fastest. */
const BALL = 0.24;
const STREAK = 1.4;
/** How high the one bounce goes, in tiles, and how far the ring runs along the plating. */
const BOUNCE = 0.7;
const RING = 1.1;

/** Where the blow leaves the body: the underside of the cup at the crotch. */
export function slingBlowFrom(l: Layout, cfg: SimConfig): Point {
  const c = slingCentre(l, cfg);
  return { x: c.x, y: c.y + slingCupRadius(l) * 0.6 };
}

function ball(ctx: CanvasRenderingContext2D, r: number, alpha: number, tile: number): void {
  const b = new Path2D();
  b.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.slingSteel, alpha);
  ctx.fill(b);
  ctx.strokeStyle = rgba(PALETTE.slingSteelDark, 0.95 * alpha);
  ctx.lineWidth = tile * 0.05;
  ctx.stroke(b);
  // A glint up and to the left, so it reads as a ball and not as a coin.
  ctx.fillStyle = rgba(PALETTE.slingCord, 0.8 * alpha);
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

export function slingBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const r = BALL * tile;
  if (f.after <= 0) {
    // Flung, not dropped: fast off the fork and still quick at the skin.
    const t = 1 - (1 - f.reach) ** 1.5;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    ctx.save();
    ctx.translate(x, y);
    const tail = Math.min(STREAK * tile * (1 - f.reach * 0.4), y - from.y);
    if (tail > 0) {
      const g = ctx.createLinearGradient(0, -tail, 0, 0);
      g.addColorStop(0, rgba(PALETTE.slingCord, 0));
      g.addColorStop(1, rgba(PALETTE.slingCord, 0.7));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(0, -tail);
      ctx.lineTo(r * 0.7, 0);
      ctx.closePath();
      ctx.fill();
    }
    ball(ctx, r, 1, tile);
    ctx.restore();
    return;
  }
  const a = f.after;
  ctx.save();
  // The dent: a dark pit where it struck, and a ring running out along the plating.
  ctx.fillStyle = rgba(PALETTE.slingSteelDark, 0.85 * fade);
  ctx.beginPath();
  ctx.ellipse(to.x, to.y, r * 1.3, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.slingSteel, 0.7 * fade);
  ctx.lineWidth = tile * 0.06;
  ctx.beginPath();
  ctx.ellipse(to.x, to.y, tile * (0.3 + RING * a), tile * (0.08 + 0.2 * a), 0, 0, Math.PI * 2);
  ctx.stroke();
  // The one bounce, smaller, and gone.
  ctx.translate(to.x, to.y - BOUNCE * tile * 4 * a * (1 - a) - r);
  ball(ctx, r * (1 - 0.4 * a), fade, tile);
  ctx.restore();
}
