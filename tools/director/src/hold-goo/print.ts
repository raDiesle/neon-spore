import { centre } from "../../../../packages/render/src/goo-body.js";
import { clamp01 } from "../../../../packages/render/src/goo-noise.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { BEAT_SECONDS } from "../hold-lab-rule.js";
import { type Progress, toneHex } from "./goo.js";

/**
 * **Two GOO holds about the thumb itself**: PRINT, the game's own thumbprint
 * (`hold-mark.ts`) pressed into the drop — the shipped hold mark's picture on
 * the shipped pull's drop — and SINK, the thumb going deeper into the drop
 * the longer it stays.
 */

/** The print's ridges, outermost first, in the drop's radius: `drawThumbprint`'s, a
 * little larger, as the drop is the whole mark. */
const RIDGES = [0.66, 0.52, 0.38, 0.24] as const;
/** A ridge leaves out a sixth of itself, the gap turned further each ring in. */
const GAP = Math.PI / 3;

/** PRINT — the thumbprint pressed into the drop, its ridges lighting from the outside in. */
export const PRINT: Progress = {
  name: "print",
  sentence:
    "the game's thumbprint is pressed into the drop; held, its ridges light green one after another from the outside in, each running round as it lights, and the last is the loop at its middle",
  inside(v, drawn, _path, fill, tone) {
    const { ctx } = v;
    const c = centre(drawn);
    const r = drawn.r;
    const parts = RIDGES.length + 1;
    const col = toneHex(tone);
    ctx.lineCap = "round";
    const groove = (i: number, k: number) => {
      const arc = new Path2D();
      if (i < RIDGES.length) {
        const w = RIDGES[i] as number;
        const from = Math.PI / 2 + 0.9 * i + GAP / 2;
        const span = (Math.PI * 2 - GAP) * k;
        arc.ellipse(c.x, c.y + r * 0.05 * i, r * w, r * w * 1.2, 0, from, from + span);
      } else {
        arc.ellipse(
          c.x,
          c.y + r * 0.16,
          r * 0.1,
          r * 0.14,
          0,
          Math.PI,
          Math.PI + Math.PI * 1.6 * k,
        );
      }
      return arc;
    };
    for (let i = 0; i < parts; i++) {
      // The groove pressed in, and the light catching its lower lip.
      const whole = groove(i, 1);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = GOO.deep;
      ctx.lineWidth = r * 0.09;
      ctx.stroke(whole);
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = GOO.core;
      ctx.lineWidth = r * 0.035;
      ctx.save();
      ctx.translate(0, r * 0.04);
      ctx.stroke(whole);
      ctx.restore();
      const k = clamp01(fill * parts - i);
      if (k <= 0) continue;
      const lit = groove(i, k);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = col.hex;
      ctx.lineWidth = r * 0.2;
      ctx.stroke(lit);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col.rim;
      ctx.lineWidth = r * 0.07;
      ctx.stroke(lit);
    }
  },
};

/** SINK — the thumb goes deeper the longer it stays; a ripple runs off every beat held. */
export const SINK: Progress = {
  name: "sink",
  sentence:
    "taken, the thumb is only a little way in; held, it sinks deeper beat by beat, green pooling in the hollow, and a ripple runs out over the field on every beat; all the way in, it boils away",
  depth: (squish, fill) => squish * (0.3 + 0.7 * fill),
  inside(v, drawn, _path, fill, tone) {
    if (fill <= 0) return;
    const { ctx } = v;
    const c = centre(drawn);
    const rr = drawn.r * (0.25 + 0.45 * fill);
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rr);
    g.addColorStop(0, toneHex(tone).rim);
    g.addColorStop(0.6, toneHex(tone).hex);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.25 + 0.5 * fill;
    ctx.fillStyle = g;
    ctx.fillRect(c.x - rr, c.y - rr, rr * 2, rr * 2);
  },
  around(v, fill, tone) {
    const beats = fill * v.ask.beats;
    const done = Math.floor(beats);
    if (done < 1 || !v.held) return;
    // The ripple off the last beat crossed, `since` seconds ago.
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
};
