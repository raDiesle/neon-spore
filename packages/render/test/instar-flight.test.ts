import { describe, expect, it } from "bun:test";
import { flown } from "../src/instar-flight.js";

/**
 * **THE INSTAR flies the way its head faces** (`instar-flight.ts`): the
 * profile looks left, so while it is on screen and moving across, it moves
 * right to left. A pass the other way is a body flying backwards, tail first.
 */

const ON = 1000;

describe("THE INSTAR's flight", () => {
  for (const arrive of ["passes", "cross"] as const) {
    it(`never moves rightward on screen while it ${arrive}`, () => {
      let prev = flown(arrive, 0);
      for (let i = 1; i <= 400; i++) {
        const now = flown(arrive, i / 400);
        const seen = Math.abs(prev.dxMilli) < ON && Math.abs(now.dxMilli) < ON;
        if (seen) expect(now.dxMilli).toBeLessThanOrEqual(prev.dxMilli + 1e-6);
        prev = now;
      }
    });
  }
});
