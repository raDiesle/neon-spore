import { bakedCache } from "./baked.js";
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
 *
 * **`intensity` is how lit the line is, and `alpha` is whether it is there.**
 * `intensity` scales the glow passes only: the core stroke goes down at full
 * strength whatever it says, which is right for a thing that is there and dim.
 * A thing fading in or out — a ring running out, a flash, a streak on its
 * clock — passes its fade as `alpha`, which scales the core and the glow
 * together, so at 0 nothing is drawn. The caller's own `ctx.globalAlpha` is
 * not read, and is 1 when this returns. The lost screen's focus ring was the
 * case that found it: it came up at full strength over the open field on the
 * first frame of the arrival it was supposed to be fading through.
 *
 * **`spread` is in the context's own units, like `width`.** A caller that has
 * scaled the context passes one it has scaled too — `bodyGlowSpread` for a
 * body. Left off, it is `STROKE.glowSpread`, which is pixels only on an
 * unscaled context: THE PULSE's sockets, at a scale of about twenty, drew
 * clouds twenty times too wide that way (`pulse-body.ts`).
 */
export function strokeGlow(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  width: number = STROKE.outline,
  intensity = 1,
  alpha = 1,
  spread: number = STROKE.glowSpread,
): void {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = color;
  for (let i = STROKE.glowPasses; i >= 1; i--) {
    ctx.lineWidth = width + (i * spread) / STROKE.glowPasses;
    ctx.globalAlpha = (0.1 * intensity * alpha) / i;
    ctx.stroke(path);
  }
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
}

/**
 * How far a body's glow reaches, for the bodies drawn under a scale: the
 * living ones, the pod, the wreck and THE GHOST.
 *
 * Each draws its contour in its own units and divides its line width by the
 * scale, and until 23 September 2026 not the glow's spread, so the spread was
 * counted in the body's units too: at the median scale on a phone, 0.27, a
 * glow written to reach 5 px reached 1.4. That thin neon edge is what every
 * body has worn, and whether it stays is the owner's call through VERSUS
 * (`body:glow`), since the full reach roughly triples the edge on every body
 * on the field.
 */
export interface BodyGlow {
  /** How much of `STROKE.glowSpread` is counted on the screen rather than in
   * the body's own units: 0 is the thin edge, 1 the full 5 px. */
  onScreen: number;
}

export const BODY_GLOW: BodyGlow = { onScreen: 0 };

/** The spread to hand `strokeGlow` for a body drawn under `scale`, in its units. */
export function bodyGlowSpread(scale: number): number {
  return STROKE.glowSpread / scale ** BODY_GLOW.onScreen;
}

const haloCache = bakedCache<string, HTMLCanvasElement>();

/**
 * A pre-rendered radial gradient, cached per colour and size. The colour has to
 * be `#rrggbb` — a hex alpha is appended to it — and both it and the radius
 * have to come from a small fixed set, or the cache grows a canvas per frame.
 */
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
