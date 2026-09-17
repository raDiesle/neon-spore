import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The stub's own corner radii, which is the one place it was stricter than the
 * canvas it stands for.
 *
 * `roundRect` takes either one radius or a list of up to four, and every
 * browser the game runs in honours the list. This stub took the number only,
 * so a shape round at the top and near-square at the foot could not be drawn
 * by anything held here — `tools/versus/candidates/guide-chrome/tide/plate.ts`
 * wrote its crest with one radius and a comment saying why, and the comment
 * pointed at `docs/queue.md`. 16 September 2026.
 *
 * A stub that refuses a call the browser takes costs a shape nobody can draw;
 * one that takes a call the browser refuses costs a green test on a frame that
 * throws in the game. So both directions are held here, and the second is the
 * reason this file exists at all rather than the list form simply being let
 * through.
 */

beforeAll(() => {
  installCanvasGlobals();
});

describe("roundRect's corner radii", () => {
  it("takes a corner list, and a built path logs every radius in it", () => {
    const { ctx } = stubCanvas();
    ctx.log = [];
    const path = new Path2D();
    path.roundRect(0, 0, 40, 20, [9, 9, 4, 4] as unknown as number);
    // The shape a path is made of is part of the picture, so the log carries
    // the corners rather than the fact that a rounded rectangle happened
    // (`canvas-stub.ts`, and `.claude/skills/render-perf` on why).
    expect(ctx.log?.join("\n")).toContain("Path2D.roundRect(0, 0, 40, 20, 9, 9, 4, 4)");
  });

  it("still takes the single radius every other plate is cut with", () => {
    const { ctx } = stubCanvas();
    expect(() => ctx.roundRect(0, 0, 40, 20, 9)).not.toThrow();
  });

  it("refuses what a real canvas refuses", () => {
    const { ctx } = stubCanvas();
    // RangeError in a browser: a corner list is one to four.
    expect(() => ctx.roundRect(0, 0, 40, 20, [])).toThrow("one to four");
    expect(() => ctx.roundRect(0, 0, 40, 20, [1, 2, 3, 4, 5])).toThrow("one to four");
    // IndexSizeError in a browser, and an invisible object here.
    expect(() => ctx.roundRect(0, 0, 40, 20, [9, -1, 4, 4])).toThrow("negative");
    expect(() => ctx.roundRect(0, 0, 40, 20, -1)).toThrow("negative");
    // And the arithmetic that came out wrong three functions ago.
    expect(() => ctx.roundRect(0, 0, 40, 20, [9, Number.NaN])).toThrow("finite");
  });

  it("holds a path builder to the same list", () => {
    const path = new Path2D();
    expect(() => path.roundRect(0, 0, 40, 20, [9, 9, 4, 4] as unknown as number)).not.toThrow();
    expect(() => path.roundRect(0, 0, 40, 20, [9, 9, 4, 4, 4] as unknown as number)).toThrow(
      "one to four",
    );
  });
});
