import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p8.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P9: Wave[] = [
  {
    id: "leverBlistersRecall",
    name: "LEVER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 9, kind: "blister", color: null, row: 3, gesture: "lever" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 22, col: 1, kind: "magnet", color: "red" },
      { beat: 29, col: 4, color: "cyan" },
      { beat: 37, col: 2, kind: "blister", color: null, row: 2, gesture: "lever" },
    ],
    controls: "standard4",
  },
];
