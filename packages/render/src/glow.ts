import { STROKE } from "./palette.js";

/**
 * Glow without shadowBlur.
 *
 * `ctx.shadowBlur` is the single biggest frame-rate cost on mobile GPUs: it
 * forces a full-surface blur pass per draw. Two cheap replacements:
 *
 *  - `strokeGlow` draws the same path a few times, widest and faintest first.
 *  - `halo` blits one pre-rendered radial gradient with additive compositing,
 *    for point lights (bullets, impacts, beat pulses).
 *
 * Both stay inside render/. The simulation never knows they exist.
 */
export function strokeGlow(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  width: number = STROKE.outline,
  intensity = 1,
): void {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = color;
  for (let i = STROKE.glowPasses; i >= 1; i--) {
    ctx.lineWidth = width + (i * STROKE.glowSpread) / STROKE.glowPasses;
    ctx.globalAlpha = (0.1 * intensity) / i;
    ctx.stroke(path);
  }
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
  ctx.lineWidth = width;
  ctx.stroke(path);
}

const haloCache = new Map<string, HTMLCanvasElement>();

/** A pre-rendered radial gradient, cached per colour and size. */
export function haloSprite(color: string, radius: number): HTMLCanvasElement {
  const key = `${color}@${radius}`;
  const cached = haloCache.get(key);
  if (cached) return cached;

  const size = Math.ceil(radius * 2);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
    grad.addColorStop(0, color);
    grad.addColorStop(0.35, `${color}80`);
    grad.addColorStop(1, `${color}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  haloCache.set(key, c);
  return c;
}

export function halo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha = 1,
): void {
  const sprite = haloSprite(color, Math.max(2, Math.round(radius)));
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
