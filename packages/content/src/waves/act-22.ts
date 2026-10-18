import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 322 to 331 of the game, in the order they are played: THE JAM's block,
 * the filler before THE SCOUT and the boss THE SCOUT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_22: Wave[] = [
  {
    id: "theJam",
    name: "THE JAM",
    guide: {
      scene: "theJam",
    },
    entries: [
      { beat: 0, col: 5, kind: "lure", color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 20, col: 3, kind: "lure", color: "cyan" },
      { beat: 28, col: 5, color: "red" },
      { beat: 36, col: 7, kind: "lure", color: "red" },
      { beat: 50, col: 4, color: "red" },
      { beat: 62, col: 1, kind: "lure", color: "cyan" },
      { beat: 70, col: 9, color: "red" },
    ],
    faults: [{ kind: "cannon", color: "alternating", at: 9 }],
  },
  {
    id: "theJamAgain",
    name: "JAM DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "coil", color: null },
      { beat: 7, col: 4, kind: "coil", color: null },
      { beat: 15, col: 10, kind: "coil", color: null },
      { beat: 22, col: 4, kind: "coil", color: null },
      { beat: 29, col: 10, kind: "coil", color: null },
    ],
  },
  {
    id: "theJamReach",
    name: "FAR JAM",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "coil", color: null },
      { beat: 6, col: 0, kind: "moult", color: null },
      { beat: 14, col: 6, kind: "gyre", color: null },
      { beat: 19, col: 2, kind: "coil", color: null },
      { beat: 24, col: 6, kind: "moult", color: null },
      { beat: 29, col: 1, kind: "gyre", color: null },
    ],
  },
  {
    id: "theJamPair",
    name: "JAM DUET",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 4, kind: "coil", color: null },
      { beat: 10, col: 7, color: "red" },
      { beat: 16, col: 0, kind: "moult", color: null },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 28, col: 5, kind: "throb", color: "red" },
      { beat: 34, col: 2, color: "red" },
      { beat: 40, col: 1, kind: "coil", color: null },
    ],
    faults: [{ kind: "cannon", color: "alternating", at: 9 }],
  },
  {
    id: "theJamRecall",
    name: "OLD JAM SONG",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 0, kind: "coil", color: null },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 16, col: 7, kind: "recoil", color: "red" },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 39, col: 9, kind: "recoil", color: "red" },
    ],
    faults: [{ kind: "cannon", color: "alternating", at: 9 }],
  },
  {
    id: "theJamPeak",
    name: "JAM OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 3, col: 8, kind: "coil", color: null },
      { beat: 7, col: 10, color: "red" },
      { beat: 10, col: 8, kind: "moult", color: null },
      { beat: 13, col: 1, color: "red" },
      { beat: 13, col: 9, color: "red" },
      { beat: 17, col: 7, kind: "recoil", color: "red" },
      { beat: 21, col: 0, kind: "coil", color: null },
      { beat: 29, col: 0, color: "red" },
      { beat: 29, col: 10, color: "red" },
      { beat: 36, col: 1, kind: "moult", color: null },
      { beat: 40, col: 5, kind: "recoil", color: "red" },
      { beat: 44, col: 2, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
      { beat: 48, col: 9, kind: "coil", color: null },
    ],
  },
  {
    id: "fillerScoutBreathe",
    name: "JAM HUSH",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 7, col: 6, kind: "coil", color: null },
      { beat: 15, col: 3, color: "red" },
      { beat: 22, col: 7, kind: "moult", color: null },
      { beat: 29, col: 9, color: "red" },
      { beat: 35, col: 5, kind: "dart", color: "red" },
    ],
  },
  {
    id: "fillerScoutRecall",
    name: "JAM REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 2, kind: "coil", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 9, kind: "recoil", color: "red" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 28, col: 5, kind: "coil", color: null },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 39, col: 9, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "fillerScoutBend",
    name: "JAM MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 4, kind: "coil", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 2, kind: "moult", color: null },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 29, col: 10, kind: "coil", color: null },
      { beat: 35, col: 9, kind: "moult", color: null },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 46, col: 7, kind: "coil", color: null },
    ],
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
];
