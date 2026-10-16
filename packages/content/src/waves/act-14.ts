import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 143 to 152 of the game, in the order they are played: THE HUSK's block
 * and the boss THE STARE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_14: Wave[] = [
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
      { beat: 0, col: 2, row: 3, kind: "pod" },
      { beat: 0, col: 5, row: 4, kind: "husk" },
      { beat: 6, col: 8, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theHuskAgain",
    name: "HELLO HUSK",
    variant: true,
    entries: [
      { beat: 8, col: 2, color: "red" },
      { beat: 15, col: 5, color: "red" },
      { beat: 30, col: 2, color: "red" },
    ],
    pods: [
      { beat: 0, col: 7, row: 4, kind: "husk" },
      { beat: 22, col: 3, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theHuskSpread",
    name: "HUSK DRIFT",
    variant: true,
    entries: [
      { beat: 7, col: 6, color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 26, col: 7, color: "red" },
      { beat: 32, col: 0, color: "red" },
    ],
    pods: [
      { beat: 0, col: 0, row: 4, kind: "husk" },
      { beat: 19, col: 8, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theHuskReach",
    name: "HUSK AT WORLD END",
    variant: true,
    entries: [
      { beat: 6, col: 1, kind: "shell", color: "red" },
      { beat: 16, col: 0, kind: "shell", color: "cyan" },
      { beat: 27, col: 10, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 0, col: 9, row: 4, kind: "husk" },
      { beat: 11, col: 8, row: 4, kind: "husk" },
      { beat: 22, col: 5, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theHuskPair",
    name: "HUSK ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 3, kind: "shell", color: "cyan" },
      { beat: 22, col: 2, color: "red" },
      { beat: 28, col: 5, kind: "beatbox", color: null, beats: 4 },
      { beat: 32, col: 7, color: "cyan" },
    ],
    pods: [{ beat: 5, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theHuskBreathe",
    name: "SLEEPY HUSK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 12, col: 9, color: "red" },
      { beat: 19, col: 4, kind: "meteor", color: null },
      { beat: 26, col: 7, color: "red" },
      { beat: 39, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 3, row: 4, kind: "husk" },
      { beat: 33, col: 4, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theHuskRecall",
    name: "OLD HUSK SONG",
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
      { beat: 5, col: 2, row: 4, kind: "husk" },
      { beat: 27, col: 6, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theHuskBend",
    name: "HUSK SPELL",
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
      { beat: 5, col: 5, row: 4, kind: "husk" },
      { beat: 26, col: 1, row: 4, kind: "husk" },
      { beat: 42, col: 9, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theHuskPeak",
    name: "HUSK RAPTURE",
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
      { beat: 4, col: 0, row: 4, kind: "husk" },
      { beat: 24, col: 3, row: 4, kind: "husk" },
      { beat: 44, col: 7, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
];
