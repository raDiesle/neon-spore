import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P4: Wave[] = [
  {
    id: "theMine",
    name: "THE MINE",
    guide: {
      scene: "theMine",
    },
    entries: [
      { beat: 0, col: 5, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 12, col: 2, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 24, col: 8, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 26, col: 3, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
    ],
  },
];
