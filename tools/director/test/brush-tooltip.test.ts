import { describe, expect, test } from "bun:test";
import { brushTooltip } from "../src/brush-tooltip.js";
import { BRUSHES } from "../src/brushes.js";

/**
 * `brushTooltip` is the hover text the owner asked for — "hovering a
 * brush names the wave that first introduces what it paints". These pin the
 * two brushes he named directly (THE THROB, THE SHELL), so a regression in
 * the derivation it calls shows up as a
 * wrong wave number here rather than only as a wrong tooltip on screen.
 */
describe("brushTooltip", () => {
  test("names the wave and its name for a brush a wave carries", () => {
    // The numbers move when a wave is authored ahead of these two — THE FLEET
    // added a sixth boss to act two and pushed both on by one — and the *names*
    // move when the owner renames a wave in the director, which is how wave 22
    // stopped being ON THE BEAT.
    expect(brushTooltip("throb")).toBe("First in WAVE 22 · THE THROB");
    expect(brushTooltip("shell")).toBe("First in WAVE 23 · THE THIRD SHOT");
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
