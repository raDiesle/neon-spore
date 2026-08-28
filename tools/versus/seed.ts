/**
 * One seeded random stream, so the only thing that can differ between the two
 * sides of a VERSUS frame is the patch.
 *
 * `sparks.ts` and `deflect.ts` each randomise four values per spawn. Draw the
 * same world twice through two renderers and those eight numbers are eight
 * different numbers, so two *identical* looks come out as two different
 * pictures — which is fatal twice over: the pair's whole claim is that the
 * patch is the only difference, and BLINK, two canvases in perfect
 * registration alternating at 1 Hz, is unreadable if the noise moves.
 *
 * So each side of a frame runs with `Math.random` replaced by the same
 * deterministic stream from the same seed. This is a tool, not the game: the
 * simulation's randomness comes from the seeded `Rng` and is not touched here,
 * and `packages/sim/test/purity.test.ts` keeps it that way.
 */

/**
 * mulberry32: one multiply-xorshift round per call, thirty-two bits of state.
 * Chosen for being short enough to read in one sitting — nothing here needs
 * statistical quality, it needs two runs to agree.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Replace `Math.random` with a stream seeded at `seed`, and hand back the way
 * to put the real one back. Call it in a `finally`, beside `restore` — a tool
 * that leaves a fake `Math.random` installed has made every later frame lie.
 *
 *     const unseed = seedRandom(frameNumber);
 *     try { draw(); } finally { unseed(); }
 */
export function seedRandom(seed: number): () => void {
  const real = Math.random;
  Math.random = mulberry32(seed);
  return () => {
    Math.random = real;
  };
}
