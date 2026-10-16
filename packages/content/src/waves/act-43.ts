import type { Wave } from "../wave-types.js";

/**
 * Waves 447 to 456 of the game, in the order they are played: THE MINE's block
 * and the boss THE VALVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_43: Wave[] = [
  {
    id: "theMine",
    name: "THE MINE",
    guide: {
      scene: "theMine",
    },
    entries: [
      { beat: 0, col: 5, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 12, col: 2, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 24, col: 8, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 26, col: 3, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
    ],
  },
  {
    id: "theMineAgain",
    name: "LITTLE MINE",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 8, col: 5, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 15, col: 9, kind: "choir", color: "cyan" },
      { beat: 22, col: 2, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 30, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
    ],
  },
  {
    id: "theMineSpread",
    name: "MINE BLOOM",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 5, col: 5, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 10, col: 2, kind: "throb", color: "red" },
      { beat: 16, col: 5, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 23, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 30, col: 8, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theMineReach",
    name: "MINE PILGRIM",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 6, col: 2, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 11, col: 10, kind: "fence", color: null },
      { beat: 17, col: 6, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 23, col: 0, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 28, col: 5, kind: "fence", color: null },
    ],
  },
  {
    id: "theMinePair",
    name: "MINE TOGETHER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 12, col: 10, color: "red" },
      { beat: 18, col: 3, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 27, col: 2, kind: "clasp", color: "cyan" },
      { beat: 33, col: 9, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 39, col: 2, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theMineBreathe",
    name: "MINE SIESTA",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 7, col: 10, kind: "mine", color: "red", row: 9, sees: 1 },
      { beat: 15, col: 0, color: "cyan" },
      { beat: 21, col: 10, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 28, col: 9, color: "red" },
      { beat: 36, col: 4, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theMineRecall",
    name: "MINE RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 9, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 11, col: 8, color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 7, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 0, row: 4, kind: "husk" },
      { beat: 33, col: 2, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theMineBend",
    name: "MINE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 1, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 11, col: 2, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 16, col: 2, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 22, col: 4, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 27, col: 0, color: "cyan" },
      { beat: 27, col: 10, color: "cyan" },
      { beat: 33, col: 1, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 39, col: 9, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 45, col: 2, color: "cyan" },
      { beat: 45, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theMinePeak",
    name: "MINE STORM",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 1, kind: "mine", color: "red", row: 3, sees: 2 },
      { beat: 8, col: 3, color: "red" },
      { beat: 8, col: 6, color: "red" },
      { beat: 11, col: 4, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 15, col: 6, kind: "moult", color: null },
      { beat: 18, col: 3, color: "cyan" },
      { beat: 18, col: 7, color: "cyan" },
      { beat: 22, col: 2, kind: "mine", color: "cyan", row: 6, sees: 2 },
      { beat: 26, col: 6, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 29, col: 5, color: "red" },
      { beat: 29, col: 8, color: "red" },
      { beat: 32, col: 9, kind: "moult", color: null },
      { beat: 35, col: 8, kind: "mine", color: "cyan", row: 11, sees: 1 },
      { beat: 39, col: 1, color: "cyan" },
      { beat: 39, col: 9, color: "cyan" },
      { beat: 43, col: 8, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 47, col: 0, kind: "moult", color: null },
    ],
  },
  {
    id: "theValve",
    name: "THE VALVE",
    guide: {
      both: "One turns the wheel onto the mark. The other taps the pin to stop it. Then pull the pin down. Three pins. The last wants a full turn first.",
      p1: "1. Turn the wheel with your thumb until it sits on the mark.\n2. Hold it still. The other screen taps the pin.\n3. A spark falls after the first pin. Move the cannon under it.",
      p2: "1. When the wheel is on the mark, tap the pin once.\n2. Then drag the pin down before it thaws. Either of you may.\n3. Fire at the spark before it lands.",
    },
    entries: [],
    boss: { kind: "valve", marks: [250, 600, 850] },
    bossType: "normal",
  },
];
