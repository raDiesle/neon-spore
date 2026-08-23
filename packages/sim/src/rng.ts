/**
 * Seeded xorshift32. The only source of randomness the simulation may use.
 * Ported unchanged from the raster prototype so old waves replay identically.
 */
export interface Rng {
  state: number;
}

export function createRng(seed: number): Rng {
  return { state: ((seed + 1) * 2654435761) >>> 0 || 1 };
}

/** Uniform float in [0, 1). */
export function next(rng: Rng): number {
  let s = rng.state;
  s ^= s << 13;
  s >>>= 0;
  s ^= s >>> 17;
  s ^= s << 5;
  s >>>= 0;
  rng.state = s;
  return s / 4294967296;
}

/** Integer in [0, n). */
export function nextInt(rng: Rng, n: number): number {
  return Math.floor(next(rng) * n);
}
