import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE STARE to the end** (`hands/boss-hands-stare.ts`): every
 * charge vented before it lashes the hull, through each rise, and out — with
 * the hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE STARE, %s", (_charge, cfg) => {
  test("BOTH vents every charge and sees it rise out", () => {
    const world: World = bossWorld("stare", cfg);
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    const heard = new Map<string, number>();
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) heard.set(e.type, (heard.get(e.type) ?? 0) + 1);
    }
    expect(heard.get("stareVent")).toBe(heard.get("stareCharge"));
    expect(heard.get("stareOut")).toBe(1);
    expect(world.scars).toEqual([]);
    expect(world.boss).toBeNull();
  });
});
