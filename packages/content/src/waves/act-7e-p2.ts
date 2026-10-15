import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7e.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7E_P2: Wave[] = [
  {
    id: "theThroat",
    name: "THE THROAT",
    guide: {
      scene: "theThroat",
    },
    entries: [
      { beat: 4, col: 5, color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 28, col: 2, kind: "meteor", color: null },
      { beat: 36, col: 8, color: "cyan" },
      { beat: 44, col: 5, kind: "meteor", color: null },
      { beat: 50, col: 2, color: "red" },
      { beat: 54, col: 8, color: "cyan" },
      { beat: 62, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, color: "cyan" },
      { beat: 78, col: 2, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 32, col: 0, row: 4, kind: "purge", cross: 1 },
      { beat: 58, col: 10, row: 3, kind: "purge", cross: -1 },
      { beat: 70, col: 0, row: 5, kind: "purge", cross: 1 },
      { beat: 84, col: 10, row: 4, kind: "purge", cross: -1 },
    ],
    boss: { kind: "throat" },
    bossType: "normal",
    controls: "throat",
  },
];
