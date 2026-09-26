import { describe, expect, it } from "bun:test";
import { instarWound } from "@neon-spore/sim";
import { INSTAR_SCRIPT } from "../src/instar-script.js";

/**
 * **THE INSTAR's script, checked once** rather than on every beat. The swept
 * marks (`sweepMilli`): nothing in the simulation refuses a sweep that
 * carries a ring over the seam, and the ring would go on being refused to
 * the thumb whose half it had come into. And the coil's two winds, which are
 * the step only if they go opposite ways.
 */
const swept = INSTAR_SCRIPT.flatMap((step) => step.marks).filter((m) => (m.sweepMilli ?? 0) !== 0);

describe("THE INSTAR's script", () => {
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

  it("never sweeps a wound mark, which winds about where its ring was when the thumb came down", () => {
    for (const m of swept) expect(instarWound(m.gesture)).toBe(false);
  });

  it("sweeps both blades of a fork alike, because the fork is one piece", () => {
    for (const step of INSTAR_SCRIPT) {
      const tails = new Set(
        step.marks.filter((m) => m.part === "tail").map((m) => m.sweepMilli ?? 0),
      );
      expect(tails.size).toBeLessThanOrEqual(1);
    }
  });

  it("winds the coil's two blades opposite ways, so which way has to be said", () => {
    const coil = INSTAR_SCRIPT.find((step) => step.pose === "coil");
    const ways = new Set(coil?.marks.map((m) => m.gesture));
    expect(ways).toEqual(new Set(["turn", "turnBack"]));
  });
});
