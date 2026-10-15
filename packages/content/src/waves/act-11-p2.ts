import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-11.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_11_P2: Wave[] = [
  {
    id: "theLedger",
    name: "THE LEDGER",
    guide: {
      scene: "theLedger",
    },
    entries: [
      { beat: 18, col: 2, kind: "meteor", color: null },
      { beat: 26, col: 8, color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 44, col: 0, kind: "meteor", color: null },
      { beat: 52, col: 10, color: "red" },
      { beat: 62, col: 3, color: "cyan" },
      { beat: 72, col: 7, kind: "meteor", color: null },
      { beat: 82, col: 8, color: "cyan" },
    ],
    boss: { kind: "ledger" },
    bossType: "normal",
  },
  {
    id: "theSurge",
    name: "THE SURGE",
    guide: {
      scene: "theSurge",
    },
    entries: [
      { beat: 14, col: 2, kind: "meteor", color: null },
      { beat: 22, col: 8, color: "red" },
      { beat: 30, col: 5, kind: "meteor", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 7, kind: "meteor", color: null },
      { beat: 58, col: 10, color: "red" },
      { beat: 66, col: 3, color: "cyan" },
      { beat: 76, col: 5, kind: "meteor", color: null },
    ],
    boss: { kind: "surge" },
    bossType: "normal",
  },
  {
    id: "theLead",
    name: "THE LEAD",
    guide: {
      scene: "theLead",
    },
    entries: [
      { beat: 10, col: 3, kind: "meteor", color: null },
      { beat: 18, col: 0, color: "red" },
      { beat: 26, col: 7, kind: "meteor", color: null },
      { beat: 36, col: 10, color: "cyan" },
      { beat: 46, col: 2, kind: "meteor", color: null },
      { beat: 58, col: 0, color: "cyan" },
      { beat: 70, col: 8, kind: "meteor", color: null },
      { beat: 84, col: 10, color: "red" },
    ],
    boss: { kind: "lead" },
    bossType: "normal",
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    guide: {
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    guide: {
      scene: "theAntiphon",
    },
    entries: [],
    boss: { kind: "antiphon" },
    bossType: "normal",
  },
  {
    id: "theHive",
    name: "THE HIVE",
    guide: {
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
];
