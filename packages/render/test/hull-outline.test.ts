import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { frame } from "../src/hull-frame.js";
import { hullOutline } from "../src/hull-outline.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The hull's spline is worked out once a frame, not twice.**
 *
 * The rim is stroked along the open contour and the body is filled in the same
 * contour closed down to the bottom of the ship. Until 15 October 2026 each was
 * its own `splinePath` over the same 141 points, so every frame of every wave
 * handed the canvas the hull's 140 curves twice; the filled body is a copy of
 * the rim's path now (`spline.ts`, `splineSkirt`). The op-count budgets do not
 * count path builders, so this is what keeps the second build from coming back.
 */

beforeAll(installCanvasGlobals);

describe("the hull's outline", () => {
  it("hands the canvas its curves once, and closes the body down to the ship's bottom", () => {
    const { ctx } = stubCanvas();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const f = frame(l, 0, { armed: 0, intake: 0, chew: 0, charge: 0 }, { cannon: 4, shield: [] });
    ctx.log = [];
    const { pts } = hullOutline(l, f);
    const log = ctx.log as string[];
    const curves = log.filter((e) => e.startsWith("Path2D.bezierCurveTo")).length;
    expect(curves).toBe(pts.length - 1);
    expect(log.filter((e) => e === "new Path2D").length).toBe(2);
    expect(log.filter((e) => e.startsWith("Path2D.lineTo")).length).toBe(2);
    expect(log.at(-1)).toBe("Path2D.closePath");
  });
});
