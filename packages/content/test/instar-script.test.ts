import { describe, expect, it } from "bun:test";
import { INSTAR_SCRIPT } from "../src/instar-script.js";

/**
 * **THE INSTAR's swept marks** (`sweepMilli`), checked once on the script
 * rather than on every beat: nothing in the simulation refuses a sweep that
 * carries a ring over the seam, and the ring would go on being refused to
 * the thumb whose half it had come into.
 */
const swept = INSTAR_SCRIPT.flatMap((step) => step.marks).filter((m) => (m.sweepMilli ?? 0) !== 0);

describe("THE INSTAR's swept marks", () => {
  it("has a tail that sweeps", () => {
    expect(swept.some((m) => m.part === "tail")).toBe(true);
  });

  it("keeps every swept mark on its own seat's half, from the window's open to its close", () => {
    for (const m of swept) {
      for (const x of [m.xMilli, m.xMilli + (m.sweepMilli ?? 0)]) {
        // Left is player 1's, right is player 2's.
        if (m.seat === "p1") expect(x).toBeLessThan(500);
        if (m.seat === "p2") expect(x).toBeGreaterThan(500);
      }
    }
  });

  it("never sweeps a turn, which winds about where its ring was when the thumb came down", () => {
    for (const m of swept) expect(m.gesture).not.toBe("turn");
  });

  it("sweeps both blades of a fork alike, because the fork is one piece", () => {
    for (const step of INSTAR_SCRIPT) {
      const tails = new Set(
        step.marks.filter((m) => m.part === "tail").map((m) => m.sweepMilli ?? 0),
      );
      expect(tails.size).toBeLessThanOrEqual(1);
    }
  });
});
