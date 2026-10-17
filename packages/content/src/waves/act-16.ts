import type { Wave } from "../wave-types.js";

/**
 * Waves 213 to 222 of the game, in the order they are played: THE CHOKE's
 * block, the filler before THE WARDEN and the boss THE WARDEN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 16, col: 4, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 32, col: 9, color: "red" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 48, col: 1, color: "red" },
      { beat: 60, col: 9, color: "red" },
      { beat: 68, col: 1, color: "cyan" },
      { beat: 76, col: 4, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeAgain",
    name: "CHOKE DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "cyan" },
      { beat: 7, col: 8, kind: "shell", color: "cyan" },
      { beat: 14, col: 2, kind: "shell", color: "cyan" },
      { beat: 22, col: 6, kind: "shell", color: "cyan" },
      { beat: 29, col: 9, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theChokeReach",
    name: "CHOKE HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "shell", color: "red" },
      { beat: 6, col: 4, kind: "countdown", color: "cyan" },
      { beat: 16, col: 1, kind: "shell", color: "cyan" },
      { beat: 24, col: 5, kind: "countdown", color: "red" },
    ],
    pods: [{ beat: 11, col: 8, row: 4, kind: "husk" }],
  },
  {
    id: "theChokePair",
    name: "CHOKE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 9, kind: "shell", color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 16, col: 0, kind: "countdown", color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 34, col: 1, color: "red" },
      { beat: 40, col: 0, kind: "shell", color: "red" },
    ],
    pods: [{ beat: 28, col: 4, row: 3, kind: "pod" }],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 10, kind: "shell", color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 0, kind: "shell", color: "red" },
      { beat: 25, col: 10, color: "red" },
      { beat: 32, col: 0, kind: "shell", color: "red" },
      { beat: 38, col: 8, color: "red" },
    ],
  },
  {
    id: "theChokePeak",
    name: "CHOKE THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 8, kind: "shell", color: "red" },
      { beat: 8, col: 6, color: "cyan" },
      { beat: 12, col: 7, kind: "countdown", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 20, col: 2, kind: "seeder", color: "red" },
      { beat: 24, col: 5, kind: "shell", color: "red" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 32, col: 7, kind: "countdown", color: "red" },
      { beat: 36, col: 4, kind: "seeder", color: "cyan" },
      { beat: 41, col: 0, color: "cyan" },
      { beat: 41, col: 10, color: "cyan" },
      { beat: 45, col: 1, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerWardenBreathe",
    name: "CHOKE HUSH",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 7, col: 7, kind: "shell", color: "cyan" },
      { beat: 13, col: 8, color: "red" },
      { beat: 20, col: 2, kind: "countdown", color: "cyan" },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 36, col: 8, kind: "shell", color: "red" },
    ],
  },
  {
    id: "fillerWardenRecall",
    name: "CHOKE RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 0, kind: "shell", color: "red" },
      { beat: 14, col: 9, color: "cyan" },
      { beat: 19, col: 8, kind: "beatbox", color: null, beats: 3 },
      { beat: 25, col: 7, color: "red" },
      { beat: 30, col: 2, kind: "shell", color: "cyan" },
      { beat: 36, col: 5, color: "cyan" },
    ],
  },
  {
    id: "fillerWardenBend",
    name: "CHOKE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 1, kind: "shell", color: "cyan" },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 0, kind: "countdown", color: "red" },
      { beat: 22, col: 5, color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 28, col: 6, kind: "shell", color: "cyan" },
      { beat: 33, col: 3, kind: "countdown", color: "cyan" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 43, col: 9, kind: "shell", color: "red" },
      { beat: 48, col: 5, kind: "countdown", color: "red" },
    ],
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
