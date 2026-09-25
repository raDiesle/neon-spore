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
    guide: {
      both: "The arm folds every rock to its other side. Aim the shield and the shot where things land. The bearing asks for a new hand as its pins go.",
      p1: "1. Read the column off your strip.\n2. Fold it across the arm's column before you say it.\n3. Say it and slide there early.\n4. Third pin on: the ends stop opening. Hold the arm and say where it stopped.",
      p2: "1. Count the column from the arm, not from the edge.\n2. Say the folded column and the colour early.\n3. Move the shield there before it lands.\n4. Last pin: drag the housing off the held arm first, then fire.",
      scene: "theVane",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 3, col: 5, color: "red" },
      { beat: 6, col: 0, kind: "meteor", color: null },
      { beat: 9, col: 4, color: "cyan" },
    ],
    boss: { kind: "vane" },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theLance",
    name: "THE LANCE",
    guide: {
      both: "Hold a colour instead of tapping it, and the cannon lobe fills. When it is full, the beam burns every body of that colour in the column. Nothing travels.",
      p1: "1. Get under the column, then do not move.\n2. The lobe fills only while the cannon stands still.\n3. Sliding a column empties it.",
      p2: "1. Hold the colour they are all in. Do not tap it.\n2. Keep holding until the column lights.\n3. Let go early and it is an ordinary shot. It takes one.",
      scene: "theLance",
    },
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 1, col: 2, color: "cyan" },
      { beat: 2, col: 2, color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 11, col: 5, color: "red" },
      { beat: 12, col: 5, color: "red" },
    ],
  },
  {
    id: "thePurge",
    name: "THE PURGE",
    guide: {
      both: "A pod again, and this time the field is full when it comes loose. Taking it in clears everything falling.",
      p1: "Hold it for the beat that is about to go wrong, not for the one that already has.",
      p2: "Freeing it is still a shot, and a shot spent here is a creature still coming.",
      scene: "thePurge",
    },
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 1, col: 6, color: "red" },
      { beat: 3, col: 4, color: "cyan" },
    ],
    pods: [{ beat: 0, col: 3, row: 2, kind: "purge" }],
  },
  {
    id: "theWard",
    name: "THE WARD",
    guide: {
      both: "This pod arms the shield for six beats with no trigger. Its rocks are the fastest yet: three rows a beat, then four, then five.",
      p1: "1. Your trigger is free while it lasts. Spend the hand on something else.\n2. Call each rock from your strip the moment it appears.\n3. Once it is on the field, it is nearly here.",
      p2: "1. Armed is not aimed. The column is still yours to stand in.\n2. Park the shield where the rock is going, not where it is.\n3. One slide, no correction.",
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
