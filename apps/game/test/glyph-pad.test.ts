import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MimicStep,
  mimicBoss,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { padDrawer } from "../src/glyph-pad.js";

/**
 * Whose stroke a stroke on THE MIMIC's pad is (`glyph-pad.ts`): only a seat
 * that owes a sign is ever signed, so the reader's phone sends nothing, and
 * the test screen's one hand is whichever seat is drawing.
 */

const step_ = (ask: MimicStep["ask"], reader: 1 | 2): MimicStep => ({
  ask,
  reader,
  changes: false,
  color: "either",
  beats: 10,
});

function toSign(steps: MimicStep[]): World {
  const world = createWorld({ ...DEFAULT_CONFIG }, 0);
  startWave(world, 0, [], [], { kind: "mimic", steps });
  for (let i = 0; i < 10_000 && mimicBoss(world)?.phase !== "sign"; i++) step(world, []);
  return world;
}

describe("the pad's seat", () => {
  it("is nobody with no mimic on the field", () => {
    expect(padDrawer(createWorld({ ...DEFAULT_CONFIG }, 0), [1, 2])).toBeNull();
  });

  it("is the drawer and never the reader", () => {
    const world = toSign([step_("sign", 1)]);
    expect(padDrawer(world, [2])).toBe(2);
    expect(padDrawer(world, [1])).toBeNull();
    expect(padDrawer(world, [1, 2])).toBe(2);
  });

  it("is the pilot first in a split on the test screen, and the navigator with Shift", () => {
    const world = toSign([step_("split", 1)]);
    expect(padDrawer(world, [1, 2])).toBe(1);
    expect(padDrawer(world, [1, 2], true)).toBe(2);
  });
});
