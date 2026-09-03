import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * A lobe filling, coming full and going out as a lance. The mark on the field,
 * the ring on the button and the shot in flight are the three things THE LANCE
 * adds to a frame, and none of them is reached by a run with no commands in it.
 */

beforeAll(installCanvasGlobals);

function lanceFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 3, kind: "slick", color: "red" },
    { beat: 1, col: 3, kind: "slick", color: "red" },
    { beat: 2, col: 3, kind: "slick", color: "red" },
  ];
  const full = CFG.lancePrimeBeats * ticksPerBeat(CFG);
  return runFrames(createWorld(CFG, 5, queue), role, ticks, {
    onTick: (tick, world) => {
      const inputs =
        tick === 0
          ? [{ tick, player: 1 as const, command: { kind: "cannonCol" as const, col: 3 } }]
          : tick === 1
            ? [{ tick, player: 1 as const, command: { kind: "prime" as const, on: true } }]
            : tick === full + 2
              ? [
                  {
                    tick,
                    player: 2 as const,
                    command: { kind: "fire" as const, color: "red" as const },
                  },
                ]
              : [];
      step(world, inputs);
    },
  });
}

describe("the lance", () => {
  for (const role of ROLES) {
    it(`draws the fill, the mark and the shot for ${role} without the canvas refusing a value`, () => {
      const { ctx } = lanceFrames(role, ticksPerBeat(CFG) * 8);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("actually got as far as a lance in flight", () => {
    // Otherwise the three drawing tests above are a run with an empty lobe in
    // it, and would stay green if the lance never left.
    const { world } = lanceFrames("test", ticksPerBeat(CFG) * 4);
    expect(world.bullets.some((b) => b.lance)).toBe(true);
  });
});
