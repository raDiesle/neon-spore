import { describe, expect, it } from "bun:test";
import { DRIFT_MARK } from "../check/closing.js";
import { DRIFT, drifted, driftLine, SHARD_SLOWDOWN, slowdown } from "./figure.js";

/**
 * A figure is what a test costs idle, and it drifts when the tree grows under
 * it. What was taken, divided by the load, is compared with it — so a slow
 * machine is not a drifted figure, and a figure six times short is.
 */
describe("a slow test's figure", () => {
  it("holds while the idle cost is within DRIFT of it", () => {
    expect(drifted(120, 120 * DRIFT, 1)).toBe(false);
    expect(drifted(120, 120 * DRIFT + 1, 1)).toBe(true);
  });

  it("is not called drifted because the machine is loaded", () => {
    // `doc-drift-names`, 21 September 2026: 800 ms idle against 120.
    expect(drifted(120, 800, 1)).toBe(true);
    expect(drifted(850, 8000, 4)).toBe(false);
  });

  it("is not called drifted by a full check's slowdown alone", () => {
    // Measured 23 September 2026: 784 ms alone, 2064 under a check.
    expect(drifted(850, 2064, 1)).toBe(false);
  });

  it("expects a sharded run's width, up to the slowdown it was measured at", () => {
    expect(slowdown(1, 1)).toBe(1);
    expect(slowdown(2, 1)).toBe(2);
    expect(slowdown(8, 1)).toBe(SHARD_SLOWDOWN);
    expect(slowdown(8, 7)).toBe(7);
  });

  it("is not called drifted by the check it runs in", () => {
    // `check:fast`, 23 September 2026, reading a load of 1.0: `tree-walk`
    // took 454 against 120, and costs 92 alone.
    expect(drifted(120, 454, slowdown(8, 1))).toBe(false);
  });

  it("is still called drifted in a check when it is short by the old six", () => {
    // `doc-drift-names`' 800 against 120, at the check's own 4.9.
    expect(drifted(120, 800 * 4.9, slowdown(8, 1))).toBe(true);
  });

  it("is said in a line the closing report can find", () => {
    const line = driftLine("tools/test/doc-drift-names.test.ts: walks", 120, 1600, 2);
    expect(line.startsWith(DRIFT_MARK)).toBe(true);
    expect(line).toContain("about 800 ms idle, against a figure of 120");
  });
});
