import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { blisterTurnShare, blisterTurnWayOf } from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** Segments down the worm, head first. */
const SEGMENTS = 16;

/** How far round the channel the worm reaches behind its head, in turns. */
const LENGTH = 0.42;

/** The channel's distance out of the body's rim, in tiles: `blister-turn-help.ts`'s. */
const OUT_TILES = 0.45;

/** How far inside the channel the worm lies, in body radii. */
const INSIDE = 0.62;

/**
 * WORM: only a mound with a burrow in it comes up out of the pore; the worm
 * that lives there lies curled just inside the turn's channel, its head a
 * little ahead of the knob and facing the way the turn runs — so before a
 * thumb is on it the head says which way round to go, and as the knob goes
 * round the worm crawls round with it, its tail behind.
 */
export function drawWormMound(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  // The mound's foot, on the pore once risen and pushed down into it until then.
  const base = f.poreY + (1 - f.rise) * r * 1.8;
  ctx.save();
  const mound = new Path2D();
  mound.ellipse(x, base, r * 1.3, r * 1.1, 0, Math.PI, TAU);
  const g = ctx.createLinearGradient(0, base - r, 0, base);
  g.addColorStop(0, rgba(PALETTE.hull, 0.9));
  g.addColorStop(1, PALETTE.redDark);
  ctx.fillStyle = g;
  ctx.fill(mound);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(mound);
  ctx.restore();
}

/** The worm in the channel, drawn past the pore since the channel goes round under it. */
export function drawWormInChannel(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const sign = blisterTurnWayOf(b.c) === "cw" ? 1 : -1;
  const knob = -Math.PI / 2 + sign * blisterTurnShare(b.c) * TAU;
  // Just inside the channel, clear of the track the help draws over it.
  const ring = r + b.l.tile * OUT_TILES - r * INSIDE;
  const head = knob + sign * 0.42;
  ctx.save();
  const pts: { x: number; y: number; w: number }[] = [];
  for (let i = SEGMENTS; i >= 0; i--) {
    const t = i / SEGMENTS;
    const a = head - sign * t * LENGTH * TAU;
    const wob = Math.sin(b.time * 6 - t * 9) * r * 0.05;
    pts.push({
      x: b.x + Math.cos(a) * (ring + wob),
      y: b.y + Math.sin(a) * (ring + wob),
      w: r * (0.3 - 0.12 * t),
    });
  }
  const rim = Math.max(1.2, r * 0.07);
  ctx.fillStyle = rgba(PALETTE.redRim, 0.9);
  for (const p of pts) disc(ctx, p.x, p.y, p.w + rim);
  for (const [i, p] of pts.entries()) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.red : rgba(PALETTE.red, 0.8);
    disc(ctx, p.x, p.y, p.w);
  }
  // The head: two eyes looking ahead, the way the turn runs.
  const hx = b.x + Math.cos(head) * ring;
  const hy = b.y + Math.sin(head) * ring;
  const fx = -Math.sin(head) * sign;
  const fy = Math.cos(head) * sign;
  for (const side of [-1, 1] as const) {
    const ex = hx + fx * r * 0.12 + -fy * side * r * 0.14;
    const ey = hy + fy * r * 0.12 + fx * side * r * 0.14;
    ctx.fillStyle = PALETTE.text;
    disc(ctx, ex, ey, r * 0.09);
    ctx.fillStyle = PALETTE.background;
    disc(ctx, ex + fx * r * 0.03, ey + fy * r * 0.03, r * 0.05);
  }
  ctx.restore();
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}
