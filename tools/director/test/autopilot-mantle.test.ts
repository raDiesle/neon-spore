import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { MANTLE_PHASES, mantleBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE MANTLE to the end** (`hands/boss-hands-mantle.ts`): the
 * handles pulled together four times, each at its own threshold, the spark
 * shot whenever one leaks, and the core tapped out seat by seat until it goes
 * dark and the shell is gone — with the hull never struck by an unshot spark.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe("AUTO on THE MANTLE", () => {
  test("BOTH shears every pair and taps the core dark", () => {
    const world: World = bossWorld("mantle");
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    let sheared = 0;
    let dark = false;
    let struck = 0;
    const entered = new Set<string>();
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      const phase = mantleBoss(world)?.phase;
      if (phase !== undefined) entered.add(phase);
      for (const e of world.events) {
        if (e.type === "mantleShear") sheared++;
        if (e.type === "mantleDark") dark = true;
        if (e.type === "mantleSparkHit") struck++;
      }
    }
    expect(sheared).toBe(4);
    expect(dark).toBe(true);
    expect(struck).toBe(0);
    expect(mantleBoss(world)).toBeNull();
    // Every phase the table names is one the step enters: "spark" was listed
    // and never set, so a reader switching on it was dead code (`mantle.ts`).
    expect([...MANTLE_PHASES].filter((p) => !entered.has(p))).toEqual([]);
  });
});
