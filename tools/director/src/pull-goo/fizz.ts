import { PALETTE } from "@neon-spore/render";
import { paintArrow } from "./arrow.js";
import { drop } from "./body.js";
import { type Ending, greenAt, halo, intoPlace, onward, paintDrop } from "./ending.js";
import { ENDING } from "./moment.js";
import { clamp01, hash, mix } from "./noise.js";
import type { Scene } from "./scene.js";

/**
 * **FIZZ**, the drop boiling away into green bubbles that rise and pop — the
 * owner's pick of the five endings the lab offered, and the one it keeps (10
 * October 2026: *remove … the "sink", "strainer", "vortex", and "well"*).
 * Made quieter the same day: *remove the outer green border animation when
 * successful, because i want it more subtle* — no ring rolls out of it — and
 * *to switch to disappear with fizz should be instant when on right position*
 * — no green moment held first: it turns green as it starts to boil, the
 * moment it is counted.
 *
 * The arrow does not vanish with the count (the owner, 11 October 2026: *i
 * just do not want the arrow to instant disappear*), nor stay over the
 * bubbles: it turns green with the drop, shrinks with it a while, then melts
 * into it and is gone before the drop has boiled away (`melt`).
 */

/** How many bubbles a drop boils away into. */
const BUBBLES = 16;

export const FIZZ: Ending = {
  name: "fizz",
  sentence:
    "counted, the drop turns green and at once boils away where it was: it shrinks as sixteen green bubbles rise off it and pop, and nothing is left",
  play(s, e) {
    const u = clamp01(e / ENDING);
    const left = (1 - u) ** 1.3;
    halo(s, s.place, s.r * 1.8, 0.25 * left);
    const at = intoPlace(s, e);
    if (left > 0.04)
      paintDrop(s, drop(at, s.r * left, { shake: 0.25 * u }), greenAt(e), 0.4 + 0.6 * left);
    melt(s, at, e, left);
    const { ctx } = s;
    ctx.save();
    ctx.strokeStyle = mix(PALETTE.good, "#FFFFFF", 0.35);
    ctx.fillStyle = PALETTE.good;
    for (let i = 0; i < BUBBLES; i++) {
      const born = hash(i * 2.7) ** 1.5 * 0.55;
      const life = 0.3 + 0.15 * hash(i * 5.1);
      const k = (u - born) / life;
      if (k <= 0 || k >= 1) continue;
      const a = hash(i * 3.9) * Math.PI * 2;
      const d = s.r * left * 0.9;
      const x = s.place.x + Math.cos(a) * d + Math.sin(k * 6 + i) * s.r * 0.15;
      const y = s.place.y + Math.sin(a) * d * 0.6 - k * s.r * 2.4;
      const size = s.r * (0.1 + 0.16 * hash(i * 6.6)) * (0.6 + 0.6 * k);
      ctx.lineWidth = Math.max(0.4, size * 0.25);
      if (k < 0.82) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      } else {
        // The pop: a small ring, a little wider, and gone.
        const p = (k - 0.82) / 0.18;
        ctx.globalAlpha = 0.8 * (1 - p) ** 2;
        ctx.beginPath();
        ctx.arc(x, y, size * (1 + 0.5 * p), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};

/** Seconds into the count the arrow starts to melt into the drop, and is gone. */
const MELT_FROM = 0.12;
const MELT_TO = 0.32;

/** The arrow in the boiling drop: green with it, its size, then melting into it. */
function melt(s: Scene, at: { x: number; y: number }, e: number, left: number): void {
  const k = clamp01((e - MELT_FROM) / (MELT_TO - MELT_FROM));
  if (k >= 1) return;
  const way = onward(s);
  paintArrow(s.ctx, at, s.r * left * (1 - 0.45 * k), s.style, {
    dx: way.x,
    dy: way.y,
    split: 0,
    held: true,
    time: s.time,
    alpha: (1 - k) ** 1.5,
    green: greenAt(e),
  });
}
