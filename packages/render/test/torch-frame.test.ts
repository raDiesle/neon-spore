import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { torchWarning } from "../src/torch-alarm.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TORCH in flight and the alarm it lights.
 *
 * The shield is never in its column: every torch reaches the hull and deflects
 * nothing, so both the miss (span scars, single breach) and the deflect path
 * get exercised across the two queued torches and every role.
 *
 * A torch is one tile wide or two now (`RockSize`), so the narrow one is drawn
 * here as well: it is the body a coil's dome leaves behind, and it is a width
 * a wave may author directly.
 */

beforeAll(installCanvasGlobals);

function torchFrames(role: ViewRole, ticks: number) {
  const queue: SpawnEntry[] = [
    { beat: 0, col: 1, kind: "torch", color: null },
    { beat: 6, col: 5, kind: "torch", color: null },
    { beat: 12, col: 8, kind: "torch", color: null, span: 1 },
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

describe("the alarm ahead of one", () => {
  it("names the columns the body will actually cover, at either width", () => {
    // Read off the queue entry's own span rather than off the kind. A band
    // drawn two wide over a one-tile torch tells player 1 to call a column the
    // plate never has to cover, which is the pair rehearsing the wrong lane.
    const wide = createWorld(CFG, 3, [{ beat: 1, col: 4, kind: "torch", color: null }]);
    expect(torchWarning(wide, CFG.radarLead)?.span).toBe(2);
    const narrow = createWorld(CFG, 3, [{ beat: 1, col: 4, kind: "torch", color: null, span: 1 }]);
    expect(torchWarning(narrow, CFG.radarLead)?.span).toBe(1);
  });
});
