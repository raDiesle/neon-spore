import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each card for a **body that has a control of the
 * ship's** — the two clingers, THE LIMPET on the plate and THE LEECH on the
 * cannon.
 *
 * Split out of `ship-notes.ts` when the clingers' two took that file past
 * its 250-line limit, along the seam `ship-notes-round.ts` cut before it and
 * for the same reason. These are one family: a body no shot touches,
 * that the shield does not stop, and that a hand on the ship's controls or
 * on the field itself has to answer — the seam is the family.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in
 * any of the three files is the same compile error it always was.
 */
export const HOLD_NOTES = {
  "THE LIMPET — a body on the plate that goes off if the plate stands still":
    "A fault and never a wave's body: place the LIMPET pencil on a beat row and the thing at the top of " +
    "the field fires it at the plate, very fast, wherever the plate is. No fall, no lane, nothing to evade, " +
    "and no shot touches it. From that beat the plate has to keep moving and is judged between beats rather " +
    "than on them: a plate that has not been found in a new column for harpoonStillBeats loses the round, a " +
    "heavy hit on the hull at its column. The pencil's own length is how long it stays; when that runs out " +
    "the line is reeled home. A timer over the body counts it down and MOVE SHIELD! is under player 1's " +
    "dial — the seat that cannot move it. THE LEECH is the same on the cannon, off the same number, with " +
    "MOVE CANNON! under player 2's. See harpoon.ts.",
} satisfies Partial<Record<GroupName, string>>;
