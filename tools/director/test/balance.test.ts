import { describe, expect, it } from "bun:test";
import { balanceSheet, createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { sheetLines, sheetMemories } from "../src/balance.js";

/**
 * The panel is `document.createElement` around these two functions, so these
 * two are what a test can hold. What matters is the empty case: a wave that
 * has just started has asked nothing of the pair, and a row that showed 0/0
 * as 0% would read as a failure nobody committed.
 */

function world() {
  return createWorld({ ...DEFAULT_CONFIG }, 0);
}

describe("the director's sheet", () => {
  it("shows a dash, not a zero, for what has not been asked", () => {
    const lines = sheetLines(balanceSheet(world()));
    expect(lines.map((l) => l.label)).toEqual(["WARDS", "TIMING", "COLOUR", "PODS"]);
    for (const line of lines) {
      expect(line.count).toBe("—");
      expect(line.pct).toBeNull();
    }
  });

  it("counts what happened once it has", () => {
    const w = world();
    w.guard.tries = 8;
    w.guard.deflected = 6;
    w.guard.mistimed = 1;
    w.balance.colorHits = 3;
    w.balance.colorMisses = 1;
    const lines = sheetLines(balanceSheet(w));
    expect(lines[0]).toEqual({ label: "WARDS", count: "6/8", pct: 75 });
    expect(lines[1]).toEqual({ label: "TIMING", count: "6/7", pct: 86 });
    expect(lines[2]).toEqual({ label: "COLOUR", count: "3/4", pct: 75 });
  });

  it("keeps the memories as counts, never as shares", () => {
    const w = world();
    w.balance.bestStreak = 12;
    w.balance.podsFreed = 4;
    w.balance.wavesCleared = 3;
    w.score = 980;
    expect(sheetMemories(balanceSheet(w))).toEqual([
      ["longest clean run", "12"],
      ["pods shot loose", "4"],
      ["waves cleared", "3"],
      ["score", "980"],
    ]);
  });
});
