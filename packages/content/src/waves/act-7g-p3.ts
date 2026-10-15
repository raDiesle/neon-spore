import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7g-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7G_P3: Wave[] = [
  {
    id: "theFence",
    name: "THE FENCE",
    guide: {
      scene: "theFence",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null },
      { beat: 12, col: 5, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theGap",
    name: "THE GAP",
    guide: {
      scene: "theGap",
    },
    entries: [
      { beat: 0, col: 8, kind: "fence", color: null },
      { beat: 12, col: 2, kind: "fence", color: null },
      { beat: 26, col: 10, kind: "fence", color: null },
      { beat: 40, col: 0, kind: "fence", color: null },
      { beat: 56, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theCut",
    name: "THE CUT",
    guide: {
      scene: "theCut",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [5] },
      { beat: 16, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [8] },
      { beat: 32, col: 5, kind: "fence", color: null, gaps: [], cracksRed: [2] },
      { beat: 48, col: 5, kind: "fence", color: null, gaps: [], cracksCyan: [7] },
    ],
  },
];
