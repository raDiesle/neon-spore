import type { Wave } from "../wave-types.js";

/**
 * Waves 64 to 73 of the game, in the order they are played: THE SEEDER's block
 * and the boss THE MIRROR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_5: Wave[] = [
  {
    id: "theSeeder",
    name: "THE SEEDER",
    guide: {
      scene: "theSeeder",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 2, kind: "seeder", color: "red" },
      { beat: 7, col: 7, kind: "seeder", color: "cyan" },
      { beat: 14, col: 4, kind: "seeder", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederAgain",
    name: "SEEDER AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "seeder", color: "cyan" },
      { beat: 7, col: 4, kind: "seeder", color: "red" },
      { beat: 14, col: 5, kind: "seeder", color: "cyan" },
      { beat: 22, col: 6, kind: "seeder", color: "red" },
      { beat: 29, col: 5, kind: "seeder", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederSpread",
    name: "SEEDER RAIN",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "seeder", color: "red" },
      { beat: 7, col: 4, kind: "seeder", color: "red" },
      { beat: 14, col: 3, kind: "seeder", color: "red" },
      { beat: 20, col: 5, kind: "seeder", color: "red" },
      { beat: 25, col: 4, kind: "seeder", color: "red" },
      { beat: 32, col: 6, kind: "seeder", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederReach",
    name: "SEEDER HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "seeder", color: "red" },
      { beat: 5, col: 3, kind: "seeder", color: "red" },
      { beat: 11, col: 8, kind: "seeder", color: "cyan" },
      { beat: 17, col: 2, kind: "seeder", color: "red" },
      { beat: 22, col: 7, kind: "seeder", color: "red" },
      { beat: 28, col: 3, kind: "seeder", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederPair",
    name: "SEEDER DUET",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 2, kind: "seeder", color: "red" },
      { beat: 12, col: 4, color: "red" },
      { beat: 16, col: 3, kind: "morsel", color: "red" },
      { beat: 20, col: 6, color: "red" },
      { beat: 25, col: 2, kind: "seeder", color: "red" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 37, col: 7, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederBreathe",
    name: "SEEDER HUSH",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 3, kind: "seeder", color: "red" },
      { beat: 14, col: 2, color: "red" },
      { beat: 20, col: 7, kind: "meteor", color: null },
      { beat: 27, col: 4, color: "red" },
      { beat: 35, col: 6, kind: "seeder", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederRecall",
    name: "SEEDER HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 6, kind: "seeder", color: "red" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 15, col: 6, kind: "meteor", color: null },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 26, col: 7, kind: "seeder", color: "red" },
      { beat: 32, col: 6, color: "red" },
      { beat: 38, col: 1, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederBend",
    name: "SEEDER PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 0, kind: "seeder", color: "red" },
      { beat: 12, col: 4, color: "red" },
      { beat: 17, col: 2, kind: "morsel", color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 10, kind: "seeder", color: "cyan" },
      { beat: 33, col: 6, kind: "morsel", color: "red" },
      { beat: 38, col: 5, color: "red" },
      { beat: 38, col: 8, color: "red" },
      { beat: 43, col: 9, kind: "seeder", color: "red" },
      { beat: 48, col: 8, kind: "morsel", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederPeak",
    name: "SEEDER FURY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 5, kind: "seeder", color: "red" },
      { beat: 8, col: 8, color: "cyan" },
      { beat: 12, col: 2, kind: "morsel", color: "red" },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 20, col: 8, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 24, col: 4, kind: "seeder", color: "red" },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 6, kind: "morsel", color: "cyan" },
      { beat: 36, col: 2, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 7, kind: "seeder", color: "red" },
      { beat: 48, col: 10, kind: "morsel", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theMirror",
    name: "THE MIRROR",
    guide: {
      scene: "theMirror",
    },
    entries: [],
    boss: {
      kind: "mirror",
      rounds: [
        ["fireRed", "guard"],
        ["cannonLeft", "cannonRight", "cannonRight"],
        ["intake", "fireRed", "intake", "fireCyan", "intake", "fireRed"],
      ],
    },
    bossType: "special",
    controls: "standard5",
  },
];
