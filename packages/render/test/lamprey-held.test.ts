import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { lampreyTailRight } from "../src/lamprey-verdicts.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { APART, BITE, count, frame, PULL, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LAMPREY's tail says it is right, and the head says how far** — the
 * owner, 7 October 2026, THE CAPSTAN's rule for every boss
 * (`lamprey-verdicts.ts`, `mark-progress.ts`): a tail held in a `teeth` or a
 * `pull`, or pulled all the way out in an `apart`, is green on both screens,
 * and one let go or part way is not; and the head's pull rides it on both
 * screens as a green arc of how far up it has come.
 */

beforeAll(installCanvasGlobals);

describe("THE LAMPREY's tail held", () => {
  it("is right held in a teeth or a pull, and all the way out in an apart", () => {
    const right = (lit: typeof BITE, tailDown: [boolean, boolean], tail = 0) =>
      lampreyTailRight(
        CFG,
        posed(stood(), "bite", lit, (s) => {
          s.tailDown = tailDown;
          s.tailMilli = [tail, 0];
        }),
      );
    expect(right(BITE, [false, false])).toBe(false);
    expect(right(BITE, [true, false])).toBe(true);
    expect(right(BITE, [false, true])).toBe(false);
    expect(right(PULL, [true, false])).toBe(true);
    expect(right(APART, [true, false])).toBe(false);
    expect(right(APART, [false, false], CFG.lampreyTailPullMilli - 1)).toBe(false);
    expect(right(APART, [false, false], CFG.lampreyTailPullMilli)).toBe(true);
  });

  it.each(["p1", "p2"] as const)("greens the tail on %s once it is held", (role) => {
    const free = frame(role, (w) => {
      posed(w, "bite", BITE);
    });
    const held = frame(role, (w) => {
      posed(w, "bite", BITE, (s) => {
        s.tailDown = [true, false];
      });
    });
    expect(count(held, PALETTE.good)).toBeGreaterThan(count(free, PALETTE.good));
  });
});

describe("THE LAMPREY's head pull", () => {
  it.each(["p1", "p2"] as const)("rides the head on %s as it comes up", (role) => {
    const still = frame(role, (w) => {
      posed(w, "bite", PULL, (s) => {
        s.tailDown = [true, false];
      });
    });
    const coming = frame(role, (w) => {
      posed(w, "bite", PULL, (s) => {
        s.tailDown = [true, false];
        s.headMilli = [0, CFG.lampreyHeadPullMilli / 2];
      });
    });
    expect(count(coming, PALETTE.good)).toBeGreaterThan(count(still, PALETTE.good));
  });
});
