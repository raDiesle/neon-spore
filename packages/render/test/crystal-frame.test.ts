import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  crystalMiddleCol,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { claspResonanceIn } from "../src/clasp.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CRYSTAL, drawn — through the canvas that refuses what a real one refuses
 * (`frame.test.ts`). Whether the craft reads as a craft or the field's hole
 * says "the shield is here" needs a phone; what this holds is that a whole
 * one paints on both screens, held and not, that the beat it is opened on and
 * the two bodies after it paint too, and that the link the ship's arcs read
 * is on exactly when the shield stands under *any* of its three lanes.
 */

const TPB = ticksPerBeat(CFG);

beforeAll(installCanvasGlobals);

const crystal = (col: number): SpawnEntry => ({ beat: 0, col, kind: "crystal", color: "red" });

function paint(role: "p1" | "p2", ticks: number, inputs: TimedCommand[] = []): number {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? [])!, i]);
  const { ctx } = runFrames(createWorld(CFG, 1, [crystal(0)]), role, ticks, {
    onTick: (tick, w) => step(w, byTick.get(tick) ?? []),
  });
  return ctx.calls;
}

describe("a crystal on the field", () => {
  for (const role of ["p1", "p2"] as const) {
    it(`paints a whole one for ${role}, through a wall`, () => {
      expect(paint(role, TPB * 7)).toBeGreaterThan(0);
    });
  }

  it("paints the beat it is opened on and the two bodies after it", () => {
    // Entered at column 0, it stands on columns 3..5 through the fourth beat
    // with its middle on 4; the shield goes under its left lane and the cannon
    // under the middle, then the guard and the shot land on the first tick of
    // that beat, and the bolt meets the join before the body moves on
    // (`sim/test/crystal.test.ts` has the rule; this only has to paint the
    // held craft, the split and the two bodies after it).
    const at = TPB * 3 + 1;
    const inputs: TimedCommand[] = [
      { tick: at - 10, player: 2, command: { kind: "shieldCol", col: 3 } },
      { tick: at - 10, player: 1, command: { kind: "cannonCol", col: 4 } },
      { tick: at, player: 1, command: { kind: "guard" } },
      { tick: at, player: 2, command: { kind: "fire", color: "red" } },
    ];
    expect(paint("p1", TPB * 8, inputs)).toBeGreaterThan(0);
  });

  it("paints the field open while the shield stands armed under it", () => {
    const at = TPB * 3 + 1;
    const inputs: TimedCommand[] = [
      { tick: at - 10, player: 2, command: { kind: "shieldCol", col: 5 } },
      { tick: at, player: 1, command: { kind: "guard" } },
    ];
    expect(paint("p2", TPB * 4, inputs)).toBeGreaterThan(0);
  });
});

describe("the link the ship's arcs read", () => {
  it("is on under any of the three lanes and off just outside them", () => {
    // Stepped to the last tick of a beat, where the body is drawn in the lane
    // the simulation has written (`creatureLane`); a tick later it would be
    // drawn one lane back, and the link would follow it there.
    const world = createWorld(CFG, 1, [crystal(0)]);
    for (let t = 0; t < TPB * 3 - 1; t++) step(world, []);
    const body = world.creatures[0]!;
    const middle = crystalMiddleCol(body);
    world.shieldCol = middle;
    expect(claspResonanceIn(world)).toBe(1);
    world.shieldCol = body.col;
    expect(claspResonanceIn(world)).toBe(1);
    world.shieldCol = body.col + 2;
    expect(claspResonanceIn(world)).toBe(1);
    world.shieldCol = body.col + 3;
    expect(claspResonanceIn(world)).toBe(0);
  });
});
