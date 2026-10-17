import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * UNZIP: the stroke was a zip. A lit slider runs down the body along the way
 * it was stroked, opening a toothed seam behind it, and the two halves come
 * apart either side of the seam, lean away from each other and drop out.
 */
export function drawUnzip(d: BlisterDying): void {
  const { ctx, x, y, r, poreY, way } = d;
  const zip = smoothstep(during(d.at, 0, 0.32));
  const part = smoothstep(during(d.at, 0.25, 0.85));
  const fall = during(d.at, 0.45, 1);
  // Across the seam: the way the halves part.
  const nx = -way.dy;
  const ny = way.dx;
  const fade = 1 - during(d.at, 0.75, 1);
  for (const side of [-1, 1] as const) {
    ctx.save();
    half(ctx, x, y, nx * side, ny * side, r * 6);
    ctx.globalAlpha *= fade;
    const open = r * 1.1 * part;
    d.body(
      1,
      bendAbout(x, poreY, {
        dx: nx * side * open,
        dy: ny * side * open + r * 2.4 * fall * fall,
        turn: side * 0.5 * part * (way.dx !== 0 ? -1 : 1),
      }),
    );
    ctx.restore();
  }
  d.control(1 - during(d.at, 0.1, 0.35));
  teeth(ctx, d, zip, 1 - during(d.at, 0.3, 0.6));
}

/** Clip to the half-plane on the `(nx, ny)` side of the line through `(x, y)`. */
function half(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  nx: number,
  ny: number,
  reach: number,
): void {
  const tx = ny;
  const ty = -nx;
  ctx.beginPath();
  ctx.moveTo(x + tx * reach, y + ty * reach);
  ctx.lineTo(x + tx * reach + nx * reach, y + ty * reach + ny * reach);
  ctx.lineTo(x - tx * reach + nx * reach, y - ty * reach + ny * reach);
  ctx.lineTo(x - tx * reach, y - ty * reach);
  ctx.closePath();
  ctx.clip();
}

/** The seam: teeth either side of it as far as the slider has run, and the slider. */
function teeth(ctx: CanvasRenderingContext2D, d: BlisterDying, zip: number, a: number): void {
  const { x, y, r, way } = d;
  if (a <= 0 || zip <= 0) return;
  const nx = -way.dy;
  const ny = way.dx;
  const from = -r * 1.3;
  const to = from + r * 2.6 * zip;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.9 * a);
  const step = r * 0.24;
  for (let s = from, i = 0; s < to; s += step, i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const cx = x + way.dx * s + nx * side * r * 0.1;
    const cy = y + way.dy * s + ny * side * r * 0.1;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x + way.dx * to, y + way.dy * to, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, a);
  ctx.fill();
  ctx.lineWidth = r * 0.06;
  ctx.strokeStyle = rgba(PALETTE.hull, a);
  ctx.stroke();
  ctx.restore();
}
