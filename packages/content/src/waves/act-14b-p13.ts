import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p12.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P13: Wave[] = [
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
    id: "theHusk",
    name: "THE HUSK",
    guide: {
      scene: "theHusk",
    },
    entries: [
      { beat: 3, col: 0, color: "red" },
      { beat: 9, col: 10, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 2, row: 3, kind: "ward" },
      { beat: 0, col: 5, row: 4, kind: "purge", husk: true },
      { beat: 6, col: 8, row: 3, kind: "purge" },
    ],
  },
  {
    id: "theHuskAgain",
    name: "HUSKS AGAIN",
    variant: true,
    entries: [
      { beat: 8, col: 2, color: "red" },
      { beat: 15, col: 5, color: "red" },
      { beat: 30, col: 2, color: "red" },
    ],
    pods: [
      { beat: 0, col: 7, row: 4, kind: "purge", husk: true },
      { beat: 22, col: 3, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskSpread",
    name: "HUSKS SPREAD",
    variant: true,
    entries: [
      { beat: 7, col: 6, color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 26, col: 7, color: "red" },
      { beat: 32, col: 0, color: "red" },
    ],
    pods: [
      { beat: 0, col: 0, row: 4, kind: "purge", husk: true },
      { beat: 19, col: 8, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskReach",
    name: "HUSKS FAR APART",
    variant: true,
    entries: [
      { beat: 6, col: 1, kind: "shell", color: "red" },
      { beat: 16, col: 0, kind: "shell", color: "cyan" },
      { beat: 27, col: 10, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 0, col: 9, row: 4, kind: "purge", husk: true },
      { beat: 11, col: 8, row: 4, kind: "purge", husk: true },
      { beat: 22, col: 5, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskPair",
    name: "HUSK AND SHELL",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 3, kind: "shell", color: "cyan" },
      { beat: 22, col: 2, color: "red" },
      { beat: 28, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 32, col: 7, color: "cyan" },
    ],
    pods: [{ beat: 5, col: 0, row: 4, kind: "purge", husk: true }],
  },
  {
    id: "theHuskBreathe",
    name: "EASY HUSKS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 12, col: 9, color: "red" },
      { beat: 19, col: 4, kind: "meteor", color: null },
      { beat: 26, col: 7, color: "red" },
      { beat: 39, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 3, row: 4, kind: "purge", husk: true },
      { beat: 33, col: 4, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskRecall",
    name: "HUSK RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 5, kind: "throb", color: "red" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 38, col: 6, kind: "throb", color: "red" },
    ],
    pods: [
      { beat: 5, col: 2, row: 4, kind: "purge", husk: true },
      { beat: 27, col: 6, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskBend",
    name: "HUSKS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 10, col: 0, color: "red" },
      { beat: 15, col: 2, kind: "shell", color: "red" },
      { beat: 21, col: 4, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 31, col: 6, kind: "shell", color: "red" },
      { beat: 36, col: 3, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 48, col: 7, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 5, col: 5, row: 4, kind: "purge", husk: true },
      { beat: 26, col: 1, row: 4, kind: "purge", husk: true },
      { beat: 42, col: 9, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theHuskPeak",
    name: "HUSK PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 6, color: "cyan" },
      { beat: 12, col: 1, kind: "shell", color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 4, kind: "meteorMedium", color: null },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 32, col: 8, kind: "shell", color: "red" },
      { beat: 36, col: 7, kind: "meteorMedium", color: null },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 48, col: 6, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 4, col: 0, row: 4, kind: "purge", husk: true },
      { beat: 24, col: 3, row: 4, kind: "purge", husk: true },
      { beat: 44, col: 7, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 8, color: "cyan" },
      { beat: 8, col: 3, color: "red" },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 20, col: 10, color: "red" },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 42, col: 10, color: "red" },
      { beat: 44, col: 0, color: "cyan" },
      { beat: 48, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeAgain",
    name: "CHOKE AGAIN",
    variant: true,
    entries: [
      { beat: 6, col: 1, kind: "meteor", color: null },
      { beat: 13, col: 4, kind: "meteor", color: null },
      { beat: 28, col: 4, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 0, col: 4, row: 4, kind: "purge", husk: true },
      { beat: 21, col: 8, row: 4, kind: "purge", husk: true },
    ],
  },
  {
    id: "theChokeSpread",
    name: "CHOKE WIDE",
    variant: true,
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 19, col: 8, color: "red" },
      { beat: 29, col: 6, color: "red" },
    ],
    pods: [
      { beat: 0, col: 6, row: 4, kind: "purge", husk: true },
      { beat: 12, col: 6, row: 4, kind: "purge", husk: true },
      { beat: 24, col: 4, row: 4, kind: "purge", husk: true },
    ],
    faults: [{ kind: "steer" }],
  },
];
