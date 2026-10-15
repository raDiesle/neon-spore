import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p9.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P10: Wave[] = [
  {
    id: "theCapstan",
    name: "THE CAPSTAN",
    guide: {
      both: "One of you drags the drum to turn a band toward the other, who rubs it bright. Both bands bright bare the core. Shoot it in its colour.",
      p1: "1. Left mark: drag the drum left and hold it.\n2. Right mark: rub the band your partner turns to you.\n3. When rust creeps back, do it again, either way round.\n4. Shoot the core in its colour.",
      p2: "1. Left mark: rub the band your partner turns to you.\n2. Right mark: drag the drum right and hold it.\n3. When rust creeps back, do it again, either way round.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "capstan",
      steps: [
        { ask: "left", color: "either", beats: 12 },
        { ask: "right", color: "either", beats: 12 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "hold", color: "either", beats: 8 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "hold", color: "either", beats: 6 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
