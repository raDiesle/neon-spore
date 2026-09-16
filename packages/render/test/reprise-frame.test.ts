import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE REPRISE, drawn — the one boss whose claim on this file is that it draws
 * **nothing**.
 *
 * A body the mechanism has sent again is on the field like any other: it
 * falls, the shield turns it, a bolt takes it, and it costs the hull if it
 * lands. What neither screen may do is put a mark where it is
 * (`sim/reprise.ts`). So what is worth holding here is a negative, and it is
 * one an eye cannot check: an unseen slick drawn in its own dark grey against
 * a dark field would look very much like nothing at all. The frame is
 * therefore measured — the same tick of the same wave, drawn once with the
 * echo standing on the field and once with it lifted off, and the two have to
 * cost the canvas exactly the same.
 *
 * And the ordinary half, for the reason every `*-frame.test.ts` here exists:
 * the whole wave through a canvas that refuses what a real one refuses, on
 * every seat.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The shipped wave, stepped to a beat its first echo is halfway through. */
function reprised(beats: number): World {
  const at = waveWith("reprise");
  const world = createWorld(CFG, 7, buildQueue(at, CFG.cols));
  startWave(world, at, buildQueue(at, CFG.cols), [], buildBoss(at, CFG.cols));
  for (let t = 0; t < TPB * beats; t++) step(world, []);
  return world;
}

/** One frame of a world already stepped, with nothing stepped further. */
function oneFrame(world: World, role: (typeof ROLES)[number]): number {
  return runFrames(world, role, 1, { onTick: () => {} }).ctx.calls;
}

describe("a frame of THE REPRISE", () => {
  for (const role of ROLES) {
    it(`draws the wave and its echo for ${role} without the canvas refusing a value`, () => {
      const at = waveWith("reprise");
      const world = createWorld(CFG, 7, buildQueue(at, CFG.cols));
      startWave(world, at, buildQueue(at, CFG.cols), [], buildBoss(at, CFG.cols));
      const { ctx, world: after } = runFrames(world, role, TPB * 18);
      expect(
        after.creatures.some((c) => c.unseen === true),
        "no echo was on the field",
      ).toBe(true);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("costs the canvas nothing for a body the pair cannot see", () => {
    for (const role of ROLES) {
      const world = reprised(16);
      const unseen = world.creatures.filter((c) => c.unseen === true);
      expect(unseen.length, `${role}: the echo had nothing standing`).toBeGreaterThan(0);
      const drawn = oneFrame(world, role);
      // The same tick with the echo lifted off the field. Nothing else about
      // the world moves, so a single mark drawn for one of those bodies would
      // show up here as a difference of calls.
      world.creatures = world.creatures.filter((c) => c.unseen !== true);
      expect(oneFrame(world, role), role).toBe(drawn);
    }
  });
});
