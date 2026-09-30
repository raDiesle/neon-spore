import { describe, expect, it } from "bun:test";
import { firstOnPanel, WAVE_MARK_IDS, WAVES, waveMarksOn } from "../src/index.js";

/**
 * The four marks the director's rail and JUMP TO WAVE both show, asked of the
 * shipped campaign: each is the one fact about a wave it says it is.
 */
describe("waveMarksOn", () => {
  it("marks a boss, a guide and a fault exactly where the wave has one", () => {
    for (const [i, wave] of WAVES.entries()) {
      const on = waveMarksOn(WAVES, i);
      expect(on.includes("boss")).toBe(wave.boss !== undefined);
      expect(on.includes("card")).toBe(wave.guide !== undefined);
      expect(on.includes("fault")).toBe((wave.faults?.length ?? 0) > 0);
    }
  });

  it("marks the first wave on every panel, the ordinary one included", () => {
    for (let i = 0; i < WAVES.length; i++) {
      if (firstOnPanel(WAVES, i)) expect(waveMarksOn(WAVES, i)).toContain("control");
    }
  });

  it("answers in the order a row draws, and nothing past the end", () => {
    for (let i = 0; i < WAVES.length; i++) {
      const on = waveMarksOn(WAVES, i);
      expect(on).toEqual(WAVE_MARK_IDS.filter((id) => on.includes(id)));
    }
    expect(waveMarksOn(WAVES, WAVES.length)).toEqual([]);
  });
});
