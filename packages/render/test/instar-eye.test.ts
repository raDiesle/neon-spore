import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { frontEyeAt } from "../src/instar-head.js";
import { instarAt, instarHeadAt, instarMarkRadius } from "../src/instar-place.js";
import { POSES } from "../src/instar-poses.js";
import { deformed } from "../src/instar-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

/**
 * **A mark on THE INSTAR's eye sits on the eye the head draws**, and the eye
 * flinches shut as its count lands. The script places a mark by hand in
 * thousandths (`content/instar-script.ts`) and the head places its eyes in
 * head radii (`instar-head.ts`); nothing else would notice the two drifting
 * apart when a pose's head moves, and a ring beside the eye it names is a
 * thumb striking the brow.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
const EYE_MARKS = INSTAR_SCRIPT.flatMap((step) =>
  step.marks.filter((m) => m.part === "eye").map((m) => ({ step, m })),
);

describe("THE INSTAR's struck eye", () => {
  it("is asked for somewhere in the script", () => {
    expect(EYE_MARKS.length).toBeGreaterThan(0);
  });

  it("puts every eye mark on the eye the pose draws, on the mark's own side", () => {
    for (const { step, m } of EYE_MARKS) {
      const f = deformed(POSES[step.pose], step.marks, () => 0);
      const { head, r } = instarHeadAt(L, f);
      const eye = frontEyeAt(f, head, r, m.xMilli < 500 ? -1 : 1);
      const at = instarAt(L, m.xMilli, m.yMilli);
      const off = Math.hypot(at.x - eye.x, at.y - eye.y);
      expect(off, `${step.pose}'s eye mark is ${Math.round(off)} px off the eye`).toBeLessThan(
        instarMarkRadius(L, CFG) / 2,
      );
    }
  });

  it("winces shut by as much of the count as has landed, on the mark's own side", () => {
    for (const { step, m } of EYE_MARKS) {
      const eye = step.marks.indexOf(m);
      const side = m.xMilli < 500 ? "winceLeft" : "wince";
      const half = deformed(POSES[step.pose], step.marks, (i) => (i === eye ? 0.5 : 0));
      expect(half[side]).toBe(0.5);
      expect(deformed(POSES[step.pose], step.marks, () => 0)[side]).toBe(0);
    }
  });
});
