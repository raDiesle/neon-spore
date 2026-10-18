import type { Wave } from "../wave-types.js";

/**
 * Waves 159 to 169 of the game, in the order they are played: the boss THE
 * GEODE, THE SEEDER's block, the filler before THE MIRROR and the boss THE
 * MIRROR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_6: Wave[] = [
  {
    id: "theGeode",
    name: "THE GEODE",
    guide: {
      both: "A stone falls on the ship, and only the lance cuts it. Burn each crack with a beam in its colour. Each cut breaks a piece in two.",
      p1: "Only you see each crack's colour: say it. Slide the cannon under the crack named, and keep still.",
      p2: "Only you see where each crack is: say where. Hold the colour you hear until the beam goes.",
    },
    entries: [],
    boss: {
      kind: "geode",
      steps: [
        { beats: 20, cracks: [{ at: 2, color: "red" }] },
        {
          beats: 24,
          cracks: [
            { at: -3, color: "cyan" },
            { at: 3, color: "red" },
          ],
        },
        {
          beats: 28,
          cracks: [
            { at: -4, color: "red" },
            { at: 0, color: "cyan" },
            { at: 0, color: "cyan" },
            { at: 4, color: "red" },
          ],
        },
        {
          beats: 22,
          cracks: [
            { at: -1, color: "red" },
            { at: -1, color: "cyan" },
          ],
        },
      ],
    },
    bossType: "normal",
  },
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
  },
  {
    id: "theSeederReach",
    name: "SEEDER VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "seeder", color: "cyan" },
      { beat: 6, col: 6, kind: "seeder", color: "red" },
      { beat: 11, col: 1, kind: "seeder", color: "cyan" },
      { beat: 16, col: 5, kind: "seeder", color: "red" },
      { beat: 21, col: 1, kind: "seeder", color: "red" },
      { beat: 26, col: 7, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "theSeederPair",
    name: "SEEDER AND MORSEL",
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
  },
  {
    id: "theSeederRecall",
    name: "SEEDER REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 1, kind: "seeder", color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 3, kind: "seeder", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 39, col: 5, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "theSeederPeak",
    name: "SEEDER THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 3, kind: "seeder", color: "cyan" },
      { beat: 9, col: 6, color: "cyan" },
      { beat: 12, col: 4, kind: "morsel", color: "red" },
      { beat: 15, col: 3, color: "cyan" },
      { beat: 15, col: 7, color: "cyan" },
      { beat: 20, col: 9, kind: "countdown", color: "red" },
      { beat: 24, col: 8, kind: "seeder", color: "cyan" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 33, col: 4, kind: "morsel", color: "red" },
      { beat: 37, col: 1, kind: "countdown", color: "red" },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
      { beat: 47, col: 1, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerMirrorBreathe",
    name: "SEEDER DREAM",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 6, kind: "seeder", color: "cyan" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 18, col: 6, kind: "seeder", color: "red" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 32, col: 1, kind: "seeder", color: "red" },
      { beat: 39, col: 4, color: "cyan" },
    ],
  },
  {
    id: "fillerMirrorRecall",
    name: "SEEDER HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 8, kind: "seeder", color: "red" },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 15, col: 4, kind: "seeder", color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 2, kind: "seeder", color: "red" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 38, col: 3, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerMirrorBend",
    name: "SEEDER ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 5, kind: "seeder", color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 9, kind: "morsel", color: "red" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 28, col: 5, kind: "seeder", color: "red" },
      { beat: 34, col: 6, kind: "morsel", color: "red" },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 45, col: 7, kind: "seeder", color: "red" },
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
];
