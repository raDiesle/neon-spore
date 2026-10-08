import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE LEDGER to the end** (`hands/boss-hands-clocks.ts`): every
 * bead and socket answered, to the last entry and the tear — with the hull
 * never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE LEDGER, %s", (_charge, cfg) => {
  test("BOTH keeps the ledger to its last entry and tears it", () => {
    const world: World = bossWorld("ledger", cfg);
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
    expect(heard.get("ledgerLast")).toBe(1);
    expect(heard.get("ledgerTear")).toBe(1);
    expect(world.boss).toBeNull();
    expect(heard.get("breach")).toBeUndefined();
    expect(world.scars).toEqual([]);
  });
});
