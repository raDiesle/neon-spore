import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE STARE's lashes, in a file of their own — `field-controls-page.ts` is at
 * its limit, the way it was for the filament before it.
 *
 * Since 2 October 2026 the lashes are how the pair survives the charge (the
 * lid before that): after every live pass the eye swells with a beam, and
 * the lashes over it pulled up, every one, vent it to the sides
 * (`sim/stare-hand.ts`, `render/stare-lash-pull.ts`, `docs/spec/bosses.md`
 * §11.16).
 */
export const STARE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE STARE'S LASHES",
    where:
      "the fan of lashes standing over the eye at the top of the field, with " +
      "PULL beside it, while the eye is charging — on both seats' screens and " +
      "the test screen",
    seat: "both at once — the count is the pair's together",
    gesture: "grab and drag",
    does:
      "Every stareLashPullMilli the thumb rises above its lowest pulls one " +
      "lash up; down and up again pulls the next. stareLashesFirst on the " +
      "first level, twice as many on each after; all of them up and the " +
      "charge vents out to the sides. Not all up when the charge runs out " +
      "(stareChargeLength), and the beam comes down the middle onto the hull " +
      "(sim/stare-hand.ts).",
    source: "handles.ts — stareLashUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "stareLash",
    sends: ["drag"],
    pose: "THE STARE · CHARGE",
  },
];
