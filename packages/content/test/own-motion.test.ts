import { describe, expect, it } from "bun:test";
import {
  HOLD,
  livingMotion,
  type OwnMotion,
  REST,
  SWAY_PUMP,
  TILT_RIPPLE,
  TREMBLE,
} from "../src/own-motion.js";

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

/** The furthest a motion's own signal reaches, all four channels summed. */
function reach(m: OwnMotion): number {
  let worst = 0;
  for (const p of samples(m)) {
    const r =
      Math.abs(p.dx) + Math.abs(p.dy) + Math.abs(p.rot) + Math.abs(p.sx - 1) + Math.abs(p.sy - 1);
    if (r > worst) worst = r;
  }
  return worst;
}

describe("own-motion", () => {
  for (const m of [SWAY_PUMP, TILT_RIPPLE, TREMBLE, HOLD]) {
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
    expect(livingMotion("runt")).toBe(TREMBLE);
    expect(livingMotion("throb")).toBe(HOLD);
  });

  it("the runt and the throb no longer borrow the slick's tilt", () => {
    // The bug this file exists to fix: both used to fall through to
    // TILT_RIPPLE, so the runt twitched like a slick and the throb tilted
    // like one.
    expect(livingMotion("runt")).not.toBe(TILT_RIPPLE);
    expect(livingMotion("throb")).not.toBe(TILT_RIPPLE);
  });

  it("the throb's own-motion is the smallest of the four — it must not compete with the beat", () => {
    const throbReach = reach(HOLD);
    expect(throbReach).toBeLessThan(reach(SWAY_PUMP));
    expect(throbReach).toBeLessThan(reach(TILT_RIPPLE));
    expect(throbReach).toBeLessThan(reach(TREMBLE));
  });

  it("the throb never rotates or scales — either would shadow throbOpen's own pulse", () => {
    for (const p of samples(HOLD)) {
      expect(p.rot).toBe(0);
      expect(p.sx).toBe(1);
      expect(p.sy).toBe(1);
    }
  });

  it("rests at the identity", () => {
    expect(REST).toEqual({ dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 });
  });
});
