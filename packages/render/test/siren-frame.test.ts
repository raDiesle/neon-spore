import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, step, ticksPerBeat } from "@neon-spore/sim";
import { commsCall } from "../src/comms.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE SIREN says which of the two is holding half a picture, and therefore
 * which of them has to say something. It reads the field rather than an event,
 * so a frame proves nothing about it and the roster is checked directly.
 */

beforeAll(installCanvasGlobals);

describe("the siren", () => {
  const TICKS = ticksPerBeat(CFG) * 6;

  function callAfter(queue: SpawnEntry[], ticks: number) {
    const world = createWorld(CFG, 1, queue);
    for (let tick = 0; tick < ticks; tick++) step(world, []);
    return commsCall(world);
  }

  it("says nothing while the field holds only bodies both of them can see", () => {
    expect(callAfter([{ beat: 0, col: 3, kind: "bulb", color: "cyan" }], TICKS)).toBeNull();
  });

  it("puts the pilot on the mouth for a veil and the navigator on the ear", () => {
    const call = callAfter([{ beat: 0, col: 3, kind: "veil", color: null }], TICKS);
    expect(call).toEqual({ p1: true, p2: false });
  });

  it("turns it round for a lure", () => {
    const call = callAfter(
      [{ beat: 0, col: 3, kind: "lure", color: "cyan", wears: "bulb" }],
      TICKS,
    );
    expect(call).toEqual({ p1: false, p2: true });
  });

  it("has both of them talking when both are holding half a picture", () => {
    const call = callAfter(
      [
        { beat: 0, col: 1, kind: "veil", color: null },
        { beat: 0, col: 5, kind: "lure", color: "red", wears: "slick" },
      ],
      TICKS,
    );
    expect(call).toEqual({ p1: true, p2: true });
  });

  it("lights for a torch while it is still on the strip, and not for a meteor at all", () => {
    // The one kind whose call starts before it arrives — it is the fastest
    // thing in the game, so a warning that begins on impact begins too late.
    // The rocks beside it are deliberately not on the roster: one is in nearly
    // every wave, and a siren lit all wave is a lamp.
    expect(callAfter([{ beat: 4, col: 1, kind: "torch", color: null }], 1)).toEqual({
      p1: true,
      p2: false,
    });
    expect(callAfter([{ beat: 4, col: 1, kind: "meteor", color: null }], 1)).toBeNull();
  });

  it("draws over a frame without the canvas refusing a value", () => {
    for (const role of ROLES) {
      const queue: SpawnEntry[] = [{ beat: 0, col: 3, kind: "veil", color: null }];
      const { ctx } = runFrames(createWorld(CFG, 1, queue), role, TICKS);
      expect(ctx.calls).toBeGreaterThan(0);
    }
  });
});
