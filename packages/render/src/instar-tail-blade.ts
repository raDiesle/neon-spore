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
  const { a, back: c1, edge: c2, b, mx, my, sx, sy, len } = bladeShape(from, tip, s, r);
  const p = new Path2D();
  p.moveTo(a.x, a.y);
  p.quadraticCurveTo(c1.x, c1.y, tip.x, tip.y);
  p.quadraticCurveTo(c2.x, c2.y, b.x, b.y);
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

/** The blade's outline from `from` to `tip`: its two root corners, the
 * control of its curved back and of its cutting edge, and the frame they are
 * laid in. Out, away from the other blade, is the blade's back. */
function bladeShape(from: Point, tip: Point, s: number, r: number) {
  const mx = (from.x + tip.x) / 2;
  const my = (from.y + tip.y) / 2;
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1;
  const sx = (s * (tip.y - from.y)) / len;
  const sy = (-s * (tip.x - from.x)) / len;
  return {
    a: { x: from.x - s * r * 0.1, y: from.y },
    back: { x: mx + sx * len * 0.4, y: my + sy * len * 0.4 },
    edge: { x: mx + sx * len * 0.1, y: my + sy * len * 0.1 },
    b: { x: from.x + s * r * 0.1, y: from.y + r * 0.05 },
    mx,
    my,
    sx,
    sy,
    len,
  };
}

/** The blade's outline as points along its two curves — where a bolt meets it (`instar-limb-stop.ts`). */
export function bladePoints(from: Point, tip: Point, s: number, r: number): Point[] {
  const { a, back, edge, b } = bladeShape(from, tip, s, r);
  const q = (p0: Point, c: Point, p1: Point, u: number): Point => ({
    x: (1 - u) * (1 - u) * p0.x + 2 * (1 - u) * u * c.x + u * u * p1.x,
    y: (1 - u) * (1 - u) * p0.y + 2 * (1 - u) * u * c.y + u * u * p1.y,
  });
  const us = [0, 0.25, 0.5, 0.75];
  return [...us.map((u) => q(a, back, tip, u)), ...us.map((u) => q(tip, edge, b, u)), b];
}
