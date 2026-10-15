import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7a.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7A_P2: Wave[] = [
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
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 8, color: "cyan" },
      { beat: 8, col: 3, color: "red" },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 20, col: 10, color: "red" },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 42, col: 10, color: "red" },
      { beat: 44, col: 0, color: "cyan" },
      { beat: 48, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
];
