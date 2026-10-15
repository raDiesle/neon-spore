import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import {
  blisterStrokes,
  blisterSwipeShare,
  blisterWayOf,
} from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** The ribs fanned across each shell. */
const RIBS = 7;

/**
 * CLAM: a clam stands up out of the pore gaping, the press lying in it like
 * the pearl — the bottom shell a bowl under the button, the top shell lifted
 * behind it. The press snaps it shut, one wide lens of two ribbed shells, and
 * its tongue slides out of the seam along the pull's channel, its tip at the
 * knob, as far as the thumb has drawn it.
 */
export function drawClamBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  ctx.save();
  if (blisterStrokes(b.c)) {
    tongue(ctx, b, x, y, r);
    shell(ctx, x, y, r, 1, 0.62);
    shell(ctx, x, y, r, -1, 0.62);
    ctx.beginPath();
    ctx.moveTo(x - r * 1.75, y);
    ctx.lineTo(x + r * 1.75, y);
    ctx.lineWidth = Math.max(1.5, r * 0.12);
    ctx.strokeStyle = PALETTE.background;
    ctx.stroke();
  } else {
    const gape = 1 + Math.sin(b.time * 2) * 0.05;
    // The top shell lifted behind the pearl, and the bottom one a shallow bowl
    // it lies in — shallow, since the pore's lip cuts off anything deeper.
    shell(ctx, x, y - r * 0.55, r, -1, 1.1 * gape);
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.2, r * 1.55, r * 0.5, 0, 0, TAU);
    ctx.fillStyle = rgba(PALETTE.redRim, 0.4);
    ctx.fill();
    shell(ctx, x, y + r * 0.05, r, 1, 0.4);
  }
  ctx.restore();
}

/**
 * One shell, its hinge line along `y` and its belly `deep` radii out that way
 * (`side` 1 down, -1 up), ribbed from the hinge's middle.
 */
function shell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: 1 | -1,
  deep: number,
): void {
  const w = r * 1.8;
  const p = new Path2D();
  p.moveTo(x - w, y);
  p.bezierCurveTo(x - w, y + side * r * deep * 1.35, x + w, y + side * r * deep * 1.35, x + w, y);
  p.closePath();
  const g = ctx.createLinearGradient(x, y, x, y + side * r * deep);
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(1, rgba(PALETTE.hull, 0.45));
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  ctx.beginPath();
  for (let i = 1; i < RIBS; i++) {
    const t = i / RIBS;
    ctx.moveTo(x + (t - 0.5) * w * 0.4, y);
    ctx.lineTo(x + (t - 0.5) * w * 2.4, y + side * r * deep * 1.2);
  }
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.strokeStyle = rgba(PALETTE.redDark, 0.6);
  ctx.stroke();
  ctx.restore();
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
  ctx.stroke(p);
}

/** The tongue out of the seam: fat at the root, a rounded tip at the knob. */
function tongue(ctx: CanvasRenderingContext2D, b: Body, x: number, y: number, r: number): void {
  const way = WAY[blisterWayOf(b.c)];
  const along = blisterSwipeShare(b.world, b.c);
  const reach = r * 1.2 + Math.max(0, b.l.tile * along - r * 1.2);
  const tx = b.x + way.dx * reach;
  const ty = b.y + way.dy * reach;
  const wave = Math.sin(b.time * 5) * r * 0.06;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo((x + tx) / 2 - way.dy * wave, (y + ty) / 2 + way.dx * wave, tx, ty);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.62;
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.9);
  ctx.stroke();
  ctx.lineWidth = r * 0.44;
  ctx.strokeStyle = PALETTE.red;
  ctx.stroke();
}

const WAY = {
  down: { dx: 0, dy: 1 },
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  left: { dx: -1, dy: 0 },
} as const;
