import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each card for a **body one seat is not drawn at all**:
 * THE WISP, which is absent from the pilot's field; THE GHOST, which is a band
 * across a row with no column in it; and THE MINE, which is absent from
 * whichever seat the wave decided.
 *
 * Split out of `ship-notes.ts` when THE MINE's took that file past its
 * 250-line limit, along the seam `ship-notes-hold.ts` cut before it and for
 * the same reason. These three are one family and the seam is the family: each
 * hides **where**, and each therefore turns on the lettered grid or a band and
 * makes a place the thing that has to be said out loud. THE LURE and THE VEIL
 * stay next door, because what those two hide is *what* — both seats can see
 * exactly where the body is.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in any
 * of the four files is the same compile error it always was.
 */
export const HIDDEN_NOTES = {
  "THE MINE — a tile one of you says and the other has to find":
    "A wisp that never hops, answered by a thumb instead of a bolt. One " +
    "seat is drawn the body and the other, looking at an empty field, has " +
    "to put a finger on that exact square — the four tiles beside it break " +
    "the hull, and a finger anywhere else costs a beat off this fuse. Which " +
    "seat sees it is the wave's, not the creature's. Six beats is one wrong " +
    "finger and no more.",
  "THE WISP — a body only one of you can see at all":
    "The veil's split again, and the whole body this time. Player 2 sees it " +
    "and player 1 does not — not dimmed, not ringed, simply absent — and it " +
    "stands on a tile for this many beats before it is somewhere else. It " +
    "never falls, so it never reaches the ship and never leaves: the wave " +
    "stays open until it is shot, and either colour does it. While one is on " +
    "the field both screens carry the lettered grid, which is the only way to " +
    "say where it is. See wisp.ts.",
  "THE GHOST — a body with no column on one screen":
    "Player 2 sees the body; player 1 is drawn a band across the row it is in " +
    "and nothing about the column — and player 1 holds the cannon, so the " +
    "column has to be said out loud as a number. A wave may also send one " +
    "*across*: it prowls one row sideways, turns at each wall, gets visibly " +
    "angrier each time, and after the last turn comes straight down at the " +
    "hull head first. See ghost.ts.",
} satisfies Partial<Record<GroupName, string>>;
