import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE DAVIT's own blow at the hull** (`boss-strike-look.ts`): a run-out
 * fire step's window closes with the hook still swinging, so the boom pays
 * its own chain out the rest of the way and lets the hook fall onto the
 * plating, then hauls it back up taut. Nothing is thrown that the boom does
 * not already hang — the same chain and hook `davit-marks.ts` draws.
 */

/** The hook's radius, in tiles — `davit-shape.ts`'s own. */
const HOOK_R = 0.3;

export function davitBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const drop = 1 - (1 - f.reach) ** 3;
  const x = from.x + (to.x - from.x) * drop;
  const y = from.y + (to.y - from.y) * drop;
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.davitChain, 0.85 * fade);
  ctx.lineWidth = tile * 0.06;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(x, y);
  ctx.stroke();
  const hook = new Path2D();
  hook.arc(x, y, HOOK_R * tile, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.davitSteelDark, fade);
  ctx.fill(hook);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.davitSteel, fade);
  ctx.stroke(hook);
  // The plating rings once the hook has landed.
  if (f.after > 0) {
    ctx.strokeStyle = rgba(PALETTE.davitSteel, 0.8 * (1 - f.after));
    ctx.lineWidth = tile * 0.08;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.4 + 1.4 * f.after),
      tile * (0.12 + 0.26 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
