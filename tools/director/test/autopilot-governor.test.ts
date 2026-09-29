import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { governorBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE GOVERNOR to the end** (`hands/boss-hands-governor.ts`):
 * both runs tapped on the lit mark with the other seat's chord planted, both
 * retaps made, and every lit hub shot in its colour. No tap skids, no chord
 * slips, no step runs out and the hull is never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

function rig(world: World, mode: "both" | "p1") {
  const l = computeLayout(VIEWPORT, world.cfg, "test");
  const field = (seat: 1 | 2) =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode(mode);
  return auto;
}

const WRONG = ["governorSkid", "governorSlip", "governorSway", "governorDim", "governorMiss"];

describe("AUTO on THE GOVERNOR", () => {
  test("BOTH taps both runs, makes both retaps and shoots the hub out", () => {
    const world: World = bossWorld("governor");
    const auto = rig(world, "both");
    const ticks: [number, number][] = [];
    const plants: number[] = [];
    const retaps: number[] = [];
    const hits: number[] = [];
    let out = false;
    const wrong: string[] = [];
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "governorTick") ticks.push([e.side, e.taps]);
        if (e.type === "governorPlant") plants.push(e.side);
        if (e.type === "governorRetap") retaps.push(e.side);
        if (e.type === "governorHit") hits.push(e.hits);
        if (e.type === "governorOut") out = true;
        if (WRONG.includes(e.type)) wrong.push(e.type);
      }
    }
    expect(ticks).toEqual([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 1],
      [1, 2],
      [1, 3],
    ]);
    // The navigator brakes the pilot's run and the pilot the navigator's.
    expect(plants).toEqual([1, 0]);
    expect(retaps).toEqual([0, 1]);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(governorBoss(world)).toBeNull();
  });

  test("P1 alone lands the pilot's first tap, the navigator's brake left to the person", () => {
    const world: World = bossWorld("governor");
    const auto = rig(world, "p1");
    const ticks: number[] = [];
    for (let i = 0; i < 4_000 && ticks.length === 0; i++) {
      const sent = auto.commands(world);
      for (const c of sent) expect(c.player).toBe(1);
      step(world, sent);
      for (const e of world.events) if (e.type === "governorTick") ticks.push(e.side);
    }
    expect(ticks).toEqual([0]);
  });
});
