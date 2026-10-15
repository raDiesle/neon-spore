import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-11.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_11_P2: Wave[] = [
  {
    id: "theBalloonPeak",
    name: "BALLOON PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 8, kind: "balloon", color: null },
      { beat: 8, col: 0, color: "cyan" },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 12, col: 3, kind: "choir", color: "red" },
      { beat: 20, col: 3, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 24, col: 10, kind: "balloon", color: null },
      { beat: 28, col: 1, kind: "choir", color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 32, col: 10, color: "red" },
      { beat: 40, col: 2, kind: "balloon", color: null },
      { beat: 44, col: 4, color: "red" },
      { beat: 44, col: 7, color: "red" },
      { beat: 48, col: 6, kind: "choir", color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 2, row: 3, kind: "purge" },
      { beat: 36, col: 0, row: 3, kind: "purge" },
    ],
  },
];
