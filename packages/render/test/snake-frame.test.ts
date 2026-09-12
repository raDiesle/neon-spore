import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import { createWorld, snakeCrashed, startWave, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * SNAKE'S OWN PICTURE, THROUGH A CANVAS THAT REFUSES WHAT A REAL ONE REFUSES.
 *
 * A round replaces the whole stage, so none of the field's frames ever reach a
 * line of it: the field's own draw returns before it starts. That is the exact
 * shape of the gap these files exist to close — every type right, every test
 * green, and the first frame of the round throws on a colour.
 *
 * Long enough to cross the morph and the play and to have crashed, which is
 * the only way to reach the bump and the folded body (`snake-crash.ts`) and
 * the verdict drawn over them. Nothing here drives, so the body meets the
 * enemy standing in front of it and the crash picture is unavoidable — and
 * a crash is a hit, so the field holds from that tick (`sim/wave-fail.ts`)
 * and every frame after it is the hold: the bump, then the body standing
 * where it stopped under the verdict.
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
      // And it went wrong, so every line of the bump was drawn through the
      // stub as well as every line of the body.
      expect(boss?.kind === "snake" && snakeCrashed(boss)).toBe(true);
    });
  }
});
