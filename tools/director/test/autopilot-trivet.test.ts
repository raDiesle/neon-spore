import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, trivetBoss, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE TRIVET to the end** (`hands/boss-hands-trivet.ts`): every
 * lit foot's chord held down by its own seat until it plants, both chords held
 * under the hub together, every lit hub shot in its colour — with no chord
 * slipped or sprung, the hub never rocked up, and the hull never struck.
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

describe("AUTO on THE TRIVET", () => {
  test("BOTH plants all four feet, holds both braces and shoots the hub out", () => {
    const world: World = bossWorld("trivet");
    const auto = rig(world, "both");
    let collapsed = false;
    let wrong = 0;
    const plants: string[] = [];
    const hits: number[] = [];
    let braces = 0;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "trivetCollapse") collapsed = true;
        if (e.type === "trivetPlant") plants.push(`${e.side}:${e.level}`);
        if (e.type === "trivetHit") hits.push(e.hits);
        if (e.type === "trivetBrace") braces++;
        if (["trivetSlip", "trivetSpring", "trivetRock", "trivetMiss"].includes(e.type)) wrong++;
      }
    }
    expect(collapsed).toBe(true);
    expect(plants).toEqual(["0:1", "0:2", "1:1", "1:2"]);
    expect(braces).toBe(2);
    expect(hits).toEqual([1, 2, 3, 4]);
    expect(wrong).toBe(0);
    expect(world.scars).toEqual([]);
    expect(trivetBoss(world)).toBeNull();
  });

  test("P1 alone plants the front foot and never touches the rear", () => {
    const world: World = bossWorld("trivet");
    const auto = rig(world, "p1");
    const plants: string[] = [];
    for (let i = 0; i < 4_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events)
        if (e.type === "trivetPlant") plants.push(`${e.side}:${e.level}`);
      if (world.boss?.kind === "trivet") expect(world.boss.padsDown[1]).toBe(0);
    }
    expect(plants).toEqual(["0:1", "0:2"]);
  });
});
