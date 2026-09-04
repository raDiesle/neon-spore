import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { briefingHolds, guideHolds, introHolds, OPENING_GUIDE } from "@neon-spore/sim";
import { AUTHORED_WAVE_COUNT, waveOpeningWorld, wavesWithGuides } from "../src/guide-waves.js";

/**
 * What the guide sheets draw, tested the way `poses.test.ts` tests a pose: the
 * simulation part is testable and belongs to a headless run, the canvas it is
 * drawn to belongs to a browser.
 *
 * There is much less to test than there was, and that is the change rather
 * than a loss of cover: this file used to pin down a replay of the whole
 * campaign that worked out which wave first raised each card. A guide is
 * written in its wave now, so the only questions left are whether the pose is
 * reachable and whether the mark on the rail agrees with the data.
 */

describe("waveOpeningWorld", () => {
  test("poses every authored wave on the first state it opens on", () => {
    // The guide when the wave carries one, the introduction when it does not:
    // the guide comes first now, so a wave with one never stands on its name
    // until the gate has been crossed (`packages/sim/src/briefing.ts`).
    for (let i = 0; i < AUTHORED_WAVE_COUNT; i++) {
      const world = waveOpeningWorld(i);
      const guided = WAVES[i]?.guide !== undefined;
      expect(guided ? guideHolds(world) : introHolds(world), `wave ${i + 1}`).toBe(true);
    }
  });

  test("a fresh world reaches this without ending its own run", () => {
    const world = waveOpeningWorld(0);
    expect(world.over).toBe(false);
  });

  test("carries the wave's own guide behind the introduction, and nothing when it has none", () => {
    for (let i = 0; i < AUTHORED_WAVE_COUNT; i++) {
      expect(waveOpeningWorld(i).brief.guide, `wave ${i + 1}`).toBe(WAVES[i]?.guide !== undefined);
    }
  });
});

describe("wavesWithGuides", () => {
  test("is exactly the waves whose data carries a guide", () => {
    const expected = WAVES.map((w, i) => (w.guide ? i : -1)).filter((i) => i >= 0);
    expect(wavesWithGuides()).toEqual(expected);
  });

  test("wave 1 is one of them — it carries the split itself", () => {
    expect(wavesWithGuides()).toContain(0);
  });

  test("a wave it lists really does hold the field twice over", () => {
    for (const i of wavesWithGuides()) {
      const world = waveOpeningWorld(i);
      world.brief.ack = 0;
      // The introduction passes, and the guide is what is left holding.
      world.brief.phase = OPENING_GUIDE;
      expect(guideHolds(world), `wave ${i + 1}`).toBe(true);
      expect(briefingHolds(world), `wave ${i + 1}`).toBe(true);
    }
  });
});
