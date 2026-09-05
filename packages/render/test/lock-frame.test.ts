import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, isLockedOn, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE LOCK, as a picture: the frame over the body player 1 is holding, and the
 * bolt that curves into it.
 *
 * Both halves are drawn from world state rather than from events, and both
 * carry a number that was zero for the whole life of this game until now — a
 * bullet standing between two columns, and a tail laid down at an angle. So
 * what this asserts is what every frame test here asserts: that no value
 * handed to the canvas is one a real canvas would refuse.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** A body seven columns from the cannon, a hand on it, and a shot sent after
 * it — which is a bolt that spends its whole flight between two columns. */
function lockedFrames(role: (typeof ROLES)[number], queue: SpawnEntry[]) {
  return runFrames(createWorld(CFG, 5, queue), role, TPB * 5, {
    every: 2,
    onTick: (tick, w) => {
      if (tick === 0) step(w, [{ tick, player: 1, command: { kind: "cannonCol", col: 1 } }]);
      else if (tick === TPB) step(w, [{ tick, player: 1, command: { kind: "grip", id: 1 } }]);
      else if (tick === TPB * 2)
        step(w, [{ tick, player: 2, command: { kind: "fire", color: "red" } }]);
      else step(w, []);
    },
  });
}

const SLICK: SpawnEntry[] = [{ beat: 0, col: 8, kind: "slick", color: "red" }];
const ROCK: SpawnEntry[] = [{ beat: 0, col: 8, kind: "meteor", color: null }];

describe("a locked body and the bolt going to it", () => {
  for (const role of ROLES) {
    it(`draws the frame and the curve for ${role} without the canvas refusing a value`, () => {
      const { ctx } = lockedFrames(role, SLICK);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }

  it("is drawn on both screens, because the seat that fires is the other one", () => {
    const p1 = lockedFrames("p1", SLICK);
    const p2 = lockedFrames("p2", SLICK);
    expect(p1.ctx.calls).toBeGreaterThan(0);
    expect(p2.ctx.calls).toBeGreaterThan(0);
  });

  it("wears no frame over a rock, which is held and cannot be shot", () => {
    const { world } = lockedFrames("p1", ROCK);
    expect(world.gripP1).toBe(1);
    expect(isLockedOn(world, 1)).toBe(false);
  });

  it("wears one over the body it is actually promised to", () => {
    const { world } = lockedFrames("p1", SLICK);
    // The slick is shot down partway through, so the run is checked at the
    // moment the hand went on rather than at the end.
    const w = createWorld(CFG, 5, SLICK);
    for (let t = 0; t <= TPB; t++) {
      step(w, t === TPB ? [{ tick: t, player: 1, command: { kind: "grip", id: 1 } }] : []);
    }
    expect(isLockedOn(w, 1)).toBe(true);
    expect(world.creatures).toHaveLength(0);
  });
});
