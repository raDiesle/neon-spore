import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-3-p3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_3_P4: Wave[] = [
  {
    id: "theGauge",
    name: "THE GAUGE",
    guide: {
      scene: "theGauge",
    },
    entries: [],
    boss: { kind: "gauge" },
    bossType: "special",
    controls: "gauge",
  },
  {
    id: "theWarden",
    name: "THE WARDEN",
    guide: {
      scene: "theWarden",
    },
    entries: [],
    boss: { kind: "warden" },
    bossType: "normal",
    controls: "standard5",
  },
];
