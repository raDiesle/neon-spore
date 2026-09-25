import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { wrapText } from "../src/wrap-text.js";
import { FRAME_TIMEOUT_MS, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A newline in a guide is a line on the screen.
 *
 * The boss guides are numbered steps, one per line, and three of those bosses
 * are still drawn as prose (`content/test/scenes-prose.test.ts`). The stub's
 * `measureText` is width by character count, so a line's fit is arithmetic
 * here rather than a font's opinion.
 */
describe("wrapText", () => {
  function ctx(): CanvasRenderingContext2D {
    const { ctx } = stubCanvas();
    ctx.font = '10px "Courier New",monospace';
    return ctx as never;
  }

  it("breaks on a newline whether or not the line was full", () => {
    expect(wrapText(ctx(), "1. Say it.\n2. Fire.", 1000)).toEqual(["1. Say it.", "2. Fire."]);
  });

  it("still wraps a long line at the width, and never joins two steps", () => {
    // Six characters wide at 10px: "1. Say it." is ten wide and breaks once;
    // the step after it starts on a line of its own.
    const lines = wrapText(ctx(), "1. Say it.\n2. Fire.", 36);
    expect(lines).toEqual(["1. Say", "it.", "2.", "Fire."]);
  });

  it("gives every boss step a line of its own on a phone", () => {
    for (const w of WAVES) {
      if (!w.boss || !w.guide || w.guide.scene !== undefined) continue;
      for (const half of [w.guide.p1, w.guide.p2]) {
        const steps = half.split("\n");
        const lines = wrapText(ctx(), half, 390 - 56);
        for (const step of steps) {
          expect(
            lines.some((l) => step.startsWith(l)),
            `${w.name}: ${step}`,
          ).toBe(true);
        }
      }
    }
  });
});
