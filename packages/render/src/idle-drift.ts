import { smoothstep } from "./ease.js";
import { chainAt, noise1 } from "./solid-motion.js";

/**
 * THE IDLE DRIFT: the slow wander a boss has on top of the pose its script
 * holds (`docs/spec/living-bosses.md` §1). Four angles for the whole body —
 * yaw, pitch, roll, and the head's yaw on top of the body's — as pure
 * functions of `look.time` and a seed, so nothing is kept, nothing goes in
 * `Effects` and `hashWorld` never sees it. The parts' own drift is next door
 * (`idle-drift-parts.ts`).
 *
 * **The head leads and the body follows**: body yaw is the head's a quarter
 * cycle late at half its size (`chainAt`), plus a little of its own, so a
 * turn reads as intent rather than as a model on a turntable.
 *
 * **Never snaps.** Each angle is `amp · noise1(2t / period)`, one lattice cell
 * every half period, and value noise eased by `smoothstep` climbs at most
 * `3 · amp / cell` — so the speed ceiling is a property of the numbers below,
 * not of luck. The body's three are under 12° a second that way; the head's
 * own yaw is under 20°, and the head as the eye sees it, body and all, under
 * 30° (the part drift's two ceilings). That is why the head's reach is 18°,
 * not the table's 28°: 28° every five seconds is 32° a second, which the
 * spec's own ceilings forbid, and the ceiling is the rule that is tested.
 *
 * Every angle is in radians, the unit `view(yaw, pitch)` takes.
 */

export const DEG = Math.PI / 180;

/** One wandering angle's reach and period, in degrees and seconds. */
export interface Wander {
  readonly amp: number;
  readonly period: number;
}

export const IDLE_DRIFT = {
  /** The head's yaw relative to the body: it leads, so it is the root. */
  headYaw: { amp: 18, period: 7 },
  /** The body's own yaw, on top of the half of the head's it follows with. */
  yaw: { amp: 5, period: 11 },
  /** How much of the head's yaw the body follows with, and how late (a quarter of its cycle). */
  follow: 0.5,
  pitch: { amp: 5, period: 8.5 },
  roll: { amp: 6, period: 7 },
} as const;

/** Body yaw's lag behind the head: a quarter of the head's cycle. */
export const HEAD_LEAD = IDLE_DRIFT.headYaw.period / 4;

/**
 * How much drift is left, by what is happening: a window open over marks
 * eases it to a third, a part carrying a live mark to a tenth (the owner, 27
 * September 2026: THE INSTAR holds still while its marks are live), a beaten
 * boss to nothing. `hush` is this multiplier, 1 alive and 0 still.
 */
export const HUSH = { alive: 1, marks: 1 / 3, liveMark: 0.1, beaten: 0 } as const;

export interface BodyDrift {
  readonly yaw: number;
  readonly pitch: number;
  readonly roll: number;
  /** The head's yaw relative to the body, radians. */
  readonly headYaw: number;
}

/** A seed for one channel of one seed, so no two angles share a lattice. */
export function subSeed(seed: number, k: number): number {
  let h = Math.imul(seed ^ Math.imul(k + 1, 0x9e3779b1), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) | 0;
}

/** One angle, in degrees: `amp · noise1` with a cell every half period. At most `6 · amp / period` degrees a second. */
export function wander(t: number, seed: number, w: Wander): number {
  return w.amp * noise1((t * 2) / w.period, seed);
}

/** The head's yaw relative to the body, degrees, before any hush. */
export function headYawDeg(t: number, seed: number): number {
  return wander(t, subSeed(seed, 0), IDLE_DRIFT.headYaw);
}

/** The whole body's drift at `time` seconds, scaled by `hush` (`HUSH`, eased by `easeHush`). */
export function idleDrift(time: number, seed: number, hush = 1): BodyDrift {
  const head = (t: number) => headYawDeg(t, seed);
  const yaw =
    chainAt(head, time, 1, HEAD_LEAD, IDLE_DRIFT.follow) +
    wander(time, subSeed(seed, 1), IDLE_DRIFT.yaw);
  const k = hush * DEG;
  return {
    yaw: yaw * k,
    pitch: wander(time, subSeed(seed, 2), IDLE_DRIFT.pitch) * k,
    roll: wander(time, subSeed(seed, 3), IDLE_DRIFT.roll) * k,
    headYaw: head(time) * k,
  };
}

/**
 * `hush` a beat after it was asked to change: from where it was to where it
 * is going, over one beat. The caller holds the two ends and the beat it
 * changed on, which is all a pure function needs; `beatsSince` past 1 is `to`.
 */
export function easeHush(from: number, to: number, beatsSince: number): number {
  return from + (to - from) * smoothstep(beatsSince);
}

/**
 * **The settle**: where a child is, relative to its rest, `since` seconds
 * after the script moved its parent by `move` — `−move · e^(−t/τ) · cos(ωt)`.
 * It starts where it was (a whole move behind), swings through, overshoots
 * by a fifth of the move and is within a degree of rest by half a second for
 * any move under 60°. A function of the step's own clock, so it keeps nothing.
 */
export const SETTLE = { tau: 0.12, k: 1.785 } as const;

export function settle(since: number, move: number): number {
  if (since < 0) return -move;
  const w = SETTLE.k / SETTLE.tau;
  return -move * Math.exp(-since / SETTLE.tau) * Math.cos(w * since);
}

/**
 * **The gesture's let-go**: how much of a part's drift is left while the
 * script owns it. It eases to nothing over a quarter beat from the gesture's
 * start, and back over a quarter beat after it ends from wherever it had got
 * to — so a gesture shorter than a quarter beat never jumps. `length` is the
 * gesture's length in beats, `Infinity` while it is still going.
 */
export function letGo(beatsSince: number, length = Number.POSITIVE_INFINITY): number {
  if (beatsSince < 0) return 1;
  const going = (b: number) => 1 - smoothstep(b * 4);
  if (beatsSince <= length) return going(beatsSince);
  const from = going(length);
  return from + (1 - from) * smoothstep((beatsSince - length) * 4);
}
