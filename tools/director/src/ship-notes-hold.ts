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
    "It falls straight down its lane like a slick, no shot touches it and the shield does not stop it, and " +
    "when it lands it goes to the plate wherever the plate is. Every beat the plate is found in the column " +
    "it was in a beat before is one beat of the fuse; at limpetStillBeats of them it goes off, a heavy hit " +
    "on the hull at the plate's column, and the wave is lost. A beat the plate is found in a new column " +
    "puts the fuse back to nought and is one move against it; at limpetShakeMoves it lets go. Only player 1, " +
    "who has no plate, is shown the fuse — a row of lights over the body, going out one a beat. See cling.ts.",
  "THE LEECH — a body on the cannon that goes off if the cannon stands still":
    "THE LIMPET's twin on the cannon: it lands on the swelling wherever the cannon is, the fuse runs " +
    "leechStillBeats beats while the cannon stands in one column and is put back by a beat it stands in " +
    "another, leechShakeMoves of those shake it off, and at the end of the fuse it is a heavy hit on the " +
    "hull at the cannon's column. Only player 2, who has no cannon, is shown the fuse. See cling.ts.",
} satisfies Partial<Record<GroupName, string>>;
