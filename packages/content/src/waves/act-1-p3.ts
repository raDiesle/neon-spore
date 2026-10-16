import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P3: Wave[] = [
  {
    id: "inItsShadow",
    name: "OLD TORCH SONG",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 1, col: 5, color: "red" },
      { beat: 8, col: 8, kind: "meteor", color: null },
      { beat: 9, col: 8, color: "cyan" },
    ],
    controls: "standard4",
  },
];
