import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P5: Wave[] = [
  {
    id: "theBlister",
    name: "THE BLISTER",
    guide: {
      scene: "theBlister",
    },
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 12, col: 2, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "theMoult",
    name: "THE MOULT",
    guide: {
      scene: "theMoult",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 4, col: 5, kind: "moult", color: null, cargo: "ward" },
      { beat: 9, col: 8, kind: "moult", color: null, cargo: "ward" },
      { beat: 18, col: 3, kind: "moult", color: null, cargo: "purge" },
      { beat: 19, col: 7, kind: "moult", color: null, cargo: "purge" },
    ],
  },
  {
    id: "theReprise",
    name: "THE REPRISE",
    guide: {
      scene: "theReprise",
    },
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 5, color: "cyan" },
      { beat: 6, col: 10, color: "red" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 21, col: 10, color: "cyan" },
    ],
    boss: { kind: "reprise", beat: 12 },
    bossType: "normal",
  },
];
