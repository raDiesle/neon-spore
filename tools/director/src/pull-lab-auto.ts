import type { Point } from "@neon-spore/content";
import { pullTrackPoint, smoothstep } from "@neon-spore/render";
import type { LabShape } from "./pull-lab-shapes.js";

/**
 * **AUTO's thumb in the PULL LAB**: one whole pull and one short one, over
 * and over, so every state of a look — waiting, taken, filling, counted,
 * refused, going home — passes under the eye with no mouse at all. The same
 * loop every shape, so two looks are compared on one rhythm. With the bar's
 * OFF PATH rule on, the short pull is a straying one instead: three quarters
 * of the way, drifting off the path as it goes (`STRAY_DRIFT`).
 */

/** One step of the loop: where the thumb is, as a share of the way, and whether it is down. */
interface Beat {
  /** Seconds into the loop this step ends at. */
  until: number;
  /** The share of the pull the thumb is at by then, from the knob's rest. */
  to: number;
  down: boolean;
}

const LOOP: readonly Beat[] = [
  { until: 0.8, to: 0, down: false },
  { until: 1.0, to: 0, down: true },
  { until: 2.3, to: 1.06, down: true },
  { until: 2.8, to: 1.06, down: true },
  { until: 4.4, to: 0, down: false },
  { until: 4.6, to: 0, down: true },
  { until: 5.4, to: 0.45, down: true },
  { until: 5.6, to: 0.45, down: true },
  { until: 7.2, to: 0, down: false },
];
export const AUTO_SECONDS = (LOOP.at(-1) as Beat).until;

export interface AutoThumb {
  at: Point;
  down: boolean;
}

/** Field pixels of thumb per share of the way past an end. */
const OVERSHOOT = 120;
/** How far a straying pull gets along, and how far off the path it ends, in
 * field pixels — past a tile, so either tolerance on the bar catches it. */
const STRAY_REACH = 0.75;
const STRAY_DRIFT = 50;
/** How far off the path the short pull wanders with the rule free, in field
 * pixels — under a tile, so it is still a short pull while the rule is free,
 * and a look that keeps the knob under the hand shows it let go off the path. */
const SHORT_DRIFT = 24;

/** Where the thumb is `t` seconds into the loop. The rope goes down and out
 * to the right; a two-way pull goes one way whole and the other way short. */
export function autoThumb(shape: LabShape, t: number, strays = false): AutoThumb {
  const s = ((t % AUTO_SECONDS) + AUTO_SECONDS) % AUTO_SECONDS;
  let from = 0;
  let start = 0;
  let beat = LOOP[0] as Beat;
  for (const b of LOOP) {
    beat = b;
    if (s < b.until) break;
    from = b.to;
    start = b.until;
  }
  const u = smoothstep(Math.min(1, (s - start) / Math.max(0.001, beat.until - start)));
  const share = beat.down ? from + (beat.to - from) * u : 0;
  const second = s > 4.4;
  if (strays && second && shape.direction !== "free" && beat.down) {
    const reach = share / (LOOP[6] as Beat).to;
    return { at: strayAt(shape, reach), down: true };
  }
  return { at: thumbAt(shape, share, second), down: beat.down };
}

/** A pull that wanders: `reach` of the way through it, along the path and
 * out to its side by as much again. A two-way pull strays on its short side. */
function strayAt(shape: LabShape, reach: number): Point {
  const k =
    shape.origin > 0 ? shape.origin - reach * STRAY_REACH * shape.origin : reach * STRAY_REACH;
  const q = pullTrackPoint(shape.track, k);
  const off = reach * reach * STRAY_DRIFT;
  return { x: q.x - q.dy * off, y: q.y + q.dx * off };
}

function thumbAt(shape: LabShape, share: number, second: boolean): Point {
  const t = shape.track;
  if (shape.direction === "free") {
    const [a, b] = t.pts as [Point, Point];
    const len = Math.hypot(b.x - a.x, b.y - a.y) * share;
    const ang = second ? Math.PI * 0.85 : Math.PI * 0.3;
    return { x: a.x + Math.cos(ang) * len, y: a.y + Math.sin(ang) * len };
  }
  const k = shape.origin > 0 ? shape.origin + (second ? -1 : 1) * share * shape.origin : share;
  const on = beyond(shape, k);
  if (!second) return on;
  const q = pullTrackPoint(t, k);
  const off = (share / (LOOP[6] as Beat).to) ** 2 * SHORT_DRIFT;
  return { x: on.x - q.dy * off, y: on.y + q.dx * off };
}

/** A point `k` of the way along, carried on past either end so the thumb
 * overshoots the way a real one does. */
function beyond(shape: LabShape, k: number): Point {
  const c = Math.max(0, Math.min(1, k));
  const q = pullTrackPoint(shape.track, c);
  // Past an end, on along the way the track was heading there.
  const over = (k - c) * OVERSHOOT;
  return { x: q.x + q.dx * over, y: q.y + q.dy * over };
}
