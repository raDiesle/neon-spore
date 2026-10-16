import { withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * BINARY — two suns turning round each other, one eating the other.
 *
 * A large warm star and a small white one, high in the sky, circling a point
 * between them once a minute. A stream of gas pulled off the large one curls
 * across the gap into a bright little disc round the small one. Nothing on
 * the field moves with them — they turn in place, far off.
 *
 * The disc is one baked sprite; a frame is the stars, two glows, the stream
 * and the disc.
 */

const AT = { x: 0.58, y: 0.2 } as const;
/** How far apart they are, as a share of the width, and the orbit's tilt. */
const APART = 0.3;
const SQUASH = 0.35;
/** One orbit, in seconds. */
const PERIOD = 60;

function accretion(size: number): HTMLCanvasElement {
  return baked("binary-disc", size, size, (g, w) => {
    const r = w / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, withAlpha("#FFFFFF", 1));
    grad.addColorStop(0.2, withAlpha("#D8E4FF", 0.8));
    grad.addColorStop(0.55, withAlpha("#A8B8FF", 0.3));
    grad.addColorStop(1, withAlpha("#A8B8FF", 0));
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(r, r, r, r * 0.32, 0, 0, Math.PI * 2);
    g.fill();
  });
}

export function skyBinary(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 180_000, far: 180 });
  const tint = actTint(d, 0.35);
  const warm = mixHex(tint, "#FFC890", 0.65);

  const a = (time / PERIOD) * Math.PI * 2;
  const cx = l.width * AT.x;
  const cy = height * AT.y;
  const span = l.width * APART;
  // The big one is heavier and swings less.
  const big = { x: cx - Math.cos(a) * span * 0.3, y: cy - Math.sin(a) * span * 0.3 * SQUASH };
  const small = { x: cx + Math.cos(a) * span * 0.7, y: cy + Math.sin(a) * span * 0.7 * SQUASH };
  const bigR = l.width * 0.11;
  const nearSmall = Math.sin(a) > 0;

  lighter(ctx, () => {
    const halo = l.width * 1.2;
    ctx.globalAlpha = 0.3;
    ctx.drawImage(skyGlow(warm, halo), big.x - halo / 2, big.y - halo / 2, halo, halo);
    // The stream: off the big star's near limb, curling into the disc.
    const dx = small.x - big.x;
    const dy = small.y - big.y;
    const len = Math.hypot(dx, dy) || 1;
    const sx = big.x + (dx / len) * bigR * 0.9;
    const sy = big.y + (dy / len) * bigR * 0.9;
    const stream = ctx.createLinearGradient(sx, sy, small.x, small.y);
    stream.addColorStop(0, withAlpha(warm, 0.75));
    stream.addColorStop(1, withAlpha("#D8E4FF", 0.25));
    ctx.strokeStyle = stream;
    ctx.lineWidth = l.width * 0.014;
    ctx.lineCap = "round";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      (sx + small.x) / 2 - (dy / len) * span * 0.25,
      (sy + small.y) / 2 + (dx / len) * span * 0.25,
      small.x,
      small.y,
    );
    ctx.stroke();
    if (!nearSmall) drawSmall(ctx, small, l.width);
    const core = bigR * 2.6;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(
      skyGlow(warm, core, [0.3, 0.42, 1]),
      big.x - core / 2,
      big.y - core / 2,
      core,
      core,
    );
    if (nearSmall) drawSmall(ctx, small, l.width);
  });
}

function drawSmall(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number },
  width: number,
): void {
  const size = width * 0.24;
  ctx.globalAlpha = 0.95;
  ctx.drawImage(accretion(size), at.x - size / 2, at.y - size / 2, size, size);
}
