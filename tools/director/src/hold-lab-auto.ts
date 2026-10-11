import type { Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { BEAT_SECONDS, HOLD_AT, type HoldAsk, SLIP_REACH } from "./hold-lab-rule.js";

/**
 * **AUTO's thumb in the HOLD LAB**, as `pull-lab-auto.ts` is the PULL LAB's:
 * one whole hold, one let go early, one that slides off the mark, over and
 * over, so every state of a look passes under the eye with no mouse — the
 * same loop for every look, so two are compared on one rhythm. Its length
 * follows the beats the hold asks (`HoldAsk`).
 *
 * A held thumb is never quite still: it wanders a pixel or two the whole time,
 * well inside the mark, the way a real one does.
 */

/** One step of the loop: until when, whether the thumb is down, and how far it
 * has slid off the mark's middle by its end, as a share of `SLIP_REACH`. */
interface Step {
  until: number;
  down: boolean;
  slide: number;
}

/** The loop for `ask`, and its landmarks for the sheet. */
export function loopOf(ask: HoldAsk) {
  const T = ask.beats * BEAT_SECONDS;
  const take = 0.8;
  const counted = take + T;
  const letGo = counted + 0.35;
  const second = letGo + 1.1;
  const early = second + T * 0.55;
  const third = early + 1.1;
  const slipBy = third + Math.min(0.9, T * 0.8);
  const end = slipBy + 1.2;
  // The slide crosses the limit about four fifths of the way (1.15 × smoothstep(u)^1.6 = 1),
  // and is well on its way, near the edge, at seven tenths.
  const sliding = third + 0.7 * (slipBy - third);
  const slipAt = third + 0.8 * (slipBy - third);
  const steps: Step[] = [
    { until: take, down: false, slide: 0 },
    { until: letGo, down: true, slide: 0 },
    { until: second, down: false, slide: 0 },
    { until: early, down: true, slide: 0 },
    { until: third, down: false, slide: 0 },
    // Slides out past the limit: 1.15 of it, so the slip lands near the end.
    { until: slipBy, down: true, slide: 1.15 },
    { until: slipBy + 0.2, down: true, slide: 1.15 },
    { until: end, down: false, slide: 0 },
  ];
  return { T, take, counted, letGo, second, early, third, sliding, slipAt, slipBy, end, steps };
}

export interface AutoThumb {
  at: Point;
  down: boolean;
}

/** The way the third hold slides: off to the lower right, as a thumb drags. */
const SLIDE_WAY = { x: 0.88, y: 0.47 };

/** Where the thumb is `t` seconds into `ask`'s loop. */
export function autoThumb(ask: HoldAsk, t: number): AutoThumb {
  const loop = loopOf(ask);
  const s = ((t % loop.end) + loop.end) % loop.end;
  let start = 0;
  let from = 0;
  let step = loop.steps[0] as Step;
  for (const st of loop.steps) {
    step = st;
    if (s < st.until) break;
    start = st.until;
    from = st.down ? st.slide : 0;
  }
  if (!step.down) return { at: HOLD_AT, down: false };
  const u = Math.min(1, (s - start) / Math.max(0.001, step.until - start));
  // Slow at first, then away: a thumb that drifts and then drags.
  const slide = (from + (step.slide - from) * smoothstep(u) ** 1.6) * SLIP_REACH;
  const wander = { x: 1.6 * Math.sin(s * 3.1), y: 1.2 * Math.cos(s * 2.3) };
  return {
    at: {
      x: HOLD_AT.x + SLIDE_WAY.x * slide + wander.x,
      y: HOLD_AT.y + SLIDE_WAY.y * slide + wander.y,
    },
    down: true,
  };
}
