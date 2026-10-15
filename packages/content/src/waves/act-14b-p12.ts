import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p11.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P12: Wave[] = [
  {
    id: "theTrapeze",
    name: "THE TRAPEZE",
    guide: {
      scene: "theTrapeze",
    },
    entries: [],
    boss: {
      kind: "trapeze",
      steps: [
        { ask: "push", gongSide: 1, gongMilli: 10000, beats: 32 },
        { ask: "call", gongSide: -1, gongMilli: 14000, beats: 40 },
        { ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 },
        { ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theFlue",
    name: "THE FLUE",
    guide: {
      scene: "theFlue",
    },
    entries: [],
    boss: {
      kind: "flue",
      levels: [
        { weapon: "bolt", color: "red", speedMilli: 1000, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "right",
          needs: 1,
        },
        { weapon: "bolt", color: "red", speedMilli: 1500, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "beam",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "left",
          needs: 1,
        },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1500,
          slowMilli: 1000,
          from: "left",
          needs: 2,
        },
        { weapon: "beam", color: "red", speedMilli: 1500, slowMilli: 500, from: "right", needs: 1 },
        { weapon: "bolt", color: "red", speedMilli: 2250, slowMilli: 750, from: "right", needs: 1 },
        { weapon: "beam", color: "cyan", speedMilli: 2000, slowMilli: 500, from: "left", needs: 1 },
        { weapon: "bolt", color: "cyan", speedMilli: 3000, slowMilli: 500, from: "left", needs: 2 },
        { weapon: "bolt", color: "red", speedMilli: 3600, slowMilli: 250, from: "right", needs: 1 },
        { weapon: "beam", color: "red", speedMilli: 2250, slowMilli: 250, from: "left", needs: 2 },
      ],
    },
    bossType: "normal",
    controls: "shots",
  },
];
