import type { Row } from "./boss-hurt-rows.js";

/**
 * **The blow's rows from THE CAPSTAN on** — the third page of
 * `boss-hurt-rows.ts`, cut on build order when `boss-hurt-rows-b.ts` reached
 * its length, and the page a new boss's row is added to.
 */
export const HURT_ROWS_C: Row[] = [
  {
    boss: "capstan",
    // A band worn bright, a hold made and the core hit; a reversal or a rock only works toward one.
    land: [
      { type: "capstanBright", side: 0, col: 3 },
      { type: "capstanKept", col: 3 },
      { type: "capstanHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "capstanLight", ask: "left", col: 3 },
      { type: "capstanRock", side: 0, col: 3 },
      { type: "capstanWear", side: 0, wear: 1, col: 3 },
      { type: "capstanStall", col: 3 },
    ],
    hurt: (fx) => fx.boss.capstan.hurt,
  },
  {
    boss: "gall",
    // A close landed and the root hit; a pinch come shut, a slip or a swell only works toward one.
    land: [
      { type: "gallClose", from: 0, to: 2, closes: 1, col: 3 },
      { type: "gallHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "gallLight", ask: "close", point: 0, col: 0 },
      { type: "gallPinch", point: 0, col: 0 },
      { type: "gallSlip", point: 0, col: 0 },
      { type: "gallSwell", point: 0, col: 0 },
    ],
    hurt: (fx) => fx.boss.gall.hurt,
  },
];
