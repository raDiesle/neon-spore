import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { BackdropDraw } from "../../../../../packages/render/src/backdrop-look.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";
import { actTint, alpha, baked, drawStars, glow, lighter, paintSpace, starSheet } from "../sky.js";

/**
 * GIANT — a gas giant hangs over the field, a third of it off the left edge.
 *
 * Banded like Jupiter in the act's colour, lit from the upper right so its
 * left limb falls into night, with a thin ring tilted across its face and
 * out past it into the sky. The bands turn: the band sheet slides sideways
 * inside the disc at a fraction of a pixel a second, so the world rotates
 * without going anywhere. Stars behind it, none in front.
 *
 * The disc is baked once per size and tint; a frame is the stars, the band
 * sheet clipped to the disc, the night over it and the ring — five blits.
 */

/** Centre and radius as shares of the width and the sky's height. */
const AT = { x: 0.08, y: 0.3 } as const;
const RADIUS = 0.78;
/** Band sheet drift in disc diameters per second — a turn, not a pan. */
const SPIN = 0.0035;

function bandSheet(tint: string, size: number): HTMLCanvasElement {
  return baked(`giant-bands${tint}`, size * 2, size, (g, w, h) => {
    const light = mixHex(tint, "#E8C8A8", 0.45);
    const dark = mixHex(tint, "#000000", 0.25);
    const n = 22;
    for (let i = 0; i < n; i++) {
      const y0 = (i / n) * h;
      const k = hash01(900 + i);
      g.fillStyle = mixHex(dark, light, 0.2 + k * 0.8);
      g.fillRect(0, y0, w, h / n + 1);
    }
    // Eddies along the bands, so the turn has something to carry.
    for (let i = 0; i < 70; i++) {
      const x = hash01(1200 + i) * w;
      const y = hash01(1300 + i) * h;
      const rx = (0.02 + hash01(1400 + i) * 0.06) * w;
      const ry = rx * 0.1;
      g.fillStyle = alpha(hash01(1500 + i) < 0.5 ? light : dark, 0.3);
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
    }
    // One storm, a shade of the bands and never a body's red.
    g.fillStyle = alpha(light, 0.5);
    g.beginPath();
    g.ellipse(w * 0.3, h * 0.3, w * 0.035, h * 0.03, 0, 0, Math.PI * 2);
    g.fill();
  });
}

/** Night over most of the face and a lit crescent on the right limb — the
 * sun is past the right edge — then the limb darkened all round, which is
 * what makes a disc a ball. Drawn over the bands. */
function nightSheet(size: number): HTMLCanvasElement {
  return baked("giant-night", size, size, (g, w) => {
    const r = w / 2;
    const day = g.createLinearGradient(w, r * 0.6, r * 0.7, r * 1.2);
    day.addColorStop(0, "rgba(3,2,8,0)");
    day.addColorStop(0.35, "rgba(3,2,8,0.25)");
    day.addColorStop(1, "rgba(3,2,8,0.7)");
    g.fillStyle = day;
    g.beginPath();
    g.arc(r, r, r, 0, Math.PI * 2);
    g.fill();
    const limb = g.createRadialGradient(r, r, r * 0.7, r, r, r);
    limb.addColorStop(0, "rgba(3,2,8,0)");
    limb.addColorStop(1, "rgba(3,2,8,0.5)");
    g.fillStyle = limb;
    g.fill();
  });
}

const STARS = (x: number, _y: number) => (x < 0.55 ? 0.35 : 1);

export function giant(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  paintSpace(d);
  drawStars(d, starSheet(l.width, height, 160, 31_000, STARS));

  const tint = actTint(d, 0.35);
  const r = l.width * RADIUS;
  const cx = l.width * AT.x;
  const cy = height * AT.y;

  // The atmosphere's glow, under the disc.
  lighter(ctx, () => {
    ctx.globalAlpha = 0.35;
    const halo = r * 2.5;
    ctx.drawImage(glow(tint, halo, [0.38, 0.45, 1]), cx - halo / 2, cy - halo / 2, halo, halo);
  });

  const tilt = -0.32;
  drawRing(ctx, cx, cy, r, tilt, tint, "back");

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  const sheet = bandSheet(tint, r * 2);
  // The sheet is two diameters wide; two copies end to end always cover the
  // disc wherever the slide has got to.
  const sheetW = r * 4;
  const x0 = -r - ((((time * SPIN * 2) % 1) + 1) % 1) * sheetW;
  ctx.globalAlpha = 0.9;
  ctx.drawImage(sheet, x0, -r * 1.1, sheetW, r * 2.2);
  ctx.drawImage(sheet, x0 + sheetW, -r * 1.1, sheetW, r * 2.2);
  ctx.rotate(-tilt);
  ctx.globalAlpha = 1;
  ctx.drawImage(nightSheet(r * 2), -r, -r, r * 2, r * 2);
  ctx.restore();

  drawRing(ctx, cx, cy, r, tilt, tint, "front");
}

/** The ring as two half ellipses: the far half behind the disc, the near in
 * front of it. */
function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tilt: number,
  tint: string,
  half: "back" | "front",
): void {
  const colour = mixHex(tint, "#F4E6D0", 0.5);
  const [a0, a1] = half === "back" ? [Math.PI, Math.PI * 2] : [0, Math.PI];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  for (const [k, w, a] of [
    [1.55, 5, 0.22],
    [1.72, 2.5, 0.38],
    [1.86, 1.2, 0.28],
  ] as const) {
    ctx.strokeStyle = alpha(colour, half === "back" ? a * 0.6 : a);
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * k, r * k * 0.16, 0, a0, a1);
    ctx.stroke();
  }
  ctx.restore();
}
