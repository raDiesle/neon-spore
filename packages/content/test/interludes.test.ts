import { describe, expect, it } from "bun:test";
import { INTERLUDE_KINDS } from "@neon-spore/sim";
import { GAPS } from "../src/interludes.js";
import { WAVES } from "../src/waves.js";

describe("interlude gaps", () => {
  it("only names a kind the sim actually has", () => {
    for (const entry of Object.values(GAPS)) {
      expect(INTERLUDE_KINDS).toContain(entry.kind);
    }
  });

  it("only opens in a gap between authored waves, never before the first", () => {
    for (const key of Object.keys(GAPS)) {
      const wave = Number(key);
      expect(wave).toBeGreaterThan(0);
      expect(wave).toBeLessThanOrEqual(WAVES.length);
    }
  });

  it("fills the gap before wave 10 with THE GAUGE", () => {
    expect(GAPS[10]).toEqual({ kind: "gauge" });
  });
});
