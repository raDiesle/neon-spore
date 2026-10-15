import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { PULL_SIZE } from "../../../../../packages/render/src/pull-knob.js";
import {
  type BlisterSwipeWay,
  blisterSwipeShare,
  blisterWayOf,
} from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** Each way a stroke counts, as the unit step on the field: `blister-help.ts`'s. */
const WAY: Record<BlisterSwipeWay, { dx: number; dy: number }> = {
  down: { dx: 0, dy: 1 },
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  left: { dx: -1, dy: 0 },
};

/**
 * FROG: a squat frog comes up out of the pore, its wide mouth on the side the
 * stroke runs and both its bulging eyes looking that way. The swipe's channel
 * is its tongue: carried, the knob is the tongue's sticky tip and the tongue
 * runs out of the mouth behind it, as long as the thumb has taken it; lifted,
 * it snaps back in.
 */
export function drawFrogBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const way = WAY[blisterWayOf(b.c)];
  ctx.save();
  const body = new Path2D();
  body.ellipse(x, y + r * 0.15, r * 1.3, r * 1.0, 0, 0, TAU);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 1.5);
  g.addColorStop(0, rgba(PALETTE.cyan, 0.95));
  g.addColorStop(1, PALETTE.cyanDark);
  ctx.fillStyle = g;
  ctx.fill(body);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.cyanRim, 0.9);
  ctx.stroke(body);
  mouth(ctx, x, y + r * 0.15, r, way);
  // The eyes ride the top of the head, and look the way; when the mouth is up
  // there, they move out to the sides, clear of the tongue.
  const ex = way.dy < 0 ? r * 0.95 : r * 0.55;
  const ey = way.dy < 0 ? -r * 0.25 : -r * 0.7;
  for (const side of [-1, 1] as const) eye(ctx, x + side * ex, y + ey, r, way);
  ctx.restore();
}

/** The tongue, from the mouth to the knob: past the pore, since a stroke down runs over it. */
export function drawFrogTongue(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const along = blisterSwipeShare(b.world, b.c);
  if (along <= 0) return;
  const way = WAY[blisterWayOf(b.c)];
  const length = (b.world.cfg.blisterSwipeMilli * b.l.tile) / 1000;
  const lip = { x: b.x + way.dx * r * 0.9, y: b.y + r * 0.15 + way.dy * r * 0.8 };
  const tip = { x: b.x + way.dx * length * along, y: b.y + way.dy * length * along };
  // The tongue only shows once the knob is out past the lip.
  const out = (tip.x - lip.x) * way.dx + (tip.y - lip.y) * way.dy;
  if (out <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(lip.x, lip.y);
  ctx.lineTo(tip.x, tip.y);
  const k = knobRadius(b);
  ctx.lineWidth = k * 0.7;
  ctx.strokeStyle = PALETTE.redRim;
  ctx.stroke();
  ctx.lineWidth = k * 0.55;
  ctx.strokeStyle = rgba(PALETTE.red, 0.95);
  ctx.stroke();
  // The sticky tip, round the knob.
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, k * 0.75, 0, TAU);
  ctx.fillStyle = rgba(PALETTE.red, 0.95);
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, r * 0.08);
  ctx.strokeStyle = PALETTE.redRim;
  ctx.stroke();
  ctx.restore();
}

/** A wide grin on the rim the stroke runs out of. */
function mouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  way: { dx: number; dy: number },
): void {
  const a = Math.atan2(way.dy * 1.0, way.dx * 1.3);
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.12, r * 0.82, 0, a - 0.75, a + 0.75);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, r * 0.14);
  ctx.strokeStyle = PALETTE.cyanDark;
  ctx.stroke();
}

/** A bulging eye, its pupil to the side the stroke runs. */
function eye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  way: { dx: number; dy: number },
): void {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.36, 0, TAU);
  ctx.fillStyle = PALETTE.cyan;
  ctx.fill();
  ctx.lineWidth = Math.max(1.2, r * 0.08);
  ctx.strokeStyle = PALETTE.cyanRim;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.24, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + way.dx * r * 0.11, y + way.dy * r * 0.11, r * 0.12, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}

/** The knob's radius as drawn: `blister-help.ts`'s, a pull handle's at four fifths, doubled by `PULL_SIZE`. */
function knobRadius(b: Body): number {
  return (b.l.tile * b.world.cfg.handleRadiusMilli * 0.8 * PULL_SIZE) / 1000;
}
