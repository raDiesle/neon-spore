import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, type World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";
import { CFG, ROLES, runFrames, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLEET's wreck, the whole frame**: no screen says PULL under the
 * navigator's knob. It once said it twice, a few pixels apart, from two
 * places drawing under the same knob (`docs/queue.md`, 10 October 2026);
 * `fleet-grip.test.ts` asks the grip alone, and this asks everything a frame
 * draws, so a word put back by any other pass is caught here.
 */

beforeAll(installCanvasGlobals);

/** The fleet's wave with its first ship holed and the round in the wreck. */
function wrecked(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const b = world.boss;
  if (b?.kind !== "fleet") throw new Error("the fleet's wave installed no fleet");
  const ship = b.ships[0];
  if (!ship) throw new Error("the fleet stood up with no ships");
  Object.assign(b, {
    phase: "wreck",
    phaseBeat: world.beat,
    holed: 0,
    holeCol: ship.col,
    holeRow: ship.row,
  });
  return world;
}

/** Every word one role's frames filled, held in the wreck for a beat's worth of frames. */
function words(role: ViewRole): string[] {
  const said: string[] = [];
  runFrames(wrecked(), role, 24, {
    every: 6,
    onTick: () => {},
    onCanvas: (ctx) => {
      ctx.texts = [];
    },
    onDrawn: (ctx) => {
      said.push(...(ctx.texts ?? []).map((t) => t.text));
      ctx.texts = [];
    },
  });
  return said;
}

describe("THE FLEET's wreck, drawn whole", () => {
  it.each(ROLES)("says no PULL on the %s screen", (role) => {
    expect(words(role).filter((w) => w === "PULL")).toEqual([]);
  });

  it("does collect the words a frame says: the pilot's HOLD is among them", () => {
    expect(words("p1")).toContain("HOLD");
  });
});
