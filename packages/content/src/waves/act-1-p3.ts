import type { Wave } from "../wave-types.js";

/**
 * THE BLISTER's block, between TORCH's and THE BASTION: every gesture a
 * blister asks for, each its own head with its tutorial and three waves of
 * its own (`waves:controls --groups`), before the first big boss. The owner,
 * 16 October 2026: *before first boss to introduce by waves all the
 * "controls" brush enemy waves … after meteors do "controls" waves and then
 * boss of "the bastion".* HELLO BLISTER mixes them last, once each has been
 * taught on its own (the owner, 17 October 2026). On the arc's panel,
 * STANDARD 4; AUTO clears every wave on it. It plays after `act-1-p2.ts`
 * (`acts.ts`).
 */
export const WAVES_ACT_1_P3: Wave[] = [
  {
    id: "theGyreAgain",
    name: "HELLO GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "gyre", color: null },
      { beat: 8, col: 4, kind: "gyre", color: null },
      { beat: 14, col: 6, kind: "gyre", color: null },
      { beat: 20, col: 4, kind: "gyre", color: null },
      { beat: 27, col: 5, kind: "gyre", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theGyreReach",
    name: "OUTER GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 5, kind: "gyre", color: null },
      { beat: 11, col: 10, kind: "gyre", color: null },
      { beat: 17, col: 4, kind: "gyre", color: null },
      { beat: 22, col: 8, kind: "gyre", color: null },
      { beat: 28, col: 4, kind: "gyre", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theGyrePair",
    name: "GYRE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 8, kind: "gyre", color: null },
      { beat: 11, col: 9, color: "red" },
      { beat: 17, col: 7, kind: "magnet", color: "cyan" },
      { beat: 21, col: 8, color: "red" },
      { beat: 26, col: 3, kind: "gyre", color: null },
      { beat: 32, col: 7, color: "cyan" },
      { beat: 37, col: 2, kind: "magnet", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theLure",
    name: "THE LURE",
    guide: {
      scene: "theLure",
    },
    entries: [
      { beat: 0, col: 4, kind: "lure", color: "cyan" },
      { beat: 8, col: 7, color: "red" },
      { beat: 16, col: 5, kind: "lure", color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 32, col: 4, kind: "lure", color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theLureAgain",
    name: "LURE RISING",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "lure", color: "cyan" },
      { beat: 6, col: 5, kind: "lure", color: "red" },
      { beat: 14, col: 4, kind: "lure", color: "cyan" },
      { beat: 21, col: 6, kind: "lure", color: "red" },
      { beat: 27, col: 4, kind: "lure", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theLureReach",
    name: "OUTER LURE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "lure", color: "red" },
      { beat: 5, col: 6, kind: "lure", color: "cyan" },
      { beat: 11, col: 0, kind: "lure", color: "cyan" },
      { beat: 17, col: 5, kind: "lure", color: "cyan" },
      { beat: 22, col: 10, kind: "lure", color: "red" },
      { beat: 28, col: 6, kind: "lure", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theLurePair",
    name: "LURE AND GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 8, kind: "lure", color: "red" },
      { beat: 9, col: 9, color: "red" },
      { beat: 13, col: 6, kind: "gyre", color: null },
      { beat: 19, col: 5, color: "cyan" },
      { beat: 24, col: 0, kind: "lure", color: "cyan" },
      { beat: 30, col: 4, color: "cyan" },
      { beat: 34, col: 6, kind: "gyre", color: null },
    ],
    controls: "standard2",
  },
  {
    id: "theRind",
    name: "THE RIND",
    guide: {
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 5, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 18, col: 3, kind: "rind", color: "cyan" },
      { beat: 26, col: 8, kind: "rind", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theRindAgain",
    name: "FIRST RIND",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "rind", color: "cyan" },
      { beat: 7, col: 4, kind: "rind", color: "red" },
      { beat: 14, col: 6, kind: "rind", color: "red" },
      { beat: 22, col: 5, kind: "rind", color: "cyan" },
      { beat: 28, col: 6, kind: "rind", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theRindReach",
    name: "RIND HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "rind", color: "red" },
      { beat: 5, col: 5, kind: "rind", color: "red" },
      { beat: 10, col: 9, kind: "rind", color: "red" },
      { beat: 15, col: 3, kind: "rind", color: "cyan" },
      { beat: 20, col: 7, kind: "rind", color: "cyan" },
      { beat: 26, col: 0, kind: "rind", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theRindPair",
    name: "RIND MEETS LURE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 9, kind: "rind", color: "red" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 17, col: 9, kind: "lure", color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 29, col: 6, kind: "rind", color: "red" },
      { beat: 33, col: 4, color: "red" },
      { beat: 37, col: 8, kind: "lure", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theStrand",
    name: "THE STRAND",
    guide: {
      scene: "theStrand",
    },
    entries: [
      { beat: 0, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 36, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
    controls: "standard2",
  },
  {
    id: "theStrandAgain",
    name: "STRAND DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 7, col: 5, kind: "strand", color: "cyan", beads: 3 },
      { beat: 13, col: 6, kind: "strand", color: "red", beads: 2 },
      { beat: 21, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 28, col: 6, kind: "strand", color: "red", beads: 2 },
    ],
    controls: "standard2",
  },
  {
    id: "theStrandReach",
    name: "STRAND VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "strand", color: "red", beads: 5 },
      { beat: 5, col: 6, kind: "strand", color: "cyan", beads: 3 },
      { beat: 11, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 16, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 21, col: 3, kind: "strand", color: "red", beads: 2 },
      { beat: 27, col: 10, kind: "strand", color: "red", beads: 5 },
    ],
    controls: "standard2",
  },
  {
    id: "theStrandPair",
    name: "STRAND WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 9, kind: "strand", color: "red", beads: 5 },
      { beat: 10, col: 2, color: "red" },
      { beat: 15, col: 5, kind: "rind", color: "cyan" },
      { beat: 20, col: 9, color: "red" },
      { beat: 25, col: 6, kind: "strand", color: "red", beads: 5 },
      { beat: 30, col: 3, color: "cyan" },
      { beat: 35, col: 6, kind: "rind", color: "red" },
    ],
    controls: "standard2",
  },
];
