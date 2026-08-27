import { describe, expect, it } from "bun:test";
import { livingMotion, type OwnMotion, REST, SWAY_PUMP, TILT_RIPPLE } from "../src/own-motion.js";

/**
 * Spec 5.8: own-motion may not touch the lane. A creature that swayed half a
 * tile would sit over the column line, and the whole readability of the field
 * rests on a player being able to say "column four" and mean it.
 */
const LANE_LIMIT = 0.25;

function samples(m: OwnMotion): ReturnType<OwnMotion["poseAt"]>[] {
  const out = [];
  for (let t = 0; t < 64; t += 0.01) out.push(m.poseAt(t));
  return out;
}

describe("own-motion", () => {
  for (const m of [SWAY_PUMP, TILT_RIPPLE]) {
    it(`${m.name} stays inside its column`, () => {
      for (const p of samples(m)) {
        expect(Math.abs(p.dx)).toBeLessThan(LANE_LIMIT);
        expect(Math.abs(p.dy)).toBeLessThan(LANE_LIMIT);
      }
    });

    it(`${m.name} never collapses or inverts its scale`, () => {
      for (const p of samples(m)) {
        expect(p.sx).toBeGreaterThan(0.5);
        expect(p.sy).toBeGreaterThan(0.5);
        expect(p.sx).toBeLessThan(2);
        expect(p.sy).toBeLessThan(2);
      }
    });

    it(`${m.name} actually moves — a still motion is a missing one`, () => {
      const poses = samples(m);
      const moved = poses.some(
        (p) => Math.abs(p.dx) > 0.01 || Math.abs(p.rot) > 0.01 || Math.abs(p.sx - 1) > 0.01,
      );
      expect(moved).toBe(true);
    });
  }

  it("pairs each living kind with its own motion", () => {
    expect(livingMotion("bulb")).toBe(SWAY_PUMP);
    expect(livingMotion("slick")).toBe(TILT_RIPPLE);
  });

  it("rests at the identity", () => {
    expect(REST).toEqual({ dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 });
  });
});
