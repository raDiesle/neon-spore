import type { BlisterFrame } from "../../../../../packages/render/src/blister-bodies.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { blisterLeverDepth } from "../../../../../packages/sim/src/index.js";

const TAU = Math.PI * 2;

/** How much bigger than the clover TAFFY is drawn (the owner, 15 October 2026: *some bigger*). */
const TAFFY_SIZE = 1.4;

/** Discs down the nose: enough that they run together into one limb. */
const STEPS = 26;

/**
 * TAFFY: the slime itself is the lever, and what the thumb takes is its nose.
 * A soft round body stands up out of the pore with its eyes high on its crown,
 * and from between them a long soft nose hangs down over the pore, its round
 * tip hanging out under the knob — the knob pinches it there. Pulled, the nose
 * is drawn out down the groove, thinning in the middle, and the body above
 * sags as it gives up what went down — its eyes squeezed shut the further it
 * goes. Let go, and it is all back up. On the partner's screen the nose alone
 * says how far down it is.
 */
export function drawTaffyBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const t = taffy(b, f);
  const body = new Path2D();
  body.ellipse(b.x, t.base - t.tall * 0.55, t.wide, t.tall, 0, 0, TAU);
  ctx.save();
  slime(ctx, body, b.x, t.base - t.tall, t.wide, t.r);
  for (const side of [-1, 1] as const) eye(ctx, b.x + side * t.wide * 0.42, t.eyeY, t.r, t.pull);
  ctx.restore();
}

/** The nose, from between the eyes down past the pore to its tip under the knob. */
export function drawTaffyNose(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const t = taffy(b, f);
  const r = t.r;
  const length = (b.world.cfg.blisterLeverMilli * b.l.tile) / 1000;
  const knob = b.y + t.pull * length;
  const tip = knob + r * 0.75;
  const top = t.eyeY + r * 0.2;
  const pts: { y: number; w: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const s = i / STEPS;
    // Fat at the face, swelling to the tip, and pinched in the middle the
    // further it is drawn out.
    const pinch = 1 - (0.25 + 0.4 * t.pull) * Math.sin(Math.PI * s);
    pts.push({ y: top + (tip - top) * s, w: r * (0.26 + 0.1 * s) * pinch });
  }
  ctx.save();
  const rim = Math.max(1.2, r * 0.07);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.9);
  for (const p of pts) disc(ctx, b.x, p.y, p.w + rim);
  disc(ctx, b.x, tip, r * 0.42 + rim);
  ctx.fillStyle = PALETTE.hull;
  for (const p of pts) disc(ctx, b.x, p.y, p.w);
  disc(ctx, b.x, tip, r * 0.42);
  // A wet glint on the tip, so it catches the eye wherever the knob leaves it.
  ctx.fillStyle = rgba(PALETTE.text, 0.55);
  disc(ctx, b.x - r * 0.14, tip - r * 0.14, r * 0.1);
  ctx.restore();
}

/** Where the body stands this frame, shared by the body and its nose. */
function taffy(b: Body, f: BlisterFrame) {
  const r = f.r * TAFFY_SIZE;
  // Where the body sits on the pore once risen, pushed down into it until then.
  const base = f.poreY + (1 - f.rise) * r * 1.8;
  const pull = blisterLeverDepth(b.world, b.c);
  const tall = r * 1.35 * (1 - 0.3 * pull);
  const wide = r * 1.35 * (1 + 0.12 * pull);
  return { r, base, pull, tall, wide, eyeY: base - tall * 1.25 };
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
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(path);
}

/** One eye: open at rest, squeezed to a line as the nose is drawn out. */
function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, pull: number): void {
  const open = Math.max(0.15, 1 - pull * 1.4);
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.22, r * 0.25 * open, 0, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.strokeStyle = PALETTE.redDark;
  ctx.stroke();
  if (open < 0.5) return;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.1, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}
