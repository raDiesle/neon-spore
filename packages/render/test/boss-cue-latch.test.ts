import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import type { World } from "@neon-spore/sim";
import { type BossCue, bossCues } from "../src/boss-cue.js";
import { latchKnobAt } from "../src/latch-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { posed, stood } from "./latch-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LATCH, and the words the field may say about it**
 * (`render/src/boss-cue-read-zu.ts`): `PULL` on the grip whose turn it is,
 * `HOLD` on the other while no thumb has it, and both a `HOLD` while the
 * colony rears for a yank. What is *not* said: a word over a knob already
 * being carried, and anything between levels.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");

function cues(world: World): readonly BossCue[] {
  return bossCues(l, world, 0, () => l.hullY);
}

const said = (world: World) => cues(world).map((c) => `${c.seat}:${c.word}`);

describe("THE LATCH", () => {
  it("tells the puller to pull and the holder to hold, each on their own grip", () => {
    const world = stood();
    const s = posed(world);
    const words = cues(world);
    expect(said(world)).toEqual(["1:PULL", "2:HOLD"]);
    for (const grip of [0, 1] as const) {
      const knob = latchKnobAt(l, CFG, s, grip);
      expect(words[grip]).toMatchObject({ x: knob.x, y: knob.y });
    }
  });

  it("goes quiet over a grip held, and over a pull already being carried", () => {
    const world = stood();
    posed(world, "level", (s) => {
      s.down = [true, true];
      s.depthMilli = [400, 0];
    });
    expect(said(world)).toEqual([]);
  });

  it("asks both seats to hold while the colony rears for a yank", () => {
    const world = stood();
    posed(world, "level", (s) => {
      s.yankBeat = world.beat + 1;
    });
    expect(said(world)).toEqual(["1:HOLD", "2:HOLD"]);
  });

  it.each(["enter", "rest", "spent"] as const)("says nothing while %s", (phase) => {
    const world = stood();
    posed(world, phase);
    expect(said(world)).toEqual([]);
  });
});
