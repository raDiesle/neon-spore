import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-5.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_5_P2: Wave[] = [
  {
    id: "theGhostPeak",
    name: "GHOST PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 9, kind: "ghost", color: "red" },
      { beat: 8, col: 10, color: "red" },
      { beat: 12, col: 5, kind: "wisp", color: null },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 6, color: "red" },
      { beat: 24, col: 6, kind: "ghost", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 5, kind: "wisp", color: null },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 44, col: 10, kind: "ghost", color: "red" },
      { beat: 48, col: 9, kind: "wisp", color: null },
    ],
    pods: [
      { beat: 20, col: 3, row: 3, kind: "purge" },
      { beat: 36, col: 1, row: 3, kind: "purge" },
    ],
  },
];
