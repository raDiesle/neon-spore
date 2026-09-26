import { smoothstep } from "./ease.js";

/**
 * MOTION THAT A RIG HAS WITHOUT BEING TOLD: the always-on life of a body, as
 * pure functions of time.
 *
 * Two pieces, and neither keeps state, so neither needs `Effects` and neither
 * can survive a restart it should not (`world.tick` is not monotonic; a
 * function of it simply starts again).
 *
 * - **`noise1`** — smooth value noise, a hash of the integer lattice eased
 *   between. The difference between a body that breathes and one on a sine is
 *   that the breath is never quite the same twice; two octaves of this on top
 *   of the period do it. Hash-based, so it is seeded by a number and never by
 *   `Math.random`.
 * - **`chainAt`** — follow-through along a chain of links (a tail, a
 *   tentacle, a trailing fin): each link does what the root did a little
 *   *earlier*, and a little less. That lag is most of what a verlet chain
 *   looks like, at none of its cost and with none of its memory. A real
 *   verlet chain — one that is dragged and settles — is the one case this is
 *   not, and it belongs in `Effects` (`docs/queue.md`, CLOUD ONLY).
 *
 * Time is in seconds, from whatever clock the caller holds.
 */

/** A lattice hash to 0..1, seeded. Integer arithmetic only, so it is the same everywhere. */
function hash(i: number, seed: number): number {
  let h = (Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul(seed | 0, 0x165667b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth noise, -1..1, one lattice cell per unit of `t`. */
export function noise1(t: number, seed = 0): number {
  const i = Math.floor(t);
  const f = t - i;
  const u = smoothstep(f);
  const a = hash(i, seed);
  const b = hash(i + 1, seed);
  return (a + (b - a) * u) * 2 - 1;
}

/**
 * A breath: a period, and a wander on it so no two are the same. -1..1-ish.
 * `wander` 0 is a pure sine; 0.35 is alive; past 0.6 it stops reading as a breath.
 */
export function breath(t: number, period: number, wander = 0.35, seed = 0): number {
  const phase = (t / period) * Math.PI * 2 + noise1(t / period, seed) * wander * 2;
  return Math.sin(phase) * (1 - wander * 0.5) + noise1(t * 0.9, seed + 7) * wander * 0.5;
}

/**
 * The follow-through down a chain. `root(t)` is what the first link does;
 * link `i` of `n` does it `lag·i` seconds late, scaled by `falloff^i` — or,
 * with a `falloff` above 1, grown, which is a whip rather than a tail.
 */
export function chainAt(
  root: (t: number) => number,
  t: number,
  i: number,
  lag: number,
  falloff = 0.9,
): number {
  return root(t - lag * i) * falloff ** i;
}
