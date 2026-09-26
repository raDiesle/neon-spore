import { describe, expect, setDefaultTimeout, test } from "bun:test";
import { hashWorld } from "@neon-spore/sim";
import { cpuTimeout } from "../../test/cpu-time.js";
import { POSE_GROUPS } from "../src/poses.js";
import { BOSS_GROUPS } from "../src/poses-bosses.js";

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

// Half a second for all two hundred and ten, and a cap that rises with the
// machine (`tools/test/cpu-time.ts`): a pose is the simulation stepped until a
// named state arrives, which is arithmetic and nothing else, so under a full
// check it is slow for the machine's reasons and not its own. It was on bun's
// flat five seconds and went red on one of three runs of the same green tree.
// Raised 26 September 2026: two hundred and ten poses became two hundred and
// sixty-one as bosses shipped, and this file's own idle cost on a quiet cloud
// container (load average at or below one core) measured 9.7 s against the
// 8 s the old constant allowed — not a flake, arithmetic that grew.
setDefaultTimeout(cpuTimeout(1_300));

const ALL = POSE_GROUPS.flatMap((g) => g.poses.map((p) => [g.title, p] as const));

describe("every pose", () => {
  test("there are some, in every group of the game's", () => {
    expect(POSE_GROUPS.length).toBeGreaterThan(3);
    // A boss's group may stand empty while its states are owed — that is
    // `boss-states.test.ts`'s allowance to grant, not this one's.
    const bosses = new Set(BOSS_GROUPS);
    for (const g of POSE_GROUPS) {
      if (bosses.has(g)) continue;
      expect(g.poses.length, g.title).toBeGreaterThan(1);
    }
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
