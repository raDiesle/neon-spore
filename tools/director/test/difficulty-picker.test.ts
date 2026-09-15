import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, DIFFICULTY_BPM } from "@neon-spore/sim";
import { CUSTOM, labelFor, noteFor, rowsFor, selectedFor } from "../src/difficulty-picker.js";

/**
 * The three tempi beside the field, in the half that is a function of a number.
 *
 * This runner has no DOM, so what is held here is the deciding half — which
 * rows a tempo puts in the list and which one stands selected — and `bind` is
 * the two lines of wiring a browser is the only honest check of
 * (`columns.test.ts` makes the same argument about `relayout`).
 *
 * The thing worth a test at all is **CUSTOM**: the picker and TUNING's first
 * slider are two views of one `cfg.bpm`, and the slider can be left at a tempo
 * that is none of the three. A picker that rounded to the nearest level would
 * say the run is at a tempo it is not.
 */

describe("the rows a tempo puts in the picker", () => {
  it("is the three levels, and only those, at a level's own tempo", () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const rows = rowsFor(DIFFICULTY_BPM[level]);
      expect(rows.map((r) => r.value)).toEqual(["easy", "medium", "hard"]);
      expect(selectedFor(DIFFICULTY_BPM[level])).toBe(level);
    }
  });

  it("puts CUSTOM first, and selects it, at a tempo that is no level", () => {
    // 90 divides 120 Hz evenly, so it is a tempo the slider can actually be
    // left at (`tuning.ts` refuses the ones that do not).
    const rows = rowsFor(90);
    expect(rows[0]).toEqual({ value: CUSTOM, label: "CUSTOM" });
    expect(rows.map((r) => r.value)).toEqual([CUSTOM, "easy", "medium", "hard"]);
    expect(selectedFor(90)).toBe(CUSTOM);
  });

  it("opens on MEDIUM, because that is what a fresh config is", () => {
    expect(selectedFor(DEFAULT_CONFIG.bpm)).toBe("medium");
  });

  it("writes the tempo under the picker rather than on its rows", () => {
    // The strip is 120 px wide and `MEDIUM · 96 BPM` came back from the
    // browser with the number cut off. The tool's subject is timing, so the
    // number stays — one line down, where only one of them is ever drawn.
    expect(labelFor("easy")).toBe("EASY");
    expect(labelFor("hard")).toBe("HARD");
    expect(noteFor(DIFFICULTY_BPM.hard)).toBe("120 BPM");
    expect(noteFor(90)).toBe("90 BPM");
  });
});
