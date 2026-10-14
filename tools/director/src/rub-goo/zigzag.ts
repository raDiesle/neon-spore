import { mix } from "../../../../packages/render/src/goo-noise.js";
import { SHADE } from "../../../../packages/render/src/goo-press.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { toneHex } from "../../../../packages/render/src/soak-water.js";
import type { Rubbed } from "./goo.js";

/**
 * **ZIGZAG** — THE RUB LAB's one way to say how many turns a mark asks before
 * it is touched, and how many are done: the gesture itself, drawn on the drop: a zigzag of one stroke
 * for every turn it asks, top to bottom, so four turns is a W and sixteen a
 * tight scribble. Each turn lights the next stroke green, the newest white.
 */
export const ZIGZAG: Rubbed = {
  key: "zigzag",
  name: "zigzag",
  sentence:
    "the gesture drawn on the drop: one stroke of a zigzag for every turn it asks, top to bottom — four is a W, sixteen a tight scribble; each turn lights the next stroke green",
  over(v, drawn, tone) {
    const n = v.ask.turns;
    const { ctx } = v;
    const col = toneHex(tone);
    const w = drawn.r * 0.64;
    const h = drawn.r * 0.66;
    const pt = (i: number) => ({
      x: drawn.at.x + (i % 2 === 0 ? -w : w),
      y: drawn.at.y - h + (2 * h * i) / n,
    });
    const thin = Math.max(0.7, drawn.r * (n > 8 ? 0.065 : 0.095));
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < n; i++) {
      const a = pt(i);
      const b = pt(i + 1);
      const lit = i < v.done;
      const fresh = i === v.done - 1 ? Math.exp(-v.turned * 8) : 0;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      if (!lit) {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = SHADE;
        ctx.lineWidth = thin * 1.9;
        ctx.stroke();
        ctx.globalAlpha = 0.75;
        ctx.strokeStyle = GOO.neon;
        ctx.lineWidth = thin;
        ctx.stroke();
        continue;
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = SHADE;
      ctx.lineWidth = thin * 2.6;
      ctx.stroke();
      ctx.strokeStyle = mix(col.hex, "#FFFFFF", 0.7 * fresh);
      ctx.lineWidth = thin * (1.7 + fresh);
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = thin * 4.5;
      ctx.strokeStyle = col.hex;
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  },
};
