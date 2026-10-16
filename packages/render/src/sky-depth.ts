import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { actTint, baked, paintSpace, starSheet } from "./sky-kit.js";

/**
 * The deep sky behind every sky's one big thing: three depths, each moving at
 * its own pace, which is what turns a flat black into distance.
 *
 * - **far stars**, many and dim, still;
 * - **a haze** of the act's colour and a cooler second hue, soft clouds
 *   drifting sideways very slowly;
 * - **near stars**, fewer and brighter, drifting a little faster than the
 *   haze, ten of them twinkling with a small cross of light.
 *
 * The drift is sideways and slow — two motes' worth, the sea's own speed — so
 * it reads as the sky turning far away and never as the ship flying, which it
 * does not. Every value is a function of the layout, the wave and own-motion's
 * clock; the sheets are baked once per size and tint.
 */

export interface Depth {
  /** Keeps one sky's stars and clouds out of another's. */
  readonly seed: number;
  /** How many far stars, and how many near ones. */
  readonly far?: number;
  readonly near?: number;
  /** How loud the haze is, 0 for none. */
  readonly haze?: number;
  /** Where far stars may be, and its name for the cache (`starSheet`). */
  readonly weight?: (x: number, y: number) => number;
  readonly key?: string;
}

/** Widths per second. The near layer is three times the haze, the far one still. */
const HAZE_DRIFT = 0.0025;
const NEAR_DRIFT = 0.0075;
const TWINKLES = 10;

/** Soft clouds over a sheet two widths wide, every one drawn three times a
 * period apart so the sheet tiles sideways without a seam. */
function hazeSheet(tint: string, w: number, h: number, seed: number): HTMLCanvasElement {
  return baked(`haze${seed},${tint}`, w * 2, h, (g, pw, ph) => {
    const cool = mixHex(tint, "#5070B8", 0.5);
    for (let i = 0; i < 22; i++) {
      const s = seed + 500 + i * 5;
      const x = hash01(s + 1) * pw;
      const y = hash01(s + 2) * ph;
      const r = pw * (0.08 + hash01(s + 3) * 0.16);
      const colour = hash01(s + 4) < 0.35 ? cool : tint;
      const a = 0.1 + hash01(s + 5) * 0.14;
      for (const dx of [-pw, 0, pw]) {
        const grad = g.createRadialGradient(x + dx, y, 0, x + dx, y, r);
        grad.addColorStop(0, withAlpha(colour, a));
        grad.addColorStop(1, withAlpha(colour, 0));
        g.fillStyle = grad;
        g.fillRect(x + dx - r, y - r, r * 2, r * 2);
      }
    }
  });
}

/** A sheet drawn twice side by side, slid by `frac` of `period`, so it wraps. */
function slide(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  period: number,
  height: number,
  frac: number,
): void {
  const x = -(frac - Math.floor(frac)) * period;
  ctx.drawImage(sheet, x, 0, period, height);
  ctx.drawImage(sheet, x + period, 0, period, height);
}

export function drawDeepSky(d: BackdropDraw, o: Depth): void {
  const { ctx, l, time } = d;
  const w = l.width;
  const h = l.bandTop;
  paintSpace(d);
  if (h <= 0 || w <= 0) return;
  ctx.drawImage(starSheet(w, h, o.far ?? 170, o.seed, o.weight, o.key), 0, 0, w, h);

  const haze = o.haze ?? 1;
  if (haze > 0) {
    ctx.globalAlpha = haze;
    slide(ctx, hazeSheet(actTint(d, 0.5), w, h, o.seed), w * 2, h, time * HAZE_DRIFT * 0.5);
  }

  ctx.globalAlpha = 1;
  const nearFrac = time * NEAR_DRIFT;
  slide(ctx, starSheet(w, h, o.near ?? 36, o.seed + 7), w, h, nearFrac);

  // Twinkles ride the near layer, so they drift with it: one baked cross
  // each, its size and alpha breathing.
  const shift = (nearFrac - Math.floor(nearFrac)) * w;
  const sprite = twinkle();
  for (let i = 0; i < TWINKLES; i++) {
    const s = o.seed + 900 + i * 4;
    const bx = hash01(s + 1) * w - shift;
    const x = bx < 0 ? bx + w : bx;
    const y = hash01(s + 2) * h;
    const k = 0.5 + 0.5 * Math.sin(time * (0.8 + hash01(s + 3) * 1.6) + i * 2.1);
    const size = (6 + hash01(s + 4) * 8) * (0.7 + 0.3 * k);
    ctx.globalAlpha = 0.2 + 0.6 * k;
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

/** A star with a small cross of light, baked once and scaled at the blit. */
function twinkle(): HTMLCanvasElement {
  return baked("twinkle", 32, 32, (g, pw) => {
    const r = pw / 2;
    const halo = g.createRadialGradient(r, r, 0, r, r, r * 0.45);
    halo.addColorStop(0, "rgba(244,240,255,0.9)");
    halo.addColorStop(1, "rgba(244,240,255,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, pw, pw);
    for (const [x0, y0, x1, y1] of [
      [0, r, pw, r],
      [r, 0, r, pw],
    ] as const) {
      const ray = g.createLinearGradient(x0, y0, x1, y1);
      ray.addColorStop(0, "rgba(244,240,255,0)");
      ray.addColorStop(0.5, "rgba(244,240,255,0.7)");
      ray.addColorStop(1, "rgba(244,240,255,0)");
      g.fillStyle = ray;
      if (y0 === y1) g.fillRect(0, r - 0.75, pw, 1.5);
      else g.fillRect(r - 0.75, 0, 1.5, pw);
    }
  });
}
