import { halo } from "./glow.js";
import { faded } from "./pod-fade.js";
import type { Seed } from "./pod-seed.js";
import { REAL_PAINT, type SeedPaint } from "./pod-seed-paint.js";
import { drawSkin, ringOn, type SkinKind } from "./pod-seed-skins.js";
import { drawSpikes, type SpikeKind } from "./pod-seed-spikes.js";

/**
 * **The seed, painted** — `pod-seed.ts` is the shape at a moment; this is the
 * halo, the far spikes, the lit body, its skin, its seam and the near spikes,
 * in a coat (`pod-seed-paint.ts`). Every pod form draws through here, real or
 * fake (`pod-forms.ts`).
 *
 * `drawBack` and `drawFront` are the two halves, for a form that draws
 * between the far spikes and the body or over the near ones.
 */

/** How the body is lit: `flash` 0..1 takes the whole sphere toward white. */
export interface SeedLight {
  flash?: number;
  /** Amber when not named (`REAL_PAINT`). */
  paint?: SeedPaint;
  /** SMART's own `stud` and `smooth` when not named (`pod-seed-spikes.ts`, `pod-seed-skins.ts`). */
  spike?: SpikeKind;
  skin?: SkinKind;
}

/** The halo and the studs round the back. Opens a `save` that `drawFront` closes. */
export function drawBack(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  const f = light.flash ?? 0;
  const paint = light.paint ?? REAL_PAINT;
  halo(
    ctx,
    s.x,
    s.y,
    s.r * (2.1 + 0.3 * s.pulse + 0.8 * f),
    paint.halo,
    0.12 + 0.08 * s.pulse + 0.3 * f,
  );
  ctx.save();
  ctx.lineCap = "round";
  drawSpikes(ctx, s, true, f, light.spike ?? "stud", paint);
}

/** The sphere, its seam and the near studs. */
export function drawFront(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  const f = light.flash ?? 0;
  const paint = light.paint ?? REAL_PAINT;
  const { x, y, R } = s;
  // The sphere, lit from up and to the left.
  const g = ctx.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.08, x, y, R);
  g.addColorStop(0, f > 0.5 ? paint.flashHi : paint.hi);
  g.addColorStop(0.45, f > 0.5 ? paint.flashMid : f > 0 ? paint.hi : paint.mid);
  g.addColorStop(1, f > 0 ? paint.mid : paint.lo);
  ctx.globalAlpha = faded(1);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = f > 0 ? paint.flashRim : paint.rim;
  ctx.lineWidth = Math.max(1.5, s.r * 0.1);
  ctx.globalAlpha = faded(0.85);
  ctx.stroke();

  drawSkin(ctx, s, light.skin ?? "smooth", paint);
  // The seam round the middle, on every one of them.
  ctx.strokeStyle = paint.seam;
  ringOn(ctx, s, (a) => ({ x: Math.cos(a), y: 0, z: Math.sin(a) }), R * 0.07);
  drawSpikes(ctx, s, false, f, light.spike ?? "stud", paint);
  ctx.restore();
}

export function drawSeed(ctx: CanvasRenderingContext2D, s: Seed, light: SeedLight = {}): void {
  drawBack(ctx, s, light);
  drawFront(ctx, s, light);
}
