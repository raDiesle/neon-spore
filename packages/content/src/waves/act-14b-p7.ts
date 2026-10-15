import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p6.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P7: Wave[] = [
  {
    id: "theDark",
    name: "THE DARK",
    guide: {
      scene: "theDark",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 8, col: 8, color: "red" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "red" },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 32, col: 2, color: "red" },
      { beat: 36, col: 8, color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 4 }],
  },
];
