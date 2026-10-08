import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { seamBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE SEAM to the end** (`hands/boss-hands-seam.ts`): every lit
 * point and rock shot in its colour up its own column, the glow shot out,
 * every throw of grit taken on the shield — with nothing missed and the hull
 * never struck.
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

describe.each(CHARGES)("AUTO on THE SEAM, %s", (_charge, cfg) => {
  test("BOTH seals all three points, takes every grit and splits the ridge", () => {
    const world: World = bossWorld("seam", cfg);
    const auto = rig(world, "both");
    let split = false;
    let quenched = false;
    let misses = 0;
    const seals: number[] = [];
    let dims = 0;
    let blocks = 0;
    let rocks = 0;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "seamSplit") split = true;
        if (e.type === "seamSeal") seals.push(e.sealed);
        if (e.type === "seamDim") dims++;
        if (e.type === "seamBlock") blocks++;
        if (e.type === "seamRockOut") rocks++;
        if (e.type === "seamQuench" && e.left === 0) quenched = true;
        if (e.type === "seamMiss") misses++;
      }
    }
    expect(split).toBe(true);
    expect(seals).toEqual([1, 2, 3]);
    expect(dims).toBe(2);
    expect(blocks).toBe(4);
    expect(rocks).toBe(2);
    expect(quenched).toBe(true);
    expect(misses).toBe(0);
    expect(world.scars).toEqual([]);
    expect(seamBoss(world)).toBeNull();
  });

  test("P1 alone never fires or moves the shield: those are the navigator's", () => {
    const world: World = bossWorld("seam", cfg);
    const auto = rig(world, "p1");
    for (let i = 0; i < 4_000 && world.boss !== null; i++) {
      const out = auto.commands(world);
      for (const c of out) {
        expect(c.player).toBe(1);
        expect(["fire", "shieldCol"]).not.toContain(c.command.kind);
      }
      step(world, out);
    }
  });
});
