import { describe, expect, test } from "bun:test";
import { creatureGlance, ROVERS } from "../src/creature-glance.js";
import { type GlanceFrame, glancedPoint, glanceStill } from "../src/glance.js";
import { cock, GLANCE_ROUND, glanceOf, rove } from "../src/glance-styles.js";

/**
 * **ROVE looks up and down as well as across** (`glance-styles.ts`), and a
 * part that nods is turned exactly as one that swings, a quarter round on
 * (`glance.ts`). Every other style gives no nod, so every part that does not
 * rove is drawn by the calls it always was.
 */

const SIZE = { reach: 0.22, cock: 0.14, tilt: 0 };
const STEPS = 600;
const round = Array.from({ length: STEPS + 1 }, (_, i) => rove((i * GLANCE_ROUND) / STEPS, SIZE));

describe("ROVE", () => {
  test("looks up, down, left and right, and no further than its reach", () => {
    const nods = round.map((p) => p.nod ?? 0);
    const swings = round.map((p) => p.swing);
    expect(Math.min(...nods)).toBeCloseTo(-SIZE.reach, 9);
    expect(Math.max(...nods)).toBeCloseTo(SIZE.reach, 9);
    expect(Math.min(...swings)).toBeCloseTo(-SIZE.reach, 9);
    expect(Math.max(...swings)).toBeCloseTo(SIZE.reach, 9);
    for (const p of round)
      expect(Math.hypot(p.swing, p.nod ?? 0)).toBeLessThanOrEqual(SIZE.reach + 1e-9);
  });

  test("begins and ends its round at the middle, level", () => {
    for (const p of [round[0], round[STEPS - 1], round[STEPS]]) {
      expect(Math.abs(p?.swing ?? 1)).toBeLessThan(1e-3);
      expect(Math.abs(p?.nod ?? 1)).toBeLessThan(1e-3);
      expect(Math.abs(p?.roll ?? 1)).toBeLessThan(1e-3);
    }
  });

  test("cocks toward a look to the side and holds level on one up or down", () => {
    for (const p of round) expect(p.roll).toBeCloseTo((SIZE.cock * p.swing) / SIZE.reach, 9);
  });

  test("is the only style whose record nods", () => {
    expect(glanceOf(cock, SIZE).nod).toBeUndefined();
    expect(glanceOf(rove, SIZE).nod).toBeDefined();
  });

  test("is what a roving kind wears, and only a living one", () => {
    expect(ROVERS.has("bulb")).toBe(true);
    expect(creatureGlance(9001, "living", "bulb").nod).toBeDefined();
    expect(creatureGlance(9002, "living", "slick").nod).toBeUndefined();
    expect(creatureGlance(9003, "rock", "bulb").nod).toBeUndefined();
  });
});

describe("a nodding part's points", () => {
  const at = { x: 50, y: 80, r: 20, hold: 0 };
  const across: GlanceFrame = { ...at, swing: 4, roll: 0 };
  const down: GlanceFrame = { ...at, swing: 0, roll: 0, nod: 4 };

  test("are the swinging part's, a quarter round on", () => {
    for (const [dx, dy] of [
      [10, 3],
      [-12, 7],
      [5, -15],
      [-8, -9],
    ] as const) {
      // A point (dx, dy) under a swing is where (−dy, dx) goes under a nod, turned a quarter.
      const a = glancedPoint(across, { x: at.x + dx, y: at.y + dy });
      const d = glancedPoint(down, { x: at.x - dy, y: at.y + dx });
      expect(d.x - at.x).toBeCloseTo(-(a.y - at.y), 9);
      expect(d.y - at.y).toBeCloseTo(a.x - at.x, 9);
    }
  });

  test("hold the centre, and the frame is not still", () => {
    expect(glancedPoint(down, at)).toEqual({ x: at.x, y: at.y });
    expect(glanceStill(down)).toBe(false);
    expect(glanceStill({ ...down, nod: 0 })).toBe(true);
  });
});
