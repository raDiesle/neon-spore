import { hash01, tintFor } from "../../../../packages/render/src/backdrop.js";
import type { BackdropDraw } from "../../../../packages/render/src/backdrop-look.js";
import { bakedCache } from "../../../../packages/render/src/baked.js";
import { mixHex } from "../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../packages/render/src/palette.js";

/**
 * What the `field:backdrop` answers share: a bake, the act's colour lifted far
 * enough off black to be seen, and a sky of stars.
 *
 * The owner's word for the shipped back on 16 October 2026 was *boring and
 * empty*, and every answer here is a picture with one large thing in it — a
 * world, a galaxy, a curtain of light — rather than a finer dust. Each is
 * baked once per size and tint and blitted, so a frame pays a few
 * `drawImage`s however much is in the picture.
 */

const cache = bakedCache<string, HTMLCanvasElement>();

/** A canvas painted once and kept, keyed on everything it was painted from. */
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
 * the ground at any alpha (`corner-light.ts` found the same). */
export function actTint(d: BackdropDraw, k = 0): string {
  const tint = tintFor(d.wave);
  return k <= 0 ? tint : mixHex(tint, PALETTE.sparkDim, k);
}

/** `#rrggbb` with an alpha byte. */
export function alpha(hex: string, a: number): string {
  const byte = Math.round(Math.max(0, Math.min(1, a)) * 255);
  return `${hex}${byte.toString(16).padStart(2, "0")}`;
}

/** Space under everything: the field's black with the ground's violet taken
 * back out, painted over the shipped radial ground. */
export const SPACE = "#05040B";

export function paintSpace(d: BackdropDraw, colour = SPACE): void {
  d.ctx.fillStyle = colour;
  d.ctx.fillRect(0, 0, d.l.width, d.l.bandTop);
}

/**
 * A sky of stars, baked: `count` of them, most a pixel and dim, one in
 * fifteen bigger with a soft halo. `seed` keeps two skies apart. `weight`
 * places them — a function of the share across and down that answers how
 * likely a star is there, so a band of the galaxy can be denser than the rest.
 */
export function starSheet(
  w: number,
  h: number,
  count: number,
  seed: number,
  weight: (x: number, y: number) => number = () => 1,
): HTMLCanvasElement {
  return baked(`stars${seed},${count},${weight.name}`, w, h, (g, pw, ph) => {
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
        halo.addColorStop(0, alpha(colour, a * 0.6));
        halo.addColorStop(1, alpha(colour, 0));
        g.fillStyle = halo;
        g.fillRect(px - r, py - r, r * 2, r * 2);
      }
      g.fillStyle = alpha(colour, a);
      const size = big ? 1.6 : hash01(s + 8) < 0.3 ? 1.2 : 0.8;
      g.fillRect(px - size / 2, py - size / 2, size, size);
    }
  });
}

/** The sky's stars blitted over the whole field above the band. */
export function drawStars(d: BackdropDraw, sheet: HTMLCanvasElement, a = 1): void {
  d.ctx.globalAlpha = a;
  d.ctx.drawImage(sheet, 0, 0, d.l.width, d.l.bandTop);
  d.ctx.globalAlpha = 1;
}

/** A soft round glow of one colour, baked. */
export function glow(colour: string, size: number, stops = [0, 0.35, 1]): HTMLCanvasElement {
  return baked(`glow${colour},${stops.join("/")}`, size, size, (g, pw) => {
    const r = pw / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(stops[0]!, alpha(colour, 1));
    grad.addColorStop(stops[1]!, alpha(colour, 0.4));
    grad.addColorStop(stops[2]!, alpha(colour, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, pw, pw);
  });
}

/** Additive drawing for the length of `f`, the way the shipped light is laid. */
export function lighter(ctx: CanvasRenderingContext2D, f: () => void): void {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  f();
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
