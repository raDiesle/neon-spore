import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/**
 * How much bigger than the drop the slime is drawn: the owner, 15 October
 * 2026, *hug also little bit bigger*.
 */
const HUG_SCALE = 1.25;

/**
 * HUG, one of THE BLISTER's two HOLD bodies (`blister-bodies.ts`): a round slime comes up out of the pore with the HOLD's drop held to
 * its belly in both arms, its eyes over the top of it. Nobody on it, the arms
 * rest loose round the drop's sides and the eyes are open; under a thumb it
 * hugs — the arms wrap in under the drop, the body bulges round it and the
 * eyes squeeze shut — and lets go when the thumb does. Taken from VERSUS,
 * 15 October 2026.
 */
export function drawHugBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const held = b.c.blisterHeldTicks !== undefined;
  const hug = held ? 1 : 0;
  ctx.save();
  // Bigger round the drop's middle, so the head and the eyes stand higher.
  ctx.translate(x, y);
  ctx.scale(HUG_SCALE, HUG_SCALE);
  ctx.translate(-x, -y);
  const body = new Path2D();
  body.ellipse(x, y - r * 0.25, r * (1.7 + 0.12 * hug), r * (1.6 - 0.06 * hug), 0, 0, TAU);
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.8, r * 0.1, x, y, r * 1.5);
  g.addColorStop(0, PALETTE.blue);
  g.addColorStop(1, rgba(PALETTE.blue, 0.75));
  ctx.fillStyle = g;
  ctx.fill(body);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.blueRim, 0.9);
  ctx.stroke(body);
  for (const side of [-1, 1] as const) {
    arm(ctx, x, y, r, side, hug);
    eye(ctx, x + side * r * 0.5, y - r * 1.55, r, side, held);
  }
  ctx.restore();
}

/** One arm, from the shoulder round the drop's side; hugging, it wraps on under the drop. */
function arm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: number,
  hug: number,
): void {
  const reach = 0.55 + 0.35 * hug;
  ctx.beginPath();
  const from = side > 0 ? -0.15 : Math.PI + 0.15;
  const to = side > 0 ? from + reach * Math.PI * 0.6 : from - reach * Math.PI * 0.6;
  ctx.arc(x, y, r * 1.62, from, to, side < 0);
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.32;
  ctx.strokeStyle = PALETTE.blueRim;
  ctx.stroke();
  ctx.lineWidth = r * 0.22;
  ctx.strokeStyle = PALETTE.blue;
  ctx.stroke();
}

/** Open and round while free; squeezed to a chevron pointing in, `> <`, while it hugs. */
function eye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  side: number,
  shut: boolean,
): void {
  ctx.beginPath();
  if (shut) {
    const w = r * 0.16;
    ctx.moveTo(x + side * w * 0.6, y - w * 0.7);
    ctx.lineTo(x - side * w * 0.6, y);
    ctx.lineTo(x + side * w * 0.6, y + w * 0.7);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1.5, r * 0.09);
    ctx.strokeStyle = PALETTE.background;
    ctx.stroke();
    return;
  }
  ctx.ellipse(x, y, r * 0.15, r * 0.19, 0, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + r * 0.04, r * 0.08, 0, TAU);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}
