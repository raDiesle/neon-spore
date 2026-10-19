import { describe, expect, it } from "bun:test";
import { createWorld, type PlacedFault, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import { faultBeamEnds } from "../src/fault-beam-ends.js";
import { computeLayout } from "../src/layout.js";
import { CFG, VIEWPORT } from "./frame-harness.js";

/**
 * THE SWAP hangs no beam from the lantern. It fell through to the runaway
 * cannon's branch on the day it landed and lit both colour lobes and the
 * muzzle — a picture of a different fault (`fault-beam-ends.ts`).
 */
describe("THE SWAP's beam", () => {
  it("has no ends, on any screen, while the panels are away", () => {
    const world = createWorld({ ...CFG, hullInvulnerable: true }, 3);
    startWave(world, 0, [], [], null, false, 0, [{ kind: "swap", at: 0, beats: 0 } as PlacedFault]);
    for (let t = 0; t < ticksPerBeat(CFG) * 2; t++) step(world, []);
    const lobes = [
      { id: "fireRed", x: 10, y: 10, r: 5 },
      { id: "fireCyan", x: 30, y: 10, r: 5 },
    ];
    for (const role of ["p1", "p2", "test"] as const) {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(faultBeamEnds(l, world, lobes, true, true)).toEqual([]);
    }
  });
});
