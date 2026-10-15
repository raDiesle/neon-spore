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

/** Points down each flank of the stretched slug. */
const STEPS = 14;

/**
 * SLUG, one of SWIPE's two bodies (`blister-swipe-body.ts`): a slug's back end humps up out of the pore, and the rest of it lies
 * out along the swipe's channel, the channel down the middle of its back and
 * its head under the knob, two eye stalks reaching on ahead the way the stroke
 * runs. At rest it is all hump, stalks already pointing; carried, the head goes
 * with the knob and the slug stretches thin behind it, its tail kept in the pore.
 */
export function drawSlugHump(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  ctx.save();
  const hump = new Path2D();
  hump.ellipse(x, y + r * 0.2, r * 1.15, r * 0.95, 0, 0, TAU);
  ctx.fillStyle = slime(ctx, x, y, r);
  ctx.fill(hump);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.goodRim, 0.9);
  ctx.stroke(hump);
  ctx.restore();
}

/** The slug's front, from the hump to the knob, and its eye stalks: past the pore, since a stroke down runs over it. */
export function drawSlugStretched(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  // Sized round the knob, which lies on its head and is near the body's own size.
  const r = knobRadius(b) * 1.4 * f.rise;
  const way = WAY[blisterWayOf(b.c)];
  const along = blisterSwipeShare(b.world, b.c);
  const length = (b.world.cfg.blisterSwipeMilli * b.l.tile) / 1000;
  const head = { x: b.x + way.dx * length * along, y: b.y + way.dy * length * along };
  // Across the way: the slug's flanks lie either side of the channel.
  const nx = -way.dy;
  const ny = way.dx;
  ctx.save();
  const body = new Path2D();
  const flank = (side: number, i: number) => {
    const t = i / STEPS;
    // Thinner the further it is stretched, fattest at the head and at the hump.
    const w = r * (0.55 + 0.25 * t - 0.25 * along * Math.sin(t * Math.PI));
    const wob = Math.sin(b.time * 5 + t * 7) * r * 0.03;
    return {
      x: b.x + (head.x - b.x) * t + nx * side * (w + wob),
      y: b.y + (head.y - b.y) * t + ny * side * (w + wob),
    };
  };
  for (let i = 0; i <= STEPS; i++) {
    const p = flank(1, i);
    if (i === 0) body.moveTo(p.x, p.y);
    else body.lineTo(p.x, p.y);
  }
  // Round the head, the way the stroke runs.
  const hr = r * 0.8;
  const a0 = Math.atan2(ny, nx);
  body.arc(head.x, head.y, hr, a0, a0 - Math.PI, true);
  for (let i = STEPS; i >= 0; i--) {
    const p = flank(-1, i);
    body.lineTo(p.x, p.y);
  }
  body.closePath();
  ctx.fillStyle = slime(ctx, b.x, b.y, r);
  ctx.fill(body);
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.5, f.r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.goodRim, 0.9);
  ctx.stroke(body);
  for (const side of [-1, 1] as const) stalk(ctx, head, way, { nx, ny }, side, r, b.time);
  ctx.restore();
}

/** The slug's wet green, lighter on top. */
function slime(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): CanvasGradient {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 2.4);
  g.addColorStop(0, rgba(PALETTE.good, 0.95));
  g.addColorStop(1, rgba(PALETTE.good, 0.45));
  return g;
}

/** One eye stalk out of the head, reaching on ahead the way the stroke runs, a dark eye on its end. */
function stalk(
  ctx: CanvasRenderingContext2D,
  head: { x: number; y: number },
  way: { dx: number; dy: number },
  across: { nx: number; ny: number },
  side: number,
  r: number,
  time: number,
): void {
  const sway = Math.sin(time * 3 + side) * 0.08;
  const from = {
    x: head.x + way.dx * r * 0.6 + across.nx * side * r * 0.35,
    y: head.y + way.dy * r * 0.6 + across.ny * side * r * 0.35,
  };
  const reach = r * 0.85;
  const to = {
    x: from.x + (way.dx + across.nx * side * (0.45 + sway)) * reach,
    y: from.y + (way.dy + across.ny * side * (0.45 + sway)) * reach,
  };
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.16;
  ctx.strokeStyle = PALETTE.good;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(to.x, to.y, r * 0.16, 0, TAU);
  ctx.fillStyle = PALETTE.goodRim;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(to.x + way.dx * r * 0.04, to.y + way.dy * r * 0.04, r * 0.08, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}

/** The knob's radius as drawn: `blister-help.ts`'s, a pull handle's at four fifths, doubled by `PULL_SIZE`. */
function knobRadius(b: Body): number {
  return (b.l.tile * b.world.cfg.handleRadiusMilli * 0.8 * PULL_SIZE) / 1000;
}
