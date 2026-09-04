import type { Wave } from "../wave-types.js";

/**
 * The second half of act three, cut off `act-3.ts` when that file reached the
 * 250-line ceiling on `THE VEIL`.
 *
 * **`3b` and not `6`, because the order of the waves is the order of the
 * game.** An act file is a page rather than a chapter — the cut is where the
 * file filled up, not where the game changes subject — so this one is spread
 * between act three and act four in `waves.ts`, and a name that sorted after
 * act five would say the opposite of where it stands. `THE VANE` is a boss and
 * the three after it are the mechanics that follow it, in the order they
 * always read in.
 *
 * Adding one `scene:` line to a wave in act three had cost two rounds of
 * shaving a sentence out of a comment to stay under the limit, which is the
 * warning `packages/sim/test/limits.test.ts` exists to give. New waves still
 * land in the newest act rather than here — the director's save splits an
 * incoming list across the act files at each one's current length and gives
 * the last of them whatever is left (`tools/director/src/waves-acts.ts`).
 */
export const WAVES_ACT_3B: Wave[] = [
  {
    id: "theVane",
    name: "THE VANE",
    sentence: "The one where the column you were told is never the column it lands in.",
    guide: {
      both: "An arm sweeping the top of the field. Everything that comes in under it is folded about the column it is standing in — as far the other side of the arm as it came in. The rocks under it fall two rows a beat, not one.",
      p1: "Your strip still says where a rock was aimed. Fold it before you say it, or you have named a column nothing lands in.",
      p2: "Same for what you see coming. Count from the arm, not from the edge — and be in the column early, because there is no time to slide late.",
      scene: "theVane",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 3, col: 5, color: "red" },
      { beat: 6, col: 0, kind: "meteor", color: null },
      { beat: 9, col: 4, color: "cyan" },
      { beat: 12, col: 6, kind: "meteor", color: null },
      { beat: 15, col: 2, color: "red" },
      { beat: 18, col: 3, kind: "meteorMedium", color: null },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 24, col: 1, kind: "meteor", color: null },
      { beat: 27, col: 5, color: "red" },
      { beat: 30, col: 0, kind: "meteorMedium", color: null },
      { beat: 33, col: 3, color: "cyan" },
    ],
    boss: { kind: "vane" },
  },
  {
    id: "theLance",
    name: "THE LANCE",
    sentence: "The one where three of the same colour arrive in one column.",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 1, col: 2, color: "red" },
      { beat: 2, col: 2, color: "red" },
    ],
    controls: "lance",
  },
  {
    id: "thePurge",
    name: "THE PURGE",
    sentence: "The one where the field is cleared by swallowing, not by shooting.",
    guide: {
      both: "The same pod with different cargo: taking this one in clears the field of everything that is falling.",
      p1: "Hold it for the beat that is about to go wrong, not for the one that already has.",
      p2: "Freeing it is still a shot, and a shot spent here is a creature still coming.",
      scene: "thePurge",
    },
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 6, color: "red" },
      { beat: 2, col: 2, kind: "meteor", color: null },
      { beat: 3, col: 4, color: "cyan" },
    ],
    pods: [{ beat: 0, col: 3, row: 2, kind: "purge" }],
  },
  {
    id: "theWard",
    name: "THE WARD",
    sentence: "The one where the shield answers four rocks untriggered and the fifth on its own.",
    guide: {
      both: "This pod holds the shield armed for six beats with no trigger at all — and the rocks that come with it are quicker than any you have met: three rows a beat, then four, then five.",
      p1: "Your trigger is free while it lasts, so spend the hand on something else. Call each rock from your strip the moment it appears — by the time it is on the field it is nearly here.",
      p2: "Armed is not aimed: the column is still yours to be standing in. Park the shield where the rock is going, not where it is — one slide, no correction.",
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 2, col: 2, kind: "meteorMedium", color: null },
      { beat: 4, col: 5, kind: "meteorFast", color: null },
      { beat: 6, col: 1, kind: "meteorFaster", color: null },
      { beat: 7, col: 6, kind: "meteorFastest", color: null },
    ],
    pods: [{ beat: 0, col: 3, row: 2, kind: "ward" }],
  },
];
