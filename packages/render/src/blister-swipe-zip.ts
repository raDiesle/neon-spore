import { type BlisterSwipeWay, blisterSwipeShare, blisterWayOf } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { PULL_SIZE } from "./pull-knob.js";

const TAU = Math.PI * 2;

/** Each way a stroke counts, as the unit step on the field: `blister-help.ts`'s. */
const WAY: Record<BlisterSwipeWay, { dx: number; dy: number }> = {
  down: { dx: 0, dy: 1 },
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  left: { dx: -1, dy: 0 },
};

/** Teeth down each side of the seam. */
const TEETH = 9;

/**
 * ZIP, one of SWIPE's two bodies (`blister-swipe-body.ts`): a long pod comes up out of the pore and lies out along the swipe's
 * channel, zipped shut down its middle, the knob its zip's pull. Carried, the
 * knob opens the seam behind it and the pod gapes there, glowing inside; ahead
 * of the knob the teeth stay shut, so how far is left to open is how far is
 * left to stroke. Lifted, the pod zips itself shut again.
 */
export function drawZipBase(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  ctx.save();
  const base = new Path2D();
  base.arc(x, y, r * 1.1, 0, TAU);
  ctx.fillStyle = hide(ctx, x, y, r);
  ctx.fill(base);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.podRim, 0.9);
  ctx.stroke(base);
  ctx.restore();
}

/** The pod along the channel, its seam and its teeth: past the pore, since a stroke down runs over it. */
export function drawZipPod(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const way = WAY[blisterWayOf(b.c)];
  const along = blisterSwipeShare(b.world, b.c);
  const length = ((b.world.cfg.blisterSwipeMilli * b.l.tile) / 1000) * f.rise;
  const nx = -way.dy;
  const ny = way.dx;
  const end = { x: b.x + way.dx * length, y: b.y + way.dy * length };
  // Sized round the knob, which rides the seam and is near the body's own size.
  const k = knobRadius(b);
  const half = Math.max(r * 0.75, k * 1.15);
  ctx.save();
  // The pod: a capsule from the base to a stroke out, its far end round.
  const pod = new Path2D();
  const a0 = Math.atan2(ny, nx);
  pod.arc(b.x, b.y, half, a0 + Math.PI, a0, true);
  pod.arc(end.x, end.y, half, a0, a0 + Math.PI, true);
  pod.closePath();
  ctx.fillStyle = hide(ctx, b.x, b.y, r);
  ctx.fill(pod);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.podRim, 0.9);
  ctx.stroke(pod);
  // Behind the knob the seam gapes, widest half way back to where it opened.
  const open = length * along;
  if (open > 0) {
    const gape = new Path2D();
    const mid = open / 2;
    const wide = Math.min(half * 0.75, open * 0.35);
    gape.moveTo(b.x, b.y);
    gape.quadraticCurveTo(
      b.x + way.dx * mid + nx * wide * 2,
      b.y + way.dy * mid + ny * wide * 2,
      b.x + way.dx * open,
      b.y + way.dy * open,
    );
    gape.quadraticCurveTo(
      b.x + way.dx * mid - nx * wide * 2,
      b.y + way.dy * mid - ny * wide * 2,
      b.x,
      b.y,
    );
    ctx.fillStyle = rgba(PALETTE.lamp, 0.9);
    ctx.fill(gape);
    ctx.lineWidth = Math.max(1, r * 0.07);
    ctx.strokeStyle = PALETTE.podDark;
    ctx.stroke(gape);
  }
  // Ahead of the knob, the teeth still shut across the seam.
  ctx.fillStyle = PALETTE.podRim;
  for (let i = 0; i < TEETH; i++) {
    const t = (i + 0.5) / TEETH;
    if (t * length <= open) continue;
    const side = i % 2 === 0 ? 1 : -1;
    const cx = b.x + way.dx * t * length + nx * side * k * 0.55;
    const cy = b.y + way.dy * t * length + ny * side * k * 0.55;
    ctx.beginPath();
    ctx.ellipse(cx, cy, k * (way.dx ? 0.12 : 0.36), k * (way.dx ? 0.36 : 0.12), 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** The pod's skin, warm, lighter on top. */
function hide(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): CanvasGradient {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 2.6);
  g.addColorStop(0, rgba(PALETTE.pod, 0.95));
  g.addColorStop(1, PALETTE.podDark);
  return g;
}

/** The knob's radius as drawn: `blister-help.ts`'s, a pull handle's at four fifths, doubled by `PULL_SIZE`. */
function knobRadius(b: Body): number {
  return (b.l.tile * b.world.cfg.handleRadiusMilli * 0.8 * PULL_SIZE) / 1000;
}
