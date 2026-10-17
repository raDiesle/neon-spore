import type { Wave } from "../wave-types.js";

/**
 * Waves 67 to 76 of the game, in the order they are played: THE SEEDER's block,
 * the filler before THE MIRROR and the boss THE MIRROR.
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
      { beat: 8, col: 2, kind: "seeder", color: "red" },
      { beat: 16, col: 7, kind: "seeder", color: "cyan" },
      { beat: 24, col: 4, kind: "seeder", color: "red" },
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
    id: "theSeederReach",
    name: "SEEDER HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "seeder", color: "cyan" },
      { beat: 6, col: 6, kind: "seeder", color: "red" },
      { beat: 11, col: 1, kind: "seeder", color: "cyan" },
      { beat: 16, col: 5, kind: "seeder", color: "red" },
      { beat: 21, col: 1, kind: "seeder", color: "red" },
      { beat: 26, col: 7, kind: "seeder", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederPair",
    name: "SEEDER DUET",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 1, kind: "seeder", color: "red" },
      { beat: 9, col: 0, color: "red" },
      { beat: 15, col: 2, kind: "morsel", color: "cyan" },
      { beat: 21, col: 5, color: "red" },
      { beat: 26, col: 7, kind: "seeder", color: "red" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 36, col: 2, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederRecall",
    name: "SEEDER HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 7, kind: "seeder", color: "cyan" },
      { beat: 11, col: 1, color: "red" },
      { beat: 17, col: 9, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 30, col: 4, kind: "seeder", color: "red" },
      { beat: 35, col: 10, color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theSeederPeak",
    name: "SEEDER FURY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 2, kind: "seeder", color: "red" },
      { beat: 8, col: 1, color: "red" },
      { beat: 12, col: 2, kind: "morsel", color: "red" },
      { beat: 16, col: 1, color: "red" },
      { beat: 16, col: 9, color: "red" },
      { beat: 20, col: 8, kind: "meteor", color: null },
      { beat: 28, col: 5, kind: "seeder", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 38, col: 5, kind: "morsel", color: "cyan" },
      { beat: 42, col: 4, kind: "meteor", color: null },
      { beat: 47, col: 0, color: "red" },
      { beat: 47, col: 10, color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerMirrorBreathe",
    name: "SEEDER DREAM",
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 6, kind: "seeder", color: "cyan" },
      { beat: 15, col: 3, color: "cyan" },
      { beat: 22, col: 5, kind: "meteor", color: null },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 36, col: 3, kind: "seeder", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerMirrorRecall",
    name: "SEEDER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 6, kind: "seeder", color: "cyan" },
      { beat: 12, col: 1, color: "red" },
      { beat: 18, col: 3, kind: "meteor", color: null },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 31, col: 6, kind: "seeder", color: "red" },
      { beat: 37, col: 10, color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerMirrorBend",
    name: "TWISTED SEEDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 0, kind: "seeder", color: "cyan" },
      { beat: 14, col: 4, color: "red" },
      { beat: 19, col: 3, kind: "morsel", color: "red" },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 30, col: 9, kind: "seeder", color: "cyan" },
      { beat: 35, col: 7, kind: "morsel", color: "red" },
      { beat: 41, col: 5, color: "cyan" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 47, col: 10, kind: "seeder", color: "red" },
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
