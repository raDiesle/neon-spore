import { PALETTE } from "@neon-spore/render";
import { mix } from "../../../../packages/render/src/goo-noise.js";
import { SHADE } from "../../../../packages/render/src/goo-press.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { toneHex } from "../hold-goo/goo.js";
import type { Rubbed } from "./goo.js";
import { swayOf } from "./goo.js";

/**
 * **HEAT** and **COUNT** — the rest of THE RUB LAB's ways to say how many
 * turns a mark asks (`looks.ts` has ZIGZAG and WIPE).
 */

/**
 * **HEAT** — a rub is friction: one notch under the drop for every turn it
 * asks, in an arc, and each turn lights one ember-hot while the drop warms
 * from its own neon to a glowing orange, heat shimmering off its top. A lapse
 * cools it, red. The only one of the four that says *keep going* with no
 * number and no shape to read.
 */
export const HEAT: Rubbed = {
  key: "heat",
  name: "heat",
  sentence:
    "friction: one notch in an arc under the drop for every turn it asks; each turn lights one ember-hot and the drop warms from its neon to a glowing orange, heat shimmering off it; a lapse cools it, red",
  inside(v, drawn) {
    const heat = Math.min(1, v.shown / v.ask.turns);
    if (heat <= 0) return;
    const { ctx } = v;
    const g = ctx.createRadialGradient(
      drawn.at.x,
      drawn.at.y + drawn.r * 0.2,
      0,
      drawn.at.x,
      drawn.at.y,
      drawn.r * 1.2,
    );
    g.addColorStop(0, mix(PALETTE.ember, "#FFFFFF", 0.5 * heat));
    g.addColorStop(0.6, PALETTE.ember);
    g.addColorStop(1, "rgba(255,122,47,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.75 * heat;
    ctx.fillStyle = g;
    ctx.fillRect(drawn.at.x - drawn.r * 2, drawn.at.y - drawn.r * 2, drawn.r * 4, drawn.r * 4);
  },
  over(v, drawn, tone) {
    const n = v.ask.turns;
    const { ctx, time } = v;
    const heat = Math.min(1, v.shown / n);
    ctx.save();
    ctx.lineCap = "round";
    // The shimmer off its top, once it is warm.
    if (heat > 0.2 && tone !== "red") {
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = PALETTE.ember;
      ctx.lineWidth = Math.max(0.6, drawn.r * 0.06);
      for (let k = -1; k <= 1; k++) {
        const x0 = drawn.at.x + k * drawn.r * 0.4;
        const rise = (time * 0.9 + k * 0.33) % 1;
        ctx.globalAlpha = heat * 0.7 * Math.sin(Math.PI * rise);
        ctx.beginPath();
        for (let s = 0; s <= 8; s++) {
          const y = drawn.at.y - drawn.r * (1.1 + 0.7 * rise) - s * drawn.r * 0.07;
          const x = x0 + Math.sin(s * 1.3 + time * 6 + k) * drawn.r * 0.08;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    // The notches: an arc under the drop, from its left round to its right.
    const col = toneHex(tone);
    const from = Math.PI * 0.1;
    const to = Math.PI * 0.9;
    const inner = v.r * 1.3;
    const outer = v.r * 1.62;
    for (let i = 0; i < n; i++) {
      const a = n === 1 ? Math.PI / 2 : to - ((to - from) * i) / (n - 1);
      const cx = Math.cos(a);
      const sy = Math.sin(a);
      const lit = i < v.done;
      const fresh = i === v.done - 1 ? Math.exp(-v.turned * 9) : 0;
      ctx.beginPath();
      ctx.moveTo(v.at.x + cx * inner, v.at.y + sy * inner);
      ctx.lineTo(
        v.at.x + cx * outer * (1 + 0.12 * fresh),
        v.at.y + sy * outer * (1 + 0.12 * fresh),
      );
      const w = Math.max(0.8, v.r * (n > 8 ? 0.07 : 0.11));
      ctx.globalAlpha = 1;
      ctx.strokeStyle = SHADE;
      ctx.lineWidth = w * 2;
      ctx.stroke();
      ctx.strokeStyle = !lit
        ? mix(GOO.neon, SHADE, 0.35)
        : tone === "red"
          ? col.hex
          : PALETTE.ember;
      if (lit && fresh > 0) ctx.strokeStyle = mix(PALETTE.ember, "#FFFFFF", fresh);
      ctx.lineWidth = w;
      ctx.stroke();
    }
    ctx.restore();
  },
};

/** The number's size over the drop's radius, by how many figures it has. */
const figureSize = (s: string): number => (s.length > 1 ? 0.9 : 1.1);

/**
 * **COUNT** — the turns still wanted, as a number in the drop, with a chevron
 * either side, ‹ and ›, that flick out on every turn and wag with the call:
 * the plainest, and the only one that has to be read. A lapse counts it back
 * up, red.
 */
export const COUNT: Rubbed = {
  key: "count",
  name: "count",
  sentence:
    "the turns still wanted, as a number in the drop, with a chevron either side that flicks out on every turn and wags with the call; a lapse counts it back up, red",
  over(v, drawn, tone) {
    const { ctx } = v;
    const col = toneHex(tone);
    const left = v.ask.turns - v.done;
    const flick = v.done > 0 && v.failure === null ? Math.exp(-v.turned * 10) : 0;
    const wag = v.done === 0 && !v.held ? swayOf(v) : 0;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (left > 0) {
      const s = String(left);
      const px = drawn.r * figureSize(s) * (1 + 0.3 * flick);
      ctx.font = `700 ${px.toFixed(1)}px "Courier New",monospace`;
      ctx.lineWidth = Math.max(1, px * 0.12);
      ctx.strokeStyle = tone === "red" ? col.hex : mix(GOO.neon, "#000000", 0.55);
      ctx.strokeText(s, drawn.at.x, drawn.at.y + drawn.r * 0.06);
      ctx.fillStyle = tone === "red" ? col.rim : "#FFFFFF";
      ctx.fillText(s, drawn.at.x, drawn.at.y + drawn.r * 0.06);
    }
    // ‹ and ›, either side: out on a turn, and swung with the call's wag.
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const side of [-1, 1]) {
      const reach = v.r * (1.42 + 0.3 * flick + 0.2 * Math.max(0, wag * side));
      const x = v.at.x + side * reach;
      const k = v.r * 0.3;
      ctx.beginPath();
      ctx.moveTo(x - side * k * 0.6, v.at.y - k);
      ctx.lineTo(x + side * k * 0.4, v.at.y);
      ctx.lineTo(x - side * k * 0.6, v.at.y + k);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = SHADE;
      ctx.lineWidth = Math.max(1, v.r * 0.2);
      ctx.stroke();
      ctx.strokeStyle = tone === "red" ? col.hex : mix(GOO.neon, "#FFFFFF", 0.3 + 0.7 * flick);
      ctx.lineWidth = Math.max(0.8, v.r * 0.1);
      ctx.stroke();
    }
    ctx.restore();
  },
};
