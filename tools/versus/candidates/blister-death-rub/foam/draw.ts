import { type BlisterDying, during } from "../../../../../packages/render/src/blister-death.js";
import { signedHash, sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * FOAM: scrubbed to suds. Bubbles break out all over the body as it is rubbed
 * — more and more of them while the body fades under them — and then the foam
 * lifts off the tile, wobbling, and each bubble pops on its own.
 */
export function drawFoam(d: BlisterDying): void {
  const { ctx } = d;
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.1, 0.55);
  d.body(1);
  d.control(1);
  ctx.restore();
  bubbles(ctx, d);
}

const BUBBLES = 16;

function bubbles(ctx: CanvasRenderingContext2D, d: BlisterDying): void {
  const { x, y, r } = d;
  ctx.save();
  for (let i = 0; i < BUBBLES; i++) {
    const born = 0.38 * sinHash(d.seed, i);
    const pops = 0.55 + 0.4 * sinHash(d.seed, i, 1);
    const age = d.at - born;
    if (age <= 0) continue;
    // Somewhere over the body, a little more of them low down where it was rubbed.
    const ox = signedHash(d.seed, i, 2) * r * 1.3;
    const oy = (sinHash(d.seed, i, 3) - 0.6) * r * 2;
    const rise = r * 2.2 * age * age;
    const wob = Math.sin((d.time + i) * 9) * r * 0.12 * age;
    const px = x + ox + wob;
    const py = y + oy - rise;
    if (d.at < pops) {
      const size = r * (0.16 + 0.22 * sinHash(d.seed, i, 4)) * Math.min(1, age * 7);
      bubble(ctx, px, py, size);
    } else {
      pop(ctx, px, py, r * 0.3, during(d.at, pops, pops + 0.12));
    }
  }
  ctx.restore();
}

/** One bubble: a thin lit skin, faint inside, a window of light on it. */
function bubble(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hull, 0.18);
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.16);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y - size * 0.35, size * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.85);
  ctx.fill();
}

/** A pop: four short ticks out from where the bubble was. */
function pop(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  if (t >= 1) return;
  ctx.lineCap = "round";
  ctx.lineWidth = r * 0.25 * (1 - t);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 1 - t);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const from = r * (0.4 + 0.8 * t);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * from, y + Math.sin(a) * from);
    ctx.lineTo(x + Math.cos(a) * (from + r * 0.4), y + Math.sin(a) * (from + r * 0.4));
    ctx.stroke();
  }
}
