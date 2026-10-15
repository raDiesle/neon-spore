import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b-p13.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P14: Wave[] = [
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
];
