import type { Wave } from "../wave-types.js";

/**
 * Waves 442 to 451 of the game, in the order they are played: THE WISP's block
 * and the boss THE VALVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_43: Wave[] = [
  {
    id: "theWisp",
    name: "THE WISP",
    guide: {
      scene: "theWisp",
    },
    entries: [
      { beat: 0, col: 5, kind: "wisp", color: null },
      { beat: 14, col: 2, kind: "wisp", color: null },
      { beat: 28, col: 7, kind: "wisp", color: null },
    ],
  },
  {
    id: "theWispAgain",
    name: "FIRST WISP",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "wisp", color: null },
      { beat: 8, col: 3, kind: "veil", color: null },
      { beat: 16, col: 10, kind: "fence", color: null },
      { beat: 22, col: 3, kind: "wisp", color: null },
      { beat: 30, col: 5, kind: "veil", color: null },
    ],
  },
  {
    id: "theWispSpread",
    name: "WISP SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "wisp", color: null },
      { beat: 6, col: 5, kind: "veil", color: null },
      { beat: 12, col: 4, kind: "lid", color: "cyan" },
      { beat: 18, col: 7, kind: "wisp", color: null },
      { beat: 25, col: 1, kind: "veil", color: null },
      { beat: 30, col: 10, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theWispReach",
    name: "WISP WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "wisp", color: null },
      { beat: 5, col: 10, kind: "veil", color: null },
      { beat: 11, col: 3, kind: "balloon", color: null },
      { beat: 16, col: 8, kind: "wisp", color: null },
      { beat: 21, col: 3, kind: "veil", color: null },
      { beat: 26, col: 8, kind: "balloon", color: null },
    ],
  },
  {
    id: "theWispPair",
    name: "WISP TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 1, kind: "wisp", color: null },
      { beat: 9, col: 0, color: "red" },
      { beat: 15, col: 1, kind: "veil", color: null },
      { beat: 19, col: 0, color: "red" },
      { beat: 19, col: 10, color: "red" },
      { beat: 23, col: 1, kind: "wisp", color: null },
      { beat: 27, col: 8, kind: "veil", color: null },
      { beat: 31, col: 1, color: "red" },
      { beat: 31, col: 9, color: "red" },
      { beat: 36, col: 6, kind: "wisp", color: null },
    ],
  },
  {
    id: "theWispBreathe",
    name: "WISP LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 6, kind: "wisp", color: null },
      { beat: 14, col: 3, color: "red" },
      { beat: 20, col: 7, kind: "veil", color: null },
      { beat: 27, col: 0, color: "cyan" },
      { beat: 33, col: 10, kind: "torch", color: null },
      { beat: 39, col: 0, color: "cyan" },
    ],
  },
  {
    id: "theWispRecall",
    name: "ANCIENT WISP",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 7, kind: "wisp", color: null },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 20, col: 1, color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 25, col: 4, kind: "wisp", color: null },
      { beat: 37, col: 1, color: "cyan" },
      { beat: 37, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 15, col: 6, row: 3, kind: "pod" },
      { beat: 31, col: 9, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theWispBend",
    name: "WISP MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 4, kind: "wisp", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 9, kind: "veil", color: null },
      { beat: 22, col: 7, kind: "wisp", color: null },
      { beat: 27, col: 1, color: "red" },
      { beat: 27, col: 9, color: "red" },
      { beat: 33, col: 0, kind: "veil", color: null },
      { beat: 38, col: 9, kind: "wisp", color: null },
      { beat: 43, col: 5, color: "red" },
      { beat: 43, col: 8, color: "red" },
      { beat: 48, col: 1, kind: "veil", color: null },
    ],
  },
  {
    id: "theWispPeak",
    name: "WISP THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 3, kind: "wisp", color: null },
      { beat: 7, col: 5, color: "cyan" },
      { beat: 7, col: 8, color: "cyan" },
      { beat: 11, col: 6, kind: "veil", color: null },
      { beat: 15, col: 7, kind: "recoil", color: "cyan" },
      { beat: 19, col: 4, color: "red" },
      { beat: 19, col: 7, color: "red" },
      { beat: 22, col: 8, kind: "wisp", color: null },
      { beat: 26, col: 6, kind: "veil", color: null },
      { beat: 29, col: 3, color: "cyan" },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 33, col: 5, kind: "recoil", color: "cyan" },
      { beat: 36, col: 3, kind: "wisp", color: null },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
      { beat: 44, col: 7, kind: "veil", color: null },
      { beat: 47, col: 10, kind: "recoil", color: "red" },
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
