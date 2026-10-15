import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_4_P2: Wave[] = [
  {
    id: "theWardRecall",
    name: "HEAVY ROCK RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 8, kind: "meteorMedium", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 7, kind: "torch", color: null },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 5, kind: "meteorMedium", color: null },
      { beat: 32, col: 10, color: "red" },
      { beat: 37, col: 6, kind: "torch", color: null },
    ],
  },
  {
    id: "theWardBend",
    name: "HEAVY ROCKS, TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "meteorMedium", color: null },
      { beat: 5, col: 8, kind: "meteorMedium", color: null },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 15, col: 3, color: "red" },
      { beat: 21, col: 5, kind: "veil", color: null },
      { beat: 27, col: 7, color: "red" },
      { beat: 33, col: 6, kind: "meteorMedium", color: null },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 8, kind: "veil", color: null },
    ],
  },
  {
    id: "theWardPeak",
    name: "HEAVY ROCK PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 2, kind: "meteorMedium", color: null },
      { beat: 4, col: 8, kind: "meteorMedium", color: null },
      { beat: 8, col: 8, color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 16, col: 10, kind: "veil", color: null },
      { beat: 20, col: 6, color: "cyan" },
      { beat: 24, col: 8, kind: "throb", color: "red" },
      { beat: 28, col: 4, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 32, col: 8, kind: "meteorMedium", color: null },
      { beat: 36, col: 10, kind: "veil", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 7, kind: "throb", color: "red" },
      { beat: 48, col: 9, kind: "meteorMedium", color: null },
    ],
  },
];
