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
 *
 * **THE VANE carries no guide**, THE INSTAR's way: the owner, 30 September
 * 2026, *remove the tutorial, not required*. The mouth of the split says
 * `FIRE` in the colour it takes, and the cannon says `MOVE`, so the field
 * already says what the film did. The comment is up here because the
 * director writes this file back and keeps nothing between a wave's braces.
 */
export const WAVES_ACT_3B: Wave[] = [
  {
    id: "theDart",
    name: "THE DART",
    guide: {
      scene: "theDart",
    },
    entries: [
      { beat: 0, col: 5, kind: "dart", color: "red" },
      { beat: 8, col: 10, kind: "dart", color: "cyan" },
      { beat: 16, col: 2, kind: "dart", color: "red" },
      { beat: 17, col: 8, kind: "dart", color: "cyan" },
      { beat: 26, col: 3, kind: "dart", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theDartAgain",
    name: "DARTS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "dart", color: "cyan" },
      { beat: 8, col: 7, kind: "dart", color: "red" },
      { beat: 14, col: 5, kind: "dart", color: "red" },
      { beat: 20, col: 6, kind: "dart", color: "cyan" },
      { beat: 27, col: 4, kind: "dart", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theDartSpread",
    name: "DARTS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "dart", color: "cyan" },
      { beat: 5, col: 4, kind: "dart", color: "cyan" },
      { beat: 10, col: 3, kind: "dart", color: "cyan" },
      { beat: 15, col: 4, kind: "dart", color: "red" },
      { beat: 21, col: 8, kind: "dart", color: "cyan" },
      { beat: 28, col: 2, kind: "dart", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theDartReach",
    name: "DARTS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "dart", color: "cyan" },
      { beat: 5, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 1, kind: "dart", color: "cyan" },
      { beat: 15, col: 5, kind: "meteor", color: null },
      { beat: 21, col: 9, kind: "dart", color: "cyan" },
      { beat: 27, col: 4, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theDartPair",
    name: "DART AND CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 4, kind: "dart", color: "cyan" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 8, kind: "clasp", color: "cyan" },
      { beat: 21, col: 4, color: "red" },
      { beat: 26, col: 2, kind: "throb", color: "red" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 36, col: 4, kind: "dart", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theDartBreathe",
    name: "EASY DARTS",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 7, col: 2, kind: "dart", color: "red" },
      { beat: 15, col: 4, color: "cyan" },
      { beat: 23, col: 9, kind: "dart", color: "red" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 38, col: 3, kind: "dart", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theDartRecall",
    name: "DART RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 7, kind: "dart", color: "cyan" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 15, col: 1, kind: "meteor", color: null },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 27, col: 10, kind: "dart", color: "cyan" },
      { beat: 33, col: 4, color: "cyan" },
      { beat: 39, col: 7, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theDartBend",
    name: "DARTS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 5, kind: "dart", color: "cyan" },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 2, kind: "clasp", color: "red" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 3, kind: "dart", color: "cyan" },
      { beat: 33, col: 4, kind: "clasp", color: "cyan" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 45, col: 10, kind: "dart", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theDartPeak",
    name: "DART PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 4, kind: "dart", color: "cyan" },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 12, col: 2, kind: "clasp", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 24, col: 1, kind: "dart", color: "cyan" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 4, kind: "clasp", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 44, col: 9, kind: "dart", color: "cyan" },
      { beat: 48, col: 10, kind: "clasp", color: "cyan" },
    ],
    pods: [
      { beat: 20, col: 9, row: 3, kind: "ward" },
      { beat: 36, col: 7, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "theVeil",
    name: "THE VEIL",
    guide: {
      scene: "theVeil",
    },
    entries: [
      { beat: 0, col: 5, kind: "veil", color: null },
      { beat: 10, col: 2, kind: "veil", color: null },
      { beat: 11, col: 8, kind: "veil", color: null },
      { beat: 18, col: 3, kind: "veil", color: null },
      { beat: 24, col: 0, kind: "veil", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theVeilAgain",
    name: "VEILS AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "veil", color: null },
      { beat: 7, col: 3, kind: "veil", color: null },
      { beat: 14, col: 7, kind: "veil", color: null },
      { beat: 22, col: 4, kind: "veil", color: null },
      { beat: 28, col: 3, kind: "veil", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theVeilSpread",
    name: "VEILS SPREAD",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "veil", color: null },
      { beat: 7, col: 1, kind: "veil", color: null },
      { beat: 12, col: 3, kind: "veil", color: null },
      { beat: 19, col: 8, kind: "veil", color: null },
      { beat: 25, col: 2, kind: "veil", color: null },
      { beat: 30, col: 7, kind: "veil", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theVeilReach",
    name: "VEILS FAR APART",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "veil", color: null },
      { beat: 5, col: 6, kind: "meteor", color: null },
      { beat: 11, col: 1, kind: "veil", color: null },
      { beat: 16, col: 5, kind: "meteor", color: null },
      { beat: 22, col: 9, kind: "veil", color: null },
      { beat: 27, col: 3, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
];
