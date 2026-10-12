import type { Point } from "@neon-spore/content";
import { pullTrackPoint, smoothstep } from "@neon-spore/render";
import { type Combo, PARTNER_PULLS, PARTNER_WAKES } from "./combo-lab-rule.js";
import { BEAT_SECONDS } from "./hold-lab-rule.js";

/**
 * **AUTO's thumb in THE COMBO LAB**, as `hold-lab-auto.ts` is the HOLD LAB's:
 * one whole pull held to the end of its hold, one let go at the end before
 * the hold is done, and one let go short, over and over — every state passes
 * under the eye with no mouse. Its length follows what the hold waits for.
 */

interface Step {
  until: number;
  down: boolean;
  /** Where along the track the thumb is by the step's end, 0..1. */
  to: number;
}

/** How long the hold at the end lasts: the beats, or the partner's whole pull. */
export const holdSeconds = (c: Combo): number =>
  c.partner === null ? c.beats * BEAT_SECONDS : PARTNER_WAKES + PARTNER_PULLS;

/** The loop for `c`, and its landmarks. */
export function comboLoop(c: Combo) {
  const T = holdSeconds(c);
  const take = 0.8;
  const pulled = take + 0.7;
  const counted = pulled + T;
  const letGo = counted + 0.4;
  const second = letGo + 1.4;
  const secondPulled = second + 0.7;
  const early = secondPulled + T * 0.5;
  const third = early + 1.6;
  const short = third + 0.5;
  const end = short + 1.3;
  const steps: Step[] = [
    { until: take, down: false, to: 0 },
    { until: pulled, down: true, to: 1 },
    { until: letGo, down: true, to: 1 },
    { until: second, down: false, to: 0 },
    { until: secondPulled, down: true, to: 1 },
    { until: early, down: true, to: 1 },
    { until: third, down: false, to: 0 },
    { until: short, down: true, to: 0.5 },
    { until: end, down: false, to: 0 },
  ];
  return { T, take, pulled, counted, letGo, second, early, third, short, end, steps };
}

/** Where the thumb is `t` seconds into `c`'s loop. */
export function comboThumb(c: Combo, t: number): { at: Point; down: boolean } {
  const loop = comboLoop(c);
  const s = ((t % loop.end) + loop.end) % loop.end;
  let start = 0;
  let from = 0;
  let step = loop.steps[0] as Step;
  for (const st of loop.steps) {
    step = st;
    if (s < st.until) break;
    start = st.until;
    from = st.down ? st.to : 0;
  }
  const u = Math.min(1, (s - start) / Math.max(0.001, step.until - start));
  // A whole pull goes a little past the end, the way a thumb overshoots.
  const k = step.down ? from + (step.to * (step.to === 1 ? 1.04 : 1) - from) * smoothstep(u) : 0;
  const q = pullTrackPoint(c.shape.track, Math.min(1, k));
  const over = Math.max(0, k - 1) * 40;
  const wander = { x: 1.2 * Math.sin(s * 3.1), y: 1 * Math.cos(s * 2.3) };
  return {
    at: { x: q.x + q.dx * over + wander.x, y: q.y + q.dy * over + wander.y },
    down: step.down,
  };
}
