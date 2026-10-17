import { type BlisterDying, during } from "../../../../../packages/render/src/blister-death.js";
import { signedHash, sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * ERASE: rubbed out like pencil. A zigzag edge scrubs down the body from the
 * top, and everything above it is gone — the white stroke of the rub running
 * along the edge as it goes, and crumbs of the body rolling off it and
 * dropping to the skin round the pore.
 */
export function drawErase(d: BlisterDying): void {
  const { ctx, x, y, r, poreY } = d;
  const t = during(d.at, 0.02, 0.75);
  // The edge, from above the body's crown to below its pore.
  const top = y - r * 2.1;
  const edge = top + (poreY + r * 0.4 - top) * t;
  ctx.save();
  scrubbed(ctx, x, edge, r, d.time, r * 6);
  ctx.clip();
  d.body(1);
  d.control(1);
  ctx.restore();
  if (t > 0 && t < 1) stroke(ctx, x, edge, r, d.time, 1 - during(d.at, 0.65, 0.8));
  crumbs(ctx, d, top);
}

/** Everything below a zigzag at `edge`, as a path: the part not yet rubbed out. */
function scrubbed(
  ctx: CanvasRenderingContext2D,
  x: number,
  edge: number,
  r: number,
  time: number,
  reach: number,
): void {
  ctx.beginPath();
  zigzag(ctx, x, edge, r * 3.2, time);
  ctx.lineTo(x + reach, edge + reach);
  ctx.lineTo(x - reach, edge + reach);
  ctx.closePath();
}

/** The rub's zigzag, `w` either side of the middle, its teeth a fixed size
 * and shuffling with the scrub. */
function zigzag(
  ctx: CanvasRenderingContext2D,
  x: number,
  edge: number,
  w: number,
  time: number,
): void {
  const tooth = w / 5;
  const teeth = Math.round((2 * w) / tooth);
  const shuffle = Math.sin(time * 40) * tooth * 0.2;
  for (let i = 0; i <= teeth; i++) {
    const px = x - w + tooth * i + shuffle;
    const py = edge + (i % 2 === 0 ? -1 : 1) * tooth * 0.35;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
}

/** The white stroke along the edge, as THE RUB LAB's drop draws its zigzag. */
function stroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  edge: number,
  r: number,
  time: number,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  // Only across the body: the edge that clips runs wider, so nothing of it
  // is missed, but the stroke a thumb would leave is the body's width.
  zigzag(ctx, x, edge, r * 1.3, time);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.16;
  ctx.strokeStyle = rgba("#FFFFFF", 0.9 * a);
  ctx.stroke();
  ctx.restore();
}

/** Crumbs off the edge: each comes off as the edge passes its height and falls to the skin. */
function crumbs(ctx: CanvasRenderingContext2D, d: BlisterDying, top: number): void {
  const { x, r, poreY } = d;
  const fade = 1 - during(d.at, 0.8, 1);
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const k = (i + 0.5) / 12;
    const born = 0.02 + 0.73 * k * 0.9;
    const age = (d.at - born) * 1.1;
    if (age <= 0) continue;
    const sx = x + signedHash(d.seed, i) * r * 1.5;
    const sy = top + (poreY - top) * k * 0.9;
    const floor = poreY + r * 0.15 * signedHash(d.seed, i, 1);
    const g = r * 18;
    const vx = signedHash(d.seed, i, 2) * r * 2.2;
    const py = Math.min(floor, sy + 0.5 * g * age * age);
    const px = sx + vx * Math.min(age, 0.35);
    const size = r * (0.1 + 0.06 * sinHash(d.seed, i, 3));
    ctx.beginPath();
    ctx.ellipse(px, py, size * 1.4, size, age * 9 * (i % 2 ? 1 : -1), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hull, 0.9 * fade);
    ctx.fill();
    ctx.lineWidth = r * 0.03;
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.7 * fade);
    ctx.stroke();
  }
  ctx.restore();
}
