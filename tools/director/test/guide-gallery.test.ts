import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { guideHolds } from "@neon-spore/sim";
import { guideWorld } from "../src/guide-gallery.js";
import { wavesWithGuides } from "../src/guide-waves.js";

/**
 * The piece of `guide-gallery.ts` that does not need a canvas: the posed world.
 * Drawing the frame itself belongs to a browser, the way `poses.test.ts`
 * leaves `poseArt` untested and tests only `pose.build()`.
 *
 * The grouping that used to be tested here went with the subjects it grouped.
 * A guide belongs to a wave, and waves are already in the order a pair plays
 * them, so the gallery has nothing left to sort.
 */

describe("guideWorld", () => {
  test("reaches the guide by the same two acks the phone sends", () => {
    for (const i of wavesWithGuides()) {
      const world = guideWorld(i);
      expect(guideHolds(world), `wave ${i + 1}`).toBe(true);
      // Both seats spent their ack getting past the introduction; the guide
      // is asking for two fresh ones.
      expect(world.brief.ack, `wave ${i + 1}`).toBe(0);
    }
  });

  test("poses the wave whose guide it is, so the heading and the words agree", () => {
    for (const i of wavesWithGuides()) {
      expect(guideWorld(i).wave, `wave ${i + 1}`).toBe(i);
    }
  });

  test("is a legal world — the hull is held, so nothing it poses can end its own run", () => {
    expect(guideWorld(0).over).toBe(false);
  });

  test("stops holding once the pair has read it", () => {
    const world = guideWorld(0);
    expect(WAVES[0]?.guide).toBeDefined();
    world.brief.ack = 0;
    expect(guideHolds(world)).toBe(true);
  });
});
