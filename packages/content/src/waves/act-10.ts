import type { Wave } from "../wave-types.js";

/**
 * Waves 202 to 210 of the game, in the order they are played: the boss THE
 * LAMPREY, HEAVY ROCKS's block, the filler before THE HIVE and the boss THE
 * HIVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theLamprey",
    name: "THE LAMPREY",
    guide: {
      both: "It goes for the ship: pull it back. One of you holds the tail. The other pulls the head or taps the lit tooth. Shield its dung. Shoot the gullet.",
      p1: "1. It goes for the ship: pull the tail out and keep it there.\n2. Second bite: tap the lit tooth until it breaks.\n3. When it drops dung, raise the shield.\n4. In the ship: press SUCK in. Then pull the tail when told.",
      p2: "1. It goes for the ship: pull the head back. When it gets angry, pull again.\n2. Second bite: hold the tail.\n3. When it drops dung, carry the shield under it.\n4. In the ship: pull the tail once SUCK is in. Then press RED.",
    },
    entries: [],
    boss: {
      kind: "lamprey",
      meal: [
        { kind: "meteor", col: 3, row: 4, beat: 0, tiles: 1 },
        { kind: "slick", col: 8, row: 8, beat: 2, tiles: 2 },
        { kind: "bulb", col: 2, row: 3, beat: 7, tiles: 3 },
        { kind: "meteor", col: 6, row: 6, beat: 9, tiles: 2 },
      ],
      steps: [
        { ask: "tow", holder: 1, teeth: 0, jump: 1, beats: 16, color: "either" },
        { ask: "teeth", holder: 2, teeth: 1, jump: 2, beats: 16, color: "either", taps: 3 },
        { ask: "gullet", holder: 1, teeth: 0, jump: 3, beats: 12, color: "red" },
        {
          ask: "apart",
          holder: 1,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          crawl: true,
          food: "slick",
          dung: true,
        },
        { ask: "teeth", holder: 1, teeth: 1, jump: 2, beats: 16, color: "either", taps: 3 },
        { ask: "pull", holder: 2, teeth: 0, jump: 3, beats: 12, color: "either" },
        { ask: "gullet", holder: 1, teeth: 0, jump: 4, beats: 12, color: "cyan" },
        {
          ask: "pull",
          holder: 1,
          teeth: 0,
          jump: 2,
          beats: 12,
          color: "either",
          crawl: true,
          food: "bulb",
          dung: true,
        },
        { ask: "teeth", holder: 2, teeth: 1, jump: 3, beats: 18, color: "either", taps: 4 },
        { ask: "apart", holder: 2, teeth: 0, jump: 4, beats: 14, color: "either" },
        { ask: "teeth", holder: 1, teeth: 1, jump: 5, beats: 18, color: "either", taps: 4 },
        { ask: "gullet", holder: 1, teeth: 0, jump: 6, beats: 12, color: "either" },
        {
          ask: "plug",
          holder: 2,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          crawl: true,
          food: "meteor",
          button: "intake",
        },
        {
          ask: "plug",
          holder: 1,
          teeth: 0,
          jump: 1,
          beats: 14,
          color: "either",
          button: "fireRed",
        },
        { ask: "gullet", holder: 1, teeth: 0, jump: 3, beats: 12, color: "cyan" },
      ],
    },
    bossType: "normal",
  },
  {
    id: "theWard",
    name: "HEAVY ROCKS",
    guide: {
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 7, kind: "meteorFast", color: null },
      { beat: 24, col: 3, kind: "meteorFaster", color: null },
      { beat: 32, col: 9, kind: "meteorFastest", color: null },
    ],
  },
  {
    id: "theWardAgain",
    name: "HEAVY ROCK RISING",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "meteorMedium", color: null },
      { beat: 6, col: 3, kind: "meteorMedium", color: null },
      { beat: 12, col: 6, kind: "meteorMedium", color: null },
      { beat: 19, col: 7, kind: "meteorMedium", color: null },
      { beat: 25, col: 3, kind: "meteorMedium", color: null },
      { beat: 31, col: 7, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardReach",
    name: "LONG HEAVY ROCK ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "meteorMedium", color: null },
      { beat: 5, col: 2, color: "cyan" },
      { beat: 13, col: 6, kind: "meteorMedium", color: null },
      { beat: 19, col: 2, color: "cyan" },
      { beat: 25, col: 7, kind: "meteorMedium", color: null },
      { beat: 31, col: 3, color: "cyan" },
    ],
  },
  {
    id: "theWardPair",
    name: "HEAVY ROCK PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 6, kind: "meteorMedium", color: null },
      { beat: 8, col: 3, color: "red" },
      { beat: 14, col: 10, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 18, col: 7, color: "cyan" },
      { beat: 23, col: 8, kind: "meteorMedium", color: null },
      { beat: 29, col: 6, color: "cyan" },
      { beat: 34, col: 5, kind: "strand", color: "cyan", beads: 3 },
    ],
  },
  {
    id: "fillerHiveBreathe",
    name: "HIVE LULLABY",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 8, col: 6, kind: "meteor", color: null },
      { beat: 15, col: 3, color: "red" },
      { beat: 21, col: 5, kind: "seeder", color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 4, kind: "beatbox", color: null, beats: 3 },
      { beat: 40, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerHiveRecall",
    name: "HIVE HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 4, kind: "throb", color: "red" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 28, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 33, col: 3, color: "cyan" },
      { beat: 39, col: 10, kind: "throb", color: "red" },
    ],
    pods: [{ beat: 16, col: 2, row: 3, kind: "pod" }],
  },
  {
    id: "fillerHiveBend",
    name: "HIVE MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 5, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 6, col: 8, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 16, col: 10, color: "red" },
      { beat: 22, col: 8, kind: "echo", color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 34, col: 5, kind: "meteor", color: null },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 1, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
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
