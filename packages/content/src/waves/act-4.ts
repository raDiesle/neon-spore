import { INSTAR_SCRIPT } from "../instar-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 133 to 140 of the game, in the order they are played: THE MORSEL's
 * block, the filler before THE INSTAR and the boss THE INSTAR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_4: Wave[] = [
  {
    id: "theMorsel",
    name: "THE MORSEL",
    guide: {
      scene: "theMorsel",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 5, kind: "morsel", color: "red" },
      { beat: 18, col: 7, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPair",
    name: "MORSEL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 9, kind: "morsel", color: "red" },
      { beat: 10, col: 6, color: "cyan" },
      { beat: 20, col: 0, color: "cyan" },
      { beat: 25, col: 1, kind: "morsel", color: "cyan" },
      { beat: 32, col: 10, color: "red" },
    ],
    pods: [{ beat: 15, col: 5, row: 4, kind: "husk" }],
    controls: "standard5",
  },
  {
    id: "theMorselRecall",
    name: "MORSEL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 0, kind: "morsel", color: "cyan" },
      { beat: 13, col: 10, color: "cyan" },
      { beat: 19, col: 7, kind: "shell", color: "red" },
      { beat: 25, col: 8, color: "cyan" },
      { beat: 30, col: 10, kind: "morsel", color: "red" },
      { beat: 37, col: 0, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPeak",
    name: "MORSEL THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 3, col: 7, kind: "morsel", color: "red" },
      { beat: 11, col: 2, color: "red" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 24, col: 6, kind: "morsel", color: "cyan" },
      { beat: 28, col: 2, kind: "meteor", color: null },
      { beat: 31, col: 3, color: "cyan" },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 35, col: 6, kind: "morsel", color: "cyan" },
      { beat: 46, col: 0, color: "cyan" },
      { beat: 46, col: 10, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 9, row: 4, kind: "husk" },
      { beat: 39, col: 9, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarBreathe",
    name: "SOFT INSTAR",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 7, col: 7, kind: "blister", color: null, row: 3 },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 20, col: 5, kind: "torch", color: null },
      { beat: 26, col: 6, color: "red" },
      { beat: 34, col: 4, kind: "strand", color: "cyan", beads: 3 },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarRecall",
    name: "INSTAR RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 1, kind: "meteor", color: null },
      { beat: 12, col: 2, color: "red" },
      { beat: 18, col: 8, kind: "shell", color: "red" },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 29, col: 6, kind: "countdown", color: "cyan" },
      { beat: 35, col: 1, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarBend",
    name: "INSTAR SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 5, kind: "countdown", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 23, col: 0, color: "red" },
      { beat: 23, col: 10, color: "red" },
      { beat: 28, col: 10, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 36, col: 5, kind: "countdown", color: "cyan" },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
    ],
    pods: [{ beat: 17, col: 2, row: 3, kind: "pod" }],
    controls: "standard5",
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
