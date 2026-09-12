import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each card for a **body that has a control of the
 * ship's** — THE GUM on the plating, THE CHOKE on the cannon, and the two
 * clingers, THE LIMPET on the plate and THE LEECH on the cannon.
 *
 * Split out of `ship-notes.ts` when the clingers' two took that file past
 * its 250-line limit, along the seam `ship-notes-round.ts` cut before it and
 * for the same reason. These four are one family: a body no shot touches,
 * that the shield does not stop, that goes to a control on landing and stays
 * until the *other* seat's gesture gets it off — the seam is the family.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in
 * any of the three files is the same compile error it always was.
 */
export const HOLD_NOTES = {
  "THE GUM — a mass stuck to the ship, swiped off by the seat without the cannon":
    "It falls straight down its lane like a slick, no shot touches it and the shield does not stop it, and it " +
    "sticks to the ship where it lands. While it is stuck the cannon fires nothing from under it. It moves only " +
    "while the cannon is parked in one of its columns: then player 2 swipes it gumSwipeMilli toward the nearer " +
    "side wall and it comes off for scoreGumFlung. A swipe toward the far wall spreads it gumSpreadCols wider " +
    "instead, once per hold. See gum.ts.",
  "THE CHOKE — a body on the cannon, tapped off by the seat whose cannon it was":
    "It falls straight down its lane like a slick, no shot touches it and the shield does not stop it, and " +
    "when it lands it goes to the cannon wherever the cannon is. From then on the cannon strip answers nobody " +
    "and the cannon walks a column every chokeSweepBeats beats toward a wall, turns there, and walks back; " +
    "player 2 keeps firing from wherever it is. Player 1 gets it off by tapping the dead strip chokeTaps " +
    "times, a lift between each — a thumb held down is one tap. Then it is gone for scoreChokeFreed. See choke.ts.",
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
