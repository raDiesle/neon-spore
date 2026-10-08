import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";
import { CHARGES } from "./charges.js";

/**
 * **AUTO plays THE SPOOL to the end** (`hands/boss-hands-spool.ts`): the
 * barrel steered through its zones and every leg of the line, to the drift
 * and out — with the hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe.each(CHARGES)("AUTO on THE SPOOL, %s", (_charge, cfg) => {
  test("BOTH winds THE SPOOL through every leg and lets it out", () => {
    const world: World = bossWorld("spool", cfg);
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
    expect(heard.get("spoolLeg")).toBe(3);
    expect(heard.get("spoolOut")).toBe(1);
    expect(world.scars).toEqual([]);
    expect(world.boss).toBeNull();
  });
});
