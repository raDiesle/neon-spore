import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE LURE, drawn: the body player 1 sees, the alarm player 2 sees over it,
 * and the fold both of them see when it goes.
 *
 * Nothing here can answer whether the disguise *reads* — that is the check
 * this lane owes and it needs two phones. What it can hold is the shape of the
 * arrangement: that the alarm is drawn on one seat and not the other, that
 * neither seat's frame throws, and that a lure at either edge of the field
 * still puts its label somewhere the canvas will accept.
 */

beforeAll(installCanvasGlobals);

function lureFrames(role: ViewRole, col: number, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "lure", color: "cyan", wears: "bulb" }];
  const { ctx, events } = runFrames(createWorld(CFG, 1, queue), role, ticks);
  return { ctx, vanished: events.filter((e) => e.type === "lureVanished").length };
}

describe("the lure", () => {
  // Far enough to carry it past the row it goes on, so every frame this
  // creature ever produces — body, alarm and fold — has been through the
  // canvas that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 20;

  for (const role of ROLES) {
    it(`draws the body, its alarm and its fold for ${role}`, () => {
      const { ctx, vanished } = lureFrames(role, 3, TICKS);
      expect(vanished).toBe(1);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("puts the alarm on player 2's screen and nothing extra on player 1's", () => {
    // Same world, same ticks, same body — the ring, the exclamation and the
    // label are the entire difference between the two frames.
    const p1 = lureFrames("p1", 3, TICKS);
    const p2 = lureFrames("p2", 3, TICKS);
    expect(p2.ctx.calls).toBeGreaterThan(p1.ctx.calls);
  });

  it("keeps its label on screen in the first column and the last", () => {
    for (const col of [0, CFG.cols - 1]) {
      expect(() => lureFrames("p2", col, TICKS)).not.toThrow();
    }
  });
});
