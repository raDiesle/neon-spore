import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7g-p3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7G_P4: Wave[] = [
  {
    id: "theMagnet",
    name: "THE MAGNET",
    guide: {
      scene: "theMagnet",
    },
    entries: [
      { beat: 0, col: 5, kind: "magnet", color: "red" },
      { beat: 14, col: 2, kind: "magnet", color: "cyan" },
      { beat: 28, col: 7, kind: "magnet", color: "red" },
      { beat: 44, col: 0, kind: "magnet", color: "cyan" },
      { beat: 46, col: 10, kind: "magnet", color: "red" },
    ],
  },
];
