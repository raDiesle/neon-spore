import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-5.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_5_P2: Wave[] = [
  {
    id: "theWispPeak",
    name: "WISP PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 0, kind: "wisp", color: null },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 7, kind: "meteorMedium", color: null },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 20, col: 8, kind: "countdown", color: "red" },
      { beat: 24, col: 0, kind: "wisp", color: null },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 32, col: 6, kind: "meteorMedium", color: null },
      { beat: 36, col: 7, kind: "countdown", color: "red" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 44, col: 9, kind: "wisp", color: null },
      { beat: 48, col: 6, kind: "meteorMedium", color: null },
    ],
  },
];
