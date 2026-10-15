import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p5.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P6: Wave[] = [
  {
    id: "theFlip",
    name: "THE FLIP",
    guide: {
      scene: "theFlip",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 18, col: 10, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 36, col: 0, color: "red" },
      { beat: 40, col: 5, color: "cyan" },
    ],
    faults: [{ kind: "flip", seat: 1, at: 6 }],
  },
];
