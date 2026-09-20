import { describe, expect, it } from "bun:test";
import { beatSeconds, DEFAULT_CONFIG } from "../src/config.js";
import { step } from "../src/step.js";
import { clearHolds, restSeconds } from "../src/wave-end.js";
import { startWave } from "../src/wave-start.js";
import { createWorld } from "../src/world.js";

/**
 * The rest after a cleared wave, as the two questions the screen over it asks:
 * whether it is up, and how far into it we are (`docs/spec/between-waves.md`).
 *
 * The clock is derived rather than remembered, so what has to hold is that it
 * starts at nothing, ends on the length the config names, and is never outside
 * that — a screen reading a second past the end is one still standing when the
 * next wave's guide arrives.
 */

const CFG = DEFAULT_CONFIG;
const TOTAL = CFG.waveRestBeats * beatSeconds(CFG);

function toRest() {
  const world = createWorld(CFG, 3);
  startWave(world, 4, [], [], null, false, 0);
  expect(clearHolds(world)).toBe(false);
  expect(restSeconds(world)).toBe(0);
  while (!clearHolds(world)) step(world, []);
  return world;
}

describe("the rest after a cleared wave", () => {
  it("holds for exactly the beats the config names, and the clock runs with it", () => {
    const world = toRest();
    expect(restSeconds(world)).toBe(0);
    const at = world.tick;
    let last = 0;
    while (clearHolds(world)) {
      const now = restSeconds(world);
      expect(now).toBeGreaterThanOrEqual(last);
      expect(now).toBeLessThanOrEqual(TOTAL);
      last = now;
      step(world, []);
    }
    expect((world.tick - at) / CFG.tickHz).toBeCloseTo(TOTAL, 5);
    // The last tick of the rest is one tick short of the whole of it.
    expect(last).toBeCloseTo(TOTAL - 1 / CFG.tickHz, 5);
  });

  it("is over the moment the next wave is asked for", () => {
    const world = toRest();
    while (clearHolds(world)) step(world, []);
    expect(world.restBeat).toBe(-1);
    expect(world.events.some((e) => e.type === "needWave")).toBe(true);
    expect(restSeconds(world)).toBe(0);
  });
});
