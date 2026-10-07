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
    boss: "trapeze",
    // A catch, a recatch and the spindle hit; a tap off the mark or a swipe that caught nothing only works toward one.
    land: [
      { type: "trapezeCatch", side: 1, catches: 1, col: 3 },
      { type: "trapezeRecatch", side: 0, col: 5 },
      { type: "trapezeHit", hits: 1, col: 4 },
    ],
    part: [
      { type: "trapezeLight", ask: "catch", offset: -1, col: 3 },
      { type: "trapezeFlap", side: 0, col: 3 },
      { type: "trapezeFlutter", side: 1, col: 3 },
      { type: "trapezeSway", col: 3 },
    ],
    // The flag tapped still on the mark, the catch not yet made.
    hit: [{ type: "trapezeFreeze", side: 0, col: 3 }],
    hurt: (fx) => fx.boss.trapeze.hurt,
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
  {
    boss: "nettle",
    // THE INSTAR's engine, so THE INSTAR's events: a step landed and the last.
    land: [
      { type: "instarLand", step: 0, col: 3 },
      { type: "instarDown", col: 3 },
    ],
    part: [{ type: "instarDone", mark: 0, part: "arm", col: 3 }],
    hit: "an instarAnswer on a shoot mark, which only the placed marks know: nettle-fx.test.ts",
    hurt: (fx) => fx.boss.nettle.hurt,
  },
  {
    boss: "flue",
    // A level cleared; a level lighting or a shot spent only works toward one.
    land: [{ type: "flueHit", hits: 1, left: 0, col: 3, emberMilli: 0 }],
    part: [
      { type: "flueLight", level: 1, col: 3 },
      { type: "flueMiss", shots: 2, why: "wide", col: 3, late: false, emberMilli: 0 },
    ],
    hit: "a level is one shot, and the shot is the level cleared",
    hurt: (fx) => fx.boss.flue.hurt,
  },
  {
    boss: "governor",
    // A retap made and the hub hit; a step lighting, the hub lit or a skid only works toward one.
    land: [
      { type: "governorRetap", side: 1, col: 3 },
      { type: "governorHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "governorLight", ask: "tap", marks: 2, col: 3 },
      { type: "governorHub", col: 3 },
      { type: "governorSkid", side: 0, col: 3 },
    ],
    hit: [{ type: "governorTick", side: 0, mark: 0, markMilli: 250, taps: 1, col: 3 }],
    hurt: (fx) => fx.boss.governor.hurt,
  },
  {
    boss: "seam",
    // A point shot shut, one of the three that are its health.
    land: [{ type: "seamSeal", sealed: 1, col: 3 }],
    // A step lighting, a shot into a glow that wants more, grit on the shield and the split.
    part: [
      { type: "seamLight", ask: "point", col: 3 },
      { type: "seamQuench", left: 2, col: 3 },
      { type: "seamBlock", col: 3 },
      { type: "seamSplit", col: 3 },
    ],
    // The steps answered that seal nothing: a point that dims, a rock out, the glow quenched.
    hit: [
      { type: "seamDim", col: 3 },
      { type: "seamRockOut", col: 3 },
      { type: "seamQuench", left: 0, col: 3 },
    ],
    hurt: (fx) => fx.boss.seam.hurt,
  },
  {
    boss: "lamprey",
    // A bite freed, the head off its tile, and a shot down the gullet.
    land: [
      { type: "lampreyLoose", tooth: 0, col: 3 },
      { type: "lampreyHit", hits: 1, col: 3 },
    ],
    // A bite, a grip, a slip, a snap and a rear only work toward one, or against it.
    part: [
      { type: "lampreyBite", side: 0, tooth: 0, row: 6, col: 3 },
      { type: "lampreyGrip", side: 0, col: 3 },
      { type: "lampreySlip", side: 1, col: 3 },
      { type: "lampreySnap", tooth: 0, side: 1, col: 3 },
      { type: "lampreyRear", color: "red", col: 3 },
    ],
    // A tooth knocked out, one of the five that are its health.
    hit: [{ type: "lampreyCrack", side: 1, tooth: 0, col: 3 }],
    hurt: (fx) => fx.boss.lamprey.hurt,
  },
  {
    boss: "mimic",
    // A shot into the bare core.
    land: [{ type: "mimicHit", hits: 1, col: 3 }],
    // A sign surfacing or changing, worn wrong or let lapse, a reach, a roll,
    // the core bared or closed over only work toward one, or against it.
    part: [
      { type: "mimicSign", signs: [-1, 0], col: 3 },
      { type: "mimicChange", signs: [-1, 1], col: 3 },
      { type: "mimicPaint", side: 1, at: 40, paint: 1, col: 3 },
      { type: "mimicLapse", col: 3 },
      { type: "mimicReach", reaches: 1, col: 3 },
      { type: "mimicRoll", col: 3 },
      { type: "mimicCore", col: 3 },
      { type: "mimicClose", col: 3 },
    ],
    // A sign peeled, one step of the script that is its health.
    hit: [{ type: "mimicPeel", side: 1, sign: 0, at: 40, peels: 1, col: 3 }],
    hurt: (fx) => fx.boss.mimic.hurt,
  },
];
