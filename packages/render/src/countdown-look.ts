import { irisCount, irisOver } from "./countdown-iris.js";
import type { Body } from "./creature-body-in.js";

/**
 * THE COUNT's look, as a record VERSUS can patch (`docs/versus.md`).
 *
 * Two hooks, because the creature is two pictures. `over` is drawn on **both**
 * screens, on top of the living disc, and may read nothing that changes with
 * the count — the navigator's screen must not blink when the body opens
 * (`countdown.ts`). `count` is drawn on the pilot's screen and the rig only,
 * behind `showsCount`, and is the count itself: the blades as shipped, or
 * whatever a candidate says the count should look like.
 *
 * The record is filled with IRIS (`countdown-iris.ts`), the owner's pick of
 * 12 September 2026: a socket with a core on both screens, and on the
 * pilot's the blades closed over it, one per beat left. The notches it
 * replaced are `drawCountMarks` in `countdown.ts`, and the two candidates
 * beside it, DIAL and FUSE, are kept for the SHAPES page's LIBRARY. The disc
 * under every look is `drawLivingBody` from `creature-body.ts`, which no
 * look replaces: the silhouette is the word the pair say across the voice
 * delay (`silhouettes-countdown.ts`).
 */
export interface CountdownLook {
  /** Over the disc, on both screens. Static with respect to the count. */
  over(b: Body): void;
  /** The count, on the pilot's screen and the rig. */
  count(b: Body): void;
}

/** The shipped pair: IRIS's socket and core over the disc, and its blades. */
export const COUNTDOWN_LOOK: CountdownLook = {
  over: irisOver,
  count: irisCount,
};
