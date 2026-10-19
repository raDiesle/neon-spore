import { INSTAR_SCRIPT } from "../instar-script.js";
import { SWINDLE_SCRIPT } from "../swindle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 64 to 75 of the game, in the order they are played: THE HUSK's block,
 * the boss THE SWINDLE, THE MORSEL's block, the boss THE INSTAR, THE LANCE's
 * block, the boss THE GEODE, THE SEEDER's block and the boss THE MIRROR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_3: Wave[] = [
  {
    id: "theHusk",
    name: "THE HUSK",
    hints: "theHusk",
    entries: [
      { beat: 3, col: 4, color: "red" },
      { beat: 11, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 4, row: 3, kind: "pod" },
      { beat: 0, col: 5, row: 4, kind: "husk" },
      { beat: 6, col: 6, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "theNeighbour",
    name: "THE NEIGHBOUR",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 24, col: 5, color: "red" },
    ],
    pods: [
      { beat: 2, col: 3, row: 3, kind: "pod", due: 24 },
      { beat: 2, col: 4, row: 5, kind: "husk", due: 24 },
      { beat: 16, col: 7, row: 5, kind: "pod", due: 24 },
      { beat: 16, col: 6, row: 3, kind: "husk", due: 24 },
    ],
    controls: "standard5",
  },
  {
    id: "theSwindle",
    name: "THE SWINDLE",
    guide: {
      both: "A slime hangs real pods and fake ones, and swaps them round. Swallow every real pod she lets go, and none of the fake ones.",
      p1: "1. Open the maw when your partner says real.\n2. Keep it shut when your partner says fake.",
      p2: "1. Watch the fake pods while she swaps them.\n2. Say real or fake as each one falls.",
    },
    entries: [],
    boss: { kind: "swindle", steps: SWINDLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theMorsel",
    name: "THE MORSEL",
    hints: "theMorsel",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 5, kind: "morsel", color: "red" },
      { beat: 18, col: 7, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselRecall",
    name: "MORSEL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 4, kind: "morsel", color: "red" },
      { beat: 12, col: 2, color: "red" },
      { beat: 18, col: 6, kind: "torch", color: null },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 28, col: 4, kind: "morsel", color: "cyan" },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 2, kind: "blister", color: null, row: 3 },
      { beat: 45, col: 5, color: "red" },
    ],
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
  {
    id: "theLance",
    name: "THE LANCE",
    hints: "theLance",
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 24, col: 8, color: "red" },
      { beat: 32, col: 8, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
  },
  {
    id: "theTwins",
    name: "THE TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 10, col: 1, color: "red" },
      { beat: 22, col: 8, color: "red" },
    ],
    pods: [
      { beat: 2, col: 2, row: 3, kind: "pod", due: 20 },
      { beat: 2, col: 5, row: 4, kind: "pod", due: 20 },
      { beat: 16, col: 6, row: 3, kind: "pod", due: 20 },
      { beat: 16, col: 9, row: 4, kind: "pod", due: 20 },
    ],
  },
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
    hints: "theSeeder",
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 2, kind: "seeder", color: "red" },
      { beat: 16, col: 7, kind: "seeder", color: "cyan" },
      { beat: 24, col: 4, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theSeederRecall",
    name: "SEEDER REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 0, kind: "seeder", color: "red" },
      { beat: 14, col: 1, color: "cyan" },
      { beat: 20, col: 8, kind: "torch", color: null },
      { beat: 25, col: 5, color: "red" },
      { beat: 31, col: 4, kind: "seeder", color: "red" },
      { beat: 37, col: 2, color: "red" },
      { beat: 42, col: 3, kind: "meteor", color: null },
      { beat: 47, col: 7, color: "cyan" },
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
