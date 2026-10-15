import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
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
    // added a sixth boss to act two and pushed both on by one, and CYAN was
    // inserted into act one when the standard panel became a ladder — and the
    // *names* move when the owner renames a wave in the director, which is how
    // wave 22 stopped being ON THE BEAT. CATCH AND AIM went in ahead of FINALE
    // when THE LOCK arrived and pushed both on by one again. THE COUNT went in
    // between these two on 11 September 2026 and moved the shell alone. ONE
    // LAST CHANCE went into act one on 26 September 2026 and moved both again.
    // The arc's short blocks of regular waves went in ahead of them on 14
    // October 2026 and moved both on by twelve, and the composed blocks after
    // it move them every lane — so the number is read off the wave's id now,
    // and the name is still pinned.
    const wave = (id: string) => WAVES.findIndex((w) => w.id === id) + 1;
    expect(brushTooltip("throb")).toBe(`First in WAVE ${wave("theThrob")} · THE THROB`);
    expect(brushTooltip("shell")).toBe(`First in WAVE ${wave("theThirdShot")} · THE SHELL`);
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
        tooltip === "No wave carries this yet" ||
          /^(First in|Its own wave) WAVE \d+ · /.test(tooltip ?? ""),
        `${brush}: "${tooltip}"`,
      ).toBe(true);
    }
  });
});
