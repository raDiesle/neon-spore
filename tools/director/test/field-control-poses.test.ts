import { describe, expect, test } from "bun:test";
import { gumIsStuck, readyFraction, wardenTether } from "@neon-spore/sim";
import { FIELD_CONTROLS } from "../src/field-controls-page.js";
import { poseNamed } from "../src/poses.js";
import { FIELD_CONTROL_GROUP } from "../src/poses-field-controls.js";

/**
 * Every ON THE FIELD row names a pose the gallery has, and the five poses
 * made for that tab reach the state each row's picture is meant to show.
 * The drawing is a canvas and belongs to a browser; what is drawn is a world,
 * and a world is testable.
 */
describe("ON THE FIELD rows and their pictures", () => {
  test("every row names a pose in the gallery", () => {
    for (const c of FIELD_CONTROLS) {
      expect(() => poseNamed(c.pose), `${c.name} → ${c.pose}`).not.toThrow();
    }
  });

  test("every pose made for the tab is used by a row", () => {
    const used = new Set(FIELD_CONTROLS.map((c) => c.pose));
    for (const p of FIELD_CONTROL_GROUP.poses) expect(used.has(p.name), p.name).toBe(true);
  });

  test("the rope is taut and the hand is on it", () => {
    const w = poseNamed("TETHER · HELD TAUT").build();
    expect(wardenTether(w)).not.toBeNull();
    const b = w.boss;
    if (b === null || b.kind !== "warden") throw new Error("no warden");
    expect(b.pulling).toBe(true);
    expect(b.pullYMilli).toBeGreaterThanOrEqual(w.cfg.wardenTautMilli);
  });

  test("both balloon handles are taut and the skin has not given", () => {
    const w = poseNamed("BALLOON · BOTH HANDS TAUT").build();
    const balloons = w.creatures.filter((c) => c.kind === "balloon");
    expect(balloons).toHaveLength(1);
    const b = balloons[0];
    expect(b?.balloonPullP1).toBe(-w.cfg.balloonTautMilli);
    expect(b?.balloonPullP2).toBe(w.cfg.balloonTautMilli);
  });

  test("the gum is stuck in the cannon's column", () => {
    const w = poseNamed("GUM · STUCK ON THE SHIP").build();
    const gum = w.creatures.find(gumIsStuck);
    expect(gum).toBeDefined();
    expect(gum?.col).toBe(w.cannonCol);
  });

  test("one ready circle is part full and the other empty", () => {
    const w = poseNamed("GUIDE · THE READY CIRCLES").build();
    expect(readyFraction(w, 1)).toBeGreaterThan(0.2);
    expect(readyFraction(w, 1)).toBeLessThan(0.8);
    expect(readyFraction(w, 2)).toBe(0);
  });
});
