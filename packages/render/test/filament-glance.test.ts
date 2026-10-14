import { describe, expect, it } from "bun:test";
import { FILAMENT_GLANCE, FILAMENT_GLANCE_SIZE } from "../src/filament-glance.js";
import { heartYaw } from "../src/filament-heart-look.js";
import { bodyLife } from "../src/motion-life.js";

/**
 * **THE FILAMENT's heart turns and cocks** (`filament-glance.ts`): COCK at
 * the idle sway's reach, rolling both ways about its apex, and the heart
 * reads its yaw from the record.
 */

describe("THE FILAMENT's heart turn", () => {
  it("turns as far as the idle sway did, rolls both ways, and the heart reads it", () => {
    let widest = 0;
    const rolls: number[] = [];
    // A whole cycle of its temper, which reaches the full turn once in five rounds.
    for (let t = 0; t < 45; t += 0.05) {
      expect(heartYaw(t)).toBe(FILAMENT_GLANCE.swing(t));
      widest = Math.max(widest, Math.abs(FILAMENT_GLANCE.swing(t)));
      rolls.push(FILAMENT_GLANCE.roll(t));
    }
    expect(widest).toBeCloseTo(FILAMENT_GLANCE_SIZE.reach * bodyLife(), 2);
    expect(Math.max(...rolls)).toBeGreaterThan(0);
    expect(Math.min(...rolls)).toBeLessThan(0);
  });
});
