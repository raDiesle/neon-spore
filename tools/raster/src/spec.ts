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

/**
 * THE VISE's kernel crack (`vise-crack-art.ts`), the second painted atlas.
 *
 * The burst's frame and count to start from, because its atlas is the one
 * that sets the budget: **the strip stays under 90 kB**, and if the painting
 * does not fit at these numbers it drops frames before the budget rises
 * (`docs/queue.md`'s entry, `docs/raster.md`).
 */
export const VISE_CRACK: { size: number; frames: number; seed: number; frameMs: number } = {
  size: 96,
  frames: 16,
  seed: 20260926,
  frameMs: 45,
};
