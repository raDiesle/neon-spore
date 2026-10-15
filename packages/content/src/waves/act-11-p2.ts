import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-11.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_11_P2: Wave[] = [
  {
    id: "theHuskBreathe",
    name: "EASY HUSKS",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 20, col: 10, kind: "moult", color: null, cargo: "ward" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 33, col: 7, kind: "fence", color: null },
      { beat: 40, col: 8, color: "cyan" },
    ],
    pods: [{ beat: 7, col: 4, row: 4, kind: "purge", husk: true }],
  },
  {
    id: "theHuskRecall",
    name: "HUSK RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 10, col: 2, color: "red" },
      { beat: 15, col: 1, kind: "lure", color: "cyan" },
      { beat: 20, col: 0, color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 32, col: 5, kind: "lure", color: "cyan" },
      { beat: 38, col: 0, color: "red" },
      { beat: 38, col: 10, color: "red" },
    ],
    pods: [
      { beat: 5, col: 8, row: 4, kind: "purge", husk: true },
      { beat: 26, col: 0, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskBend",
    name: "HUSKS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 4, kind: "moult", color: null, cargo: "ward" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 33, col: 1, kind: "moult", color: null, cargo: "purge" },
      { beat: 45, col: 5, color: "red" },
      { beat: 45, col: 8, color: "red" },
    ],
    pods: [
      { beat: 6, col: 0, row: 4, kind: "purge", husk: true },
      { beat: 22, col: 5, row: 4, kind: "purge", husk: true },
      { beat: 39, col: 9, row: 4, kind: "purge", husk: true },
    ],
  },
];
