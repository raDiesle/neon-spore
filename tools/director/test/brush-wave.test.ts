import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { firstWaveFor, jumpWaveIndex } from "../src/brush-wave.js";
import { BRUSHES } from "../src/brushes.js";

/**
 * Where a Ctrl-click on a brush lands. The palette lights a brush only when
 * this says it goes somewhere (`canJump` in `main.ts`), so a wrong answer
 * here is either a dark button on a brush a wave carries or a lit one that
 * does nothing when pressed.
 */
describe("jumpWaveIndex", () => {
  test("lands on the wave the hover card names, as an index", () => {
    // The two the tooltip test pins, one number lower: WAVE 24 is index 23.
    expect(jumpWaveIndex(WAVES, "throb")).toBe(23);
    expect(jumpWaveIndex(WAVES, "shell")).toBe(24);
    for (const brush of ["throb", "shell"] as const) {
      const index = jumpWaveIndex(WAVES, brush);
      expect(WAVES[index ?? -1]?.name).toBe(firstWaveFor(brush)?.name ?? "");
    }
  });

  test("goes nowhere for ERASE, which paints nothing", () => {
    expect(jumpWaveIndex(WAVES, "erase")).toBeUndefined();
  });

  test("goes nowhere when this director's copy has no wave of that name", () => {
    // What an author who renamed or deleted the wave sees: a dark button,
    // rather than a jump to whatever now sits at that number.
    expect(jumpWaveIndex([], "throb")).toBeUndefined();
    const renamed = WAVES.map((w) => ({ ...w, name: `${w.name} (WAS)` }));
    expect(jumpWaveIndex(renamed, "throb")).toBeUndefined();
  });

  test("every brush but ERASE either names a wave in WAVES or names none", () => {
    for (const { brush } of BRUSHES) {
      const first = firstWaveFor(brush);
      if (!first) continue;
      expect(WAVES[first.number - 1]?.name, brush).toBe(first.name);
      expect(jumpWaveIndex(WAVES, brush), brush).toBe(first.number - 1);
    }
  });
});
