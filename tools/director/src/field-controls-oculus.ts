import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE OCULUS's two leaf holds, as rows of the ON THE FIELD tab.
 *
 * THE MANTLE's arrangement: **both screens draw the whole lens**, and whose
 * half is whose is geometry — the left the pilot's, the right the
 * navigator's — so a thumb on the other seat's half falls through
 * (`render/oculus-grip.ts`, `docs/spec/bosses.md` §11.44).
 */
const LEAF_DOES =
  "A **hold**: the leaf is down while the thumb is. A lit pair slides " +
  "shut across the face as **both** halves are held, and shuts once both " +
  "have been down for the step's beats; a reseal's cracked pair is held " +
  "shut the same way. **A thumb lifted while both were down slips the " +
  "pair** and the count starts again from nought. A thumb laid on before " +
  "a pair lights is counted from its first beat — the lens takes a hold " +
  "whenever it stands, until it shatters (sim/oculus-hand.ts). Where the " +
  "thumb wanders to after the press means nothing.";

export const OCULUS_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE OCULUS'S LEFT LEAF",
    where:
      "on the left half of the lens stood over the middle of the field, on both screens, from the drop into frame until it shatters",
    seat: "player 1 — the left half is the pilot's, by geometry, on both phones; a navigator's thumb on it falls through",
    gesture: "hold",
    does: LEAF_DOES,
    source: "handles.ts — oculusLeafUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "oculusLeafLeft",
    sends: ["drag"],
    pose: "OCULUS · THE LEFT LEAF UNDER A THUMB",
  },
  {
    name: "THE OCULUS'S RIGHT LEAF",
    where:
      "on the right half of the lens stood over the middle of the field, on both screens, from the drop into frame until it shatters",
    seat: "player 2 — the right half is the navigator's, by geometry, on both phones; a pilot's thumb on it falls through",
    gesture: "hold",
    does: LEAF_DOES,
    source: "handles.ts — oculusLeafUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "oculusLeafRight",
    sends: ["drag"],
    pose: "OCULUS · THE RIGHT LEAF UNDER A THUMB",
  },
];
