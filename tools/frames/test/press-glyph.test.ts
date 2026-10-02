import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { parsePress } from "../press.js";

/**
 * THE MIMIC's answer, a sign drawn on the pad, written on the command line
 * as its index into the five or by its name (`sim/glyphs.ts`), from either
 * seat: who owes a sign moves with the script.
 */

const MIMIC = WAVES.findIndex((w) => w.boss?.kind === "mimic");

describe("--press, THE MIMIC's glyph", () => {
  it("draws a sign by its index or its name, from either seat", () => {
    expect(parsePress("300:2:glyph=0", MIMIC)[0]?.command).toEqual({ kind: "glyph", sign: 0 });
    expect(parsePress("300:1:glyph=hook", MIMIC)[0]?.command).toEqual({ kind: "glyph", sign: 4 });
  });

  it("refuses a sign that is not one of the five, or none", () => {
    expect(() => parsePress("300:2:glyph=5", MIMIC)).toThrow(/a sign is 0 to 4/);
    expect(() => parsePress("300:2:glyph=star", MIMIC)).toThrow(/a sign is 0 to 4/);
    expect(() => parsePress("300:2:glyph=1.5", MIMIC)).toThrow(/a sign is 0 to 4/);
    expect(() => parsePress("300:2:glyph", MIMIC)).toThrow(/takes a value/);
  });
});
