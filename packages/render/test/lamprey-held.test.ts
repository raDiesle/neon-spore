import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { lampreyTailRight } from "../src/lamprey-verdicts.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { APART, BITE, count, frame, PULL, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LAMPREY's tail says it is right** — the owner, 7 October 2026, THE
 * CAPSTAN's rule for every boss (`lamprey-verdicts.ts`, `mark-progress.ts`):
 * a tail held in a `teeth` or a `pull`, or pulled all the way out in an
 * `apart`, is green on both screens, and one let go or part way is not.
 *
 * **The head's pull wears no green ring of its own** — the owner, 12 October
 * 2026: the knob riding up its channel is how far it has come. Its channel
 * fills green on the worker's screen, and the holder's screen gains no green
 * for it.
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
  const pair = (role: "p1" | "p2") => ({
    still: frame(role, (w) => {
      posed(w, "bite", PULL, (s) => {
        s.tailDown = [true, false];
      });
    }),
    coming: frame(role, (w) => {
      posed(w, "bite", PULL, (s) => {
        s.tailDown = [true, false];
        s.headMilli = [0, CFG.lampreyHeadPullMilli / 2];
      });
    }),
  });

  it("fills the worker's channel green as the head comes up", () => {
    const { still, coming } = pair("p2");
    expect(count(coming, PALETTE.good)).toBeGreaterThan(count(still, PALETTE.good));
  });

  it("rings nothing green round the head on the holder's screen", () => {
    const { still, coming } = pair("p1");
    expect(count(coming, PALETTE.good)).toBe(count(still, PALETTE.good));
  });
});
