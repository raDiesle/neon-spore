import type { Wave } from "../wave-types.js";

/**
 * Waves 155 to 166 of the game, in the order they are played: THE SEEDER's
 * block, the filler before THE MIRROR, the boss THE MIRROR and THE CROSSING's
 * block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_6: Wave[] = [
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
  },
  {
    id: "theSeederPair",
    name: "SEEDER AND MORSEL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 9, kind: "seeder", color: "red" },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 16, col: 1, kind: "morsel", color: "cyan" },
      { beat: 21, col: 7, color: "red" },
      { beat: 25, col: 6, kind: "seeder", color: "red" },
      { beat: 31, col: 10, color: "red" },
      { beat: 36, col: 5, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "theSeederRecall",
    name: "SEEDER REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 7, kind: "seeder", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 18, col: 9, kind: "shell", color: "cyan" },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 29, col: 8, kind: "seeder", color: "red" },
      { beat: 37, col: 1, color: "cyan" },
    ],
  },
  {
    id: "theSeederPeak",
    name: "SEEDER THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 4, col: 7, kind: "seeder", color: "red" },
      { beat: 7, col: 0, color: "red" },
      { beat: 15, col: 8, kind: "morsel", color: "red" },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 24, col: 0, kind: "seeder", color: "red" },
      { beat: 28, col: 1, kind: "strand", color: "red", beads: 5 },
      { beat: 34, col: 1, color: "red" },
      { beat: 34, col: 9, color: "red" },
      { beat: 40, col: 2, kind: "seeder", color: "red" },
      { beat: 44, col: 4, kind: "morsel", color: "cyan" },
      { beat: 48, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerMirrorBreathe",
    name: "MIRROR DREAM",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 8, col: 9, kind: "blister", color: null, row: 3 },
      { beat: 16, col: 8, color: "red" },
      { beat: 22, col: 2, kind: "morsel", color: "red" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 36, col: 9, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerMirrorRecall",
    name: "MIRROR HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 11, col: 0, color: "red" },
      { beat: 18, col: 10, kind: "rind", color: "red" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 29, col: 2, kind: "throb", color: "red" },
      { beat: 35, col: 10, color: "cyan" },
    ],
    pods: [{ beat: 5, col: 8, row: 4, kind: "husk" }],
  },
  {
    id: "fillerMirrorBend",
    name: "MIRROR ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 3, kind: "meteor", color: null },
      { beat: 6, col: 7, kind: "meteor", color: null },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 7, color: "red" },
      { beat: 22, col: 9, kind: "dart", color: "cyan" },
      { beat: 27, col: 6, color: "cyan" },
      { beat: 32, col: 0, kind: "morsel", color: "cyan" },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 43, col: 6, kind: "meteor", color: null },
    ],
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
  {
    id: "theCrossing",
    name: "THE CROSSING",
    guide: {
      scene: "theCrossing",
    },
    entries: [
      { beat: 0, col: 3, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 8, col: 5, color: "red" },
      { beat: 16, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 32, col: 3, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 40, col: 4, color: "red" },
      { beat: 48, col: 8, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 56, col: 3, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theCrossingPair",
    name: "CROSSING AND SEEDER",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 1, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 14, col: 3, kind: "seeder", color: "red" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 25, col: 7, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 34, col: 9, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "theCrossingRecall",
    name: "OLD CROSSING SONG",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 0, kind: "rind", color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 29, col: 3, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 34, col: 1, color: "red" },
    ],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 3, col: 4, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 3, col: 7, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 11, col: 3, color: "red" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 19, col: 10, kind: "seeder", color: "red" },
      { beat: 24, col: 4, color: "cyan" },
      { beat: 28, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 36, col: 0, kind: "meteor", color: null },
      { beat: 40, col: 3, kind: "meteor", color: null, cross: -1, row: 6 },
      { beat: 45, col: 2, color: "red" },
      { beat: 45, col: 8, color: "red" },
    ],
  },
];
