import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 275 to 284 of the game, in the order they are played: THE CHOIR's
 * block, the filler before THE GORGE and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_21: Wave[] = [
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
    id: "theChoirAgain",
    name: "FIRST CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "choir", color: "cyan" },
      { beat: 8, col: 9, kind: "choir", color: "cyan" },
      { beat: 15, col: 1, kind: "choir", color: "cyan" },
      { beat: 21, col: 9, kind: "choir", color: "red" },
      { beat: 27, col: 7, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIR VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "choir", color: "cyan" },
      { beat: 5, col: 9, kind: "magnet", color: "red" },
      { beat: 19, col: 9, kind: "choir", color: "red" },
      { beat: 24, col: 5, kind: "magnet", color: "red" },
    ],
    pods: [{ beat: 13, col: 5, row: 4, kind: "husk" }],
  },
  {
    id: "theChoirPair",
    name: "CHOIR AND MAGNET",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 1, kind: "choir", color: "cyan" },
      { beat: 13, col: 6, color: "red" },
      { beat: 18, col: 1, kind: "magnet", color: "red" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 28, col: 4, kind: "throb", color: "red" },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 39, col: 9, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 10, kind: "choir", color: "red" },
      { beat: 13, col: 0, color: "red" },
      { beat: 21, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 26, col: 9, color: "red" },
      { beat: 32, col: 1, kind: "choir", color: "red" },
      { beat: 37, col: 6, color: "red" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 0, kind: "choir", color: "red" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 13, col: 5, kind: "magnet", color: "red" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 30, col: 7, kind: "choir", color: "cyan" },
      { beat: 35, col: 1, color: "red" },
      { beat: 35, col: 9, color: "red" },
      { beat: 38, col: 0, kind: "magnet", color: "cyan" },
      { beat: 44, col: 8, kind: "beatbox", color: null, beats: 2 },
      { beat: 48, col: 1, color: "cyan" },
      { beat: 48, col: 9, color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBreathe",
    name: "CHOIR DREAM",
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 2, kind: "choir", color: "cyan" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 20, col: 4, kind: "magnet", color: "red" },
      { beat: 26, col: 9, color: "red" },
      { beat: 38, col: 1, color: "cyan" },
    ],
    pods: [{ beat: 32, col: 8, row: 3, kind: "pod" }],
  },
  {
    id: "fillerGorgeRecall",
    name: "CHOIR REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 4, kind: "choir", color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 1, kind: "veer", color: null },
      { beat: 24, col: 8, color: "red" },
      { beat: 29, col: 6, kind: "choir", color: "red" },
      { beat: 34, col: 0, color: "red" },
      { beat: 39, col: 3, kind: "veer", color: null },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "CHOIR MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 3, kind: "choir", color: "cyan" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 10, kind: "magnet", color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 28, col: 3, kind: "choir", color: "red" },
      { beat: 33, col: 7, kind: "magnet", color: "red" },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 44, col: 7, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 10, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 60, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, kind: "meteor", color: null },
      { beat: 82, col: 2, color: "cyan" },
    ],
    boss: { kind: "gorge", levels: GORGE_LEVELS },
    bossType: "normal",
  },
];
