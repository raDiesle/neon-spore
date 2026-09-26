import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, viseBoss, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE VISE to the end** (`hands/boss-hands-vise.ts`): every lit
 * lobe pinched shut by its own seat until its seam cracks, both lobes held off
 * the kernel together, every bared kernel shot in its colour — with no pinch
 * slipped or sprung, the kernel never covered again, and the hull never
 * struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe("AUTO on THE VISE", () => {
  test("BOTH cracks all four seams, holds both braces and shoots the kernel out", () => {
    const world: World = bossWorld("vise");
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    let split = false;
    let wrong = 0;
    const cracks: string[] = [];
    const hits: number[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "viseSplit") split = true;
        if (e.type === "viseCrack") cracks.push(`${e.side}:${e.cracks}`);
        if (e.type === "viseHit") hits.push(e.hits);
        if (["viseSlip", "viseSpring", "viseCover", "viseMiss"].includes(e.type)) wrong++;
      }
    }
    expect(split).toBe(true);
    expect(cracks).toEqual(["0:1", "0:2", "1:1", "1:2"]);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toBe(0);
    expect(world.scars).toEqual([]);
    expect(viseBoss(world)).toBeNull();
  });

  test("P1 alone cracks the left lobe and never touches the right", () => {
    const world: World = bossWorld("vise");
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("p1");
    const cracks: string[] = [];
    for (let i = 0; i < 4_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events)
        if (e.type === "viseCrack") cracks.push(`${e.side}:${e.cracks}`);
    }
    expect(cracks).toEqual(["0:1", "0:2"]);
  });
});
