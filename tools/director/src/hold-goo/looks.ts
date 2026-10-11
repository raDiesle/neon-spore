import { centre } from "../../../../packages/render/src/goo-body.js";
import { dotIn } from "../../../../packages/render/src/goo-enter.js";
import { clamp01 } from "../../../../packages/render/src/goo-noise.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { clock, type Progress, toneHex } from "./goo.js";

/**
 * **Three ways a GOO hold shows the beats being held** (`goo.ts` has what
 * they share): the drop filling up like a glass, the pull's own dots round
 * it lighting one by one, the drop blooming open. `print.ts` has the
 * thumbprint and the thumb sinking in.
 */

/** FILL — green rises inside the drop from the bottom, its surface rocking, until it is full. */
export const FILL: Progress = {
  name: "fill",
  sentence:
    "held, green rises inside the drop from the bottom like a glass being filled, its surface rocking; full, it boils away",
  inside(v, drawn, _path, fill, tone) {
    if (fill <= 0.002) return;
    const { ctx, time } = v;
    const c = centre(drawn);
    const R = drawn.r * 1.35;
    const level = c.y + R - 2 * R * fill;
    const wave = (x: number) =>
      level + Math.sin((x - c.x) * 0.32 + time * 7) * drawn.r * 0.07 * (1 - fill * 0.6);
    const col = toneHex(tone);
    const surface = new Path2D();
    surface.moveTo(c.x - R, wave(c.x - R));
    for (let x = c.x - R; x <= c.x + R; x += 2) surface.lineTo(x, wave(x));
    const body = new Path2D(surface);
    body.lineTo(c.x + R, c.y + R * 2);
    body.lineTo(c.x - R, c.y + R * 2);
    body.closePath();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = col.hex;
    ctx.fill(body);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = col.rim;
    ctx.lineWidth = Math.max(0.8, drawn.r * 0.08);
    ctx.stroke(surface);
  },
};

/** How many dots go round the drop for a hold of `beats`: four a beat. */
const dotsFor = (beats: number): number => beats * 4;

/** DOTS — the pull's path dots, in a ring round the drop, lit one after another as it is held. */
export const DOTS: Progress = {
  name: "dots",
  sentence:
    "the pull's own dots stand in a ring round the drop, four a beat, coming in one after another with a blink; held, they light green one by one from the top, clockwise, the next one blinking",
  around(v, fill, tone) {
    const { ctx, at, r, time } = v;
    const n = dotsFor(v.ask.beats);
    const col = toneHex(tone);
    const lit = fill * n;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const come = dotIn(i + 1, n, v.born);
      if (come === null) continue;
      const q = clock(at, r * 1.85, ((i + 0.5) / n) * Math.PI * 2);
      const k = clamp01(lit - i);
      const next = !v.held || k > 0 || i !== Math.floor(lit) ? 0 : 0.5 + 0.5 * Math.sin(time * 18);
      const size = r * (0.075 + 0.06 * k) * come.size * (1 + 0.5 * next);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.35 + 0.5 * next + 0.4 * come.blink;
      ctx.fillStyle = GOO.neon;
      if (k < 1) dot(ctx, q.x, q.y, size);
      if (k <= 0) continue;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.25 * k;
      ctx.fillStyle = col.hex;
      dot(ctx, q.x, q.y, size * 2.4);
      ctx.globalAlpha = k;
      ctx.fillStyle = col.rim;
      dot(ctx, q.x, q.y, size);
    }
    ctx.restore();
  },
};

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** BLOOM — the drop opens as it is held: five lobes swell out of its rim, and it grows. */
export const BLOOM: Progress = {
  name: "bloom",
  sentence:
    "held, the drop swells and opens into a five-lobed bloom, a green light rising in its middle; full open, it boils away",
  body(b, fill) {
    if (fill <= 0) return b;
    return { ...b, r: b.r * (1 + 0.14 * fill), petals: { n: 5, depth: 0.36 * fill ** 0.8 } };
  },
  inside(v, drawn, _path, fill, tone) {
    if (fill <= 0) return;
    const { ctx } = v;
    const c = centre(drawn);
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, drawn.r * 1.1);
    g.addColorStop(0, toneHex(tone).rim);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.45 * fill;
    ctx.fillStyle = g;
    ctx.fillRect(c.x - drawn.r * 1.6, c.y - drawn.r * 1.6, drawn.r * 3.2, drawn.r * 3.2);
  },
};
