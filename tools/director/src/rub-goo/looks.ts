import { mix } from "../../../../packages/render/src/goo-noise.js";
import { SHADE } from "../../../../packages/render/src/goo-press.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { toneHex } from "../../../../packages/render/src/soak-water.js";
import type { Rubbed } from "./goo.js";

/**
 * **ZIGZAG** and **WIPE** — two of THE RUB LAB's ways to say how many turns a
 * mark asks before it is touched, and how many are done (`looks-b.ts` has the
 * rest). Each is drawn big, across the whole drop, so the four are told apart
 * at a glance on a phone.
 */

/**
 * **ZIGZAG** — the gesture itself, drawn on the drop: a zigzag of one stroke
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

/** How big a smudge of WIPE is, over the drop's radius, for `n` of them. */
const smudgeR = (n: number): number => (n <= 4 ? 0.34 : n <= 8 ? 0.26 : 0.18);
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** Seconds a wiped smudge takes to streak off and go. */
const WIPING = 0.32;

/**
 * **WIPE** — the drop is filthy: one dark smudge on it for every turn it
 * asks, and each turn wipes one off, smeared away the way the thumb went.
 * Clean, it shines green. The rub as the game first meant it — *wipe it
 * clean* (the gesture RUB). A lapse dirties it again, red.
 */
export const WIPE: Rubbed = {
  key: "wipe",
  name: "wipe",
  sentence:
    "one dark smudge on the drop for every turn it asks; each turn wipes one off, smeared the way the thumb went, and the clean drop shines green; a lapse dirties it again, red",
  green: (v) => 0.75 * Math.min(1, v.shown / v.ask.turns),
  inside(v, drawn, tone) {
    const n = v.ask.turns;
    const { ctx, time } = v;
    const col = toneHex(tone);
    const size = drawn.r * smudgeR(n);
    const d0 = Math.hypot(v.offset.x, v.offset.y) || 1;
    const way = { x: v.offset.x / d0 || 1, y: v.offset.y / d0 };
    ctx.save();
    for (let i = 0; i < n; i++) {
      const fresh = i === v.done - 1 && v.turned < WIPING ? v.turned / WIPING : null;
      if (i < v.done && fresh === null) continue;
      const d = n === 1 ? 0 : drawn.r * 0.62 * Math.sqrt((i + 0.5) / n);
      const a = i * GOLDEN + 0.7;
      let x = drawn.at.x + Math.cos(a) * d;
      let y = drawn.at.y + Math.sin(a) * d;
      let alpha = 0.9;
      let stretch = 1;
      if (fresh !== null) {
        x += way.x * drawn.r * 0.9 * fresh;
        y += way.y * drawn.r * 0.9 * fresh;
        alpha *= (1 - fresh) ** 1.5;
        stretch = 1 + 1.6 * fresh;
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = mix(SHADE, "#3A2A12", 0.5);
      ctx.strokeStyle = tone === "red" ? col.hex : mix(GOO.neon, SHADE, 0.6);
      ctx.lineWidth = Math.max(0.5, size * 0.12);
      // A blot, not a dot: three lobes, turned a little each.
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        const t = i * 1.7 + k * 2.1 + 0.15 * Math.sin(time + i);
        const bx = x + Math.cos(t) * size * 0.35 * stretch;
        const by = y + Math.sin(t) * size * 0.3;
        ctx.moveTo(bx + size * 0.62, by);
        ctx.ellipse(bx, by, size * 0.62 * stretch, size * 0.52, t, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },
};
