/**
 * The one repeatable 0..1 in `render/`, and the one place its two magic
 * numbers are written down.
 *
 * **Not `Rng`.** That stream belongs to the simulation, and a marking that
 * pulled from it would move it — two devices would then disagree about the
 * game over a spark.
 *
 * **Not `Math.random`.** This has to answer the same question twice: within a
 * frame, because a jitter is read once for a box and again for its corner
 * ticks; and across frames, because a shard that moved somewhere else every
 * frame would flicker rather than fly.
 *
 * **What it is not is shared.** Its usual argument is `time`, which is each
 * device's own wall clock (`apps/game/src/main.ts`), so it draws the same arc
 * on the same device from one frame to the next — never the same arc on both
 * devices at once. Anything the pair has to *agree* about takes the beat, not
 * this. Seven files carried a private copy of it before this one existed.
 */

/**
 * A repeatable 0..1 from one number, or from two or three when a marking is
 * spread across a grid of them. The unused terms are multiplied by zero, which
 * is exact, so `sinHash(n)` is the same stream `sinHash(n, 0, 0)` is.
 */
export function sinHash(a: number, b = 0, c = 0): number {
  const s = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return s - Math.floor(s);
}

/** The same stream read as -1..1, for jitter that bends both ways. */
export function signedHash(a: number, b = 0, c = 0): number {
  return sinHash(a, b, c) * 2 - 1;
}

/**
 * A repeatable *sequence* of 0..1 values from one seed, which is the half
 * `sinHash` cannot answer: that one is a function of its arguments and these
 * callers want the next number without carrying a counter for it.
 *
 * The constants are the Numerical Recipes linear congruential ones, and the
 * `(n >>> 8) % 10000` reduction drops the low bits an LCG is weakest in. Both
 * are part of the answer rather than an implementation detail — a crack drawn
 * from a seed must be the same crack next frame, so changing either changes
 * what is on the screen.
 */
export function stream(seed: number): () => number {
  let n = seed | 0;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) | 0;
    return ((n >>> 8) % 10000) / 10000;
  };
}
