import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * A lobe filling, coming full and burning the column by itself. The beam
 * gathering, the ring closing round the colour button, the beam standing
 * afterwards and the wash it throws over the whole stage are the four things
 * THE LANCE adds to a frame, and none of them is reached by a run with no
 * commands in it.
 */

beforeAll(installCanvasGlobals);

function lanceFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 3, kind: "slick", color: "red" },
    { beat: 1, col: 3, kind: "slick", color: "red" },
    { beat: 2, col: 3, kind: "slick", color: "red" },
  ];
  // The thumb goes down on red and never comes up: the lobe fills for three
  // beats and the lance leaves on its own (`sim/lance.ts`).
  return runFrames(createWorld(CFG, 5, queue), role, ticks, {
    onTick: (tick, world) => {
      const inputs =
        tick === 0
          ? [{ tick, player: 1 as const, command: { kind: "cannonCol" as const, col: 3 } }]
          : tick === 1
            ? [
                {
                  tick,
                  player: 2 as const,
                  command: { kind: "prime" as const, on: true, color: "red" as const },
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

  it("actually got as far as a column burning", () => {
    // Otherwise the three drawing tests above are a run with an empty lobe in
    // it, and would stay green if the lance never went off.
    const { world } = lanceFrames("test", ticksPerBeat(CFG) * 4);
    expect(world.beam).not.toBeNull();
    // And nothing travelled: the beam is the weapon (`sim/lance.ts`).
    expect(world.bullets).toHaveLength(0);
  });
});
