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

/**
 * A repeatable 0..1 from a **name** — a boss's id, an enemy's — and a counter,
 * for a thing that has to be told apart from its neighbours by what it is
 * called rather than by where or when it is (`glance-temper.ts`). FNV-1a over
 * `name#n`, then murmur3's finaliser: without it, names a last letter apart
 * came out within a hundredth of each other.
 */
export function nameHash(name: string, n = 0): number {
  let h = 0x811c9dc5;
  const s = `${name}#${n}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return mix32(h) / 0x100000000;
}

/**
 * murmur3's integer finaliser: every bit of `h` reaches every bit of the
 * answer, an unsigned 32-bit integer. `first` is the opening shift. murmur3's
 * own is 16; the backdrop's motes and `solid-motion.ts`'s lattice were written
 * with 15, and every number they answer is already on the screen.
 */
export function mix32(h: number, first = 16): number {
  h ^= h >>> first;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}
