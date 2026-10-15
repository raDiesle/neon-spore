import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-4-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_4_P3: Wave[] = [
  {
    id: "theWard",
    name: "THE WARD",
    guide: {
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 2, col: 3, kind: "meteorMedium", color: null },
      { beat: 4, col: 8, kind: "meteorFast", color: null },
      { beat: 6, col: 2, kind: "meteorFaster", color: null },
      { beat: 8, col: 10, kind: "meteorFastest", color: null },
    ],
    pods: [{ beat: 0, col: 5, row: 2, kind: "ward" }],
  },
];
