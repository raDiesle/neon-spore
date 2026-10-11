import { facet, KEY, LAT_LIMIT, type Pin, pin } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { centre } from "./body.js";
import { clamp01, hash, mix } from "./noise.js";
import { litFill, onDrop, type SoftDrop } from "./soft.js";

/**
 * **DOUGH** — a mochi: powdery, sagging under its own weight, lit soft with
 * almost no contrast and dusted with specks that turn with it. A thumb leaves
 * a wide shallow dent rather than a hole, and pushes the dust out of it.
 */

interface Speck {
  readonly pin: Pin;
  readonly size: number;
}

const SPECKS: readonly Speck[] = Array.from({ length: 70 }, (_, i) => {
  const h = (k: number): number => hash(i * 3.91 + k * 1.37 + 0.2);
  return {
    pin: pin(h(1) * Math.PI * 2, Math.asin((h(2) * 2 - 1) * Math.sin(LAT_LIMIT + 0.4)), 1),
    size: 0.015 + 0.025 * h(3),
  };
});

export const DOUGH: SoftDrop = {
  name: "DOUGH",
  give: { spread: 1.2, deep: 0.6, flatten: 0.08, sag: 0.05, gloss: 0 },
  body(s) {
    const { ctx, b, style } = s;
    litFill(s, [
      [0, mix(style.core, "#FFFFFF", 0.15)],
      [0.45, mix(style.core, style.body, 0.4)],
      [0.85, style.body],
      [1, mix(style.body, style.deep, 0.6)],
    ]);
    // Its belly, away from the light, in its own soft shadow.
    const c = centre(b);
    const q = { x: c.x - KEY.x * b.r * 0.7, y: c.y - KEY.y * b.r * 0.7 };
    const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, b.r * 0.8);
    g.addColorStop(0, "rgba(11,16,36,0.4)");
    g.addColorStop(1, "rgba(11,16,36,0)");
    ctx.fillStyle = g;
    ctx.fill(s.path);
    const dust = s.t.tone(mix(style.core, "#FFFFFF", 0.6));
    ctx.save();
    ctx.fillStyle = dust;
    for (const sp of SPECKS) {
      const f = facet(sp.pin, s.theta);
      if (!f.near) continue;
      const on = onDrop(s, f);
      const shove = on.squeeze * s.dent.r * 0.6;
      ctx.globalAlpha =
        s.t.alpha *
        smoothstep(clamp01(f.sx / 0.3)) *
        (0.15 + 0.35 * f.lit) *
        (1 - 0.6 * on.squeeze);
      ctx.beginPath();
      ctx.ellipse(
        on.at.x + on.out.x * shove,
        on.at.y + on.out.y * shove,
        b.r * sp.size * Math.max(0.2, f.sx),
        b.r * sp.size * f.sy,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  },
  rim(s) {
    const { ctx, b, path, t, style } = s;
    ctx.strokeStyle = t.tone(mix(style.body, style.deep, 0.3));
    ctx.globalAlpha = t.alpha * 0.6;
    ctx.lineWidth = b.r * 0.12;
    ctx.stroke(path);
    ctx.strokeStyle = t.neon;
    ctx.globalAlpha = t.alpha * 0.7;
    ctx.lineWidth = b.r * 0.045;
    ctx.stroke(path);
  },
};
