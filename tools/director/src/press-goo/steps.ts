import { GOO } from "../../../../packages/render/src/goo-style.js";
import { frontPath, soakWater, WELL } from "../hold-goo/soak.js";
import type { Count } from "./goo.js";

/**
 * **STEPS** — THE HOLD LAB's SOAK, cut into the presses: the water a hold
 * fills smoothly comes up here in steps, one terrace a press, each step a
 * jump. The terraces still to come are drawn on the empty drop as faint
 * contours, so a mark of one press has none and a mark of ten is
 * banded close — how many presses a mark asks, said before it is touched
 * (the owner, 13 October 2026: *it should ideally already indicate somehow
 * how many times roundabout it is required to tap/press*). The nearest a
 * press comes to the hold, and the one look a press wears (`index.ts`).
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
