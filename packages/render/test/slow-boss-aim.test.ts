import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  oculusBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { oculusCentre, oculusRadius } from "../src/oculus-shape.js";
import { bossAim } from "../src/slow-boss-aim.js";
import { aim } from "../src/slow-intake-aim.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLOW's light stands round the boss that opened it** (`slow-boss-aim.ts`):
 * PRISM splits a point as wide as it is far from the aim, so a boss aimed at
 * the cannon's column is the thing split widest. A boss with a row is aimed
 * at its own body; one without falls through to the cannon, as before.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");

/** THE OCULUS stood and its first pair lit, the step a window opens on. */
function lens(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * (CFG.oculusStillBeats + 1); i++) step(world, []);
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  return world;
}

describe("THE SLOW's aim at a boss", () => {
  it("stands on THE OCULUS's lens, as wide as its rim, rather than on the cannon", () => {
    const world = lens();
    const at = aim(world, L, world.beat, 0);
    const mid = oculusCentre(L, CFG);
    expect(at).toEqual({ x: mid.x, y: mid.y, r: oculusRadius(L).rim, ax: mid.x, ay: mid.y });
    expect(at.y).toBeLessThan(L.hullY - 2 * L.tile);
  });

  it("has no row for a field with no boss, which still aims at the cannon's column", () => {
    const world = createWorld(CFG, 5);
    expect(bossAim(world, L)).toBeNull();
    expect(aim(world, L, world.beat, 0).y).toBe(L.hullY);
  });
});
