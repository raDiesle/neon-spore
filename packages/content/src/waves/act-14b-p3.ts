import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P3: Wave[] = [
  {
    id: "theHandover",
    name: "THE HANDOVER",
    guide: {
      scene: "theHandover",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 2, col: 8, kind: "meteor", color: null },
      { beat: 6, col: 2, color: "cyan" },
      { beat: 10, col: 7, color: "red" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 18, col: 10, color: "red" },
      { beat: 24, col: 0, color: "cyan" },
    ],
    faults: [{ kind: "handover", at: 9, beats: 8 }],
  },
  {
    id: "theLeak",
    name: "THE LEAK",
    guide: {
      scene: "theLeak",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 1, col: 3, color: "cyan" },
      { beat: 2, col: 3, color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 22, col: 2, color: "red" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 31, col: 0, color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 35, col: 10, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSplice",
    name: "THE SPLICE",
    guide: {
      scene: "theSplice",
    },
    entries: [],
    boss: { kind: "splice", rounds: [{ beats: 18 }, { beats: 27 }, { beats: 36 }] },
    bossType: "special",
    controls: "splice",
  },
];
