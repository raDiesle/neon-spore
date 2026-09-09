import { beforeAll, describe, expect, it } from "bun:test";
import { clearSurface } from "../src/surface-clear.js";
import { installCanvasGlobals, stubCanvas } from "./frame-harness.js";

/**
 * A wipe that misses a strip is a wipe that leaves a picture on the glass.
 *
 * The mouse's ink was found stuck down the right-hand side of the director's
 * field and along the bottom of it, on a desk zoomed out below 100%. The
 * cause is arithmetic: the overlay is sized in device pixels and drawn in CSS
 * pixels, and a `clearRect` given the device size while the CSS transform is
 * on the context asks for a rectangle `dpr` times too small when the ratio is
 * below one. Nothing ever wiped what was outside it, and the loop stops the
 * moment the last blob dies, so what was outside it stayed for the session.
 *
 * The stub cannot hold pixels, so what is checked is the rule instead: the
 * clear happens under the identity transform, at the surface's own device
 * size, and the caller's transform survives it.
 */

beforeAll(installCanvasGlobals);

describe("clearing a surface", () => {
  it("wipes the device rectangle, not the transformed one", () => {
    const { canvas, ctx } = stubCanvas();
    // 300 × 500 CSS pixels on a desk at 80% zoom — the case that failed.
    canvas.width = 240;
    canvas.height = 400;
    const log: string[] = [];
    ctx.log = log;
    ctx.setTransform(0.8, 0, 0, 0.8, 0, 0);
    clearSurface(ctx as unknown as CanvasRenderingContext2D);

    expect(log).toEqual([
      "setTransform(0.8, 0, 0, 0.8, 0, 0)",
      "save",
      "setTransform(1, 0, 0, 1, 0, 0)",
      "clearRect(0, 0, 240, 400)",
      "restore",
    ]);
  });
});
