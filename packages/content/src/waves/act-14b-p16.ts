import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p15.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P16: Wave[] = [
  {
    id: "theLatch",
    name: "THE LATCH",
    guide: {
      scene: "theLatch",
    },
    entries: [],
    boss: {
      kind: "latch",
      steps: [
        { ask: "haul", knots: 2, beats: 28 },
        { ask: "yank", knots: 2, beats: 32 },
        { ask: "cross", knots: 2, beats: 32 },
      ],
    },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "fiveBlisters",
    name: "FIVE BLISTERS",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 2, by: 2 },
      { beat: 10, col: 8, kind: "blister", color: null, row: 2, by: 1, gesture: "hold" },
      {
        beat: 20,
        col: 2,
        kind: "blister",
        color: null,
        row: 3,
        by: 2,
        gesture: "swipe",
        way: "left",
      },
      { beat: 30, col: 7, kind: "blister", color: null, row: 2, by: 1, gesture: "turn" },
      { beat: 40, col: 3, kind: "blister", color: null, row: 2, by: 2, gesture: "rub" },
      {
        beat: 41,
        col: 8,
        kind: "blister",
        color: null,
        row: 3,
        by: 1,
        gesture: "swipe",
        way: "up",
      },
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
