import { describe, expect, it } from "bun:test";
import { FILAMENT_GLANCE, FILAMENT_GLANCE_SIZE } from "../src/filament-glance.js";
import { heartYaw } from "../src/filament-heart-look.js";
import { cock, glanceOf, look } from "../src/glance-styles.js";

/**
 * **THE FILAMENT's heart ships turning** (`filament-glance.ts`): unlike every
 * other boss's record, this one is the idle sway the heart always had — a
 * yaw there and back with no roll — and the heart reads its yaw from it.
 */

describe("THE FILAMENT's heart turn", () => {
  it("ships as the idle sway, with no roll, and the heart reads it", () => {
    let widest = 0;
    for (let t = 0; t < 8; t += 0.25) {
      expect(FILAMENT_GLANCE.roll(t)).toBe(0);
      expect(heartYaw(t)).toBe(FILAMENT_GLANCE.swing(t));
      widest = Math.max(widest, Math.abs(FILAMENT_GLANCE.swing(t)));
    }
    expect(widest).toBeCloseTo(FILAMENT_GLANCE_SIZE.reach, 2);
  });

  it("is offered held and cocked, each rolling about its apex", () => {
    for (const style of [look, cock]) {
      const g = glanceOf(style, FILAMENT_GLANCE_SIZE);
      const rolls = Array.from({ length: 61 }, (_, i) => g.roll(i * 0.1));
      expect(Math.max(...rolls)).toBeGreaterThan(0);
      expect(Math.min(...rolls)).toBeLessThan(0);
    }
  });
});
