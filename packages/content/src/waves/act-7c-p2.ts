import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7c.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7C_P2: Wave[] = [
  {
    id: "theRind",
    name: "THE RIND",
    guide: {
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 5, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 18, col: 3, kind: "rind", color: "cyan" },
      { beat: 21, col: 8, kind: "rind", color: "red" },
    ],
  },
];
