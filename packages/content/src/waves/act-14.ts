import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 149 to 158 of the game, in the order they are played: THE CHOKE's block
 * and the boss THE STARE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_14: Wave[] = [
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
    name: "CHOKE DAWN",
    variant: true,
    entries: [
      { beat: 6, col: 1, kind: "meteor", color: null },
      { beat: 13, col: 4, kind: "meteor", color: null },
      { beat: 28, col: 4, kind: "meteor", color: null },
    ],
    pods: [
      { beat: 0, col: 4, row: 4, kind: "husk" },
      { beat: 21, col: 8, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theChokeSpread",
    name: "CHOKE SEEDS",
    variant: true,
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 19, col: 8, color: "red" },
      { beat: 29, col: 6, color: "red" },
    ],
    pods: [
      { beat: 0, col: 6, row: 4, kind: "husk" },
      { beat: 12, col: 6, row: 4, kind: "husk" },
      { beat: 24, col: 4, row: 4, kind: "husk" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeReach",
    name: "OUTER CHOKE",
    variant: true,
    entries: [
      { beat: 6, col: 9, kind: "shell", color: "red" },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 21, col: 5, kind: "shell", color: "cyan" },
      { beat: 27, col: 1, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 0, row: 4, kind: "husk" },
      { beat: 16, col: 0, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theChokePair",
    name: "CHOKE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 15, col: 2, kind: "shell", color: "red" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 29, col: 9, color: "cyan" },
      { beat: 33, col: 10, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 6, col: 8, row: 4, kind: "husk" },
      { beat: 24, col: 8, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theChokeBreathe",
    name: "CHOKE DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 24, col: 10, kind: "shell", color: "cyan" },
      { beat: 32, col: 0, color: "red" },
    ],
    pods: [{ beat: 8, col: 9, row: 4, kind: "husk" }],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 16, col: 4, kind: "throb", color: "red" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 32, col: 8, color: "red" },
      { beat: 38, col: 10, kind: "throb", color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "husk" },
      { beat: 26, col: 9, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theChokeBend",
    name: "TWISTED CHOKE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 5, kind: "shell", color: "cyan" },
      { beat: 24, col: 4, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 34, col: 5, kind: "shell", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
    ],
    pods: [
      { beat: 6, col: 2, row: 4, kind: "husk" },
      { beat: 29, col: 3, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theChokePeak",
    name: "CHOKE APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 9, color: "cyan" },
      { beat: 12, col: 3, kind: "shell", color: "cyan" },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 20, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 28, col: 5, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 32, col: 3, kind: "shell", color: "cyan" },
      { beat: 36, col: 6, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 48, col: 5, kind: "shell", color: "red" },
    ],
    pods: [
      { beat: 4, col: 3, row: 4, kind: "husk" },
      { beat: 24, col: 1, row: 4, kind: "husk" },
      { beat: 44, col: 2, row: 4, kind: "husk" },
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
