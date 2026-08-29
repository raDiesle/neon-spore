import { describe, expect, test } from "bun:test";
import { brushTooltip } from "../src/brush-tooltip.js";
import { BRUSHES } from "../src/brushes.js";

/**
 * `brushTooltip` is the hover text the queue entry asked for — "hovering a
 * brush names the wave that first introduces what it paints". These pin the
 * two brushes the owner named directly (THE THROB, THE SHELL — see
 * `docs/queue.md`), so a regression in the derivation it calls shows up as a
 * wrong wave number here rather than only as a wrong tooltip on screen.
 */
describe("brushTooltip", () => {
  test("names the wave and its name for a brush a wave carries", () => {
    expect(brushTooltip("throb")).toBe("First in WAVE 21 · ON THE BEAT");
    expect(brushTooltip("shell")).toBe("First in WAVE 22 · THE THIRD SHOT");
  });

  test("says nothing for ERASE, which paints nothing", () => {
    expect(brushTooltip("erase")).toBeUndefined();
  });

  test("gives every other brush a wave answer or the plain fact none carries it", () => {
    for (const { brush } of BRUSHES) {
      if (brush === "erase") continue;
      const tooltip = brushTooltip(brush);
      expect(tooltip, brush).toBeDefined();
      expect(
        tooltip === "No wave carries this yet" || /^First in WAVE \d+ · /.test(tooltip ?? ""),
        `${brush}: "${tooltip}"`,
      ).toBe(true);
    }
  });
});
