import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-10-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_10_P3: Wave[] = [
  {
    id: "theChoir",
    name: "THE CHOIR",
    guide: {
      scene: "theChoir",
    },
    entries: [
      { beat: 0, col: 3, kind: "choir", color: "red" },
      { beat: 10, col: 0, kind: "choir", color: "cyan" },
      { beat: 22, col: 7, kind: "choir", color: "cyan" },
      { beat: 34, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "pulse",
    name: "THE PULSE",
    guide: {
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
    bossType: "special",
    controls: "pulse",
  },
];
