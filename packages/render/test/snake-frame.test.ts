import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import { createWorld, startWave, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * SNAKE'S OWN PICTURE, THROUGH A CANVAS THAT REFUSES WHAT A REAL ONE REFUSES.
 *
 * A round replaces the whole stage, so none of the field's frames ever reach a
 * line of it: the field's own draw returns before it starts. That is the exact
 * shape of the gap these files exist to close — every type right, every test
 * green, and the first frame of the round throws on a colour.
 *
 * Long enough to cross all three phases and to have crashed at least once,
 * which is the only frame where the body is drawn from a standing start while
 * a scar is on a hull nobody can see.
 */

beforeAll(installCanvasGlobals);

describe("SNAKE draws on all three screens", () => {
  const index = waveWith("snake");

  function snakeFrames(role: ViewRole, ticks: number) {
    const world = createWorld(CFG, 7, []);
    startWave(world, index, [], [], buildBoss(index, CFG.cols));
    return runFrames(world, role, ticks);
  }

  for (const role of ROLES) {
    it(`draws the morph, the arena and the body on ${role}`, () => {
      const { world, ctx } = snakeFrames(role, ticksPerBeat(CFG) * 30);
      // The stub throws on a value a real canvas would refuse, so reaching
      // here at all is most of the assertion; the count is what tells a drawn
      // round from a frame that returned early.
      expect(ctx.calls).toBeGreaterThan(500);
      // It got past the fold and the body has been going long enough to have
      // met a wall, which is the frame the verdict and the scar hang off.
      const boss = world.boss;
      expect(boss?.kind === "snake" && boss.phase !== "morph").toBe(true);
    });
  }
});
