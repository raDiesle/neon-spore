import type { Point } from "@neon-spore/content";
import { centre, rimAt, smoothPath } from "../../../../packages/render/src/goo-body.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { type Progress, toneHex } from "./goo.js";
import { SINK } from "./print.js";

/**
 * **SOAK** — SINK with FILL's water. The owner, 11 October 2026: *another
 * version which is based on "sink", but shares idea of "fill" so water should
 * come, but appearing from the center of the middle, and the final success
 * state should go to the very end of the borders, not end too early somewhere
 * in middle.*
 *
 * So the thumb sinks deeper beat by beat and a ripple runs off every beat, as
 * in SINK; and green water wells up under the thumb and spreads outward, its
 * front rocking as FILL's surface does. The front is laid on the drop's own
 * rim (`rimAt`), `fill` of the way out along every angle — so it keeps the
 * drop's lumps as it grows and touches the rim all round at the very moment
 * the hold is counted, never covering the drop early.
 */

/** Points round the front: enough that a lump of the rim is a curve and not a corner. */
const SAMPLES = 40;

export const SOAK: Progress = {
  name: "soak",
  sentence:
    "the thumb sinks deeper beat by beat and a ripple runs out on every beat, as in SINK; green water wells up under the thumb and spreads out to the rim, its front rocking, and touches the edge all round the moment the hold is counted",
  depth: SINK.depth,
  around: SINK.around,
  inside(v, drawn, _path, fill, tone) {
    if (fill <= 0.002) return;
    const { ctx, time } = v;
    const c = centre(drawn);
    // The front rocks while it travels and lies still on the rim when it arrives.
    const rock = 0.09 * (1 - fill) ** 0.7;
    const pts: Point[] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const a = (i / SAMPLES) * Math.PI * 2;
      const rim = rimAt(drawn, GOO, time, a);
      const k = fill * (1 + rock * Math.sin(a * 5 + time * 7) - rock);
      pts.push({ x: c.x + rim.x * k, y: c.y + rim.y * k });
    }
    const front = smoothPath(pts);
    const col = toneHex(tone);
    // The water: brightest where it wells up, deeper towards its front.
    const reach = drawn.r * 1.3 * fill;
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(0.5, reach));
    g.addColorStop(0, col.rim);
    g.addColorStop(0.35, col.hex);
    g.addColorStop(1, col.hex);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = g;
    ctx.fill(front);
    // Its front, lit: the line the eye follows out to the rim.
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = col.rim;
    ctx.lineWidth = Math.max(0.8, drawn.r * 0.08);
    ctx.stroke(front);
    // The spring at the middle, where the thumb is.
    const spring = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, drawn.r * 0.4);
    spring.addColorStop(0, "#FFFFFF");
    spring.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.35 * (0.6 + 0.4 * Math.sin(time * 9));
    ctx.fillStyle = spring;
    ctx.fillRect(c.x - drawn.r * 0.4, c.y - drawn.r * 0.4, drawn.r * 0.8, drawn.r * 0.8);
  },
};
