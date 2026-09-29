import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { grindstoneBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE GRINDSTONE to the end** (`hands/boss-hands-grindstone.ts`):
 * each lit flat rubbed clean by its own seat, both jaws held through each
 * clamp, every lit axle shot in its colour, then both hands left off while
 * the spent axle's grind dies out (§33 row 11) — with no flat regritted, no
 * clamp sprung or slipped, no shot missed, no caliper jarred loose and the
 * hull never struck.
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

describe("AUTO on THE GRINDSTONE", () => {
  test("BOTH grinds both flats clean, holds both clamps and shoots the axle out", () => {
    const world: World = bossWorld("grindstone");
    const auto = rig(world, "both");
    let free = false;
    let wrong = 0;
    const clears: string[] = [];
    const hits: number[] = [];
    let clamps = 0;
    let fade = 0;
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "grindstoneFree") free = true;
        if (e.type === "grindstoneClear") clears.push(`${e.side}:${e.passes}`);
        if (e.type === "grindstoneHit") hits.push(e.hits);
        if (e.type === "grindstoneClamp") clamps++;
        if (e.type === "grindstoneFade") fade++;
        if (
          [
            "grindstoneRegrit",
            "grindstoneLoose",
            "grindstoneSlip",
            "grindstoneMiss",
            "grindstoneJar",
          ].includes(e.type)
        )
          wrong++;
      }
    }
    expect(free).toBe(true);
    expect(clears).toEqual(["0:1", "0:2", "1:1", "1:2"]);
    expect(clamps).toBe(2);
    expect(hits).toEqual([1, 2, 3]);
    expect(fade).toBe(1);
    expect(wrong).toBe(0);
    expect(world.scars).toEqual([]);
    expect(grindstoneBoss(world)).toBeNull();
  });

  test("P1 alone grinds the left flat and never touches the right flat or jaw", () => {
    const world: World = bossWorld("grindstone");
    const auto = rig(world, "p1");
    const clears: string[] = [];
    for (let i = 0; i < 4_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events)
        if (e.type === "grindstoneClear") clears.push(`${e.side}:${e.passes}`);
      if (world.boss?.kind === "grindstone") {
        expect(world.boss.rubs[1]).toBe(0);
        expect(world.boss.padsDown[1]).toBe(0);
      }
    }
    expect(clears).toEqual(["0:1", "0:2"]);
  });
});
