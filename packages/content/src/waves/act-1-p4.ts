import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p3.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P4: Wave[] = [
  {
    id: "theMagnetRecall",
    name: "MAGNET LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 5, kind: "magnet", color: "red" },
      { beat: 15, col: 0, color: "red" },
      { beat: 22, col: 7, kind: "magnet", color: "cyan" },
      { beat: 30, col: 6, color: "red" },
      { beat: 37, col: 9, kind: "magnet", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theThrob",
    name: "THE THROB",
    guide: {
      scene: "theThrob",
    },
    entries: [{ beat: 0, col: 5, kind: "throb", color: "red" }],
    controls: "standard2",
  },
  {
    id: "theThrobRecall",
    name: "THROB RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 7, col: 6, kind: "throb", color: "red" },
      { beat: 15, col: 2, color: "red" },
      { beat: 23, col: 9, kind: "throb", color: "red" },
      { beat: 30, col: 2, color: "red" },
      { beat: 37, col: 0, kind: "throb", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theRecoil",
    name: "THE RECOIL",
    guide: {
      scene: "theRecoil",
    },
    entries: [
      { beat: 0, col: 5, kind: "recoil", color: "red" },
      { beat: 14, col: 3, kind: "recoil", color: "cyan" },
      { beat: 24, col: 1, kind: "recoil", color: "red" },
      { beat: 32, col: 9, kind: "recoil", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theRecoilRecall",
    name: "OLD RECOIL SONG",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 7, col: 2, kind: "recoil", color: "cyan" },
      { beat: 14, col: 6, color: "red" },
      { beat: 22, col: 1, kind: "shell", color: "cyan" },
      { beat: 30, col: 10, color: "red" },
      { beat: 37, col: 4, kind: "recoil", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theGyre",
    name: "THE GYRE",
    guide: {
      scene: "theGyre",
    },
    entries: [{ beat: 0, col: 5, kind: "gyre", color: null }],
    controls: "standard2",
  },
  {
    id: "theGyreRecall",
    name: "GYRE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 3, kind: "gyre", color: null },
      { beat: 15, col: 2, color: "red" },
      { beat: 23, col: 10, kind: "shell", color: "cyan" },
      { beat: 30, col: 3, color: "red" },
      { beat: 37, col: 7, kind: "gyre", color: null },
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
];
