import { describe, expect, it } from "bun:test";
import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, hashWorld, startWave, step } from "@neon-spore/sim";
import { wouldHear } from "../src/handle-press.js";

/**
 * `wouldHear`, on the round that cost four captures: SNAKE refuses every press
 * while its body is folded up, and a spit sent then photographs as no press.
 */
function snakeWorld() {
  const index = WAVES.findIndex((w) => w.boss?.kind === "snake");
  const cols = DEFAULT_CONFIG.cols;
  const world = createWorld(DEFAULT_CONFIG, 1, []);
  startWave(world, index, buildQueue(index, cols), buildPods(index, cols), buildBoss(index, cols));
  return world;
}

describe("wouldHear", () => {
  it("says no to a spit in the morph and yes once the body plays", () => {
    const world = snakeWorld();
    expect(wouldHear(world, 1, { kind: "snakeFire" })).toBe(false);
    let ticks = 0;
    while (!wouldHear(world, 1, { kind: "snakeFire" }) && ticks < 2000) {
      step(world, []);
      ticks++;
    }
    expect(ticks).toBeGreaterThan(0);
    expect(ticks).toBeLessThan(2000);
  });

  it("says no to the right press from the wrong seat", () => {
    const world = snakeWorld();
    while (!wouldHear(world, 2, { kind: "snakeTurn", dir: "left" })) step(world, []);
    expect(wouldHear(world, 1, { kind: "snakeTurn", dir: "left" })).toBe(false);
  });

  it("leaves the world it was asked about as it found it", () => {
    const world = snakeWorld();
    for (let i = 0; i < 500; i++) step(world, []);
    const was = hashWorld(world);
    const tick = world.tick;
    wouldHear(world, 2, { kind: "snakeTurn", dir: "left" });
    expect(hashWorld(world)).toBe(was);
    expect(world.tick).toBe(tick);
  });
});
