import { describe, expect, test } from "bun:test";
import { CONTROL_SETS, controlSetForWave } from "@neon-spore/content";
import { setWorld } from "../src/controlsets-page.js";

/**
 * The one piece of `controlsets-page.ts` that does not need a canvas: the
 * world each card's panel is drawn from. Drawing the frame itself belongs to
 * a browser, the way `poses.test.ts` leaves `poseArt` untested and tests only
 * `pose.build()`.
 *
 * `controlSetForWave` reads a wave *index*, so the thing worth proving here
 * is that `setWorld` hands it an index that actually resolves back to the set
 * it was asked for — `packages/content/test/control-sets.test.ts` already
 * proves every set reaches at least one wave; this proves the page's own
 * lookup lands on one of them.
 */
describe("setWorld", () => {
  test("poses every registered set on a wave that plays it", () => {
    for (const set of CONTROL_SETS) {
      const world = setWorld(set);
      expect(controlSetForWave(world.wave).id, set.name).toBe(set.id);
    }
  });

  test("is a legal, unstarted world — nothing has run and nothing has ended", () => {
    for (const set of CONTROL_SETS) {
      const world = setWorld(set);
      expect(world.tick, set.name).toBe(0);
      expect(world.over, set.name).toBe(false);
    }
  });

  test("built fresh, so opening the page twice draws the same frame", () => {
    for (const set of CONTROL_SETS) {
      const a = setWorld(set);
      const b = setWorld(set);
      expect(a.wave, set.name).toBe(b.wave);
    }
  });
});
