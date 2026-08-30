import { describe, expect, it } from "bun:test";
import { LONG_AXIS_RATIO, longAxis, poseOn } from "../src/long-axis.js";
import {
  beats,
  HOLD,
  livingMotion,
  type OwnMotion,
  type Pose,
  SWAY_PUMP,
  TILT_RIPPLE,
  TREMBLE,
} from "../src/own-motion.js";

/**
 * Which way a body is long, and what a motion written along one does about it.
 *
 * Three files used to answer the first question privately and one declared its
 * way past the second. What is worth a test is the two places that answer can
 * still be wrong: the threshold, which is the only reason a body a few percent
 * off square is not handed a direction it does not have, and the turn, which
 * has to be a rotation rather than a swap or it mirrors anything with a
 * handedness.
 */

const GAME_MOTIONS = [SWAY_PUMP, TILT_RIPPLE, TREMBLE, HOLD];

describe("longAxis", () => {
  it("gives a round body no long axis at all", () => {
    // BULB is 123 x 118 and RUNT 41 x 42: a bare `w > h` hands both a
    // direction on a few percent of noise.
    expect(longAxis(123, 118)).toBeNull();
    expect(longAxis(41, 42)).toBeNull();
    expect(longAxis(100, 100)).toBeNull();
  });

  it("names the long one once the claim is a quarter again", () => {
    expect(longAxis(152, 89)).toBe("x");
    expect(longAxis(89, 152)).toBe("y");
  });

  it("puts the boundary exactly at the ratio, and excludes it", () => {
    expect(longAxis(LONG_AXIS_RATIO * 100, 100)).toBeNull();
    expect(longAxis(LONG_AXIS_RATIO * 100 + 0.01, 100)).toBe("x");
    expect(longAxis(100, LONG_AXIS_RATIO * 100 + 0.01)).toBe("y");
  });
});

const ALONG: OwnMotion = {
  name: "ALONG",
  note: "a bulge travelling one way and a body squeezed the other",
  axis: "long",
  poseAt: (): Pose => ({ dx: 0.3, dy: 0.1, rot: 0.2, sx: 1, sy: 1.4 }),
};

const SCREEN: OwnMotion = {
  name: "SCREEN",
  note: "the default axis, written against the screen",
  poseAt: (): Pose => ({ dx: 0.3, dy: 0.1, rot: 0.2, sx: 1, sy: 1.4 }),
};

describe("poseOn", () => {
  it("leaves a screen-axis motion alone whichever way the body is long", () => {
    for (const long of ["x", "y", null] as const) {
      expect(poseOn(SCREEN, beats(1), long)).toEqual(SCREEN.poseAt(beats(1)));
    }
  });

  it("leaves a long-axis motion alone on a wide body and on a round one", () => {
    expect(poseOn(ALONG, beats(1), "x")).toEqual(ALONG.poseAt(beats(1)));
    expect(poseOn(ALONG, beats(1), null)).toEqual(ALONG.poseAt(beats(1)));
  });

  it("turns a long-axis motion a quarter turn on a tall body", () => {
    // A rotation, not a swap: `(dx, dy) → (−dy, dx)` keeps the handedness a
    // swap would mirror, the two scales exchange, and the rotation is a
    // rotation in both frames.
    expect(poseOn(ALONG, beats(1), "y")).toEqual({
      dx: -0.1,
      dy: 0.3,
      rot: 0.2,
      sx: 1.4,
      sy: 1,
    });
  });

  it("turns four times back to where it started", () => {
    let p = ALONG.poseAt(beats(1));
    for (let i = 0; i < 4; i++) {
      const wrap: OwnMotion = { ...ALONG, poseAt: () => p };
      p = poseOn(wrap, beats(1), "y");
    }
    expect(p).toEqual(ALONG.poseAt(beats(1)));
  });
});

describe("the game's own motions", () => {
  /**
   * `render/creatures.ts` calls `poseAt` and not `poseOn`, which is right for
   * a screen-axis motion and silently wrong for any other. Nothing the field
   * draws may declare an axis until that call site is the one that turns it.
   */
  it("are all written against the screen, because the field draws them raw", () => {
    for (const m of GAME_MOTIONS) expect(m.axis, m.name).toBeUndefined();
  });

  it("covers every motion a living kind can be given", () => {
    for (const kind of ["bulb", "throb", "slick"] as const) {
      expect(GAME_MOTIONS).toContain(livingMotion(kind));
    }
  });
});
