import { SCOUT_ARENAS } from "../scout-arenas.js";
import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-10.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_10_P2: Wave[] = [
  {
    id: "theClaw",
    name: "THE CLAW",
    guide: {
      scene: "theClaw",
    },
    entries: [
      { beat: 4, col: 5, kind: "meteor", color: null },
      { beat: 14, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 8, kind: "meteorMedium", color: null },
      { beat: 44, col: 7, kind: "meteor", color: null },
      { beat: 46, col: 3, kind: "meteor", color: null },
      { beat: 52, col: 10, kind: "meteorMedium", color: null },
    ],
    pods: [
      { beat: 2, col: 0, row: 4, kind: "ward", cross: 1 },
      { beat: 18, col: 10, row: 6, kind: "ward", cross: -1 },
      { beat: 34, col: 0, row: 3, kind: "purge", cross: 1, speed: 3 },
      { beat: 50, col: 10, row: 5, kind: "purge", cross: -1 },
    ],
    controls: "claw",
  },
  {
    id: "theScout",
    name: "THE SCOUT",
    guide: {
      scene: "theScout",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theHaul",
    name: "THE HAUL",
    guide: {
      scene: "theHaul",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 10, col: 10, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 18, col: 8, color: "cyan" },
      { beat: 20, col: 0, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 2, color: "red" },
      { beat: 31, col: 10, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 34, col: 0, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
];
