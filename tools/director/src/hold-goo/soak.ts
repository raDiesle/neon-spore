import { clamp01 } from "../../../../packages/render/src/goo-noise.js";
import { soakWater, toneHex } from "../../../../packages/render/src/soak-water.js";
import { BEAT_SECONDS } from "../hold-lab-rule.js";
import type { Progress } from "./goo.js";

/**
 * **SOAK** — SINK with FILL's water, and the one look every hold in the
 * director's labs wears (the owner, 12 and 13 October 2026: *all should follow
 * "hold look" of "soak" to be consistent - remove alternatives*). SINK and
 * FILL, the looks it was made from, are gone with the rest of the HOLD LAB's
 * picker; what SOAK kept of SINK is here. The owner, 11 October 2026: *another
 * version which is based on "sink", but shares idea of "fill" so water should
 * come, but appearing from the center of the middle, and the final success
 * state should go to the very end of the borders, not end too early somewhere
 * in middle.*
 *
 * So the thumb sinks deeper beat by beat and a ripple runs off every beat, as
 * in SINK; and green water wells up under the thumb and spreads out to the
 * rim — the water is the game's own since 13 October 2026, every hold on the
 * field wearing it (`soak-water.ts`, `soak-hold.ts` in render).
 */

export const SOAK: Progress = {
  name: "soak",
  sentence:
    "the thumb sinks deeper beat by beat and a ripple runs out on every beat, as in SINK; green water wells up wide and fast under the thumb, then spreads slower out to the rim, its front rocking, and touches the edge all round the moment the hold is counted",
  // SINK's thumb: only a little way in when taken, deeper beat by beat.
  depth: (squish, fill) => squish * (0.3 + 0.7 * fill),
  // SINK's ripple, run out over the field off the last beat crossed, `since` seconds ago.
  around(v, fill, tone) {
    const beats = fill * v.ask.beats;
    const done = Math.floor(beats);
    if (done < 1 || !v.held) return;
    const since = (beats - done) * BEAT_SECONDS;
    const k = clamp01(since / 0.5);
    if (k >= 1) return;
    const { ctx, at, r } = v;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = toneHex(tone).hex;
    ctx.globalAlpha = 0.7 * (1 - k) ** 2;
    ctx.lineWidth = r * 0.12 * (1 - k) + 0.4;
    ctx.beginPath();
    ctx.ellipse(at.x, at.y + r * 0.1, r * (1.1 + 1.2 * k), r * (0.9 + 0.9 * k), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
  inside(v, drawn, _path, fill, tone) {
    soakWater(v.ctx, drawn, v.time, fill, tone);
  },
};
