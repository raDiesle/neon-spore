import { blisterRubbing } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** Tufts round the furred outline, left flank over the top to the right. */
const TUFTS = 22;

/**
 * PURR, one of RUB's three bodies (`blister-rub.ts`): a furry mound with two pointed ears comes up out of the pore, the
 * rub's drop on its back. Its fur lies smooth, and while a thumb is on it its
 * eyes close happy and the fur ripples under the hand. One blow and it is
 * gone, so it never bristles (until 15 October 2026 a blow made it bristle a
 * third more, `blister.ts`).
 */
export function drawPurrBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const rubbing = blisterRubbing(b.c);
  const cy = y + r * 0.15;
  ctx.save();
  for (const side of [-1, 1] as const) ear(ctx, x + side * r * 0.8, cy - r * 1.0, r, side);
  // The outline: a tuft every few degrees.
  const fur = new Path2D();
  for (let i = 0; i <= TUFTS; i++) {
    const t = i / TUFTS;
    const a = Math.PI * (0.9 + t * 1.2);
    const ripple = rubbing ? Math.sin(b.time * 18 + i) * 0.06 : 0;
    const out = 1.25 + (0.12 + ripple) * (i % 2 === 0 ? 1 : 0.3);
    const px = x + Math.cos(a) * r * out * 1.08;
    const py = cy + Math.sin(a) * r * out;
    if (i === 0) fur.moveTo(px, py);
    else fur.lineTo(px, py);
  }
  fur.lineTo(x + r * 1.3, f.poreY + r * 0.4);
  fur.lineTo(x - r * 1.3, f.poreY + r * 0.4);
  fur.closePath();
  const g = ctx.createRadialGradient(x, cy - r * 0.6, r * 0.1, x, cy, r * 1.5);
  g.addColorStop(0, rgba(PALETTE.ember, 0.95));
  g.addColorStop(0.7, rgba(PALETTE.ember, 0.6));
  g.addColorStop(1, PALETTE.podDark);
  ctx.fillStyle = g;
  ctx.fill(fur);
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.9);
  ctx.stroke(fur);
  for (const side of [-1, 1] as const) eye(ctx, x + side * r * 0.62, cy - r * 0.88, r, rubbing);
  ctx.restore();
}

function ear(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, side: number): void {
  const p = new Path2D();
  p.moveTo(x - side * r * 0.35, y + r * 0.3);
  p.lineTo(x + side * r * 0.25, y - r * 0.55);
  p.lineTo(x + side * r * 0.45, y + r * 0.35);
  p.closePath();
  ctx.fillStyle = PALETTE.ember;
  ctx.fill(p);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.9);
  ctx.stroke(p);
}

/** Open and round at rest; shut to a happy arc under a thumb. */
function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, happy: boolean): void {
  ctx.beginPath();
  if (happy) {
    ctx.arc(x, y + r * 0.08, r * 0.18, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineWidth = Math.max(1.2, r * 0.09);
    ctx.lineCap = "round";
    ctx.strokeStyle = PALETTE.podDark;
    ctx.stroke();
    return;
  }
  ctx.ellipse(x, y, r * 0.16, r * 0.2, 0, 0, TAU);
  ctx.fillStyle = PALETTE.podDark;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - r * 0.05, y - r * 0.06, r * 0.05, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
}
