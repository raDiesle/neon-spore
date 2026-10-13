import { describe, expect, test } from "bun:test";
import { viewOf } from "../src/press-goo/view.js";
import { autoFinger, loopOf } from "../src/press-lab-auto.js";
import {
  freshPress,
  LAPSE,
  lift,
  PRESS_ASKS,
  PRESS_AT,
  PRESS_R,
  press,
  pressAsk,
  tick,
} from "../src/press-lab-rule.js";
import { pressAt, pressMoments } from "../src/press-lab-sheet.js";

/**
 * THE PRESS LAB's rule and its finger, without a canvas (`press-lab.ts`
 * draws; this is what it draws *from*): a mark is counted on the press that
 * makes its number, a resting finger counts once, a press off the mark is
 * nothing, and a gap of `LAPSE` loses the count.
 */

const five = pressAsk("5");
const STEP = 1 / 60;

function wait(seconds: number, h = freshPress()) {
  for (let t = 0; t < seconds; t += STEP) tick(h, STEP);
  return h;
}

function tap(h = freshPress(), ask = five) {
  const took = press(h, ask, PRESS_AT);
  lift(h);
  wait(0.1, h);
  return took;
}

describe("THE PRESS LAB's rule", () => {
  test("a press off the mark is nothing, and is counted as missed", () => {
    const h = freshPress();
    expect(press(h, five, { x: PRESS_AT.x + PRESS_R * 2, y: PRESS_AT.y })).toBe(false);
    expect(h.done).toBe(0);
    expect(h.missed).toBe(1);
  });

  test("five presses count a mark of five, on the fifth", () => {
    const h = freshPress();
    for (let i = 0; i < 4; i++) tap(h);
    expect(h.done).toBe(4);
    expect(h.counted).toBe(0);
    tap(h);
    expect(h.verdict).toBe("counted");
    expect(h.counted).toBe(1);
  });

  test("a resting finger counts once: it has to lift to press again", () => {
    const h = freshPress();
    expect(press(h, five, PRESS_AT)).toBe(true);
    expect(press(h, five, PRESS_AT)).toBe(false);
    expect(h.done).toBe(1);
  });

  test("a gap of LAPSE loses the count, a finger resting there included", () => {
    const h = freshPress();
    tap(h);
    press(h, five, PRESS_AT);
    wait(LAPSE + 0.05, h);
    expect(h.verdict).toBe("lapsed");
    expect(h.lapsed).toBe(1);
    expect(h.done).toBe(0);
  });

  test("a counted mark takes nothing until a fresh one is in, the hand being off", () => {
    const h = freshPress();
    expect(tap(h, pressAsk("1"))).toBe(true);
    expect(h.waiting).toBe(true);
    expect(tap(h, pressAsk("1"))).toBe(false);
    wait(0.5, h);
    expect(h.waiting).toBe(false);
    expect(tap(h, pressAsk("1"))).toBe(true);
    expect(h.counted).toBe(2);
  });
});

describe("AUTO's finger", () => {
  for (const ask of PRESS_ASKS)
    test(`${ask.label}: one counted per loop, and a lapse when there is more than one`, () => {
      const h = pressAt(ask, loopOf(ask).end - STEP);
      expect(h.counted).toBe(1);
      expect(h.lapsed).toBe(ask.times > 1 ? 1 : 0);
      expect(h.missed).toBe(0);
    });

  test("lands on the mark every time", () => {
    const l = loopOf(five);
    for (const d of l.downs) expect(autoFinger(five, d.at + 0.01).down).toBe(true);
  });
});

describe("the sheet's moments", () => {
  test("each one shows what its label says", () => {
    const ctx = {} as CanvasRenderingContext2D;
    for (const ask of PRESS_ASKS)
      for (const m of pressMoments(ask)) {
        const v = viewOf(ctx, pressAt(ask, m.at), ask, m.at);
        if (m.label.startsWith("WAITING")) expect(v.done).toBe(0);
        if (m.label === "ONE LEFT") expect(v.done).toBe(ask.times - 1);
        if (m.label.startsWith("COUNTED")) expect(v.ending).not.toBeNull();
        if (m.label === "LAPSED") expect(v.failure).not.toBeNull();
        if (m.label === "A FRESH ONE IN") expect(v.mark && v.done === 0).toBe(true);
      }
  });
});
