import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { halterBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE HALTER to the end** (`hands/boss-hands-halter.ts`): each
 * segment cracked with one seat's chord down and the other sending nothing,
 * both guards made, every bared centre shot in its colour — with no rester
 * startled, no chord slipped, no window run out and the hull never struck.
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

describe("AUTO on THE HALTER", () => {
  test("BOTH cracks both segments, makes both guards and shoots the centre out", () => {
    const world: World = bossWorld("halter");
    const auto = rig(world, "both");
    let split = false;
    const cracks: number[] = [];
    const hits: number[] = [];
    let guards = 0;
    const wrong: string[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "halterSplit") split = true;
        if (e.type === "halterCrack") cracks.push(e.side);
        if (e.type === "halterHit") hits.push(e.hits);
        if (e.type === "halterGuard") guards++;
        if (["halterStartle", "halterSlip", "halterShut", "halterMiss"].includes(e.type))
          wrong.push(e.type);
      }
    }
    expect(split).toBe(true);
    expect(cracks).toEqual([0, 1]);
    expect(guards).toBe(2);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(halterBoss(world)).toBeNull();
  });

  test("P1 alone grips the left segment, and the silent navigator's rest cracks it", () => {
    const world: World = bossWorld("halter");
    const auto = rig(world, "p1");
    const cracks: number[] = [];
    for (let i = 0; i < 4_000 && cracks.length === 0; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) if (e.type === "halterCrack") cracks.push(e.side);
      const s = halterBoss(world);
      if (s !== null) expect(s.grips[1]).toBe(0);
    }
    expect(cracks).toEqual([0]);
  });
});
