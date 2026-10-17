import type { Wave } from "../wave-types.js";

/**
 * Waves 264 to 273 of the game, in the order they are played: THE CHOIR's
 * block, the filler before THE SINEW and the boss THE SINEW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_24: Wave[] = [
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
      { beat: 0, col: 9, kind: "choir", color: "cyan" },
      { beat: 8, col: 2, kind: "choir", color: "red" },
      { beat: 14, col: 10, kind: "choir", color: "cyan" },
      { beat: 21, col: 1, kind: "choir", color: "cyan" },
      { beat: 29, col: 7, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirReach",
    name: "CHOIR WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "choir", color: "cyan" },
      { beat: 5, col: 0, kind: "magnet", color: "red" },
      { beat: 10, col: 5, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 16, col: 10, kind: "choir", color: "cyan" },
      { beat: 21, col: 6, kind: "magnet", color: "red" },
      { beat: 27, col: 0, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theChoirPair",
    name: "CHOIR TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 3, kind: "choir", color: "cyan" },
      { beat: 9, col: 9, color: "cyan" },
      { beat: 13, col: 2, kind: "magnet", color: "red" },
      { beat: 18, col: 9, color: "cyan" },
      { beat: 24, col: 2, kind: "shell", color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 2, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theChoirRecall",
    name: "ANCIENT CHOIR",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 10, kind: "choir", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 17, col: 10, kind: "glutton", color: "red" },
      { beat: 22, col: 5, color: "red" },
      { beat: 28, col: 9, kind: "choir", color: "red" },
      { beat: 34, col: 7, color: "cyan" },
      { beat: 39, col: 6, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "theChoirPeak",
    name: "CHOIR THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 2, kind: "choir", color: "cyan" },
      { beat: 8, col: 5, color: "red" },
      { beat: 11, col: 8, kind: "magnet", color: "red" },
      { beat: 14, col: 3, color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 21, col: 5, kind: "choir", color: "red" },
      { beat: 25, col: 0, color: "cyan" },
      { beat: 25, col: 10, color: "cyan" },
      { beat: 29, col: 5, kind: "magnet", color: "red" },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 4, kind: "choir", color: "cyan" },
      { beat: 45, col: 8, kind: "magnet", color: "red" },
      { beat: 48, col: 0, color: "red" },
    ],
    pods: [
      { beat: 17, col: 1, row: 3, kind: "pod" },
      { beat: 33, col: 7, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerSinewBreathe",
    name: "CHOIR SIESTA",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 7, col: 9, kind: "choir", color: "cyan" },
      { beat: 13, col: 5, color: "cyan" },
      { beat: 19, col: 3, kind: "magnet", color: "red" },
      { beat: 26, col: 4, color: "red" },
      { beat: 40, col: 7, color: "cyan" },
    ],
    pods: [{ beat: 32, col: 6, row: 3, kind: "pod" }],
  },
  {
    id: "fillerSinewRecall",
    name: "CHOIR RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 9, kind: "choir", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 17, col: 4, kind: "glutton", color: "cyan" },
      { beat: 23, col: 6, color: "cyan" },
      { beat: 29, col: 4, kind: "choir", color: "cyan" },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 4, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "fillerSinewBend",
    name: "CHOIR ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 4, kind: "choir", color: "cyan" },
      { beat: 11, col: 1, color: "red" },
      { beat: 17, col: 8, kind: "magnet", color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 29, col: 7, kind: "choir", color: "red" },
      { beat: 35, col: 4, kind: "magnet", color: "red" },
      { beat: 41, col: 2, color: "red" },
      { beat: 41, col: 8, color: "red" },
      { beat: 47, col: 7, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    guide: {
      scene: "theSinew",
    },
    entries: [],
    boss: { kind: "sinew" },
    bossType: "normal",
  },
];
