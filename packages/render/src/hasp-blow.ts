import type { StrikeFrame } from "./boss-strike-look.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HASP's own blow at the hull** (`boss-strike-look.ts`): the loose bolt
 * its second clasp threw has already fallen the whole column in plain sight
 * (`hasp-draw.ts`'s `drawBolt`), so the blow is not a second thing thrown. It
 * is that bolt, the same pale pin, driven home: it sinks into the plating to
 * its head, the head flares white and cools to red like a rivet set hot, and
 * the plating rings around it.
 */

/** The bolt's half-width and half-length, in tiles — `drawBolt`'s own. */
const HALF_W = 0.12;
const HALF_L = 0.3;
/** How much of the bolt still stands proud once it is home, in tiles. */
const PROUD = 0.06;

export function haspBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Driven hard: most of the travel in the first part of the blow.
  const drive = 1 - (1 - f.reach) ** 3;
  // It arrives where `drawBolt` left it, its middle on the skin.
  const top = to.y - tile * (HALF_L + (PROUD - HALF_L) * drive);
  const x = to.x;
  ctx.save();
  if (to.y - top > 0.5) {
    const bolt = new Path2D();
    bolt.roundRect(x - tile * HALF_W, top, tile * HALF_W * 2, to.y - top, tile * 0.1);
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.9 * fade);
    ctx.fill(bolt);
    strokeGlow(ctx, bolt, PALETTE.hullRim, STROKE.inner, 2 * fade);
  }
  // The head, set hot: white as it lands, cooling to red as it withdraws.
  const head = tile * (HALF_W + 0.1 * drive);
  ctx.fillStyle = rgba(f.after < 0.35 ? PALETTE.hullRim : PALETTE.redRim, fade);
  ctx.beginPath();
  ctx.ellipse(x, to.y, head * 1.4, head * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // The plating rings where the pin went in: two rings, the second late.
  if (f.after > 0) {
    ctx.lineWidth = tile * 0.08;
    for (const [lag, hex] of [
      [0, PALETTE.hullRim],
      [0.3, PALETTE.red],
    ] as const) {
      const t = f.after - lag;
      if (t <= 0) continue;
      ctx.strokeStyle = rgba(hex, 0.9 * (1 - t));
      ctx.beginPath();
      ctx.ellipse(x, to.y, tile * (0.3 + 1.4 * t), tile * (0.1 + 0.26 * t), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}
