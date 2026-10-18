import type { Wave } from "../wave-types.js";

/**
 * Waves 292 to 301 of the game, in the order they are played: THE MOULT's
 * block, the filler before THE CHRYSALIS and the boss THE CHRYSALIS.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_19: Wave[] = [
  {
    id: "theMoult",
    name: "THE MOULT",
    guide: {
      scene: "theMoult",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 4, col: 5, kind: "moult", color: null },
      { beat: 9, col: 7, kind: "moult", color: null },
      { beat: 18, col: 4, kind: "moult", color: null },
      { beat: 19, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultAgain",
    name: "FIRST MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "moult", color: null },
      { beat: 8, col: 8, kind: "moult", color: null },
      { beat: 14, col: 2, kind: "moult", color: null },
      { beat: 20, col: 8, kind: "moult", color: null },
      { beat: 27, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultReach",
    name: "FAR MOULT",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "moult", color: null },
      { beat: 5, col: 5, kind: "balloon", color: null },
      { beat: 10, col: 1, kind: "moult", color: null },
      { beat: 16, col: 5, kind: "balloon", color: null },
      { beat: 21, col: 10, kind: "moult", color: null },
      { beat: 27, col: 6, kind: "balloon", color: null },
    ],
  },
  {
    id: "theMoultPair",
    name: "MOULT WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 9, kind: "moult", color: null },
      { beat: 12, col: 8, color: "red" },
      { beat: 17, col: 9, kind: "balloon", color: null },
      { beat: 23, col: 1, color: "cyan" },
      { beat: 29, col: 9, kind: "recoil", color: "cyan" },
      { beat: 35, col: 2, color: "cyan" },
    ],
  },
  {
    id: "theMoultRecall",
    name: "MOULT RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 4, kind: "moult", color: null },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 7, kind: "wisp", color: null },
      { beat: 23, col: 0, color: "red" },
      { beat: 30, col: 10, kind: "moult", color: null },
      { beat: 36, col: 2, color: "cyan" },
    ],
  },
  {
    id: "theMoultPeak",
    name: "MOULT ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 2, kind: "moult", color: null },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 16, col: 1, kind: "balloon", color: null },
      { beat: 20, col: 4, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 25, col: 10, kind: "countdown", color: "red" },
      { beat: 31, col: 2, kind: "moult", color: null },
      { beat: 35, col: 5, color: "cyan" },
      { beat: 35, col: 8, color: "cyan" },
      { beat: 39, col: 6, kind: "balloon", color: null },
      { beat: 42, col: 7, kind: "countdown", color: "cyan" },
      { beat: 47, col: 2, color: "red" },
      { beat: 47, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerChrysalisBreathe",
    name: "MOULT PICNIC",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 8, kind: "moult", color: null },
      { beat: 15, col: 6, color: "cyan" },
      { beat: 22, col: 9, kind: "balloon", color: null },
      { beat: 29, col: 6, color: "cyan" },
      { beat: 37, col: 2, kind: "veil", color: null },
    ],
  },
  {
    id: "fillerChrysalisRecall",
    name: "MOULT SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "moult", color: null },
      { beat: 13, col: 7, color: "cyan" },
      { beat: 19, col: 0, kind: "dart", color: "red" },
      { beat: 24, col: 4, color: "red" },
      { beat: 29, col: 2, kind: "moult", color: null },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 40, col: 4, kind: "dart", color: "cyan" },
    ],
  },
  {
    id: "fillerChrysalisBend",
    name: "MOULT RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 1, kind: "moult", color: null },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 6, kind: "balloon", color: null },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 29, col: 9, kind: "moult", color: null },
      { beat: 35, col: 7, kind: "balloon", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 46, col: 3, kind: "moult", color: null },
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
