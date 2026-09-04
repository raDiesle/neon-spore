import { describe, expect, it } from "bun:test";
import { parseOpening } from "../opening.js";

/**
 * `--opening` is the flag that lets a wave's own opening stand in front of the
 * camera instead of being run past. It has exactly two values, and the reason
 * this file exists is the third: a typo that silently meant "no flag" would
 * hand back a picture of the field — an honest-looking answer to a question
 * nobody asked, which is the failure every other refusal in `run.ts` is
 * written to avoid.
 *
 * Parsing only. What the two values *do* to a page needs a browser, and
 * `opening.test.ts` next door is where that is driven.
 */
describe("parseOpening", () => {
  it("takes the two phases a wave puts in front of a player", () => {
    expect(parseOpening("intro")).toBe("intro");
    expect(parseOpening("guide")).toBe("guide");
  });

  it("no flag at all is the tool's whole history: run past the opening", () => {
    expect(parseOpening(undefined)).toBeUndefined();
  });

  it("refuses anything else by name, rather than falling back to the field", () => {
    expect(() => parseOpening("briefing")).toThrow("--opening briefing: one of intro, guide");
    expect(() => parseOpening("")).toThrow("one of intro, guide");
    expect(() => parseOpening("INTRO")).toThrow("one of intro, guide");
  });
});
