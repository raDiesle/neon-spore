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
    expect(lines.map((l) => l.label)).toEqual(["SHIELD", "TIMING", "COLOUR", "PODS", "REFUSED"]);
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
    expect(lines[0]).toEqual({ label: "SHIELD", count: "6/8", pct: 75 });
    expect(lines[1]).toEqual({ label: "TIMING", count: "6/7", pct: 86 });
    expect(lines[2]).toEqual({ label: "COLOUR", count: "3/4", pct: 75 });
  });

  it("counts a husk the other way up — refused of arrived", () => {
    const w = world();
    w.balance.husksRefused = 3;
    w.balance.husksSwallowed = 1;
    const line = sheetLines(balanceSheet(w)).at(-1);
    // Three kept out of four that came, and **not** one taken of four: the
    // numerator on this row is the thing the pair did not do, which is why
    // the label is a verb (`sim/balance.ts`, `BalanceSheet.husks`).
    expect(line).toEqual({ label: "REFUSED", count: "3/4", pct: 75 });
  });

  it("keeps the memories as counts, never as shares", () => {
    const w = world();
    w.balance.bestStreak = 12;
    w.balance.podsFreed = 4;
    w.balance.wavesCleared = 3;
    w.playTicks = 222 * w.cfg.tickHz;
    w.retries = 2;
    expect(sheetMemories(balanceSheet(w))).toEqual([
      ["longest clean run", "12"],
      ["pods shot loose", "4"],
      ["waves cleared", "3"],
      ["time", "3:42"],
      ["retries", "2"],
    ]);
  });
});
