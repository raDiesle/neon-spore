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
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 10, kind: "seeder", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 19, col: 10, kind: "throb", color: "red" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 29, col: 4, kind: "seeder", color: "red" },
      { beat: 35, col: 8, color: "red" },
    ],
  },
  {
    id: "theSeederPeak",
    name: "SEEDER THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 1, kind: "seeder", color: "red" },
      { beat: 11, col: 4, color: "red" },
      { beat: 15, col: 1, kind: "morsel", color: "red" },
      { beat: 18, col: 2, color: "red" },
      { beat: 18, col: 8, color: "red" },
      { beat: 23, col: 7, kind: "seeder", color: "cyan" },
      { beat: 33, col: 3, color: "red" },
      { beat: 33, col: 7, color: "red" },
      { beat: 37, col: 2, kind: "seeder", color: "red" },
      { beat: 45, col: 7, kind: "morsel", color: "red" },
    ],
    pods: [{ beat: 28, col: 1, row: 3, kind: "pod" }],
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
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "blister", color: null, row: 3 },
      { beat: 12, col: 6, color: "red" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 28, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 33, col: 7, color: "red" },
      { beat: 39, col: 0, kind: "blister", color: null, row: 2, gesture: "swipe" },
    ],
    pods: [{ beat: 18, col: 9, row: 3, kind: "pod" }],
  },
  {
    id: "fillerMirrorBend",
    name: "MIRROR ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 2, kind: "countdown", color: "red" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 17, col: 3, kind: "meteor", color: null },
      { beat: 23, col: 5, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 29, col: 1, kind: "rind", color: "red" },
      { beat: 35, col: 2, kind: "countdown", color: "red" },
      { beat: 41, col: 4, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 46, col: 7, kind: "meteor", color: null },
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
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 6, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 17, col: 0, kind: "throb", color: "red" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 30, col: 5, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 35, col: 9, color: "red" },
    ],
  },
  {
    id: "theCrossingPeak",
    name: "CROSSING ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 3, col: 1, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 3, col: 9, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 7, col: 6, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 1, kind: "seeder", color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 25, col: 7, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 28, col: 2, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 40, col: 0, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 45, col: 5, color: "cyan" },
      { beat: 45, col: 8, color: "cyan" },
      { beat: 48, col: 6, kind: "seeder", color: "red" },
    ],
    pods: [{ beat: 36, col: 3, row: 3, kind: "pod" }],
  },
];
