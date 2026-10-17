import type { Wave } from "../wave-types.js";

/**
 * Waves 294 to 303 of the game, in the order they are played: THE MOULT's
 * block, the filler before THE CHRYSALIS and the boss THE CHRYSALIS.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_25: Wave[] = [
  {
    id: "theMoult",
    name: "THE MOULT",
    guide: {
      scene: "theMoult",
    },
    entries: [
      { beat: 0, col: 0, kind: "meteor", color: null },
      { beat: 4, col: 5, kind: "moult", color: null },
      { beat: 9, col: 8, kind: "moult", color: null },
      { beat: 18, col: 3, kind: "moult", color: null },
      { beat: 19, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultAgain",
    name: "FIRST MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "moult", color: null },
      { beat: 8, col: 0, kind: "moult", color: null },
      { beat: 15, col: 10, kind: "moult", color: null },
      { beat: 23, col: 8, kind: "moult", color: null },
      { beat: 30, col: 1, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultReach",
    name: "MOULT WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "moult", color: null },
      { beat: 6, col: 5, kind: "balloon", color: null },
      { beat: 12, col: 9, kind: "fence", color: null },
      { beat: 18, col: 2, kind: "moult", color: null },
      { beat: 23, col: 6, kind: "balloon", color: null },
      { beat: 28, col: 2, kind: "fence", color: null },
    ],
  },
  {
    id: "theMoultPair",
    name: "MOULT TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 10, kind: "moult", color: null },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 18, col: 9, kind: "balloon", color: null },
      { beat: 26, col: 10, color: "red" },
      { beat: 32, col: 4, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 38, col: 1, color: "cyan" },
    ],
  },
  {
    id: "theMoultRecall",
    name: "ANCIENT MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 3, kind: "moult", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 17, col: 10, kind: "veer", color: null },
      { beat: 23, col: 0, color: "red" },
      { beat: 31, col: 9, kind: "moult", color: null },
      { beat: 36, col: 3, color: "cyan" },
    ],
  },
  {
    id: "theMoultPeak",
    name: "MOULT THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 9, kind: "moult", color: null },
      { beat: 10, col: 3, color: "red" },
      { beat: 18, col: 10, kind: "balloon", color: null },
      { beat: 21, col: 1, color: "red" },
      { beat: 21, col: 9, color: "red" },
      { beat: 27, col: 2, kind: "countdown", color: "cyan" },
      { beat: 31, col: 6, kind: "moult", color: null },
      { beat: 35, col: 1, color: "cyan" },
      { beat: 35, col: 9, color: "cyan" },
      { beat: 42, col: 0, kind: "balloon", color: null },
      { beat: 47, col: 5, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "fillerChrysalisBreathe",
    name: "MOULT PICNIC",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 1, kind: "moult", color: null },
      { beat: 12, col: 8, color: "red" },
      { beat: 19, col: 10, kind: "balloon", color: null },
      { beat: 26, col: 6, color: "red" },
      { beat: 33, col: 10, kind: "moult", color: null },
    ],
  },
  {
    id: "fillerChrysalisRecall",
    name: "MOULT SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 7, kind: "moult", color: null },
      { beat: 10, col: 4, color: "red" },
      { beat: 15, col: 2, kind: "rind", color: "cyan" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 26, col: 7, kind: "moult", color: null },
      { beat: 31, col: 8, kind: "rind", color: "cyan" },
      { beat: 36, col: 1, color: "cyan" },
      { beat: 36, col: 9, color: "cyan" },
    ],
  },
  {
    id: "fillerChrysalisBend",
    name: "MOULT RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 10, kind: "moult", color: null },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 7, kind: "balloon", color: null },
      { beat: 22, col: 10, kind: "moult", color: null },
      { beat: 29, col: 1, color: "cyan" },
      { beat: 29, col: 9, color: "cyan" },
      { beat: 35, col: 10, kind: "balloon", color: null },
      { beat: 43, col: 0, kind: "moult", color: null },
    ],
  },
  {
    id: "theChrysalis",
    name: "THE CHRYSALIS",
    entries: [],
    boss: {
      kind: "chrysalis",
      steps: [
        { skin: "slime", rubs: 6, beats: 32 },
        { skin: "slime", rubs: 10, beats: 40 },
        { skin: "quills", beats: 36 },
        { skin: "quills", tracks: ["sweep", "sweep", "snake", "climb"], beats: 48 },
        { skin: "sacs", offsets: [-2, 1, 0, 2], beats: 40 },
        { skin: "sacs", offsets: [1, -1, 2, -2, 0], beats: 48 },
        { skin: "heart", offsets: [-1, 2, 0], colors: ["red", "cyan", "red"], beats: 32 },
        {
          skin: "heart",
          offsets: [2, -2, 1, -1],
          colors: ["cyan", "red", "red", "cyan"],
          beats: 40,
        },
      ],
    },
    bossType: "normal",
    controls: "standard5",
  },
];
