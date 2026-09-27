import { PAINTED_STRIPS, STRIP_NAMES, type StripName } from "@neon-spore/render";
import type { BurstSpec } from "./render.js";
import type { StripSpec } from "./render-strip.js";

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
 * Every painted strip that goes through `strip-bake.ts`, by its file name —
 * read off `PAINTED_STRIPS`, the one table the renderer slices them with, so
 * the painter and the player cannot disagree about a strip's numbers.
 *
 * **A strip stays under 90 kB**, and if a painting does not fit at its row's
 * numbers it drops frames before the budget rises (`docs/raster.md`).
 */
export const STRIPS = Object.fromEntries(
  STRIP_NAMES.map((name) => {
    const { frameSize, frames, seed, frameMs } = PAINTED_STRIPS[name];
    return [name, { size: frameSize, frames, seed, frameMs }];
  }),
) as Record<StripName, StripSpec & { frameMs: number }>;
