import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { drawFlipSeam } from "../src/flip-seam.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLIP's seam is on the turned screen and nowhere else**
 * (`flip-seam.ts`). The picture is judged by eye; what is held here is the
 * rule a picture cannot show — that the seat with the true field is never
 * handed a tell about a mirror it is not looking into.
 */

beforeAll(installCanvasGlobals);

const drawn = (flip: boolean): number => {
  const { ctx } = stubCanvas();
  const l = { ...computeLayout(VIEWPORT, CFG, "p1"), flip };
  drawFlipSeam(ctx as unknown as CanvasRenderingContext2D, l, 1.3);
  return ctx.calls;
};

describe("the flip's seam", () => {
  it("draws nothing on a screen that is not turned", () => {
    expect(drawn(false)).toBe(0);
  });

  it("draws down the middle of a turned one", () => {
    expect(drawn(true)).toBeGreaterThan(0);
  });
});
