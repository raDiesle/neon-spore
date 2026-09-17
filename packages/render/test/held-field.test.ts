import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import {
  createWorld,
  failHolds,
  framePhase,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A hit stops the field, and the picture stops with it.
 *
 * `step` has held the world under `failHolds` since the lost screen was
 * written: nothing falls, nothing fires, nothing spawns. The *picture* went on
 * moving regardless, because the tick still counts and `drawnRow` eases a body
 * from `fromRow` to `row` across the phase of the beat — so every body
 * finished the step it was halfway through, and a rock caught in mid-fall slid
 * on down its column under a screen saying the wave was lost. The owner, 17
 * September 2026: *everything on the game area should stay at their current
 * position in the moment hull took damage, and neither disappear nor continue
 * falling.*
 *
 * The fix is one question in one place — `framePhase`, which every caller that
 * draws a world now asks instead of working the phase out from the tick. So
 * what is held here is where the bodies are *drawn*, through the same
 * `creatureCenter` the body pass calls, rather than the phase on its own:
 * the phase is the mechanism and this is the promise.
 */

beforeAll(installCanvasGlobals);

/** Wave one, played until a body takes the hull. */
function struck(): World {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  for (let t = 0; t < ticksPerBeat(CFG) * 40 && !failHolds(world); t++) step(world, []);
  expect(failHolds(world), "nothing reached the hull in forty beats").toBe(true);
  return world;
}

/** Where every body on the field is drawn, in the world's own order. */
function places(world: World): { x: number; y: number }[] {
  const l = computeLayout(VIEWPORT, CFG, "test");
  const phase = framePhase(world);
  return world.creatures.map((c) => creatureCenter(l, world, c, phase));
}

describe("a field held by a hit", () => {
  it("draws every body where it was struck, for every tick of the beat after", () => {
    // Tick by tick, and not one frame a beat later: the hull is resolved on a
    // beat, so the phase at the hit is zero and a beat after it is zero again.
    // A test that compared only those two would have passed on the drift it
    // was written for — this one did, before it was written this way.
    const world = struck();
    expect(world.creatures.length, "the field was empty when the hull went").toBeGreaterThan(0);
    const was = places(world);
    for (let t = 1; t <= ticksPerBeat(CFG); t++) {
      step(world, []);
      expect(failHolds(world), "the hold was over before the beat was").toBe(true);
      expect(places(world), `the field moved ${t} ticks after the hit`).toEqual(was);
    }
  });

  it("loses none of them", () => {
    const world = struck();
    const ids = world.creatures.map((c) => c.id);
    for (let t = 0; t < ticksPerBeat(CFG) * 2; t++) step(world, []);
    expect(world.creatures.map((c) => c.id)).toEqual(ids);
  });

  it("runs the phase on again once the wave is opened afresh", () => {
    // The hold is not a permanent stop: a retry opens the wave again and the
    // field moves. `wave-start.ts` clears `heldTick` beside `failTick`, and a
    // world that forgot to would be frozen for the rest of the run.
    const world = struck();
    const held = framePhase(world);
    world.failTick = -1;
    world.heldTick = -1;
    for (let t = 0; t < 3; t++) step(world, []);
    expect(failHolds(world)).toBe(false);
    expect(framePhase(world)).not.toBe(held);
  });
});
