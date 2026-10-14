import type { Point } from "@neon-spore/content";
import { pullTrackPoint, smoothstep } from "@neon-spore/render";
import { BEAT_SECONDS } from "./hold-lab-rule.js";
import { atOf, type LeverSetup, mineShape, PARTNER_SUM } from "./lever-lab-setup.js";

/**
 * **AUTO's thumb in THE LEVER LAB**, as `hold-lab-auto.ts` is the HOLD LAB's:
 * a lever carried into its zone and held through the count, one let go
 * before it, and one held at a depth the zone does not want — over and over,
 * so every state passes under the eye with no mouse. A sideways groove is
 * carried right, then left, then right, so its either way is seen.
 *
 * Asked a depth only, the same three carries show the knob standing at
 * three depths and springing back from each.
 */

interface Step {
  until: number;
  /** The value the step carries the lever to, 0 for a thumb off the glass. */
  value: number;
  down: boolean;
  sign: 1 | -1;
}

/** The hand's depth that brings the zone's value to `v`: itself, or for
 * TWO · SUMMED what the partner's share leaves. */
function handFor(setup: LeverSetup, v: number): number {
  const d = setup.pair === "summed" ? 2 * v - PARTNER_SUM : v;
  return Math.max(0, Math.min(1, d));
}

/** The loop for `setup`: in its zone, the same let go early, then outside it. */
export function leverLoop(setup: LeverSetup) {
  const T = setup.beats.beats * BEAT_SECONDS;
  const z = setup.ask.zone;
  const inZone = z ? (z[0] + z[1]) / 2 : 0.75;
  // Past a band is too deep; short of a grip is not deep enough.
  const outZone = !z ? 0.3 : z[1] < 1 ? Math.min(1, z[1] + 0.2) : z[0] * 0.55;
  const steps: Step[] = [];
  let t = 0;
  const rest = (s: number): void => {
    t += s;
    steps.push({ until: t, value: 0, down: false, sign: 1 });
  };
  const carry = (value: number, sign: 1 | -1, hold: number): void => {
    t += 0.6 + hold;
    steps.push({ until: t, value: handFor(setup, value), down: true, sign });
  };
  rest(0.8);
  // The partner takes a moment to come in: the whole hold waits for it.
  carry(inZone, 1, T + (setup.pair === "one" ? 0.4 : 1));
  rest(0.9);
  carry(inZone, -1, T * 0.5);
  rest(1);
  carry(outZone, 1, 1.4);
  rest(1);
  return { T, end: t, steps };
}

export interface AutoThumb {
  at: Point;
  down: boolean;
}

/** Where the thumb is `t` seconds into `setup`'s loop: carried in over its
 * first 0.6 seconds, eased, and never quite still once there. */
export function leverThumb(setup: LeverSetup, t: number): AutoThumb {
  const loop = leverLoop(setup);
  const s = ((t % loop.end) + loop.end) % loop.end;
  let start = 0;
  let step = loop.steps[0] as Step;
  for (const st of loop.steps) {
    step = st;
    if (s < st.until) break;
    start = st.until;
  }
  const shape = mineShape(setup);
  const rest = pullTrackPoint(shape.track, shape.origin);
  if (!step.down) return { at: { x: rest.x, y: rest.y }, down: false };
  const u = smoothstep(Math.min(1, (s - start) / 0.6));
  const q = pullTrackPoint(shape.track, atOf(shape, step.value * u, step.sign));
  const wander = { x: 1.2 * Math.sin(s * 3.1), y: 1 * Math.cos(s * 2.3) };
  return { at: { x: q.x + wander.x, y: q.y + wander.y }, down: true };
}
