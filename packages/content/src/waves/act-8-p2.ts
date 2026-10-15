import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-8.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_8_P2: Wave[] = [
  {
    id: "theLimpet",
    name: "THE LIMPET",
    guide: {
      scene: "theLimpet",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null },
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 8, kind: "meteor", color: null },
      { beat: 30, col: 3, kind: "meteor", color: null },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 50, col: 8, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "limpet", at: 6, beats: 12 },
      { kind: "limpet", at: 29, beats: 14 },
    ],
  },
];
