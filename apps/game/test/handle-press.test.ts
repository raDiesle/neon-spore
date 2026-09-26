import { describe, expect, it } from "bun:test";
import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  gimbalBoss,
  hashWorld,
  startWave,
  step,
} from "@neon-spore/sim";
import { wouldHear } from "../src/handle-press.js";

/**
 * `wouldHear`, on the round that cost four captures: SNAKE refuses every press
 * while its body is folded up, and a spit sent then photographs as no press.
 */
function bossWorld(kind: string) {
  const index = WAVES.findIndex((w) => w.boss?.kind === kind);
  const cols = DEFAULT_CONFIG.cols;
  const world = createWorld(DEFAULT_CONFIG, 1, []);
  startWave(world, index, buildQueue(index, cols), buildPods(index, cols), buildBoss(index, cols));
  return world;
}

const snakeWorld = () => bossWorld("snake");

/** A thumb on THE GIMBAL's outer ring: `at` a bearing, `-1` the grab. */
const ring = (on: boolean, at: number): Command => ({
  kind: "drag",
  target: "gimbalOuter",
  on,
  fromMilli: at,
  fromYMilli: 0,
});

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

  /**
   * A hold is a grab, a carry and a lift on one tick. Asked alone, the lift
   * finds no hand on the ring and reads unheard; asked behind the two sent
   * ahead of it, it is the hand coming off a ring it was on.
   */
  it("asks a press behind the ones already queued on its tick", () => {
    const world = bossWorld("gimbal");
    while (gimbalBoss(world)?.phase !== "turn") step(world, []);
    const lift = ring(false, 0);
    expect(wouldHear(world, 1, lift)).toBe(false);
    const ahead = [
      { player: 1 as const, command: ring(true, -1) },
      { player: 1 as const, command: ring(true, 200) },
    ];
    expect(wouldHear(world, 1, lift, ahead)).toBe(true);
  });
});
