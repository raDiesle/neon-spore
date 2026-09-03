import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE QUEEN through every state she has: the tell, the colour she wears, and
 * the beat she is left standing with no petals at all. Left alone the fight
 * would spend twelve beats in the one state that draws itself.
 */

beforeAll(installCanvasGlobals);

function queenFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  // By name, never by position: there is more than one boss wave now, and
  // `WAVES.length - 1` quietly became a different fight the day one was added.
  const index = waveWith("queen");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  return runFrames(world, role, ticks, {
    onTick: (tick, w) => {
      step(w, []);
      if (tick === tpb * 2) {
        if (w.boss?.kind === "queen") {
          w.boss.tellColor = "red";
          w.boss.openBeat = w.beat + 2;
        }
      }
      if (tick === tpb * 6) {
        const queen = w.creatures.find((c) => c.kind === "queen");
        if (queen) queen.color = "red";
      }
      if (tick === tpb * 10) {
        const queen = w.creatures.find((c) => c.kind === "queen");
        if (queen) queen.petals = 0;
      }
    },
  });
}

describe("the queen", () => {
  for (const role of ROLES) {
    it(`draws every state for ${role} without the canvas refusing a value`, () => {
      const { ctx } = queenFrames(role, ticksPerBeat(CFG) * 12);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
