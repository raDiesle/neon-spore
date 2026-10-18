import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 372 to 381 of the game, in the order they are played: THE VOLLEY's
 * block, the filler before THE GORGE and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_26: Wave[] = [
  {
    id: "theVolley",
    name: "THE VOLLEY",
    guide: {
      scene: "theVolley",
    },
    entries: [
      { beat: 0, col: 2, kind: "volley", color: "red" },
      { beat: 26, col: 8, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVolleyAgain",
    name: "HELLO VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "volley", color: "cyan" },
      { beat: 7, col: 10, kind: "volley", color: "red" },
      { beat: 13, col: 4, kind: "volley", color: "cyan" },
      { beat: 19, col: 9, kind: "volley", color: "red" },
      { beat: 25, col: 7, kind: "volley", color: "cyan" },
      { beat: 31, col: 1, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVolleyReach",
    name: "VOLLEY HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "volley", color: "red" },
      { beat: 6, col: 1, kind: "crystal", color: "cyan" },
      { beat: 19, col: 0, kind: "volley", color: "red" },
      { beat: 24, col: 4, kind: "crystal", color: "cyan" },
    ],
    pods: [{ beat: 11, col: 8, row: 4, kind: "husk" }],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 10, kind: "volley", color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 5, kind: "crystal", color: "red" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 27, col: 3, kind: "meteorMedium", color: null },
      { beat: 35, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "VOLLEY LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 8, kind: "volley", color: "cyan" },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 15, col: 2, kind: "ghost", color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 28, col: 0, kind: "volley", color: "red" },
      { beat: 35, col: 9, color: "red" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 3, col: 7, kind: "volley", color: "cyan" },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 10, kind: "crystal", color: "cyan" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 25, col: 3, kind: "clasp", color: "cyan" },
      { beat: 30, col: 9, kind: "volley", color: "red" },
      { beat: 36, col: 1, color: "cyan" },
      { beat: 36, col: 9, color: "cyan" },
      { beat: 40, col: 5, kind: "crystal", color: "red" },
      { beat: 44, col: 4, kind: "clasp", color: "red" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBreathe",
    name: "VOLLEY DREAM",
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 0, kind: "volley", color: "red" },
      { beat: 14, col: 4, color: "cyan" },
      { beat: 20, col: 3, kind: "crystal", color: "cyan" },
      { beat: 26, col: 7, color: "red" },
      { beat: 33, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "fillerGorgeRecall",
    name: "VOLLEY REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 5, kind: "volley", color: "cyan" },
      { beat: 10, col: 1, color: "red" },
      { beat: 16, col: 4, kind: "fence", color: null },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 5, kind: "volley", color: "cyan" },
      { beat: 32, col: 2, kind: "fence", color: null },
      { beat: 38, col: 5, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "VOLLEY MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 1, kind: "volley", color: "cyan" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 10, kind: "crystal", color: "cyan" },
      { beat: 23, col: 3, kind: "volley", color: "cyan" },
      { beat: 28, col: 5, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 33, col: 10, kind: "crystal", color: "red" },
      { beat: 39, col: 3, kind: "volley", color: "cyan" },
      { beat: 44, col: 3, color: "red" },
      { beat: 44, col: 7, color: "red" },
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
