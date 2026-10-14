import { MAZE_ROUNDS } from "../maze-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Act two: the first six bosses, back to back, nothing else. `waves.ts` is
 * the barrel that concatenates this with the other acts — see it for why the
 * list was split by act in the first place.
 *
 * THE FLEET is the sixth and it arrived here rather than in act three, where
 * THE VANE sits among the mechanics: act three was full (`limits.test.ts`),
 * and this is the act whose whole content is bosses back to back. A seventh
 * that does not fit gets a fourth act beside act three, not a line in the
 * limits table.
 */
export const WAVES_ACT_2: Wave[] = [
  {
    id: "catchAndAim",
    name: "CATCH AND AIM",
    guide: {
      scene: "catchAndAim",
    },
    entries: [
      { beat: 4, col: 10, color: "cyan" },
      { beat: 9, col: 8, color: "red" },
      { beat: 15, col: 10, color: "red" },
    ],
    pods: [
      { beat: 0, col: 2, row: 3, kind: "ward" },
      { beat: 11, col: 0, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "catchAndAimAgain",
    name: "SHIELD HELD",
    variant: true,
    entries: [
      { beat: 6, col: 4, color: "cyan" },
      { beat: 14, col: 6, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 6, row: 4, kind: "ward" },
      { beat: 21, col: 5, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "catchAndAimReach",
    name: "HELD WIDE",
    variant: true,
    entries: [
      { beat: 5, col: 5, color: "cyan" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 9, row: 3, kind: "ward" },
      { beat: 16, col: 10, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "finale",
    name: "FINALE",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 10, color: "red" },
      { beat: 2, col: 5, kind: "meteor", color: null },
      { beat: 4, col: 3, color: "cyan" },
      { beat: 4, col: 7, color: "red" },
      { beat: 7, col: 2, kind: "meteor", color: null },
      { beat: 7, col: 8, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "bulbQueen",
    name: "BULB QUEEN",
    guide: {
      scene: "bulbQueen",
    },
    entries: [],
    pods: [{ beat: 2, col: 5, row: 4, kind: "purge" }],
    boss: { kind: "queen", col: 5, petals: 9 },
    bossType: "normal",
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
  {
    id: "theMaze",
    name: "THE MAZE",
    guide: {
      scene: "theMaze",
    },
    entries: [],
    boss: { kind: "maze", rounds: MAZE_ROUNDS },
    bossType: "special",
    controls: "standard5",
  },
  {
    id: "theGauge",
    name: "THE GAUGE",
    guide: {
      scene: "theGauge",
    },
    entries: [],
    boss: { kind: "gauge" },
    bossType: "special",
    controls: "gauge",
  },
];
