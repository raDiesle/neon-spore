import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_4_P2: Wave[] = [
  {
    id: "theLanceBend",
    name: "LANCE TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 5, kind: "veil", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 6, kind: "dart", color: "red" },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 28, col: 6, kind: "veil", color: null },
      { beat: 33, col: 7, kind: "dart", color: "cyan" },
      { beat: 38, col: 5, color: "red" },
      { beat: 38, col: 8, color: "red" },
      { beat: 44, col: 8, kind: "veil", color: null },
    ],
  },
  {
    id: "theLancePeak",
    name: "LANCE PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 0, kind: "veil", color: null },
      { beat: 8, col: 1, color: "red" },
      { beat: 12, col: 3, kind: "dart", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 20, col: 2, kind: "shell", color: "cyan" },
      { beat: 24, col: 5, kind: "veil", color: null },
      { beat: 28, col: 2, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 32, col: 3, kind: "dart", color: "cyan" },
      { beat: 36, col: 5, kind: "shell", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 44, col: 6, kind: "veil", color: null },
      { beat: 48, col: 10, kind: "dart", color: "red" },
    ],
  },
];
