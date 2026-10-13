import { describe, expect, test } from "bun:test";
import { loopOf } from "../src/rub-lab-auto.js";
import {
  freshRub,
  LAPSE,
  type LabRub,
  lift,
  move,
  partnerTurn,
  press,
  RUB_ASKS,
  RUB_AT,
  RUB_R,
  type RubSeats,
  rubAsk,
  TOGETHER,
  TURN,
  tick,
} from "../src/rub-lab-rule.js";
import { rubAt, rubMoments } from "../src/rub-lab-sheet.js";

/**
 * THE RUB LAB's rule and its finger, without a canvas (`rub-lab.ts` draws;
 * this is what it draws *from*): a turn is the thumb coming back, a rub begun
 * off the mark is nothing, a lift keeps the count, a gap of `LAPSE` loses it,
 * and on BOTH AT ONCE a turn made alone counts nothing.
 */

const four = rubAsk("4");
const STEP = 1 / 60;

function wait(seconds: number, h: LabRub) {
  for (let t = 0; t < seconds; t += STEP) tick(h, STEP);
}

/** Down on the mark and `strokes` strokes across it, each `TURN * 2` long. */
function scrub(h: LabRub, strokes: number, seats: RubSeats = "one") {
  const grab = RUB_AT;
  press(h, grab);
  let turns = 0;
  for (let i = 0; i < strokes; i++) {
    const x = RUB_AT.x + (i % 2 === 0 ? 1 : -1) * TURN * 2;
    for (let k = 1; k <= 8; k++) {
      const from = RUB_AT.x + (i % 2 === 0 ? -1 : 1) * TURN * 2 * (i === 0 ? 0 : 1);
      const at = { x: from + ((x - from) * k) / 8, y: RUB_AT.y };
      if (move(h, four, seats, at, grab)) turns++;
    }
  }
  return turns;
}

describe("THE RUB LAB's rule", () => {
  test("a rub begun off the mark is nothing, and is counted as missed", () => {
    const h = freshRub();
    expect(press(h, { x: RUB_AT.x + RUB_R * 3, y: RUB_AT.y })).toBe(false);
    expect(move(h, four, "one", { x: RUB_AT.x + RUB_R * 4, y: RUB_AT.y }, RUB_AT)).toBe(false);
    expect(h.missed).toBe(1);
  });

  test("a stroke one way is no turn; each coming back is one", () => {
    const h = freshRub();
    expect(scrub(h, 1)).toBe(0);
    lift(h);
    const g = freshRub();
    expect(scrub(g, 3)).toBe(2);
    expect(g.done).toBe(2);
  });

  test("four turns count a mark of four, on the fourth", () => {
    const h = freshRub();
    scrub(h, 5);
    expect(h.verdict).toBe("counted");
    expect(h.counted).toBe(1);
    expect(h.waiting).toBe(true);
  });

  test("a lift keeps the count; a gap of LAPSE loses it, a still thumb included", () => {
    const h = freshRub();
    scrub(h, 3);
    lift(h);
    expect(h.done).toBe(2);
    press(h, RUB_AT);
    wait(LAPSE + 0.05, h);
    expect(h.verdict).toBe("lapsed");
    expect(h.done).toBe(0);
  });

  test("BOTH AT ONCE: a turn counts only while the other seat is rubbing", () => {
    const h = freshRub();
    expect(scrub(h, 3, "both")).toBe(0);
    expect(h.alone).toBe(2);
    lift(h);
    partnerTurn(h);
    expect(scrub(h, 3, "both")).toBe(2);
    wait(TOGETHER + 0.05, h);
    lift(h);
    expect(scrub(h, 3, "both")).toBe(0);
  });
});

describe("THE RUB LAB's AUTO and its sheet", () => {
  for (const ask of RUB_ASKS)
    for (const seats of ["one", "both"] as const)
      test(`${ask.label}, ${seats}: one loop counts a mark once and lapses once`, () => {
        const h = rubAt(ask, seats, loopOf(ask, seats).end - 0.01);
        expect(h.counted).toBe(1);
        expect(h.lapsed).toBe(1);
        if (seats === "both") expect(h.alone).toBeGreaterThan(0);
      });

  test("every moment the sheet names is in the loop, in order", () => {
    const moments = rubMoments(rubAsk("8"), "both");
    expect(moments.map((m) => m.label)).toContain("COUNTED · FIZZING");
    expect(moments.map((m) => m.label)).toContain("ALONE · COUNTS NOTHING");
    expect(moments.map((m) => m.label)).toContain("LAPSED");
    const at = moments.map((m) => m.at);
    expect(at).toEqual([...at].sort((a, b) => a - b));
  });
});
