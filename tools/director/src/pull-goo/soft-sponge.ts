import { facet, KEY, LAT_LIMIT, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { clamp01, hash, mix } from "./noise.js";
import { SHADE } from "./press.js";
import { litFill, onDrop, type SoftDrop } from "./soft.js";

/**
 * **SPONGE** — matte and full of holes, with a tufted edge and no shine at
 * all. Its pores sit on the sphere (`facet`) and turn with it, each a hole
 * whose far wall takes the light. A thumb pushes a wide, soft dent: the pores
 * under it are squeezed shut and shoved outward, and the whole sponge
 * flattens more than a slime does.
 */

interface Pore {
  readonly pin: Pin;
  readonly size: number;
  readonly aspect: number;
}

/** Scattered evenly over the sphere, never in rows; many small, a few big. */
const PORES: readonly Pore[] = Array.from({ length: 64 }, (_, i) => {
  const h = (k: number): number => hash(i * 5.17 + k * 2.31 + 0.7);
  return {
    pin: pin(h(1) * Math.PI * 2, Math.asin((h(2) * 2 - 1) * Math.sin(LAT_LIMIT + 0.4)), 1),
    size: 0.04 + 0.09 * h(3) ** 1.6,
    aspect: 0.55 + 0.4 * h(4),
  };
});

export const SPONGE: SoftDrop = {
  name: "SPONGE",
  give: { spread: 1.1, deep: 1, flatten: 0.07, sag: 0, gloss: 0 },
  body(s) {
    const { ctx, b, style } = s;
    litFill(s, [
      [0, mix(style.core, "#FFFFFF", 0.08)],
      [0.35, style.core],
      [0.72, style.body],
      [1, style.deep],
    ]);
    const lip = s.t.tone(mix(style.core, "#FFFFFF", 0.2));
    const away = Math.atan2(-KEY.y, -KEY.x);
    ctx.save();
    for (const p of PORES) {
      const f = facet(p.pin, s.theta);
      if (!f.near) continue;
      const on = onDrop(s, f);
      const fade = smoothstep(clamp01(f.sx / 0.3)) * s.t.alpha;
      const sz = b.r * p.size;
      const turn = Math.atan2(on.out.y, on.out.x);
      ctx.save();
      ctx.translate(
        on.at.x + on.out.x * on.squeeze * s.dent.r * 0.3,
        on.at.y + on.out.y * on.squeeze * s.dent.r * 0.3,
      );
      // Squeezed shut towards the thumb, then foreshortened by the sphere.
      ctx.rotate(turn);
      ctx.scale(1 - 0.75 * on.squeeze, 1);
      ctx.rotate(-turn);
      ctx.scale(Math.max(0.12, f.sx), f.sy);
      ctx.beginPath();
      ctx.ellipse(0, 0, sz, sz * p.aspect, 0, 0, Math.PI * 2);
      ctx.fillStyle = SHADE;
      ctx.globalAlpha = fade * 0.7 * surfaceDim(0.55, 1 - f.lit * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0, sz, sz * p.aspect, 0, away - 1.1, away + 1.1);
      ctx.strokeStyle = lip;
      ctx.lineWidth = sz * 0.35;
      ctx.globalAlpha = fade * surfaceDim(0.2, f.lit) * 0.7;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  },
  rim(s) {
    const { ctx, b, path, t, style } = s;
    // Tufts: a broken edge of the sponge's own stuff, the neon under it.
    ctx.strokeStyle = t.neon;
    ctx.globalAlpha = t.alpha * 0.75;
    ctx.lineWidth = b.r * 0.05;
    ctx.stroke(path);
    ctx.setLineDash([b.r * 0.05, b.r * 0.07]);
    ctx.lineDashOffset = -s.theta * b.r;
    ctx.strokeStyle = t.tone(mix(style.core, style.body, 0.4));
    ctx.globalAlpha = t.alpha * 0.8;
    ctx.lineWidth = b.r * 0.1;
    ctx.stroke(path);
  },
};
