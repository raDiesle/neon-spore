import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each card for a **body that has a control of the
 * ship's** — THE GUM, which a hand has to take before it reaches the ship,
 * and the two clingers, THE LIMPET on the plate and THE LEECH on the cannon.
 *
 * Split out of `ship-notes.ts` when the clingers' two took that file past
 * its 250-line limit, along the seam `ship-notes-round.ts` cut before it and
 * for the same reason. These three are one family: a body no shot touches,
 * that the shield does not stop, and that a hand on the ship's controls or
 * on the field itself has to answer — the seam is the family.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in
 * any of the three files is the same compile error it always was.
 */
export const HOLD_NOTES = {
  "THE GUM — a drop either hand swipes out of the field":
    "It falls straight down its lane like a slick, no shot touches it and the shield does not stop it. Either " +
    "player can put a thumb on it while it falls: resting there does nothing, and carrying the finger " +
    "gumSwipeMilli to the left or to the right flings it out of the field level along its row, gumFlingCols a " +
    "beat, gone at the wall. A gum that reaches the ship hits it at once, with no scar, and splashes across the " +
    "whole hull. See gum.ts.",
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
