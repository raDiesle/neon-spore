import { describe, expect, it } from "bun:test";
import { type Flight, flown } from "../src/instar-flight.js";
import { ENTER } from "../src/instar-poses.js";

/**
 * **THE INSTAR flies round, not across** (`instar-flight.ts`) — the owner,
 * 27 September 2026: *more important to the back and again to the front*.
 * A pass and a cross each go far behind the field and come round in front of
 * it, larger than at rest, without leaving the field by more than a head;
 * they go to the back first; they start and end on the body at rest; and the
 * head faces the way it flies, the profile mirrored on a lap's far half.
 */

const STEPS = 1000;
const ORBITS = ["passes", "cross"] as const;

function path(arrive: (typeof ORBITS)[number]): Flight[] {
  return Array.from({ length: STEPS + 1 }, (_, i) => flown(arrive, i / STEPS));
}

describe("THE INSTAR's flight", () => {
  for (const arrive of ORBITS) {
    it(`goes far behind the field and in front of it when it ${arrive}`, () => {
      const scales = path(arrive).map((f) => f.scale);
      expect(Math.min(...scales)).toBeLessThan(0.5);
      expect(Math.max(...scales)).toBeGreaterThan(1.1);
    });

    it(`stays within the field and a head either side when it ${arrive}`, () => {
      for (const f of path(arrive))
        expect(Math.abs(f.dxMilli)).toBeLessThanOrEqual(500 + ENTER.headR);
    });

    it(`goes to the back first, and dims there, when it ${arrive}`, () => {
      const early = path(arrive).slice(1, STEPS / 10);
      for (const f of early) expect(f.scale).toBeLessThan(1);
      const far = path(arrive).reduce((a, b) => (b.scale < a.scale ? b : a));
      expect(far.light).toBeLessThan(0.8);
    });

    it(`starts and ends on the body at rest when it ${arrive}`, () => {
      for (const t of [0, 1])
        expect(flown(arrive, t)).toEqual({ dxMilli: 0, dyMilli: 0, scale: 1, turn: 1, light: 1 });
    });

    it(`faces the way it flies when it ${arrive}`, () => {
      const p = path(arrive);
      // The full lap, between leaving and settling; where the body is nearly
      // end-on the direction on screen says little.
      for (let i = STEPS * 0.16; i < STEPS * 0.69; i++) {
        const [was, now] = [p[i - 1] as Flight, p[i] as Flight];
        const moved = now.dxMilli - was.dxMilli;
        if (Math.abs(now.turn) < 0.3 || Math.abs(moved) < 0.5) continue;
        expect(Math.sign(now.turn), `t ${i / STEPS}`).toBe(-Math.sign(moved));
      }
    });
  }
});
