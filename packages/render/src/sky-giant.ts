import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * GIANT — a gas giant hangs over the field, a third of it off the left edge.
 *
 * Banded like Jupiter in the act's colour, lit from the upper right so its
 * left limb falls into night, with a thin ring tilted across its face and
 * out past it into the sky. The bands turn: the band sheet slides sideways
 * inside the disc at a fraction of a pixel a second, so the world rotates
 * without going anywhere. Stars behind it, none in front.
 *
 * The ring throws its shadow across the face, a rim of thin air glows on
 * the lit limb and breathes, and a small moon goes round on the ring's own
 * plane — behind the world for half its orbit, in front of it for the other.
 *
 * The disc is baked once per size and tint; a frame is the deep sky, the
 * band sheet clipped to the disc, the ring's shadow, the night, the rim, the
 * ring and the moon.
 */

/** Centre and radius as shares of the width and the sky's height. */
const AT = { x: 0.08, y: 0.3 } as const;
const RADIUS = 0.78;
/** Band sheet drift in disc diameters per second — a turn, not a pan. */
const SPIN = 0.0035;
/** The moon's orbit, in the ring's plane: its radius in planet radii, its
 * period in seconds, and its own radius as a share of the planet's. */
const ORBIT = 1.32;
const PERIOD = 150;
const MOON = 0.075;

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
      g.fillStyle = withAlpha(hash01(1500 + i) < 0.5 ? light : dark, 0.3);
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
    }
    // One storm, a shade of the bands and never a body's red.
    g.fillStyle = withAlpha(light, 0.5);
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

/** The ring's shadow on the face: a soft dark band just under the near half,
 * in the ring's tilted frame, a planet's diameter across. */
function ringShadow(size: number): HTMLCanvasElement {
  return baked("giant-ring-shadow", size, size, (g, w) => {
    const r = w / 2;
    g.strokeStyle = "rgba(3,2,8,0.45)";
    g.lineWidth = w * 0.03;
    g.beginPath();
    g.ellipse(r, r + r * 0.12, r * 1.6, r * 0.24, 0, 0, Math.PI);
    g.stroke();
    g.strokeStyle = "rgba(3,2,8,0.25)";
    g.lineWidth = w * 0.012;
    g.beginPath();
    g.ellipse(r, r + r * 0.15, r * 1.78, r * 0.27, 0, 0, Math.PI);
    g.stroke();
  });
}

/** Thin air lit on the right limb: a ring of light, brightest toward the sun. */
function rimSheet(tint: string, size: number): HTMLCanvasElement {
  return baked(`giant-rim${tint}`, size, size, (g, w) => {
    const r = w / 2;
    const inner = r * 0.84;
    const glow = g.createRadialGradient(r, r, inner * 0.97, r, r, inner * 1.12);
    const colour = mixHex(tint, "#FFE8D0", 0.55);
    glow.addColorStop(0, withAlpha(colour, 0));
    glow.addColorStop(0.35, withAlpha(colour, 0.9));
    glow.addColorStop(1, withAlpha(colour, 0));
    g.fillStyle = glow;
    g.fillRect(0, 0, w, w);
    // Only the sunward side: the rest is taken back out.
    const side = g.createLinearGradient(w, r * 0.6, 0, r * 1.3);
    side.addColorStop(0, "rgba(0,0,0,0)");
    side.addColorStop(0.45, "rgba(0,0,0,0.6)");
    side.addColorStop(0.7, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = side;
    g.fillRect(0, 0, w, w);
  });
}

/** The moon: a small grey ball lit from the right, its left side in night. */
function moonSheet(tint: string): HTMLCanvasElement {
  return baked(`giant-moon${tint}`, 64, 64, (g, w) => {
    const r = w / 2;
    const face = g.createRadialGradient(r * 1.35, r * 0.75, 0, r, r, r);
    face.addColorStop(0, mixHex(tint, "#E8E0E8", 0.7));
    face.addColorStop(0.6, mixHex(tint, "#706878", 0.6));
    face.addColorStop(1, "#08060E");
    g.fillStyle = face;
    g.beginPath();
    g.arc(r, r, r - 1, 0, Math.PI * 2);
    g.fill();
  });
}

const STARS = (x: number, _y: number) => (x < 0.55 ? 0.35 : 1);

export function skyGiant(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 31_000, far: 160, weight: STARS, key: "giant" });

  const tint = actTint(d, 0.35);
  const r = l.width * RADIUS;
  const cx = l.width * AT.x;
  const cy = height * AT.y;

  // The atmosphere's glow, under the disc.
  lighter(ctx, () => {
    ctx.globalAlpha = 0.35;
    const halo = r * 2.5;
    ctx.drawImage(skyGlow(tint, halo, [0.38, 0.45, 1]), cx - halo / 2, cy - halo / 2, halo, halo);
  });

  const tilt = -0.32;
  // The moon on the ring's plane: behind the world while it is on the far
  // half of its orbit, in front on the near half.
  const orbit = (time / PERIOD) * Math.PI * 2 + 0.9;
  const ox = Math.cos(orbit) * r * ORBIT;
  const oy = Math.sin(orbit) * r * ORBIT * 0.16;
  const mx = cx + ox * Math.cos(tilt) - oy * Math.sin(tilt);
  const my = cy + ox * Math.sin(tilt) + oy * Math.cos(tilt);
  const mr = r * MOON * (1 + 0.08 * Math.sin(orbit));
  const behind = Math.sin(orbit) < 0;
  const moon = moonSheet(tint);
  ctx.globalAlpha = behind ? 0.85 : 0;
  ctx.drawImage(moon, mx - mr, my - mr, mr * 2, mr * 2);
  ctx.globalAlpha = 1;
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
  ctx.globalAlpha = 1;
  ctx.drawImage(ringShadow(512), -r, -r, r * 2, r * 2);
  ctx.rotate(-tilt);
  ctx.drawImage(nightSheet(r * 2), -r, -r, r * 2, r * 2);
  ctx.restore();

  lighter(ctx, () => {
    const rim = r * 2.4;
    ctx.globalAlpha = 0.5 + 0.15 * Math.sin(time * 0.45);
    ctx.drawImage(rimSheet(tint, 512), cx - rim / 2, cy - rim / 2, rim, rim);
  });

  drawRing(ctx, cx, cy, r, tilt, tint, "front");
  ctx.globalAlpha = behind ? 0 : 0.95;
  ctx.drawImage(moon, mx - mr, my - mr, mr * 2, mr * 2);
  ctx.globalAlpha = 1;
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
    ctx.strokeStyle = withAlpha(colour, half === "back" ? a * 0.6 : a);
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * k, r * k * 0.16, 0, a0, a1);
    ctx.stroke();
  }
  ctx.restore();
}
