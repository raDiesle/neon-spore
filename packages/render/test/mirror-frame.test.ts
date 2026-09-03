import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE MIRROR, over a whole round: it performs, the pair answers one step
 * right and the next one wrong, and both verdicts are drawn — the correct
 * one scars the mirror's own hull, the wrong one throws a rock at the ship's
 * and tips the entire frame upside down over itself.
 */

beforeAll(installCanvasGlobals);

function mirrorFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 5);
  const index = waveWith("mirror");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));

  const tpb = ticksPerBeat(CFG);
  return runFrames(world, role, ticks, {
    onTick: (tick, w) => {
      const listening = w.boss?.kind === "mirror" && w.boss.phase === "listen";
      // One right, then one wrong: the first round is FIRE RED then SHIELD.
      if (listening && tick % tpb === 1) {
        step(w, [{ tick, player: 2, command: { kind: "fire", color: "red" } }]);
      } else if (listening && tick % tpb === 40) {
        step(w, [{ tick, player: 1, command: { kind: "intake" } }]);
      } else {
        step(w, []);
      }
    },
  });
}

describe("the mirror", () => {
  for (const role of ROLES) {
    it(`draws its ship, its sequence and both verdicts for ${role}`, () => {
      const { ctx, world } = mirrorFrames(role, ticksPerBeat(CFG) * 20);
      expect(ctx.calls).toBeGreaterThan(1000);
      // It really got as far as being judged, or the frames prove nothing
      // about the parts of the picture that only exist after a verdict.
      const boss = world.boss;
      expect(boss?.kind === "mirror" && boss.verdict !== 0).toBe(true);
    });
  }
});
