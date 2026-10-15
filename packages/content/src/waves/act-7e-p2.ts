import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-7e.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_7E_P2: Wave[] = [
  {
    id: "theCarom",
    name: "THE CAROM",
    guide: {
      scene: "theCarom",
    },
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "red" },
      { beat: 12, col: 10, kind: "carom", color: "cyan" },
      { beat: 24, col: 2, kind: "carom", color: "cyan" },
      { beat: 28, col: 8, kind: "carom", color: "red" },
    ],
  },
];
