import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { ackBriefing, guideHolds, introHolds } from "@neon-spore/sim";
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
  test("stands on the guide, which is what a wave opens on", () => {
    for (const i of wavesWithGuides()) {
      const world = guideWorld(i);
      expect(guideHolds(world), `wave ${i + 1}`).toBe(true);
      // No ack has been spent: the guide is the first state, and it is asking
      // for two fresh holds.
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

  test("gives way to the wave's introduction once the pair has read it", () => {
    const world = guideWorld(0);
    expect(WAVES[0]?.guide).toBeDefined();
    ackBriefing(world, 1);
    ackBriefing(world, 2);
    expect(guideHolds(world)).toBe(false);
    expect(introHolds(world)).toBe(true);
  });
});
