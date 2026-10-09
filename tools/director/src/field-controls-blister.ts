import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BLISTER's SWIPE, in a file of its own on `field-controls-gum.ts`'s
 * pattern — `field-controls-page.ts` grows only by the line that spreads it.
 * A creature's row, so it sits after THE GUM rather than among the bosses':
 * its TAP and HOLD are the tap and the grip every body already answers, and
 * the stroke is the one gesture of its own that needs a target.
 */
export const BLISTER_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BLISTER'S SWIPE",
    where: "across a SWIPE blister while it is up, on the seat its BY names",
    seat: "the seat the blister's BY names — either, on a BOTH blister",
    gesture: "grab and drag",
    does:
      "A blister comes up out of a pore in the hull for two beats and goes " +
      "back under. A SWIPE one wears a bar across it with chevrons pointing " +
      "its way — left, right, up or down. Press on it and carry the finger " +
      "blisterSwipeMilli that way, more along than across, and lift: one " +
      "blow. A short stroke, a sideways one and one the wrong way count " +
      "nothing and cost nothing. A stroke still open when it sinks counts " +
      "nothing either (sim/blister-swipe.ts).",
    source: "blister-tap.ts — blisterTapAt() under touchDown(), judged on touchUp()",
    holdKind: "drag",
    dragTarget: "blisterSwipe",
    sends: ["drag"],
    pose: "BLISTER · A STROKE HALF CARRIED",
  },
];
