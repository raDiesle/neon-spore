import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE STARE's lid, in a file of its own — `field-controls-page.ts` is at its
 * limit, the way it was for the filament before it.
 *
 * Since 29 September 2026 the lid is how the pair survives the charge: after a
 * pass with no hit the eye swells with a beam, and a thumb pulling the lid
 * down vents it to the sides (`sim/stare-hand.ts`, `render/stare-lid.ts`,
 * `docs/spec/bosses.md` §11.16).
 */
export const STARE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE STARE'S LID",
    where:
      "a ring on the brow of the eye over the top of the field, with PULL " +
      "beside it, while the eye is charging — on both seats' screens and the " +
      "test screen; the lid itself, a fold of rock over the socket, is on both",
    seat: "either — whoever has a thumb free; the first thumb on it has it",
    gesture: "grab and drag",
    does:
      "Carried down, the lid follows the thumb's depth; at stareLidPullMilli " +
      "the charge vents out to the sides and the next pass begins. Let go " +
      "early and it springs back. Not pulled in stareChargeBeats, and the " +
      "beam comes down the middle onto the hull (sim/stare-hand.ts).",
    source: "handles.ts — stareLidUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "stareLid",
    sends: ["drag"],
    pose: "THE STARE · CHARGE",
  },
];
