import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { POSES } from "../src/instar-poses.js";
import { deformed, instarAt, instarHeadAt } from "../src/instar-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

/**
 * **A mark on THE INSTAR's fire sits on the fireball the mouth draws**, and
 * the fire goes out as its taps land. The script places the mark by hand in
 * thousandths (`content/instar-script.ts`) and the head draws the ball
 * between the lips at the middle of the head (`instar-head.ts`); a ring off
 * the ball would be a thumb slapping a fang.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
const FIRE = INSTAR_SCRIPT.flatMap((step) =>
  step.marks.filter((m) => m.part === "fire").map((m) => ({ step, m })),
);

/** The widest the fireball is drawn, in head radii (`instar-head.ts`). */
const BALL = 0.54;

describe("THE INSTAR's fire in the mouth", () => {
  it("is asked for between the bites and during the third", () => {
    expect(FIRE.length).toBe(2);
    expect(new Set(FIRE.map(({ m }) => m.seat))).toEqual(new Set(["p1", "p2"]));
  });

  it("puts every fire mark on the fireball, with the mouth wide", () => {
    for (const { step, m } of FIRE) {
      const f = deformed(POSES[step.pose], step.marks, () => 0);
      const { head, r } = instarHeadAt(L, f);
      const at = instarAt(L, m.xMilli, m.yMilli);
      const off = Math.hypot(at.x - head.x, at.y - head.y);
      expect(off, `the fire mark is ${Math.round(off)} px off the ball`).toBeLessThan(
        r * BALL * 0.5,
      );
    }
  });

  it("goes out by as much of the count as has landed", () => {
    for (const { step } of FIRE) {
      const fire = step.marks.findIndex((m) => m.part === "fire");
      const half = deformed(POSES[step.pose], step.marks, (i) => (i === fire ? 0.5 : 0));
      expect(half.flame).toBe(0.5);
      expect(deformed(POSES[step.pose], step.marks, () => 0).flame).toBe(1);
      expect(deformed(POSES[step.pose], step.marks, () => 1).flame).toBe(0);
    }
  });
});
