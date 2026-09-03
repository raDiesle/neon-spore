import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * The two bodies whose own motion is the whole of their picture: THE THROB,
 * which is answered on the beat, and THE RIND, which is an outsized slick or
 * bulb and is answered by peeling it. Neither is a boss and neither has an
 * effect of its own, so nothing but a wave carrying one ever draws them —
 * and no wave in any other test does.
 */

beforeAll(installCanvasGlobals);

function bodyFrames(queue: SpawnEntry[], role: ViewRole, ticks: number) {
  return runFrames(createWorld(CFG, 3, queue), role, ticks);
}

describe("the throb", () => {
  const TICKS = ticksPerBeat(CFG) * 14;
  const queue: SpawnEntry[] = [{ beat: 0, col: 3, kind: "throb", color: null }];

  for (const role of ROLES) {
    it(`draws the swell and the beat it is answered on for ${role}`, () => {
      const { ctx } = bodyFrames(queue, role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});

describe("the rind", () => {
  const TICKS = ticksPerBeat(CFG) * 14;
  // Both colours, because the body it wears is chosen from the colour it
  // arrives in and the two are different contours.
  const queue: SpawnEntry[] = [
    { beat: 0, col: 2, kind: "rind", color: "red" },
    { beat: 2, col: 6, kind: "rind", color: "cyan" },
  ];

  for (const role of ROLES) {
    it(`draws the outsized body and its skin for ${role}`, () => {
      const { ctx } = bodyFrames(queue, role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
