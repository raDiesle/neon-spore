import { strokeGlow } from "./glow.js";
import { drawGlint } from "./instar-hide.js";
import type { Point } from "./instar-place.js";
import { faded, type Look, toward } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";

/** THE INSTAR's tail ends in a fork of two of these (`instar-tail.ts`). */

/** One blade of the fork: a hooked crescent from the fork to its tip. */
export function drawBlade(
  ctx: CanvasRenderingContext2D,
  from: Point,
  tip: Point,
  s: number,
  look: Look,
) {
  const { r, fade, threat } = look;
  const mx = (from.x + tip.x) / 2;
  const my = (from.y + tip.y) / 2;
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  // Out, away from the other blade, is the blade's back.
  const sx = (s * (tip.y - from.y)) / len;
  const sy = (-s * (tip.x - from.x)) / len;
  const p = new Path2D();
  p.moveTo(from.x - s * r * 0.1, from.y);
  p.quadraticCurveTo(mx + sx * len * 0.4, my + sy * len * 0.4, tip.x, tip.y);
  p.quadraticCurveTo(
    mx + sx * len * 0.1,
    my + sy * len * 0.1,
    from.x + s * r * 0.1,
    from.y + r * 0.05,
  );
  p.closePath();
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rockDark, fade);
  ctx.fill(p);
  // Bone, ground to an edge: pale along the back, dark down the cutting side.
  const back = { x: mx + sx * len * 0.3, y: my + sy * len * 0.3 };
  const g = ctx.createLinearGradient(back.x, back.y, mx, my);
  g.addColorStop(0, faded(PALETTE.rock, fade, 0.6));
  g.addColorStop(1, faded(PALETTE.rock, fade, 0));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.rock, fade), STROKE.inner, 0.4 * fade);
  drawGlint(ctx, toward(from, tip, 0.8), r * 0.025, fade, 0.6);
  if (threat > 0) strokeGlow(ctx, p, faded(PALETTE.red, fade), STROKE.outline, threat * fade);
}
