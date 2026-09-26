import { describe, expect, test } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { oculusBoss, step, type World } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays THE OCULUS to the end** (`hands/boss-hands-oculus.ts`): every
 * pair held shut by both seats inside its window, every reseal held, every
 * lit core shot in its colour — with no pair slipped or sprung, the socket
 * never swallowed, and the hull never struck.
 */

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };

describe("AUTO on THE OCULUS", () => {
  test("BOTH shuts every pair, holds every reseal and shoots the core out", () => {
    const world: World = bossWorld("oculus");
    const l = computeLayout(VIEWPORT, world.cfg, "test");
    const field = (seat: 1 | 2) =>
      stageField(world, "test", controlSet("default"), world.cfg, seat, null);
    const auto = stageAutopilot({ layout: () => l, field });
    auto.setMode("both");
    let shattered = false;
    let wrong = 0;
    const hits: number[] = [];
    for (let i = 0; i < 30_000 && world.boss !== null; i++) {
      step(world, auto.commands(world));
      for (const e of world.events) {
        if (e.type === "oculusShatter") shattered = true;
        if (e.type === "oculusHit") hits.push(e.hits);
        const miss = ["oculusSlip", "oculusSpring", "oculusSwallow", "oculusMiss"];
        if (miss.includes(e.type)) wrong++;
      }
    }
    expect(shattered).toBe(true);
    expect(hits).toEqual([1, 2, 3]);
    expect(wrong).toBe(0);
    expect(oculusBoss(world)).toBeNull();
  });
});
