import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import { autopilotHand } from "@neon-spore/hands";

import { createWorld, DEFAULT_CONFIG, type SimEvent, startWave, step } from "@neon-spore/sim";

/** `wave-fail.ts`'s sentinel for a wave nothing has failed, not exported past the sim. */
const NOT_FAILED = -1;

/**
 * **AUTO plays THE GORGE's wave, bodies and all, to the sack going out**
 * (`hands/boss-hands-field.ts`). The five levels outlast the wave's rocks and
 * slimes, so a hand that only fed the bubbles lost the hull on the first
 * ring; it answers what gets past the bubbles the field's way, then feeds.
 */

function played(seed: number): { heard: SimEvent[]; failed: boolean } {
  const index = WAVES.findIndex((v) => v.boss?.kind === "gorge");
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, index, buildQueue(index, world.cfg.cols), [], buildBoss(index, world.cfg.cols));
  const heard: SimEvent[] = [];
  while (world.tick < 60_000 && world.boss !== null && world.failTick === NOT_FAILED) {
    const hand = autopilotHand(world);
    step(
      world,
      (hand ? hand(world) : []).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return { heard, failed: world.failTick !== NOT_FAILED };
}

describe("THE GORGE, played by AUTO", () => {
  it.each([1, 2, 3])("clears all five levels without a breach, seed %d", (seed) => {
    const { heard, failed } = played(seed);
    expect(failed).toBe(false);
    expect(heard.filter((e) => e.type === "gorgeCleared")).toHaveLength(5);
    expect(heard.some((e) => e.type === "gorgeOut")).toBe(true);
  });
});
