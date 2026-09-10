import { describe, expect, test } from "bun:test";
import { lidOpenMilli, rindLayersLeft } from "@neon-spore/sim";
import { LAYER_POSES } from "../src/poses-layers.js";
import { advance } from "../src/versus-pair.js";

/**
 * `Pose.hand` — a hand kept on the world after it is built.
 *
 * The pair steps a pose with nobody pressing anything, which is right for a
 * state that happens on its own from the tick `build` handed over and wrong
 * for one that is *held*: a lid's plates part by exactly as much as a cord is
 * being pulled, so a pose with the cord already taut is an eye standing open
 * and the opening never happens on the page. `advance` now asks the pose
 * what its hand does this tick, and this proves the two poses that use it
 * reach the states they are named after through the pair's own loop —
 * `pose-kit.ts`'s `until` argument, for a state a hand makes.
 */

function findPose(name: string) {
  const pose = LAYER_POSES.find((p) => p.name === name);
  if (!pose) throw new Error(`pose not found: ${name}`);
  return pose;
}

describe("a pose with a hand on it", () => {
  test("LID · OPENING pulls the plates open, holds them, and lets them shut again", () => {
    const pose = findPose("LID · OPENING");
    let world = pose.build();
    const opens: number[] = [];
    for (let i = 0; i < 600; i++) {
      world = advance(world, () => pose.build(), pose).world;
      const lid = world.creatures.find((c) => c.kind === "lid");
      opens.push(lid ? lidOpenMilli(world.cfg, lid) : -1);
    }
    // Shut at the start and for a moment after, all the way open in the middle,
    // shut again after the hand lets go — and the widening in between is
    // gradual, not a jump.
    expect(opens.slice(0, 20).every((o) => o === 0)).toBe(true);
    expect(Math.max(...opens)).toBe(1000);
    const peak = opens.indexOf(1000);
    expect(opens.slice(peak).some((o) => o === 0)).toBe(true);
    const partWay = opens.slice(0, peak).filter((o) => o > 0 && o < 1000);
    expect(partWay.length).toBeGreaterThan(10);
  });

  test("RIND · SHEDDING takes both layers off and then the body, one shot at a time", () => {
    const pose = findPose("RIND · SHEDDING");
    let world = pose.build();
    const seen = new Set<number>();
    let sheds = 0;
    let gone = false;
    for (let i = 0; i < 900 && !gone; i++) {
      const next = advance(world, () => pose.build(), pose);
      world = next.world;
      sheds += next.events.filter((e) => e.type === "rindShed").length;
      const rind = world.creatures.find((c) => c.kind === "rind");
      if (rind) seen.add(rindLayersLeft(rind));
      else gone = true;
    }
    expect(sheds).toBe(world.cfg.rindLayers);
    expect([...seen].sort()).toEqual([0, 1, 2].slice(0, world.cfg.rindLayers + 1));
    expect(gone).toBe(true);
  });

  test("a pose without a hand is stepped as it always was", () => {
    const pose = findPose("RIND · SHEDDING");
    const bare = { ...pose, hand: undefined };
    let world = bare.build();
    for (let i = 0; i < 400; i++) world = advance(world, () => bare.build(), bare).world;
    const rind = world.creatures.find((c) => c.kind === "rind");
    expect(rind).toBeDefined();
    if (rind) expect(rindLayersLeft(rind)).toBe(world.cfg.rindLayers);
  });
});
