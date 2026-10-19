import { MANTLE_SCRIPT } from "../mantle-script.js";
import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 178 to 189 of the game, in the order they are played: the boss THE
 * SPOOL, THE VEER's review, the boss THE HASP, reviewMeteorMedium's review, the
 * boss THE FLUE, reviewBlisterBoth's review, the boss THE RATCHET, THE
 * BEATBOX's review, the boss THE NETTLE, reviewRockCross's review, the boss THE
 * MANTLE and THE SEEDER's review.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "theSpool",
    name: "THE SPOOL",
    guide: {
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
  {
    id: "reviewVeerRecall",
    name: "HASP SAGA",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 7, kind: "dart", color: "cyan" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 0, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 36, col: 3, kind: "dart", color: "red" },
      { beat: 42, col: 1, kind: "meteor", color: null },
      { beat: 42, col: 9, kind: "meteor", color: null },
      { beat: 47, col: 3, color: "cyan" },
      { beat: 47, col: 7, color: "cyan" },
    ],
  },
  {
    id: "theHasp",
    name: "THE HASP",
    guide: {
      scene: "theHasp",
    },
    entries: [],
    boss: { kind: "hasp" },
    bossType: "normal",
  },
  {
    id: "reviewMeteorMediumRecall",
    name: "FLUE RELIC",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 0, kind: "lure", color: "red" },
      { beat: 21, col: 2, kind: "throb", color: "red" },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 38, col: 4, kind: "lure", color: "cyan" },
      { beat: 43, col: 1, color: "cyan" },
      { beat: 43, col: 9, color: "cyan" },
      { beat: 48, col: 1, kind: "throb", color: "red" },
    ],
    pods: [
      { beat: 6, col: 10, row: 4, kind: "husk" },
      { beat: 32, col: 7, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theFlue",
    name: "THE FLUE",
    guide: {
      scene: "theFlue",
    },
    entries: [],
    boss: {
      kind: "flue",
      levels: [
        { weapon: "bolt", color: "red", speedMilli: 1000, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "right",
          needs: 1,
        },
        { weapon: "bolt", color: "red", speedMilli: 1500, slowMilli: 1000, from: "left", needs: 1 },
        {
          weapon: "beam",
          color: "cyan",
          speedMilli: 1000,
          slowMilli: 1000,
          from: "left",
          needs: 1,
        },
        {
          weapon: "bolt",
          color: "cyan",
          speedMilli: 1500,
          slowMilli: 1000,
          from: "left",
          needs: 2,
        },
        { weapon: "beam", color: "red", speedMilli: 1500, slowMilli: 500, from: "right", needs: 1 },
        { weapon: "bolt", color: "red", speedMilli: 2250, slowMilli: 750, from: "right", needs: 1 },
        { weapon: "beam", color: "cyan", speedMilli: 2000, slowMilli: 500, from: "left", needs: 1 },
        { weapon: "bolt", color: "cyan", speedMilli: 3000, slowMilli: 500, from: "left", needs: 2 },
        { weapon: "bolt", color: "red", speedMilli: 3600, slowMilli: 250, from: "right", needs: 1 },
        { weapon: "beam", color: "red", speedMilli: 2250, slowMilli: 250, from: "left", needs: 2 },
      ],
    },
    bossType: "normal",
    controls: "shots",
  },
  {
    id: "reviewBlisterBothRecall",
    name: "ANCIENT RATCHET",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 2, kind: "lure", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 5, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 23, col: 4, kind: "echo", color: "cyan" },
      { beat: 29, col: 1, color: "red" },
      { beat: 29, col: 9, color: "red" },
      { beat: 35, col: 8, kind: "lure", color: "cyan" },
      { beat: 41, col: 1, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 47, col: 1, color: "red" },
      { beat: 47, col: 9, color: "red" },
    ],
  },
  {
    id: "theRatchet",
    name: "THE RATCHET",
    guide: {
      scene: "theRatchet",
    },
    entries: [],
    boss: { kind: "ratchet" },
    bossType: "normal",
  },
  {
    id: "reviewBeatboxRecall",
    name: "NETTLE LEGEND",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 4, kind: "countdown", color: "cyan" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 15, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 21, col: 7, kind: "dart", color: "red" },
      { beat: 26, col: 4, color: "cyan" },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 32, col: 6, kind: "countdown", color: "red" },
      { beat: 37, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 43, col: 0, color: "red" },
      { beat: 43, col: 10, color: "red" },
    ],
  },
  {
    id: "theNettle",
    name: "THE NETTLE",
    guide: {
      both: "A jellyfish over the ship. Its rings say what to do. A hand is your thumb on it. SHOOT, SHIELD or SUCK is the panel, under the ring.",
      p1: "1. Pull, tap, turn or hold the rings on the left, and the shared ones.\n2. Move the cannon under SHOOT or SUCK. Hold SUCK yourself.\n3. When the shield is under SHIELD, press your shield button.",
      p2: "1. Pull, tap, turn or hold the rings on the right, and the shared ones.\n2. Fire when the cannon is under SHOOT.\n3. Move the shield under SHIELD, and say when.",
    },
    entries: [],
    boss: { kind: "nettle", steps: NETTLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "reviewRockCrossRecall",
    name: "MANTLE SAGA",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 9, kind: "blister", color: null, row: 3 },
      { beat: 11, col: 2, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 16, col: 5, kind: "echo", color: "red" },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 32, col: 6, kind: "blister", color: null, row: 3 },
      { beat: 37, col: 2, kind: "echo", color: "cyan" },
      { beat: 43, col: 1, color: "cyan" },
      { beat: 43, col: 9, color: "cyan" },
    ],
    pods: [{ beat: 22, col: 8, row: 4, kind: "husk" }],
  },
  {
    id: "theMantle",
    name: "THE MANTLE",
    guide: {
      both: "Two handles, one each. Pull both down together, hard enough, to open one of its four joints. Letting go costs the whole pull. Then tap the bare core, turn about.",
      p1: "1. Drag the left handle down and hold it with the other screen's pull.\n2. Both must pull hard enough at once, or nothing shears.\n3. Once the core is bare, tap it only when it is your turn.",
      p2: "1. Drag the right handle down and hold it with the other screen's pull.\n2. Letting go costs the whole pull. Start again together.\n3. A spark leaks partway through. Shoot it before it reaches the hull.",
    },
    entries: [],
    boss: { kind: "mantle", thresholds: MANTLE_SCRIPT },
    bossType: "normal",
  },
  {
    id: "reviewSeederRecall",
    name: "KEEL SAGA",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 0, kind: "meteor", color: null },
      { beat: 5, col: 10, kind: "meteor", color: null },
      { beat: 10, col: 3, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 15, col: 9, kind: "gyre", color: null },
      { beat: 21, col: 0, color: "red" },
      { beat: 21, col: 10, color: "red" },
      { beat: 29, col: 4, kind: "throb", color: "red" },
      { beat: 35, col: 2, kind: "meteor", color: null },
      { beat: 41, col: 2, color: "cyan" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 47, col: 0, kind: "gyre", color: null },
    ],
  },
];
