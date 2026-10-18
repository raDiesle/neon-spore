import type { Wave } from "../wave-types.js";

/**
 * Waves 416 to 425 of the game, in the order they are played: THE RECOIL's
 * block, the filler before THE WELL and the boss THE WELL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_34: Wave[] = [
  {
    id: "theRecoil",
    name: "THE RECOIL",
    guide: {
      scene: "theRecoil",
    },
    entries: [
      { beat: 0, col: 5, kind: "recoil", color: "red" },
      { beat: 14, col: 2, kind: "recoil", color: "cyan" },
      { beat: 24, col: 0, kind: "recoil", color: "red" },
      { beat: 28, col: 10, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theRecoilAgain",
    name: "RECOIL AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "recoil", color: "red" },
      { beat: 7, col: 6, kind: "lid", color: "red" },
      { beat: 14, col: 10, kind: "recoil", color: "cyan" },
      { beat: 21, col: 9, kind: "lid", color: "cyan" },
      { beat: 27, col: 3, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "theRecoilReach",
    name: "FAR RECOIL",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "recoil", color: "cyan" },
      { beat: 6, col: 4, kind: "lid", color: "cyan" },
      { beat: 11, col: 9, kind: "morsel", color: "cyan" },
      { beat: 16, col: 5, kind: "recoil", color: "red" },
      { beat: 22, col: 1, kind: "lid", color: "red" },
      { beat: 28, col: 9, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "theRecoilPair",
    name: "RECOIL MEETS LID",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 6, kind: "recoil", color: "cyan" },
      { beat: 9, col: 8, color: "red" },
      { beat: 15, col: 5, kind: "lid", color: "red" },
      { beat: 19, col: 3, color: "red" },
      { beat: 19, col: 7, color: "red" },
      { beat: 25, col: 5, kind: "coil", color: null },
      { beat: 30, col: 7, kind: "recoil", color: "cyan" },
      { beat: 35, col: 0, color: "red" },
      { beat: 35, col: 10, color: "red" },
    ],
  },
  {
    id: "theRecoilRecall",
    name: "OLD RECOIL SONG",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 4, kind: "recoil", color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 16, col: 10, kind: "dart", color: "red" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 30, col: 10, kind: "recoil", color: "red" },
      { beat: 35, col: 7, kind: "dart", color: "red" },
    ],
  },
  {
    id: "theRecoilPeak",
    name: "RECOIL STORM",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 9, kind: "recoil", color: "red" },
      { beat: 12, col: 3, color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 16, col: 8, kind: "lid", color: "cyan" },
      { beat: 20, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 25, col: 0, color: "red" },
      { beat: 25, col: 10, color: "red" },
      { beat: 32, col: 10, kind: "recoil", color: "red" },
      { beat: 39, col: 1, kind: "lid", color: "cyan" },
      { beat: 43, col: 3, color: "cyan" },
      { beat: 43, col: 7, color: "cyan" },
      { beat: 46, col: 5, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "fillerWellBreathe",
    name: "SOFT RECOIL",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 7, col: 9, kind: "recoil", color: "cyan" },
      { beat: 13, col: 5, color: "cyan" },
      { beat: 21, col: 0, kind: "lid", color: "red" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 35, col: 0, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerWellRecall",
    name: "RECOIL RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 4, kind: "recoil", color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 8, kind: "shell", color: "red" },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 7, kind: "recoil", color: "red" },
      { beat: 34, col: 6, kind: "shell", color: "cyan" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerWellBend",
    name: "RECOIL TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 4, kind: "recoil", color: "cyan" },
      { beat: 10, col: 3, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 16, col: 1, kind: "lid", color: "red" },
      { beat: 22, col: 8, kind: "recoil", color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 34, col: 0, kind: "lid", color: "cyan" },
      { beat: 39, col: 4, kind: "recoil", color: "red" },
      { beat: 44, col: 3, color: "red" },
      { beat: 44, col: 7, color: "red" },
    ],
  },
  {
    id: "theWell",
    name: "THE WELL",
    guide: {
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 38, col: 10, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 5, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
];
