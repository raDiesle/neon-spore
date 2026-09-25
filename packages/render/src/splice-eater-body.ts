import { SAC_SKIN, sacPoints } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE SPLICE eater's body (`splice-eater.ts` says when and where): the shape
 * sheet's TENDRIL draft laid on its side, grown out of the hold's right wall
 * and stretched to a length rather than moved, so it never comes loose from
 * the ship it is part of. Its fat end is the head: a round lamprey mouth ringed
 * with teeth, three slit eyes over it, suckers under it, and drool hanging off
 * it that lengthens as it gets hungrier. Returns where the mouth is, which is
 * where the tongue starts.
 */

/** The TENDRIL draft's numbers (`tools/shape-sheet/src/drafts/creatures.ts`). */
const BIAS = 0.34;
const RX = 24;
const RY = 66;
/** Where its ends fall in those units, from `sacPoints`'s bias; the fat end is the head. */
const TOP = RY * (1 - BIAS);
const SPAN = RY * (1 + BIAS) + TOP;

export interface EaterPose {
  /** From the wall to the tip of the head, and across the body, in pixels. */
  len: number;
  wide: number;
  /** How far the head hangs below the root. */
  sag: number;
  /** 0 shut, 1 gaping. */
  open: number;
  /** 0 to 1: how long the drool is, and how often it drips. */
  hunger: number;
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, open: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * (0.35 + 0.4 * open), -0.2, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.podRim;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - r * 0.15, y, r * 0.16, r * (0.3 + 0.35 * open), 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
}

function drawDrool(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wide: number,
  hunger: number,
  b: number,
): void {
  const hang = wide * (0.25 + 1.1 * hunger) * (0.85 + 0.15 * Math.sin(b * Math.PI));
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.6);
  ctx.fillStyle = rgba(PALETTE.redRim, 0.75);
  ctx.lineWidth = Math.max(1, wide * 0.05);
  for (const [dx, k] of [
    [-0.04, 1],
    [0.09, 0.6],
  ] as const) {
    const sx = x + wide * dx;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.quadraticCurveTo(
      sx + Math.sin(b * 2.1 + dx) * wide * 0.06,
      y + hang * k * 0.6,
      sx,
      y + hang * k,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, y + hang * k, wide * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }
  if (hunger < 0.15) return;
  // A drop let go, falling and fading, once a beat.
  const f = (((b * 0.9 + 0.3) % 1) + 1) % 1;
  ctx.fillStyle = rgba(PALETTE.redRim, 0.7 * (1 - f));
  ctx.beginPath();
  ctx.arc(x - wide * 0.04, y + hang + f * f * wide * 3.5, wide * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/** One body out of the wall at `x, y`, lying leftward. */
export function drawEaterBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pose: EaterPose,
  b: number,
): { x: number; y: number } {
  const { len, wide, sag, open, hunger } = pose;
  const ky = wide / (RX * 2);
  const along = (f: number) => ({ x: x - f * len, y: y + sag * f * f });
  const pts = sacPoints(b * 0.3, BIAS, RX, RY, SAC_SKIN, 32).map((p) => {
    const a = along(1 - (p.y + TOP) / SPAN);
    return { x: a.x, y: a.y + p.x * ky };
  });
  const path = splinePath(pts, true);
  const fill = ctx.createLinearGradient(x, 0, x - len, 0);
  fill.addColorStop(0, PALETTE.redDark);
  fill.addColorStop(0.45, rgba(PALETTE.red, 0.7));
  fill.addColorStop(1, PALETTE.red);
  ctx.fillStyle = fill;
  ctx.fill(path);
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.55);
  ctx.lineWidth = Math.max(1, wide * 0.05);
  ctx.stroke(path);

  // Suckers along its underside, dark pits with a lit lip.
  ctx.lineWidth = Math.max(0.8, wide * 0.03);
  for (let i = 0; i < 4; i++) {
    const a = along(0.25 + i * 0.13);
    ctx.beginPath();
    ctx.arc(a.x, a.y + wide * 0.2, wide * (0.04 + i * 0.012), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.redDark, 0.85);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.redRim, 0.45);
    ctx.stroke();
  }
  for (const [f, r] of [
    [0.58, 0.07],
    [0.68, 0.09],
    [0.78, 0.11],
  ] as const) {
    const a = along(f);
    drawEye(ctx, a.x, a.y - wide * 0.24, wide * r, open);
  }

  // The mouth at the tip, round, ringed with teeth pointing in.
  const m = along(0.9);
  const rx = wide * (0.1 + 0.08 * open);
  const ry = wide * (0.16 + 0.16 * open);
  ctx.beginPath();
  ctx.ellipse(m.x, m.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.redDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.redRim;
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.text, 0.85);
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.5;
    for (const [s, d] of [
      [a - 0.3, 1],
      [a, 0.55],
      [a + 0.3, 1],
    ] as const) {
      const px = m.x + Math.cos(s) * rx * d;
      const py = m.y + Math.sin(s) * ry * d;
      if (d === 1 && s < a) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }
  ctx.fill();
  drawDrool(ctx, m.x, m.y + ry * 0.8, wide, hunger, b);

  // The wall's lip closed round its root, so it grows out of the ship rather
  // than lying over it.
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(x, y, wide * 0.2, wide * 0.62, 0, Math.PI * 0.55, Math.PI * 1.45);
  ctx.strokeStyle = rgba(PALETTE.sheenMid, 0.85);
  ctx.lineWidth = Math.max(2, wide * 0.18);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.4);
  ctx.lineWidth = Math.max(1, wide * 0.05);
  ctx.stroke();
  return m;
}
