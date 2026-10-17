import {
  type BlisterDying,
  bendAbout,
  during,
} from "../../../../../packages/render/src/blister-death.js";
import { signedHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * YANK: the lever pulls it under. The body is drawn down thin and tall by its
 * cord, holds for an instant at the lip, and is sucked through the pore in one
 * go — the skin round the hole rippling out after it and three drops thrown up
 * out of the hole as it shuts.
 */
export function drawYank(d: BlisterDying): void {
  const { ctx, x, r, poreY } = d;
  const draw = Math.sin(Math.PI * 0.5 * during(d.at, 0, 0.2));
  const suck = during(d.at, 0.2, 0.42);
  const h = 1 - suck * suck;
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.85, 1);
  d.body(Math.max(0, h), bendAbout(x, poreY, { sx: 1 - 0.45 * draw, sy: 1 + 0.35 * draw }));
  ctx.restore();
  d.control(1 - during(d.at, 0.15, 0.4));
  ripples(ctx, x, poreY, r, during(d.at, 0.38, 1));
  plop(ctx, d, x, poreY, r, d.age - 0.42 * 0.9);
}

/** Two rings out across the skin from the pore, flat in its perspective. */
function ripples(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  if (t <= 0 || t >= 1) return;
  ctx.save();
  for (const lag of [0, 0.25]) {
    const k = (t - lag) / (1 - lag);
    if (k <= 0) continue;
    const reach = r * (0.8 + 1.8 * k);
    ctx.beginPath();
    ctx.ellipse(x, y, reach, reach * 0.28, 0, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.1 * (1 - k);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.8 * (1 - k));
    ctx.stroke();
  }
  ctx.restore();
}

/** Three drops thrown up out of the hole after the body, falling back into it. */
function plop(
  ctx: CanvasRenderingContext2D,
  d: BlisterDying,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  if (t <= 0) return;
  const g = r * 30;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hull, 0.95);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
  ctx.lineWidth = r * 0.04;
  for (let i = 0; i < 3; i++) {
    const vy = -r * (6 + 2 * i);
    const vx = signedHash(d.seed, i) * r * 1.6;
    const py = y + vy * t + 0.5 * g * t * t;
    if (py > y) continue;
    ctx.beginPath();
    ctx.arc(x + vx * t, py, r * (0.16 - 0.03 * i), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
