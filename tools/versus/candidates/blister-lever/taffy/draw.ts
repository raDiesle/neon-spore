import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { blisterLeverDepth } from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** Discs down the neck: enough that they run together into one limb. */
const STEPS = 26;

/**
 * TAFFY: the slime itself is the lever. A soft round body stands up out of the
 * pore, and where the thumb takes the knob it takes a piece of the body with
 * it: a neck of slime stretches from the pore down the groove to a drop round
 * the knob, thinning in the middle as it is drawn out, and the body above
 * sags as it gives up what went down — its eyes squeezed shut the further it
 * goes. Let go, and it is all back up in the pore. On the partner's screen
 * the stretched neck alone says how far down it is.
 */
export function drawTaffyBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  // Where the body sits on the pore once risen, pushed down into it until then.
  const base = f.poreY + (1 - f.rise) * r * 1.8;
  const pull = blisterLeverDepth(b.world, b.c);
  const tall = r * 1.35 * (1 - 0.35 * pull);
  const wide = r * 1.35 * (1 + 0.12 * pull);
  const body = new Path2D();
  body.ellipse(x, base - tall * 0.55, wide, tall, 0, 0, TAU);
  ctx.save();
  slime(ctx, body, x, base - tall, wide, r);
  const eyeY = base - tall * 1.15;
  for (const side of [-1, 1] as const) eye(ctx, x + side * wide * 0.4, eyeY, r, pull);
  ctx.restore();
}

/** The neck, from the pore down to a drop held round the knob. */
export function drawTaffyNeck(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const length = (b.world.cfg.blisterLeverMilli * b.l.tile) / 1000;
  const knob = b.y + blisterLeverDepth(b.world, b.c) * length;
  const top = f.poreY - r * 0.15;
  if (knob - top < r * 0.2) return;
  const pts: { y: number; w: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    // Wide at the pore, thinnest two thirds down, and swelling to the drop.
    const thin = 0.72 - 0.95 * t + 0.95 * t * t;
    pts.push({ y: top + (knob - top) * t, w: r * Math.max(0.2, thin) });
  }
  ctx.save();
  const rim = Math.max(1.2, r * 0.08);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  for (const p of pts) disc(ctx, b.x, p.y, p.w + rim);
  disc(ctx, b.x, knob, r * 0.85 + rim);
  ctx.fillStyle = PALETTE.hull;
  for (const p of pts) disc(ctx, b.x, p.y, p.w);
  disc(ctx, b.x, knob, r * 0.85);
  ctx.restore();
}

/** A body's fill: lit violet at the crown going to the dark of the field, and a rim. */
function slime(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  x: number,
  y: number,
  reach: number,
  r: number,
): void {
  const g = ctx.createRadialGradient(
    x - reach * 0.3,
    y,
    reach * 0.1,
    x,
    y + reach * 0.5,
    reach * 1.3,
  );
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(0.6, rgba(PALETTE.hull, 0.6));
  g.addColorStop(1, PALETTE.redDark);
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(path);
}

/** One eye: open at rest, squeezed to a line as the neck is drawn out. */
function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, pull: number): void {
  const open = Math.max(0.15, 1 - pull * 1.4);
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.24, r * 0.27 * open, 0, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeStyle = PALETTE.redDark;
  ctx.stroke();
  if (open < 0.5) return;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.06, r * 0.11, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}
