import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-3-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_3_P3: Wave[] = [
  {
    id: "theMaze",
    name: "THE MAZE",
    guide: {
      scene: "theMaze",
    },
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
    bossType: "special",
    controls: "standard5",
  },
];
