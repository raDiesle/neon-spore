import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_GLANCE, INSTAR_TAIL_REST } from "../src/instar-glance.js";
import type { Look } from "../src/instar-plate.js";
import { tailShape } from "../src/instar-tail.js";
import { EYE_X, turnedHeadPoint } from "../src/instar-turn.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Where THE INSTAR's head and resting tail look** (`instar-glance.ts`):
 * shipped, both are still; a glance swings the snout and holds the two eyes
 * where their marks are; a lean moves the resting tail and never a lashing
 * one, whose fork is over its marks.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const HEAD = { x: 200, y: 300 };
const R = 80;

function held<K extends keyof typeof INSTAR_GLANCE>(
  key: K,
  value: (typeof INSTAR_GLANCE)[K],
  body: () => void,
): void {
  const was = INSTAR_GLANCE[key];
  INSTAR_GLANCE[key] = value;
  try {
    body();
  } finally {
    INSTAR_GLANCE[key] = was;
  }
}

describe("THE INSTAR's glance", () => {
  it("ships still", () => {
    expect(INSTAR_GLANCE.swing(3)).toBe(0);
    expect(INSTAR_GLANCE.roll(3)).toBe(0);
    expect(INSTAR_TAIL_REST.lean(3)).toBe(1);
  });

  it("swings the snout by the glance and holds both eyes where they were", () => {
    const turn = { side: 0, time: 1 };
    const eyes = [-1, 1].map((s) => ({ x: HEAD.x + s * EYE_X * R, y: HEAD.y }));
    const before = turnedHeadPoint(HEAD, R, turn, HEAD);
    const still = eyes.map((e) => turnedHeadPoint(HEAD, R, turn, e));
    held(
      "swing",
      () => 0.3,
      () => {
        const after = turnedHeadPoint(HEAD, R, turn, HEAD);
        expect(after.x - before.x).toBeCloseTo(0.3 * R, 6);
        eyes.forEach((e, i) => {
          expect(turnedHeadPoint(HEAD, R, turn, e).x).toBeCloseTo((still[i] as typeof e).x, 6);
        });
      },
    );
  });

  it("rolls the head about its centre", () => {
    const turn = { side: 0, time: 1 };
    const brow = { x: HEAD.x + R * 0.4, y: HEAD.y - R * 0.5 };
    const was = turnedHeadPoint(HEAD, R, turn, brow);
    held(
      "roll",
      () => 0.1,
      () => {
        const now = turnedHeadPoint(HEAD, R, turn, brow);
        expect(Math.hypot(now.x - HEAD.x, now.y - HEAD.y)).toBeCloseTo(
          Math.hypot(was.x - HEAD.x, was.y - HEAD.y),
          6,
        );
        expect(now.y).not.toBeCloseTo(was.y, 1);
      },
    );
  });
});

describe("THE INSTAR's resting tail", () => {
  const look = (tail: number) =>
    ({ f: { tail, tailX: 500, tailY: 560 }, r: 40, time: 1, threat: 0 }) as unknown as Look;
  const REAR = { x: 300, y: 300 };
  const leaning = (lean: number, tail: number) => {
    const was = INSTAR_TAIL_REST.lean;
    INSTAR_TAIL_REST.lean = () => lean;
    try {
      return tailShape(L, look(tail), REAR);
    } finally {
      INSTAR_TAIL_REST.lean = was;
    }
  };

  it("leans the resting fork from the right of the rear to its left", () => {
    expect(leaning(1, 0).fork.x).toBeGreaterThan(REAR.x);
    expect(leaning(-1, 0).fork.x).toBeLessThan(REAR.x);
  });

  it("leaves a lashing tail where its marks are, whatever the lean", () => {
    expect(leaning(-1, 1).fork).toEqual(leaning(1, 1).fork);
  });
});
