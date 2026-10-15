import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-9-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_9_P3: Wave[] = [
  {
    id: "theBlisterBend",
    name: "BLISTERS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 4, kind: "blister", color: null, row: 3, by: 2, count: 3 },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 3, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 23, col: 8, kind: "blister", color: null, row: 3, by: 2, count: 3 },
      { beat: 29, col: 3, color: "cyan" },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 35, col: 0, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 41, col: 7, kind: "blister", color: null, row: 2, by: 2, count: 3 },
      { beat: 46, col: 0, color: "cyan" },
      { beat: 46, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theBlisterPeak",
    name: "BLISTER PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 9, kind: "blister", color: null, row: 3, by: 2, count: 3 },
      { beat: 8, col: 2, color: "red" },
      { beat: 8, col: 8, color: "red" },
      { beat: 12, col: 8, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 15, col: 9, kind: "gyre", color: null },
      { beat: 18, col: 3, color: "red" },
      { beat: 18, col: 7, color: "red" },
      { beat: 21, col: 10, kind: "blister", color: null, row: 3, by: 2, count: 3 },
      { beat: 25, col: 9, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 28, col: 4, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 6, kind: "gyre", color: null },
      { beat: 35, col: 7, kind: "blister", color: null, row: 2, by: 2, count: 3 },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 6, color: "red" },
      { beat: 43, col: 10, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 46, col: 7, kind: "gyre", color: null },
    ],
  },
];
