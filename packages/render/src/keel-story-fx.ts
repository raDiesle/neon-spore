import type { SimEvent } from "@neon-spore/sim";

/**
 * **The receipts of THE KEEL's story between** (§24 rows 9, 10, 11 and 15) —
 * the flip, the marrow, the breath and the cooldown — cut out of `KeelFx`'s
 * switch along the fight's line, so each state's receipt lands here as its
 * look does. The fight's own receipts, and the state they write, stay in
 * `keel-fx.ts`, which calls this for every event it does not answer itself.
 *
 * Only the breath has one so far: held untouched, every seam flares once.
 * The rest are told by the drawing alone (`keel-story.ts`), and are silent
 * sparks on purpose (`effects-spark-silent-boss-d.ts`).
 */

/** Answers `e` if it is one of the story's, on a spine of `n` segments; `flare` lights seam `k` in full. */
export function keelStoryReceipt(e: SimEvent, n: number, flare: (k: number) => void): void {
  switch (e.type) {
    case "keelHeld":
      for (let k = 0; k < n; k++) flare(k);
      break;
    default:
      break;
  }
}
