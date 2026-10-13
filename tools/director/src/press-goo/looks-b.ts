import { mix } from "../../../../packages/render/src/goo-noise.js";
import { GOO } from "../../../../packages/render/src/goo-style.js";
import { toneHex } from "../hold-goo/goo.js";
import { knock } from "./call.js";
import type { Count } from "./goo.js";

/**
 * **POP**, **COUNT** and **KNOCK** — the rest of THE PRESS LAB's ways to say
 * how many presses a mark asks (`looks.ts` has PIPS and STEPS).
 */

/** How big a bubble of POP is, over the drop's radius, for `n` of them. */
const bubbleR = (n: number): number => (n === 1 ? 0.4 : n <= 5 ? 0.22 : 0.16);
/** The golden angle: bubbles laid by it fill a disc evenly, whatever their number. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** Seconds a popped bubble's ring takes to spread and go. */
const POPPING = 0.28;

/**
 * **POP** — one bubble in the drop for every press it asks, FIZZ's bubbles
 * before they rise: each press bursts one, and the drop shrinks a little as
 * it empties. One big bubble is one press; a drop crowded with small ones
 * wants a lot of them. A lapse blows them back up, red.
 */
export const POP: Count = {
  key: "pop",
  name: "pop",
  sentence:
    "one bubble in the drop for every press it asks, FIZZ's bubbles before they rise: each press bursts one and the drop shrinks a little as it empties; a lapse blows them back up, red",
  body: (b, v) => ({ ...b, r: b.r * (1 - 0.22 * Math.min(1, v.shown / v.ask.times)) }),
  over(v, drawn, tone) {
    const n = v.ask.times;
    const { ctx, time } = v;
    const col = toneHex(tone);
    const size = drawn.r * bubbleR(n);
    ctx.save();
    for (let i = 0; i < n; i++) {
      const d = n === 1 ? 0 : drawn.r * 0.6 * Math.sqrt((i + 0.5) / n);
      const a = i * GOLDEN + time * 0.5;
      const x = drawn.at.x + Math.cos(a) * d;
      const y = drawn.at.y + Math.sin(a) * d * 0.85 + Math.sin(time * 3 + i) * drawn.r * 0.03;
      ctx.lineWidth = Math.max(0.5, size * 0.22);
      ctx.strokeStyle = mix(col.hex, "#FFFFFF", 0.35);
      if (i >= v.done) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = col.hex;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        // The glint on its top left.
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x - size * 0.35, y - size * 0.35, size * 0.18, 0, Math.PI * 2);
        ctx.fill();
      } else if (i === v.done - 1 && v.pressed < POPPING) {
        // FIZZ's pop: a ring a little wider each frame, and gone.
        const p = v.pressed / POPPING;
        ctx.globalAlpha = 0.9 * (1 - p) ** 2;
        ctx.beginPath();
        ctx.arc(x, y, size * (1 + 0.9 * p), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  },
};

/** The number's size over the drop's radius, by how many figures it has. */
const figureSize = (s: string): number => (s.length > 1 ? 0.95 : 1.15);

/**
 * **COUNT** — the presses still wanted, as a number in the drop: *5*, *4*, …
 * Each press punches the next one in and throws the last one up and away.
 * The plainest of the five, and the only one that has to be read; a lapse
 * counts it back up, red.
 */
export const COUNT: Count = {
  key: "count",
  name: "count",
  sentence:
    "the presses still wanted, as a number in the drop; each press punches the next one in and throws the last one up and away, and a lapse counts it back up, red",
  over(v, drawn, tone) {
    const { ctx } = v;
    const col = toneHex(tone);
    const left = v.ask.times - v.done;
    const k = Math.min(1, v.pressed / 0.3);
    const punch = v.done > 0 && v.failure === null ? Math.exp(-v.pressed * 12) : 0;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const figure = (s: string, dy: number, scale: number, alpha: number): void => {
      const px = drawn.r * figureSize(s) * scale;
      ctx.font = `700 ${px.toFixed(1)}px "Courier New",monospace`;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = Math.max(1, px * 0.12);
      ctx.strokeStyle = tone === "red" ? col.hex : mix(GOO.neon, "#000000", 0.55);
      ctx.strokeText(s, drawn.at.x, drawn.at.y + dy);
      ctx.fillStyle = tone === "red" ? col.rim : "#FFFFFF";
      ctx.fillText(s, drawn.at.x, drawn.at.y + dy);
    };
    if (left > 0) figure(String(left), drawn.r * 0.06, 1 + 0.45 * punch, 1);
    // The one just pressed away, flying up off the drop.
    if (v.done > 0 && k < 1 && v.failure === null)
      figure(String(left + 1), drawn.r * (0.06 - 1.3 * k), 1 - 0.3 * k, (1 - k) ** 1.5);
    ctx.restore();
  },
};

/** Seconds between KNOCK's hops, and the wait after the last in a round. */
const KNOCK_GAP = 0.13;
const KNOCK_REST = 0.9;

/**
 * **KNOCK** — the drop shows the presses itself: before the first, it hops
 * as many times as it asks, quick, then waits — one hop, a burst of five, a
 * long rattle of ten — so the call is the gesture, played. Each press then
 * greens the drop a step, so it is green all through on the last.
 */
export const KNOCK: Count = {
  key: "knock",
  name: "knock",
  sentence:
    "before the first press the drop hops as many times as it asks, quick, then waits — one hop, a burst of five, a rattle of ten; each press greens the drop a step",
  call(v) {
    const n = v.ask.times;
    const at = Array.from({ length: n }, (_, i) => i * KNOCK_GAP);
    return knock(v, { at, round: (n - 1) * KNOCK_GAP + KNOCK_REST });
  },
  green: (v) => 0.85 * Math.min(1, v.shown / v.ask.times),
};
