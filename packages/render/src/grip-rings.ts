import { circleSubpath } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The three rings a thumb on a boss's picture is drawn with** — asked for,
 * held, and thrown off — lifted out of `queen-grip.ts` when THE MIRROR's
 * lobes came to need the same three, so a held mark and a held lobe read as
 * one gesture and not two drawings of it. Nothing here knows which boss it
 * is on: a centre, a radius, and whether a thumb is there.
 */

/** The ring: breathing until a thumb lands, filled and steady once one has. */
export function drawGripRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  held: boolean,
  time: number,
): void {
  const breathe = held ? 1 : 1 + 0.08 * Math.sin(time * 4);
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  if (held) {
    ctx.save();
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.18;
    ctx.fill(p);
    ctx.restore();
  }
  strokeGlow(ctx, p, held ? PALETTE.text : PALETTE.dim, STROKE.inner, held ? 1.2 : 0.9);
}

/** The hold's dial, from the top and clockwise, emptying as the beats run out. */
export function drawGripDial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  left: number,
): void {
  if (left <= 0) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  ctx.stroke();
  ctx.restore();
}

/**
 * A ring thrown off something: running outward and fading, in the colour of
 * what came off. Plain strokes rather than `strokeGlow`, which ends at full
 * alpha: this ring's whole point is that it goes.
 */
export function drawThrownRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  color: string = PALETTE.rock,
): void {
  const p = new Path2D(circleSubpath(x, y, r));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha * 0.35;
  ctx.lineWidth = STROKE.outline * 3;
  ctx.stroke(p);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = STROKE.inner * 1.4;
  ctx.stroke(p);
  ctx.restore();
}
