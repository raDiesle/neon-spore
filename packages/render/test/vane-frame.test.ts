import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  remembered,
  runFrames,
  thirdOf,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE VANE over a full cycle and a half: the arm at both ends of its travel,
 * mid-sweep in both directions, the housing split in both colours and shut, and
 * the flick it leaves when it throws an arrival. Its own wave carries the
 * arrivals, because a mechanism turning over an empty field draws none of them.
 */

beforeAll(installCanvasGlobals);

function vaneFrames(
  role: ViewRole,
  ticks: number,
  sampling: { every?: number; phase?: number } = {},
) {
  const world = createWorld(CFG, 3);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return runFrames(world, role, ticks, sampling);
}

describe("the vane", () => {
  // Each seat draws a third of the ticks (`thirdOf`), and the rig's play is
  // kept for the case under the loop that reads what it reached.
  const played = remembered((role) =>
    vaneFrames(role, ticksPerBeat(CFG) * 18, thirdOf(4, ROLES.indexOf(role))),
  );

  for (const role of ROLES) {
    it(`draws the arm, the bearing and a split housing for ${role}`, () => {
      expect(played(role).ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really threw something, or the flick was never drawn", () => {
    const { world } = played("test");
    const boss = world.boss;
    expect(boss?.kind === "vane" && boss.throwBeat !== -1).toBe(true);
  });
});
