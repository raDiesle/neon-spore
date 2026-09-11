import type { Asset } from "./types.js";
import { WISP_ARMS, WISP_COMB, WISP_SKIRT, WISP_THREADS } from "./wisp-assets.js";

/**
 * Every asset the LIBRARY shows, in the order it shows them.
 *
 * This list is the only place that knows which assets exist — one more is a
 * file beside this one and one line here. Grouped by the creature the look
 * belongs to, the one the game wears first in each group, so a reader sees
 * what is shipped before what was kept beside it. `types.ts` says what an
 * asset is and why the view is a canvas.
 */
export const ASSETS: readonly Asset[] = [WISP_ARMS, WISP_THREADS, WISP_COMB, WISP_SKIRT];

export type { Asset, AssetContext, AssetFrame } from "./types.js";
export { BEAT_SECONDS } from "./types.js";
