import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE HIVE to the end** (`hands/boss-hand-hive.ts`): every
 * breach sealed in its colour, every clenched underside hauled back, and
 * every spill shot before it reaches the hull — the last of them after its
 * breach is sealed, which is the field's to answer. Until 8 October 2026
 * the hand stood idle with a spill still falling, and the hull took it.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE HIVE, %s", (_charge, cfg) => {
  test("BOTH seals every breach and answers every spill", () => {
    const world: World = bossWorld("hive", cfg);
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
    expect(heard.get("hiveSeal")).toBe(heard.get("hiveOpen"));
    expect(heard.get("hiveOut")).toBe(1);
    expect(world.scars).toEqual([]);
    expect(world.boss).toBeNull();
  });
});
