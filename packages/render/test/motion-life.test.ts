import { afterEach, describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { stoneRock } from "../src/cairn-rock.js";
import type { PartAngles } from "../src/idle-drift-parts.js";
import { bodyLife, motionLife, setMotionLife } from "../src/motion-life.js";
import { outlinePose } from "../src/outline-drift.js";
import { partOn } from "../src/outline-parts.js";
import { tasterSway } from "../src/taster-sway.js";

/**
 * THE BOSSES' `life` level (`motion-life.ts`): the motion setting at 0 draws
 * every part at its parent's angles exactly and halves the body drift, on the
 * drawers and on the hit tests that read the same pose.
 */

afterEach(() => setMotionLife(1));

const TIMES = Array.from({ length: 40 }, (_, i) => 0.37 + i * 0.73);
const parent = (t: number): PartAngles => ({
  turn: 0.1 * Math.sin(t),
  tilt: 0.05 * Math.cos(t * 0.7),
  rotate: 0.2 * Math.sin(t * 1.3),
});

describe("the life level", () => {
  test("is clamped to 0..1, and a still device keeps half the body drift", () => {
    setMotionLife(2);
    expect(motionLife()).toBe(1);
    setMotionLife(-1);
    expect(motionLife()).toBe(0);
    expect(bodyLife()).toBe(0.5);
  });

  test("at 0 a part takes its parent's angles exactly", () => {
    setMotionLife(0);
    const part = partOn("reprise", 1, "head", parent, 0.6, 1);
    for (const t of TIMES) expect(part(t)).toEqual(parent(t));
    for (const t of TIMES) expect(stoneRock(2, t, 1, 0.8)).toBe(0);
  });

  test("at 1 the same part moves on its own", () => {
    const part = partOn("reprise", 1, "head", parent, 0.6, 1);
    const moved = TIMES.filter((t) => Math.abs(part(t).rotate - parent(t).rotate) > 1e-3);
    expect(moved.length).toBeGreaterThan(TIMES.length / 2);
  });

  test("at 0 the body's pose and sway are half what they are at 1", () => {
    const full = TIMES.map((t) => outlinePose("warden", t, 1, 80, 40));
    const sway = TIMES.map((t) => tasterSway(DEFAULT_CONFIG, "fanning", 1, t, 0.25));
    setMotionLife(0);
    TIMES.forEach((t, i) => {
      const half = outlinePose("warden", t, 1, 80, 40);
      expect(half?.roll).toBeCloseTo((full[i]?.roll ?? 0) / 2, 9);
      expect(half?.dx).toBeCloseTo((full[i]?.dx ?? 0) / 2, 9);
      expect(tasterSway(DEFAULT_CONFIG, "fanning", 1, t, 0.25)).toBeCloseTo((sway[i] ?? 0) / 2, 9);
    });
  });
});
