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
    // A leap thrown and a hit landed; a light, a tap or a landing only works toward one.
    land: [
      { type: "gallLeap", from: 0, to: 2, leaps: 1, col: 3 },
      { type: "gallHit", hits: 1, col: 3 },
    ],
    part: [
      { type: "gallLight", ask: "leap", point: 0, col: 0 },
      { type: "gallTap", point: 0, taps: 1, need: 3, col: 0 },
      { type: "gallLand", point: 2, col: 3 },
    ],
    hit: "every leap and every shot is landed",
    hurt: (fx) => fx.boss.gall.hurt,
  },
  {
    boss: "trapeze",
    // A gong kicked; a level lighting, a call, a brake or a swipe that did nothing only works toward one.
    land: [{ type: "trapezeGong", gongs: 1, col: 9 }],
    part: [
      { type: "trapezeLevel", ask: "push", gongSide: 1, col: 5 },
      { type: "trapezeCall", seat: 1, zone: -1, col: 5 },
      { type: "trapezeBrake", seat: 0, zone: -1, col: 3 },
      { type: "trapezeWhiff", seat: 1, zone: -1, why: "seat", col: 3 },
    ],
    // A push on time, and a shot that pushes: the swing higher, the gong not yet kicked.
    hit: [
      { type: "trapezePush", seat: 0, zone: -1, col: 3 },
      { type: "trapezeShot", gain: true, side: false, col: 5 },
    ],
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
  {
    boss: "latch",
    // A knot pulled in: it tears a body off the colony.
    land: [{ type: "latchKnot", knots: 1, col: 5 }],
    // A level lit, a grip taken or wrong, a pull passing the turn, a slip, a
    // rear and a yank held only work toward one, or against it.
    part: [
      { type: "latchLevel", ask: "haul", col: 5 },
      { type: "latchGrip", seat: 0, grip: 0, col: 5 },
      { type: "latchWrong", seat: 0, grip: 1, col: 5 },
      { type: "latchTurn", grip: 0, col: 5 },
      { type: "latchSlip", why: "both", lostMilli: 500, col: 5 },
      { type: "latchRear", col: 5 },
      { type: "latchBraced", col: 5 },
    ],
    hit: "every knot is landed: the knots are the colony's health, a body each",
    hurt: (fx) => fx.boss.latch.hurt,
  },
];
