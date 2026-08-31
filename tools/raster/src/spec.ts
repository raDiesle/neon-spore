import type { BurstSpec } from "./render.js";

/**
 * The one description of the burst — the only place its numbers are written.
 *
 * Its own file because both the generator and the verifier need it, and
 * importing it from `run.ts` would run the generator as a side effect of
 * asking how many frames there are. That is not hypothetical tidiness: it is
 * what `bun run raster:verify` did on its first outing, quietly rebuilding
 * every asset before checking it, which is a check that can never fail.
 */
export const BURST: BurstSpec & { frameMs: number } = {
  size: 96,
  frames: 16,
  spikes: 26,
  seed: 20260831,
  frameMs: 40,
};
