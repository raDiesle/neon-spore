import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7c-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7C_P3: Wave[] = [
  {
    id: "theGyrePeak",
    name: "GYRE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 9, kind: "gyre", color: null },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 6, kind: "rind", color: "red" },
      { beat: 16, col: 0, color: "red" },
      { beat: 16, col: 10, color: "red" },
      { beat: 20, col: 7, kind: "meteorMedium", color: null },
      { beat: 24, col: 4, kind: "gyre", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 4, kind: "rind", color: "cyan" },
      { beat: 36, col: 7, kind: "meteorMedium", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
      { beat: 44, col: 9, kind: "gyre", color: null },
      { beat: 48, col: 2, kind: "rind", color: "cyan" },
    ],
  },
];
