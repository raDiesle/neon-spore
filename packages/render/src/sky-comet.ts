import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { actTint, baked, drawStars, lighter, paintSpace, skyGlow, starSheet } from "./sky-kit.js";

/**
 * COMET — a great comet hangs across the sky.
 *
 * Its head high on the right, and two tails thrown away from a sun past the
 * top-right corner: a broad curved fan of dust in warm white and the act's
 * colour, and a straight thin blue tail of gas beside it. A comet that big
 * is a long way off and does not seem to move; its tails shimmer, slowly.
 *
 * Both tails are baked once per size and tint; a frame is the stars, two
 * blits and the head's glow.
 */

const HEAD = { x: 0.8, y: 0.14 } as const;
/** Which way the tails run, in radians from +x: down and to the left. */
const AWAY = Math.PI * 0.72;

function dustTail(tint: string, w: number, h: number): HTMLCanvasElement {
  return baked(`comet-dust${tint}`, w, h, (g, pw, ph) => {
    const warm = mixHex(tint, "#FFE8D0", 0.6);
    const hx = HEAD.x * pw;
    const hy = HEAD.y * ph;
    const len = Math.hypot(pw, ph) * 0.95;
    // A fan of soft strokes, each curving a little more than the last, so
    // the dust tail bends away from the gas one.
    for (let i = 0; i < 60; i++) {
      const k = i / 59;
      const a = AWAY + (k - 0.35) * 0.32;
      const bend = 0.12 + k * 0.25;
      const ex = hx + Math.cos(a) * len;
      const ey = hy + Math.sin(a) * len;
      const mx = hx + Math.cos(a - bend) * len * 0.5;
      const my = hy + Math.sin(a - bend) * len * 0.5;
      const grad = g.createLinearGradient(hx, hy, ex, ey);
      grad.addColorStop(0, withAlpha(warm, 0.14));
      grad.addColorStop(0.4, withAlpha(tint, 0.07));
      grad.addColorStop(1, withAlpha(tint, 0));
      g.strokeStyle = grad;
      g.lineWidth = 6 + hash01(190_000 + i) * 16;
      g.beginPath();
      g.moveTo(hx, hy);
      g.quadraticCurveTo(mx, my, ex, ey);
      g.stroke();
    }
  });
}

function gasTail(w: number, h: number): HTMLCanvasElement {
  return baked("comet-gas", w, h, (g, pw, ph) => {
    const hx = HEAD.x * pw;
    const hy = HEAD.y * ph;
    const len = Math.hypot(pw, ph) * 0.8;
    const a = AWAY - 0.12;
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 0.012;
      const ex = hx + Math.cos(a + off) * len;
      const ey = hy + Math.sin(a + off) * len;
      const grad = g.createLinearGradient(hx, hy, ex, ey);
      grad.addColorStop(0, withAlpha("#B8C8FF", 0.35));
      grad.addColorStop(1, withAlpha("#B8C8FF", 0));
      g.strokeStyle = grad;
      g.lineWidth = 1.5 + (2 - Math.abs(i - 2)) * 1.5;
      g.beginPath();
      g.moveTo(hx, hy);
      g.lineTo(ex, ey);
      g.stroke();
    }
  });
}

export function skyComet(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  paintSpace(d);
  drawStars(d, starSheet(l.width, height, 190, 191_000));
  const tint = actTint(d, 0.4);
  lighter(ctx, () => {
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time * 0.5);
    ctx.drawImage(dustTail(tint, l.width, height), 0, 0, l.width, height);
    ctx.globalAlpha = 0.8 + 0.2 * Math.sin(time * 0.9 + 1);
    ctx.drawImage(gasTail(l.width, height), 0, 0, l.width, height);
    const coma = l.width * 0.2;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(
      skyGlow("#FFF6EC", coma, [0, 0.12, 1]),
      HEAD.x * l.width - coma / 2,
      HEAD.y * height - coma / 2,
      coma,
      coma,
    );
  });
}
