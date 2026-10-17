import type { Wave } from "../wave-types.js";

/**
 * Waves 646 to 654 of the game, in the order they are played: THE GHOST's
 * review and the boss THE CAPSTAN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_52: Wave[] = [
  {
    id: "reviewGhostAgain",
    name: "GHOST DAWN",
    entries: [
      { beat: 0, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 8, col: 8, kind: "wisp", color: null },
      { beat: 16, col: 1, kind: "clasp", color: "cyan" },
      { beat: 24, col: 3, kind: "ghost", color: "cyan" },
      { beat: 32, col: 8, kind: "wisp", color: null },
    ],
  },
  {
    id: "reviewGhostSpread",
    name: "GHOST SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "ghost", color: "cyan" },
      { beat: 6, col: 7, kind: "wisp", color: null },
      { beat: 12, col: 10, kind: "dart", color: "red" },
      { beat: 19, col: 1, kind: "ghost", color: "cyan" },
      { beat: 25, col: 9, kind: "wisp", color: null },
      { beat: 32, col: 2, kind: "dart", color: "red" },
    ],
  },
  {
    id: "reviewGhostReach",
    name: "OUTER GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "ghost", color: "red" },
      { beat: 6, col: 9, kind: "wisp", color: null },
      { beat: 12, col: 2, kind: "lure", color: "cyan" },
      { beat: 17, col: 10, kind: "ghost", color: "cyan" },
      { beat: 22, col: 0, kind: "wisp", color: null },
      { beat: 27, col: 10, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "reviewGhostPair",
    name: "GHOST MEETS WISP",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 0, kind: "ghost", color: "cyan" },
      { beat: 9, col: 5, color: "cyan" },
      { beat: 9, col: 8, color: "cyan" },
      { beat: 13, col: 0, kind: "wisp", color: null },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 30, col: 0, kind: "ghost", color: "red" },
      { beat: 35, col: 10, kind: "wisp", color: null },
      { beat: 39, col: 2, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
    ],
    pods: [{ beat: 18, col: 9, row: 4, kind: "husk" }],
  },
  {
    id: "reviewGhostBreathe",
    name: "GHOST DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 8, col: 0, kind: "ghost", color: "cyan" },
      { beat: 14, col: 10, color: "red" },
      { beat: 20, col: 2, kind: "wisp", color: null },
      { beat: 28, col: 0, color: "red" },
      { beat: 36, col: 4, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "reviewGhostRecall",
    name: "GHOST LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 5, kind: "ghost", color: "red" },
      { beat: 10, col: 1, color: "red" },
      { beat: 10, col: 9, color: "red" },
      { beat: 16, col: 2, kind: "morsel", color: "cyan" },
      { beat: 21, col: 4, kind: "ghost", color: "cyan" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 31, col: 5, kind: "morsel", color: "cyan" },
      { beat: 36, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "reviewGhostBend",
    name: "TWISTED GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 0, kind: "ghost", color: "red" },
      { beat: 11, col: 10, kind: "wisp", color: null },
      { beat: 16, col: 3, color: "red" },
      { beat: 16, col: 6, color: "red" },
      { beat: 21, col: 9, kind: "ghost", color: "cyan", path: "across" },
      { beat: 26, col: 6, kind: "wisp", color: null },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 36, col: 10, kind: "ghost", color: "cyan" },
      { beat: 41, col: 8, kind: "wisp", color: null },
      { beat: 47, col: 1, color: "cyan" },
      { beat: 47, col: 9, color: "cyan" },
    ],
  },
  {
    id: "reviewGhostPeak",
    name: "GHOST APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 0, col: 8, color: "red" },
      { beat: 4, col: 2, kind: "ghost", color: "cyan", path: "across" },
      { beat: 8, col: 7, kind: "wisp", color: null },
      { beat: 12, col: 3, color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 19, col: 5, kind: "ghost", color: "cyan" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 27, col: 6, kind: "wisp", color: null },
      { beat: 34, col: 3, color: "cyan" },
      { beat: 34, col: 6, color: "cyan" },
      { beat: 38, col: 4, kind: "ghost", color: "cyan", path: "across" },
      { beat: 41, col: 3, kind: "wisp", color: null },
      { beat: 45, col: 0, color: "red" },
      { beat: 45, col: 10, color: "red" },
    ],
    pods: [
      { beat: 15, col: 10, row: 3, kind: "pod" },
      { beat: 31, col: 8, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theCapstan",
    name: "THE CAPSTAN",
    guide: {
      both: "One of you drags the drum to turn a band toward the other, who rubs it bright. Both bands bright bare the core. Shoot it in its colour.",
      p1: "1. Left mark: drag the drum left and hold it.\n2. Right mark: rub the band your partner turns to you.\n3. When rust creeps back, do it again, either way round.\n4. Shoot the core in its colour.",
      p2: "1. Left mark: rub the band your partner turns to you.\n2. Right mark: drag the drum right and hold it.\n3. When rust creeps back, do it again, either way round.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "capstan",
      steps: [
        { ask: "left", color: "either", beats: 12 },
        { ask: "right", color: "either", beats: 12 },
        { ask: "fire", color: "red", beats: 6 },
        { ask: "hold", color: "either", beats: 8 },
        { ask: "fire", color: "cyan", beats: 6 },
        { ask: "hold", color: "either", beats: 6 },
        { ask: "fire", color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
