import { describe, expect, test } from "bun:test";
import { viewOf } from "../src/hold-goo/view.js";
import { autoThumb, loopOf } from "../src/hold-lab-auto.js";
import {
  BEAT_SECONDS,
  freshHold,
  HOLD_ASKS,
  HOLD_AT,
  HOLD_R,
  holdAsk,
  lift,
  move,
  press,
  SLIP_REACH,
  tick,
} from "../src/hold-lab-rule.js";
import { holdAt, holdMoments } from "../src/hold-lab-sheet.js";

/**
 * The HOLD LAB's rule and its thumb, without a canvas (`hold-lab.ts` draws;
 * this is what it draws *from*): a hold is counted once its beats are held,
 * refused when let go early, failed half a tile off the mark, and never
 * refused for a tap — the PULL LAB's answers, made a hold's.
 */

const ask = holdAsk("2");
const STEP = 1 / 60;

function holdFor(seconds: number, h = freshHold()) {
  for (let t = 0; t < seconds; t += STEP) tick(h, ask, STEP);
  return h;
}

describe("the HOLD LAB's rule", () => {
  test("a press off the mark takes nothing", () => {
    const h = freshHold();
    expect(press(h, { x: HOLD_AT.x + HOLD_R * 2, y: HOLD_AT.y })).toBe(false);
    expect(h.phase).toBe("idle");
  });

  test("held for its beats, it is counted once, and the hand still down adds nothing", () => {
    const h = freshHold();
    expect(press(h, HOLD_AT)).toBe(true);
    holdFor(ask.beats * BEAT_SECONDS + 0.5, h);
    expect(h.verdict).toBe("counted");
    expect(h.counted).toBe(1);
    expect(h.phase).toBe("done");
    lift(h);
    expect(h.refused).toBe(0);
    expect(h.counted).toBe(1);
  });

  test("a counted mark comes back fresh only once the hand is off", () => {
    const h = freshHold();
    press(h, HOLD_AT);
    holdFor(ask.beats * BEAT_SECONDS + 1.5, h);
    expect(h.waiting).toBe(true);
    expect(press(h, HOLD_AT)).toBe(false);
    lift(h);
    holdFor(0.1, h);
    expect(h.waiting).toBe(false);
    expect(h.born).toBeLessThan(0.2);
  });

  test("let go early is refused, and its fill drains in the view", () => {
    const h = freshHold();
    press(h, HOLD_AT);
    holdFor(ask.beats * BEAT_SECONDS * 0.5, h);
    lift(h);
    expect(h.verdict).toBe("refused");
    expect(h.from.fill).toBeGreaterThan(0.4);
    const ctx = {} as CanvasRenderingContext2D;
    expect(viewOf(ctx, h, ask, 0).fill).toBeGreaterThan(0.4);
    holdFor(0.6, h);
    expect(viewOf(ctx, h, ask, 0).fill).toBe(0);
  });

  test("a tap is never refused", () => {
    const h = freshHold();
    press(h, HOLD_AT);
    holdFor(0.05, h);
    lift(h);
    expect(h.verdict).toBeNull();
    expect(h.refused).toBe(0);
  });

  test("a thumb past half a tile off the mark fails, and inside it holds on", () => {
    const h = freshHold();
    press(h, HOLD_AT);
    move(h, { x: HOLD_AT.x + SLIP_REACH - 1, y: HOLD_AT.y });
    expect(h.phase).toBe("held");
    move(h, { x: HOLD_AT.x + SLIP_REACH + 1, y: HOLD_AT.y });
    expect(h.verdict).toBe("slipped");
    expect(h.slipped).toBe(1);
  });
});

describe("AUTO's thumb in the HOLD LAB", () => {
  for (const a of HOLD_ASKS)
    test(`one loop of ${a.label} counts once, refuses once and slips once`, () => {
      const l = loopOf(a);
      const h = holdAt(a, l.end - 0.01);
      expect([h.counted, h.refused, h.slipped]).toEqual([1, 1, 1]);
      expect(autoThumb(a, l.end + 0.1).down).toBe(false);
    });

  for (const a of HOLD_ASKS)
    test(`the sheet's moments for ${a.label} show what they say`, () => {
      const words = new Map(holdMoments(a).map((m) => [m.label, holdAt(a, m.at)]));
      expect(words.get("HELD · HALF")?.phase).toBe("held");
      expect(words.get("COUNTED · FIZZING")?.verdict).toBe("counted");
      expect(words.get("LET GO EARLY")?.verdict).toBe("refused");
      expect(words.get("SLIDING OFF")?.phase).toBe("held");
      expect(words.get("OFF THE MARK")?.verdict).toBe("slipped");
    });
});
