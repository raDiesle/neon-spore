import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { flueBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE FLUE to the end** (`hands/boss-hands-flue.ts`): every
 * level's ember met over the cannon in its own weapon and colour, the first
 * shot each time — with no shot spent, the cannon never slid and the hull
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

describe("AUTO on THE FLUE", () => {
  test("BOTH meets every level's ember with its first shot and plays the flue out", () => {
    const world: World = bossWorld("flue");
    const auto = rig(world, "both");
    const levels = flueBoss(world)?.levels.length ?? 0;
    const hits: number[] = [];
    const misses: string[] = [];
    let out = false;
    for (let i = 0; i < 40_000 && world.boss !== null; i++) {
      const sent = auto.commands(world);
      for (const c of sent) expect(c.command.kind).not.toBe("cannonCol");
      step(world, sent);
      for (const e of world.events) {
        if (e.type === "flueHit") hits.push(e.hits);
        if (e.type === "flueMiss") misses.push(e.why);
        if (e.type === "flueOut") out = true;
      }
    }
    expect(levels).toBeGreaterThan(0);
    expect(hits).toEqual(Array.from({ length: levels }, (_, i) => i + 1));
    expect(misses).toEqual([]);
    expect(world.scars).toEqual([]);
    expect(out).toBe(true);
    expect(flueBoss(world)).toBeNull();
  });

  test("P1 alone sends nothing: the pilot only calls the shot, and the trigger is the navigator's", () => {
    const world: World = bossWorld("flue");
    const auto = rig(world, "p1");
    for (let i = 0; i < 2_000; i++) {
      const sent = auto.commands(world);
      expect(sent).toEqual([]);
      step(world, sent);
    }
    expect(flueBoss(world)?.hits).toBe(0);
  });
});
