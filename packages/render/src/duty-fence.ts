import { fenceGapCols, type World } from "@neon-spore/sim";

/**
 * THE FENCE's own duty word, which is the only one in the table that the world
 * picks rather than the table.
 *
 * Its own file for `duty-harpoon.ts`'s reason, and along the same seam: the
 * word a row carries is `duty.ts`'s, and *which* wording a row takes on this
 * particular field is a fact about that creature and belongs beside the rule
 * that decides it. `duty.ts` stayed under its line ceiling by giving the second
 * such row a file the moment there were two.
 */

/**
 * Which of THE FENCE's two answers the wall on the field takes.
 *
 * A wall with no way through at all is the one the cannon is for: its cracks
 * are the only openings it has, and a bolt in the right colour is the only
 * thing that makes one (`fence-crack.ts`) — so the pair is told to make a hole
 * rather than to hunt for one. Everything else has an opening somewhere
 * and has to be talked through. A wall the pair has already cut counts as
 * having one: they watched the bolt open it, and the job from that beat on is
 * to get the dome there.
 *
 * `fenceGapCols` with `secret` true, which is the *world's* answer rather than
 * either screen's — the word is the same on both phones, the way every other
 * row in this table is.
 */
export function fenceWord(world: World): string {
  for (const c of world.creatures) {
    if (c.kind === "fence" && fenceGapCols(world.cfg, c, true).length === 0)
      return "SHOOT THE CRACK";
  }
  return "FIND GAP FOR SHIELD";
}
