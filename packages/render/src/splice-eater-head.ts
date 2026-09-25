import { blobPoints } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE SPLICE eater's head (`splice-eater-body.ts` puts it on its neck): a big
 * red alien head, upright, looking down at the numbers (the owner,
 * 25 September 2026: *more like a red head of an alien, bigger*).
 *
 * It is the shape sheet's **SYMBIOSIS** held merged — a cranium and a jaw in
 * one membrane — and the jaw drops away from the cranium as the mouth opens.
 * Two slanted eyes follow whatever it is about to snap at. Returns where the
 * mouth is, which is where the tongue starts.
 */

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  tilt: number,
  look: { x: number; y: number },
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.55, tilt, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.redDark;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.86, r * 0.44, tilt, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.pod;
  ctx.fill();
  const a = Math.atan2(look.y - y, look.x - x);
  ctx.beginPath();
  ctx.ellipse(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.2, r * 0.12, r * 0.38, 0, 0, 7);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.podRim, 0.9);
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.14, r * 0.1, 0, Math.PI * 2);
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
  const hang = wide * (0.12 + 0.55 * hunger) * (0.85 + 0.15 * Math.sin(b * Math.PI));
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.6);
  ctx.fillStyle = rgba(PALETTE.redRim, 0.75);
  ctx.lineWidth = Math.max(1, wide * 0.025);
  for (const [dx, k] of [
    [-0.13, 1],
    [0.1, 0.6],
    [0.02, 0.35],
  ] as const) {
    const sx = x + wide * dx;
    const wag = Math.sin(b * 2.1 + dx) * wide * 0.03;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.quadraticCurveTo(sx + wag, y + hang * k * 0.6, sx, y + hang * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, y + hang * k, wide * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }
  if (hunger < 0.15) return;
  // A drop let go, falling and fading, once a beat.
  const f = (((b * 0.9 + 0.3) % 1) + 1) % 1;
  ctx.fillStyle = rgba(PALETTE.redRim, 0.7 * (1 - f));
  ctx.beginPath();
  ctx.arc(x - wide * 0.13, y + hang + f * f * wide * 1.6, wide * 0.025, 0, Math.PI * 2);
  ctx.fill();
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  m: { x: number; y: number },
  wide: number,
  open: number,
): number {
  const mw = wide * 0.24;
  const mh = wide * (0.03 + 0.1 * open);
  ctx.beginPath();
  ctx.ellipse(m.x, m.y, mw, mh, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.fill();
  // A row of teeth each side of it, pointing in.
  ctx.fillStyle = rgba(PALETTE.text, 0.9);
  ctx.beginPath();
  const tw = mw * 0.14;
  const reach = mh * 0.9 + wide * 0.02;
  for (let k = 0; k < 5; k++) {
    const tx = m.x - mw * 0.8 + (k / 4) * mw * 1.6;
    ctx.moveTo(tx - tw, m.y - mh * 0.85);
    ctx.lineTo(tx, m.y - mh * 0.85 + reach);
    ctx.lineTo(tx + tw, m.y - mh * 0.85);
    ctx.moveTo(tx - tw + mw * 0.2, m.y + mh * 0.85);
    ctx.lineTo(tx + mw * 0.2, m.y + mh * 0.85 - reach);
    ctx.lineTo(tx + tw + mw * 0.2, m.y + mh * 0.85);
  }
  ctx.fill();
  return mh;
}

/** The head centred at `h`, `wide` across. */
export function drawEaterHead(
  ctx: CanvasRenderingContext2D,
  h: { x: number; y: number },
  wide: number,
  open: number,
  hunger: number,
  look: { x: number; y: number },
  b: number,
): { x: number; y: number } {
  const cranium = splinePath(
    blobPoints(h.x, h.y - wide * 0.08, wide * 0.5, wide * 0.4, 3, 0.05, 0.04, b * 0.4, 4.7, 28),
    true,
  );
  const drop = wide * 0.1 * open;
  const jaw = splinePath(
    blobPoints(
      h.x - wide * 0.04,
      h.y + wide * 0.26 + drop,
      wide * 0.3,
      wide * (0.2 + 0.05 * open),
      2,
      0.05,
      0.03,
      b * 0.5,
      1.3,
      22,
    ),
    true,
  );
  // Each part is stroked first and both are filled after, so the outline is
  // round the pair and not between them.
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.6);
  ctx.lineWidth = Math.max(1.5, wide * 0.05);
  ctx.stroke(cranium);
  ctx.stroke(jaw);
  const flesh = ctx.createRadialGradient(
    h.x - wide * 0.18,
    h.y - wide * 0.24,
    wide * 0.04,
    h.x,
    h.y,
    wide * 0.62,
  );
  flesh.addColorStop(0, PALETTE.redRim);
  flesh.addColorStop(0.35, PALETTE.red);
  flesh.addColorStop(1, rgba(PALETTE.red, 0.55));
  for (const part of [jaw, cranium]) {
    ctx.fillStyle = PALETTE.redDark;
    ctx.fill(part);
    ctx.fillStyle = flesh;
    ctx.fill(part);
  }

  // A brow ridge over the eyes and a few pits in the dome.
  ctx.strokeStyle = rgba(PALETTE.redDark, 0.45);
  ctx.lineWidth = Math.max(1, wide * 0.035);
  ctx.beginPath();
  ctx.moveTo(h.x - wide * 0.36, h.y - wide * 0.06);
  ctx.quadraticCurveTo(h.x, h.y - wide * 0.2, h.x + wide * 0.36, h.y - wide * 0.06);
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.redDark, 0.3);
  for (const [dx, dy, r] of [
    [-0.2, -0.3, 0.035],
    [0.12, -0.34, 0.03],
    [0.26, -0.22, 0.025],
  ] as const) {
    ctx.beginPath();
    ctx.arc(h.x + wide * dx, h.y + wide * dy, wide * r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const s of [-1, 1]) {
    drawEye(ctx, h.x + s * wide * 0.2, h.y + wide * 0.01, wide * 0.14, s * 0.35, look);
  }

  const m = { x: h.x - wide * 0.04, y: h.y + wide * 0.2 + drop * 0.5 };
  const mh = drawMouth(ctx, m, wide, open);
  drawDrool(ctx, m.x, m.y + mh * 0.8, wide, hunger, b);
  return m;
}
