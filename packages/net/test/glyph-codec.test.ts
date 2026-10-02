import { describe, expect, it } from "bun:test";
import { GLYPHS } from "@neon-spore/sim";
import { decodeCommand } from "../src/command-codec.js";

/**
 * **THE MIMIC's sign crosses the wire as an index into the five and nothing
 * else** (`sim/glyphs.ts`): every one of the five is carried, and a sign out
 * of range, a fraction or a missing one drops the frame rather than reaching
 * a skin that cannot wear it.
 */
describe("the glyph on the wire", () => {
  it("carries each of the five", () => {
    for (let sign = 0; sign < GLYPHS.length; sign++) {
      expect(decodeCommand({ kind: "glyph", sign })).toEqual({ kind: "glyph", sign });
    }
  });

  it("refuses a sign that is not one of the five", () => {
    for (const sign of [-1, GLYPHS.length, 1.5, "ring", null, undefined]) {
      expect(decodeCommand({ kind: "glyph", sign })).toBeNull();
    }
  });
});
