import { drawCountMarks } from "./countdown.js";
import type { Body } from "./creature-body-in.js";

/**
 * THE COUNT's look, as a record VERSUS can patch (`docs/versus.md`).
 *
 * Two hooks, because the creature is two pictures. `over` is drawn on **both**
 * screens, on top of the living disc, and may read nothing that changes with
 * the count — the navigator's screen must not blink when the body opens
 * (`countdown.ts`). `count` is drawn on the pilot's screen and the rig only,
 * behind `showsCount`, and is the count itself: the marks as shipped, or
 * whatever a candidate says the count should look like.
 *
 * The record is filled with the shipped pair, and the disc under both is
 * `drawLivingBody` from `creature-body.ts`, which no look replaces: the
 * silhouette is the word the pair say across the voice delay
 * (`silhouettes-countdown.ts`).
 */
export interface CountdownLook {
  /** Over the disc, on both screens. Static with respect to the count. */
  over(b: Body): void;
  /** The count, on the pilot's screen and the rig. */
  count(b: Body): void;
}

/** The shipped pair: nothing over the disc, and the notches cut into its rim. */
export const COUNTDOWN_LOOK: CountdownLook = {
  over: () => {},
  count: drawCountMarks,
};
