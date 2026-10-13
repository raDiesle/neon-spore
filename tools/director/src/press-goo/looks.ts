import { mix } from "../../../../packages/render/src/goo-noise.js";
import { SHADE } from "../../../../packages/render/src/goo-press.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { toneHex } from "../hold-goo/goo.js";
import { frontPath, soakWater, WELL } from "../hold-goo/soak.js";
import type { Count } from "./goo.js";

/**
 * **PIPS** and **STEPS** — two of THE PRESS LAB's ways to say how many presses
 * a mark asks before it is touched, and how many are done (`looks-b.ts` has
 * the rest). The owner, 13 October 2026: *it should ideally already indicate
 * somehow how many times roundabout it is required to tap/press that its clear
 * if its one time, 5 times or 10 times. - maybe it can remember or relate to
 * how we handle the hold - maybe not - provide to me several variants.*
 */

/** How big a bead of PIPS is, over the drop's radius, for `n` of them round it. */
const beadR = (n: number): number => (n === 1 ? 0.22 : n <= 5 ? 0.16 : 0.115);

/**
 * **PIPS** — one bead round the drop for every press it asks, from the top,
 * clockwise: one bead is one press, a ring of ten is ten. Each press lights
 * the next one green, and it swells as it lights. Nothing like the hold's.
 */
export const PIPS: Count = {
  key: "pips",
  name: "pips",
  sentence:
    "one bead round the drop for every press it asks, from the top clockwise; each press lights the next one green, swelling as it lights",
  over(v, drawn, tone) {
    const n = v.ask.times;
    const { ctx, at, r } = v;
    const ring = r * 1.38;
    const col = toneHex(tone);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const x = at.x + Math.cos(a) * ring;
      const y = drawn.at.y + Math.sin(a) * ring;
      // Lit the moment the finger lands: a press is the down.
      const lit = i < v.done ? 1 : 0;
      const fresh = i === v.done - 1 ? Math.exp(-v.pressed * 9) : 0;
      const br = r * beadR(n) * (1 + 0.7 * fresh);
      ctx.globalAlpha = 1;
      ctx.fillStyle = SHADE;
      ctx.strokeStyle = GOO.neon;
      ctx.lineWidth = Math.max(0.6, br * 0.28);
      ctx.beginPath();
      ctx.arc(x, y, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (lit <= 0) continue;
      ctx.globalAlpha = lit;
      ctx.fillStyle = mix(col.hex, "#FFFFFF", 0.6 * fresh);
      ctx.strokeStyle = col.rim;
      ctx.fill();
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.35 * lit;
      ctx.beginPath();
      ctx.arc(x, y, br * 2, 0, Math.PI * 2);
      ctx.fillStyle = col.hex;
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  },
};

/**
 * **STEPS** — THE HOLD LAB's SOAK, cut into the presses: the water a hold
 * fills smoothly comes up here in steps, one terrace a press, each step a
 * jump. The terraces still to come are drawn on the empty drop as faint
 * contours, so a mark of one press has none and a mark of ten is
 * banded close. The nearest a press comes to the hold.
 */
export const STEPS: Count = {
  key: "steps",
  name: "steps",
  sentence:
    "SOAK's water cut into presses: one terrace a press, each a jump; the terraces still to come are faint contours on the drop, none for one press and ten close bands for ten",
  inside(v, drawn, tone) {
    const n = v.ask.times;
    const { ctx, time } = v;
    // SOAK's reach eases out; the terraces are evenly spaced, so the fill is put
    // where SOAK's own easing lands on the even one.
    const q = Math.min(1, v.shown / n);
    soakWater(ctx, drawn, time, 1 - (1 - q) ** (1 / 2.2), tone);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = GOO.neon;
    ctx.lineWidth = Math.max(0.5, drawn.r * 0.035);
    for (let k = Math.max(1, v.done + 1); k < n; k++) {
      ctx.globalAlpha = 0.4;
      ctx.stroke(frontPath(drawn, time, WELL + ((1 - WELL) * k) / n, 0));
    }
  },
};
