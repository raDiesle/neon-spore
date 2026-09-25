import { SAC_SKIN, sacPoints } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE SPLICE eater's body (`splice-eater.ts` says when and where): the shape
 * sheet's TENDRIL draft, stretched to a length rather than moved, so it stays
 * attached to the ceiling it hangs from. Suckers down it, slit eyes, and a
 * mouth of teeth that opens by `open`. Returns where the mouth is, which is
 * where the tongue starts and the swallowed number glows.
 */

/** The TENDRIL draft's numbers (`tools/shape-sheet/src/drafts/creatures.ts`). */
const BIAS = 0.34;
const RX = 24;
const RY = 66;
/** Where its top and bottom fall in those units, from `sacPoints`'s bias. */
const TOP = RY * (1 - BIAS);
const SPAN = RY * (1 + BIAS) + TOP;

/** One body, `top` to `top + len`, `wide` across, its bottom swung by `sway`. */
export function drawEaterBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  len: number,
  wide: number,
  sway: number,
  open: number,
  b: number,
): { x: number; y: number } {
  const kx = wide / (RX * 2);
  const ky = len / SPAN;
  const pts = sacPoints(b * 0.3, BIAS, RX, RY, SAC_SKIN, 32).map((p) => {
    const y = top + (p.y + TOP) * ky;
    const f = (y - top) / len;
    return { x: x + p.x * kx + sway * f * f, y };
  });
  const path = splinePath(pts, true);
  const fill = ctx.createLinearGradient(0, top, 0, top + len);
  fill.addColorStop(0, PALETTE.redDark);
  fill.addColorStop(0.55, rgba(PALETTE.red, 0.75));
  fill.addColorStop(1, PALETTE.red);
  ctx.fillStyle = fill;
  ctx.fill(path);
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.6);
  ctx.lineWidth = Math.max(1, wide * 0.05);
  ctx.stroke(path);

  const mx = x + sway * 0.72;
  const my = top + len * 0.86;
  // Suckers down its length, dark pits with a lit lip, and its eyes: slits
  // that widen as it opens, a black pupil standing up in each.
  ctx.lineWidth = Math.max(0.8, wide * 0.03);
  for (let i = 0; i < 4; i++) {
    const f = 0.22 + i * 0.13;
    const sx = x + sway * f * f + (i % 2 ? 1 : -1) * wide * 0.12;
    const sr = wide * (0.07 - i * 0.008);
    ctx.beginPath();
    ctx.arc(sx, top + len * f, sr, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.redDark, 0.85);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.redRim, 0.45);
    ctx.stroke();
  }
  const ey = my - len * 0.2;
  for (const side of [-1, 1]) {
    const ex = mx + side * wide * 0.19;
    ctx.beginPath();
    ctx.ellipse(ex, ey, wide * 0.11, wide * (0.035 + 0.04 * open), side * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.podRim, 0.75 + 0.25 * open);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ex, ey, wide * 0.018, wide * (0.03 + 0.035 * open), 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.background;
    ctx.fill();
  }
  if (open > 0.05) {
    ctx.beginPath();
    ctx.ellipse(mx, my, wide * 0.3 * open, wide * 0.2 * open, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.redDark;
    ctx.fill();
    ctx.fillStyle = PALETTE.redRim;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const tx = mx + (i / 4 - 0.5) * wide * 0.44 * open;
      ctx.moveTo(tx - wide * 0.04, my - wide * 0.12 * open);
      ctx.lineTo(tx + wide * 0.04, my - wide * 0.12 * open);
      ctx.lineTo(tx, my - wide * 0.02 * open);
    }
    ctx.fill();
  }
  return { x: mx, y: my };
}
