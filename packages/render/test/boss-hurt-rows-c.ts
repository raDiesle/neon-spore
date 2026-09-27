import type { Row } from "./boss-hurt-rows.js";

/**
 * **The blow's rows from THE CAPSTAN on** — the third page of
 * `boss-hurt-rows.ts`, cut on build order when `boss-hurt-rows-b.ts` reached
 * its length, and the page a new boss's row is added to.
 */
export const HURT_ROWS_C: Row[] = [
  {
    boss: "capstan",
    // A band worn bright, a hold made and the core hit; a rock only works toward one.
    land: [
      { type: "capstanBright", side: 0, col: 3 },
      { type: "capstanKept", col: 3 },
      { type: "capstanHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "capstanLight", ask: "left", col: 3 },
      { type: "capstanRock", side: 0, col: 3 },
      { type: "capstanStall", col: 3 },
    ],
    // A reversal's wear, eight of them to a band.
    hit: [{ type: "capstanWear", side: 0, wear: 1, col: 3 }],
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
    hit: "every close and every root shot is landed",
    hurt: (fx) => fx.boss.gall.hurt,
  },
  {
    boss: "burgee",
    // A catch, a recatch and the spindle hit; a tap off the mark or a swipe that caught nothing only works toward one.
    land: [
      { type: "burgeeCatch", side: 1, catches: 1, col: 3 },
      { type: "burgeeRecatch", side: 0, col: 5 },
      { type: "burgeeHit", hits: 1, col: 4 },
    ],
    part: [
      { type: "burgeeLight", ask: "catch", offset: -1, col: 3 },
      { type: "burgeeFlap", side: 0, col: 3 },
      { type: "burgeeFlutter", side: 1, col: 3 },
      { type: "burgeeSway", col: 3 },
    ],
    // The flag tapped still on the mark, the catch not yet made.
    hit: [{ type: "burgeeFreeze", side: 0, col: 3 }],
    hurt: (fx) => fx.boss.burgee.hurt,
  },
  {
    boss: "plumb",
    // A seat's glass held level, both held true under the core and the core hit; a drift, a swing or the core lighting only works toward one.
    land: [
      { type: "plumbSettle", side: 0, level: 1, col: 3 },
      { type: "plumbSteady", col: 3 },
      { type: "plumbHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "plumbLight", ask: "left", col: 3 },
      { type: "plumbDrift", side: 0, col: 3 },
      { type: "plumbSwing", side: 1, col: 3 },
      { type: "plumbCore", col: 3 },
    ],
    hit: "a settle or a steady is a level held for its step, and the core is one shot",
    hurt: (fx) => fx.boss.plumb.hurt,
  },
  {
    boss: "cyst",
    // A flank cracked and the core hit; the tap that stills it, a slip or a spring only works toward one.
    land: [
      { type: "cystCrack", side: 0, col: 3 },
      { type: "cystHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "cystLight", ask: "left", col: 3 },
      { type: "cystStill", side: 0, col: 3 },
      { type: "cystShudder", side: 1, col: 3 },
      { type: "cystSlip", side: 0, col: 3 },
      { type: "cystSpring", side: 1, col: 3 },
    ],
    hit: "a crack is its tap and its pinch landed together, and the core is one shot",
    hurt: (fx) => fx.boss.cyst.hurt,
  },
];
