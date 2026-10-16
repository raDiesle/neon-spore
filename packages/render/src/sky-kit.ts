import { hash01, tintFor, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { bakedCache } from "./baked.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * What the skies share (`skies.ts`): a bake, the act's colour lifted far
 * enough off black to be seen, and a field of stars.
 *
 * The owner's word for the sea the field used to sit in was *boring and
 * empty* (16 October 2026), and every sky is a picture with one large thing
 * in it — a world, a galaxy, a curtain of light — rather than a finer dust.
 * Each is baked once per size and tint and blitted, so a frame pays a few
 * `drawImage`s however much is in the picture. Nothing here reads anything
 * but the layout, the wave and own-motion's clock, so both screens draw the
 * same sky (`test/backdrop.test.ts`).
 */

const cache = bakedCache<string, HTMLCanvasElement>();

/** A canvas painted once and kept, keyed on everything it was painted from.
 * The size is rounded to eight pixels so a key cannot move frame to frame. */
export function baked(
  key: string,
  w: number,
  h: number,
  paint: (g: CanvasRenderingContext2D, w: number, h: number) => void,
): HTMLCanvasElement {
  const pw = Math.max(8, Math.round(w / 8) * 8);
  const ph = Math.max(8, Math.round(h / 8) * 8);
  const k = `${key},${pw},${ph}`;
  const held = cache.get(k);
  if (held) return held;
  const c = document.createElement("canvas");
  c.width = pw;
  c.height = ph;
  const g = c.getContext("2d");
  if (g) paint(g, pw, ph);
  cache.set(k, c);
  return c;
}

/** The act's tint, and that tint lifted toward the dust's grey by `k` — the
 * tints sit within a shade of black, and one of them alone is invisible over
 * the ground at any alpha (the light in the old sea's corner found the same). */
export function actTint(d: BackdropDraw, k = 0): string {
  const tint = tintFor(d.wave);
  return k <= 0 ? tint : mixHex(tint, PALETTE.sparkDim, k);
}

/** Space under everything: the field's black with the ground's violet taken
 * back out, painted over `field.ts`'s radial ground. */
export const SPACE = "#05040B";

export function paintSpace(d: BackdropDraw, colour = SPACE): void {
  d.ctx.fillStyle = colour;
  d.ctx.fillRect(0, 0, d.l.width, d.l.bandTop);
}

/**
 * A field of stars, baked: `count` of them, most a pixel and dim, one in
 * fifteen bigger with a soft halo. `seed` keeps two skies apart. `weight`
 * places them — the share across and down in, how likely a star is there
 * out — so one part of a sky can be emptier than another; `key` names the
 * weight, because a function cannot be part of a cache key.
 */
export function starSheet(
  w: number,
  h: number,
  count: number,
  seed: number,
  weight: (x: number, y: number) => number = () => 1,
  key = "even",
): HTMLCanvasElement {
  return baked(`stars${seed},${count},${key}`, w, h, (g, pw, ph) => {
    let placed = 0;
    for (let i = 0; placed < count && i < count * 8; i++) {
      const s = seed + i * 5;
      const x = hash01(s + 1);
      const y = hash01(s + 2);
      if (hash01(s + 3) > weight(x, y)) continue;
      placed++;
      const big = hash01(s + 4) < 1 / 15;
      const a = big ? 0.55 + hash01(s + 5) * 0.35 : 0.12 + hash01(s + 5) * 0.4;
      const warm = hash01(s + 6);
      const colour = warm < 0.2 ? "#FFD9B0" : warm > 0.85 ? "#B8D8FF" : "#E8E4FF";
      const px = x * pw;
      const py = y * ph;
      if (big) {
        const r = 3 + hash01(s + 7) * 2.5;
        const halo = g.createRadialGradient(px, py, 0, px, py, r);
        halo.addColorStop(0, withAlpha(colour, a * 0.6));
        halo.addColorStop(1, withAlpha(colour, 0));
        g.fillStyle = halo;
        g.fillRect(px - r, py - r, r * 2, r * 2);
      }
      g.fillStyle = withAlpha(colour, a);
      const size = big ? 1.6 : hash01(s + 8) < 0.3 ? 1.2 : 0.8;
      g.fillRect(px - size / 2, py - size / 2, size, size);
    }
  });
}

/** A field of stars blitted over the whole sky above the band. */
export function drawStars(d: BackdropDraw, sheet: HTMLCanvasElement, a = 1): void {
  d.ctx.globalAlpha = a;
  d.ctx.drawImage(sheet, 0, 0, d.l.width, d.l.bandTop);
  d.ctx.globalAlpha = 1;
}

/** A soft round glow of one colour, baked. Bake it at a size that does not
 * move and scale it at the blit, or every frame is a new key. */
export function skyGlow(colour: string, size: number, stops = [0, 0.35, 1]): HTMLCanvasElement {
  return baked(`glow${colour},${stops.join("/")}`, size, size, (g, pw) => {
    const r = pw / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(stops[0] ?? 0, withAlpha(colour, 1));
    grad.addColorStop(stops[1] ?? 0.35, withAlpha(colour, 0.4));
    grad.addColorStop(stops[2] ?? 1, withAlpha(colour, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, pw, pw);
  });
}

/** Additive drawing for the length of `f`, the way light is laid. */
export function lighter(ctx: CanvasRenderingContext2D, f: () => void): void {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  f();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
