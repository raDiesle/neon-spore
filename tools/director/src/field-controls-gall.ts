import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GALL's taps and pull, as a row of the ON THE FIELD tab.
 *
 * One finger on a body that moves — the owner's rework of 8 October 2026:
 * **both screens draw the whole seam and the alien where it sits**, the two
 * left points are the pilot's and the two right the navigator's, by
 * geometry, and the point a press went down on goes with it as its `id`
 * (`render/gall-grip.ts`, `docs/spec/bosses.md` §11.55).
 */
const PRESS_DOES =
  "A **tap**, then a **pull**: one finger — or the mouse button — down on " +
  "the alien, on a point of that seat's half, and up again. It is sent as " +
  "it lands, with the point as its id, and the lift sends how far the " +
  "finger went. A lift where it went down is a tap and winds the alien one " +
  "tighter; once the leap's taps are all in, a lift dragged up toward the " +
  "top of the field throws it, and it lands on a point of the other half " +
  "off the seeded Rng, where the clock starts again. **A hand counts only on " +
  "the point the alien is on, on that seat's half**: a pull before the taps " +
  "are in, or a drag any other way, is refused (sim/gall-hand.ts). A tap " +
  "lights its rim, a leap greens it, a refused hand or a clock run out " +
  "reddens it (render/gall-verdicts.ts).";

export const GALL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GALL'S TAPS AND PULL",
    where:
      "on the alien where it sits on the seam, on this seat's half, on both screens, until the last fire step lights it",
    seat: "either — the pilot on the two left points, the navigator on the two right, by geometry; a finger on the other seat's half falls through",
    gesture: "grab and drag",
    does: PRESS_DOES,
    source: "handles.ts — gallPressUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gallPress",
    sends: ["drag"],
    pose: "GALL · TAPS ON THE LEFT END",
  },
];
