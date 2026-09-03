import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE TORCH in flight and the alarm it lights.
 *
 * The shield is never in its column: every torch reaches the hull and deflects
 * nothing, so both the miss (span scars, single breach) and the deflect path
 * get exercised across the two queued torches and every role.
 */

beforeAll(installCanvasGlobals);

function torchFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 1, kind: "torch", color: null },
    { beat: 6, col: 5, kind: "torch", color: null },
  ];
  const tpb = ticksPerBeat(CFG);
  return runFrames(createWorld(CFG, 3, queue), role, ticks, {
    onTick: (tick, world) => {
      step(world, tick === 1 ? [{ tick, player: 2, command: { kind: "shieldCol", col: 5 } }] : []);
      if (tick % tpb === 1) step(world, [{ tick, player: 1, command: { kind: "guard" } }]);
    },
  });
}

describe("the torch", () => {
  for (const role of ROLES) {
    it(`draws in flight and the alarm for ${role} without the canvas refusing a value`, () => {
      const { ctx } = torchFrames(role, ticksPerBeat(CFG) * 10);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }
});
