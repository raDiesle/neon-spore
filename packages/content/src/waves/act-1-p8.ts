import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p7.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P8: Wave[] = [
  {
    id: "turnBlisters",
    name: "TURN",
    guide: {
      scene: "turnBlisters",
    },
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 4, kind: "blister", color: null, row: 3, gesture: "turn", way: "ccw" },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 24, col: 4, kind: "blister", color: null, row: 3, gesture: "turn" },
      { beat: 32, col: 7, color: "cyan" },
      { beat: 40, col: 5, kind: "blister", color: null, row: 3, gesture: "turn", way: "ccw" },
      { beat: 48, col: 5, color: "cyan" },
      { beat: 56, col: 6, kind: "blister", color: null, row: 2, gesture: "turn" },
      { beat: 64, col: 6, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "turnBlistersRecall",
    name: "TURN SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 7, col: 3, kind: "blister", color: null, row: 3, gesture: "turn", way: "ccw" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 22, col: 10, kind: "shell", color: "red" },
      { beat: 29, col: 9, color: "red" },
      { beat: 36, col: 6, kind: "blister", color: null, row: 3, gesture: "turn", way: "ccw" },
    ],
    controls: "standard4",
  },
  {
    id: "rubBlisters",
    name: "RUB",
    guide: {
      scene: "rubBlisters",
    },
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 6, kind: "blister", color: null, row: 3, gesture: "rub" },
      { beat: 16, col: 4, color: "red" },
      { beat: 24, col: 7, kind: "blister", color: null, row: 3, gesture: "rub" },
      { beat: 32, col: 6, color: "red" },
      { beat: 40, col: 7, kind: "blister", color: null, row: 3, gesture: "rub" },
      { beat: 48, col: 5, color: "red" },
      { beat: 56, col: 7, kind: "blister", color: null, row: 3, gesture: "rub" },
      { beat: 64, col: 4, color: "red" },
    ],
    controls: "standard4",
  },
  {
    id: "rubBlistersRecall",
    name: "RUB SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 7, col: 8, kind: "blister", color: null, row: 3, gesture: "rub" },
      { beat: 15, col: 10, color: "cyan" },
      { beat: 22, col: 0, kind: "countdown", color: "red" },
      { beat: 29, col: 1, color: "red" },
      { beat: 36, col: 3, kind: "blister", color: null, row: 3, gesture: "rub" },
    ],
    controls: "standard4",
  },
  {
    id: "comboBlisters",
    name: "COMBO",
    guide: {
      scene: "comboBlisters",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 6, kind: "blister", color: null, row: 2, gesture: "combo" },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 24, col: 6, kind: "blister", color: null, row: 3, gesture: "combo" },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 40, col: 7, kind: "blister", color: null, row: 2, gesture: "combo" },
      { beat: 48, col: 5, color: "cyan" },
      { beat: 56, col: 6, kind: "blister", color: null, row: 2, gesture: "combo" },
      { beat: 64, col: 4, color: "cyan" },
    ],
    controls: "standard4",
  },
  {
    id: "comboBlistersRecall",
    name: "COMBO REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 7, col: 1, kind: "blister", color: null, row: 2, gesture: "combo" },
      { beat: 14, col: 0, color: "red" },
      { beat: 21, col: 4, kind: "countdown", color: "cyan" },
      { beat: 29, col: 7, color: "red" },
      { beat: 36, col: 0, kind: "blister", color: null, row: 3, gesture: "combo" },
    ],
    controls: "standard4",
  },
  {
    id: "leverBlisters",
    name: "LEVER",
    guide: {
      scene: "leverBlisters",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 4, kind: "blister", color: null, row: 2, gesture: "lever" },
      { beat: 16, col: 6, color: "cyan" },
      { beat: 24, col: 6, kind: "blister", color: null, row: 2, gesture: "lever" },
      { beat: 32, col: 5, color: "cyan" },
      { beat: 40, col: 4, kind: "blister", color: null, row: 3, gesture: "lever" },
      { beat: 48, col: 6, color: "cyan" },
      { beat: 56, col: 4, kind: "blister", color: null, row: 2, gesture: "lever" },
      { beat: 64, col: 4, color: "cyan" },
    ],
    controls: "standard4",
  },
];
