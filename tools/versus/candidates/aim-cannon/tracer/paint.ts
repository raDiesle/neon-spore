import { circleSubpath } from "../../../../../packages/content/src/shapes.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { SeatSkin } from "../../../../../packages/render/src/seat-skin.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches in that ring's radius (`AIM_LOOK.reach`). */
const SCALE = 1.3;
export const REACH = 2.6;

/** Of the ring's radius: the outer ticks' reach. In pixels: dot spacing and size at the muzzle and at the target. */
const TICK_OUT = 1.9;
const STEP = 9;
const DOT_NEAR = 1.1;
const DOT_FAR = 2.4;
/** The band under the mark the verb and its reason are written in, left clear of dots (`boss-cue-text.ts`). */
const WORDS = 44;

/** A dotted line from the muzzle up to the target, into a crosshair, all in the cannon's colour. */
export function paintTracer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  _time: number,
  skin: SeatSkin,
  from: { x: number; y: number },
): void {
  const r = ring * SCALE;
  // Up the muzzle's column to the target's height, then across to it.
  const legs: [number, number, number, number][] = [];
  const across = Math.abs(x - from.x) > r;
  const upTo = across ? y : y + r * TICK_OUT;
  if (from.y - upTo > STEP) legs.push([from.x, from.y - STEP, from.x, upTo]);
  if (across) legs.push([from.x, y, x - Math.sign(x - from.x) * r * TICK_OUT, y]);
  const wordsTop = y + ring * REACH - 4;
  const total = legs.reduce((s, [ax, ay, bx, by]) => s + Math.hypot(bx - ax, by - ay), 0);
  const dots = new Path2D();
  let run = 0;
  for (const [ax, ay, bx, by] of legs) {
    const len = Math.hypot(bx - ax, by - ay);
    for (let t = 0; t <= len; t += STEP) {
      const f = total > 0 ? (run + t) / total : 1;
      const px = ax + ((bx - ax) * t) / Math.max(len, 1);
      const py = ay + ((by - ay) * t) / Math.max(len, 1);
      if (px === from.x && py > wordsTop && py < wordsTop + WORDS) continue;
      const rad = DOT_NEAR + (DOT_FAR - DOT_NEAR) * f;
      dots.moveTo(px + rad, py);
      dots.arc(px, py, rad, 0, Math.PI * 2);
    }
    run += len;
  }
  ctx.globalAlpha = 0.35 + 0.65 * k;
  ctx.fillStyle = skin.tint;
  ctx.fill(dots);
  ctx.globalAlpha = 1;
  const cross = new Path2D(circleSubpath(x, y, r));
  cross.addPath(new Path2D(circleSubpath(x, y, r * 1.45)));
  for (let q = 0; q < 4; q++) {
    const dx = Math.cos((q * Math.PI) / 2);
    const dy = Math.sin((q * Math.PI) / 2);
    cross.moveTo(x + dx * r * TICK_OUT, y + dy * r * TICK_OUT);
    cross.lineTo(x + dx * r * 0.45, y + dy * r * 0.45);
  }
  strokeGlow(ctx, cross, skin.tint, 2, 1.4 * k);
  ctx.fillStyle = skin.rim;
  ctx.globalAlpha = k;
  ctx.fill(new Path2D(circleSubpath(x, y, Math.max(1.2, r * 0.09))));
  ctx.globalAlpha = 1;
}
