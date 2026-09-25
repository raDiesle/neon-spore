import type { Point } from "@neon-spore/content";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **Where a pull starts**: the circle a thumb goes on, and how far round it a
 * press is still taken to have meant it. The half of every pull handle that is
 * *the control*; the channel it runs in, next door in `pull-track.ts`, only
 * says where it can go. Cut from that file along exactly that line.
 */

/**
 * How much wider than the drawn knob a press on a pull handle is answered,
 * before `hitReach`'s own margin — so about three times the circle drawn.
 * The owner, 25 September 2026, generic: *the area of starting the pull must
 * be much bigger than the visual, otherwise it's hard to catch, as it's also
 * moving.* Every pull handle's grab circle is its knob times this.
 */
export const PULL_GRAB = 2.2;

/**
 * **The circle to start**: where the thumb goes, drawn at the handle's full
 * radius over the thin channel so there is no doubt where a pull begins. It
 * breathes a ring round itself until it is taken, and is lit while held.
 */
export function drawPullKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: { hex: string; rim: string; held: boolean; time: number },
): void {
  ctx.save();
  if (!o.held) {
    const breathe = 0.5 + 0.5 * Math.sin(o.time * 4);
    ctx.strokeStyle = o.hex;
    ctx.lineWidth = STROKE.inner;
    ctx.globalAlpha = 0.25 + 0.35 * breathe;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r * (1.25 + 0.15 * breathe), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.background;
  const disc = ring(at, r);
  ctx.fill(disc);
  ctx.fillStyle = o.held ? o.rim : o.hex;
  ctx.globalAlpha = o.held ? 0.85 : 0.35;
  ctx.fill(disc);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = o.held ? PALETTE.text : o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(disc);
  ctx.restore();
}

/** A circle as its own path, so it adds nothing to the context's current one. */
function ring(at: Point, r: number): Path2D {
  const p = new Path2D();
  p.arc(at.x, at.y, r, 0, Math.PI * 2);
  return p;
}
