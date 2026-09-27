import { afterEach, describe, expect, test } from "bun:test";
import { DEG, HUSH } from "../src/idle-drift.js";
import { PART_ROWS } from "../src/idle-drift-parts.js";
import {
  MECHANISM_SWING,
  mechanismSwing,
  type SwingBoss,
  windowStep,
} from "../src/mechanism-swing.js";

/**
 * **A mechanism swings only what hangs or hinges, and ships still**
 * (`mechanism-swing.ts`): the shipped reach draws nothing, a patched one
 * stays inside its row's range, THE SLOW's hush stills it, and no two parts
 * swing in step. The ceilings on speed are the part drift's own test.
 *
 * `boss-hush.test.ts` reads a mark off the state and never sees the canvas
 * turned under it, so the hush's own bound is held here: at a tenth, a mark
 * five tiles out from its joint — further than any of the three hangs —
 * moves under a tenth of a tile a second.
 */

const BOSSES: readonly SwingBoss[] = ["davit", "plumb", "sling"];
const ROW_RANGE: Record<SwingBoss, number> = {
  davit: PART_ROWS.hand.rotate[0],
  plumb: PART_ROWS.arm.rotate[0],
  sling: PART_ROWS.hand.rotate[0],
};
const times = Array.from({ length: 600 }, (_, i) => i * 0.1);

afterEach(() => {
  for (const b of BOSSES) MECHANISM_SWING[b] = 0;
});

describe("mechanismSwing", () => {
  test("is 0 for every boss as shipped", () => {
    for (const b of BOSSES) for (const t of times) expect(mechanismSwing(b, 0, t, 1)).toBe(0);
  });

  test("patched to the row's range, swings inside it and is stilled by a hush of 0", () => {
    for (const b of BOSSES) {
      MECHANISM_SWING[b] = 1;
      const angles = times.map((t) => mechanismSwing(b, 0, t, 1));
      const widest = Math.max(...angles.map(Math.abs));
      expect(widest, b).toBeLessThanOrEqual(ROW_RANGE[b] * DEG + 1e-9);
      expect(widest, b).toBeGreaterThan(ROW_RANGE[b] * DEG * 0.3);
      for (const t of times) expect(mechanismSwing(b, 0, t, 0)).toBe(0);
    }
  });

  test("swings THE SLING's two tines out of step", () => {
    MECHANISM_SWING.sling = 1;
    const apart = times.some(
      (t) => Math.abs(mechanismSwing("sling", 0, t, 1) - mechanismSwing("sling", 1, t, 1)) > DEG,
    );
    expect(apart).toBe(true);
  });

  test("hushed for a live mark, moves a mark five tiles out under a tenth of a tile a second", () => {
    const REACH = 5; // tiles
    const dt = 0.01;
    for (const b of BOSSES) {
      MECHANISM_SWING[b] = 1;
      let fastest = 0;
      for (let t = 0; t < 60; t += dt) {
        const turn =
          mechanismSwing(b, 0, t + dt, HUSH.liveMark) - mechanismSwing(b, 0, t, HUSH.liveMark);
        fastest = Math.max(fastest, (Math.abs(turn) * REACH) / dt);
      }
      expect(fastest, b).toBeLessThan(0.1);
    }
  });
});

describe("windowStep", () => {
  const steps = ["a", "b", "c"];

  test("names the lit step, and the one before the cursor once it rests", () => {
    expect(windowStep({ phase: "still", steps, cursor: 0 })).toBe("a");
    expect(windowStep({ phase: "lit", steps, cursor: 1 })).toBe("b");
    expect(windowStep({ phase: "rest", steps, cursor: 2 })).toBe("b");
    expect(windowStep({ phase: "free", steps, cursor: 3 })).toBe("c");
  });
});
