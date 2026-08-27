import { describe, expect, test } from "bun:test";
import { hashWorld } from "@neon-spore/sim";
import { POSE_GROUPS } from "../src/poses.js";

/**
 * Every pose, built.
 *
 * A pose runs the simulation until the state it is named after arrives, and
 * throws if it never does — so this is the test that keeps the STATES sheet's
 * captions attached to its pictures. A tuning change that stops the queen ever
 * blooming inside the budget, or a rock that stops deflecting, fails here
 * rather than showing a frame of something else under a label that says bloom.
 *
 * It is also the only test that runs the poses at all: the drawing is a canvas
 * and belongs to a browser, but everything that decides *what* is drawn is
 * simulation, and simulation is testable.
 */

const ALL = POSE_GROUPS.flatMap((g) => g.poses.map((p) => [g.title, p] as const));

describe("every pose", () => {
  test("there are some, in every group", () => {
    expect(POSE_GROUPS.length).toBeGreaterThan(3);
    for (const g of POSE_GROUPS) expect(g.poses.length, g.title).toBeGreaterThan(1);
  });

  for (const [group, pose] of ALL) {
    test(`${group} · ${pose.name} reaches the state it is named after`, () => {
      const world = pose.build();
      // A world that never ran is a world posed by assignment, which is the
      // one thing `pose-kit.ts` says a pose may not be.
      expect(world.tick).toBeGreaterThan(0);
      // And it is a legal world: the run is held, so no pose ends its own run.
      expect(world.over).toBe(false);
    });
  }

  test("is built fresh, so opening the sheet twice draws the same frames", () => {
    for (const [group, pose] of ALL) {
      const a = pose.build();
      const b = pose.build();
      expect(hashWorld(a), `${group} · ${pose.name}`).toBe(hashWorld(b));
    }
  });

  test("names what it frames, and a tile crop knows where to look", () => {
    for (const [group, pose] of ALL) {
      const label = `${group} · ${pose.name}`;
      expect(pose.name, label).toMatch(/^[A-Z]/);
      expect(pose.note.length, label).toBeGreaterThan(40);
      if (pose.crop !== "tile") continue;
      const where = pose.at?.(pose.build());
      expect(where, `${label} crops a tile and must say which`).toBeDefined();
    }
  });
});
