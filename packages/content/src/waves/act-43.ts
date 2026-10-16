import type { Wave } from "../wave-types.js";

/**
 * Waves 442 to 451 of the game, in the order they are played: THE GHOST's block
 * and the boss THE VALVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_43: Wave[] = [
  {
    id: "theGhost",
    name: "THE GHOST",
    guide: {
      scene: "theGhost",
    },
    entries: [
      { beat: 0, col: 3, kind: "ghost", color: "cyan" },
      { beat: 10, col: 2, kind: "ghost", color: "red" },
      { beat: 18, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theGhostAgain",
    name: "FIRST GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "ghost", color: "red" },
      { beat: 8, col: 10, kind: "wisp", color: null },
      { beat: 14, col: 0, kind: "beatbox", color: null, beats: 4 },
      { beat: 20, col: 1, kind: "ghost", color: "cyan" },
      { beat: 28, col: 4, kind: "wisp", color: null },
    ],
  },
  {
    id: "theGhostSpread",
    name: "GHOST SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "ghost", color: "red" },
      { beat: 7, col: 9, kind: "wisp", color: null },
      { beat: 14, col: 3, kind: "choir", color: "red" },
      { beat: 20, col: 8, kind: "ghost", color: "cyan", path: "across" },
      { beat: 26, col: 4, kind: "wisp", color: null },
      { beat: 32, col: 6, kind: "choir", color: "cyan" },
    ],
  },
  {
    id: "theGhostReach",
    name: "GHOST WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "ghost", color: "red" },
      { beat: 5, col: 0, kind: "wisp", color: null },
      { beat: 10, col: 7, kind: "strand", color: "red", beads: 2 },
      { beat: 15, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 20, col: 4, kind: "wisp", color: null },
      { beat: 25, col: 9, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "theGhostPair",
    name: "GHOST TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 2, kind: "ghost", color: "red" },
      { beat: 10, col: 4, color: "red" },
      { beat: 16, col: 0, kind: "wisp", color: null },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 27, col: 0, kind: "ghost", color: "red" },
      { beat: 33, col: 10, kind: "wisp", color: null },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "theGhostBreathe",
    name: "GHOST LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 5, kind: "ghost", color: "red" },
      { beat: 14, col: 6, color: "red" },
      { beat: 22, col: 10, kind: "wisp", color: null },
      { beat: 29, col: 0, color: "cyan" },
      { beat: 35, col: 10, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theGhostRecall",
    name: "ANCIENT GHOST",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 0, kind: "ghost", color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 2, kind: "choir", color: "cyan" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 28, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 33, col: 5, kind: "choir", color: "cyan" },
      { beat: 39, col: 0, color: "cyan" },
      { beat: 39, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theGhostBend",
    name: "GHOST MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, kind: "wisp", color: null },
      { beat: 22, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 27, col: 2, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 33, col: 2, kind: "wisp", color: null },
      { beat: 39, col: 6, kind: "ghost", color: "red" },
      { beat: 45, col: 2, color: "red" },
      { beat: 45, col: 8, color: "red" },
    ],
  },
  {
    id: "theGhostPeak",
    name: "GHOST THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 7, kind: "ghost", color: "cyan", path: "across" },
      { beat: 7, col: 5, color: "red" },
      { beat: 7, col: 8, color: "red" },
      { beat: 11, col: 4, kind: "wisp", color: null },
      { beat: 18, col: 2, color: "cyan" },
      { beat: 18, col: 8, color: "cyan" },
      { beat: 21, col: 4, kind: "ghost", color: "cyan" },
      { beat: 25, col: 3, kind: "wisp", color: null },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 35, col: 6, kind: "ghost", color: "cyan", path: "across" },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 42, col: 10, kind: "wisp", color: null },
    ],
    pods: [
      { beat: 14, col: 0, row: 4, kind: "husk" },
      { beat: 32, col: 9, row: 4, kind: "husk" },
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
