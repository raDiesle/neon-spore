import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7g-p4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7G_P5: Wave[] = [
  {
    id: "theJam",
    name: "THE JAM",
    guide: {
      scene: "theJam",
    },
    entries: [
      { beat: 0, col: 5, kind: "lure", color: "red" },
      { beat: 6, col: 8, color: "cyan" },
      { beat: 18, col: 2, kind: "lure", color: "cyan" },
      { beat: 20, col: 5, color: "red" },
      { beat: 22, col: 8, kind: "lure", color: "red" },
      { beat: 36, col: 3, color: "red" },
      { beat: 48, col: 0, kind: "lure", color: "cyan" },
      { beat: 50, col: 10, color: "red" },
    ],
    faults: [{ kind: "cannon", color: "alternating", at: 7 }],
  },
  {
    id: "theCoil",
    name: "THE COIL",
    guide: {
      scene: "theCoil",
    },
    entries: [
      { beat: 7, col: 8, kind: "coil", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 14, col: 3, kind: "meteor", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 46, col: 10, kind: "coil", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
];
